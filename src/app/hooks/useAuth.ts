import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requireAuth = true) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("emailVerificationToken");
    const expires = localStorage.getItem("sessionExpires");

    const isValid = token && expires && new Date(expires) > new Date();
    setIsAuthenticated(!!isValid);
    setIsLoading(false);

    if (requireAuth && !isValid) {
      router.push("/login");
    }
  }, [requireAuth, router]);

  return { isAuthenticated, isLoading };
}
