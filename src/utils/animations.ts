// Framer Motion animation variants

// Fade-in animation
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    } 
  }
};

// Fade-in with slight upward movement
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 15 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Stagger children animations (for lists)
export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.1,
      ease: "easeOut"
    }
  }
};

// Individual item animations for staggered lists
export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Container variants for layout sections
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Card hover animation
export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { 
    duration: 0.2 
  }
};

// Button hover animation
export const buttonHover = {
  scale: 1.05,
  transition: { 
    duration: 0.2
  }
};

// Page transition animation
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// Slide-in animation (subtle)
export const slideIn = {
  hidden: { 
    opacity: 0, 
    x: -10 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Progress indicator animation
export const progressAnimation = {
  hidden: { 
    scaleX: 0,
    originX: 0
  },
  visible: { 
    scaleX: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Icon animation (subtle pulse)
export const iconAnimation = {
  hidden: { 
    scale: 0.8,
    opacity: 0
  },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};
