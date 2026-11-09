export interface Activity {
  id: string;
  timestamp: string;
  description: string;
  type: 'success' | 'pending' | 'neutral' | 'issue' | 'archived';
}