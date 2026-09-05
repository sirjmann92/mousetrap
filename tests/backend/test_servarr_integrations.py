"""Characterisation tests for the Prowlarr and Chaptarr integrations.

These two modules are 91.5% identical once the service name is normalised, and
neither had any direct test coverage. The tests below pin current behaviour —
including the three places the modules genuinely diverge — so that the shared
implementation they are heading towards can be shown to preserve it.

They are characterisation tests, not a specification: they were written against
the modules as they stand and assert what those modules do today.
"""

from types import TracebackType
from typing import Any, Self

import pytest

from backend import chaptarr_integration, prowlarr_integration, servarr_client

HOST = "svc.local"
PORT = 9696
API_KEY = "secret"


class _StubResponse:
    """Stub ``aiohttp`` response returning a prepared payload."""

    def __init__(self, payload: Any, status: int = 200) -> None:
        """Record the payload and status this stub replays."""
        self.status = status
        self._payload = payload

    async def json(self) -> Any:
        """Return the configured payload."""
        return self._payload

    async def text(self) -> str:
        """Return the payload rendered as text."""
        return str(self._payload)

    async def __aenter__(self) -> Self:
        """Enter the response context."""
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        """Leave the response context."""


class _StubSession:
    """Stub ``aiohttp`` session recording every request it is asked to make."""

    def __init__(self, responses: dict[str, _StubResponse]) -> None:
        """Bind one prepared response per HTTP verb."""
        self.calls: list[tuple[str, str, Any]] = []
        self._responses = responses

    def get(self, url: str, **kwargs: Any) -> _StubResponse:
        """Record and answer a GET."""
        self.calls.append(("GET", url, kwargs.get("json")))
        return self._responses["GET"]

    def put(self, url: str, **kwargs: Any) -> _StubResponse:
        """Record and answer a PUT."""
        self.calls.append(("PUT", url, kwargs.get("json")))
        return self._responses["PUT"]

    async def __aenter__(self) -> Self:
        """Enter the session context."""
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        """Leave the session context."""


def _install(
    monkeypatch: pytest.MonkeyPatch, module: Any, responses: dict[str, _StubResponse]
) -> _StubSession:
    """Point the shared client's ``aiohttp.ClientSession`` at a stub.

    The `module` argument is retained so each test still names the integration
    it exercises. The patch target is `servarr_client`, which is where the
    HTTP calls live now that Prowlarr and Chaptarr share one implementation;
    only this seam moved, and no assertion in this file changed with it.
    """
    session = _StubSession(responses)
    monkeypatch.setattr(
        servarr_client.aiohttp, "ClientSession", lambda *a, **k: session, raising=True
    )
    return session


# --- connection test: identical across both modules -------------------------


@pytest.mark.parametrize(
    ("module", "func"),
    [
        (prowlarr_integration, "test_prowlarr_connection"),
        (chaptarr_integration, "test_chaptarr_connection"),
    ],
)
async def test_connection_reports_the_indexer_count(
    monkeypatch: pytest.MonkeyPatch, module: Any, func: str
) -> None:
    """A 200 reports success and the number of indexers returned."""
    _install(monkeypatch, module, {"GET": _StubResponse([{"id": 1}, {"id": 2}])})

    result = await getattr(module, func)(HOST, PORT, API_KEY)

    assert result["success"] is True
    assert result["indexer_count"] == 2


@pytest.mark.parametrize(
    ("module", "func"),
    [
        (prowlarr_integration, "test_prowlarr_connection"),
        (chaptarr_integration, "test_chaptarr_connection"),
    ],
)
async def test_connection_reports_an_auth_failure(
    monkeypatch: pytest.MonkeyPatch, module: Any, func: str
) -> None:
    """A 401 is reported as an authentication problem rather than a generic one."""
    _install(monkeypatch, module, {"GET": _StubResponse([], status=401)})

    result = await getattr(module, func)(HOST, PORT, API_KEY)

    assert result["success"] is False
    assert "authentication" in result["message"].lower()


# --- indexer lookup: this is where the two modules diverge ------------------


async def test_prowlarr_matches_the_indexer_on_definition_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Prowlarr matches `definitionName` exactly, so casing must agree."""
    _install(
        monkeypatch,
        prowlarr_integration,
        {"GET": _StubResponse([{"id": 7, "definitionName": "MyAnonamouse", "name": "MAM"}])},
    )

    found = await prowlarr_integration.find_mam_indexer_id(HOST, PORT, API_KEY)

    assert found["success"] is True
    assert found["indexer_id"] == 7


async def test_prowlarr_does_not_match_a_differently_cased_definition_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The exact match is the behaviour, not an accident: "MyAnonaMouse" misses."""
    _install(
        monkeypatch,
        prowlarr_integration,
        {"GET": _StubResponse([{"id": 7, "definitionName": "MyAnonaMouse", "name": "MAM"}])},
    )

    found = await prowlarr_integration.find_mam_indexer_id(HOST, PORT, API_KEY)

    assert found["success"] is False
    assert "not found" in found["message"].lower()


@pytest.mark.parametrize("spelling", ["MyAnonaMouse", "myanonamouse", "MYANONAMOUSE"])
async def test_chaptarr_matches_the_indexer_on_implementation_case_insensitively(
    monkeypatch: pytest.MonkeyPatch, spelling: str
) -> None:
    """Chaptarr matches `implementation` case-insensitively, unlike Prowlarr."""
    _install(
        monkeypatch,
        chaptarr_integration,
        {"GET": _StubResponse([{"id": 9, "implementation": spelling, "name": "MAM"}])},
    )

    found = await chaptarr_integration.find_mam_indexer_id(HOST, PORT, API_KEY)

    assert found["success"] is True
    assert found["indexer_id"] == 9


async def test_chaptarr_ignores_definition_name(monkeypatch: pytest.MonkeyPatch) -> None:
    """Chaptarr reads `implementation`; a Prowlarr-shaped payload does not match."""
    _install(
        monkeypatch,
        chaptarr_integration,
        {"GET": _StubResponse([{"id": 9, "definitionName": "MyAnonamouse", "name": "MAM"}])},
    )

    found = await chaptarr_integration.find_mam_indexer_id(HOST, PORT, API_KEY)

    assert found["success"] is False


# --- update: same field name, different URL --------------------------------


@pytest.mark.parametrize(
    ("module", "func", "expects_force_save"),
    [
        (prowlarr_integration, "update_mam_id_in_prowlarr", False),
        (chaptarr_integration, "update_mam_id_in_chaptarr", True),
    ],
)
async def test_update_writes_the_mamid_field_and_puts_it_back(
    monkeypatch: pytest.MonkeyPatch, module: Any, func: str, expects_force_save: bool
) -> None:
    """Both modules write the lowercase `mamId` field; only Chaptarr forces a save.

    The `MamId` spelling in Chaptarr's module docstring is not what the code
    does — both check `field["name"] == "mamId"`.
    """
    config = {"id": 3, "fields": [{"name": "mamId", "value": "old-cookie"}]}
    session = _install(
        monkeypatch,
        module,
        {"GET": _StubResponse(config), "PUT": _StubResponse({}, status=202)},
    )

    result = await getattr(module, func)(HOST, PORT, API_KEY, 3, "new-cookie")

    assert result["success"] is True
    put_calls = [c for c in session.calls if c[0] == "PUT"]
    assert len(put_calls) == 1
    url, body = put_calls[0][1], put_calls[0][2]
    assert ("forceSave=true" in url) is expects_force_save
    assert [f for f in body["fields"] if f["name"] == "mamId"][0]["value"] == "new-cookie"
