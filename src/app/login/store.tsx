import { createSlice } from '@reduxjs/toolkit';

const initialState: UserState = {
  status: 'LOADING', // LOADING, LOGGED_IN, LOGGED_OUT
  full_name: null,
  email_address: null,
  phone_number: null,
  national_id: null,
  photo_url: null,
  refresh_token: null,
  access_token: null,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const {
        full_name,
        email_address,
        phone_number,
        national_id,
        photo_url,
        refresh_token,
        access_token,
      } = action.payload;
      state.status = 'LOGGED_IN';
      state.full_name = full_name;
      state.email_address = email_address;
      state.phone_number = phone_number;
      state.national_id = national_id;
      state.photo_url = photo_url;
      state.refresh_token = refresh_token;
      state.access_token = access_token;

      // Store user data in local storage
      localStorage.setItem('user', JSON.stringify(action.payload));
      localStorage.setItem('x-access-token', access_token);
    },

    logout: (state) => {
      state.status = 'LOGGED_OUT';
      state.full_name = null;
      state.email_address = null;
      state.phone_number = null;
      state.national_id = null;
      state.photo_url = null;
      state.refresh_token = null;
      state.access_token = null;

      // Clear user data from local storage
      localStorage.removeItem('user');
      localStorage.removeItem('x-access-token');
    },

    checkAuthenticated: (state) => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (isTokenExpired(user.access_token)) {
          state.status = 'LOGGED_OUT';
          localStorage.removeItem('user');
          localStorage.removeItem('x-access-token');
          return;
        }
        state.status = 'LOGGED_IN';
        state.full_name = user.full_name;
        state.email_address = user.email_address;
        state.phone_number = user.phone_number;
        state.national_id = user.national_id;
        state.photo_url = user.photo_url;
        state.refresh_token = user.refresh_token;
        state.access_token = user.access_token;
      } else {
        state.status = 'LOGGED_OUT';
      }
    },
    setLoading:(state) =>{
      state.status = 'LOADING'
    }
  },
});

function isTokenExpired(token: string) {
  const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
  return (Math.floor((new Date()).getTime() / 1000)) >= expiry;
}

export const { login, logout, checkAuthenticated, setLoading } = userSlice.actions;
export default userSlice.reducer;
