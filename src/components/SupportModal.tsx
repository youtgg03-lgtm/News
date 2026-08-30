import React from 'react';
import { X, HelpCircle, Keyboard, BookOpen, ShieldCheck, Zap } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#12151b] border border-[#232830] rounded-2xl w-full max-w-lg overflow-hidden shadow-glow-primary animate-in fade-in zoom-in duration-150 font-mono text-xs">
        
        {/* Header */}
        <div className="h-12 bg-[#0c0e12] border-b border-[#232830] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-[#eac169]" />
            <span className="font-extrabold text-sm text-[#e2e2e8]">
              TERMINAL GUIDE & HOTKEYS
            </span>
          </div>
          <button
            onClick={onClose}
            id="btn-close-support-modal"
            className="p-1 rounded-lg text-[#9a8f7e] hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#eac169]">
              <Keyboard className="w-4 h-4" />
              <span>KEYBOARD SHORTCUTS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex justify-between">
                <span className="text-[#9a8f7e]">Market Dashboard:</span>
                <span className="text-[#ffdf9e] font-bold">Alt + 1</span>
              </div>
              <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex justify-between">
                <span className="text-[#9a8f7e]">Signals & Pine:</span>
                <span className="text-[#ffdf9e] font-bold">Alt + 2</span>
              </div>
              <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex justify-between">
                <span className="text-[#9a8f7e]">Auto-Trade:</span>
                <span className="text-[#ffdf9e] font-bold">Alt + 3</span>
              </div>
              <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex justify-between">
                <span className="text-[#9a8f7e]">New Order Dialog:</span>
                <span className="text-[#ffdf9e] font-bold">N</span>
              </div>
              <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex justify-between">
                <span className="text-[#9a8f7e]">Terminal CLI Drawer:</span>
                <span className="text-[#ffdf9e] font-bold">~ (Tilde)</span>
              </div>
              <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex justify-between">
                <span className="text-[#9a8f7e]">Close Active Modal:</span>
                <span className="text-[#ffdf9e] font-bold">Esc</span>
              </div>
            </div>
          </div>

          {/* Pivot Theory */}
          <div className="space-y-1.5 bg-[#0c0e12] p-3 rounded-xl border border-[#232830]">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#42e39a]">
              <BookOpen className="w-4 h-4" />
              <span>PIVOT LEVEL FORMULAS</span>
            </div>
            <p className="text-[11px] text-[#9a8f7e] leading-relaxed">
              Standard Floor Pivots calculate key inflection points from previous session (High, Low, Close):
            </p>
            <div className="text-[11px] text-[#d1c5b2] space-y-1 pt-1">
              <div>• <strong>PP (Pivot Point)</strong> = (High + Low + Close) / 3</div>
              <div>• <strong>R1 / S1</strong> = (2 × PP) - Low / (2 × PP) - High</div>
              <div>• <strong>R2 / S2</strong> = PP + (High - Low) / PP - (High - Low)</div>
            </div>
          </div>

          {/* Super-User Key Guide */}
          <div className="space-y-1.5 bg-[#0c0e12] p-3 rounded-xl border border-[#232830]">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#eac169]">
              <Zap className="w-4 h-4" />
              <span>SUPER-USER ACCESS</span>
            </div>
            <p className="text-[11px] text-[#9a8f7e] leading-relaxed">
              To unlock custom bypass settings on the Order Ticket, apply the access key: <code className="text-[#ffdf9e] bg-[#1a1c20] px-1 rounded">SUPER-GOLD-888</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
