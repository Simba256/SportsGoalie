"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);
  
  const colors = [
    "rgba(0,242,255,0.35)",
    "rgba(55,181,255,0.3)",
    "rgba(14,165,233,0.35)",
    "rgba(96,205,255,0.28)",
    "rgba(56,189,248,0.32)",
    "rgba(167,139,250,0.28)",
    "rgba(52,211,153,0.25)",
    "rgba(30,94,196,0.45)",
    "rgba(99,102,241,0.3)",
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        "absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0",
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          style={{ width: "64px", height: "32px", borderLeft: "1px solid rgba(96,205,255,0.1)", position: "relative" }}
        >
          {cols.map((_, j) => (
            <motion.div
              whileHover={{ backgroundColor: getRandomColor(), transition: { duration: 0 } }}
              animate={{ transition: { duration: 2 } }}
              key={`col` + j}
              style={{ width: "64px", height: "32px", borderRight: "1px solid rgba(96,205,255,0.1)", borderTop: "1px solid rgba(96,205,255,0.1)", position: "relative" }}
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="rgba(96,205,255,0.18)"
                  className="absolute h-6 w-10 -top-[14px] -left-[22px] stroke-[1px] pointer-events-none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);