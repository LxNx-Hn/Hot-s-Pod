import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUserAndPods = createAsyncThunk(
  'user/fetchUserAndPods',
  async (_, { rejectWithValue }) => {
    try {
      const userRes = await axios.get("/user/me", { withCredentials: true });
      const podsRes = await axios.get("/pod/", { withCredentials: true });
      return {
        user: userRes.data,
        pods: podsRes.data.content || podsRes.data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Error fetching data');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    userName: '',
    pods: [],
    loading: false,
    error: null,
  },
  reducers: {
    setEmail(state, action) {
      if (state.user) state.user.email = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.userName = action.payload.userName || '';
    },
    clearUser(state) {
      state.user = null;
      state.userName = '';
      state.pods = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAndPods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAndPods.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.userName = action.payload.user?.name || '';
        state.pods = action.payload.pods;
      })
      .addCase(fetchUserAndPods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setEmail, setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;