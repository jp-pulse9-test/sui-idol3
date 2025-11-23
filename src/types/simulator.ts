export interface HistoryNode {
  id: string;
  year: string;
  eventName: string;
  description: string;
  influence: number;
  x: number;
  y: number;
  isAltered?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Fragment {
  id: string;
  name: string;
  description: string;
  discoveredAt: Date;
  color: string;
}

export interface SimulatorState {
  nodes: HistoryNode[];
  fragments: Fragment[];
  status: 'initializing' | 'ready' | 'error';
}
