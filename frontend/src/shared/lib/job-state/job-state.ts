export type JobState =
  | { status: "Draft"; notes?: string }
  | { status: "Scheduled"; scheduledDate: Date; assigneeId: string }
  | {
      status: "InProgress";
      startedAt: Date;
      assigneeId: string;
      photos: string[];
    }
  | {
      status: "Completed";
      startedAt: Date;
      completedAt: Date;
      assigneeId: string;
      photos: string[];
      signatureUrl: string;
    }
  | { status: "Cancelled"; cancelledAt: Date; reason: string };

export type JobAction =
  | { type: "schedule"; scheduledDate: Date; assigneeId: string }
  | { type: "start"; startedAt: Date }
  | { type: "complete"; completedAt: Date; signatureUrl: string }
  | { type: "addPhoto"; url: string }
  | { type: "cancel"; cancelledAt: Date; reason: string };

type DraftState = Extract<JobState, { status: "Draft" }>;
type ScheduledState = Extract<JobState, { status: "Scheduled" }>;
type InProgressState = Extract<JobState, { status: "InProgress" }>;

export function transitionJob(
  current: DraftState,
  action: Extract<JobAction, { type: "schedule" }>,
): ScheduledState;
export function transitionJob(
  current: ScheduledState,
  action: Extract<JobAction, { type: "start" }>,
): InProgressState;
export function transitionJob(
  current: ScheduledState,
  action: Extract<JobAction, { type: "cancel" }>,
): Extract<JobState, { status: "Cancelled" }>;
export function transitionJob(
  current: InProgressState,
  action: Extract<JobAction, { type: "complete" }>,
): Extract<JobState, { status: "Completed" }>;
export function transitionJob(
  current: InProgressState,
  action: Extract<JobAction, { type: "cancel" }>,
): Extract<JobState, { status: "Cancelled" }>;
export function transitionJob(
  current: InProgressState,
  action: Extract<JobAction, { type: "addPhoto" }>,
): InProgressState;
export function transitionJob(current: JobState, action: JobAction): JobState {
  switch (current.status) {
    case "Draft":
      if (action.type === "schedule") {
        return {
          status: "Scheduled",
          scheduledDate: action.scheduledDate,
          assigneeId: action.assigneeId,
        };
      }
      break;
    case "Scheduled":
      if (action.type === "start") {
        return {
          status: "InProgress",
          startedAt: action.startedAt,
          assigneeId: current.assigneeId,
          photos: [],
        };
      }
      if (action.type === "cancel") {
        return {
          status: "Cancelled",
          cancelledAt: action.cancelledAt,
          reason: action.reason,
        };
      }
      break;
    case "InProgress":
      if (action.type === "complete") {
        return {
          status: "Completed",
          startedAt: current.startedAt,
          completedAt: action.completedAt,
          assigneeId: current.assigneeId,
          photos: current.photos,
          signatureUrl: action.signatureUrl,
        };
      }
      if (action.type === "cancel") {
        return {
          status: "Cancelled",
          cancelledAt: action.cancelledAt,
          reason: action.reason,
        };
      }
      if (action.type === "addPhoto") {
        return {
          ...current,
          photos: [...current.photos, action.url],
        };
      }
      break;
    case "Completed":
    case "Cancelled":
      break;
    default: {
      const exhaustive: never = current;
      return exhaustive;
    }
  }

  throw new Error(
    `Invalid transition from ${current.status} via ${action.type}`,
  );
}

export function getJobSummary(state: JobState): string {
  switch (state.status) {
    case "Draft":
      return state.notes
        ? `Draft job (${state.notes})`
        : "Draft job awaiting schedule";
    case "Scheduled":
      return `Scheduled for ${state.scheduledDate.toISOString()} with assignee ${state.assigneeId}`;
    case "InProgress":
      return `In progress since ${state.startedAt.toISOString()} (${state.photos.length} photos)`;
    case "Completed":
      return `Completed at ${state.completedAt.toISOString()}`;
    case "Cancelled":
      return `Cancelled: ${state.reason}`;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}
