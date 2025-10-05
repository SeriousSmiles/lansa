import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Share, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const profileUrl = `${window.location.origin}/profile/share/${user?.id}`;

  useEffect(() => {
    if (isOpen && user?.id) {
      generateQRCode();
    }
  }, [isOpen, user?.id]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrDataURL = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `profile-qr-${user?.id}.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Success",
        description: "Profile link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Profile',
          text: 'Check out my profile!',
          url: profileUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy
      copyProfileLink();
    }
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
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[209]"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-card rounded-3xl p-6 w-full max-w-sm mx-auto shadow-xl pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-urbanist font-semibold">Profile QR Code</h2>
                      <p className="text-sm text-muted-foreground">Share your profile easily</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center mb-6">
                  {isGenerating ? (
                    <div className="h-48 w-48 bg-muted rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                      <img 
                        src={qrCodeUrl} 
                        alt="Profile QR Code" 
                        className="w-40 h-40"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={downloadQRCode}
                    disabled={!qrCodeUrl}
                    className="w-full flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={copyProfileLink}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                    
                    <Button
                      onClick={shareProfile}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Share className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* URL Preview */}
                <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Profile URL:</p>
                  <p className="text-xs font-mono truncate">{profileUrl}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}