import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import type { DiscoveryProfile } from "@/services/discoveryService";

interface MatchCelebrationProps {
  candidate: DiscoveryProfile;
  employerAvatar?: string;
  employerName?: string;
  onSendMessage: () => void;
  onKeepBrowsing: () => void;
}

export function MatchCelebration({
  candidate,
  employerAvatar,
  employerName = "You",
  onSendMessage,
  onKeepBrowsing,
}: MatchCelebrationProps) {
  const [autoDismiss, setAutoDismiss] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoDismiss(true);
      onKeepBrowsing();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onKeepBrowsing]);

  const accentColor = candidate.highlight_color || 'hsl(var(--primary))';

  return (
    <AnimatePresence>
      {!autoDismiss && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accentColor}dd, hsl(var(--primary)))`,
          }}
        >
          {/* Sparkle particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/60"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 150 }}
            className="text-center px-8 relative z-10"
          >
            {/* Sparkle icon */}
            <motion.div
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center mb-6"
            >
              <Sparkles className="w-10 h-10 text-white/80" />
            </motion.div>

            {/* Avatars */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Avatar className="w-20 h-20 ring-4 ring-white/40 shadow-2xl">
                  <AvatarImage src={employerAvatar} />
                  <AvatarFallback className="text-lg font-bold bg-white/20 text-white">
                    {employerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-3xl"
              >
                ❤️
              </motion.div>

              <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Avatar className="w-20 h-20 ring-4 ring-white/40 shadow-2xl">
                  <AvatarImage src={candidate.profile_image} />
                  <AvatarFallback
                    className="text-lg font-bold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {candidate.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>

            {/* Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-black text-white mb-2"
            >
              It's a Match!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/80 mb-8"
            >
              You and <span className="font-semibold text-white">{candidate.name}</span> are interested in each other
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3"
            >
              <Button
                onClick={onSendMessage}
                className="w-full h-12 text-base font-semibold bg-white text-foreground hover:bg-white/90"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Send a Message
              </Button>
              <Button
                variant="ghost"
                onClick={onKeepBrowsing}
                className="w-full h-10 text-white/80 hover:text-white hover:bg-white/10"
              >
                Keep Browsing
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
