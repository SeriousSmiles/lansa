import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Share, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Lansa brand color
const LANSA_BRAND = '#1A1F71';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

interface ProfileData {
  name: string | null;
  profile_image: string | null;
}

export function QRCodeModal({ isOpen, onClose, userName }: QRCodeModalProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [compositeDataUrl, setCompositeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);

  const urlFriendlyName = (profileData?.name || userName)
    ? (profileData?.name || userName)!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : 'user';
  const profileUrl = `${window.location.origin}/profile/share/${urlFriendlyName}-${user?.id}`;

  // Check if native file sharing is supported
  useEffect(() => {
    const dummyFile = new File([''], 'test.png', { type: 'image/png' });
    setCanShareFiles(!!(navigator.canShare?.({ files: [dummyFile] })));
  }, []);

  // Fetch profile data (name + image) when modal opens
  useEffect(() => {
    if (!isOpen || !user?.id) return;
    supabase
      .from('user_profiles')
      .select('name, profile_image')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfileData({ name: data.name, profile_image: data.profile_image });
      });
  }, [isOpen, user?.id]);

  // Generate composite card once we have profile data
  useEffect(() => {
    if (isOpen && user?.id && profileData !== null) {
      generateCompositeCard();
    }
  }, [isOpen, user?.id, profileData]);

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const generateCompositeCard = useCallback(async () => {
    if (!user?.id) return;
    setIsGenerating(true);
    setCompositeDataUrl('');

    try {
      const W = 600;
      const H = 720;
      const PADDING = 40;

      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      // ── Background card ──────────────────────────────────────────
      // Subtle gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#F8F9FF');
      bgGrad.addColorStop(1, '#EEF0FA');
      ctx.fillStyle = bgGrad;
      drawRoundedRect(ctx, 0, 0, W, H, 32);
      ctx.fill();

      // Top accent bar
      const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
      accentGrad.addColorStop(0, LANSA_BRAND);
      accentGrad.addColorStop(1, '#3D45A0');
      ctx.fillStyle = accentGrad;
      drawRoundedRect(ctx, 0, 0, W, 8, 4);
      ctx.fill();

      // ── Profile photo ────────────────────────────────────────────
      const photoSize = 120;
      const photoCX = W / 2;
      const photoCY = 80 + photoSize / 2;

      // Draw circle background / border
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoCX, photoCY, photoSize / 2 + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(26,31,113,0.15)';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.restore();

      // Try loading profile image; fall back to initials
      const profileImage = profileData?.profile_image;
      let photoLoaded = false;

      if (profileImage) {
        try {
          const img = await loadImage(profileImage);
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoCX, photoCY, photoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          // Cover-fit: draw centered
          const scale = Math.max(photoSize / img.naturalWidth, photoSize / img.naturalHeight);
          const dw = img.naturalWidth * scale;
          const dh = img.naturalHeight * scale;
          ctx.drawImage(img, photoCX - dw / 2, photoCY - dh / 2, dw, dh);
          ctx.restore();
          photoLoaded = true;
        } catch {
          // CORS or load failure — fall through to initials
        }
      }

      if (!photoLoaded) {
        // Draw initials circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoCX, photoCY, photoSize / 2, 0, Math.PI * 2);
        const initialsGrad = ctx.createLinearGradient(photoCX - photoSize / 2, photoCY - photoSize / 2, photoCX + photoSize / 2, photoCY + photoSize / 2);
        initialsGrad.addColorStop(0, LANSA_BRAND);
        initialsGrad.addColorStop(1, '#3D45A0');
        ctx.fillStyle = initialsGrad;
        ctx.fill();
        ctx.restore();

        const displayName = profileData?.name || userName || 'U';
        const initials = displayName
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0].toUpperCase())
          .join('');
        ctx.save();
        ctx.font = `bold ${photoSize * 0.35}px sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, photoCX, photoCY);
        ctx.restore();
      }

      // ── Name ─────────────────────────────────────────────────────
      const displayName = profileData?.name || userName || '';
      const nameY = photoCY + photoSize / 2 + 36;

      ctx.save();
      ctx.font = `bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = LANSA_BRAND;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Truncate if too long
      let nameText = displayName;
      while (ctx.measureText(nameText).width > W - PADDING * 2 && nameText.length > 3) {
        nameText = nameText.slice(0, -2) + '…';
      }
      ctx.fillText(nameText, W / 2, nameY);
      ctx.restore();

      // Subtitle
      ctx.save();
      ctx.font = `400 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = '#6B7280';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Scan to view profile', W / 2, nameY + 38);
      ctx.restore();

      // ── QR Code ──────────────────────────────────────────────────
      const qrSize = 220;
      const qrX = (W - qrSize) / 2;
      const qrY = nameY + 38 + 28 + 12;

      // QR card background
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#FFFFFF';
      drawRoundedRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
      ctx.fill();
      ctx.restore();

      // Generate QR and draw it
      const qrDataURL = await QRCode.toDataURL(profileUrl, {
        width: qrSize,
        margin: 1,
        color: { dark: LANSA_BRAND, light: '#FFFFFF' },
      });
      const qrImg = await loadImage(qrDataURL);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // ── "Powered by Lansa" badge ──────────────────────────────────
      // Measure each piece first so we can centre the whole line precisely
      const prefixFont = `400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      const brandFont  = `bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      const iconR = 6;          // radius of the small Lansa dot icon
      const gap   = 5;          // gap between icon and "Lansa" text

      ctx.font = prefixFont;
      const prefixW = ctx.measureText('Powered by ').width;

      ctx.font = brandFont;
      const brandW  = ctx.measureText('Lansa').width;

      // Total content width: "Powered by " + icon circle diameter + gap + "Lansa"
      const contentW = prefixW + iconR * 2 + gap + brandW;
      const badgeH   = 36;
      const badgePad = 20;
      const badgeW   = contentW + badgePad * 2;
      const badgeY   = H - 52;
      const badgeX   = (W - badgeW) / 2;
      const midY     = badgeY + badgeH / 2;

      // Pill background
      ctx.save();
      ctx.fillStyle = 'rgba(26,31,113,0.06)';
      drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.fill();
      ctx.restore();

      // Draw content left-to-right from the computed starting x
      let cursorX = badgeX + badgePad;

      // "Powered by "
      ctx.save();
      ctx.font = prefixFont;
      ctx.fillStyle = '#6B7280';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Powered by ', cursorX, midY);
      cursorX += prefixW;
      ctx.restore();

      // Small Lansa brand dot (canvas-drawn, no image load needed)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cursorX + iconR, midY, iconR, 0, Math.PI * 2);
      ctx.fillStyle = LANSA_BRAND;
      ctx.fill();
      // White inner dot to mimic the Lansa icon
      ctx.beginPath();
      ctx.arc(cursorX + iconR, midY - iconR * 0.2, iconR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
      cursorX += iconR * 2 + gap;

      // "Lansa"
      ctx.save();
      ctx.font = brandFont;
      ctx.fillStyle = LANSA_BRAND;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Lansa', cursorX, midY);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png');
      setCompositeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR card:', error);
      toast({ title: 'Error', description: 'Failed to generate QR card', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, profileData, profileUrl, userName]);

  const downloadCard = () => {
    if (!compositeDataUrl) return;
    const link = document.createElement('a');
    link.download = `lansa-profile-${user?.id?.slice(0, 8)}.png`;
    link.href = compositeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Downloaded!', description: 'Profile card saved.' });
  };

  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/png' });
  };

  const shareCard = async () => {
    if (compositeDataUrl && canShareFiles) {
      try {
        const file = await dataUrlToFile(compositeDataUrl, 'lansa-profile.png');
        await navigator.share({
          files: [file],
          title: `${profileData?.name || userName || 'My'} Profile`,
          text: `Check out my Lansa profile! ${profileUrl}`,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // User cancelled
      }
    }

    // Desktop / unsupported fallback: download + copy link
    downloadCard();
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({ title: 'Link copied!', description: 'Profile card downloaded and link copied.' });
    } catch {
      toast({ title: 'Downloaded', description: 'Profile card downloaded.' });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({ title: 'Copied!', description: 'Profile link copied to clipboard.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy link.', variant: 'destructive' });
    }
  };

  return (
    <>
      {isOpen &&
        createPortal(
          <AnimatePresence>
            {/* Backdrop */}
            <motion.div
              key="qr-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[209]"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              key="qr-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-card rounded-3xl p-6 w-full max-w-sm mx-auto shadow-xl pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-urbanist font-semibold">Share Profile</h2>
                      <p className="text-sm text-muted-foreground">Save or share your profile card</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Card Preview */}
                <div className="flex justify-center mb-5">
                  {isGenerating ? (
                    <div className="h-56 w-56 bg-muted rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : compositeDataUrl ? (
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-border/30 w-full">
                      <img
                        src={compositeDataUrl}
                        alt="Your Lansa Profile Card"
                        className="w-full h-auto"
                      />
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Primary: Share (with image on mobile, download+copy on desktop) */}
                  <Button
                    onClick={shareCard}
                    disabled={!compositeDataUrl}
                    className="w-full flex items-center gap-2"
                    variant="primary"
                  >
                    <Share className="h-4 w-4" />
                    {canShareFiles ? 'Share Profile Card' : 'Download & Share'}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={downloadCard}
                      disabled={!compositeDataUrl}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>

                    <Button
                      onClick={copyLink}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>

                {/* URL preview */}
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
