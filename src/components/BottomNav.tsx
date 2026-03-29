import React from 'react';
import { Grid, Sparkles, Library, Swords, Zap } from 'lucide-react';

export type Tab = 'idle' | 'gacha' | 'collection' | 'upgrade' | 'battle';

interface BottomNavProps {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  isDesktop?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setTab, isDesktop }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'idle', label: 'Idle', icon: <Grid size={20} /> },
    { id: 'gacha', label: 'Summon', icon: <Sparkles size={20} /> },
    { id: 'collection', label: 'Collection', icon: <Library size={20} /> },
    { id: 'upgrade', label: 'Upgrade', icon: <Zap size={20} /> },
    { id: 'battle', label: 'Battle', icon: <Swords size={20} /> },
  ];

  return (
    <div className="flex justify-around items-center p-2 border-t border-zinc-800 bg-zinc-950 sticky bottom-0 z-10 pb-4 relative">
      {isDesktop && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-zinc-500 pointer-events-none">
          <span className="border border-zinc-700 px-1 rounded bg-zinc-900">A</span>
        </div>
      )}
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setTab(tab.id)}
          className={`flex flex-col items-center justify-center p-2 w-full transition-colors ${
            currentTab === tab.id ? 'text-zinc-100' : 'text-zinc-600 hover:text-zinc-400'
          }`}
        >
          {tab.icon}
          <span className="text-xs mt-1 font-mono">{tab.label}</span>
        </button>
      ))}
      {isDesktop && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-zinc-500 pointer-events-none">
          <span className="border border-zinc-700 px-1 rounded bg-zinc-900">D</span>
        </div>
      )}
    </div>
  );
};
