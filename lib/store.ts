import { create } from 'zustand';

export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  box_count: number;
}

interface MemeState {
  prompt: string;
  tone: 'funny' | 'wholesome' | 'absurd' | 'political';
  selectedTemplate: MemeTemplate | null;
  templates: MemeTemplate[];
  textStyle: 'classic-white' | 'simple-black' | 'impact-classic';
  captions: string[];
  generatedMemeUrl: string | null;
  setPrompt: (prompt: string) => void;
  setTone: (tone: 'funny' | 'wholesome' | 'absurd' | 'political') => void;
  setSelectedTemplate: (template: MemeTemplate | null) => void;
  setTemplates: (templates: MemeTemplate[]) => void;
  setTextStyle: (style: 'classic-white' | 'simple-black' | 'impact-classic') => void;
  setCaptions: (captions: string[]) => void;
  setGeneratedMemeUrl: (url: string | null) => void;
}

export const useMemeStore = create<MemeState>((set) => ({
  prompt: '',
  tone: 'funny',
  selectedTemplate: null,
  templates: [],
  textStyle: 'classic-white',
  captions: [],
  generatedMemeUrl: null,
  setPrompt: (prompt) => set({ prompt }),
  setTone: (tone) => set({ tone }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setTemplates: (templates) => set({ templates }),
  setTextStyle: (style) => set({ textStyle: style }),
  setCaptions: (captions) => set({ captions }),
  setGeneratedMemeUrl: (url) => set({ generatedMemeUrl: url }),
}));