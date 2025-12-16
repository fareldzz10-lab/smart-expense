import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';
import { usePrivacy } from '../context/PrivacyContext';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  isCurrency?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, prefix = '', isCurrency = true }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const { isPrivacyMode } = usePrivacy();
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: 2
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, value, isInView]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        if (isPrivacyMode) {
          ref.current.textContent = '•••••••';
          ref.current.className = 'font-mono tracking-widest opacity-50 blur-[2px] select-none';
        } else {
          ref.current.className = 'tabular-nums';
          if (isCurrency) {
            ref.current.textContent = formatCurrency(latest);
          } else {
            ref.current.textContent = Math.round(latest).toString();
          }
        }
      }
    });
  }, [springValue, isCurrency, isPrivacyMode]);

  return <span ref={ref} className="tabular-nums" />;
};