import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, Briefcase, GraduationCap, Mail, Wrench } from "lucide-react";
import { ContentBlockModal } from "./blocks/ContentBlockModal";
import { ContentBlockRenderer } from "./blocks/ContentBlockRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useActionTracking } from "@/hooks/useActionTracking";

interface ContentBlock {
  id: string;
  block_type: string;
  title: string | null;
  content: any;
  display_order: number;
  is_visible: boolean;
}

const blockTypes = [
  { type: 'about', label: 'About Me', icon: User, description: 'Tell your story and what makes you unique' },
  { type: 'experience', label: 'Work Experience', icon: Briefcase, description: 'Add your professional background' },
  { type: 'education', label: 'Education', icon: GraduationCap, description: 'Share your educational achievements' },
  { type: 'skills', label: 'Skills', icon: Wrench, description: 'Highlight your key competencies' },
  { type: 'contact', label: 'Contact Info', icon: Mail, description: 'Add ways for people to reach you' },
];

export function ProfileSetupPage() {
  const { user } = useAuth();
  const { track } = useActionTracking();
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadContentBlocks();
    }
  }, [user?.id]);

  const loadContentBlocks = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order');

      if (error) throw error;
      setContentBlocks(data || []);
    } catch (error) {
      console.error('Error loading content blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = (blockType: string) => {
    setSelectedBlockType(blockType);
    setEditingBlock(null);
    setIsModalOpen(true);
  };

  const handleEditBlock = (block: ContentBlock) => {
    setSelectedBlockType(block.block_type);
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  const handleSaveBlock = async (blockData: any) => {
    if (!user?.id) return;

    try {
      if (editingBlock) {
        // Update existing block
        const { error } = await supabase
          .from('content_blocks')
          .update({
            title: blockData.title,
            content: blockData.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBlock.id);

        if (error) throw error;
      } else {
        // Create new block
        const { error } = await supabase
          .from('content_blocks')
          .insert({
            user_id: user.id,
            block_type: selectedBlockType,
            title: blockData.title,
            content: blockData.content,
            display_order: contentBlocks.length,
          });

        if (error) throw error;
      }

      await loadContentBlocks();
      setIsModalOpen(false);
      setSelectedBlockType(null);
      setEditingBlock(null);
      
      track('profile_updated', { block_type: selectedBlockType });
    } catch (error) {
      console.error('Error saving content block:', error);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
      await loadContentBlocks();
    } catch (error) {
      console.error('Error deleting content block:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600 animate-pulse">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Build Your Professional Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create a compelling online resume that showcases your unique story. 
            Add the sections that matter most to you and make them your own.
          </p>
        </div>

        {/* Existing Blocks */}
        {contentBlocks.length > 0 && (
          <div className="mb-8 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Your Profile Sections</h2>
            {contentBlocks.map((block) => (
              <ContentBlockRenderer
                key={block.id}
                block={block}
                onEdit={() => handleEditBlock(block)}
                onDelete={() => handleDeleteBlock(block.id)}
              />
            ))}
          </div>
        )}

        {/* Add New Blocks */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {contentBlocks.length === 0 ? 'Get Started - Choose Your First Section' : 'Add More Sections'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blockTypes
              .filter(blockType => !contentBlocks.some(block => block.block_type === blockType.type))
              .map((blockType) => {
                const Icon = blockType.icon;
                return (
                  <Card
                    key={blockType.type}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#FF6B4A]"
                    onClick={() => handleAddBlock(blockType.type)}
                  >
                    <CardHeader className="text-center pb-2">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-[#FF6B4A]" />
                      <CardTitle className="text-lg">{blockType.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 text-sm mb-4">{blockType.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Empty State */}
        {contentBlocks.length === 0 && (
          <Card className="text-center py-12 bg-white border-2 border-dashed border-gray-300">
            <CardContent>
              <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Your profile is waiting for you!</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first section above. Each section you add will help build your professional story.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        <ContentBlockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          blockType={selectedBlockType}
          editingBlock={editingBlock}
          onSave={handleSaveBlock}
        />
      </div>
    </div>
  );
}
