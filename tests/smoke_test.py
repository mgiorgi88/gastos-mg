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
    income_tag = f"{unique}-income"

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

            await page.click('[data-tab="cargar"]')
            await page.fill("#monto", "12.34")
            await page.fill("#detalle", unique)
            await page.click("#btn-submit-tx")
            await wait_for_toast(page)

            await page.select_option("#tipo", "Ingreso")
            await page.wait_for_timeout(150)
            await page.fill("#monto", "99.99")
            await page.fill("#detalle", income_tag)
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

            await tx_item.locator('button[data-action="duplicate"]').click()
            await page.wait_for_timeout(300)
            active_tab = await page.locator(".tab-btn.active").inner_text()
            assert active_tab == "Cargar", f"Expected Cargar after repeat action, got {active_tab}"

            detail_value = await page.locator("#detalle").input_value()
            amount_value = await page.locator("#monto").input_value()
            assert detail_value == updated, f"Expected repeated detail {updated!r}, got {detail_value!r}"
            assert amount_value == "12.34", f"Expected repeated amount 12.34, got {amount_value!r}"

            await page.click("#btn-submit-tx")
            await wait_for_toast(page)

            await page.click('[data-tab="mas"]')
            await page.fill("#detail-search", updated)
            repeated_items = page.locator("#lista li").filter(has_text=updated)
            repeated_count = await repeated_items.count()
            assert repeated_count >= 2, "Repeat draft did not create a second saved movement"

            await repeated_items.first.locator('button[data-action="delete"]').click()
            await wait_for_toast(page)
            after_delete = await page.locator("#lista li").filter(has_text=updated).count()
            assert after_delete == repeated_count - 1, "Delete did not remove one of the repeated movements"

            await page.fill("#detail-search", "")
            await page.select_option("#detail-type", "Ingreso")
            income_item = page.locator("#lista li").filter(has_text=income_tag).first
            await income_item.wait_for(timeout=3000)

            await page.click("#btn-detail-clear")
            await page.wait_for_timeout(250)

            await page.click('[data-tab="resumen"]')
            await page.wait_for_timeout(300)
            resumen_title = await page.locator("text=Resumen mes actual").inner_text()
            assert resumen_title == "Resumen mes actual", "Summary panel did not render"

            current_label = await page.locator("#current-month-label").inner_text()
            assert current_label.startswith("Mes actual:"), f"Unexpected summary label: {current_label}"

            await page.locator(".stats-card-expense .stats-card-toggle").click()
            await page.wait_for_timeout(250)
            expense_group = page.locator("#month-expense-category-list .category-breakdown-group").first
            await expense_group.wait_for(timeout=3000)
            await expense_group.locator("summary").click()
            await page.wait_for_timeout(250)
            expense_breakdown = expense_group.locator(".category-breakdown-link")
            expense_category = (await expense_breakdown.get_attribute("data-month-category")) or ""
            assert expense_category, "Expense breakdown did not expose a category"

            await expense_breakdown.click()
            await page.wait_for_timeout(300)

            active_tab = await page.locator(".tab-btn.active").inner_text()
            assert active_tab == "Movimientos", f"Expected Movimientos after category click, got {active_tab}"

            selected_type = await page.locator("#detail-type").input_value()
            selected_category = await page.locator("#detail-category").input_value()
            assert selected_type == "Gasto", f"Expected Gasto filter after expense category click, got {selected_type}"
            assert selected_category == expense_category, (
                f"Expected category filter {expense_category!r}, got {selected_category!r}"
            )

            await page.click('[data-tab="resumen"]')
            await page.wait_for_timeout(250)
            await page.locator(".stats-card-income .stats-card-toggle").click()
            await page.wait_for_timeout(250)
            income_group = page.locator("#month-income-category-list .category-breakdown-group").first
            await income_group.wait_for(timeout=3000)
            await income_group.locator("summary").click()
            await page.wait_for_timeout(250)
            income_breakdown = income_group.locator(".category-breakdown-link")
            income_category = (await income_breakdown.get_attribute("data-month-category")) or ""
            assert income_category, "Income breakdown did not expose a category"
            await income_breakdown.click()
            await page.wait_for_timeout(300)

            selected_type = await page.locator("#detail-type").input_value()
            selected_category = await page.locator("#detail-category").input_value()
            assert selected_type == "Ingreso", f"Expected Ingreso filter after income category click, got {selected_type}"
            assert selected_category == income_category, (
                f"Expected income category filter {income_category!r}, got {selected_category!r}"
            )
            income_results = await page.locator("#lista li").filter(has_text=income_tag).count()
            assert income_results >= 1, "Income category shortcut did not show the expected movement"

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
