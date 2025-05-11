
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#FF6B4A] text-primary-foreground hover:bg-[#FF6B4A]/80", // freelancer
        secondary:
          "border-transparent bg-[#1A1F71] text-secondary-foreground hover:bg-[#1A1F71]/80", // job-seeker
        destructive:
          "border-transparent bg-[#8B5CF6] text-destructive-foreground hover:bg-[#8B5CF6]/80", // entrepreneur
        outline: "border-[#33C3F0] text-[#33C3F0]", // student
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
