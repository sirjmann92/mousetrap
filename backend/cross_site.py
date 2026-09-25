"""Refuse state-changing requests a browser sends on behalf of another site.

Any page a user visits can make their browser send a request to MouseTrap. The
page cannot read the reply, but a POST still runs, and with no login MouseTrap
cannot tell it from one the user made. Several handlers read a JSON body without
checking its content type, which is what lets a plain cross-site `fetch` or form
reach them without a CORS preflight.

A browser labels where a request came from; a script or command-line tool does
not, and page script cannot forge either label:

- `Sec-Fetch-Site`, sent to HTTPS and loopback addresses. Only `same-origin`
  and `none` (a typed URL or bookmark) are allowed. `same-site` is refused
  too: another app on the same host, on a different port, is same-site.
- `Origin`, sent on every cross-origin POST. Browsers send no `Sec-Fetch-Site`
  to a plain-HTTP LAN address, which is how MouseTrap is usually reached, so
  this is the check that protects the common deployment. It is compared with
  the address the request was sent to: `Host`, or `X-Forwarded-Host` from a
  reverse proxy that rewrites `Host`.

A request carrying neither is not from a browser and is allowed, so scripts and
tools calling the API keep working. Safe methods pass through untouched.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING
from urllib.parse import urlsplit

from starlette.datastructures import Headers
from starlette.responses import JSONResponse

if TYPE_CHECKING:
    from starlette.types import ASGIApp, Receive, Scope, Send

_logger: logging.Logger = logging.getLogger(__name__)

SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE"})

_ALLOWED_FETCH_SITES = frozenset({"same-origin", "none"})

REFUSED_DETAIL = (
    "Cross-site request refused. If MouseTrap is behind a reverse proxy that "
    "rewrites the Host header, have the proxy send X-Forwarded-Host."
)


def cross_site_reason(headers: Headers) -> str | None:
    """Explain why a state-changing request looks cross-site.

    Args:
        headers: The request's headers.

    Returns:
        A short reason for refusing the request, or None when it came from this
        app's own pages or from something other than a browser.
    """
    fetch_site = headers.get("sec-fetch-site")
    if fetch_site is not None:
        if fetch_site.lower() in _ALLOWED_FETCH_SITES:
            return None
        return f"Sec-Fetch-Site is {fetch_site}"

    origin = headers.get("origin")
    if origin is None:
        return None

    # `Origin: null` (sandboxed frames, file pages) and a malformed value have no
    # host, so they match nothing and are refused.
    origin_host = urlsplit(origin).netloc.lower()
    targets = {headers.get("host", "").lower()}
    forwarded_host = headers.get("x-forwarded-host")
    if forwarded_host:
        targets.add(forwarded_host.split(",")[0].strip().lower())
    targets.discard("")
    if origin_host and origin_host in targets:
        return None
    return f"Origin {origin} is not the requested host"


class CrossSiteRequestGuard:
    """ASGI middleware refusing state-changing requests sent for another site."""

    def __init__(self, app: ASGIApp) -> None:
        """Wrap the application.

        Args:
            app: The ASGI application to protect.
        """
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        """Refuse a cross-site state-changing request, and pass everything else on.

        Args:
            scope: The ASGI connection scope.
            receive: The ASGI receive channel.
            send: The ASGI send channel.
        """
        if scope["type"] == "http" and scope["method"] not in SAFE_METHODS:
            reason = cross_site_reason(Headers(scope=scope))
            if reason is not None:
                _logger.warning(
                    "[CrossSite] Refused %s %s: %s", scope["method"], scope["path"], reason
                )
                response = JSONResponse({"detail": REFUSED_DETAIL}, status_code=403)
                await response(scope, receive, send)
                return
        await self.app(scope, receive, send)
