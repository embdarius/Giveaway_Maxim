"use client";

import { useEffect, useState } from "react";
import { campaign, countdownParts } from "@/lib/campaign";

export function Countdown({
  serverNow,
  onClose,
}: {
  serverNow: number;
  onClose: () => void;
}) {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    // Elapsed monotonic time keeps the countdown anchored to server time, not the visitor's clock.
    const start = performance.now();
    const tick = () => {
      const current = serverNow + (performance.now() - start);
      setNow(current);
      if (current >= Date.parse(campaign.closesAt)) onClose();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [serverNow, onClose]);
  const parts = countdownParts(now);
  const labels = {
    days: "zile",
    hours: "ore",
    minutes: "minute",
    seconds: "secunde",
  };
  return (
    <div className="countdown-wrap">
      <div className="countdown-caption">
        <span className="live-dot" aria-hidden="true" />
        Încă puțin până la o nouă poveste
      </div>
      <div
        className="countdown"
        role="timer"
        aria-label="Timp rămas până la închiderea înscrierilor"
      >
        {Object.entries(parts).map(([key, value]) => (
          <div className="countdown-unit" key={key}>
            <span className="countdown-number">
              {String(value).padStart(2, "0")}
            </span>
            <span className="countdown-label">
              {labels[key as keyof typeof labels]}
            </span>
          </div>
        ))}
      </div>
      <p className="deadline">Înscrieri până pe {campaign.deadlineLabel}.</p>
    </div>
  );
}
