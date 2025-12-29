import { configureStore } from '@reduxjs/toolkit';
import { loyaltyReducer } from './app/loyalty/store';
import { redemptionReducer } from './app/loyalty/store';
import { vatReducer } from './app/settings/vat/store';
import { branchReducer } from './app/settings/branch/store';
import userReducer from './app/login/store';
import { reviewReducer } from './app/review/store';

const store = configureStore({
    reducer: {
        loyalty: loyaltyReducer,
        redemption: redemptionReducer,
        vat: vatReducer,
        branch: branchReducer, // <-- Register branch reducer here
        user: userReducer,
        review: reviewReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

