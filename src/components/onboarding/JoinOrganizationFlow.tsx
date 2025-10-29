/**
 * Phase 3.3: Join Organization Flow
 * Allows users to search for and request to join existing organizations
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/contexts/OrganizationContext";
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
      
      toast.success(`Join request sent to ${org.name}!`);
      setRequestSent(true);
      
      // Refresh organization context
      await refreshOrganization();
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
      
      toast.success("Invitation accepted! Welcome to the team.");
      
      // Refresh organization context
      await refreshOrganization();
      
      // Complete onboarding
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
      <div className="w-full max-w-md mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-lg">Accepting invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Request sent confirmation
  if (requestSent && selectedOrg) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">Request Sent!</h2>
              <p className="text-muted-foreground">
                Your request to join <strong>{selectedOrg.name}</strong> has been sent to the
                organization admins for approval.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll receive a notification once your request is reviewed.
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Join Your Organization</h1>
        <p className="text-muted-foreground">
          Search for your company and request to join their team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Your Company</CardTitle>
          <CardDescription>
            Search for your organization by name to send a join request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter your company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Search Results */}
          {organizations.length > 0 && (
            <div className="space-y-3">
              <Label>Search Results</Label>
              {organizations.map((org) => (
                <Card key={org.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Logo */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 bg-white flex items-center justify-center overflow-hidden">
                        {org.logo_url ? (
                          <img 
                            src={org.logo_url} 
                            alt={org.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Organization Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{org.name}</h3>
                            
                            {/* Location Badge - PROMINENT */}
                            {(org.city || org.country) && (
                              <div className="flex items-center gap-1 text-sm text-primary font-medium mt-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {org.city && org.country 
                                  ? `${org.city}, ${org.country}` 
                                  : org.city || org.country}
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            onClick={() => handleRequestToJoin(org)} 
                            disabled={isJoining} 
                            size="sm"
                            className="ml-2"
                          >
                            {isJoining && selectedOrg?.id === org.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Request to Join'
                            )}
                          </Button>
                        </div>

                        {/* Secondary Info */}
                        <div className="space-y-1">
                          {org.industry && (
                            <p className="text-sm text-muted-foreground">
                              <Briefcase className="inline h-3.5 w-3.5 mr-1" />
                              {org.industry}
                            </p>
                          )}
                          
                          {org.website && (
                            <p className="text-sm text-muted-foreground truncate">
                              <Globe className="inline h-3.5 w-3.5 mr-1" />
                              <a 
                                href={org.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-primary underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {org.website}
                              </a>
                            </p>
                          )}
                          
                          {org.size_range && (
                            <p className="text-xs text-muted-foreground">
                              <Users className="inline h-3.5 w-3.5 mr-1" />
                              {org.size_range}
                            </p>
                          )}

                          {org.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {org.description}
                            </p>
                          )}
                        </div>

                        {/* Verification Badge */}
                        {org.verification_status === 'verified' && (
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified Organization
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Help Text */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Can't find your company?</strong> Ask your administrator to invite you via
              email, or contact them to create an organization account first.
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
            className="w-full"
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
