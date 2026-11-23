import { motion, useReducedMotion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageCircle, Building2, Heart } from 'lucide-react';
import type { DiscoveryProfile } from '@/services/discoveryService';
import { initials } from './mobileDiscoveryModel';

interface MatchCelebrationProps { candidate: DiscoveryProfile; employerAvatar?: string; employerName?: string; onSendMessage: () => void; onKeepBrowsing: () => void; messaging?: boolean; error?: string }
export function MatchCelebration({ candidate, employerAvatar, employerName = 'Your organization', onSendMessage, onKeepBrowsing, messaging, error }: MatchCelebrationProps) {
  const reducedMotion = useReducedMotion();
  return <Dialog open onOpenChange={open => { if (!open) onKeepBrowsing(); }}>
    <DialogContent className="employer-theme discovery-match text-center rounded-3xl">
      <div className="flex items-center justify-center gap-2 text-primary text-sm font-semibold pt-5"><Heart size={17} />Mutual interest</div>
      <div className="discovery-match-portraits">
        <motion.div initial={reducedMotion ? false : { rotate: 0, y: 15 }} animate={{ rotate: -9, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="discovery-match-person bg-primary/10">
          <Avatar className="h-full w-full rounded-none"><AvatarImage src={employerAvatar} alt={employerName} className="object-contain p-4" /><AvatarFallback className="rounded-none bg-primary/10 text-primary"><Building2 size={52} /></AvatarFallback></Avatar>
        </motion.div>
        <motion.div initial={reducedMotion ? false : { rotate: 0, y: 15 }} animate={{ rotate: 9, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="discovery-match-person bg-primary">
          <Avatar className="h-full w-full rounded-none"><AvatarImage src={candidate.profile_image} alt={candidate.name} className="object-cover object-[center_25%]" /><AvatarFallback className="rounded-none bg-primary text-primary-foreground text-4xl font-bold">{initials(candidate.name)}</AvatarFallback></Avatar>
        </motion.div>
      </div>
      <DialogTitle className="text-3xl font-black">A connection worth making.</DialogTitle>
      <DialogDescription className="text-sm leading-relaxed break-words">{employerName} and {candidate.name} have expressed interest in each other.</DialogDescription>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button variant="outline" disabled={messaging} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground gap-2" onClick={onSendMessage}><MessageCircle size={20} />{messaging ? 'Opening conversation…' : 'Send a message'}</Button>
      <Button variant="ghost" className="h-11 w-full" onClick={onKeepBrowsing}>Continue discovering</Button>
    </DialogContent>
  </Dialog>;
}
