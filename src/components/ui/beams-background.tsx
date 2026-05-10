"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
    /** [minHue, maxHue] — default [195, 215] matches the site's blue palette */
    hueRange?: [number, number];
}

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

function createBeam(width: number, height: number, hueRange: [number, number]): Beam {
    const [hMin, hMax] = hueRange;
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.16,
        hue: hMin + Math.random() * (hMax - hMin),
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

export function BeamsBackground({
    className,
    children,
    intensity = "strong",
    hueRange = [195, 215],
}: AnimatedGradientBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const isVisibleRef = useRef(true);
    const BEAM_COUNT = 15;

    const opacityMap = {
        subtle: 0.6,
        medium: 0.75,
        strong: 0.9,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const safeCtx: CanvasRenderingContext2D = ctx;

        // Size canvas to container, cap DPR at 1.5 to reduce pixel workload
        const updateCanvasSize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = container.offsetWidth;
            const h = container.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);

            beamsRef.current = Array.from({ length: BEAM_COUNT }, () =>
                createBeam(w, h, hueRange)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        // Pause RAF when hero scrolls off screen
        const observer = new IntersectionObserver(
            ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
            { threshold: 0 }
        );
        observer.observe(container);

        function resetBeam(beam: Beam, index: number) {
            const w = container!.offsetWidth;
            const h = container!.offsetHeight;
            const column = index % 3;
            const spacing = w / 3;
            beam.y = h + 100;
            beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 80 + Math.random() * 80;
            beam.speed = 0.4 + Math.random() * 0.4;
            beam.hue = hueRange[0] + (index / BEAM_COUNT) * (hueRange[1] - hueRange[0]);
            beam.opacity = 0.18 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam(c: CanvasRenderingContext2D, beam: Beam) {
            const ctx = c;
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
            gradient.addColorStop(0,   `hsla(${beam.hue}, 85%, 65%, 0)`);
            gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
            gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
            gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
            gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
            gradient.addColorStop(1,   `hsla(${beam.hue}, 85%, 65%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            animationFrameRef.current = requestAnimationFrame(animate);

            // Skip drawing entirely when not in viewport
            if (!isVisibleRef.current) return;

            const w = container!.offsetWidth;
            const h = container!.offsetHeight;
            safeCtx.clearRect(0, 0, w, h);

            // No ctx.filter here — CSS blur on the canvas element handles it
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;
                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index);
                }
                drawBeam(safeCtx, beam);
            });
        }

        animate();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            observer.disconnect();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity, hueRange]);

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full overflow-hidden", className)}
            style={{ background: 'linear-gradient(145deg, #0d1b3a 0%, #050b16 100%)' }}
        >
            {/* CSS blur is GPU-composited; ctx.filter was software-only */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                style={{ filter: "blur(20px)", willChange: "transform" }}
            />

            {/* Subtle dark vignette to keep text readable */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,11,22,0.55) 100%)' }} />

            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    );
}
