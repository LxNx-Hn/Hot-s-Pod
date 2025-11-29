// src/app/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../../../../queries/useMe";

export default function RequireAuth({ children }) {
  const { isLoading, isError } = useMe();
  const location = useLocation();

  if (isLoading)
    return (
      <>
      </>
    );
  if (isError)
    return (<Navigate to="/login" replace state={{ from: location }} />);
  return (children);
}
