import { createAsyncThunk } from "@reduxjs/toolkit";
import { Branch } from "./state";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

export const addBranch = createAsyncThunk(
    "branch/addBranch",
    async (
        branch: Omit<Branch, "id">,
        { rejectWithValue }
    ) => {
        try {

            const response = await fetchWithAuth('/branch', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(branch),
            });
            console.log(response)
            return response
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBranch = createAsyncThunk(
    "branch/updateBranch",
    async (
        branch: Branch,
        { rejectWithValue }
    ) => {
        try {
            const response = await fetchWithAuth(`/branch/${branch.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(branch),
            });
            return response
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


export const fetchBranch = createAsyncThunk(
    "branch/fetchBranch",
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchWithAuth('/branch');
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


export const deleteBranch = createAsyncThunk(
    "branch/deleteBranch",
    async (branchId: number, { rejectWithValue }) => {
        try {
            const data = await fetchWithAuth(`/branch/${branchId}`, {
                method: "DELETE",
            })
            console.log(data)
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
