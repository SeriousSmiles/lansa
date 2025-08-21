import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  User, 
  Briefcase, 
  GraduationCap, 
  Target, 
  Edit, 
  Share,
  Download 
} from 'lucide-react';
import { MobileActionSheet } from './MobileActionSheet';

interface MobileQuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileQuickActions({ isOpen, onClose }: MobileQuickActionsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const getContextualActions = () => {
    const path = location.pathname;
    
    if (path === '/profile') {
      return [
        {
          icon: Edit,
          label: 'Edit Profile',
          action: () => {
            // Profile editing logic
            onClose();
          }
        },
        {
          icon: Share,
          label: 'Share Profile',
          action: () => {
            // Share profile logic
            onClose();
          }
        },
        {
          icon: Download,
          label: 'Download Resume',
          action: () => {
            // Download resume logic
            onClose();
          }
        }
      ];
    }
    
    if (path === '/dashboard') {
      return [
        {
          icon: Target,
          label: 'Set New Goal',
          action: () => {
            navigate('/card');
            onClose();
          }
        },
        {
          icon: Briefcase,
          label: 'Add Experience',
          action: () => {
            navigate('/profile');
            onClose();
          }
        },
        {
          icon: GraduationCap,
          label: 'Add Education',
          action: () => {
            navigate('/profile');
            onClose();
          }
        }
      ];
    }
    
    // Default actions
    return [
      {
        icon: User,
        label: 'View Profile',
        action: () => {
          navigate('/profile');
          onClose();
        }
      },
      {
        icon: Target,
        label: 'Growth Cards',
        action: () => {
          navigate('/card');
          onClose();
        }
      },
      {
        icon: Briefcase,
        label: 'Opportunities',
        action: () => {
          navigate('/discovery');
          onClose();
        }
      }
    ];
  };

  const actions = getContextualActions();

  return (
    <MobileActionSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Actions"
    >
      <div className="space-y-3 p-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-200 touch-target"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-foreground font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </MobileActionSheet>
  );
}