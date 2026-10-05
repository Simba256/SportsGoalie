import { cn } from "@/lib/utils";
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card";

interface TestimonialsSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
  dark?: boolean;
  gradientColor?: string;
}

export function TestimonialsSection({
  eyebrow,
  title,
  description,
  testimonials,
  className,
  dark = false,
  gradientColor = 'hsl(var(--background))',
}: TestimonialsSectionProps) {
  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-0",
        className
      )}
    >
      <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          {eyebrow && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[3px] uppercase" style={{ background: 'rgba(55,181,255,0.1)', color: '#37b5ff', border: '1px solid rgba(55,181,255,0.25)' }}>{eyebrow}</span>
          )}
          <h2
            className="max-w-[720px] text-3xl font-black leading-tight sm:text-5xl sm:leading-tight"
            style={dark ? { color: '#ffffff' } : undefined}
          >
            {title}
          </h2>
          <p
            className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl"
            style={dark ? { color: 'rgba(255,255,255,0.55)' } : undefined}
          >
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(4)].map((_, setIndex) =>
                testimonials.map((testimonial, i) => (
                  <TestimonialCard key={`${setIndex}-${i}`} {...testimonial} />
                ))
              )}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/5 sm:block"
            style={{ background: `linear-gradient(to right, ${gradientColor}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/5 sm:block"
            style={{ background: `linear-gradient(to left, ${gradientColor}, transparent)` }}
          />
        </div>
      </div>
    </section>
  );
}
