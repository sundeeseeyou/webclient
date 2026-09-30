import { describe, expect, it } from "vitest";
import { calculateProgress, projectProgress } from "@/lib/progress";

describe("progres proyek (PRD 6.3)", () => {
  it("0% bila belum ada task", () => {
    expect(calculateProgress([])).toBe(0);
  });

  it("task DONE dibagi total task x 100", () => {
    expect(calculateProgress(["DONE", "TODO", "IN_PROGRESS", "DONE"])).toBe(50);
    expect(calculateProgress(["DONE", "DONE"])).toBe(100);
    expect(calculateProgress(["TODO", "IN_PROGRESS"])).toBe(0);
  });

  it("dibulatkan ke bilangan bulat terdekat", () => {
    expect(calculateProgress(["DONE", "TODO", "TODO"])).toBe(33);
    expect(calculateProgress(["DONE", "DONE", "TODO"])).toBe(67);
    expect(calculateProgress(["DONE", "TODO", "TODO", "TODO", "TODO", "TODO", "TODO", "TODO"])).toBe(13);
  });

  it("menghitung task di semua sprint proyek", () => {
    const project = {
      sprints: [
        { tasks: [{ status: "DONE" as const }, { status: "DONE" as const }] },
        { tasks: [{ status: "IN_PROGRESS" as const }, { status: "TODO" as const }] },
        { tasks: [] },
      ],
    };
    expect(projectProgress(project)).toBe(50);
  });

  it("naik saat task dipindah ke DONE (BB-09)", () => {
    const before = projectProgress({ sprints: [{ tasks: [{ status: "DONE" }, { status: "TODO" }, { status: "TODO" }] }] });
    const after = projectProgress({ sprints: [{ tasks: [{ status: "DONE" }, { status: "DONE" }, { status: "TODO" }] }] });
    expect(after).toBeGreaterThan(before);
  });
});
