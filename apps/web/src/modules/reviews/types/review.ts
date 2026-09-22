export interface IRating {
  average: number | null;
  count: number;
}

export interface IReview {
  id: string;
  userId: string;
  bookingId: string | null;
  ptSessionId: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  booking: { class: { name: string } } | null;
  ptSession: { trainer: { name: string } } | null;
}

export interface IEligibleClass {
  bookingId: string;
  className: string;
  trainerName: string;
  endTime: string;
}

export interface IEligiblePtSession {
  ptSessionId: string;
  trainerName: string;
  endTime: string;
}

export interface IEligibleReviews {
  classes: IEligibleClass[];
  ptSessions: IEligiblePtSession[];
}

export interface ICreateReviewInput {
  bookingId?: string;
  ptSessionId?: string;
  rating: number;
  comment?: string;
}
