import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Briefcase, MessageCircle, UserRound } from 'lucide-react';
import { useUnreadChatCount } from '@/hooks/useUnreadChatCount';
import { seekerTabFor, type SeekerTab } from './seekerNavModel';

const TABS: { id: SeekerTab; label: string; icon: typeof Home; to: string }[] = [
  { id: 'home', label: 'Home', icon: Home, to: '/dashboard' },
  { id: 'feed', label: 'Feed', icon: Newspaper, to: '/feed' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, to: '/jobs' },
  { id: 'inbox', label: 'Inbox', icon: MessageCircle, to: '/chat' },
  { id: 'profile', label: 'Profile', icon: UserRound, to: '/profile' },
];

/** Fixed five-tab seeker navigation. Hidden only inside an open conversation, which has its own back control. */
export function BottomNav() {
  const { pathname } = useLocation();
  const unread = useUnreadChatCount();
  if (/^\/chat\/.+/.test(pathname)) return null;
  const active = seekerTabFor(pathname);
  return (
    <nav className="seeker-theme sk-nav" aria-label="Main navigation">
      {TABS.map(({ id, label, icon: Icon, to }) => {
        const isActive = id === active;
        return (
          <Link key={id} to={to} className="sk-nav-tab" aria-current={isActive ? 'page' : undefined} aria-label={id === 'inbox' && unread ? `Inbox, ${unread} unread` : label}>
            <span className="sk-nav-icon">
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.9} />
              {id === 'inbox' && unread > 0 && <span className="sk-nav-badge" aria-hidden>{unread > 9 ? '9+' : unread}</span>}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
