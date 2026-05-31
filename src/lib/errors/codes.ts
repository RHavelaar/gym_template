export const ERROR_DOMAINS = {
  AUTH: "AUTH",
  CMS: "CMS",
  VAL: "VAL",
  DB: "DB",
  NET: "NET",
  PR: "PR",
  PROFILE: "PROFILE",
  MEDIA: "MEDIA",
  SYS: "SYS",
} as const;

export type ErrorDomain = (typeof ERROR_DOMAINS)[keyof typeof ERROR_DOMAINS];

/** Stable error codes for support correlation — format GYM-{DOMAIN}-{NNN} */
export const ERROR_CODES = {
  // Auth / access
  AUTH_UNAUTHORIZED: "GYM-AUTH-001",
  AUTH_FORBIDDEN: "GYM-AUTH-002",
  AUTH_MEMBERSHIP: "GYM-AUTH-003",

  // CMS / admin content
  CMS_VALIDATION: "GYM-CMS-001",
  CMS_SAVE_FAILED: "GYM-CMS-002",
  CMS_NOT_FOUND: "GYM-CMS-003",
  CMS_HOMEPAGE: "GYM-CMS-004",

  // Validation (generic)
  VAL_INVALID_INPUT: "GYM-VAL-001",

  // Database
  DB_QUERY_FAILED: "GYM-DB-001",

  // Network / client
  NET_REQUEST_FAILED: "GYM-NET-001",
  NET_OFFLINE: "GYM-NET-002",

  // AI
  AI_UNAVAILABLE: "GYM-AI-001",
  AI_GENERATION_FAILED: "GYM-AI-002",

  // PR submissions
  PR_SUBMIT_FAILED: "GYM-PR-001",
  PR_REVIEW_FAILED: "GYM-PR-002",

  // Profile
  PROFILE_SAVE_FAILED: "GYM-PROFILE-001",
  PROFILE_LOAD_FAILED: "GYM-PROFILE-002",

  // Media / uploads
  MEDIA_UPLOAD_FAILED: "GYM-MEDIA-001",
  MEDIA_INVALID_TYPE: "GYM-MEDIA-002",
  MEDIA_TOO_LARGE: "GYM-MEDIA-003",
  MEDIA_RENAME_FAILED: "GYM-MEDIA-004",

  // System / boundaries
  SYS_UNEXPECTED: "GYM-SYS-001",
  SYS_BOUNDARY: "GYM-SYS-002",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const getErrorDomain = (code: string): ErrorDomain => {
  const match = code.match(/^GYM-([A-Z]+)-\d+$/);
  const domain = match?.[1];
  if (domain && domain in ERROR_DOMAINS) {
    return domain as ErrorDomain;
  }
  return ERROR_DOMAINS.SYS;
};
