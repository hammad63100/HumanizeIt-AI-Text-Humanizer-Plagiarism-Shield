import { create } from 'zustand';
import { RewriteMode, RewriteTone, HumanizeJobResult, PlagiarismResult } from '@/types/api';

interface ToolState {
  inputText: string;
  outputText: string;
  mode: RewriteMode;
  tone: RewriteTone;
  activeTab: 'result' | 'diff' | 'scores' | 'plagiarism';
  isHumanizing: boolean;
  jobProgress: number;
  currentJob: HumanizeJobResult | null;
  plagiarismResult: PlagiarismResult | null;
  isCheckingPlagiarism: boolean;
  userPlan: 'free' | 'pro' | 'premium' | 'team';
  upgradeModalOpen: boolean;
  selectedSentenceIndex: number | null;
  selectedSentence: string | null;
  isRewritingSentence: boolean;
  activeVoiceProfileId?: string;

  // Actions
  setInputText: (text: string) => void;
  setOutputText: (text: string) => void;
  setMode: (mode: RewriteMode) => void;
  setTone: (tone: RewriteTone) => void;
  setActiveTab: (tab: 'result' | 'diff' | 'scores' | 'plagiarism') => void;
  setIsHumanizing: (val: boolean) => void;
  setJobProgress: (val: number) => void;
  setCurrentJob: (job: HumanizeJobResult | null) => void;
  setPlagiarismResult: (res: PlagiarismResult | null) => void;
  setIsCheckingPlagiarism: (val: boolean) => void;
  setUserPlan: (plan: 'free' | 'pro' | 'premium' | 'team') => void;
  setUpgradeModalOpen: (open: boolean) => void;
  setSelectedSentence: (sentence: string | null, index: number | null) => void;
  setIsRewritingSentence: (val: boolean) => void;
  setActiveVoiceProfileId: (id?: string) => void;
  resetEditor: () => void;
}

const DEFAULT_INPUT = `In today's fast-paced digital era, it is of paramount importance to leverage artificial intelligence for optimizing workflows. Furthermore, organizations must systematically utilize comprehensive methodologies to drive unprecedented innovation and maximize cross-functional synergies across diverse paradigms.`;

export const useToolStore = create<ToolState>((set) => ({
  inputText: typeof window !== 'undefined' ? (sessionStorage.getItem('humanize_input') || DEFAULT_INPUT) : DEFAULT_INPUT,
  outputText: '',
  mode: 'balanced',
  tone: 'professional',
  activeTab: 'result',
  isHumanizing: false,
  jobProgress: 0,
  currentJob: null,
  plagiarismResult: null,
  isCheckingPlagiarism: false,
  userPlan: 'free',
  upgradeModalOpen: false,
  selectedSentenceIndex: null,
  selectedSentence: null,
  isRewritingSentence: false,
  activeVoiceProfileId: undefined,

  setInputText: (text: string) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('humanize_input', text);
      } catch (e) {
        // ignore
      }
    }
    set({ inputText: text });
  },

  setOutputText: (text: string) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('humanize_output', text);
      } catch (e) {
        // ignore
      }
    }
    set({ outputText: text });
  },

  setMode: (mode: RewriteMode) => set({ mode }),
  setTone: (tone: RewriteTone) => set({ tone }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setIsHumanizing: (isHumanizing) => set({ isHumanizing }),
  setJobProgress: (jobProgress) => set({ jobProgress }),
  setCurrentJob: (currentJob) => set({ currentJob }),
  setPlagiarismResult: (plagiarismResult) => set({ plagiarismResult }),
  setIsCheckingPlagiarism: (isCheckingPlagiarism) => set({ isCheckingPlagiarism }),
  setUserPlan: (userPlan) => set({ userPlan }),
  setUpgradeModalOpen: (upgradeModalOpen) => set({ upgradeModalOpen }),
  setSelectedSentence: (selectedSentence, selectedSentenceIndex) => 
    set({ selectedSentence, selectedSentenceIndex }),
  setIsRewritingSentence: (isRewritingSentence) => set({ isRewritingSentence }),
  setActiveVoiceProfileId: (activeVoiceProfileId) => set({ activeVoiceProfileId }),

  resetEditor: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('humanize_input');
      sessionStorage.removeItem('humanize_output');
    }
    set({
      inputText: '',
      outputText: '',
      currentJob: null,
      plagiarismResult: null,
      jobProgress: 0,
      selectedSentence: null,
      selectedSentenceIndex: null
    });
  }
}));
