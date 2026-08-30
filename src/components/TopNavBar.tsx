import React from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Settings, 
  Wallet, 
  HelpCircle, 
  Terminal, 
  TrendingUp, 
  Activity,
  ShieldCheck
} from 'lucide-react';

interface TopNavBarProps {
  balance: number;
  floatingPnl: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNewOrder: () => void;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  onOpenProfile: () => void;
  serverTime: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  balance,
  floatingPnl,
  soundEnabled,
  onToggleSound,
  onOpenNewOrder,
  onOpenWallet,
  onOpenSettings,
  onOpenSupport,
  onOpenProfile,
  serverTime
}) => {
  const pnlPositive = floatingPnl >= 0;

  return (
    <header className="h-14 border-b border-[#232830] bg-[#0c0e12] px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center space-x-2">
          {/* Official Hotlink Logo */}
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1a1c20] border border-[#eac169]/40 flex items-center justify-center shadow-glow-primary">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuClSVCBLbAd7FbKP7HdyZo5AcvcV_b8sqvSatssMGaSQAGx8OgkosWCU7qdyA5tSuqeQ9IBLBnlIE8TMr8KoXJVNTEkUjFBlagN4xfKBxX49X6aGhJvyC9scUWpXbXu2dOMNfG1U8KXC9UR8bs4s493XnxShZn5hZW5e38jD8KqBO2Og_AwLpT_MOMT1JFCJX3U2bM3smaNkqECqL1AjE7nbEg3JV7Me-1tl7t89YRSldCSoWTlbKqPIw" 
              alt="Gold Terminal Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-wider text-sm text-[#eac169] uppercase font-mono">
                GOLD TERMINAL
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2024] text-[#9a8f7e] font-mono border border-[#333539]">
                v4.2 PRO
              </span>
            </div>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-[#232830]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42e39a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#42e39a]"></span>
          </span>
          <span className="text-xs font-mono font-medium text-[#42e39a] tracking-tight">LIVE</span>
          <span className="text-[11px] font-mono text-[#9a8f7e] hidden md:inline">18ms • OANDA STP</span>
        </div>
      </div>

      {/* Middle: Live Market Stats & Clock */}
      <div className="hidden lg:flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-[#12151b] px-3 py-1 rounded-md border border-[#232830]">
          <Activity className="w-3.5 h-3.5 text-[#eac169]" />
          <span className="text-xs text-[#9a8f7e]">UTC Clock:</span>
          <span className="text-xs font-mono text-[#e2e2e8] font-semibold">{serverTime}</span>
        </div>

        <div className="flex items-center space-x-2 bg-[#12151b] px-3 py-1 rounded-md border border-[#232830]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#42e39a]" />
          <span className="text-xs text-[#9a8f7e]">Risk Lock:</span>
          <span className="text-xs font-mono text-[#42e39a] font-medium">MAX $500/DAY</span>
        </div>
      </div>

      {/* Right: Account Metrics & Quick Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Account Balance Widget */}
        <button
          onClick={onOpenWallet}
          id="btn-account-wallet"
          className="flex items-center space-x-2.5 bg-[#12151b] hover:bg-[#1a1c20] border border-[#232830] hover:border-[#eac169]/50 rounded-lg px-2.5 sm:px-3 py-1.5 transition-all text-left group"
          title="View Account Balance & Margin Breakdown"
        >
          <Wallet className="w-4 h-4 text-[#eac169] group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[10px] text-[#9a8f7e] uppercase font-mono tracking-wider">Equity</span>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#e2e2e8]">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="hidden sm:flex flex-col border-l border-[#232830] pl-2.5 ml-1">
            <span className="text-[10px] text-[#9a8f7e] uppercase font-mono tracking-wider">Floating</span>
            <span className={`text-xs font-mono font-bold ${pnlPositive ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}`}>
              {pnlPositive ? `+$${floatingPnl.toFixed(2)}` : `-$${Math.abs(floatingPnl).toFixed(2)}`}
            </span>
          </div>
        </button>

        {/* Quick Order Button */}
        <button
          onClick={onOpenNewOrder}
          id="btn-top-quick-order"
          className="hidden sm:flex items-center space-x-1.5 bg-[#eac169] hover:bg-[#c9a34e] text-[#3f2e00] font-bold text-xs font-mono px-3 py-2 rounded-lg transition-all shadow-glow-primary active:scale-95"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>ORDER</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          id="btn-toggle-sound"
          className="w-8 h-8 rounded-lg bg-[#12151b] hover:bg-[#1a1c20] border border-[#232830] flex items-center justify-center text-[#d1c5b2] hover:text-[#eac169] transition-all"
          title={soundEnabled ? 'Audio Alerts: ON' : 'Audio Alerts: MUTED'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#42e39a]" /> : <VolumeX className="w-4 h-4 text-[#9a8f7e]" />}
        </button>

        {/* Help / Cheat Sheet */}
        <button
          onClick={onOpenSupport}
          id="btn-help"
          className="w-8 h-8 rounded-lg bg-[#12151b] hover:bg-[#1a1c20] border border-[#232830] flex items-center justify-center text-[#d1c5b2] hover:text-[#eac169] transition-all"
          title="Terminal Hotkeys & System Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          id="btn-top-settings"
          className="w-8 h-8 rounded-lg bg-[#12151b] hover:bg-[#1a1c20] border border-[#232830] flex items-center justify-center text-[#d1c5b2] hover:text-[#eac169] transition-all"
          title="Terminal Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenProfile}
          id="btn-top-profile"
          className="w-8 h-8 rounded-lg overflow-hidden border border-[#eac169]/50 hover:border-[#eac169] transition-all relative group"
          title="Trader Account & API Keys"
        >
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYWr7uAXNw_IPJSAcNh5jYrx2b5DoV7sCbMVoKBG3gcKIHOHpQ7qA-JvSo7DYTNRySFiQZSvkuPLSoWDLxdrqLVA3Xi5p2Z1QyV1k_AV1htanf8puORTcmYlpwamk82tFXZ6oaMQpAI_QYZqEaTTfQzBx8RyYfB3CkXr4LxK-lS6qa8IUzIMBVyQb-kmKBJnK2oW9ZwOeJQXP5saIYSVCiAg9V5zcvZsYWNorkTFBCaR1c6D1d1m6yIA"
            alt="Trader Profile"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
};
