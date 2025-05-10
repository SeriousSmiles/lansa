import { useState } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SignUpFormData {
  name: string
  email: string
  password: string
}

export function SignUpForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      // Handle sign up logic here
      console.log(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-[480px] max-w-full flex-col items-stretch text-base justify-center mt-8">
      <div className="w-full text-[#2E2E2E] font-normal">
        <label className="block mb-2">Name*</label>
        <Input
          {...register("name", { required: true })}
          error={!!errors.name}
          disabled={isLoading}
        />
      </div>

      <div className="w-full text-[#2E2E2E] font-normal mt-6">
        <label className="block mb-2">Email*</label>
        <Input
          type="email"
          {...register("email", { required: true })}
          error={!!errors.email}
          disabled={isLoading}
        />
      </div>

      <div className="w-full text-[#2E2E2E] font-normal mt-6">
        <label className="block mb-2">Password*</label>
        <Input
          type="password"
          {...register("password", { required: true })}
          error={!!errors.password}
          disabled={isLoading}
        />
      </div>

      <div className="self-center flex w-full max-w-[480px] flex-col items-center mt-6">
        <div className="w-full text-white font-medium">
          <Button
            type="submit"
            disabled={isLoading}
          >
            Sign up
          </Button>

          <Button
            type="button"
            variant="google"
            disabled={isLoading}
            className="mt-4"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/abebc497af7ae0216b313acd82c8ed74ee2d8b24?placeholderIfAbsent=true"
              alt="Google"
              className="w-6 h-6 mr-3"
            />
            Sign up with Google
          </Button>
        </div>

        <div className="flex items-center gap-[5px] text-[#2E2E2E] font-normal text-center mt-6">
          <span>Already have an account?</span>
          <a href="/login" className="underline">Log In</a>
        </div>
      </div>
    </form>
  )
}
