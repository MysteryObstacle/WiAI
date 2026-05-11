import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "npm run dev -w apps/server",
      url: "http://127.0.0.1:2567",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    },
    {
      command: "npm run dev -w apps/web",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
