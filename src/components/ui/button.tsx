import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'google'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full px-6 py-2.5",
          variant === "primary" && "bg-[#FF6B4A] text-white shadow-[0px_32px_24px_0px_rgba(255,255,255,0.05)_inset,0px_2px_1px_0px_rgba(255,255,255,0.25)_inset,0px_0px_0px_1px_rgba(13,5,4,0.15)_inset,0px_-2px_1px_0px_rgba(0,0,0,0.20)_inset,0px_1px_2px_0px_rgba(13,5,4,0.05)] hover:bg-[#FF6B4A]/90",
          variant === "google" && "bg-[#1A1F71] text-white shadow-[0px_0px_0px_1px_rgba(13,5,4,0.05)_inset,0px_-2px_1px_0px_rgba(13,5,4,0.05)_inset,0px_1px_2px_0px_rgba(13,5,4,0.05)] hover:bg-[#1A1F71]/90",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
