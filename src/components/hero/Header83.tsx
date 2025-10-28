"use client";

import { useRef } from "react";
import { Button } from "@relume_io/relume-ui";
import type { ButtonProps } from "@relume_io/relume-ui";
import clsx from "clsx";
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent } from "framer-motion";

type ImageProps = {
  src: string;
  alt?: string;
};

type Props = {
  heading: string;
  description: string;
  buttons: ButtonProps[];
  images: ImageProps[];
};

export type Header83Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Header83 = (props: Header83Props) => {
  const { heading, description, buttons, images } = {
    ...Header83Defaults,
    ...props,
  };

  const containerRef = useRef<HTMLElement | null>(null);
  
  const sectionProgress = useMotionValue(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = Math.max(rect.height - window.innerHeight, 1);
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = scrolled / total;
    sectionProgress.set(p);
  });
  
  const opacityHeading = useTransform(sectionProgress, [0, 0.15], [1, 0]);
  const opacityDescription = useTransform(sectionProgress, [0.05, 0.2], [1, 0]);
  const opacityButtons = useTransform(sectionProgress, [0.1, 0.25], [1, 0]);
  const opacityOverlay = useTransform(sectionProgress, [0, 0.4], [1, 0]);
  const scale = useTransform(sectionProgress, [0, 1], [3.2, 1]);

  if (import.meta.env.DEV) {
    useMotionValueEvent(sectionProgress, "change", (v) => {
      // Debug: observe section progress especially on mobile
      console.debug("Header83 sectionProgress:", Number(v).toFixed(3));
    });
  }

  return (
    <section ref={containerRef} id="relume" className="relative h-screen md:h-[300vh]">
      <div className="md:sticky top-0 h-[100svh] overflow-hidden" style={{ height: '100dvh' }}>
        <div className="flex h-full items-center justify-center">
          <div className="px-[5%] py-16 md:py-24 lg:py-28">
            <div className="relative z-10 mx-auto max-w-lg text-center">
              <h1 
                className="mb-5 text-6xl font-bold font-urbanist text-white md:mb-6 md:text-9xl lg:text-10xl md:opacity-100"
                style={{ opacity: window.innerWidth >= 768 ? opacityHeading.get() : 1 }}
              >
                {heading}
              </h1>
              <p 
                className="text-white font-public-sans md:text-md md:opacity-100"
                style={{ opacity: window.innerWidth >= 768 ? opacityDescription.get() : 1 }}
              >
                {description}
              </p>
              <div 
                className="mt-6 flex items-center justify-center gap-x-4 md:mt-8 md:opacity-100"
                style={{ opacity: window.innerWidth >= 768 ? opacityButtons.get() : 1 }}
              >
                {buttons.map((button, index) => (
                  <Button key={index} {...button}>
                    {button.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ 
              opacity: window.innerWidth >= 768 ? opacityOverlay.get() : 0.6,
              background: 'linear-gradient(135deg, hsl(215 85% 55% / 0.6), hsl(0 0% 0% / 0.7))'
            }}
          />
          <div
            style={{ scale: window.innerWidth >= 768 ? scale.get() : 1 }}
            className="grid size-full auto-cols-fr grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3"
          >
            {images.map((image, index) => (
              <div
                key={index}
                className={clsx(
                  "relative",
                  [0, 2, 3, 5, 6, 8].indexOf(index) !== -1 && "hidden md:block",
                )}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Header83Defaults: Props = {
  heading: "Medium length hero heading goes here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  buttons: [{ title: "Button" }, { title: "Button", variant: "secondary-alt" }],
  images: [
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 1",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 2",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 3",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 4",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 5",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 6",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 7",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 8",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 9",
    },
  ],
};
