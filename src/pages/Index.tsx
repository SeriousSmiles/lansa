import { AuthLayout } from "@/components/auth/AuthLayout"
import { SignUpForm } from "@/components/auth/SignUpForm"

export default function IndexPage() {
  return (
    <AuthLayout imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/21db5620684d4cbbfb27b61d5dfc0736c8a7cd9c?placeholderIfAbsent=true">
      <div className="w-full text-[#2E2E2E] font-normal text-center max-md:max-w-full">
        <h1 className="text-5xl leading-[1.2] tracking-[-0.48px] max-md:max-w-full max-md:text-[40px]">
          Sign Up
        </h1>
        <p className="text-lg mt-6 max-md:max-w-full">
          Every journey of a thousand steps, started with one!
        </p>
      </div>
      <SignUpForm />
    </AuthLayout>
  )
}
