import { useEffect, useState } from 'react';

export default function RateLimitTimer({ minutes }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);
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
