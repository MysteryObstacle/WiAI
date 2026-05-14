import { expect, test, type Page } from "@playwright/test";

const phaseText = {
  answerPrep: /Answer prep|答题准备/,
  discussion: /Discussion|讨论/,
  voting: /Voting|投票/
};

test("one host browser completes a full Who is AI game with debug players", async ({ page }) => {
  await startGameWithDebugPlayers(page, "Host");
  await expect(page.getByTestId("game-status-bar")).toBeVisible();
  await expect(page.getByTestId("command-console")).toBeVisible();
  await expect(page.getByTestId("game-action-bar")).toBeVisible();
  await expect(page.getByTestId("player-column-left")).toBeVisible();
  await expect(page.getByTestId("player-column-right")).toBeVisible();

  for (let round = 0; round < 3; round += 1) {
    await answerRound(page, `Host round ${round}`);

    await expect(page.getByTestId("phase-name")).toHaveText(phaseText.discussion, { timeout: 10_000 });
    await expect(page.getByTestId("phase-name")).toHaveText(phaseText.voting, { timeout: 10_000 });

    await voteForAi(page);

    if (round < 2) {
      await expect(page.getByTestId("phase-name")).toHaveText(phaseText.answerPrep, { timeout: 10_000 });
    }
  }

  await expect(page.getByTestId("settlement-winner")).toHaveText(
    /Citizens win|AI wins|Shelterer wins|平民胜利|AI胜利|庇护者胜利/,
    { timeout: 10_000 }
  );
});

test("keeps a compact player rail available on narrower game viewports", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 780 });
  await startGameWithDebugPlayers(page, "Narrow");

  await expect(page.getByTestId("game-status-bar")).toBeVisible();
  await expect(page.getByTestId("command-console")).toBeVisible();
  await expect(page.getByTestId("player-compact-rail")).toBeVisible();
  await expect(page.getByTestId("player-compact-rail")).toContainText("Narrow");
});

async function startGameWithDebugPlayers(page: Page, nickname: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start" }).first().click();
  await page.getByTestId("create-nickname").fill(nickname);
  await page.getByTestId("create-room").click();
  await expect(page.getByTestId("room-code")).toHaveText(/\S+/);
  const roomCode = (await page.getByTestId("room-code").innerText()).trim();
  expect(roomCode.length).toBeGreaterThan(0);

  await expect(page.getByTestId("add-debug-players")).toBeEnabled();
  await page.getByTestId("add-debug-players").click();
  await expect(page.getByText("Debug 1")).toBeVisible();
  await expect(page.getByText("Debug 2")).toBeVisible();

  await expect(page.getByTestId("start-game")).toBeEnabled();
  await page.getByTestId("start-game").click();
}

async function answerRound(page: Page, content: string) {
  await expect(page.getByTestId("phase-name")).toHaveText(phaseText.answerPrep, { timeout: 10_000 });
  await page.getByTestId("answer-input").fill(content);
  await page.getByTestId("submit-answer").click();
}

async function voteForAi(page: Page) {
  await expect(page.getByTestId("phase-name")).toHaveText(phaseText.voting, { timeout: 10_000 });
  await page.getByTestId("vote-option-4").click();
  await page.getByTestId("cast-vote").click();
}
