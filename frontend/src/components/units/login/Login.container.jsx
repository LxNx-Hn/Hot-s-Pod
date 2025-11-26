import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginUI from "./Login.presenter.jsx";
import { useMe } from "../../../queries/useMe";

export default function Login() {
    const navigate = useNavigate();
    const { data: userData, isLoading } = useMe();

    useEffect(() => {
        // 이미 로그인되어 있으면 메인 페이지로 이동
        if (userData && !isLoading) {
            navigate("/", { replace: true });
        }
    }, [userData, isLoading, navigate]);

    // 로그인 확인 중에는 로딩 표시
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="text-xl font-bold mb-4 text-gray-800">로그인 확인 중</div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                </div>
            </div>
        );
    }
    
    return (
        <LoginUI/>
    );
}