import { useEffect, useState } from 'react';

export default function RateLimitTimer({ minutes }) {
  const [timeLeft, setTimeLeft] = useState(() => minutes * 60);
  useEffect(() => {
    // reset when minutes prop changes
    setTimeLeft(minutes * 60);
    const initial = minutes * 60;
    if (initial <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // stop at zero and clear the interval
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [minutes]);
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  return (
    <span>
      Time remaining:{' '}
      <b>
        {min}m {sec}s
      </b>
    </span>
  );
}
