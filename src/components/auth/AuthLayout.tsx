import { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
  imageSrc: string
}

export function AuthLayout({ children, imageSrc }: AuthLayoutProps) {
  return (
    <div className="bg-[rgba(253,248,242,1)] flex items-stretch overflow-hidden flex-wrap">
      <div className="min-w-60 flex-1 shrink basis-[0%] px-16 max-md:max-w-full max-md:px-5">
        <header className="flex min-h-[72px] w-full flex-col overflow-hidden justify-center max-md:max-w-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
            alt="Logo"
            className="aspect-[2.7] object-contain w-[92px]"
          />
        </header>

        <main className="flex w-full flex-col items-stretch justify-center flex-1 max-md:max-w-full">
          {children}
        </main>

        <footer className="text-white self-stretch min-h-[72px] w-full gap-[5px] text-sm font-normal text-center max-md:max-w-full">
          © 2022 Relume
        </footer>
      </div>

      <img
        src={imageSrc}
        alt="Auth background"
        className="aspect-[0.8] object-contain w-full min-w-60 flex-1 shrink basis-32 max-md:max-w-full"
      />
    </div>
  )
}
