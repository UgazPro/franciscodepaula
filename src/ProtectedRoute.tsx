import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {

  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        {/* <SpinnerComponent /> */}
      </div>
    );
  }

  return <>{children}</>;
}