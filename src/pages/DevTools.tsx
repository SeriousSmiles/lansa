import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function DevTools() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeedJobs = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-jobs', {
        method: 'POST'
      });

      if (error) throw error;

      setResult(data);
      toast.success(`Successfully seeded ${data.jobs} jobs and ${data.companies} companies!`);
    } catch (error: any) {
      console.error('Error seeding jobs:', error);
      toast.error(error.message || 'Failed to seed jobs');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRecomputeRecommendations = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('recompute-recommendations', {
        method: 'POST'
      });

      if (error) throw error;

      setResult(data);
      toast.success('Successfully recomputed recommendations!');
    } catch (error: any) {
      console.error('Error recomputing recommendations:', error);
      toast.error(error.message || 'Failed to recompute recommendations');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Developer Tools</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Seed Demo Jobs</CardTitle>
            <CardDescription>
              Create 100 diverse demo job listings across various categories, companies, and types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedJobs} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Jobs...
                </>
              ) : (
                'Seed 100 Jobs'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recompute Recommendations</CardTitle>
            <CardDescription>
              Run the recommendation algorithm to score jobs based on user preferences and behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRecomputeRecommendations} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Computing...
                </>
              ) : (
                'Recompute Recommendations'
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
