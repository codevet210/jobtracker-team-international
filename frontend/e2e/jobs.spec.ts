import { test, expect } from "@playwright/test";
import { JobsPage } from "./jobs.page";

test("office staff can create, filter, and complete a job", async ({ page }) => {
  const jobs = new JobsPage(page);
  const title = `E2E roof ${Date.now()}`;

  await jobs.goto();
  await jobs.createJob({
    title,
    description: "North slope leak",
    street: "100 Oak St",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
  });
  await jobs.expectJobVisible(title);

  await jobs.filterByStatus("Draft");
  await jobs.expectJobVisible(title);

  await jobs.scheduleJob(title);
  await jobs.startJob(title);
  await jobs.completeJob(title);
  await jobs.expectStatus(title, "Completed");
});
