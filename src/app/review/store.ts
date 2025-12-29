import { createSlice } from "@reduxjs/toolkit";
import { initialReviewState, STATE } from "./state";

const reviewSlice = createSlice({
    name: "review",
    initialState: initialReviewState,
    reducers: {
        setReviews: (state, action) => {
            state.state = STATE.INITIALIZED;
            state.reviews = action.payload;
        },
        addReview: (state, action) => {
            state.state = STATE.INITIALIZED;
            state.reviews.push(action.payload);
        },
        setError: (state, action) => {
            state.state = STATE.ERROR;
            state.error = action.payload;
        }
    },
});

export const reviewReducer = reviewSlice.reducer;
export const { setReviews, setError, addReview } = reviewSlice.actions;
