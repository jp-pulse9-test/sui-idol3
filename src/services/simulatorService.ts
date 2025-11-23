import { HistoryNode, ChatMessage, Fragment } from '@/types/simulator';

/**
 * Mock data for demonstration
 * In production, this would call Gemini AI or other backend services
 */

export const initializeHistory = async (): Promise<HistoryNode[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Show only 6-8 high-influence events initially (90+)
  const coreEvents = [
    { year: '1945', eventName: 'Trinity Test', description: 'First nuclear detonation in New Mexico.', influence: 99 },
    { year: '1969', eventName: 'Apollo 11', description: 'First human moon landing.', influence: 95 },
    { year: '1914', eventName: 'WWI Begins', description: 'The Great War starts in Europe.', influence: 94 },
    { year: '1991', eventName: 'World Wide Web', description: 'Internet becomes public.', influence: 96 },
    { year: '2001', eventName: '9/11 Attacks', description: 'Terrorist attacks on USA.', influence: 93 },
    { year: '2020', eventName: 'COVID-19 Pandemic', description: 'Global health crisis.', influence: 97 },
    { year: '2007', eventName: 'iPhone Launch', description: 'Beginning of smartphone era.', influence: 92 },
  ];

  return coreEvents.map((item, index) => ({
    ...item,
    id: `archive-node-${index}`,
    x: 15 + (index % 3) * 30 + Math.random() * 15,
    y: 20 + Math.floor(index / 3) * 30 + Math.random() * 15,
  }));
};

export const getFutureScenarios = (): HistoryNode[] => {
  const scenarios = [
    {
      year: '2026',
      eventName: 'The Algorithmic Fracture',
      description: 'AI error corrupts global banking ledgers.',
      influence: 88
    },
    {
      year: '2031',
      eventName: 'The Wet Bulb Crisis',
      description: 'South Asia exceeds survivability heat limits.',
      influence: 92
    },
    {
      year: '2037',
      eventName: 'The Deepfake Insurrection',
      description: 'Synthetic video causes preemptive strikes.',
      influence: 90
    },
    {
      year: '2042',
      eventName: 'The Lithium Wars',
      description: 'Corporate PMCs seize lithium reserves.',
      influence: 85
    },
    {
      year: '2048',
      eventName: 'The Antibiotic Collapse',
      description: 'Super-resistant bacteria render surgery impossible.',
      influence: 95
    },
    {
      year: '2080',
      eventName: 'Project Gaia',
      description: 'Bio-engineering creates new atmosphere. Hope emerges.',
      influence: 100
    }
  ];

  return scenarios.map((item, index) => ({
    ...item,
    id: `future-node-${index}`,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    isAltered: true
  }));
};

export const sendSimulatorMessage = async (
  history: ChatMessage[],
  nodes: HistoryNode[],
  lastUserMessage: string
): Promise<{
  response: string;
  newFragment?: Fragment;
  newNode?: HistoryNode;
}> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock response based on keywords
  let response = "Processing query... ";
  
  if (lastUserMessage.toLowerCase().includes('access')) {
    response = "Data retrieved from Old Earth archives. Cross-referencing historical impact scores...";
  } else if (lastUserMessage.toLowerCase().includes('what if')) {
    response = "Calculating alternate timeline branch... New probability node generated.";
    
    return {
      response,
      newNode: {
        id: `node-branch-${Date.now()}`,
        year: '2025',
        eventName: 'Alternate Timeline',
        description: lastUserMessage.substring(0, 50),
        influence: 70,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        isAltered: true
      }
    };
  } else {
    response = "Query acknowledged. The Old Earth Simulator is analyzing patterns across " + nodes.length + " historical nodes.";
  }

  return { response };
};
