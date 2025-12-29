import { createSlice } from "@reduxjs/toolkit";
import { fetchVat, updateVat } from "./actions";
import { VatState, initialVatState, STATE } from "./state";

const vatSlice = createSlice({
    name: "vat",
    initialState: initialVatState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch VAT
        builder.addCase(fetchVat.pending, (state) => {
            state.loading = STATE.LOADING;
            state.error = null;
        });
        builder.addCase(fetchVat.fulfilled, (state, action) => {
            state.loading = STATE.INITIALIZED;
            state.vat = action.payload;
        });
        builder.addCase(fetchVat.rejected, (state, action) => {
            state.loading = STATE.ERROR;
            state.error = action.payload as string;
        });

        // Update VAT
        builder.addCase(updateVat.pending, (state) => {
            state.loading = STATE.LOADING;
            state.error = null;
        });
        builder.addCase(updateVat.fulfilled, (state, action) => {
            state.loading = STATE.INITIALIZED;
            state.vat = action.payload;
        });
        builder.addCase(updateVat.rejected, (state, action) => {
            state.loading = STATE.ERROR;
            state.error = action.payload as string;
        });
    },
});

export const vatReducer = vatSlice.reducer;

