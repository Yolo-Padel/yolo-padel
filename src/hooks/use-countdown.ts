import { useState, useEffect, useCallback } from "react";

interface CountdownResult {
  timeLeft: string;
  isExpired: boolean;
  totalSeconds: number;
}

/**
 * Custom hook for countdown timer
 * @param targetDate - The target date/time to count down to
 * @returns Object with formatted time left, expiration status, and total seconds
 */
export function useCountdown(targetDate: Date | null): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) {
      return { timeLeft: "", isExpired: true, totalSeconds: 0 };
    }

    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { timeLeft: "Game Started", isExpired: true, totalSeconds: 0 };
    }

    const totalSecondsLeft = Math.floor(difference / 1000);
    const hours = Math.floor(totalSecondsLeft / 3600);
    const minutes = Math.ceil((totalSecondsLeft % 3600) / 60);

    let formattedTime = "";

    if (hours > 0) {
      const hourText = hours === 1 ? "hour" : "hours";
      const minuteText = minutes === 1 ? "minute" : "minutes";
      formattedTime = `${hours} ${hourText} ${minutes} ${minuteText}`;
    } else if (minutes > 0) {
      const minuteText = minutes === 1 ? "minute" : "minutes";
      formattedTime = `${minutes} ${minuteText}`;
    } else {
      formattedTime = "Less than 1 minute";
    }

    return {
      timeLeft: formattedTime,
      isExpired: false,
      totalSeconds: totalSecondsLeft,
    };
  }, [targetDate]);

  useEffect(() => {
    // Calculate initial time
    const initial = calculateTimeLeft();
    setTimeLeft(initial.timeLeft);
    setIsExpired(initial.isExpired);
    setTotalSeconds(initial.totalSeconds);

    // Set up interval to update every second
    const interval = setInterval(() => {
      const result = calculateTimeLeft();
      setTimeLeft(result.timeLeft);
      setIsExpired(result.isExpired);
      setTotalSeconds(result.totalSeconds);

      // Clear interval if expired
      if (result.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup interval on unmount or targetDate change
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  return { timeLeft, isExpired, totalSeconds };
}
