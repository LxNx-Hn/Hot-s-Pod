// src/app/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../../../../queries/useMe";

export default function RequireAuth({ children }) {
  const { isLoading, isError } = useMe();
  const location = useLocation();

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 w-full">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg w-full">
          <div className="text-xl font-bold mb-4 text-gray-800 text-center">로그인 확인 중</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </div>
    );
  if (isError)
    return (<Navigate to="/login" replace state={{ from: location }} />);
  return (children);
}
