export enum STATE {
    LOADING = 'LOADING',
    ERROR = 'ERROR',
    INITIALIZED = 'INITIALIZED',
}

export interface Branch {
    id: number;
    name_ar: string;
    name_en: string;
    city_en: string;
    city_ar: string;
    latitude: number;
    longitude: number;
}

export interface BranchState {
    branches: Branch[];
    loading: STATE;
    error: string | null;
}

export const initialBranchState: BranchState = {
    branches: [],
    loading: STATE.INITIALIZED,
    error: null,
};

