import { expect, test } from "@playwright/test";

test("cinematic promo scroll keeps foreground story layers from overlapping", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator('[data-story-layer="hero"]')).toBeVisible();

  const maxScroll = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );

  for (const progress of [0.56, 0.75, 0.86]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), maxScroll * progress);
    await page.waitForTimeout(1000);

    const visibleForegroundLayers = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-story-layer]"))
        .filter((element) => element.dataset.storyLayer !== "hero")
        .map((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return {
            layer: element.dataset.storyLayer,
            opacity: Number(style.opacity),
            visible:
              style.visibility !== "hidden" &&
              Number(style.opacity) > 0.18 &&
              rect.bottom > 0 &&
              rect.top < window.innerHeight
          };
        })
        .filter((layer) => layer.visible)
    );

    expect(visibleForegroundLayers, `scroll progress ${progress}`).toHaveLength(1);
  }
});
