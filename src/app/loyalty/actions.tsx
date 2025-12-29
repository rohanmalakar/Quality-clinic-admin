import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLoyaltyList = createAsyncThunk(
    'loyalty/fetchLoyaltyList',
    async (_, { rejectWithValue }) => {
        try {

            const response = await fetchWithAuth('/redeem/user_list');
            return response
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRedemptionHistory = createAsyncThunk(
    'redemption/fetchRedemptionHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth('/redeem/history');
            return response
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

