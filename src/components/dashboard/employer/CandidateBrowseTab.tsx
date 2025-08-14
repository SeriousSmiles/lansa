import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Candidate {
  user_id: string;
  name: string;
  title: string;
  about_text: string;
  skills: string[];
  profile_image: string;
  cover_color: string;
  highlight_color: string;
  professional_goal: string;
  experiences: any;
  education: any;
}

export function CandidateBrowseTab() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const { user } = useAuth();

  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_public')
        .select('*')
        .limit(50);

      if (error) throw error;

      setCandidates(data || []);
      setFilteredCandidates(data || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    let filtered = candidates;

    if (searchQuery) {
      filtered = filtered.filter(candidate =>
        candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.about_text?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (skillFilter) {
      filtered = filtered.filter(candidate =>
        candidate.skills?.some(skill =>
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }

    setFilteredCandidates(filtered);
  }, [searchQuery, skillFilter, candidates]);

  const handleInterest = async (candidateId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_user_id: user.id,
          target_user_id: candidateId,
          direction: 'right',
          context: 'employee'
        });

      if (error) throw error;
      toast.success('Interest shown! The candidate will be notified.');
    } catch (error) {
      console.error('Error showing interest:', error);
      toast.error('Failed to show interest');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#666666] animate-pulse">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2E2E2E]">Browse Candidates</h2>
          <p className="text-[#666666]">Discover talented professionals for your open positions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
          <Input
            placeholder="Search by name, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-64">
          <Input
            placeholder="Filter by skill"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-[#666666] mb-4">
        Showing {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
      </div>

      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2E2E2E]">No candidates found</h3>
                <p className="text-[#666666]">Try adjusting your search criteria</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.user_id} className="overflow-hidden">
              <div
                className="h-20"
                style={{ backgroundColor: candidate.cover_color || '#FF6B4A' }}
              />
              <CardContent className="p-6 -mt-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {candidate.profile_image ? (
                      <img
                        src={candidate.profile_image}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full border-4 border-white object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                        <span className="text-xl font-semibold text-gray-600">
                          {candidate.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-[#2E2E2E]">
                          {candidate.name || 'Anonymous User'}
                        </h3>
                        <p className="text-[#666666]">{candidate.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInterest(candidate.user_id)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Show Interest
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                    
                    {candidate.about_text && (
                      <p className="text-[#666666] mb-3 line-clamp-2">
                        {candidate.about_text}
                      </p>
                    )}
                    
                    {candidate.professional_goal && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-[#2E2E2E] mb-1">Professional Goal:</p>
                        <p className="text-sm text-[#666666]">{candidate.professional_goal}</p>
                      </div>
                    )}
                    
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-[#2E2E2E] mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 8).map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: candidate.highlight_color + '20',
                                color: candidate.highlight_color || '#FF6B4A'
                              }}
                            >
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 8 && (
                            <Badge variant="secondary" className="text-xs">
                              +{candidate.skills.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {candidate.experiences && Array.isArray(candidate.experiences) && candidate.experiences.length > 0 && (
                      <div className="text-sm text-[#666666]">
                        <span className="font-medium">Experience:</span> {candidate.experiences.length} position{candidate.experiences.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}