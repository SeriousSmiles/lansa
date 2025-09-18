import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES = [
  'Frontend Developer',
  'Remote Jobs',
  'React Developer',
  'Product Manager'
];

const TRENDING_SEARCHES = [
  'AI Engineer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer'
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when overlay opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSearch = (searchQuery: string) => {
    console.log('Search for:', searchQuery);
    // Implement search logic here
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-modal"
        >
          {/* Safe area top */}
          <div className="mobile-safe-top" />

          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 p-4 border-b border-border"
          >
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search opportunities, companies..."
                  className="pl-10 h-12 rounded-2xl border-2 focus:border-primary"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="touch-target"
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 p-4 space-y-6"
          >
            {/* Recent Searches */}
            {RECENT_SEARCHES.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Recent</h3>
                </div>
                <div className="space-y-2">
                  {RECENT_SEARCHES.map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left p-3 rounded-xl hover:bg-muted transition-colors touch-target"
                    >
                      <span className="text-foreground">{search}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Trending</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((search, index) => (
                  <motion.button
                    key={search}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSearch(search)}
                    className="
                      px-4 py-2 rounded-2xl bg-primary/10 text-primary 
                      hover:bg-primary/20 transition-colors text-sm font-medium
                      touch-target
                    "
                  >
                    {search}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Safe area bottom */}
          <div className="mobile-safe-bottom" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}