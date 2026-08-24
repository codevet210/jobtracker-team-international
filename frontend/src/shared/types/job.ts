export type JobStatus =
  | "Draft"
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type JobDto = {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  scheduledDate: string | null;
  assigneeId: string | null;
  customerId: string;
  organizationId: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  photoCount: number;
};

export type PagedJobs = {
  items: JobDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CreateJobInput = {
  title: string;
  description: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  customerId: string;
};
