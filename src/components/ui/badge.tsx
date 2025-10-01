
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[4px] border px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary font-medium",
        secondary:
          "border-transparent bg-blue-500/20 text-blue-700 dark:text-blue-400 font-medium",
        destructive:
          "border-transparent bg-red-500/20 text-red-700 dark:text-red-400 font-medium",
        outline: 
          "border-border bg-background text-foreground hover:bg-accent",
        success:
          "border-transparent bg-green-500/20 text-green-700 dark:text-green-400 font-medium",
        purple:
          "border-transparent bg-purple-500/20 text-purple-700 dark:text-purple-400 font-medium",
        teal:
          "border-transparent bg-teal-500/20 text-teal-700 dark:text-teal-400 font-medium",
        muted:
          "border-transparent bg-muted text-muted-foreground font-normal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
