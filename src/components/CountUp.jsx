import React, { useEffect, useRef, useState } from "react";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const formatNumber = (value, decimals) => {
  const fractionDigits = Number.isFinite(decimals)
    ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    : { maximumFractionDigits: 0 };
  try {
    return new Intl.NumberFormat(undefined, fractionDigits).format(value);
  } catch {
    return value.toFixed(decimals || 0);
  }
};

const CountUp = ({
  value = 0,
  duration = 2400,
  decimals,
  prefix = "",
  suffix = "",
  startFrom = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(startFrom || 0);
  const fromRef = useRef(startFrom || 0);
  const toRef = useRef(value || 0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const to = Number.isFinite(Number(value)) ? Number(value) : 0;
    const from = fromRef.current;
    toRef.current = to;
    startTimeRef.current = null;

    const step = (timestamp) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, duration > 0 ? elapsed / duration : 1);
      const eased = easeOutCubic(progress);
      const current = from + (to - from) * eased;
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const inferredDecimals = Number.isFinite(decimals)
    ? decimals
    : Number.isInteger(toRef.current)
    ? 0
    : 1;

  return (
    <span>
      {prefix}
      {formatNumber(displayValue, inferredDecimals)}
      {suffix}
    </span>
  );
};

export default CountUp;
