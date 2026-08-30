import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal as TerminalIcon, 
  ShieldAlert, 
  Save, 
  Check, 
  Play, 
  Pause, 
  AlertTriangle, 
  Sliders, 
  RefreshCw,
  Zap,
  ShieldCheck,
  Send
} from 'lucide-react';
import { AutoTradeConfig, TerminalLog } from '../types';

interface AutoTradeViewProps {
  config: AutoTradeConfig;
  onUpdateConfig: (newConfig: AutoTradeConfig) => void;
  logs: TerminalLog[];
  onAddLog: (type: TerminalLog['type'], message: string) => void;
  onExecuteOrderDirect: (side: 'BUY' | 'SELL', lot: number) => void;
}

export const AutoTradeView: React.FC<AutoTradeViewProps> = ({
  config,
  onUpdateConfig,
  logs,
  onAddLog,
  onExecuteOrderDirect
}) => {
  const [localConfig, setLocalConfig] = useState<AutoTradeConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [cliInput, setCliInput] = useState<string>('');

  // Handle saving config
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    onAddLog('INFO', `Strategy configuration updated. Base Lot: ${localConfig.baseLotSize}, Strategy: ${localConfig.strategyName}`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Toggle master auto trade
  const toggleAutoTrade = () => {
    const nextState = !localConfig.enabled;
    const updated = { ...localConfig, enabled: nextState };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    onAddLog(
      nextState ? 'EXEC' : 'HALT', 
      nextState ? 'Auto-Trade Engine STARTED. Scanning liquidity pools...' : 'Auto-Trade Engine PAUSED by operator.'
    );
  };

  // Toggle dry run
  const toggleDryRun = () => {
    const nextState = !localConfig.dryRun;
    const updated = { ...localConfig, dryRun: nextState };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    onAddLog('WARN', `Execution mode switched to: ${nextState ? 'DRY RUN (Simulation)' : 'LIVE PRODUCTION (Real Capital)'}`);
  };

  // Handle CLI Terminal Commands
  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim();
    if (!cmd) return;

    onAddLog('SYS', `> ${cmd}`);
    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      onAddLog('INFO', 'Available commands: status, scan, buy <lot>, sell <lot>, halt, resume, reset, clear, help');
    } else if (lower === 'status') {
      onAddLog('INFO', `STATUS: [${localConfig.enabled ? 'ACTIVE' : 'PAUSED'}] | MODE: [${localConfig.dryRun ? 'DRY-RUN' : 'LIVE'}] | STRATEGY: ${localConfig.strategyName} | MIN CONF: ${localConfig.minConfidence}%`);
    } else if (lower === 'scan') {
      onAddLog('SCAN', 'Manual scan initiated on XAUUSD M5/M15... Consensus: STRONG BUY (92%).');
    } else if (lower.startsWith('buy')) {
      const parts = lower.split(' ');
      const lot = parts[1] ? parseFloat(parts[1]) : localConfig.baseLotSize;
      onExecuteOrderDirect('BUY', lot);
      onAddLog('EXEC', `CLI Direct Execution: BUY ${lot} Lots placed on STP router.`);
    } else if (lower.startsWith('sell')) {
      const parts = lower.split(' ');
      const lot = parts[1] ? parseFloat(parts[1]) : localConfig.baseLotSize;
      onExecuteOrderDirect('SELL', lot);
      onAddLog('EXEC', `CLI Direct Execution: SELL ${lot} Lots placed on STP router.`);
    } else if (lower === 'halt') {
      const updated = { ...localConfig, enabled: false };
      setLocalConfig(updated);
      onUpdateConfig(updated);
      onAddLog('HALT', 'Engine execution halted via CLI.');
    } else if (lower === 'resume') {
      const updated = { ...localConfig, enabled: true };
      setLocalConfig(updated);
      onUpdateConfig(updated);
      onAddLog('EXEC', 'Engine execution resumed via CLI.');
    } else if (lower === 'reset') {
      onAddLog('INFO', 'Daily session limits and counters reset to zero.');
    } else {
      onAddLog('WARN', `Unknown command '${cmd}'. Type 'help' for command list.`);
    }

    setCliInput('');
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row overflow-hidden bg-[#0A0C10] select-none">
      
      {/* LEFT PANE: Master Controls & Strategy Configuration */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 border-r border-[#232830] space-y-4">
        
        {/* Daily Limit Status Banner */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 flex items-start justify-between space-x-4 shadow-inner">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#eac169]/10 border border-[#eac169]/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-[#eac169]" />
            </div>
            <div>
              <div className="text-sm font-extrabold font-mono text-[#e2e2e8]">
                AUTOMATED RISK SAFETY LOCK
              </div>
              <div className="text-xs font-mono text-[#9a8f7e] mt-0.5 leading-relaxed">
                Max Daily Loss Target: <strong className="text-[#ffb4ab]">${localConfig.dailyLossLimit.toFixed(2)}</strong> | 
                Daily Win Cap: <strong className="text-[#42e39a]">${localConfig.dailyWinTarget.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#42e39a]/10 text-[#42e39a] border border-[#42e39a]/30 shrink-0">
            SYSTEM PROTECTED
          </span>
        </div>

        {/* Master Switches Card */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 space-y-4">
          <div className="text-xs font-mono text-[#9a8f7e] uppercase tracking-wider font-bold">
            MASTER ENGINE CONTROLS
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto-Trade Enable/Disable Toggle */}
            <div className="bg-[#0c0e12] border border-[#232830] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold font-mono text-[#e2e2e8]">Auto-Trade Execution</div>
                <div className="text-xs font-mono text-[#9a8f7e] mt-0.5">
                  {localConfig.enabled ? 'Algorithmic scanner active' : 'Engine in standby'}
                </div>
              </div>

              <button
                onClick={toggleAutoTrade}
                id="btn-toggle-master-autotrade"
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  localConfig.enabled ? 'bg-[#42e39a]' : 'bg-[#282a2e]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-[#0c0e12] transition-transform ${
                    localConfig.enabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Dry Run Simulation Toggle */}
            <div className="bg-[#0c0e12] border border-[#232830] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold font-mono text-[#e2e2e8]">Dry Run Mode</div>
                <div className="text-xs font-mono text-[#9a8f7e] mt-0.5">
                  {localConfig.dryRun ? 'Simulated capital (Zero Risk)' : 'LIVE Production Account'}
                </div>
              </div>

              <button
                onClick={toggleDryRun}
                id="btn-toggle-dryrun-mode"
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  localConfig.dryRun ? 'bg-[#eac169]' : 'bg-[#42e39a]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-[#0c0e12] transition-transform ${
                    localConfig.dryRun ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Parameters Form */}
        <form onSubmit={handleSave} className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#9a8f7e] uppercase tracking-wider font-bold">
              ALGORITHMIC PARAMETERS
            </span>
            <span className="text-xs font-mono text-[#eac169]">XAUUSD Derivatives</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Strategy Model Selector */}
            <div className="space-y-1.5">
              <label className="text-[#9a8f7e]">STRATEGY PRESET</label>
              <select
                value={localConfig.strategyName}
                onChange={(e) => setLocalConfig({ ...localConfig, strategyName: e.target.value })}
                id="select-strategy-preset"
                className="w-full bg-[#0c0e12] border border-[#232830] rounded-xl px-3 py-2 text-[#e2e2e8] focus:border-[#eac169] focus:outline-none"
              >
                <option value="XAU_Scalp_V2">XAU_Scalp_V2 (M5/M15 Fast EMA Cross)</option>
                <option value="Gold_Breakout_Pro">Gold_Breakout_Pro (Liquidity Swings & Pivots)</option>
                <option value="HFT_Orderflow_AI">HFT_Orderflow_AI (Book Imbalance + Micro Spreads)</option>
              </select>
            </div>

            {/* Base Lot Size */}
            <div className="space-y-1.5">
              <label className="text-[#9a8f7e]">BASE LOT SIZE</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="10.0"
                value={localConfig.baseLotSize}
                onChange={(e) => setLocalConfig({ ...localConfig, baseLotSize: parseFloat(e.target.value) || 0.01 })}
                id="input-base-lot"
                className="w-full bg-[#0c0e12] border border-[#232830] rounded-xl px-3 py-2 text-[#e2e2e8] focus:border-[#eac169] focus:outline-none"
              />
            </div>

            {/* Min Signal Confidence */}
            <div className="space-y-1.5">
              <label className="text-[#9a8f7e]">MIN SIGNAL CONFIDENCE (%)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={localConfig.minConfidence}
                  onChange={(e) => setLocalConfig({ ...localConfig, minConfidence: parseInt(e.target.value) })}
                  id="range-min-confidence"
                  className="flex-1 accent-[#eac169]"
                />
                <span className="w-12 text-right font-bold text-[#eac169]">{localConfig.minConfidence}%</span>
              </div>
            </div>

            {/* Max Hold Duration */}
            <div className="space-y-1.5">
              <label className="text-[#9a8f7e]">MAX HOLD DURATION (MINUTES)</label>
              <input
                type="number"
                value={localConfig.maxHoldDurationMin}
                onChange={(e) => setLocalConfig({ ...localConfig, maxHoldDurationMin: parseInt(e.target.value) || 30 })}
                id="input-max-hold"
                className="w-full bg-[#0c0e12] border border-[#232830] rounded-xl px-3 py-2 text-[#e2e2e8] focus:border-[#eac169] focus:outline-none"
              />
            </div>

            {/* Daily Loss Limit */}
            <div className="space-y-1.5">
              <label className="text-[#ffb4ab]">MAX DAILY LOSS LIMIT ($)</label>
              <input
                type="number"
                value={localConfig.dailyLossLimit}
                onChange={(e) => setLocalConfig({ ...localConfig, dailyLossLimit: parseFloat(e.target.value) || 100 })}
                id="input-daily-loss-limit"
                className="w-full bg-[#0c0e12] border border-[#ffb4ab]/40 rounded-xl px-3 py-2 text-[#e2e2e8] focus:border-[#ffb4ab] focus:outline-none"
              />
            </div>

            {/* Daily Win Target */}
            <div className="space-y-1.5">
              <label className="text-[#42e39a]">DAILY WIN TARGET ($)</label>
              <input
                type="number"
                value={localConfig.dailyWinTarget}
                onChange={(e) => setLocalConfig({ ...localConfig, dailyWinTarget: parseFloat(e.target.value) || 500 })}
                id="input-daily-win-target"
                className="w-full bg-[#0c0e12] border border-[#42e39a]/40 rounded-xl px-3 py-2 text-[#e2e2e8] focus:border-[#42e39a] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            {saveSuccess && (
              <span className="text-xs font-mono text-[#42e39a] flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Parameters saved successfully!</span>
              </span>
            )}

            <button
              type="submit"
              id="btn-save-strategy-config"
              className="px-4 py-2 bg-[#eac169] hover:bg-[#c9a34e] text-[#3f2e00] font-bold font-mono text-xs rounded-xl flex items-center space-x-1.5 shadow-glow-primary active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE SETTINGS</span>
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT PANE: Interactive Terminal Activity Log & Shell */}
      <div className="w-full xl:w-[480px] bg-[#0c0e12] flex flex-col overflow-hidden shrink-0 select-none">
        
        {/* Terminal Header */}
        <div className="h-12 bg-[#12151b] border-b border-[#232830] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4 text-[#42e39a]" />
            <span className="text-xs font-bold font-mono text-[#e2e2e8]">TERMINAL ACTIVITY MONITOR</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#42e39a] animate-pulse"></span>
            <span className="text-[10px] font-mono text-[#42e39a]">STP FEED ACTIVE</span>
          </div>
        </div>

        {/* Real-Time CLI Log Stream */}
        <div className="flex-1 bg-[#07080b] p-3 font-mono text-xs overflow-y-auto space-y-1.5">
          {logs.map((log) => {
            const isSignal = log.type === 'SIGNAL';
            const isExec = log.type === 'EXEC';
            const isWarn = log.type === 'WARN';
            const isHalt = log.type === 'HALT';
            const isSys = log.type === 'SYS';

            return (
              <div key={log.id} className="leading-relaxed flex items-start space-x-2">
                <span className="text-[#9a8f7e]/60 shrink-0 text-[11px]">{log.time}</span>
                <span className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                  isSignal ? 'bg-[#42e39a]/10 text-[#42e39a] border border-[#42e39a]/30' :
                  isExec ? 'bg-[#eac169]/10 text-[#eac169] border border-[#eac169]/30' :
                  isWarn ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30' :
                  isHalt ? 'bg-[#93000a] text-white' :
                  isSys ? 'text-[#ffdf9e]' : 'text-[#9a8f7e]'
                }`}>
                  [{log.type}]
                </span>
                <span className={`text-xs ${
                  isExec ? 'text-[#e2e2e8] font-semibold' :
                  isSignal ? 'text-[#42e39a]' :
                  isWarn ? 'text-[#ffb4ab]' :
                  isHalt ? 'text-[#ffb4ab] font-bold' :
                  isSys ? 'text-[#ffdf9e]' : 'text-[#d1c5b2]'
                }`}>
                  {log.message}
                </span>
              </div>
            );
          })}
        </div>

        {/* Interactive CLI Prompt */}
        <form onSubmit={handleCliSubmit} className="h-12 bg-[#12151b] border-t border-[#232830] px-3 flex items-center space-x-2 shrink-0">
          <span className="text-[#42e39a] font-mono text-xs font-bold">$</span>
          <input
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            placeholder="Type 'help', 'scan', 'status', 'buy 0.50'..."
            id="input-terminal-shell"
            className="flex-1 bg-transparent border-none text-xs font-mono text-[#e2e2e8] placeholder-[#4e4638] focus:outline-none"
          />
          <button
            type="submit"
            id="btn-submit-terminal-cli"
            className="p-1.5 rounded-lg bg-[#1e2024] hover:bg-[#282a2e] text-[#eac169] transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
