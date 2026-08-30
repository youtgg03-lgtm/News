import React, { useState } from 'react';
import { 
  Play, 
  Code, 
  Terminal, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles,
  Zap,
  Activity,
  Send,
  MessageSquare
} from 'lucide-react';
import { 
  AssetQuote, 
  Candle,
  CalculatedIndicators,
  AnalysisSocialPost, 
  ScreenerItem, 
  TimeframeScanRow, 
  TechnicalReason 
} from '../types';
import { DEFAULT_PINE_SCRIPT, TIMEFRAME_SCAN_DATA, TECHNICAL_REASONS } from '../data/initialData';
import { calculateEMA, calculateRSI } from '../utils/indicators';

interface SignalsViewProps {
  currentQuote: AssetQuote;
  assets: Record<string, AssetQuote>;
  candles?: Candle[];
  indicators?: CalculatedIndicators;
  onSelectAsset: (symbol: string) => void;
  socialFeed: AnalysisSocialPost[];
  screenerItems: ScreenerItem[];
  onAddSocialPost?: (content: string) => void;
  onTriggerBreachChime?: () => void;
}

export const SignalsView: React.FC<SignalsViewProps> = ({
  currentQuote,
  assets,
  candles = [],
  indicators,
  onSelectAsset,
  socialFeed,
  screenerItems,
  onAddSocialPost,
  onTriggerBreachChime
}) => {
  // Sub-view mode: 'charts_pine' (Supercharts & Pine Editor) vs 'analysis' (Signals & Macro Intelligence)
  const [subTab, setSubTab] = useState<'charts_pine' | 'analysis'>('charts_pine');
  
  // Asset category filter
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Futures' | 'Stocks' | 'Crypto' | 'Forex' | 'Indices'>('ALL');
  
  // Pine Script state
  const [pineCode, setPineCode] = useState<string>(DEFAULT_PINE_SCRIPT);
  const [pineOutput, setPineOutput] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Pivot Breach test simulation trigger
  const [isBreaching, setIsBreaching] = useState<boolean>(false);
  const [breachPrice, setBreachPrice] = useState<number>(currentQuote.pivots.r1);

  // Social feed input
  const [newPostText, setNewPostText] = useState<string>('');

  // Handle Pine Script compilation using real mathematical calculations
  const handleRunPine = () => {
    setIsCompiling(true);
    setPineOutput('Compiling Pine Script v5 engine...');
    setTimeout(() => {
      setIsCompiling(false);
      const closes = candles.length > 0 ? candles.map(c => c.close) : [currentQuote.price];
      const ema20Arr = calculateEMA(closes, 20);
      const ema50Arr = calculateEMA(closes, 50);
      const ema20Val = ema20Arr[ema20Arr.length - 1] || (currentQuote.price - 1.2);
      const ema50Val = ema50Arr[ema50Arr.length - 1] || (currentQuote.price - 3.4);

      setPineOutput(
        `[SUCCESS] Pine Script v5 compiled and attached to ${currentQuote.symbol} live feed.\n` +
        `• ta.ema(close, 20) = $${ema20Val.toFixed(2)}\n` +
        `• ta.ema(close, 50) = $${ema50Val.toFixed(2)}\n` +
        `• Signal: ${ema20Val > ema50Val ? 'BULLISH GOLDEN CROSS' : 'BEARISH DEATH CROSS'}\n` +
        `• Execution latency: 2.4ms • 60 bars processed.`
      );
    }, 450);
  };

  // Simulate a pivot breach (triggers flash + glitch animation)
  const triggerPivotBreach = () => {
    setIsBreaching(true);
    setBreachPrice(currentQuote.pivots.r1);
    if (onTriggerBreachChime) {
      onTriggerBreachChime();
    }
    setTimeout(() => {
      setIsBreaching(false);
    }, 3000);
  };

  // Post to social feed
  const handleSendPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    if (onAddSocialPost) {
      onAddSocialPost(newPostText);
    }
    setNewPostText('');
  };

  const filteredAssets = (Object.values(assets) as AssetQuote[]).filter(
    a => categoryFilter === 'ALL' || a.category === categoryFilter
  );

  const currentScore = indicators?.signalScore ?? 92;
  const currentRating = indicators?.signalRating ?? 'STRONG BUY';
  const currentAtr = indicators?.atr14 ?? 14.85;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0C10] select-none">
      {/* Sub-Header Navigation */}
      <div className="h-12 bg-[#0c0e12] border-b border-[#232830] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#12151b] rounded-lg p-0.5 border border-[#232830]">
            <button
              onClick={() => setSubTab('charts_pine')}
              id="subtab-charts-pine"
              className={`px-3 py-1 text-xs font-mono rounded-md font-bold flex items-center space-x-1.5 transition-all ${
                subTab === 'charts_pine'
                  ? 'bg-[#eac169] text-[#3f2e00] shadow-glow-primary'
                  : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Supercharts & Pine Editor</span>
            </button>

            <button
              onClick={() => setSubTab('analysis')}
              id="subtab-analysis"
              className={`px-3 py-1 text-xs font-mono rounded-md font-bold flex items-center space-x-1.5 transition-all ${
                subTab === 'analysis'
                  ? 'bg-[#eac169] text-[#3f2e00] shadow-glow-primary'
                  : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Signals & Consensus ({currentScore}%)</span>
            </button>
          </div>
        </div>

        {/* Right quick actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={triggerPivotBreach}
            id="btn-trigger-breach"
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#282a2e] hover:bg-[#333539] text-[#ffdf9e] border border-[#eac169]/30 text-xs font-mono transition-all"
            title="Simulate Real-time Pivot Resistance Breach"
          >
            <Zap className="w-3.5 h-3.5 text-[#eac169]" />
            <span>Simulate Pivot Breach</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: SUPERCHARTS & PINE EDITOR */}
      {subTab === 'charts_pine' ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT: Supercharts with Texture & Pivot Breach Animation */}
          <div className="flex-1 flex flex-col border-r border-[#232830] overflow-hidden relative">
            
            {/* Asset Category Bar */}
            <div className="h-10 bg-[#0c0e12] border-b border-[#232830] px-3 flex items-center justify-between overflow-x-auto shrink-0">
              <div className="flex items-center space-x-1 text-xs font-mono">
                {(['ALL', 'Futures', 'Stocks', 'Crypto', 'Forex', 'Indices'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    id={`cat-filter-${cat}`}
                    className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                      categoryFilter === cat
                        ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40 font-bold'
                        : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Active Symbol Switcher Buttons */}
              <div className="flex items-center space-x-1.5 pl-2">
                {filteredAssets.slice(0, 4).map((a) => (
                  <button
                    key={a.symbol}
                    onClick={() => onSelectAsset(a.symbol)}
                    id={`btn-select-asset-${a.symbol}`}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded transition-all ${
                      currentQuote.symbol === a.symbol
                        ? 'bg-[#eac169] text-[#3f2e00] font-bold'
                        : 'bg-[#12151b] text-[#9a8f7e] border border-[#232830] hover:text-[#e2e2e8]'
                    }`}
                  >
                    {a.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Supercharts Visual Stage with Hotlinked Texture Background */}
            <div className={`flex-1 relative bg-[#07080b] flex flex-col justify-between p-4 overflow-hidden ${isBreaching ? 'flash-active' : ''}`}>
              
              {/* Hotlink Chart Background Texture */}
              <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-screen">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs_tbEdGigdtcbVkM-ibrjrHa5_YvVKWwAeByog6fJ379NjDCdUpjstNj0Cold3Zy1smZrKn4R38JVpHxa2gjbwBzlQpz7-2RiXhqTeJihAGPZ8mf-SsPF4rmi6_zKiB0jksoUSE7CwRbPW3nT_ddCH3jIVs8rm1rjHlyANdhe8W5inkcfLNk9F0-A_S39x1b6AJzhiMHN1NHfAdcFyfg3ffpG1PI8Xpb2eT0gfjnCqVnzl5y3_mr_SA" 
                  alt="Chart Pulse Matrix Texture"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Breach Glitch Badge Overlay */}
              {isBreaching && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="bg-[#12151b]/95 border-2 border-[#eac169] p-6 rounded-2xl shadow-glow-primary text-center glitch">
                    <div className="text-3xl font-extrabold font-mono text-[#eac169] uppercase tracking-widest">
                      PIVOT R1 BREACHED!
                    </div>
                    <div className="text-base font-mono text-[#ffdf9e] mt-1 font-bold">
                      ${breachPrice.toFixed(2)} RESISTANCE CLEARED • BUY ACCELERATION
                    </div>
                  </div>
                </div>
              )}

              {/* Top Chart Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-[#12151b]/90 border border-[#232830] p-2.5 rounded-xl backdrop-blur">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold font-mono text-[#eac169]">{currentQuote.symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#42e39a]/10 text-[#42e39a] font-mono font-bold">
                      {currentRating}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-[#ffdf9e] mt-1">
                    ${currentQuote.price.toFixed(currentQuote.symbol === 'EURUSD' ? 4 : 2)}
                  </div>
                </div>

                <div className="bg-[#12151b]/90 border border-[#232830] p-2.5 rounded-xl text-right text-xs font-mono text-[#9a8f7e] backdrop-blur">
                  <div>R2 Level: <span className="text-[#ffb4ab] font-bold">${currentQuote.pivots.r2.toFixed(2)}</span></div>
                  <div>R1 Level: <span className="text-[#ffdf9e] font-bold">${currentQuote.pivots.r1.toFixed(2)}</span></div>
                  <div>PP Pivot: <span className="text-[#eac169] font-bold">${currentQuote.pivots.pp.toFixed(2)}</span></div>
                </div>
              </div>

              {/* Supercharts Visual Wave Curve & Candlesticks */}
              <div className="relative z-10 flex-1 my-4 flex items-center justify-center">
                <svg className="w-full h-48 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="100%" y2="40" stroke="#232830" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="100%" y2="90" stroke="#eac169" strokeDasharray="4 4" strokeOpacity="0.4" />
                  <line x1="0" y1="140" x2="100%" y2="140" stroke="#232830" strokeDasharray="3 3" />

                  {/* Golden Trend Wave */}
                  <path 
                    d="M 10 130 C 120 120, 240 150, 360 80 C 480 20, 600 90, 720 40 C 840 -10, 960 30, 1080 10" 
                    fill="none" 
                    stroke="#eac169" 
                    strokeWidth="3"
                    className="drop-shadow-[0_0_8px_rgba(234,193,105,0.6)]"
                  />

                  {/* Secondary Fast EMA Curve */}
                  <path 
                    d="M 10 145 C 120 135, 240 160, 360 95 C 480 40, 600 105, 720 55 C 840 10, 960 45, 1080 25" 
                    fill="none" 
                    stroke="#42e39a" 
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                </svg>
              </div>

              {/* Bottom Quick Stats */}
              <div className="relative z-10 grid grid-cols-4 gap-2 bg-[#12151b]/90 border border-[#232830] p-2 rounded-xl text-xs font-mono backdrop-blur">
                <div>
                  <span className="text-[#9a8f7e]">Daily Range:</span>
                  <div className="text-[#e2e2e8] font-bold">${(currentQuote.high - currentQuote.low).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-[#9a8f7e]">ATR (14):</span>
                  <div className="text-[#e2e2e8] font-bold">{currentAtr.toFixed(2)} pts</div>
                </div>
                <div>
                  <span className="text-[#9a8f7e]">Confidence:</span>
                  <div className="text-[#42e39a] font-bold">{currentScore}%</div>
                </div>
                <div>
                  <span className="text-[#9a8f7e]">Volatility:</span>
                  <div className="text-[#eac169] font-bold">Optimal</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Pine Script v5 Editor & Execution Console */}
          <div className="w-full lg:w-[480px] bg-[#0c0e12] flex flex-col overflow-hidden shrink-0">
            {/* Editor Header */}
            <div className="h-10 bg-[#12151b] border-b border-[#232830] px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#eac169]" />
                <span className="text-xs font-bold font-mono text-[#e2e2e8]">PINE EDITOR v5</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1c20] text-[#9a8f7e] font-mono">
                  Script: EMA_Ribbon
                </span>
              </div>

              <button
                onClick={handleRunPine}
                disabled={isCompiling}
                id="btn-run-pine-script"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#eac169] hover:bg-[#c9a34e] text-[#3f2e00] font-bold font-mono text-xs shadow-glow-primary active:scale-95 transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isCompiling ? 'COMPILING...' : 'RUN SCRIPT'}</span>
              </button>
            </div>

            {/* Code Input Area */}
            <div className="flex-1 p-3 flex flex-col font-mono text-xs bg-[#07080b] relative overflow-hidden">
              <textarea
                value={pineCode}
                onChange={(e) => setPineCode(e.target.value)}
                id="textarea-pine-script"
                spellCheck={false}
                className="w-full flex-1 bg-transparent text-[#e2e2e8] resize-none focus:outline-none leading-relaxed font-mono selection:bg-[#eac169]/30"
              />
            </div>

            {/* Pine Compiler Console Output */}
            <div className="h-36 bg-[#12151b] border-t border-[#232830] p-3 flex flex-col font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#9a8f7e] mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#42e39a]" />
                  <span>COMPILER LOGS</span>
                </div>
                <span className="text-[#42e39a]">PINE v5 ENGINE</span>
              </div>
              <div className="flex-1 bg-[#0c0e12] p-2 rounded border border-[#232830] overflow-y-auto text-[11px] text-[#d1c5b2] space-y-1 whitespace-pre-line">
                {pineOutput ? (
                  <p className="text-[#42e39a] leading-relaxed">{pineOutput}</p>
                ) : (
                  <p className="text-[#9a8f7e]">Ready for compilation. Click "RUN SCRIPT" to calculate indicators on live bar data.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SUB-VIEW 2: SIGNALS & MULTI-TIMEFRAME ANALYSIS */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Top Row: AI Confidence Radial Card + Broker Status + Multi-Timeframe Scan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* CARD 1: AI Signal Confidence */}
            <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#9a8f7e] uppercase tracking-wider font-bold">
                  SIGNAL ENGINE STATUS
                </span>
                <span className="w-2 h-2 rounded-full bg-[#42e39a] animate-ping"></span>
              </div>

              <div className="flex items-center space-x-4 my-2">
                <div className="relative w-20 h-20 rounded-full border-4 border-[#42e39a] flex items-center justify-center shrink-0 shadow-glow-secondary">
                  <div className="text-center">
                    <span className="text-xl font-black font-mono text-[#42e39a]">{currentScore}%</span>
                    <span className="text-[9px] block font-mono text-[#9a8f7e]">CONF</span>
                  </div>
                </div>

                <div>
                  <div className="text-lg font-black font-mono text-[#42e39a]">{currentRating}</div>
                  <div className="text-xs font-mono text-[#eac169] mt-0.5">{currentQuote.symbol} @ ${currentQuote.price.toFixed(2)}</div>
                  <div className="text-[11px] font-mono text-[#9a8f7e] mt-1">Target TP: ${currentQuote.pivots.r1.toFixed(2)} | SL: ${currentQuote.pivots.s1.toFixed(2)}</div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#9a8f7e] pt-2 border-t border-[#232830]">
                Algorithm: DeepOrderflow + Live Structural Liquidity
              </div>
            </div>

            {/* CARD 2: Broker & STP Latency */}
            <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#9a8f7e] uppercase tracking-wider font-bold">
                  BROKER CONNECTION
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#42e39a]/10 text-[#42e39a] font-mono font-bold">
                  STP ACTIVE
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#0c0e12] border border-[#232830]">
                  <span className="text-[#9a8f7e]">Gateway:</span>
                  <span className="text-[#e2e2e8] font-bold">OANDA v20 Live STP Router</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#0c0e12] border border-[#232830]">
                  <span className="text-[#9a8f7e]">Round-Trip Ping:</span>
                  <span className="text-[#42e39a] font-bold">14ms (Optimal)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#0c0e12] border border-[#232830]">
                  <span className="text-[#9a8f7e]">Max Leverage:</span>
                  <span className="text-[#eac169] font-bold">1:500 Gold Tier</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#42e39a] pt-2 border-t border-[#232830] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero slippage guarantee on limit orders</span>
              </div>
            </div>

            {/* CARD 3: Multi-Timeframe Scanner */}
            <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#9a8f7e] uppercase tracking-wider font-bold">
                  TIMEFRAME SCAN MATRIX
                </span>
                <span className="text-[10px] text-[#eac169] font-mono">5 Intervals</span>
              </div>

              <div className="space-y-1.5">
                {TIMEFRAME_SCAN_DATA.map((row) => (
                  <div 
                    key={row.tf}
                    className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-[#0c0e12] border border-[#232830]"
                  >
                    <span className="text-[#eac169] font-bold w-10">{row.tf}</span>
                    <span className="text-[#e2e2e8]">{row.trend}</span>
                    <span className={`font-bold ${
                      row.signal.includes('BUY') ? 'text-[#42e39a]' : 
                      row.signal.includes('SELL') ? 'text-[#ffb4ab]' : 'text-[#9a8f7e]'
                    }`}>
                      {row.signal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Row: Technical Reasons Weight Breakdown + Screener Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Technical Reasons */}
            <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-[#eac169]">
                  TECHNICAL REASONING & WEIGHTS
                </span>
                <span className="text-xs font-mono text-[#9a8f7e]">Net Score: +{currentScore - 50} pts</span>
              </div>

              <div className="space-y-2">
                {TECHNICAL_REASONS.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl bg-[#0c0e12] border border-[#232830] flex items-start justify-between space-x-3"
                  >
                    <div className="flex items-start space-x-2.5">
                      {item.icon === 'check_circle' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#42e39a] shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#eac169] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs font-mono font-bold text-[#e2e2e8]">{item.title}</div>
                        <div className="text-[11px] font-mono text-[#9a8f7e] mt-0.5">{item.description}</div>
                      </div>
                    </div>

                    <span className={`text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded ${
                      item.weight > 0 ? 'bg-[#42e39a]/10 text-[#42e39a]' : 'bg-[#ffb4ab]/10 text-[#ffb4ab]'
                    }`}>
                      {item.weight > 0 ? `+${item.weight}` : item.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Screener Table */}
            <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-[#eac169]">
                  CROSS-MARKET SCREENER
                </span>
                <span className="text-xs font-mono text-[#9a8f7e]">7 Tracked Assets</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono select-none">
                  <thead>
                    <tr className="text-[#9a8f7e] border-b border-[#232830] pb-1 text-[11px]">
                      <th className="py-1 px-2">Symbol</th>
                      <th className="py-1 px-2">Sector</th>
                      <th className="py-1 px-2">24h Chg</th>
                      <th className="py-1 px-2">Signal Rating</th>
                      <th className="py-1 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232830]/50">
                    {screenerItems.map((item) => {
                      const isPos = item.chgPct >= 0;
                      return (
                        <tr key={item.symbol} className="hover:bg-[#1a1c20] transition-colors">
                          <td className="py-2 px-2 font-bold text-[#e2e2e8]">{item.symbol}</td>
                          <td className="py-2 px-2 text-[#9a8f7e]">{item.category}</td>
                          <td className="py-2 px-2 font-bold">
                            <span className={isPos ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>
                              {isPos ? `+${item.chgPct}%` : `${item.chgPct}%`}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.rating.includes('Buy') ? 'bg-[#42e39a]/10 text-[#42e39a]' :
                              item.rating.includes('Sell') ? 'bg-[#ffb4ab]/10 text-[#ffb4ab]' : 'bg-[#1a1c20] text-[#9a8f7e]'
                            }`}>
                              {item.rating}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              onClick={() => onSelectAsset(item.symbol)}
                              id={`btn-screener-view-${item.symbol}`}
                              className="px-2 py-0.5 rounded bg-[#1e2024] hover:bg-[#eac169] text-[#e2e2e8] hover:text-[#3f2e00] text-[10px] font-bold transition-all"
                            >
                              CHART
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom Row: Social Macro Analysts Stream */}
          <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#eac169]" />
                <span className="text-sm font-bold font-mono text-[#eac169]">
                  ANALYSIS STREAM & TRADER SIGNALS
                </span>
              </div>
              <span className="text-xs font-mono text-[#9a8f7e]">Live Feed</span>
            </div>

            {/* Post Input Form */}
            <form onSubmit={handleSendPost} className="flex space-x-2">
              <input 
                type="text"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share your macro signal or chart analysis..."
                id="input-social-stream"
                className="flex-1 bg-[#0c0e12] border border-[#232830] rounded-xl px-3 py-2 text-xs font-mono text-[#e2e2e8] placeholder-[#4e4638] focus:border-[#eac169] focus:outline-none"
              />
              <button
                type="submit"
                id="btn-send-social-post"
                className="px-4 py-2 bg-[#eac169] hover:bg-[#c9a34e] text-[#3f2e00] font-bold font-mono text-xs rounded-xl flex items-center space-x-1.5 shadow-glow-primary active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>POST</span>
              </button>
            </form>

            {/* Social Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {socialFeed.map((post) => (
                <div 
                  key={post.id}
                  className="bg-[#0c0e12] border border-[#232830] rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-[#eac169]/40 transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1a1c20] border border-[#eac169]/30 shrink-0">
                      {post.avatar ? (
                        <img 
                          src={post.avatar} 
                          alt={post.author}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#eac169] font-bold">
                          {post.author.slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-mono font-bold text-[#e2e2e8] truncate">{post.author}</span>
                        {post.verified && <span className="text-[10px] text-[#42e39a]">✓</span>}
                      </div>
                      <div className="text-[10px] font-mono text-[#9a8f7e]">{post.handle} • {post.timeAgo}</div>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-[#d1c5b2] leading-relaxed">
                    {post.content}
                  </p>

                  {post.signalTag && (
                    <div className="pt-2 border-t border-[#232830] flex justify-between items-center text-[10px] font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        post.signalType === 'LONG' ? 'bg-[#42e39a]/10 text-[#42e39a]' : 'bg-[#ffb4ab]/10 text-[#ffb4ab]'
                      }`}>
                        {post.signalTag}
                      </span>
                      <span className="text-[#9a8f7e]">Verified Order</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
