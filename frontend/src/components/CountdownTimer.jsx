import { useEffect, useState } from "react";

const CountdownTimer = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000);
    const difference = endTime - now;

    if (difference <= 0) return null;

    const hours = Math.floor(difference / 3600);
    const minutes = Math.floor((difference % 3600) / 60);
    const seconds = difference % 60;

    return { hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) return <span className="expired">⏱️ Finalizada</span>;

  return (
    <span className="countdown">
      ⏳ {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
};

export default CountdownTimer;
