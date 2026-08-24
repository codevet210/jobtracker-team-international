import "server-only";

import {
  API_BASE_URL,
  DEMO_ORGANIZATION_ID,
} from "@/shared/config/env";
import type { PagedJobs } from "@/shared/types/job";

export async function searchJobsUseCase(): Promise<PagedJobs> {
  const response = await fetch(`${API_BASE_URL}/api/jobs?page=1&pageSize=50`, {
    headers: {
      "X-Organization-Id": DEMO_ORGANIZATION_ID,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load jobs.");
  }

  return (await response.json()) as PagedJobs;
}
