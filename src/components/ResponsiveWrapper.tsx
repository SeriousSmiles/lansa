import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  mobileComponent?: React.ComponentType<any>;
  desktopComponent?: React.ComponentType<any>;
  mobileProps?: any;
  desktopProps?: any;
}

export function ResponsiveWrapper({ 
  children, 
  mobileComponent: MobileComponent, 
  desktopComponent: DesktopComponent,
  mobileProps = {},
  desktopProps = {}
}: ResponsiveWrapperProps) {
  const isMobile = useIsMobile();

  if (MobileComponent && DesktopComponent) {
    return isMobile ? 
      <MobileComponent {...mobileProps}>{children}</MobileComponent> : 
      <DesktopComponent {...desktopProps}>{children}</DesktopComponent>;
  }

  return <>{children}</>;
}