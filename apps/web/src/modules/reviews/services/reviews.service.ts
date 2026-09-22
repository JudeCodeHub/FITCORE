import { apiFetch } from "@/shared/api-client/http";
import type {
  ICreateReviewInput,
  IEligibleReviews,
  IReview,
} from "@/modules/reviews/types/review";

export const reviewsService = {
  getMine() {
    return apiFetch<IReview[]>("/reviews/me");
  },

  getEligible() {
    return apiFetch<IEligibleReviews>("/reviews/eligible");
  },

  create(input: ICreateReviewInput) {
    return apiFetch<IReview>("/reviews", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
