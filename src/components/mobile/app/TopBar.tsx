import React from 'react';
import { motion } from 'framer-motion';
import { Search, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Home',
  '/profile': 'Profile',
  '/discovery': 'Opportunities',
  '/content': 'Coach',
  '/resources': 'Resources',
  '/employer-dashboard': 'Dashboard',
  '/browse-candidates': 'Candidates',
};

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSearchOpen, canGoBack } = useUIStore();

  const title = PAGE_TITLES[location.pathname] || 'Lansa';

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    }
  };

  const handleSearch = () => {
    setSearchOpen(true);
  };

  return (
    <motion.header 
      className="sticky top-0 z-navigation bg-background/95 backdrop-blur-xl border-b border-border/50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mobile-safe-top">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left side */}
          <div className="flex items-center">
            {canGoBack ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="touch-target p-2 -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="w-9" /> // Spacer
            )}
          </div>

          {/* Center - Title */}
          <motion.h1 
            className="font-urbanist font-semibold text-lg text-foreground"
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.h1>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              className="touch-target p-2"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {location.pathname !== '/profile' && (
              <Button
                variant="ghost"
                size="sm"
                className="touch-target p-2"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}