import { searchJobsUseCase } from "@/application/jobs/search-jobs.use-case";

export const container = {
  searchJobs: searchJobsUseCase,
};
