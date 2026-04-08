import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

interface HeroSectionProps {
  className?: string;
  logo?: {
    url: string;
    alt: string;
    text?: string;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  backgroundImage: string;
  contactInfo?: {
    website: string;
    phone: string;
    email: string;
  };
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, logo, slogan, title, subtitle, callToAction, secondaryAction, backgroundImage }, ref) => {

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.12,
          delayChildren: 0.3,
        },
      },
    };

    const itemVariants = {
      hidden: { y: 30, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.4, 0.25, 1],
        },
      },
    };

    return (
      <motion.section
        ref={ref}
        className={cn(
          "relative flex w-full flex-col overflow-hidden bg-white text-gray-900 md:flex-row min-h-screen",
          className
        )}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Side: Content */}
        <div className="relative flex w-full flex-col justify-center p-8 pt-32 pb-16 md:w-[55%] md:px-12 lg:px-16 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-20 -left-20 w-72 h-72 bg-red-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-32 right-0 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl"></div>

            {logo && (
              <motion.header className="mb-8 relative z-10" variants={itemVariants}>
                  <div className="flex items-center">
                      <img src={logo.url} alt={logo.alt} className="mr-3 h-8" />
                      <div>
                          {logo.text && <p className="text-lg font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">{logo.text}</p>}
                      </div>
                  </div>
              </motion.header>
            )}

            <motion.main variants={containerVariants} className="relative z-10">
                {/* Title */}
                <motion.h1
                  className="text-4xl font-extrabold leading-[1.05] tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
                  variants={itemVariants}
                >
                    {title}
                </motion.h1>

                {/* Slogan */}
                {slogan && (
                  <motion.p className="mt-6 text-sm md:text-base font-medium tracking-wide text-gray-400 uppercase" variants={itemVariants}>
                      {slogan}
                  </motion.p>
                )}

                {/* Subtitle */}
                <motion.p
                  className="mt-8 mb-12 max-w-lg text-[15px] md:text-base text-gray-500 leading-[1.85]"
                  variants={itemVariants}
                >
                    {subtitle}
                </motion.p>

                {/* Buttons */}
                <motion.div className="flex flex-col sm:flex-row gap-5" variants={itemVariants}>
                    <a
                      href={callToAction.href}
                      onClick={callToAction.onClick}
                      className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3.5 rounded-full hover:shadow-xl hover:shadow-red-500/25 hover:scale-105 transition-all duration-300 font-semibold text-sm tracking-wide"
                    >
                        {callToAction.text}
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </a>
                    {secondaryAction && (
                      <a
                        href={secondaryAction.href}
                        onClick={secondaryAction.onClick}
                        className="group inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-8 py-3.5 rounded-full hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:scale-105 transition-all duration-300 font-semibold text-sm tracking-wide"
                      >
                          {secondaryAction.text}
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </a>
                    )}
                </motion.div>

            </motion.main>
        </div>

        {/* Right Side: Image with Clip Path Animation */}
        <motion.div
          className="relative w-full min-h-[400px] bg-cover bg-center md:w-[45%] md:min-h-full"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
          initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          animate={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
          transition={{ duration: 1.2, ease: "circOut" }}
        >
          {/* Overlay gradient on image for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </motion.div>
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
