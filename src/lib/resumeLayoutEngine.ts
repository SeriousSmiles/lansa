import { 
  SectionInstance, 
  PageLayoutConfig, 
  SectionBounds, 
  ZoneBounds,
  ZoneName,
  LayoutStructure
} from '@/types/resumeSection';
import { ProfileDataReturn } from '@/hooks/useProfileData';
import { getSectionTemplate } from './resumeSectionTemplates';

const MIN_SECTION_WIDTH = 200;

export class ResumeLayoutEngine {
  private canvasWidth = 794; // A4 width at 96 DPI
  private canvasHeight = 1123; // A4 height at 96 DPI
  private margins = { top: 40, bottom: 40, left: 40, right: 40 };

  calculateLayout(
    sections: SectionInstance[],
    layoutStructure: LayoutStructure,
    profileData: ProfileDataReturn
  ): Map<string, SectionBounds> {
    const layout = new Map<string, SectionBounds>();
    
    // Calculate zone dimensions based on structure
    const zones = this.calculateZones(layoutStructure);
    
    // Group sections by zone
    const sectionsByZone = this.groupSectionsByZone(sections);
    
    // Calculate positions within each zone
    for (const [zoneName, zoneBounds] of Object.entries(zones)) {
      const zoneSections = sectionsByZone.get(zoneName as ZoneName) || [];
      const positioned = this.layoutSectionsInZone(
        zoneSections,
        zoneBounds,
        profileData
      );
      
      positioned.forEach((bounds, sectionId) => {
        layout.set(sectionId, bounds);
      });
    }
    
    return layout;
  }

  private calculateZones(structure: LayoutStructure): Record<string, ZoneBounds> {
    const zones: Record<string, ZoneBounds> = {};
    const contentWidth = this.canvasWidth - this.margins.left - this.margins.right;
    const contentHeight = this.canvasHeight - this.margins.top - this.margins.bottom;
    
    switch (structure) {
      case 'single':
        zones.header = {
          x: this.margins.left,
          y: this.margins.top,
          width: contentWidth,
          height: 0 // Will be calculated dynamically
        };
        zones.main = {
          x: this.margins.left,
          y: this.margins.top,
          width: contentWidth,
          height: contentHeight
        };
        break;
        
      case 'two-column':
      case 'sidebar-left':
        zones.header = {
          x: this.margins.left,
          y: this.margins.top,
          width: contentWidth,
          height: 0
        };
        zones.leftSidebar = {
          x: this.margins.left,
          y: this.margins.top + 80,
          width: 240,
          height: contentHeight - 80
        };
        zones.main = {
          x: this.margins.left + 260,
          y: this.margins.top + 80,
          width: contentWidth - 260,
          height: contentHeight - 80
        };
        break;
        
      case 'sidebar-right':
        zones.header = {
          x: this.margins.left,
          y: this.margins.top,
          width: contentWidth,
          height: 0
        };
        zones.main = {
          x: this.margins.left,
          y: this.margins.top + 80,
          width: contentWidth - 260,
          height: contentHeight - 80
        };
        zones.rightSidebar = {
          x: this.margins.left + contentWidth - 240,
          y: this.margins.top + 80,
          width: 240,
          height: contentHeight - 80
        };
        break;
        
      case 'three-column':
        zones.header = {
          x: this.margins.left,
          y: this.margins.top,
          width: contentWidth,
          height: 0
        };
        const colWidth = (contentWidth - 40) / 3;
        zones.leftSidebar = {
          x: this.margins.left,
          y: this.margins.top + 80,
          width: colWidth,
          height: contentHeight - 80
        };
        zones.main = {
          x: this.margins.left + colWidth + 20,
          y: this.margins.top + 80,
          width: colWidth,
          height: contentHeight - 80
        };
        zones.rightSidebar = {
          x: this.margins.left + 2 * colWidth + 40,
          y: this.margins.top + 80,
          width: colWidth,
          height: contentHeight - 80
        };
        break;
    }
    
    return zones;
  }

  private groupSectionsByZone(sections: SectionInstance[]): Map<ZoneName, SectionInstance[]> {
    const grouped = new Map<ZoneName, SectionInstance[]>();
    
    sections.forEach(section => {
      const zone = section.zone || 'main';
      if (!grouped.has(zone)) {
        grouped.set(zone, []);
      }
      grouped.get(zone)!.push(section);
    });
    
    return grouped;
  }

  private layoutSectionsInZone(
    sections: SectionInstance[],
    zoneBounds: ZoneBounds,
    profileData: ProfileDataReturn
  ): Map<string, SectionBounds> {
    const positioned = new Map<string, SectionBounds>();
    let currentY = zoneBounds.y;
    
    // Sort sections by position
    const sortedSections = [...sections].sort((a, b) => a.position - b.position);
    
    sortedSections.forEach(section => {
      if (!section.is_visible) return;
      
      // Calculate section height based on content
      const height = this.calculateSectionHeight(section, profileData);
      
      // Calculate width with smart adjustments
      const width = this.calculateSectionWidth(section, zoneBounds.width);
      
      positioned.set(section.id, {
        x: zoneBounds.x,
        y: currentY,
        width,
        height
      });
      
      currentY += height + 20; // 20px spacing between sections
    });
    
    return positioned;
  }

  private calculateSectionWidth(section: SectionInstance, zoneWidth: number): number {
    // Auto-adjust if zone is too narrow
    if (zoneWidth < MIN_SECTION_WIDTH * 2 && section.width !== 'full') {
      return zoneWidth; // Force full width
    }
    
    switch (section.width) {
      case 'full':
        return zoneWidth;
      case 'half':
        return Math.max((zoneWidth - 10) / 2, MIN_SECTION_WIDTH);
      case 'third':
        if (zoneWidth < MIN_SECTION_WIDTH * 3) {
          return Math.max((zoneWidth - 10) / 2, MIN_SECTION_WIDTH);
        }
        return Math.max((zoneWidth - 20) / 3, MIN_SECTION_WIDTH);
      default:
        return zoneWidth;
    }
  }

  calculateSectionHeight(section: SectionInstance, profileData: ProfileDataReturn): number {
    const template = getSectionTemplate(section.component_type);
    
    switch (section.component_type) {
      case 'header':
        return 100;
        
      case 'experience':
        const expCount = profileData.experiences?.length || 0;
        return 50 + (expCount * (template.layout.entryHeight || 120));
        
      case 'education':
        const eduCount = profileData.educationItems?.length || 0;
        return 50 + (eduCount * (template.layout.entryHeight || 100));
        
      case 'skills':
        const skillCount = profileData.userSkills?.length || 0;
        return 50 + Math.ceil(skillCount / 3) * 30;
        
      case 'languages':
        const langCount = profileData.userLanguages?.length || 0;
        return 50 + (langCount * 25);
        
      case 'projects':
        const projCount = profileData.userProjects?.length || 0;
        return 50 + (projCount * 100);
        
      case 'certifications':
        const certCount = profileData.userCertifications?.length || 0;
        return 50 + (certCount * 40);
        
      case 'achievements':
        const achCount = profileData.userAchievements?.length || 0;
        return 50 + (achCount * 30);
        
      case 'summary':
        const summaryLength = profileData.aboutText?.length || 0;
        return 80 + Math.ceil(summaryLength / 100) * 20;
        
      default:
        return template.layout.height || template.layout.minHeight || 100;
    }
  }

  getResponsiveFontSize(baseFontSize: number, sectionWidth: number): number {
    const widthRatio = sectionWidth / this.canvasWidth;
    
    if (widthRatio < 0.35) {
      return Math.max(baseFontSize - 2, 8);
    } else if (widthRatio < 0.5) {
      return Math.max(baseFontSize - 1, 9);
    }
    
    return baseFontSize;
  }
}
