import { useEffect, useState } from "react";
import { getLoginStreak } from "../utils/storageUtils";

export const useLoginStreak = () => {
  const [loginStreak, setLoginStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const streak = await getLoginStreak();
        setLoginStreak(streak);
      } catch (error) {
        console.error("Failed to fetch login streak:", error);
        setLoginStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  return {
    loginStreak,
    loading,
    refetch: () => {
      setLoading(true);
      getLoginStreak()
        .then(setLoginStreak)
        .finally(() => setLoading(false));
    },
  };
};
