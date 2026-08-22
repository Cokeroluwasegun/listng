import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Homepage", () => {
  test("loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(BASE);
    await expect(page).toHaveTitle(/ListNG/);
    await expect(page.locator("body")).toBeVisible();
    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("404")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("header navigation is visible", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole("link", { name: /listings|market|search/i }).first()).toBeVisible();
  });
});

test.describe("Auth flows", () => {
  test("login page loads", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByRole("heading", { name: /sign in|log in|welcome/i })).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.getByRole("heading", { name: /create account|register|sign up/i })).toBeVisible();
  });
});

test.describe("Protected routes redirect unauthenticated users", () => {
  test("dashboard redirects to login", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await expect(page).toHaveURL(/\/login/);
  });

  test("listings/create redirects to login", async ({ page }) => {
    await page.goto(`${BASE}/listings/create`);
    await expect(page).toHaveURL(/\/login/);
  });
});
