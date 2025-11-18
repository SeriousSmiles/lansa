import { gsap } from 'gsap';

export const candidatePanelAnimations = {
  // Left panel slide-down transition
  exitLeftPanel: (element: HTMLElement) => {
    return gsap.to(element, {
      y: -80,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in"
    });
  },

  enterLeftPanel: (element: HTMLElement) => {
    return gsap.fromTo(element,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.2
      }
    );
  },

  // Right panel slide-right transition
  exitRightPanel: (element: HTMLElement) => {
    return gsap.to(element, {
      x: 100,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in"
    });
  },

  enterRightPanel: (element: HTMLElement) => {
    return gsap.fromTo(element,
      { x: -100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.25
      }
    );
  },

  // Staggered text-in animations for left panel
  staggerLeftPanelElements: (container: HTMLElement) => {
    const avatar = container.querySelector('[data-animate="avatar"]');
    const name = container.querySelector('[data-animate="name"]');
    const title = container.querySelector('[data-animate="title"]');
    const skills = container.querySelectorAll('[data-animate="skill"]');

    const tl = gsap.timeline({ delay: 0.3 });

    if (avatar) {
      tl.fromTo(avatar,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
        0
      );
    }

    if (name) {
      tl.fromTo(name,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        0.1
      );
    }

    if (title) {
      tl.fromTo(title,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        0.15
      );
    }

    if (skills.length > 0) {
      tl.fromTo(skills,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" },
        0.2
      );
    }

    return tl;
  },

  // Staggered animations for right panel sections
  staggerRightPanelSections: (container: HTMLElement) => {
    const about = container.querySelector('[data-animate="about"]');
    const experiences = container.querySelectorAll('[data-animate="experience"]');
    const education = container.querySelector('[data-animate="education"]');
    const achievements = container.querySelectorAll('[data-animate="achievement"]');

    const tl = gsap.timeline({ delay: 0.3 });

    if (about) {
      tl.fromTo(about,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
        0.3
      );
    }

    if (experiences.length > 0) {
      tl.fromTo(experiences,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" },
        0.4
      );
    }

    if (education) {
      tl.fromTo(education,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
        0.6
      );
    }

    if (achievements.length > 0) {
      tl.fromTo(achievements,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.7)" },
        0.7
      );
    }

    return tl;
  },

  // Button press micro-interaction
  buttonPress: (button: HTMLElement) => {
    const tl = gsap.timeline();
    tl.to(button, { scale: 0.92, duration: 0.1 })
      .to(button, { scale: 1, duration: 0.2, ease: "back.out(1.7)" });
    return tl;
  },

  // Kill all animations on an element
  killAnimations: (element: HTMLElement) => {
    gsap.killTweensOf(element);
    gsap.set(element, { clearProps: "all" });
  }
};
