export enum STATE {
    LOADING = 'LOADING',
    ERROR = 'ERROR',
    INITIALIZED = 'INITIALIZED',
}

export interface Review {
    id: number;
    user_name: string;
    user_photo_url: string;
    booking_type: string;
    name_en: string;
    review: string;
    created_timestamp: Date;
    rating: number;
}

export interface comment {
    id: number;
    review_id: number;
    comment: string;
}

export interface ReviewState {
    reviews: Review[];
    state: STATE;
    error: string | null;
}

export const initialReviewState: ReviewState = {
    reviews: [],
    state: STATE.LOADING,
    error: null,
};