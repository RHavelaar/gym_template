import { describe, expect, it } from "vitest";
import { isOperationalSaveFailure, saveFailureToError, type SaveActionResult } from "@/lib/validation/action-result";

describe("SaveActionResult helpers", () => {
  it("detects operational failures with error payloads", () => {
    const result: SaveActionResult = {
      ok: false,
      message: "Could not save media settings.",
      error: { code: "GYM-CMS-002", message: "Could not save media settings." },
    };

    expect(isOperationalSaveFailure(result)).toBe(true);
    if (!result.ok && isOperationalSaveFailure(result)) {
      expect(result.error.code).toBe("GYM-CMS-002");
    }
  });

  it("treats validation failures without error payloads as non-operational", () => {
    const result: SaveActionResult = {
      ok: false,
      message: "Fix the highlighted fields.",
      fieldErrors: { headline: "Headline is required when shown" },
    };

    expect(isOperationalSaveFailure(result)).toBe(false);
    expect(saveFailureToError(result).message).toBe("Fix the highlighted fields.");
  });

  it("falls back to a default CMS code when only message is provided", () => {
    const result: SaveActionResult = {
      ok: false,
      message: "Invalid media data. Check your gallery and hero image.",
    };

    expect(saveFailureToError(result)).toEqual({
      code: "GYM-CMS-002",
      message: "Invalid media data. Check your gallery and hero image.",
    });
  });
});
