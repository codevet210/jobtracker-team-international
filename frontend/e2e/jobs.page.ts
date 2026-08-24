import { expect, type Page } from "@playwright/test";

export class JobsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/jobs");
    await this.page.getByTestId("jobs-table").or(this.page.getByTestId("jobs-empty")).waitFor();
  }

  async createJob(input: {
    title: string;
    description: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }) {
    await this.page.getByTestId("open-create-job").click();
    await this.page.getByTestId("create-job-modal").waitFor();
    await this.page.getByTestId("create-job-title-input").fill(input.title);
    await this.page.getByTestId("create-job-description-input").fill(input.description);
    await this.page.getByTestId("create-job-street-input").fill(input.street);
    await this.page.getByTestId("create-job-city-input").fill(input.city);
    await this.page.getByTestId("create-job-state-input").fill(input.state);
    await this.page.getByTestId("create-job-zip-input").fill(input.zipCode);
    await this.page.getByTestId("create-job-submit").click();
    await this.page.getByTestId("job-title").filter({ hasText: input.title }).waitFor();
  }

  async expectJobVisible(title: string) {
    await this.page.getByTestId("job-title").filter({ hasText: title }).waitFor();
  }

  async filterByStatus(status: string) {
    await this.page.getByTestId(`filter-status-${status}`).click();
  }

  async scheduleJob(title: string) {
    await this.page.getByTestId(`schedule-job-${title}`).click();
    await this.page.getByTestId("job-status").filter({ hasText: "Scheduled" }).waitFor();
  }

  async startJob(title: string) {
    await this.page.getByTestId(`start-job-${title}`).click();
    await this.page.getByTestId("job-status").filter({ hasText: "InProgress" }).waitFor();
  }

  async completeJob(title: string) {
    await this.page.getByTestId(`complete-job-${title}`).click();
    await this.page.getByTestId("complete-job-modal").waitFor();
    await this.page.getByTestId("complete-job-confirm").click();
  }

  async expectStatus(title: string, status: string) {
    const row = this.page.locator("tr", { hasText: title });
    await expect(row.getByTestId("job-status")).toHaveText(status);
  }
}
