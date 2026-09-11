export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UserResponse {
  id: string;
  username: string;
  createdAt: string;
  hasTrackedHandle: boolean;
  setupComplete: boolean;
}

export interface PreferencesResponse {
  userId: string;
  trackedHandle: string | null;
  timeZone: string;
  targetRatingMin: number;
  targetRatingMax: number;
  preferredTopics: string[];
  reviewIntervals: number[];
  setupComplete: boolean;
}

export interface SyncJobResponse {
  id: string;
  state: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalSubmissionsFetched: number;
  newSubmissionsImported: number;
  problemsAddedToQueue: number;
  errorSummary: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export type QueueStatus = 'PENDING' | 'ATTEMPTED' | 'SOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ReviewOutcome = 'SOLVED_INDEPENDENTLY' | 'NEEDED_HINT' | 'COULD_NOT_SOLVE';
export type MistakeCategory = 'MISSED_OBSERVATION' | 'MISSING_PREREQUISITE' | 'INCORRECT_PROOF' | 'IMPLEMENTATION_BUG' | 'COMPLEXITY_ISSUE' | 'OVERFLOW' | 'EDGE_CASE' | 'OTHER';

export interface ProblemResponse {
  id: number;
  contestId: number | null;
  problemIndex: string;
  name: string;
  rating: number | null;
  tags: string[];
  problemType: string;
}

export interface QueueItemResponse {
  id: string;
  problem: ProblemResponse;
  status: QueueStatus;
  priority: Priority;
  source: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  hasNotes: boolean;
  hasReviewSchedule: boolean;
  nextReviewDate: string | null;
  submissionCount: number;
}

export interface ProblemNoteResponse {
  queueItemId: string;
  stuckReason: string | null;
  keyObservation: string | null;
  approachComplexity: string | null;
  whatToRemember: string | null;
  mistakeCategories: MistakeCategory[];
  version: number;
  updatedAt: string;
}

export interface ReviewScheduleResponse {
  queueItemId: string;
  intervalIndex: number;
  nextReviewDate: string | null;
  paused: boolean;
  version: number;
}

export interface ReviewAttemptResponse {
  id: string;
  queueItemId: string;
  reviewedAt: string;
  outcome: ReviewOutcome;
  notesRevealed: boolean;
  reflection: string | null;
}

export interface SubmissionResponse {
  cfSubmissionId: number;
  submittedAt: string;
  verdict: string | null;
  language: string | null;
  participantType: string;
  timeConsumedMs: number | null;
  passedTestCount: number | null;
}

export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail: string;
  errors?: { field: string; message: string }[];
}
