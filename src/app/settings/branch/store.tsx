import { createSlice } from "@reduxjs/toolkit";
import { addBranch, deleteBranch, fetchBranch, updateBranch } from "./actions";
import { BranchState, initialBranchState, STATE } from "./state";

const branchSlice = createSlice({
    name: "branch",
    initialState: initialBranchState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBranch.pending, (state) => {
                state.loading = STATE.LOADING;
                state.error = null;
            })
            .addCase(fetchBranch.fulfilled, (state, action) => {
                state.loading = STATE.INITIALIZED;
                state.branches = action.payload;
            })
            .addCase(fetchBranch.rejected, (state, action) => {
                state.loading = STATE.ERROR;
                state.error = action.payload as string;
            });

        builder
            .addCase(addBranch.fulfilled, (state, action) => {
                state.branches.push(action.payload);
            })
            .addCase(addBranch.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        builder
            .addCase(updateBranch.fulfilled, (state, action) => {
                const index = state.branches.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) state.branches[index] = action.payload;
            })
            .addCase(updateBranch.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteBranch.fulfilled, (state, action) => {
                state.branches = state.branches.filter((b) => b.id !== action.payload);
            })
            .addCase(deleteBranch.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = branchSlice.actions;
export const branchReducer = branchSlice.reducer;

