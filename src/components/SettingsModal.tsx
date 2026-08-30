import React, { useState } from 'react';
import { X, Settings, Volume2, Shield, Sliders, Bell, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound
}) => {
  if (!isOpen) return null;

  const [latencySim, setLatencySim] = useState<'low' | 'ultra' | 'normal'>('low');
  const [flickerFx, setFlickerFx] = useState<boolean>(true);
  const [autoSlippageGuard, setAutoSlippageGuard] = useState<boolean>(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#12151b] border border-[#232830] rounded-2xl w-full max-w-md overflow-hidden shadow-glow-primary animate-in fade-in zoom-in duration-150 font-mono text-xs">
        
        {/* Header */}
        <div className="h-12 bg-[#0c0e12] border-b border-[#232830] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-[#eac169]" />
            <span className="font-extrabold text-sm text-[#e2e2e8]">
              TERMINAL CONFIGURATION
            </span>
          </div>
          <button
            onClick={onClose}
            id="btn-close-settings-modal"
            className="p-1 rounded-lg text-[#9a8f7e] hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Audio Alerts */}
          <div className="bg-[#0c0e12] p-3 rounded-xl border border-[#232830] flex items-center justify-between">
            <div>
              <div className="font-bold text-[#e2e2e8]">Audio & Execution Chimes</div>
              <div className="text-[11px] text-[#9a8f7e]">Play alert sounds on signals & order fills</div>
            </div>
            <button
              onClick={onToggleSound}
              id="btn-settings-sound"
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                soundEnabled ? 'bg-[#42e39a] text-[#0c0e12]' : 'bg-[#282a2e] text-[#9a8f7e]'
              }`}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Latency Pipeline */}
          <div className="bg-[#0c0e12] p-3 rounded-xl border border-[#232830] space-y-2">
            <span className="text-[#9a8f7e]">ROUTING PIPELINE LATENCY</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ultra', label: 'Ultra (5ms)', desc: 'Direct DMA' },
                { id: 'low', label: 'Low (14ms)', desc: 'STP Gateway' },
                { id: 'normal', label: 'Std (45ms)', desc: 'Cloud Proxy' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLatencySim(item.id as any)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    latencySim === item.id 
                      ? 'bg-[#1e2024] text-[#eac169] border-[#eac169]/50 font-bold' 
                      : 'bg-[#12151b] text-[#9a8f7e] border-[#232830]'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[9px] text-[#9a8f7e] mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* CRT CRT FX */}
          <div className="bg-[#0c0e12] p-3 rounded-xl border border-[#232830] flex items-center justify-between">
            <div>
              <div className="font-bold text-[#e2e2e8]">CRT Scanlines & Glitch FX</div>
              <div className="text-[11px] text-[#9a8f7e]">Authentic terminal visual atmosphere</div>
            </div>
            <button
              onClick={() => setFlickerFx(!flickerFx)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                flickerFx ? 'bg-[#eac169] text-[#3f2e00]' : 'bg-[#282a2e] text-[#9a8f7e]'
              }`}
            >
              {flickerFx ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Slippage guard */}
          <div className="bg-[#0c0e12] p-3 rounded-xl border border-[#232830] flex items-center justify-between">
            <div>
              <div className="font-bold text-[#e2e2e8]">Anti-Slippage Hard Guard</div>
              <div className="text-[11px] text-[#9a8f7e]">Reject fills exceeding 0.5 pip dev</div>
            </div>
            <button
              onClick={() => setAutoSlippageGuard(!autoSlippageGuard)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                autoSlippageGuard ? 'bg-[#42e39a] text-[#0c0e12]' : 'bg-[#282a2e] text-[#9a8f7e]'
              }`}
            >
              {autoSlippageGuard ? 'PROTECTED' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
