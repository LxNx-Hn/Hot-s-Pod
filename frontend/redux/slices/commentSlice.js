import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from "../../src/api/api";

// 댓글 작성
export const createComment = createAsyncThunk('comment/createComment', async (commentData) => {
    const response = await api.post(`/comments/`, commentData, { withCredentials: true });
    return response.data;
});

const commentSlice = createSlice({
    name: 'comment',
    initialState: {
        comments: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createComment.pending, (state) => {
                state.loading = true;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments.push(action.payload);
            })
            .addCase(createComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default commentSlice.reducer;
