import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube, FaReddit } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface Footer7Props {
  logo?: {
    url: string;
    src?: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Platform",
    links: [
      { name: "Goaltending: 7 Pillars", href: "#features" },
      { name: "Test Your Knowledge", href: "#features" },
      { name: "Performance Analytics", href: "#features" },
      { name: "Dashboard Command Center", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#about" },
      { name: "Coaches", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { name: "info@smartergoalie.com", href: "mailto:info@smartergoalie.com" },
      { name: "416", href: "tel:416" },
      { name: "Help Center", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
  { icon: <FaXTwitter className="size-5" />, href: "#", label: "X" },
  { icon: <FaTiktok className="size-5" />, href: "#", label: "TikTok" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaYoutube className="size-5" />, href: "#", label: "YouTube" },
  { icon: <FaReddit className="size-5" />, href: "#", label: "Reddit" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export const Footer7 = ({
  logo = {
    url: "#",
    src: "/logo.png",
    alt: "Smarter Goalie logo",
    title: "SMARTER-GOALIE",
  },
  sections = defaultSections,
  description =
    "Train the Mind. Understand the mechanics. Think Smart - Play Smarter. Build 7 Pillars of Intelligent Goaltending through cognitive awareness, technical precision, and proven positional systems.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2026 Smarter Goalie. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url}>
                {logo.src ? (
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-8"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center font-bold text-white">
                    SG
                  </div>
                )}
              </a>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                {logo.title}
              </h2>
            </div>
            <p className="max-w-[70%] text-sm text-zinc-300">
              {description}
            </p>
            <ul className="flex items-center space-x-6 text-zinc-300">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-red-300 transition-colors">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="space-y-3 text-sm text-zinc-300">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-blue-300 transition-colors"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 py-8 text-xs font-medium text-zinc-400 md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-red-300 transition-colors">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

