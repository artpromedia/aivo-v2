interface FocusIndicatorProps {
  level: number; // 0-100
}

export function FocusIndicator({ level }: FocusIndicatorProps) {
  const getColorClass = () => {
    if (level >= 70) return 'bg-focus-high';
    if (level >= 40) return 'bg-focus-medium';
    return 'bg-focus-low';
  };

  return (
    <div className="focus-meter">
      <div 
        className={`h-full transition-all duration-500 ${getColorClass()}`}
        style={{ width: `${level}%` }}
      />
    </div>
  );
}
