import { createGateway } from "ai";
import { hasAiGateway, resolveBrandReviewModel } from "@/lib/env";

const requireGateway = () => {
  if (!hasAiGateway) {
    throw new Error("AI Gateway is not configured");
  }
  return createGateway();
};

export const getReviewModel = () => requireGateway()(resolveBrandReviewModel());
