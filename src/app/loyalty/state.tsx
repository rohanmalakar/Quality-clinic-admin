export enum STATE {
    LOADING = 'LOADING',
    ERROR = 'ERROR',
    INITIALIZED = 'INITIALIZED',
}

export interface Loyalty {
    id: string;
    name: string;
    visitCount: number;
    stampsCollected: number;
    branchName: string;
}

export interface RedemptionHistory {
    bookingId: string;
    customerId: string;
    date: string;
}

export interface LoyaltyState {
    state: STATE;
    list: Loyalty[] | null;
    filteredList: Loyalty[] | null;
    filter: {
        branchName: string | null;
        totalVisits: number;
        stampsCollected: number;
    };
}

export interface RedemptionState {
    state: STATE;
    history: RedemptionHistory[] | null;
    filteredHistory: RedemptionHistory[] | null;
}

export const initialLoyaltyState: LoyaltyState = {
    state: STATE.INITIALIZED,
    list: null,
    filteredList: null,
    filter: {
        branchName: null,
        totalVisits: -1,
        stampsCollected: -1,
    },
};

export const initialRedemptionState: RedemptionState = {
    state: STATE.INITIALIZED,
    history: null,
    filteredHistory: null,
};

