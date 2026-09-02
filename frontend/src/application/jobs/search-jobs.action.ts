"use server";

import { searchJobsUseCase } from "@/application/jobs/search-jobs.use-case";

export async function searchJobsAction() {
  return searchJobsUseCase();
}
