import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Award, 
  FileText, 
  Briefcase, 
  Users, 
  QrCode,
  X,
  Camera,
  Plus
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  color?: string;
}

interface QuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionsSheet({ isOpen, onClose }: QuickActionsSheetProps) {
  const location = useLocation();
  const { user } = useAuth();

  const getQuickActions = (): QuickAction[] => {
    // Role-based actions - simplified for demo
    const baseActions: QuickAction[] = [
      {
        id: 'update-profile',
        label: 'Update Profile',
        icon: FileText,
        action: () => {
          console.log('Navigate to profile update');
          onClose();
        }
      },
      {
        id: 'upload-resume',
        label: 'Upload Resume',
        icon: Upload,
        action: () => {
          console.log('Open resume upload');
          onClose();
        }
      },
      {
        id: 'add-achievement',
        label: 'Add Achievement',
        icon: Award,
        action: () => {
          console.log('Add achievement');
          onClose();
        }
      },
      {
        id: 'scan-qr',
        label: 'Scan Profile QR',
        icon: QrCode,
        action: () => {
          console.log('Open QR scanner');
          onClose();
        }
      }
    ];

    return baseActions;
  };

  const actions = getQuickActions();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-modal"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30 
            }}
            className="fixed bottom-0 left-0 right-0 z-modal bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-urbanist font-semibold">Quick Actions</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  What would you like to do?
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={action.action}
                    className="
                      flex flex-col items-center justify-center p-6 rounded-2xl 
                      bg-muted/50 hover:bg-muted transition-all duration-200
                      touch-target active:scale-95 transform
                    "
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-center">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Safe area */}
            <div className="mobile-safe-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}