import React, { useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion';

export const InteractiveBackground: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for the flashlight effect
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Parallax effects for blobs (moving opposite to mouse)
  const blobX = useSpring(mouseX, { damping: 50, stiffness: 50 });
  const blobY = useSpring(mouseY, { damping: 50, stiffness: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Dynamic mask for the grid (The Flashlight)
  const maskImage = useMotionTemplate`radial-gradient(400px circle at ${springX}px ${springY}px, black, transparent)`;
  
  // Parallax transforms
  const transform1 = useMotionTemplate`translate(${blobX.get() * -0.05}px, ${blobY.get() * -0.05}px)`;
  const transform2 = useMotionTemplate`translate(${blobX.get() * 0.05}px, ${blobY.get() * 0.05}px)`;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. Base Background Color */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#020617] transition-colors duration-300" />

      {/* 2. Ambient Aurora Blobs (with Parallax) */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <motion.div 
          style={{ transform: transform1 }}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-[100px] opacity-60" 
        />
        <motion.div 
          style={{ transform: transform2 }}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-[100px] opacity-60" 
        />
        <motion.div 
          style={{ x: blobX.get() * 0.02, y: blobY.get() * 0.02 }}
          animate={{ 
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] left-[20%] w-[45vw] h-[45vw] bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-[100px] opacity-50" 
        />
      </div>

      {/* 3. Static Grid (Always slightly visible) */}
      <div 
        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"
      ></div>
      
      {/* 4. Interactive Grid Spotlight */}
      <motion.div
        className="absolute inset-0 z-10 opacity-0 dark:opacity-100 transition-opacity duration-500"
        style={{ 
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:96px_96px] opacity-50"></div>
      </motion.div>

      {/* 5. Mouse Follower Glow (Subtle highlight) */}
      <motion.div
         className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
         style={{
           left: springX,
           top: springY,
         }}
      />
    </div>
  );
};