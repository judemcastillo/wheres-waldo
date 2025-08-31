import { useEffect, useState } from "react";

export function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, "0"); // centiseconds
  return `${mm}:${ss}.${cs}`;
}

export default function Timer({ startAt, running, className }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!running || !startAt) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running, startAt]);

  const elapsed = startAt ? Math.max(0, now - startAt) : 0;
  return <span className={className}>{formatMs(elapsed)}</span>;
}
