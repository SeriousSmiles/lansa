import { ReactNode } from "react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner"
import { Illustration, type IllustrationName } from "@/components/common/Illustration"

interface AuthLayoutProps {
  children: ReactNode
  /** Kept for compatibility; the side panel now uses a painted LANSA illustration. */
  imageSrc?: string
  art?: IllustrationName
}

/** Split auth frame: focused white form card on the warm canvas, painted people-first panel on wide screens. */
export function AuthLayout({ children, art = "welcome" }: AuthLayoutProps) {
  return (
    <div className="seeker-theme bg-background flex flex-col min-h-screen">
      <AnnouncementBanner />
      <div className="flex flex-1 items-stretch">
        <div className="flex-1 min-w-0 px-5 sm:px-10 lg:px-16 flex flex-col items-center">
          <header className="flex min-h-[72px] w-full items-center justify-between">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
              alt="Lansa"
              className="aspect-[2.7] object-contain w-[92px]"
            />
            <LanguageSwitcher />
          </header>

          <main className="flex w-full max-w-[480px] flex-col items-center justify-center flex-1 py-8 gap-6">
            <div className="lg:hidden"><Illustration name={art} size={140} /></div>
            {children}
          </main>

          <footer className="min-h-[64px] w-full text-sm text-center text-muted-foreground">
            © {new Date().getFullYear()} Lansa
          </footer>
        </div>

        <aside className="hidden lg:flex lx-identity-band w-[46%] max-w-[720px] m-4 rounded-[32px] flex-col items-center justify-center gap-8 p-12 text-center" aria-hidden="true">
          <Illustration name={art} size={420} className="rounded-[40px]" />
          <div className="max-w-sm">
            <p className="lx-page-title text-3xl text-primary">People first. Careers that move.</p>
            <p className="mt-3 text-base text-muted-foreground">Curaçao's professionals and employers, meeting as people.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
