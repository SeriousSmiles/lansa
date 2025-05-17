
import { gsap } from 'gsap';
import { toast } from 'sonner';

// Helper function to create staggered toast animations for onboarding
export const runOnboardingSequence = () => {
  // Clear any existing toasts
  document.querySelectorAll('[role="status"]').forEach(el => el.remove());
  
  // Show first onboarding step
  setTimeout(() => {
    toast("Welcome to Your Profile Page!", {
      description: "Click the 'Change Theme' button to customize your profile's color theme.",
      duration: 7000,
      className: "onboarding-toast theme-button-tip",
    });

    // Animate the first toast
    const firstToastElement = document.querySelector('.theme-button-tip');
    if (firstToastElement) {
      gsap.from(firstToastElement, { 
        opacity: 0, 
        y: 20, 
        duration: 0.6, 
        ease: "power2.out"
      });
      
      // Highlight the theme button
      const themeButton = document.querySelector('.change-theme-button');
      if (themeButton) {
        gsap.to(themeButton, { 
          boxShadow: "0 0 0 4px rgba(255,107,74,0.5)", 
          duration: 0.5,
          repeat: 3,
          yoyo: true
        });
      }
    }
    
    // Show second step
    setTimeout(() => {
      toast("Customize Your Highlights", {
        description: "Click the 'Change Highlights' button to set your accent colors.",
        duration: 7000,
        className: "onboarding-toast highlight-button-tip",
      });
      
      // Animate the second toast
      const secondToastElement = document.querySelector('.highlight-button-tip');
      if (secondToastElement) {
        gsap.from(secondToastElement, { 
          opacity: 0, 
          y: 20, 
          duration: 0.6, 
          delay: 0.2, 
          ease: "power2.out" 
        });
        
        // Highlight the highlights button
        const highlightsButton = document.querySelector('.change-highlights-button');
        if (highlightsButton) {
          gsap.to(highlightsButton, { 
            boxShadow: "0 0 0 4px rgba(255,107,74,0.5)", 
            duration: 0.5,
            delay: 0.2,
            repeat: 3,
            yoyo: true
          });
        }
      }
      
      // Show final step
      setTimeout(() => {
        toast("Share Your Profile", {
          description: "Use the 'Share Profile' button to generate a link to your public profile.",
          duration: 7000,
          className: "onboarding-toast share-button-tip",
        });
        
        // Animate the third toast
        const thirdToastElement = document.querySelector('.share-button-tip');
        if (thirdToastElement) {
          gsap.from(thirdToastElement, { 
            opacity: 0, 
            y: 20, 
            duration: 0.6, 
            delay: 0.4, 
            ease: "power2.out" 
          });
          
          // Highlight the share button
          const shareButton = document.querySelector('.share-profile-button');
          if (shareButton) {
            gsap.to(shareButton, { 
              boxShadow: "0 0 0 4px rgba(255,107,74,0.5)", 
              duration: 0.5,
              delay: 0.4,
              repeat: 3,
              yoyo: true
            });
          }
        }
      }, 8000);
    }, 8000);
  }, 500);
};

// Function to animate guide button entrance
export const animateGuideButtonEntrance = (buttonRef: HTMLElement | null) => {
  if (!buttonRef) return;

  gsap.from(buttonRef, {
    scale: 0,
    opacity: 0,
    rotation: 180,
    duration: 1,
    ease: "elastic.out(1, 0.5)",
    delay: 1
  });
};
