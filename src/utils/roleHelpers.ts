import { supabase } from '@/integrations/supabase/client';

// Cache to reduce database queries for role checks
const roleCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a user has admin role (with caching)
 * @param userId - User ID to check
 * @returns Promise<boolean> - True if user is admin
 */
export async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.isAdmin;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    const isAdmin = !!data;
    roleCache.set(userId, { isAdmin, timestamp: Date.now() });

    return isAdmin;
  } catch (error) {
    console.error('Error in checkAdminRole:', error);
    return false;
  }
}

/**
 * Check if a user has a specific role
 * @param userId - User ID to check
 * @param role - Role to check for
 * @returns Promise<boolean> - True if user has the role
 */
export async function checkUserRole(
  userId: string, 
  role: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role as any)
      .maybeSingle();

    if (error) {
      console.error(`Error checking ${role} role:`, error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error(`Error in checkUserRole for ${role}:`, error);
    return false;
  }
}

/**
 * Get all roles for a user
 * @param userId - User ID to check
 * @returns Promise<string[]> - Array of role names
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data?.map(r => r.role) || [];
  } catch (error) {
    console.error('Error in getUserRoles:', error);
    return [];
  }
}
