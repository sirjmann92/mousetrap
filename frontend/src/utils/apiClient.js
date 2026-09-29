/**
 * The single place the app talks to the MouseTrap API.
 *
 * The status line is the only success/failure discriminant. A non-2xx response,
 * an unreachable server and an unreadable body all reach the caller as one
 * thrown {@link ApiError}, so a call site has one failure shape rather than
 * three.
 *
 * A failure body is RFC 9457 problem details. Branch on `error.type`, which
 * identifies the problem type, and read the data that type defines from
 * `error.extensions`. `error.detail` and `error.message` are for display only:
 * RFC 9457 §3.1.4 has consumers read extension members rather than parse the
 * prose, and every fact the prose states is also an extension member.
 */

const PROBLEM_MEDIA_TYPE = 'application/problem+json';

/** The members RFC 9457 defines. Anything else in a problem body is an extension. */
const PROBLEM_MEMBERS = ['detail', 'status', 'title', 'type'];

/** Shown when the request never reached the server. */
const UNREACHABLE = 'Could not reach the MouseTrap server.';

/**
 * A failed API call: a non-2xx response, an unreadable body, or an unreachable
 * server.
 *
 * `type` and `extensions` come from the problem body and are the typed half of
 * the failure. `detail` is the reason the server stated, and is null when it
 * stated none, which is the only thing that distinguishes a body we could read
 * from one we could not.
 */
export class ApiError extends Error {
  /**
   * @param {string} message Display text. Never parse it.
   * @param {{
   *   cause?: unknown,
   *   detail?: string | null,
   *   extensions?: Record<string, unknown>,
   *   status?: number | null,
   *   type?: string | null,
   * }} [failure]
   */
  constructor(message, failure = {}) {
    super(message);
    this.name = 'ApiError';
    this.cause = failure.cause;
    this.detail = failure.detail ?? null;
    this.extensions = failure.extensions ?? {};
    this.status = failure.status ?? null;
    this.type = failure.type ?? null;
  }
}

/**
 * Describe a response that arrived but could not be used.
 * @param {number} status
 * @returns {string}
 */
function unexpectedResponse(status) {
  return `The server returned an unexpected response (HTTP ${status}).`;
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isFilledString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parse a JSON document, reporting an unparsable one as undefined so a literal
 * `null` body stays distinguishable from one that is not JSON at all.
 * @param {string} text
 * @returns {unknown}
 */
function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Decide whether a body is the contract's, before anything trusts its members.
 *
 * The wrapper does not control what it is handed, so it validates the whole
 * member set rather than the parts it happens to read: a body missing `title`
 * is not a contract body even though nothing here displays `title`. Partial
 * trust is what leads a client to compensate for a shape it should reject.
 *
 * @param {Response} response
 * @param {unknown} body
 * @returns {body is {detail: string, status: number, title: string, type: string}}
 */
function isProblemBody(response, body) {
  return (
    (response.headers.get('content-type') ?? '').startsWith(PROBLEM_MEDIA_TYPE) &&
    isPlainObject(body) &&
    typeof body.status === 'number' &&
    isFilledString(body.type) &&
    isFilledString(body.title) &&
    isFilledString(body.detail)
  );
}

/**
 * Split the extension members out of a problem body.
 * @param {Record<string, unknown>} body
 * @returns {Record<string, unknown>}
 */
function extensionsOf(body) {
  return Object.fromEntries(
    Object.entries(body).filter(([member]) => !PROBLEM_MEMBERS.includes(member)),
  );
}

/**
 * Build the error for a non-2xx response.
 * @param {Response} response
 * @param {string} text
 * @returns {ApiError}
 */
function failureFrom(response, text) {
  const body = parseJson(text);
  if (!isProblemBody(response, body)) {
    return new ApiError(unexpectedResponse(response.status), { status: response.status });
  }
  return new ApiError(body.detail, {
    detail: body.detail,
    extensions: extensionsOf(body),
    status: response.status,
    type: body.type,
  });
}

// --- Scaffolding, for the routes still answering 200 with an envelope. ---
// A route converted to the contract drops out of this path. The three
// definitions below go with the last route that has not been.

/** Spellings of "why it failed" used by the routes still on the envelope. */
const ENVELOPE_REASON_KEYS = ['error', 'message'];

/** Shown when an envelope claims failure and names no reason. */
const NO_REASON = 'The server reported a failure without saying why.';

/**
 * @param {unknown} body
 * @returns {body is Record<string, unknown>}
 */
function isEnvelopeFailure(body) {
  return isPlainObject(body) && body.success === false;
}

/**
 * Convert an envelope failure into the error the status line will carry once
 * its route is converted.
 *
 * The reason keys are optional, so reading one is a partial operation and the
 * fallback below is what makes it total. The four notification test routes
 * answer `{"success": false}` and nothing else, so that fallback is reached.
 *
 * `extensions` stays empty by construction: RFC 9457 §3.2 scopes extension
 * members to the problem type that defines them, and an envelope has no type.
 *
 * @param {Response} response
 * @param {Record<string, unknown>} body
 * @returns {ApiError}
 */
function envelopeFailure(response, body) {
  const reason = ENVELOPE_REASON_KEYS.map((key) => body[key]).find(isFilledString) ?? null;
  return new ApiError(reason ?? NO_REASON, { detail: reason, status: response.status });
}

// --- End of scaffolding. ---

/**
 * Call the API and return the decoded body.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<unknown>} The decoded body, or null when there is none.
 * @throws {ApiError} On an unreachable server, a non-2xx status, a body that
 *   cannot be read, or an envelope reporting failure.
 */
async function apiRequest(url, options = {}) {
  let response;
  try {
    response = await globalThis.fetch(url, options);
  } catch (cause) {
    throw new ApiError(UNREACHABLE, { cause });
  }

  let text;
  try {
    text = await response.text();
  } catch (cause) {
    throw new ApiError(unexpectedResponse(response.status), { cause, status: response.status });
  }

  if (!response.ok) {
    throw failureFrom(response, text);
  }

  // `Response.json()` rejects on an empty body, so the text is read first.
  if (text.trim() === '') {
    return null;
  }

  const body = parseJson(text);
  if (body === undefined) {
    throw new ApiError(unexpectedResponse(response.status), { status: response.status });
  }
  if (isEnvelopeFailure(body)) {
    throw envelopeFailure(response, body);
  }
  return body;
}

/**
 * @param {string} url
 * @param {'POST' | 'PUT'} method
 * @param {unknown} body JSON-encoded when given, omitted entirely when not.
 * @returns {Promise<unknown>}
 */
function sendJson(url, method, body) {
  if (body === undefined) {
    return apiRequest(url, { method });
  }
  return apiRequest(url, {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method,
  });
}

/**
 * @param {string} url
 * @returns {Promise<any>}
 */
export function apiGet(url) {
  return apiRequest(url);
}

/**
 * @param {string} url
 * @param {unknown} [body]
 * @returns {Promise<any>}
 */
export function apiPost(url, body) {
  return sendJson(url, 'POST', body);
}

/**
 * @param {string} url
 * @param {unknown} [body]
 * @returns {Promise<any>}
 */
export function apiPut(url, body) {
  return sendJson(url, 'PUT', body);
}

/**
 * @param {string} url
 * @returns {Promise<any>}
 */
export function apiDelete(url) {
  return apiRequest(url, { method: 'DELETE' });
}
