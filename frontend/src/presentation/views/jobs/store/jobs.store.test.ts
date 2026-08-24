import { act } from "react";
import { describe, expect, test, vi } from "vitest";
import {
  createJobReducer,
  initialCreateJobState,
  validateCreateJob,
} from "@/presentation/views/jobs/features/create-job/hooks/use-create-job.hook";
import { useJobsStore } from "@/presentation/views/jobs/store/jobs.store";
import type { JobDto } from "@/shared/types/job";

vi.mock("@/application/jobs/job.actions", () => ({
  createJobAction: vi.fn(),
  completeJobAction: vi.fn(),
  scheduleJobAction: vi.fn(),
  startJobAction: vi.fn(),
}));

function job(overrides: Partial<JobDto> = {}): JobDto {
  return {
    id: "job-1",
    title: "Replace shingles",
    description: "Leak",
    status: "Draft",
    street: "1 Main",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    latitude: null,
    longitude: null,
    scheduledDate: null,
    assigneeId: null,
    customerId: "c1",
    organizationId: "o1",
    startedAt: null,
    completedAt: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    photoCount: 0,
    ...overrides,
  };
}

describe("createJobReducer", () => {
  test("updates fields and validates required title", () => {
    const next = createJobReducer(initialCreateJobState, {
      type: "setField",
      field: "title",
      value: "New roof",
    });
    expect(next.title).toBe("New roof");
    expect(validateCreateJob(next)).toBe("Street is required.");
  });
});

describe("useJobsStore", () => {
  test("filters jobs with a selector and rolls back optimistic updates", () => {
    act(() => {
      useJobsStore.getState().hydrate([
        job({ id: "1", title: "A", status: "Draft" }),
        job({ id: "2", title: "B", status: "Completed" }),
      ]);
      useJobsStore.getState().setStatuses(["Draft"]);
    });

    const filtered = useJobsStore
      .getState()
      .jobs.filter((item) =>
        useJobsStore.getState().filters.statuses.includes(item.status),
      );
    expect(filtered).toHaveLength(1);

    let previous: string | null = null;
    act(() => {
      previous = useJobsStore.getState().optimisticStatus("1", "Completed");
    });
    expect(useJobsStore.getState().jobs[0]?.status).toBe("Completed");
    expect(previous).toBe("Draft");

    act(() => {
      useJobsStore.getState().rollbackStatus("1", "Draft");
    });
    expect(useJobsStore.getState().jobs[0]?.status).toBe("Draft");
  });
});
