import { test, expect } from "@playwright/test";
import { PATHS } from "../src/routes/paths";

const BASE_URL = "http://localhost:5173";

test.describe("Route Validation", () => {
  for (const route of Object.values(PATHS)) {
    test(`${route} renders without errors`, async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      const response = await page.goto(`${BASE_URL}${route}`);

      expect(response?.ok()).toBeTruthy();

      await expect(page).toHaveURL(`${BASE_URL}${route}`);
      await expect(page.locator("body")).toBeVisible();

      expect(errors).toEqual([]);
    });
  }
});