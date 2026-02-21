export enum ActivityProgress {
  INITIALIZED = 'Initialized',
  STARTED = 'Started',
  IN_PROGRESS = 'InProgress',
  SUBMITTED = 'Submitted',
  COMPLETED = 'Completed',
}

export enum GradingProgress {
  NOT_READY = 'NotReady',
  FAILED = 'Failed',
  PENDING = 'Pending',
  PENDING_MANUAL = 'PendingManual',
  FULLY_GRADED = 'FullyGraded',
  PROCESSED = 'Processed',
}

export enum PassbackStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRYING = 'retrying',
}
