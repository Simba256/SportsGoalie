'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Loader2,
  UserPlus,
  Users,
  Check,
} from 'lucide-react';
import { userService } from '@/lib/database';
import { User } from '@/types';
import { toast } from 'sonner';

interface StudentSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  onStudentAdded: () => void;
}

export function StudentSearchDialog({
  open,
  onOpenChange,
  coachId,
  onStudentAdded,
}: StudentSearchDialogProps) {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Load available students when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableStudents();
    } else {
      // Reset state when dialog closes
      setSelectedStudent(null);
      setSearchQuery('');
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      loadAvailableStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadAvailableStudents = async () => {
    try {
      setLoading(true);
      const result = await userService.getAvailableStudentsForCoach(coachId, {
        searchTerm: searchQuery || undefined,
        limit: 50,
      });

      if (result.success && result.data) {
        setStudents(result.data.items);
      } else {
        toast.error('Failed to load available students');
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load available students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;

    try {
      setAdding(true);
      const result = await userService.assignStudentToCoach(selectedStudent.id, coachId);

      if (result.success) {
        toast.success(`${selectedStudent.displayName} added to your roster`);
        onStudentAdded();
        onOpenChange(false);
      } else {
        const errorMessage = result.error?.code === 'ALREADY_ASSIGNED'
          ? 'This student is already assigned to another coach'
          : result.error?.message || 'Failed to add student';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to add student:', error);
      toast.error('Failed to add student to roster');
    } finally {
      setAdding(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Student to Roster
          </DialogTitle>
          <DialogDescription>
            Search for students with custom workflow who haven't been assigned to a coach yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Student List */}
          <ScrollArea className="h-[300px] border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm text-center px-4">
                  {searchQuery
                    ? 'No students found matching your search'
                    : 'No unassigned students with custom workflow available'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-accent/50 ${
                      selectedStudent?.id === student.id
                        ? 'border-primary bg-accent shadow-sm'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.profileImage} alt={student.displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(student.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{student.displayName}</h4>
                          {selectedStudent?.id === student.id && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.email}
                        </p>
                        {student.studentNumber && (
                          <p className="text-xs text-muted-foreground">
                            ID: {student.studentNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected Student Summary */}
          {selectedStudent && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedStudent.profileImage} alt={selectedStudent.displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedStudent.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedStudent.displayName}</h4>
                  <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                  {selectedStudent.studentNumber && (
                    <p className="text-xs text-muted-foreground">
                      ID: {selectedStudent.studentNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddStudent}
            disabled={!selectedStudent || adding}
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add to Roster
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
