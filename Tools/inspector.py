import asyncio
from playwright.async_api import async_playwright
import os

HTML_PATH = r"D:\AI_LAB\Bone_Code\html\index.html"

async def run_inspection():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Load your local HTML file
        await page.goto("file:///" + HTML_PATH.replace("\\", "/"))

        issues = []

        # Check if #chat exists
        chat = await page.query_selector("#chat")
        if not chat:
            issues.append("❌ #chat not found in live DOM")

        # Check if any messages render
        msgs = await page.query_selector_all(".msg")
        if not msgs:
            issues.append("❌ No .msg elements rendered")
        else:
            for m in msgs:
                classes = await m.get_attribute("class")
                bg = await m.evaluate("el => getComputedStyle(el).backgroundColor")
                if "user" in classes and "rgb(11, 147, 246)" not in bg:
                    issues.append(f"⚠️ .msg.user background mismatch: {bg}")
                if "ai" in classes and "rgb(68, 70, 84)" not in bg:
                    issues.append(f"⚠️ .msg.ai background mismatch: {bg}")

        # Check sidebar positioning
        sidebar = await page.query_selector("#sidebar")
        if sidebar:
            pos = await sidebar.evaluate("el => getComputedStyle(el).position")
            if pos != "fixed":
                issues.append(f"⚠️ Sidebar position is {pos}, expected fixed")

        # Check flex layout of #chat
        if chat:
            disp = await chat.evaluate("el => getComputedStyle(el).display")
            if disp != "flex":
                issues.append(f"❌ #chat display is {disp}, expected flex")

        await browser.close()

        print("\nUI Runtime Inspection Results:")
        if issues:
            for i in issues:
                print(i)
        else:
            print("✅ No runtime mismatches detected")

if __name__ == "__main__":
    asyncio.run(run_inspection())
