import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for DORIS TV. Run against a running site:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test
 * Signed-in tests need the test-account variables (see docs/HANDOVER.md) and are skipped without them.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
