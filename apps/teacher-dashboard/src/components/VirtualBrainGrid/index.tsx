import { useState } from 'react';
import type { Student } from '../../types/virtual-brain';
import { BrainCard } from './BrainCard';

interface VirtualBrainGridProps {
  students: Student[];
  onStudentClick: (student: Student) => void;
  onReorder?: (students: Student[]) => void;
}

export function VirtualBrainGrid({ students, onStudentClick, onReorder }: VirtualBrainGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;

    const newStudents = [...students];
    const draggedStudent = newStudents[draggedIndex];
    newStudents.splice(draggedIndex, 1);
    newStudents.splice(index, 0, draggedStudent);

    onReorder?.(newStudents);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {students.map((student, index) => (
        <div
          key={student.id}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          className={`transition-all ${
            dragOverIndex === index ? 'scale-105 opacity-50' : ''
          }`}
        >
          <BrainCard
            student={student}
            onClick={() => onStudentClick(student)}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
          />
        </div>
      ))}
    </div>
  );
}
