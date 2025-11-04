/**
 * Admin Product Updates Service
 * Handles admin CRUD operations for product updates
 */

import { supabase } from '@/integrations/supabase/client';
import { ProductUpdate } from './productUpdatesService';

export interface CreateUpdateData {
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'bugfix' | 'announcement';
  version?: string;
  image_url?: string;
  link_url?: string;
  published_at: string;
  icon_name?: string;
  badge_text?: string;
  badge_color?: string;
}

export const adminProductUpdatesService = {
  /**
   * Get all product updates (published and unpublished)
   */
  async getAllUpdates(): Promise<ProductUpdate[]> {
    const { data, error } = await supabase
      .from('product_updates')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ProductUpdate[];
  },

  /**
   * Create a new product update
   */
  async createUpdate(updateData: CreateUpdateData): Promise<ProductUpdate> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('product_updates')
      .insert({
        ...updateData,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ProductUpdate;
  },

  /**
   * Update an existing product update
   */
  async updateUpdate(id: string, updateData: Partial<CreateUpdateData> & { image_url?: string }): Promise<ProductUpdate> {
    const { data, error } = await supabase
      .from('product_updates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductUpdate;
  },

  /**
   * Delete a product update
   */
  async deleteUpdate(id: string): Promise<void> {
    const { error } = await supabase.from('product_updates').delete().eq('id', id);

    if (error) throw error;
  },

  /**
   * Upload image for product update
   */
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-updates')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-updates').getPublicUrl(filePath);

    return publicUrl;
  },

  /**
   * Delete image from storage
   */
  async deleteImage(imageUrl: string): Promise<void> {
    const path = imageUrl.split('/product-updates/')[1];
    if (!path) return;

    const { error } = await supabase.storage.from('product-updates').remove([path]);

    if (error) throw error;
  },
};
