from __future__ import annotations

import asyncio
import contextlib
import socket
import threading
import time
from dataclasses import dataclass
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.async_api import async_playwright


REPO_ROOT = Path(__file__).resolve().parent.parent


def _get_free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return


@dataclass
class LocalServer:
    server: ThreadingHTTPServer
    thread: threading.Thread
    port: int

    @property
    def base_url(self) -> str:
        return f"http://127.0.0.1:{self.port}"

    def stop(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=3)


def start_local_server() -> LocalServer:
    port = _get_free_port()
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(REPO_ROOT), **kwargs)
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.3)
    return LocalServer(server=server, thread=thread, port=port)


async def wait_for_toast(page) -> None:
    await page.wait_for_timeout(450)


async def main() -> None:
    server = start_local_server()
    unique = f"smoke-{int(time.time())}"
    updated = f"{unique}-edit"

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()

            page_errors: list[str] = []
            console_errors: list[str] = []
            page.on("pageerror", lambda err: page_errors.append(str(err)))
            page.on(
                "console",
                lambda msg: console_errors.append(msg.text)
                if msg.type == "error" and "Failed to load resource" not in msg.text
                else None,
            )

            await page.goto(f"{server.base_url}/index.html?smoke={unique}", wait_until="networkidle")
            await page.click("#btn-gate-signin")
            await page.wait_for_timeout(300)

            active_tab = await page.locator(".tab-btn.active").inner_text()
            assert active_tab == "Opciones", f"Expected Opciones after entry gate, got {active_tab}"

            await page.click('[data-tab="cargar"]')
            await page.fill("#monto", "12.34")
            await page.fill("#detalle", unique)
            await page.click("#btn-submit-tx")
            await wait_for_toast(page)

            await page.click('[data-tab="mas"]')
            await page.wait_for_timeout(300)
            await page.fill("#detail-search", unique)
            tx_item = page.locator("#lista li").filter(has_text=unique).first
            await tx_item.wait_for(timeout=3000)

            await tx_item.locator('button[data-action="edit"]').click()
            await page.wait_for_timeout(250)
            await page.click('[data-tab="cargar"]')
            await page.fill("#detalle", updated)
            await page.click("#btn-submit-tx")
            await wait_for_toast(page)

            await page.click('[data-tab="mas"]')
            await page.fill("#detail-search", updated)
            tx_item = page.locator("#lista li").filter(has_text=updated).first
            await tx_item.wait_for(timeout=3000)

            before_duplicate = await page.locator("#lista li").filter(has_text=updated).count()
            await tx_item.locator('button[data-action="duplicate"]').click()
            await wait_for_toast(page)
            after_duplicate = await page.locator("#lista li").filter(has_text=updated).count()
            assert after_duplicate == before_duplicate + 1, "Duplicate did not create a second movement"

            await page.locator("#lista li").filter(has_text=updated).first.locator('button[data-action="delete"]').click()
            await wait_for_toast(page)
            after_delete = await page.locator("#lista li").filter(has_text=updated).count()
            assert after_delete == after_duplicate - 1, "Delete did not remove the duplicated movement"

            await page.click('[data-tab="resumen"]')
            await page.wait_for_timeout(300)
            resumen_title = await page.locator("text=Resumen mes actual").inner_text()
            assert resumen_title == "Resumen mes actual", "Summary panel did not render"

            current_label = await page.locator("#current-month-label").inner_text()
            assert current_label.startswith("Mes actual:"), f"Unexpected summary label: {current_label}"

            if page_errors:
                raise AssertionError(f"Page errors detected: {page_errors}")
            if console_errors:
                raise AssertionError(f"Console errors detected: {console_errors}")

            await browser.close()
            print("Smoke test OK")
    finally:
        server.stop()


if __name__ == "__main__":
    asyncio.run(main())
