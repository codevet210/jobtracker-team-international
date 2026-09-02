import { DEMO_CUSTOMER_ID } from "@/shared/config/env";
import type { CreateJobInput } from "@/shared/types/job";

export const SAMPLE_ROOFING_JOB: CreateJobInput = {
  title: "Replace hail-damaged shingles — 214 Oak Hill",
  description:
    "North slope leak after last week's storm. Customer wants the same crew that did the garage last spring.",
  street: "214 Oak Hill Dr",
  city: "Austin",
  state: "TX",
  zipCode: "78704",
  customerId: DEMO_CUSTOMER_ID,
};

export const DEMO_STEPS = [
  {
    id: "create",
    label: "Create",
    status: "Draft",
    talk: "Office staff opens a roofing job with the site address. The job starts in Draft.",
  },
  {
    id: "schedule",
    label: "Schedule",
    status: "Scheduled",
    talk: "Dispatch assigns a crew and a future date. The domain block scheduling in the past.",
  },
  {
    id: "start",
    label: "Start",
    status: "InProgress",
    talk: "The crew arrives on site. Only a Scheduled job can move to In progress.",
  },
  {
    id: "complete",
    label: "Complete",
    status: "Completed",
    talk: "Completion raises a domain event. The outbox then invoices Billing and notifies the customer.",
  },
] as const;
