import { expect, test } from "vitest";
import { expectTypeOf } from "vitest";
import type { DeepReadonly } from "@/shared/lib/types/deep-readonly";
import type { PathKeys } from "@/shared/lib/types/path-keys";
import { QueryBuilder } from "@/shared/lib/query-builder/query-builder";
import { createTypedEventEmitter } from "@/shared/lib/events/typed-event-emitter";
import {
  getJobSummary,
  transitionJob,
  type JobAction,
  type JobState,
} from "@/shared/lib/job-state/job-state";

type Sample = {
  a: {
    b: string;
    c: {
      d: number;
    };
  };
};

test("PathKeys produces dotted leaf paths", () => {
  expectTypeOf<PathKeys<Sample>>().toEqualTypeOf<"a.b" | "a.c.d">();
});

test("DeepReadonly freezes nested objects, arrays, maps and sets", () => {
  type Source = {
    name: string;
    nested: { ok: boolean };
    list: string[];
    tuple: [number, { flag: boolean }];
    map: Map<string, { count: number }>;
    set: Set<{ id: string }>;
  };

  expectTypeOf<DeepReadonly<Source>["nested"]>().toEqualTypeOf<{
    readonly ok: boolean;
  }>();
  expectTypeOf<DeepReadonly<Source>["list"]>().toEqualTypeOf<
    readonly string[]
  >();
  expectTypeOf<DeepReadonly<Source>["map"]>().toEqualTypeOf<
    ReadonlyMap<string, { readonly count: number }>
  >();
  expectTypeOf<DeepReadonly<Source>["set"]>().toEqualTypeOf<
    ReadonlySet<{ readonly id: string }>
  >();
});

test("QueryBuilder narrows selected fields", () => {
  type Job = { id: string; title: string; status: "completed" | "draft" };
  const result = new QueryBuilder<Job>()
    .select("id", "title", "status")
    .where("status", "eq", "completed")
    .orderBy("title", "asc")
    .limit(10)
    .build();

  expect(result.query).toContain("SELECT id, title, status FROM jobs");
  expect(result.params).toEqual(["completed", 10]);
});

test("typed event emitter enforces payload types", () => {
  const emitter = createTypedEventEmitter<{ created: { id: string } }>();
  const seen: string[] = [];
  const handler = (payload: { id: string }) => {
    seen.push(payload.id);
  };
  emitter.on("created", handler);
  emitter.emit("created", { id: "job-1" });
  emitter.off("created", handler);
  emitter.emit("created", { id: "job-2" });
  expect(seen).toEqual(["job-1"]);
});

test("job state machine allows valid transitions and blocks invalid ones", () => {
  const draft: Extract<JobState, { status: "Draft" }> = { status: "Draft" };
  const scheduled = transitionJob(draft, {
    type: "schedule",
    scheduledDate: new Date("2026-09-01"),
    assigneeId: "crew-1",
  });
  const inProgress = transitionJob(scheduled, {
    type: "start",
    startedAt: new Date("2026-09-01T08:00:00Z"),
  });
  const completed = transitionJob(inProgress, {
    type: "complete",
    completedAt: new Date("2026-09-01T16:00:00Z"),
    signatureUrl: "https://files/signature.png",
  });

  expect(completed.status).toBe("Completed");
  expect(getJobSummary(completed)).toContain("Completed");

  const runtime = transitionJob as (
    current: JobState,
    action: JobAction,
  ) => JobState;
  expect(() =>
    runtime(completed, {
      type: "schedule",
      scheduledDate: new Date(),
      assigneeId: "crew-1",
    }),
  ).toThrow(/Invalid transition/);
});
