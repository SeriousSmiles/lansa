
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1A1F71] text-[#2ED6C0] hover:bg-[#1A1F71]/90", // freelancer
        secondary:
          "border-transparent bg-[#1A1F71] text-[#2ED6C0] hover:bg-[#1A1F71]/90", // job-seeker
        destructive:
          "border-transparent bg-[#1A1F71] text-[#2ED6C0] hover:bg-[#1A1F71]/90", // entrepreneur
        outline: "border-transparent bg-[#1A1F71] text-[#2ED6C0]", // student
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
