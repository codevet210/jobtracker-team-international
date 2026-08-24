import { expect, test, vi } from "vitest";
import { createJobAction } from "@/application/jobs/job.actions";
import {
  createJobReducer,
  initialCreateJobState,
  validateCreateJob,
} from "./use-create-job.hook";

vi.mock("@/application/jobs/job.actions", () => ({
  createJobAction: vi.fn(),
}));

test("validateCreateJob requires core address fields", () => {
  expect(validateCreateJob(initialCreateJobState)).toBe("Title is required.");
});

test("reducer submitSuccess resets the form", () => {
  const filled = createJobReducer(initialCreateJobState, {
    type: "setField",
    field: "title",
    value: "Roof",
  });
  const reset = createJobReducer(filled, { type: "submitSuccess" });
  expect(reset.title).toBe("");
  expect(reset.isSubmitting).toBe(false);
});

test("createJobAction mock is typed", async () => {
  vi.mocked(createJobAction).mockResolvedValue({ id: "abc" });
  await expect(createJobAction({
    title: "Roof",
    description: "",
    street: "1 Main",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    customerId: "c1",
  })).resolves.toEqual({ id: "abc" });
});
