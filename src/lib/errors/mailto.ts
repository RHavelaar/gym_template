export type ErrorHelpMailtoInput = {
  helpEmail: string;
  gymName: string;
  code: string;
  message: string;
  route?: string;
  eventId?: string;
  timestamp?: string;
};

export const buildErrorHelpMailto = ({
  helpEmail,
  gymName,
  code,
  message,
  route,
  eventId,
  timestamp = new Date().toISOString(),
}: ErrorHelpMailtoInput): string | null => {
  const email = helpEmail.trim();
  if (!email) {
    return null;
  }

  const subject = `[${gymName}] Help with error ${code}`;
  const bodyLines = [
    "Hi,",
    "",
    "I ran into an issue on the site:",
    "",
    `Error code: ${code}`,
    `What happened: ${message}`,
    route ? `Page: ${route}` : null,
    `Time: ${timestamp}`,
    eventId ? `Reference ID: ${eventId}` : null,
    "",
    "[Optional notes below]",
    "",
  ].filter((line): line is string => line !== null);

  const params = new URLSearchParams({
    subject,
    body: bodyLines.join("\n"),
  });

  return `mailto:${encodeURIComponent(email)}?${params.toString()}`;
};
