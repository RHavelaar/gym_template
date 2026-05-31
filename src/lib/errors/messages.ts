import { ERROR_CODES, type ErrorCode } from "./codes";

export const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.AUTH_UNAUTHORIZED]: "You need to sign in to do that.",
  [ERROR_CODES.AUTH_FORBIDDEN]: "You do not have permission for this action.",
  [ERROR_CODES.AUTH_MEMBERSHIP]: "Your gym membership is not set up yet.",

  [ERROR_CODES.CMS_VALIDATION]: "Some settings look off — double-check the form.",
  [ERROR_CODES.CMS_SAVE_FAILED]: "We could not save your site settings.",
  [ERROR_CODES.CMS_NOT_FOUND]: "That page or section could not be found.",
  [ERROR_CODES.CMS_HOMEPAGE]: "We could not save your homepage layout.",

  [ERROR_CODES.VAL_INVALID_INPUT]: "Please check your input and try again.",

  [ERROR_CODES.DB_QUERY_FAILED]: "Something went wrong saving to the database.",

  [ERROR_CODES.NET_REQUEST_FAILED]: "The request failed. Check your connection and retry.",
  [ERROR_CODES.NET_OFFLINE]: "You appear to be offline.",

  [ERROR_CODES.AI_UNAVAILABLE]: "Spotter is not configured. Add an AI Gateway key to enable it.",
  [ERROR_CODES.AI_GENERATION_FAILED]: "We could not complete the AI request. Try again.",

  [ERROR_CODES.PR_SUBMIT_FAILED]: "We could not submit your PR.",
  [ERROR_CODES.PR_REVIEW_FAILED]: "We could not update that PR review.",

  [ERROR_CODES.PROFILE_SAVE_FAILED]: "We could not save your profile.",
  [ERROR_CODES.PROFILE_LOAD_FAILED]: "We could not load your profile.",

  [ERROR_CODES.MEDIA_UPLOAD_FAILED]: "We could not upload that file.",
  [ERROR_CODES.MEDIA_INVALID_TYPE]: "That file type is not supported.",
  [ERROR_CODES.MEDIA_TOO_LARGE]: "That file is too large to upload.",
  [ERROR_CODES.MEDIA_RENAME_FAILED]: "We could not rename that file.",

  [ERROR_CODES.SYS_UNEXPECTED]: "Something unexpected happened on our end.",
  [ERROR_CODES.SYS_BOUNDARY]: "This page hit a snag. We logged it.",
};
