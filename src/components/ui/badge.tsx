
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[4px] border px-5 pt-5 pb-7 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#FF6B4A]/30 text-[#FF6B4A] font-medium text-[14px]", // freelancer
        secondary:
          "border-transparent bg-[#FF6B4A]/30 text-[#FF6B4A] font-medium text-[14px]", // job-seeker
        destructive:
          "border-transparent bg-[#FF6B4A]/30 text-[#FF6B4A] font-medium text-[14px]", // entrepreneur
        outline: "border-transparent bg-[#FF6B4A]/30 text-[#FF6B4A] font-medium text-[14px]", // student
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
