import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, DollarSign, TrendingUp, BarChart3, Clock, FileText, HelpCircle, Settings, Video } from 'lucide-react';
import { gsap } from 'gsap';

interface AdminMobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const actionItems = [
  { title: 'Content', url: '/admin/content', icon: Video, description: 'Manage video content' },
  { title: 'Pricing Wall', url: '/admin/pricing', icon: DollarSign, description: 'Manage pricing events' },
  { title: 'Trends', url: '/admin/trends', icon: TrendingUp, description: 'View trend analysis' },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, description: 'User analytics' },
  { title: 'Historical', url: '/admin/historical', icon: Clock, description: 'Historical data' },
  { title: 'Documents', url: '/admin/documents', icon: FileText, description: 'Manage documents' },
  { title: 'Support', url: '/admin/support', icon: HelpCircle, description: 'Support center' },
  { title: 'Settings', url: '/admin/settings', icon: Settings, description: 'Admin settings' },
];

export function AdminMobileActionSheet({ isOpen, onClose }: AdminMobileActionSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Animate in
      if (overlayRef.current && sheetRef.current) {
        gsap.fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
        gsap.fromTo(sheetRef.current,
          { y: '100%' },
          { y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    } else {
      document.body.style.overflow = '';
      
      // Animate out
      if (overlayRef.current && sheetRef.current) {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
        gsap.to(sheetRef.current, { y: '100%', duration: 0.3, ease: 'power2.in' });
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[110] md:hidden"
        onClick={onClose}
      />

      {/* Action Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[111] bg-card rounded-t-3xl shadow-lg md:hidden max-h-[80vh] overflow-y-auto"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <h2 className="text-lg font-semibold">More Options</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 grid grid-cols-2 gap-3 pb-8">
          {actionItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={onClose}
                className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">{item.title}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
