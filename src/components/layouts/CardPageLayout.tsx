
import React from "react";

interface CardPageLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const CardPageLayout: React.FC<CardPageLayoutProps> = ({ 
  children,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center px-4">
        <div className="text-xl sm:text-2xl text-[#2E2E2E] text-center">Loading your personalized insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="flex min-h-[72px] w-full px-4 sm:px-6 md:px-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
            alt="Lansa Logo"
            className="aspect-[2.7] object-contain w-[80px] sm:w-[92px]"
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-[1100px] mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#2E2E2E] mb-6 sm:mb-8 text-center">
          Your Personal Blueprint
        </h1>
        
        {children}
      </main>

      <footer className="text-center py-4 sm:py-6 text-xs sm:text-sm text-[#1A1F71]">
        © 2025 Lansa
      </footer>
    </div>
  );
};
