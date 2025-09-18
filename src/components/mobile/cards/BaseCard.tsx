import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BaseCardProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'highlighted' | 'gradient';
}

export function BaseCard({ 
  children, 
  className, 
  onClick, 
  disabled = false,
  variant = 'default',
  ...motionProps 
}: BaseCardProps) {
  const isClickable = !!onClick && !disabled;

  const variants = {
    default: "bg-card border border-border/50",
    highlighted: "bg-card border border-primary/20 shadow-lg shadow-primary/10",
    gradient: "bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
  };

  return (
    <motion.div
      className={cn(
        "rounded-2xl p-4 transition-all duration-200",
        variants[variant],
        isClickable && "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { y: -2 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}