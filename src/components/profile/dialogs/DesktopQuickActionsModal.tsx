import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Award, FileText, QrCode, X } from 'lucide-react';
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

export function DesktopQuickActionsModal({
  isOpen,
  onClose,
}: DesktopQuickActionsModalProps) {
  const navigate = useNavigate();
  const [showCVModal, setShowCVModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // 🧭 Prevent body scroll when modal is open
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

  // ⌨️ Allow Escape to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Debug visibility state
  useEffect(() => {
    console.info('[DesktopQuickActionsModal] isOpen:', isOpen);
  }, [isOpen]);

  // ⚡ Quick Actions
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
      },
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
      },
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
      },
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
      },
    },
  ];

  const handleCVUploadComplete = () => {
    setShowCVModal(false);
  };

  return (
    <>
        {isOpen &&
          createPortal(
            <AnimatePresence>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-md"
                onClick={onClose}
              />

              {/* Modal - Always fixed to viewport bottom */}
              <div 
                className="
                  fixed inset-x-0 z-[200] flex justify-center
                  bottom-0 md:bottom-8 px-4 pointer-events-none
                "
              >
                <motion.div
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 80 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 250, mass: 0.6 }}
                  className="
                    pointer-events-auto w-full max-w-2xl 
                    bg-card rounded-t-3xl md:rounded-3xl p-8 shadow-2xl
                    max-h-[90vh] overflow-y-auto
                  "
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-urbanist font-semibold text-foreground">
                        Quick Actions
                      </h2>
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
                          transition={{
                            delay: index * 0.05,
                            type: 'spring',
                            stiffness: 300,
                          }}
                          onClick={action.action}
                          className={`
                            flex flex-col items-center justify-center p-6 rounded-2xl
                            ${action.bgColor} transition-all duration-200
                            hover:scale-105 active:scale-95 transform group
                            min-h-[120px]
                          `}
                        >
                          <div
                            className={`
                              h-12 w-12 rounded-2xl ${action.bgColor}
                              flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform
                            `}
                          >
                            <Icon className={`h-6 w-6 ${action.iconColor}`} />
                          </div>
                          <span className="text-sm font-medium text-center text-foreground">
                            {action.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </AnimatePresence>,
            document.body
          )
        }

      {/* Linked Modals */}
      <AnimatePresence>
        {showCVModal && (
          <CVUploadModal
            open={showCVModal}
            onOpenChange={setShowCVModal}
            onComplete={handleCVUploadComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRModal && (
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAchievementModal && (
          <AchievementModal
            isOpen={showAchievementModal}
            onClose={() => setShowAchievementModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
