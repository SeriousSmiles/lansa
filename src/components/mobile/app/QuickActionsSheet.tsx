import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Award, 
  FileText, 
  QrCode,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CVUploadModal } from '@/components/onboarding/cv/CVUploadModal';
import { QRCodeModal } from '@/components/modals/QRCodeModal';
import { AchievementModal } from '@/components/modals/AchievementModal';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  bgColor: string;
  iconColor: string;
}

interface QuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  onAddAchievement?: (achievement: any) => Promise<void>;
}

export function QuickActionsSheet({ isOpen, onClose, userName, onAddAchievement }: QuickActionsSheetProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCVModal, setShowCVModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  const getQuickActions = (): QuickAction[] => [
    {
      id: 'update-profile',
      label: 'Update Profile',
      icon: FileText,
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      iconColor: 'text-blue-500',
      action: () => { navigate('/profile'); onClose(); }
    },
    {
      id: 'upload-resume',
      label: 'Upload Resume',
      icon: Upload,
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      iconColor: 'text-green-500',
      action: () => { setShowCVModal(true); onClose(); }
    },
    {
      id: 'add-achievement',
      label: 'Add Achievement',
      icon: Award,
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
      iconColor: 'text-yellow-500',
      action: () => { setShowAchievementModal(true); onClose(); }
    },
    {
      id: 'scan-qr',
      label: 'Share Profile QR',
      icon: QrCode,
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      iconColor: 'text-purple-500',
      action: () => { setShowQRModal(true); onClose(); }
    }
  ];

  const actions = getQuickActions();

  const handleCVUploadComplete = () => setShowCVModal(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="quick-actions-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-modal"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              key="quick-actions-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-modal bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-urbanist font-semibold">Quick Actions</h2>
                  <p className="text-sm text-muted-foreground mt-1">What would you like to do?</p>
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
                      className={`
                        flex flex-col items-center justify-center p-6 rounded-2xl 
                        ${action.bgColor} transition-all duration-200
                        touch-target active:scale-95 transform
                      `}
                    >
                      <div className={`h-12 w-12 rounded-2xl ${action.bgColor} flex items-center justify-center mb-3`}>
                        <Icon className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <span className="text-sm font-medium text-center text-foreground">
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

      {/* Modals — outside AnimatePresence to avoid key conflicts */}
      <CVUploadModal 
        open={showCVModal}
        onOpenChange={setShowCVModal}
        onComplete={handleCVUploadComplete}
      />
      <QRCodeModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        userName={userName}
      />
      <AchievementModal 
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        onAddAchievement={onAddAchievement}
      />
    </>
  );
}
