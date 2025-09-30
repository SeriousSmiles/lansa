import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Award, 
  FileText, 
  QrCode,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

interface DesktopQuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopQuickActionsModal({ isOpen, onClose }: DesktopQuickActionsModalProps) {
  const navigate = useNavigate();
  const [showCVModal, setShowCVModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const quickActions: QuickAction[] = [
    {
      id: 'update-profile',
      label: 'Update Profile',
      icon: FileText,
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      iconColor: 'text-blue-500',
      action: () => {
        navigate('/profile');
        onClose();
      }
    },
    {
      id: 'upload-resume',
      label: 'Upload Resume',
      icon: Upload,
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      iconColor: 'text-green-500',
      action: () => {
        setShowCVModal(true);
        onClose();
      }
    },
    {
      id: 'add-achievement',
      label: 'Add Achievement',
      icon: Award,
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
      iconColor: 'text-yellow-500',
      action: () => {
        setShowAchievementModal(true);
        onClose();
      }
    },
    {
      id: 'share-qr',
      label: 'Share Profile QR',
      icon: QrCode,
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      iconColor: 'text-purple-500',
      action: () => {
        setShowQRModal(true);
        onClose();
      }
    }
  ];

  const handleCVUploadComplete = () => {
    setShowCVModal(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-modal flex justify-center p-4 pb-8 pointer-events-none"
          >
            <div className="bg-card rounded-3xl p-8 w-full max-w-2xl mx-auto shadow-xl pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-urbanist font-semibold text-foreground">Quick Actions</h2>
                  <p className="text-muted-foreground mt-1">
                    What would you like to do?
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => {
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
                        hover:scale-105 transform active:scale-95
                        min-h-[120px] group
                      `}
                    >
                      <div className={`h-12 w-12 rounded-2xl ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <span className="text-sm font-medium text-center text-foreground">
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Modals */}
      <CVUploadModal 
        open={showCVModal}
        onOpenChange={setShowCVModal}
        onComplete={handleCVUploadComplete}
      />
      
      <QRCodeModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
      
      <AchievementModal 
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
      />
    </AnimatePresence>
  );
}