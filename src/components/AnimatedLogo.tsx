/** @paper-design/shaders-react@0.0.51 */
import { Heatmap } from '@paper-design/shaders-react';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

/**
 * Code exported from Paper
 * https://app.paper.design/playground/heatmap?node=01K4PRV1TBDZBSTJ2F25P9SEQA
 * on Sep 10, 2025 at 10:56 AM.
 */
export default function AnimatedLogo({ size = 40, className = "" }: AnimatedLogoProps) {
  return (
    <Heatmap 
      colors={['#11206a', '#1f3ba2', '#2f63e7', '#6bd7ff', '#ffe679', '#ff991e', '#ff4c00']} 
      colorBack="#00000000" 
      speed={1.13} 
      contour={0.606} 
      angle={126.4} 
      noise={0.23} 
      innerGlow={0.21} 
      outerGlow={0.39} 
      scale={0.94} 
      image="https://workers.paper.design/file-assets/01K4PDB7KC8P1Z6GJK4P4SD56R/01K4T1QAC6A00PYNCX6XXEMSYF.svg" 
      frame={0} 
      style={{ 
        backgroundColor: '#060535', 
        borderRadius: '12px', 
        height: `${size}px`, 
        width: `${size}px` 
      }}
      className={className}
    />
  );
}