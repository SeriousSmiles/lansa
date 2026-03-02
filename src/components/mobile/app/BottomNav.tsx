import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, User, Briefcase, MessageSquare, Plus, Mail } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { useUnreadChatCount } from '@/hooks/useUnreadChatCount';

interface NavTab {
  id: string;
  label: string;
  icon: React.ElementType;
  to: string;
  badge?: number;
}

const baseTabs: NavTab[] = [
  { id: 'home', label: 'Home', icon: Home, to: '/dashboard' },
  { id: 'profile', label: 'Profile', icon: User, to: '/profile' },
  { id: 'center', label: 'Create', icon: Plus, to: '#' }, // FAB placeholder
  { id: 'opportunities', label: 'Jobs', icon: Briefcase, to: '/jobs' },
  { id: 'messages', label: 'Messages', icon: Mail, to: '/chat' },
];

export function BottomNav() {
  const location = useLocation();
  const { setQuickActionsOpen } = useUIStore();
  const unreadCount = useUnreadChatCount();

  const tabs: NavTab[] = baseTabs.map(t =>
    t.id === 'messages' ? { ...t, badge: unreadCount || undefined } : t
  );

  const getActiveTab = () => {
    if (location.pathname === '/dashboard') return 'home';
    if (location.pathname === '/profile') return 'profile';
    if (location.pathname === '/jobs' || location.pathname === '/opportunity-discovery' || location.pathname === '/discovery') return 'opportunities';
    if (location.pathname.startsWith('/chat')) return 'messages';
    if (location.pathname === '/content') return 'coach';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleFABClick = () => {
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setQuickActionsOpen(true);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-navigation bg-card/95 border-t border-border/50 backdrop-blur-xl">
      <div className="mobile-safe-bottom">
        <div className="grid grid-cols-5 h-20 items-center px-2">
          {tabs.map((tab) => {
            if (tab.id === 'center') {
              return (
                <div key={tab.id} className="flex justify-center -mt-6">
                  <motion.button
                    onClick={handleFABClick}
                    className="
                      h-14 w-14 rounded-2xl bg-gradient-to-r from-primary to-secondary 
                      text-white shadow-lg hover:shadow-xl transition-all duration-200
                      flex items-center justify-center touch-target
                      active:scale-95 transform
                    "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 20,
                      delay: 0.2 
                    }}
                  >
                    <Plus className="h-6 w-6" />
                  </motion.button>
                </div>
              );
            }

            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.id}
                to={tab.to}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 touch-target relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <motion.div
                  className="relative"
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "text-primary"
                  )} />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    />
                  )}
                  
                  {/* Badge */}
                  {tab.badge && (
                    <motion.div
                      className="absolute -top-2 -right-2 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      {tab.badge}
                    </motion.div>
                  )}
                </motion.div>
                
                <span className={cn(
                  "text-xs font-medium mt-1 transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}