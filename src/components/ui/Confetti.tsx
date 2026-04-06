'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];
const SHAPES = ['square', 'circle', 'rect'];

export default function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,          // % from left
      delay: Math.random() * 0.6,
      duration: 1.4 + Math.random() * 1.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 720 - 360,
      drift: (Math.random() - 0.5) * 120,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.shape === 'rect' ? p.size * 1.8 : p.size,
            height: p.shape === 'rect' ? p.size * 0.5 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? 2 : 1,
            background: p.color,
          }}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: '110vh',
            x: p.drift,
            opacity: [1, 1, 0.8, 0],
            rotate: p.rotate,
            scale: [1, 1, 0.7],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.4, 0, 1, 1],
          }}
        />
      ))}
    </div>
  );
}
