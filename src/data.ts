export interface BatchRecord {
  id: string;
  name: string;
  arrivalDate: string;
  birdCount: number;
  mortality: number;
}

export const initialBatches: BatchRecord[] = [
  { id: '1', name: 'Broiler Batch #1', arrivalDate: '2026-03-01', birdCount: 50, mortality: 0 }
];