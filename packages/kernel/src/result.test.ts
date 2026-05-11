import { describe, expect, it } from "vitest";
import { err, isErr, isOk, ok, unwrap } from "./result";

describe("Result helpers", () => {
  it("wraps successful values", () => {
    const result = ok({ roomId: "room_1" });

    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    expect(unwrap(result)).toEqual({ roomId: "room_1" });
  });

  it("wraps stable domain errors", () => {
    const result = err("invalid_phase", "Action is not allowed in this phase");

    expect(isErr(result)).toBe(true);
    expect(result.error.code).toBe("invalid_phase");
  });

  it("throws when unwrapping an error", () => {
    expect(() => unwrap(err("not_host", "Only the host can start"))).toThrow("not_host");
  });
});
