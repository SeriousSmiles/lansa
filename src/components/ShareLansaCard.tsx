import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import lansaLogoUrl from '@/assets/lansa-logo-blue.png';

const LANSA_BRAND = '#1A1F71';
const LANSA_URL = 'https://lansa.online';

export type ShareVariant = 'employer' | 'seeker' | 'mentor';

const VARIANT_CONTENT: Record<ShareVariant, { headline: string; subtitle: string; shareText: string; filename: string }> = {
  employer: {
    headline: 'Find the Right Talent, Faster',
    subtitle: 'Scan to hire smarter with Lansa',
    shareText: 'Find verified candidates faster with Lansa — https://lansa.online',
    filename: 'lansa-employers-qr.png',
  },
  seeker: {
    headline: 'Get Trained. Get Certified.\nGet Hired.',
    subtitle: 'Scan to start your journey on Lansa',
    shareText: 'Build your career and connect with local businesses on Lansa — https://lansa.online',
    filename: 'lansa-careers-qr.png',
  },
  mentor: {
    headline: 'Grow Your Reach.\nTrain More Talent.',
    subtitle: 'Scan to join Lansa as a mentor',
    shareText: 'Expand your student pool with warm local leads on Lansa — https://lansa.online',
    filename: 'lansa-mentors-qr.png',
  },
};

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

const drawMultilineText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, lineHeight: number) => {
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
  return lines.length;
};

export async function generateShareCard(variant: ShareVariant) {
  const content = VARIANT_CONTENT[variant];
  const W = 600;
  const H = 820;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
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

  // Logo
  const logoImg = await loadImage(lansaLogoUrl);
  const logoH = 48;
  const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
  const logoY = 50;
  ctx.drawImage(logoImg, (W - logoW) / 2, logoY, logoW, logoH);

  // CTA headline
  const headlineY = logoY + logoH + 36;
  ctx.save();
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = LANSA_BRAND;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const headlineLines = drawMultilineText(ctx, content.headline, W / 2, headlineY, 38);
  ctx.restore();

  // Subtitle
  const subtitleY = headlineY + headlineLines * 38 + 8;
  ctx.save();
  ctx.font = '400 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(content.subtitle, W / 2, subtitleY);
  ctx.restore();

  // QR code
  const qrSize = 280;
  const qrX = (W - qrSize) / 2;
  const qrY = subtitleY + 44;

  // QR card background
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
  ctx.fill();
  ctx.restore();

  const qrDataURL = await QRCode.toDataURL(LANSA_URL, {
    width: qrSize,
    margin: 1,
    color: { dark: LANSA_BRAND, light: '#FFFFFF' },
  });
  const qrImg = await loadImage(qrDataURL);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Bottom URL pill
  const urlFont = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.font = urlFont;
  const urlText = 'lansa.online';
  const urlW = ctx.measureText(urlText).width;
  const pillPad = 24;
  const pillH = 40;
  const pillW = urlW + pillPad * 2;
  const pillY = H - 60;
  const pillX = (W - pillW) / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(26,31,113,0.06)';
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.font = urlFont;
  ctx.fillStyle = LANSA_BRAND;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(urlText, W / 2, pillY + pillH / 2);
  ctx.restore();

  // Export
  const dataUrl = canvas.toDataURL('image/png');

  const dummyFile = new File([''], 'test.png', { type: 'image/png' });
  const canShareFiles = !!(navigator.canShare?.({ files: [dummyFile] }));

  if (canShareFiles) {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], content.filename, { type: 'image/png' });
      await navigator.share({
        files: [file],
        title: 'Lansa',
        text: content.shareText,
      });
      return;
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }
  }

  // Desktop fallback: download
  const link = document.createElement('a');
  link.download = content.filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast({ title: 'Downloaded!', description: 'Lansa QR card saved.' });
}
