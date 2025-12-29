export enum STATE {
    LOADING = 'LOADING',
    ERROR = 'ERROR',
    INITIALIZED = 'INITIALIZED',
}

export interface VatState {
    vat: number | null;
    loading: STATE;
    error: string | null;
}

export const initialVatState: VatState = {
    vat: null,
    loading: STATE.INITIALIZED,
    error: null,
};
