
import { useState } from "react";
import { EducationItemComponent } from "./EducationItem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EducationItem {
  id?: string;
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
}

interface EducationListProps {
  education: EducationItem[];
  onEdit?: (id: string, education: EducationItem) => Promise<void>;
  onRemove?: (id: string) => Promise<void>;
  highlightColor?: string;
}

export function EducationList({ 
  education, 
  onEdit, 
  onRemove,
  highlightColor = "#FF6B4A"
}: EducationListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setEducationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (onRemove && educationToDelete) {
      onRemove(educationToDelete);
    }
    setDeleteDialogOpen(false);
    setEducationToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        {education.map((edu, index) => (
          <EducationItemComponent
            key={edu.id || index}
            education={edu}
            index={index}
            totalItems={education.length}
            onEdit={onEdit}
            onDelete={handleDelete}
            highlightColor={highlightColor}
          />
        ))}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this education entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
