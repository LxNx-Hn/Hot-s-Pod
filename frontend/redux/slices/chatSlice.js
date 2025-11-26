import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// POD 채팅 메시지 조회
export const fetchChatMessages = createAsyncThunk('chat/fetchMessages', async (podId) => {
    const response = await axios.get(`${API_BASE}/chat/pod/${podId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    return response.data;
});

// 채팅 메시지 전송
export const sendChatMessage = createAsyncThunk('chat/sendMessage', async (messageData) => {
    const response = await axios.post(`${API_BASE}/chat/`, messageData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
});

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        messages: [],
        loading: false,
        error: null
    },
    reducers: {
        clearMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchChatMessages
            .addCase(fetchChatMessages.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchChatMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchChatMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // sendChatMessage
            .addCase(sendChatMessage.fulfilled, (state, action) => {
                state.messages.push(action.payload);
            });
    }
});

export const { clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
