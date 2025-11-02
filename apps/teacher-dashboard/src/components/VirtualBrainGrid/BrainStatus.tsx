import type { VirtualBrain } from '../../types/virtual-brain';

interface BrainStatusProps {
  status: VirtualBrain['status'];
}

export function BrainStatus({ status }: BrainStatusProps) {
  const statusConfig = {
    active: {
      color: 'bg-brain-active',
      animation: 'animate-brain-pulse',
      label: 'Active'
    },
    idle: {
      color: 'bg-brain-idle',
      animation: '',
      label: 'Idle'
    },
    processing: {
      color: 'bg-brain-processing',
      animation: 'animate-pulse',
      label: 'Processing'
    },
    offline: {
      color: 'bg-gray-300',
      animation: '',
      label: 'Offline'
    }
  };

  const config = statusConfig[status];

  return (
    <div 
      className={`brain-status-indicator ${config.color} ${config.animation}`}
      title={config.label}
    />
  );
}
