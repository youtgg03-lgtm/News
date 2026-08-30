import React from 'react';
import { 
  BarChart3, 
  Cpu, 
  Radio, 
  Newspaper, 
  Layers, 
  PlusCircle, 
  Terminal, 
  HelpCircle, 
  Flame, 
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { ActiveTab, AssetQuote } from '../types';

interface SideNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  quote: AssetQuote;
  dryRun: boolean;
  onToggleDryRun: () => void;
  onOpenNewOrder: () => void;
  onOpenLogs: () => void;
  onOpenSupport: () => void;
  openPositionsCount: number;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeTab,
  onTabChange,
  quote,
  dryRun,
  onToggleDryRun,
  onOpenNewOrder,
  onOpenLogs,
  onOpenSupport,
  openPositionsCount
}) => {
  const isPositive = quote.change >= 0;

  return (
    <aside className="w-64 border-r border-[#232830] bg-[#0c0e12] flex flex-col justify-between p-3 select-none shrink-0 z-20 overflow-y-auto">
      <div className="space-y-4">
        {/* Live Quote Mini Card */}
        <div className="bg-[#12151b] border border-[#232830] rounded-xl p-3 shadow-inner relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#eac169]/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-[#e2e2e8] font-mono tracking-wide">{quote.symbol}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1c20] text-[#9a8f7e] font-mono">SPOT</span>
            </div>
            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-[#42e39a]/10 text-[#42e39a]' : 'bg-[#ffb4ab]/10 text-[#ffb4ab]'}`}>
              {isPositive ? `+${quote.changePct}%` : `${quote.changePct}%`}
            </span>
          </div>

          {/* Large Live Price */}
          <div className="flex items-baseline space-x-2 my-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#ffdf9e] tracking-tight price-vibrate">
              ${quote.price.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-[#9a8f7e]">
              ({isPositive ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)})
            </span>
          </div>

          {/* Micro Stats */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#232830]/80 text-[11px] font-mono text-[#9a8f7e]">
            <div>
              <span className="text-[#9a8f7e]/70">Spread:</span> <span className="text-[#e2e2e8] font-semibold">{quote.spread} pips</span>
            </div>
            <div>
              <span className="text-[#9a8f7e]/70">24h Vol:</span> <span className="text-[#e2e2e8] font-semibold">{quote.volume}</span>
            </div>
          </div>

          {/* Quick Dry Run / Live Switcher */}
          <div className="mt-3 pt-2 border-t border-[#232830] flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-mono text-[#9a8f7e]">Exec Mode:</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                dryRun 
                  ? 'bg-[#eac169]/10 text-[#eac169] border-[#eac169]/40' 
                  : 'bg-[#42e39a]/10 text-[#42e39a] border-[#42e39a]/40'
              }`}>
                {dryRun ? 'DRY RUN' : 'LIVE PROD'}
              </span>
            </div>
            <button
              onClick={onToggleDryRun}
              id="btn-toggle-dryrun"
              className="text-[10px] font-mono underline text-[#9a8f7e] hover:text-[#eac169] transition-colors"
            >
              {dryRun ? 'Go Live' : 'Go Sim'}
            </button>
          </div>
        </div>

        {/* Primary Action Button: New Order */}
        <button
          onClick={onOpenNewOrder}
          id="btn-sidebar-new-order"
          className="w-full bg-gradient-to-r from-[#eac169] to-[#c9a34e] hover:from-[#c9a34e] hover:to-[#b08b3a] text-[#3f2e00] font-extrabold text-xs font-mono py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-glow-primary active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>NEW ORDER [N]</span>
        </button>

        {/* Navigation Tabs */}
        <nav className="space-y-1 pt-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#9a8f7e] px-2 mb-1.5 font-bold">
            Navigation
          </div>

          {/* 1. Market Tab */}
          <button
            onClick={() => onTabChange('market')}
            id="nav-tab-market"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'market'
                ? 'bg-[#1e2024] text-[#eac169] border-l-2 border-[#eac169] shadow-sm'
                : 'text-[#d1c5b2] hover:bg-[#12151b] hover:text-[#e2e2e8]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BarChart3 className="w-4 h-4 text-[#eac169]" />
              <span>Market</span>
            </div>
            <span className="text-[10px] font-mono text-[#9a8f7e]">Alt+1</span>
          </button>

          {/* 2. Signals & Supercharts Tab */}
          <button
            onClick={() => onTabChange('signals')}
            id="nav-tab-signals"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'signals'
                ? 'bg-[#1e2024] text-[#eac169] border-l-2 border-[#eac169] shadow-sm'
                : 'text-[#d1c5b2] hover:bg-[#12151b] hover:text-[#e2e2e8]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Radio className="w-4 h-4 text-[#42e39a]" />
              <span>Signals & Pine</span>
            </div>
            <span className="text-[9px] px-1 rounded bg-[#42e39a]/10 text-[#42e39a] font-mono font-bold">
              AI 92%
            </span>
          </button>

          {/* 3. Auto-Trade Engine Tab */}
          <button
            onClick={() => onTabChange('auto-trade')}
            id="nav-tab-autotrade"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'auto-trade'
                ? 'bg-[#1e2024] text-[#eac169] border-l-2 border-[#eac169] shadow-sm'
                : 'text-[#d1c5b2] hover:bg-[#12151b] hover:text-[#e2e2e8]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-4 h-4 text-[#eac169]" />
              <span>Auto-Trade</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1c20] text-[#9a8f7e] font-mono">
              CLI
            </span>
          </button>

          {/* 4. Positions & History Tab */}
          <button
            onClick={() => onTabChange('positions')}
            id="nav-tab-positions"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'positions' || activeTab === 'history'
                ? 'bg-[#1e2024] text-[#eac169] border-l-2 border-[#eac169] shadow-sm'
                : 'text-[#d1c5b2] hover:bg-[#12151b] hover:text-[#e2e2e8]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Layers className="w-4 h-4 text-[#ffdf9e]" />
              <span>Positions ({openPositionsCount})</span>
            </div>
            <span className="text-[10px] font-mono text-[#42e39a] font-bold">
              +$160
            </span>
          </button>

          {/* 5. News & Macro Wire */}
          <button
            onClick={() => onTabChange('news')}
            id="nav-tab-news"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'news'
                ? 'bg-[#1e2024] text-[#eac169] border-l-2 border-[#eac169] shadow-sm'
                : 'text-[#d1c5b2] hover:bg-[#12151b] hover:text-[#e2e2e8]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Newspaper className="w-4 h-4 text-[#e2e2e8]" />
              <span>News Wire</span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-[#eac169]"></span>
          </button>
        </nav>
      </div>

      {/* Footer Controls & System Status */}
      <div className="pt-4 border-t border-[#232830] space-y-2">
        {/* Terminal Logs Drawer Button */}
        <button
          onClick={onOpenLogs}
          id="btn-sidebar-logs"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#12151b] hover:bg-[#1a1c20] text-[#d1c5b2] hover:text-[#eac169] text-xs font-mono border border-[#232830] transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-[#42e39a]" />
            <span>Terminal CLI</span>
          </div>
          <span className="text-[10px] text-[#9a8f7e]">[~]</span>
        </button>

        {/* Support & Shortcut Guide */}
        <button
          onClick={onOpenSupport}
          id="btn-sidebar-support"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#12151b] hover:bg-[#1a1c20] text-[#d1c5b2] hover:text-[#eac169] text-xs font-mono border border-[#232830] transition-colors"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#eac169]" />
            <span>Keyboard Shortcuts</span>
          </div>
          <span className="text-[10px] text-[#9a8f7e]">?</span>
        </button>

        {/* User Mini Bar */}
        <div className="p-2.5 rounded-lg bg-[#12151b] border border-[#232830] flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md overflow-hidden bg-[#1a1c20] border border-[#eac169]/30">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYWr7uAXNw_IPJSAcNh5jYrx2b5DoV7sCbMVoKBG3gcKIHOHpQ7qA-JvSo7DYTNRySFiQZSvkuPLSoWDLxdrqLVA3Xi5p2Z1QyV1k_AV1htanf8puORTcmYlpwamk82tFXZ6oaMQpAI_QYZqEaTTfQzBx8RyYfB3CkXr4LxK-lS6qa8IUzIMBVyQb-kmKBJnK2oW9ZwOeJQXP5saIYSVCiAg9V5zcvZsYWNorkTFBCaR1c6D1d1m6yIA"
              alt="Trader avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-mono font-bold text-[#e2e2e8] truncate">Gold_Sniper_PRO</div>
            <div className="text-[10px] font-mono text-[#42e39a] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#42e39a]"></span>
              <span>Algo Engine Active</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
