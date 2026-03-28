import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useUser() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("itr_user");
    if (!stored) {
      router.push("/login");
    } else {
      setUser(JSON.parse(stored));
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("itr_user");
    router.push("/login");
  }

  return { user, logout };
}
