interface User {
    full_name: string;
    email_address: string;
    phone_number: string;
    national_id?: string;
    photo_url?: string;
    refresh_token: string;
    access_token: string;
}

interface UserState {
    status: 'LOGGED_OUT' | 'LOADING' | 'LOGGED_IN';
    full_name: string | null;
    email_address: string | null;
    phone_number: string | null;
    national_id?: string | null;
    photo_url?: string | null;
    refresh_token: string | null;
    access_token: string | null;
    error: string | null; // For storing error messages
}


const initialState: UserState = {
    status: 'LOGGED_OUT',
    full_name: null,
    email_address: null,
    phone_number: null,
    national_id: null,
    photo_url: null,
    refresh_token: null,
    access_token: null,
    error: null,
};

