import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CertificationItem } from "./profileTypes";

interface UseProfileCertificationsProps {
  userId: string | undefined;
}

export function useProfileCertifications({ userId }: UseProfileCertificationsProps) {
  const [userCertifications, setUserCertifications] = useState<CertificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to fetch certifications from database
  const fetchCertifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profile_certifications')
        .select('*')
        .eq('user_id', userId)
        .order('issue_date', { ascending: false });

      if (error) throw error;

      const certifications: CertificationItem[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        issuer: row.issuer,
        issue_date: row.issue_date || undefined,
        credential_id: row.credential_id || undefined,
        credential_url: row.credential_url || undefined,
        description: row.description || undefined
      }));

      setUserCertifications(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      toast({
        title: "Error loading certifications",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new certification
  const addCertification = async (cert: CertificationItem) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profile_certifications')
        .insert({
          user_id: userId,
          title: cert.title,
          issuer: cert.issuer,
          issue_date: cert.issue_date || null,
          credential_id: cert.credential_id || null,
          credential_url: cert.credential_url || null,
          description: cert.description || null
        })
        .select()
        .single();

      if (error) throw error;

      const newCert: CertificationItem = {
        id: data.id,
        title: data.title,
        issuer: data.issuer,
        issue_date: data.issue_date || undefined,
        credential_id: data.credential_id || undefined,
        credential_url: data.credential_url || undefined,
        description: data.description || undefined
      };

      setUserCertifications(prev => [newCert, ...prev]);
      
      toast({
        title: "Certification added",
        description: `${cert.title} has been added to your profile.`,
      });
    } catch (error) {
      console.error("Error adding certification:", error);
      toast({
        title: "Error adding certification",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to edit a certification
  const editCertification = async (id: string, updatedCert: CertificationItem) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_profile_certifications')
        .update({
          title: updatedCert.title,
          issuer: updatedCert.issuer,
          issue_date: updatedCert.issue_date || null,
          credential_id: updatedCert.credential_id || null,
          credential_url: updatedCert.credential_url || null,
          description: updatedCert.description || null
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setUserCertifications(prev => 
        prev.map(cert => cert.id === id ? { ...updatedCert, id } : cert)
      );
      
      toast({
        title: "Certification updated",
        description: `${updatedCert.title} has been updated.`,
      });
    } catch (error) {
      console.error("Error updating certification:", error);
      toast({
        title: "Error updating certification",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to remove a certification
  const removeCertification = async (id: string) => {
    if (!userId) return;
    
    try {
      const certToRemove = userCertifications.find(cert => cert.id === id);
      
      const { error } = await supabase
        .from('user_profile_certifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setUserCertifications(prev => prev.filter(cert => cert.id !== id));
      
      toast({
        title: "Certification removed",
        description: `${certToRemove?.title || 'Certification'} has been removed from your profile.`,
      });
    } catch (error) {
      console.error("Error removing certification:", error);
      toast({
        title: "Error removing certification",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    userCertifications,
    setUserCertifications,
    isLoading,
    fetchCertifications,
    addCertification,
    editCertification,
    removeCertification
  };
}