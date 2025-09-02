import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';
import { toast } from 'sonner';

export function MigrationBanner() {
  const { user } = useUser();
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const checkMigrationStatus = async () => {
      try {
        const { data } = await supabase
          .from('user_migration_mapping')
          .select('migration_status')
          .eq('supabase_user_id', user.id)
          .single();

        if (!data) {
          // User needs to be migrated
          setMigrationStatus('pending');
          setIsVisible(true);
        } else if (data.migration_status === 'invited') {
          setMigrationStatus('invited');
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking migration status:', error);
      }
    };

    checkMigrationStatus();
  }, [user?.id]);

  const handleStartMigration = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Create migration mapping entry
      const { error } = await supabase
        .from('user_migration_mapping')
        .upsert({
          supabase_user_id: user.id,
          migration_status: 'invited',
          invited_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast.success('Migration initiated! You will receive an invitation email soon.');
      setMigrationStatus('invited');
    } catch (error) {
      console.error('Error starting migration:', error);
      toast.error('Failed to start migration process');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible || !migrationStatus) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          {migrationStatus === 'pending' && (
            <span>
              <strong>Account Migration Available:</strong> Upgrade to our new authentication system with organization support.{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-orange-600 dark:text-orange-400"
                onClick={handleStartMigration}
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Migration'}
              </Button>
            </span>
          )}
          {migrationStatus === 'invited' && (
            <span>
              <strong>Migration Invitation Sent:</strong> Check your email for instructions to complete the migration.
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-auto p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}