import React, { useState } from 'react';
import { Settings, X, Check } from 'lucide-react';
import { formatNumber } from '../lib/gameMath';

interface TopBarProps {
  bits: number;
  productionRate: number;
  productionBreakdown: {
    baseProd: number;
    totalMultiplier: number;
    finalProd: number;
  };
  onReset?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ bits, productionRate, productionBreakdown, onReset }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
      {onReset && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isConfirming ? (
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 animate-in fade-in slide-in-from-right-2 duration-200">
              <span className="text-[10px] uppercase font-bold text-zinc-500 px-2">Reset?</span>
              <button 
                onClick={() => {
                  onReset();
                  setIsConfirming(false);
                }}
                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                title="Confirm Reset"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={() => setIsConfirming(false)}
                className="p-1.5 text-zinc-400 hover:bg-zinc-800 rounded-md transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsConfirming(true)}
              className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
              title="Reset Data"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      )}
      <div className="text-4xl font-bold tracking-tight text-zinc-100 mb-1">
        {formatNumber(bits)}
      </div>
      <div className="text-sm text-zinc-400 font-mono flex items-center gap-1">
        <span className="text-zinc-500">+</span>
        <span>{formatNumber(productionBreakdown.baseProd)}</span>
        <span className="text-zinc-600 text-[10px]">bps</span>
        <span className="text-zinc-500 mx-0.5">*</span>
        <span className="text-green-500/80">{(productionBreakdown.totalMultiplier * 100).toFixed(0)}%</span>
        <span className="text-zinc-500 mx-0.5">=</span>
        <span className="text-zinc-300 font-bold">{formatNumber(productionBreakdown.finalProd)}</span>
        <span className="text-zinc-500 text-[10px] ml-0.5">/ sec</span>
      </div>
    </div>
  );
};
