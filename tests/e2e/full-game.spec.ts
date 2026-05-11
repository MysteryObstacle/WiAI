import { expect, test, type Page } from "@playwright/test";

test("three browsers complete a full Who is AI game", async ({ browser }) => {
  const hostContext = await browser.newContext();
  const adaContext = await browser.newContext();
  const graceContext = await browser.newContext();

  const host = await hostContext.newPage();
  const ada = await adaContext.newPage();
  const grace = await graceContext.newPage();

  await host.goto("/");
  await host.getByTestId("create-nickname").fill("Host");
  await host.getByTestId("create-room").click();
  const roomCode = (await host.getByTestId("room-code").innerText()).trim();
  expect(roomCode.length).toBeGreaterThan(0);

  await joinByCode(ada, roomCode, "Ada");
  await joinByCode(grace, roomCode, "Grace");

  await ada.getByTestId("ready-toggle").click();
  await grace.getByTestId("ready-toggle").click();
  await expect(host.getByTestId("start-game")).toBeEnabled();
  await host.getByTestId("start-game").click();

  for (let round = 0; round < 3; round += 1) {
    await answerRound(host, `Host round ${round}`);
    await answerRound(ada, `Ada round ${round}`);
    await answerRound(grace, `Grace round ${round}`);

    await expect(host.getByTestId("phase-name")).toHaveText("Discussion", { timeout: 10_000 });
    await expect(host.getByTestId("phase-name")).toHaveText("Voting", { timeout: 10_000 });

    await voteForAi(host);
    await voteForAi(ada);
    await voteForAi(grace);

    if (round < 2) {
      await expect(host.getByTestId("phase-name")).toHaveText("Answer prep", { timeout: 10_000 });
    }
  }

  await expect(host.getByTestId("settlement-winner")).toHaveText("citizen", { timeout: 10_000 });

  await hostContext.close();
  await adaContext.close();
  await graceContext.close();
});

async function joinByCode(page: Page, roomCode: string, nickname: string) {
  await page.goto("/");
  await page.getByTestId("join-nickname").fill(nickname);
  await page.getByTestId("join-code").fill(roomCode);
  await page.getByTestId("join-room").click();
  await expect(page.getByTestId("room-code")).toHaveText(roomCode);
}

async function answerRound(page: Page, content: string) {
  await expect(page.getByTestId("phase-name")).toHaveText("Answer prep", { timeout: 10_000 });
  await page.getByTestId("answer-input").fill(content);
  await page.getByTestId("submit-answer").click();
}

async function voteForAi(page: Page) {
  await expect(page.getByTestId("phase-name")).toHaveText("Voting", { timeout: 10_000 });
  await page.getByTestId("vote-option-4").click();
  await page.getByTestId("cast-vote").click();
}
