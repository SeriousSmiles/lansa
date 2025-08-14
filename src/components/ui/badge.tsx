
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary/20 text-secondary font-medium",
        secondary: "border-transparent bg-primary/10 text-primary font-medium",
        destructive: "border-transparent bg-destructive/10 text-destructive font-medium",
        outline: "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
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
