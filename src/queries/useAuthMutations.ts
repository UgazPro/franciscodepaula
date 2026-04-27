import { useMutation } from "@tanstack/react-query";
import { authLogin } from "@/services/auth/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router";

export function useLoginMutation() {
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authLogin,
    onSuccess: (response) => {
      if (response.success) {
        localStorage.setItem("token", response.token);
        setToken(response.token);
        navigate("/admin");
      } else {
        throw new Error(response.message);
      }
    },
  });
}
