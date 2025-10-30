/**
 * Phase 3.3: Join Organization Flow
 * Allows users to search for and request to join existing organizations
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/contexts/OrganizationContext";
import { markOnboardingComplete } from "@/services/onboarding/unifiedOnboardingService";
import { toast } from "sonner";
import { 
  Search, 
  Building2, 
  Loader2, 
  Check, 
  UserPlus,
  MapPin,
  Globe,
  Briefcase,
  Users,
  CheckCircle2
} from "lucide-react";
import type { Organization } from "@/types/organization";

interface JoinOrganizationFlowProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export function JoinOrganizationFlow({ onComplete, onBack }: JoinOrganizationFlowProps) {
  const { user } = useAuth();
  const { refreshOrganization } = useOrganization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  // Check for invitation token in URL
  const inviteToken = searchParams.get('invite_token');

  useEffect(() => {
    // If there's an invitation token, accept it automatically
    if (inviteToken) {
      handleAcceptInvitation(inviteToken);
    }
  }, [inviteToken]);

  // No longer need polling - user goes to dashboard immediately with pending state

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    try {
      setIsSearching(true);
      const results = await organizationService.searchOrganizations(searchQuery);
      setOrganizations(results);
      
      if (results.length === 0) {
        toast.info("No organizations found. Try a different search.");
      }
    } catch (error) {
      console.error("Error searching organizations:", error);
      toast.error("Failed to search organizations");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestToJoin = async (org: Organization) => {
    if (!user?.id) {
      toast.error("You must be logged in to join an organization");
      return;
    }

    try {
      setIsJoining(true);
      setSelectedOrg(org);
      
      await organizationService.requestToJoinOrganization(org.id);
      
      // Mark onboarding as complete so user can access pending dashboard
      await markOnboardingComplete(user.id, 'employer');
      
      toast.success(`Join request sent to ${org.name}!`);
      
      // Refresh organization context
      await refreshOrganization();
      
      // Navigate to dashboard immediately with pending state
      if (onComplete) {
        onComplete();
      } else {
        navigate('/employer-dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error("Error requesting to join:", error);
      toast.error(error.message || "Failed to send join request. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleAcceptInvitation = async (token: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to accept an invitation");
      return;
    }

    try {
      setIsJoining(true);
      
      const membership = await organizationService.acceptInvitation(token);
      
      // Mark onboarding complete for invited users
      await markOnboardingComplete(user.id, 'employer');
      
      toast.success("Invitation accepted! Welcome to the team.");
      
      // Refresh organization context
      await refreshOrganization();
      
      // Navigate to dashboard
      if (onComplete) {
        onComplete();
      } else {
        navigate('/employer-dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error(error.message || "Failed to accept invitation. The link may have expired.");
    } finally {
      setIsJoining(false);
    }
  };

  // If processing invitation
  if (inviteToken && isJoining) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto text-primary" />
              <p className="text-base sm:text-lg">Accepting invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No longer show confirmation screen - navigate immediately

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
          <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Join Your Organization</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Search for your company and request to join their team
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Find Your Company</CardTitle>
          <CardDescription className="text-sm">
            Search for your organization by name to send a join request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter your company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full h-12 text-base"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="w-full sm:w-auto sm:min-w-[120px] h-12"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 sm:mr-2" />
                  <span>Search</span>
                </>
              )}
            </Button>
          </div>

          {/* Search Results */}
          {organizations.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm sm:text-base">Search Results</Label>
              {organizations.map((org, index) => (
                <Card 
                  key={org.id} 
                  className="hover:border-primary transition-all duration-300 mobile-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 space-y-4">
                    {/* Header: Logo + Company Name */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 bg-white flex items-center justify-center overflow-hidden">
                        {org.logo_url ? (
                          <img 
                            src={org.logo_url} 
                            alt={org.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{org.name}</h3>
                        {(org.city || org.country) && (
                          <div className="flex items-center gap-1.5 text-sm sm:text-base text-primary font-medium mt-0.5">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {org.city && org.country 
                                ? `${org.city}, ${org.country}` 
                                : org.city || org.country}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Company Details - Vertical Stack */}
                    <div className="space-y-2.5">
                      {org.industry && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4 flex-shrink-0" />
                          <span>{org.industry}</span>
                        </div>
                      )}
                      
                      {org.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <a 
                            href={org.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {org.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      
                      {org.size_range && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>{org.size_range}</span>
                        </div>
                      )}
                      
                      {org.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                          {org.description}
                        </p>
                      )}
                      
                      {org.verification_status === 'verified' && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full w-fit">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button - Full Width */}
                    <Button 
                      onClick={() => handleRequestToJoin(org)} 
                      disabled={isJoining} 
                      className="w-full h-12 text-base"
                    >
                      {isJoining && selectedOrg?.id === org.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Request to Join'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Help Text */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <strong className="block mb-1">Can't find your company?</strong>
              Ask your administrator to invite you via email, or contact them to create an organization account first.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                navigate(-1);
              }
            }}
            className="w-full h-12 text-base"
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
