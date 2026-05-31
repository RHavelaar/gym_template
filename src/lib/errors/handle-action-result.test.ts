import { describe, expect, it, vi } from "vitest";
import { handleSaveActionResult } from "@/lib/errors/handle-action-result";
import type { SaveActionResult } from "@/lib/validation/action-result";

describe("handleSaveActionResult", () => {
  it("returns true and shows success toast on ok results", () => {
    const showSuccess = vi.fn();
    const showError = vi.fn();

    const saved = handleSaveActionResult({ ok: true }, { showError, showSuccess }, { successMessage: "Saved." });

    expect(saved).toBe(true);
    expect(showSuccess).toHaveBeenCalledWith("Saved.");
    expect(showError).not.toHaveBeenCalled();
  });

  it("routes field validation errors to onFieldErrors without toast", () => {
    const showSuccess = vi.fn();
    const showError = vi.fn();
    const onFieldErrors = vi.fn();

    const result: SaveActionResult = {
      ok: false,
      message: "Fix the highlighted fields.",
      fieldErrors: { headline: "Headline is required when shown" },
    };

    const saved = handleSaveActionResult(result, { showError, showSuccess }, { onFieldErrors });

    expect(saved).toBe(false);
    expect(onFieldErrors).toHaveBeenCalledWith(result.fieldErrors);
    expect(showError).not.toHaveBeenCalled();
  });

  it("shows operational error toast when save fails on the server", () => {
    const showSuccess = vi.fn();
    const showError = vi.fn();

    const saved = handleSaveActionResult(
      {
        ok: false,
        message: "Could not save media settings.",
        error: { code: "GYM-CMS-002", message: "Could not save media settings." },
      },
      { showError, showSuccess },
    );

    expect(saved).toBe(false);
    expect(showError).toHaveBeenCalledWith({
      code: "GYM-CMS-002",
      message: "Could not save media settings.",
    });
  });
});
