import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import podReducer from './slices/podSlice';
import chatReducer from './slices/chatSlice';
import commentReducer from './slices/commentSlice';
// import memberReducer from './slices/memberSlice';
// import authReducer from './slices/authSlice';

const store = configureStore({
    reducer: {
        user: userReducer, // user 슬라이스 등록
        pods: podReducer, // pod 슬라이스 등록
        chat: chatReducer, // chat 슬라이스 등록
        comment: commentReducer, // comment 슬라이스 등록
        // members: memberReducer,
        // auth: authReducer, // auth 슬라이스 등록
    },
});

export default store;