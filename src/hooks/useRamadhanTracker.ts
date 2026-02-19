import { useContext } from 'react';
import { RamadhanTrackerContext, DailyIbadah } from '../context/RamadhanTrackerContext';

// Re-export type for convenience
export type { DailyIbadah };

export function useRamadhanTracker() {
  const context = useContext(RamadhanTrackerContext);

  if (!context) {
    throw new Error('useRamadhanTracker must be used within a RamadhanTrackerProvider');
  }

  return context;
}
