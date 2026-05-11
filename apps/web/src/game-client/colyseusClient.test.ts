import { afterEach, describe, expect, it } from "vitest";
import { getColyseusServerUrl } from "./colyseusClient";

const originalServerUrl = process.env.NEXT_PUBLIC_WIAI_SERVER_URL;

describe("getColyseusServerUrl", () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_WIAI_SERVER_URL = originalServerUrl;
  });

  it("uses an explicitly configured public server URL", () => {
    process.env.NEXT_PUBLIC_WIAI_SERVER_URL = "ws://game.example.test:2567";

    expect(getColyseusServerUrl({ hostname: "10.10.5.4", protocol: "http:" })).toBe(
      "ws://game.example.test:2567"
    );
  });

  it("uses the browser host when no public server URL is configured", () => {
    delete process.env.NEXT_PUBLIC_WIAI_SERVER_URL;

    expect(getColyseusServerUrl({ hostname: "10.10.5.4", protocol: "http:" })).toBe("ws://10.10.5.4:2567");
  });

  it("uses secure websockets for https pages", () => {
    delete process.env.NEXT_PUBLIC_WIAI_SERVER_URL;

    expect(getColyseusServerUrl({ hostname: "wiai.example.test", protocol: "https:" })).toBe(
      "wss://wiai.example.test:2567"
    );
  });
});
