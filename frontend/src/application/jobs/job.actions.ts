"use server";

import {
  API_BASE_URL,
  DEMO_ORGANIZATION_ID,
} from "@/shared/config/env";
import type { CreateJobInput } from "@/shared/types/job";

export async function createJobAction(input: CreateJobInput): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Organization-Id": DEMO_ORGANIZATION_ID,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Unable to create job.");
  }

  return (await response.json()) as { id: string };
}

export async function scheduleJobAction(jobId: string): Promise<void> {
  const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { DEMO_ASSIGNEE_ID } = await import("@/shared/config/env");

  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Organization-Id": DEMO_ORGANIZATION_ID,
    },
    body: JSON.stringify({
      scheduledDate,
      assigneeId: DEMO_ASSIGNEE_ID,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to schedule job.");
  }
}

export async function startJobAction(jobId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/start`, {
    method: "POST",
    headers: {
      "X-Organization-Id": DEMO_ORGANIZATION_ID,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to start job.");
  }
}

export async function completeJobAction(jobId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Organization-Id": DEMO_ORGANIZATION_ID,
    },
    body: JSON.stringify({ completedAt: new Date().toISOString() }),
  });

  if (!response.ok) {
    throw new Error("Unable to complete job.");
  }
}
