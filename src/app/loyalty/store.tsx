import { createSlice } from '@reduxjs/toolkit';
import { initialLoyaltyState, initialRedemptionState, STATE } from './state';
import { fetchLoyaltyList, fetchRedemptionHistory } from './actions';

const loyaltySlice = createSlice({
    name: 'loyalty',
    initialState: initialLoyaltyState,
    reducers: {
        setFilter(state, action) {
            state.filter = action.payload;
            const { stampsCollected, branchName, totalVisits } = state.filter;

            state.filteredList = state.list;

            if (stampsCollected !== -1) {
                state.filteredList = state.filteredList?.filter(e => e.stampsCollected >= stampsCollected) || null;
            }
            if (branchName !== null) {
                state.filteredList = state.filteredList?.filter(e => e.branchName === branchName) || null;
            }
            if (totalVisits !== -1) {
                state.filteredList = state.filteredList?.filter(e => e.visitCount >= totalVisits) || null;
            }
            return state;
        },
        clearFilter(state) {
            state.filter = initialLoyaltyState.filter;
            state.filteredList = state.list;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLoyaltyList.pending, (state) => {
                state.state = STATE.LOADING;
            })
            .addCase(fetchLoyaltyList.fulfilled, (state, action) => {
                state.state = STATE.LOADING;
            })
            .addCase(fetchLoyaltyList.rejected, (state) => {
                state.state = STATE.ERROR;
            });
    },
});

const redemptionSlice = createSlice({
    name: 'redemption',
    initialState: initialRedemptionState,
    reducers: {
        filterRedemptionHistory: (state, action) => {
            const customerId = action.payload;
            state.filteredHistory = state.history?.filter(
                (item) => item.customerId === customerId
            ) || null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRedemptionHistory.pending, (state) => {
                state.state = STATE.LOADING;
            })
            .addCase(fetchRedemptionHistory.fulfilled, (state, action) => {
                state.state = STATE.INITIALIZED;
                state.history = action.payload.history;
            })
            .addCase(fetchRedemptionHistory.rejected, (state) => {
                state.state = STATE.ERROR;
            });
    },
});

export const { setFilter, clearFilter } = loyaltySlice.actions;
export const { filterRedemptionHistory } = redemptionSlice.actions;

export const loyaltyReducer = loyaltySlice.reducer;
export const redemptionReducer = redemptionSlice.reducer;

