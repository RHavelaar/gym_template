import type { AuditMetadata } from "@/types/database";

const MAX_METADATA_BYTES = 24_000;

export const capAuditMetadata = (metadata: AuditMetadata): AuditMetadata => {
  const serialized = JSON.stringify(metadata);
  if (serialized.length <= MAX_METADATA_BYTES) {
    return metadata;
  }

  const trimmed: AuditMetadata = { ...metadata };
  if (trimmed.changes && Array.isArray(trimmed.changes)) {
    const changes = trimmed.changes;
    while (JSON.stringify(trimmed).length > MAX_METADATA_BYTES && changes.length > 0) {
      changes.pop();
    }
    trimmed.changes = changes;
    trimmed.truncated = true;
  }

  if (JSON.stringify(trimmed).length > MAX_METADATA_BYTES) {
    return {
      truncated: true,
      note: "Metadata too large; details omitted.",
    };
  }

  return trimmed;
};
