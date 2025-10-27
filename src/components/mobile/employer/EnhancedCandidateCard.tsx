import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, GraduationCap, Award, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscoveryProfile } from "@/services/discoveryService";

interface EnhancedCandidateCardProps {
  profile: DiscoveryProfile;
  className?: string;
}

export function EnhancedCandidateCard({ profile, className }: EnhancedCandidateCardProps) {
  return (
    <div 
      className={cn(
        "w-full h-full flex flex-col overflow-hidden rounded-2xl bg-card",
        className
      )}
    >
      {/* Cover header with gradient */}
      <div 
        className="relative p-6 pb-16 flex-shrink-0"
        style={{ 
          background: profile.cover_color 
            ? `linear-gradient(135deg, ${profile.cover_color}, ${profile.highlight_color || '#FF6B4A'})` 
            : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)))'
        }}
      >
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20 ring-4 ring-white/30 shadow-lg flex-shrink-0">
            <AvatarImage src={profile.profile_image} alt={profile.name} />
            <AvatarFallback 
              style={{ backgroundColor: profile.highlight_color || '#FF6B4A' }}
              className="text-white text-xl font-semibold"
            >
              {profile.name?.charAt(0) || <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 text-white">
            <h2 className="text-2xl font-bold mb-1 break-words">{profile.name}</h2>
            <p className="text-white/90 text-lg mb-2 break-words">{profile.title}</p>
            {profile.location && (
              <p className="text-white/80 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </p>
            )}
            {profile.professional_goal && (
              <p className="text-white/80 text-sm font-medium mt-2 line-clamp-2">{profile.professional_goal}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto bg-background relative -mt-8 rounded-t-3xl">
        <div className="p-6 space-y-6">
          {/* About section */}
          {profile.about_text && (
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-lg">About</h4>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                {profile.about_text}
              </p>
            </div>
          )}

          {/* Skills section */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground text-lg mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 8).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs font-medium"
                    style={{ 
                      backgroundColor: `${profile.highlight_color || '#FF6B4A'}15`,
                      borderColor: `${profile.highlight_color || '#FF6B4A'}30`,
                      color: profile.highlight_color || '#FF6B4A'
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 8 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-muted"
                  >
                    +{profile.skills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Latest Experience */}
          {profile.experiences && profile.experiences.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${profile.highlight_color || '#FF6B4A'}20` }}
                >
                  <Briefcase 
                    className="w-3.5 h-3.5" 
                    style={{ color: profile.highlight_color || '#FF6B4A' }}
                  />
                </div>
                Latest Experience
              </h4>
              {profile.experiences.slice(0, 1).map((exp, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm font-semibold text-foreground">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{exp.subtitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{exp.period}</p>
                  {exp.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {profile.education && profile.education.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${profile.highlight_color || '#FF6B4A'}20` }}
                >
                  <GraduationCap 
                    className="w-3.5 h-3.5" 
                    style={{ color: profile.highlight_color || '#FF6B4A' }}
                  />
                </div>
                Education
              </h4>
              {profile.education.slice(0, 1).map((edu, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm font-semibold text-foreground">{edu.title}</p>
                  <p className="text-xs text-muted-foreground">{edu.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{edu.period}</p>
                </div>
              ))}
            </div>
          )}

          {/* Featured Achievements */}
          {profile.achievements && profile.achievements.filter(a => a.isFeatured).length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${profile.highlight_color || '#FF6B4A'}20` }}
                >
                  <Award 
                    className="w-3.5 h-3.5" 
                    style={{ color: profile.highlight_color || '#FF6B4A' }}
                  />
                </div>
                Key Achievements
              </h4>
              <div className="space-y-2">
                {profile.achievements.filter(a => a.isFeatured).slice(0, 2).map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-background/50"
                  >
                    <div 
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: profile.highlight_color || '#FF6B4A' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages (if available) */}
          {profile.languages && profile.languages.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="font-semibold text-foreground text-sm mb-3">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
