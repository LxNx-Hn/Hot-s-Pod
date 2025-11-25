import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// POD 목록 조회
export const fetchPods = createAsyncThunk('pods/fetchPods', async () => {
    const response = await axios.get(`${API_BASE}/pods/`, { withCredentials: true });
    return response.data;
});

// POD 생성
export const createPod = createAsyncThunk('pods/createPod', async (podData) => {
    const response = await axios.post(`${API_BASE}/pods/`, podData, { withCredentials: true });
    return response.data;
});

const podSlice = createSlice({
    name: 'pods',
    initialState: {
        pods: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchPods
            .addCase(fetchPods.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPods.fulfilled, (state, action) => {
                state.loading = false;
                state.pods = action.payload;
            })
            .addCase(fetchPods.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // createPod
            .addCase(createPod.fulfilled, (state, action) => {
                state.pods.push(action.payload);
            });
    }
});

export default podSlice.reducer;
