"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LINE = "rgba(96,205,255,0.1)";

// The same lattice the cells below draw (a 1px line every 64px across and every
// 32px down, a "+" on every second crossing), painted as one background so
// phones and tablets do not carry a 15,000-element DOM for a layer nobody can
// hover. 128x64 tile = 2 cells across, 2 down; the "+" layer is offset 8px so
// its arms sit inside the tile instead of straddling its edge.
const PLUS_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='64' fill='none' stroke='rgba(96,205,255,0.18)' stroke-width='1' stroke-linecap='round'%3E%3Cpath d='M119 49v12M113 55h12'/%3E%3C/svg%3E\")";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  // Hover-lit cells only matter with a mouse; mount them after hydration so the
  // server HTML (and every touch device) gets the cheap pattern instead.
  const [interactive, setInteractive] = React.useState(false);
  React.useEffect(() => {
    setInteractive(window.matchMedia(FINE_POINTER).matches);
  }, []);

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
      {!interactive && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            // 16px = the container's p-4; 9600x3200 = 150 columns x 100 cells
            left: "16px",
            top: "16px",
            width: "9600px",
            height: "3200px",
            backgroundImage: `${PLUS_TILE}, linear-gradient(to right, ${LINE} 1px, transparent 1px), linear-gradient(to bottom, ${LINE} 1px, transparent 1px)`,
            backgroundSize: "128px 64px, 64px 32px, 64px 32px",
            backgroundPosition: "8px 8px, 0 0, 0 0",
          }}
        />
      )}
      {interactive &&
        rows.map((_, i) => (
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
