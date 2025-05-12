
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#FF6B4A] text-white shadow-[0px_32px_24px_0px_rgba(255,255,255,0.05)_inset,0px_2px_1px_0px_rgba(255,255,255,0.25)_inset,0px_0px_0px_1px_rgba(13,5,4,0.15)_inset,0px_-2px_1px_0px_rgba(0,0,0,0.20)_inset,0px_1px_2px_0px_rgba(13,5,4,0.05)] hover:bg-[#FF6B4A]/90",
        google: "bg-[#1A1F71] text-white shadow-[0px_0px_0px_1px_rgba(13,5,4,0.05)_inset,0px_-2px_1px_0px_rgba(13,5,4,0.05)_inset,0px_1px_2px_0px_rgba(13,5,4,0.05)] hover:bg-[#1A1F71]/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        contrast: "border bg-black/10 text-foreground hover:bg-black/20", // New contrast variant for better visibility on dark backgrounds
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2.5 w-full",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
