import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  KeyRound, 
  Check, 
  Radio, 
  RefreshCw, 
  Maximize2, 
  Zap, 
  Sliders, 
  Volume2, 
  AlertCircle,
  Eye,
  Crosshair,
  Lock,
  Unlock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Play,
  Pause,
  Gauge,
  Activity,
  ListOrdered,
  X
} from 'lucide-react';
import { CandleChart } from './CandleChart';
import {
  AssetQuote,
  Candle,
  CalculatedIndicators,
  OrderBook,
  TapeItem,
  Position,
  NewsItem,
  Timeframe
} from '../types';
import { calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../utils/indicators';

interface MarketViewProps {
  quote: AssetQuote;
  candles: Candle[];
  indicators: CalculatedIndicators;
  orderBook: OrderBook;
  tape: TapeItem[];
  barTimerCountdown: number;
  tickSpeed: 'normal' | 'fast' | 'turbo';
  onSetTickSpeed: (speed: 'normal' | 'fast' | 'turbo') => void;
  isLiveStreaming: boolean;
  onToggleLiveStreaming: () => void;
  onManualTick?: (direction: 'UP' | 'DOWN' | 'SURGE_UP' | 'SURGE_DOWN') => void;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  positions: Position[];
  news: NewsItem[];
  onOpenOrder: (side: 'BUY' | 'SELL', lot: number, sl?: number, tp?: number) => void;
  onClosePosition: (ticket: number) => void;
  dryRun: boolean;
}

export const MarketView: React.FC<MarketViewProps> = ({
  quote,
  candles,
  indicators,
  orderBook,
  tape,
  barTimerCountdown,
  tickSpeed,
  onSetTickSpeed,
  isLiveStreaming,
  onToggleLiveStreaming,
  onManualTick,
  timeframe,
  onTimeframeChange,
  positions,
  news,
  onOpenOrder,
  onClosePosition,
  dryRun
}) => {
  // Chart Display Overlays
  const [showEmaRibbons, setShowEmaRibbons] = useState<boolean>(true);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showPivots, setShowPivots] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [bottomSubPane, setBottomSubPane] = useState<'rsi' | 'macd'>('rsi');
  const [breachAlert, setBreachAlert] = useState<string | null>(null);

  // Right Column Tab: 'ticket' vs 'dom' vs 'tape'
  const [rightTab, setRightTab] = useState<'ticket' | 'dom' | 'tape'>('ticket');

  // Bottom Area Tab: 'positions' vs 'news'
  const [bottomTab, setBottomTab] = useState<'positions' | 'news'>('positions');

  // Order Ticket States
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Stop'>('Market');
  const [lotSize, setLotSize] = useState<number>(1.00);
  const [stopLoss, setStopLoss] = useState<string>(quote.pivots.s1.toFixed(2));
  const [takeProfit, setTakeProfit] = useState<string>(quote.pivots.r1.toFixed(2));
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Crosshair state
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  // Super-User Key unlock
  const [superKey, setSuperKey] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Sync risk parameters to Floor Pivots
  const syncToPivots = () => {
    setStopLoss(quote.pivots.s1.toFixed(2));
    setTakeProfit(quote.pivots.r1.toFixed(2));
  };

  // Unlock super-user key
  const handleUnlockKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (superKey.trim().toUpperCase() === 'SUPER-GOLD-888' || superKey.trim().length >= 4) {
      setIsUnlocked(true);
      setKeyError(null);
    } else {
      setKeyError('Invalid key code. Try: SUPER-GOLD-888');
    }
  };

  // Quick lot adjustments
  const adjustLot = (amount: number) => {
    const newLot = Math.max(0.01, parseFloat((lotSize + amount).toFixed(2)));
    setLotSize(newLot);
  };

  // Handle Order Submit
  const handleOrderSubmit = (side: 'BUY' | 'SELL') => {
    setIsExecuting(true);
    setTimeout(() => {
      const slNum = parseFloat(stopLoss) || undefined;
      const tpNum = parseFloat(takeProfit) || undefined;
      onOpenOrder(side, lotSize, slNum, tpNum);
      setIsExecuting(false);
      setBreachAlert(`ORDER EXECUTED: ${side} ${lotSize} LOTS @ $${quote.price.toFixed(2)}`);
      setTimeout(() => setBreachAlert(null), 3000);
    }, 250);
  };

  // Calculations for genuine dynamic Candlestick SVG coordinates
  const {
    candleCount,
    minPrice,
    maxPrice,
    priceRange,
    ema9Points,
    ema21Points,
    ema50Points,
    rsiPoints,
    macdHistData
  } = useMemo(() => {
    const data = candles.length > 0 ? candles : [{
      time: Date.now(),
      timeStr: '12:00',
      open: quote.price,
      high: quote.price + 1,
      low: quote.price - 1,
      close: quote.price,
      volume: 500,
      isUp: true
    }];

    const count = data.length;
    let min = Math.min(...data.map(c => c.low));
    let max = Math.max(...data.map(c => c.high));

    // Pad range by 5%
    const pad = (max - min) * 0.08 || 1;
    min -= pad;
    max += pad;
    const range = max - min || 1;

    // Real mathematical indicator series
    const closes = data.map(c => c.close);
    const ema9 = calculateEMA(closes, 9);
    const ema21 = calculateEMA(closes, 21);
    const ema50 = calculateEMA(closes, 50);
    const rsi14 = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);

    // Map series to SVG coordinate percentage strings
    const toPoints = (series: number[]) => {
      return series.map((val, idx) => {
        const xPct = ((idx + 0.5) / count) * 100;
        const yPct = ((max - val) / range) * 100;
        return `${xPct.toFixed(2)},${yPct.toFixed(2)}`;
      }).join(' ');
    };

    const rsiSvgPoints = rsi14.map((val, idx) => {
      const xPct = ((idx + 0.5) / count) * 100;
      const yPct = 100 - val; // RSI 0-100 mapped to 0-100%
      return `${xPct.toFixed(2)},${yPct.toFixed(2)}`;
    }).join(' ');

    return {
      candleCount: count,
      minPrice: min,
      maxPrice: max,
      priceRange: range,
      ema9Points: toPoints(ema9),
      ema21Points: toPoints(ema21),
      ema50Points: toPoints(ema50),
      rsiPoints: rsiSvgPoints,
      macdHistData: macd.histogram
    };
  }, [candles, quote.price]);

  // Current active live price position on Y-axis
  const livePriceYPct = Math.max(2, Math.min(98, ((maxPrice - quote.price) / priceRange) * 100));

  return (
    <div className="flex-1 flex flex-col xl:flex-row overflow-hidden bg-[#0A0C10] select-none">
      
      {/* LEFT COLUMN: Main Real-Time Chart + Indicators + Positions/News */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#232830] overflow-hidden">
        
        {/* Breach / Execution Alert Toast */}
        {breachAlert && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#12151b]/95 border border-[#eac169] px-4 py-1.5 rounded-lg shadow-glow-primary flex items-center space-x-2 text-xs font-mono text-[#ffdf9e] breach-label-active">
            <Zap className="w-4 h-4 text-[#eac169] animate-bounce" />
            <span className="font-bold">{breachAlert}</span>
          </div>
        )}

        {/* High-Fidelity Real-Time Moving Candlestick Chart */}
        <div className="flex-1 flex flex-col min-h-[360px] relative overflow-hidden">
          <CandleChart
            quote={quote}
            candles={candles}
            indicators={indicators}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            barTimerCountdown={barTimerCountdown}
            tickSpeed={tickSpeed}
            onSetTickSpeed={onSetTickSpeed}
            isLiveStreaming={isLiveStreaming}
            onToggleLiveStreaming={onToggleLiveStreaming}
            onManualTick={onManualTick}
            positions={positions}
            showEmaRibbons={showEmaRibbons}
            setShowEmaRibbons={setShowEmaRibbons}
            showBollinger={showBollinger}
            setShowBollinger={setShowBollinger}
            showPivots={showPivots}
            setShowPivots={setShowPivots}
            showVolume={showVolume}
            setShowVolume={setShowVolume}
            onQuickOrder={(side) => handleOrderSubmit(side)}
          />
        </div>

        {/* SUB-PANE: Real Mathematical RSI (14) or MACD Indicator */}
        <div className="h-24 border-t border-[#232830] bg-[#0c0e12] px-3 py-1.5 flex flex-col justify-between shrink-0 relative">
          
          {/* Sub-pane Selector & Live Values */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBottomSubPane('rsi')}
                id="btn-subpane-rsi"
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  bottomSubPane === 'rsi'
                    ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40'
                    : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
                }`}
              >
                RSI (14): <span className="text-[#e2e2e8]">{indicators.rsi14.toFixed(1)}</span>
              </button>

              <button
                onClick={() => setBottomSubPane('macd')}
                id="btn-subpane-macd"
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  bottomSubPane === 'macd'
                    ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40'
                    : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
                }`}
              >
                MACD (12,26,9): <span className={indicators.macdHist >= 0 ? 'text-[#00e676]' : 'text-[#ff4455]'}>
                  {indicators.macdHist >= 0 ? `+${indicators.macdHist.toFixed(2)}` : indicators.macdHist.toFixed(2)}
                </span>
              </button>
            </div>

            {/* Status Badge */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              indicators.rsiStatus === 'BULLISH' ? 'bg-[#00e676]/10 text-[#00e676]' :
              indicators.rsiStatus === 'BEARISH' ? 'bg-[#ff4455]/10 text-[#ff4455]' :
              indicators.rsiStatus === 'OVERBOUGHT' ? 'bg-[#ff4455] text-[#12151b]' :
              indicators.rsiStatus === 'OVERSOLD' ? 'bg-[#00e676] text-[#12151b]' : 'text-[#9a8f7e]'
            }`}>
              [{indicators.rsiStatus}]
            </span>
          </div>

          {/* Dynamic Wave Chart for Sub-Pane */}
          <div className="relative h-12 w-full overflow-hidden">
            {bottomSubPane === 'rsi' ? (
              <>
                {/* 70 Overbought & 30 Oversold Lines */}
                <div className="absolute top-[30%] inset-x-0 border-t border-dotted border-[#ff4455]/40 flex justify-end pr-2 text-[9px] font-mono text-[#ff4455]">OB 70</div>
                <div className="absolute top-[70%] inset-x-0 border-t border-dotted border-[#00e676]/40 flex justify-end pr-2 text-[9px] font-mono text-[#00e676]">OS 30</div>
                <svg 
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#eac169"
                    strokeWidth="2"
                    points={rsiPoints}
                    className="drop-shadow-[0_0_4px_rgba(234,193,105,0.7)]"
                  />
                </svg>
              </>
            ) : (
              /* MACD Histogram Bars */
              <div className="w-full h-full flex items-center justify-between space-x-0.5 pt-1">
                {macdHistData.slice(-45).map((hist, i) => {
                  const isPos = hist >= 0;
                  const barHeight = Math.min(20, Math.abs(hist) * 25 + 2);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-center">
                      <div 
                        className={`w-full rounded-[1px] ${isPos ? 'bg-[#00e676]' : 'bg-[#ff4455]'}`}
                        style={{ height: `${barHeight}px` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Open Positions & Live News Wire */}
        <div className="h-44 bg-[#12151b] border-t border-[#232830] flex flex-col shrink-0">
          
          {/* Tabs bar */}
          <div className="h-8 border-b border-[#232830] bg-[#0c0e12] px-3 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBottomTab('positions')}
                id="btn-tab-positions-bottom"
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  bottomTab === 'positions'
                    ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/30 font-bold'
                    : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
                }`}
              >
                Open Positions ({positions.length})
              </button>

              <button
                onClick={() => setBottomTab('news')}
                id="btn-tab-news-bottom"
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  bottomTab === 'news'
                    ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/30 font-bold'
                    : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#42e39a] animate-pulse"></span>
                <span>News Feed [LIVE]</span>
              </button>
            </div>

            <span className="text-[10px] text-[#9a8f7e] hidden sm:inline">Auto-Refreshed via STP Router</span>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-2">
            {bottomTab === 'positions' ? (
              positions.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs font-mono text-[#9a8f7e]">
                  No active open positions. Place an order on the ticket or start Auto-Trader.
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono select-none">
                  <thead>
                    <tr className="text-[#9a8f7e] border-b border-[#232830] pb-1 text-[11px]">
                      <th className="py-1 px-2">Ticket</th>
                      <th className="py-1 px-2">Symbol</th>
                      <th className="py-1 px-2">Side</th>
                      <th className="py-1 px-2">Lots</th>
                      <th className="py-1 px-2">Entry</th>
                      <th className="py-1 px-2">S / L</th>
                      <th className="py-1 px-2">T / P</th>
                      <th className="py-1 px-2">Profit ($)</th>
                      <th className="py-1 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232830]/50">
                    {positions.map((pos) => {
                      const isProfit = pos.pnl >= 0;
                      return (
                        <tr key={pos.ticket} className="hover:bg-[#1a1c20] transition-colors">
                          <td className="py-1.5 px-2 text-[#9a8f7e]">#{pos.ticket}</td>
                          <td className="py-1.5 px-2 font-bold text-[#e2e2e8]">{pos.symbol}</td>
                          <td className="py-1.5 px-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.side === 'BUY' 
                                ? 'bg-[#42e39a]/10 text-[#42e39a] border border-[#42e39a]/30' 
                                : 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30'
                            }`}>
                              {pos.side}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-[#e2e2e8]">{pos.lot.toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-[#d1c5b2]">${pos.entry.toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-[#ffb4ab]">${pos.sl.toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-[#42e39a]">${pos.tp.toFixed(2)}</td>
                          <td className="py-1.5 px-2 font-bold">
                            <span className={isProfit ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>
                              {isProfit ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-right">
                            <button
                              onClick={() => onClosePosition(pos.ticket)}
                              id={`btn-close-pos-${pos.ticket}`}
                              className="px-2 py-0.5 rounded bg-[#282a2e] hover:bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:border-[#ffb4ab] text-[10px] font-bold transition-all"
                            >
                              CLOSE
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              <div className="space-y-2">
                {news.map((item) => (
                  <div 
                    key={item.id}
                    className="p-2 rounded bg-[#0c0e12] border border-[#232830] flex items-start justify-between space-x-3 text-xs font-mono hover:border-[#eac169]/30 transition-all"
                  >
                    <div className="flex items-start space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eac169]/10 text-[#eac169] border border-[#eac169]/30 shrink-0">
                        {item.source}
                      </span>
                      <p className="text-[#e2e2e8] leading-snug">{item.headline}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        item.sentiment === 'bullish' ? 'text-[#42e39a] bg-[#42e39a]/10' :
                        item.sentiment === 'bearish' ? 'text-[#ffb4ab] bg-[#ffb4ab]/10' : 'text-[#9a8f7e] bg-[#1a1c20]'
                      }`}>
                        {item.sentiment.toUpperCase()}
                      </span>
                      <span className="text-[#9a8f7e]">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Order Ticket, Level 2 Depth of Market & Time & Sales */}
      <div className="w-full xl:w-96 flex flex-col bg-[#0c0e12] overflow-y-auto shrink-0 select-none">
        
        {/* Right Header Navigation Tabs */}
        <div className="h-10 bg-[#12151b] border-b border-[#232830] px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1 text-xs font-mono">
            <button
              onClick={() => setRightTab('ticket')}
              id="tab-ticket"
              className={`px-3 py-1 rounded font-bold transition-all ${
                rightTab === 'ticket'
                  ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40'
                  : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              Order Ticket
            </button>

            <button
              onClick={() => setRightTab('dom')}
              id="tab-dom"
              className={`px-3 py-1 rounded font-bold transition-all ${
                rightTab === 'dom'
                  ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40'
                  : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              Level 2 DOM
            </button>

            <button
              onClick={() => setRightTab('tape')}
              id="tab-tape"
              className={`px-3 py-1 rounded font-bold transition-all ${
                rightTab === 'tape'
                  ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40'
                  : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              Tape (T&S)
            </button>
          </div>

          <span className="text-[10px] font-mono text-[#42e39a] font-bold">14ms</span>
        </div>

        {/* TAB 1: ORDER TICKET & SIGNAL ENGINE */}
        {rightTab === 'ticket' && (
          <div className="p-4 flex flex-col space-y-4">
            
            {/* Order Execution Type Select */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#9a8f7e] uppercase font-bold">ORDER TYPE</span>
              <div className="flex items-center bg-[#12151b] rounded-lg p-0.5 border border-[#232830]">
                {(['Market', 'Limit', 'Stop'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    id={`btn-order-type-${type}`}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded transition-all ${
                      orderType === type
                        ? 'bg-[#eac169] text-[#3f2e00] font-bold shadow-sm'
                        : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Lot Size Incrementer */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9a8f7e] flex items-center justify-between">
                <span>LOT VOLUME:</span>
                <span className="text-[#eac169] font-bold">{lotSize.toFixed(2)} Lots</span>
              </label>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => adjustLot(-0.1)}
                  id="btn-lot-minus"
                  className="w-9 h-9 rounded-lg bg-[#12151b] hover:bg-[#1e2024] border border-[#232830] text-[#e2e2e8] font-bold font-mono text-sm active:scale-95 transition-all flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="50.0"
                  value={lotSize}
                  onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  id="input-lot-size"
                  className="flex-1 bg-[#12151b] border border-[#232830] rounded-lg px-3 py-1.5 text-center text-sm font-mono font-bold text-[#e2e2e8] focus:border-[#eac169] focus:outline-none"
                />
                <button
                  onClick={() => adjustLot(0.1)}
                  id="btn-lot-plus"
                  className="w-9 h-9 rounded-lg bg-[#12151b] hover:bg-[#1e2024] border border-[#232830] text-[#e2e2e8] font-bold font-mono text-sm active:scale-95 transition-all flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Quick Lot Presets */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[0.10, 0.50, 1.00, 2.00].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLotSize(preset)}
                    id={`btn-preset-lot-${preset}`}
                    className={`py-1 text-[10px] font-mono rounded border transition-all ${
                      lotSize === preset
                        ? 'bg-[#1e2024] text-[#eac169] border-[#eac169]/50 font-bold'
                        : 'bg-[#12151b] text-[#9a8f7e] border-[#232830] hover:text-[#e2e2e8]'
                    }`}
                  >
                    {preset.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* SL / TP with Pivot Sync Button */}
            <div className="space-y-2 bg-[#12151b] p-3 rounded-xl border border-[#232830]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#9a8f7e]">RISK PARAMETERS</span>
                <button
                  onClick={syncToPivots}
                  id="btn-sync-pivots"
                  className="text-[10px] font-mono text-[#eac169] hover:underline flex items-center space-x-1"
                  title="Synchronize SL to S1 and TP to R1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Pivot Sync</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[#ffb4ab] block mb-1">STOP LOSS (S1)</label>
                  <input
                    type="text"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    id="input-stop-loss"
                    className="w-full bg-[#0c0e12] border border-[#ffb4ab]/40 rounded-md px-2.5 py-1 text-xs font-mono text-[#e2e2e8] focus:border-[#ffb4ab] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#42e39a] block mb-1">TAKE PROFIT (R1)</label>
                  <input
                    type="text"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    id="input-take-profit"
                    className="w-full bg-[#0c0e12] border border-[#42e39a]/40 rounded-md px-2.5 py-1 text-xs font-mono text-[#e2e2e8] focus:border-[#42e39a] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Super-User Key Bypass Box */}
            <div className="bg-[#12151b] p-2.5 rounded-xl border border-[#232830]">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <div className="flex items-center space-x-1.5">
                  {isUnlocked ? <Unlock className="w-3.5 h-3.5 text-[#42e39a]" /> : <Lock className="w-3.5 h-3.5 text-[#eac169]" />}
                  <span className="text-[#9a8f7e]">Super-User Key:</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  isUnlocked ? 'bg-[#42e39a]/10 text-[#42e39a]' : 'bg-[#eac169]/10 text-[#eac169]'
                }`}>
                  {isUnlocked ? 'BYPASS ACTIVE' : 'LOCKED'}
                </span>
              </div>

              {!isUnlocked ? (
                <form onSubmit={handleUnlockKey} className="flex space-x-1.5 mt-1.5">
                  <input
                    type="password"
                    placeholder="SUPER-GOLD-888"
                    value={superKey}
                    onChange={(e) => setSuperKey(e.target.value)}
                    id="input-super-user-key"
                    className="flex-1 bg-[#0c0e12] border border-[#232830] rounded px-2 py-1 text-xs font-mono text-[#e2e2e8] placeholder-[#4e4638] focus:border-[#eac169] focus:outline-none"
                  />
                  <button
                    type="submit"
                    id="btn-unlock-superkey"
                    className="px-2.5 py-1 bg-[#282a2e] hover:bg-[#333539] text-[#eac169] text-xs font-mono rounded font-bold border border-[#eac169]/30"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="text-[10px] font-mono text-[#42e39a] pt-1">
                  ✓ High-frequency max lot cap bypassed.
                </div>
              )}
            </div>

            {/* SELL & BUY PRIMARY BUTTONS (With Live Bid / Ask Prices) */}
            <div className="grid grid-cols-2 gap-3">
              {/* SELL BUTTON */}
              <button
                onClick={() => handleOrderSubmit('SELL')}
                disabled={isExecuting}
                id="btn-order-sell"
                className="py-3 px-3 rounded-xl bg-gradient-to-b from-[#93000a] to-[#5c0006] hover:from-[#ba1a1a] hover:to-[#7a0008] border border-[#ffb4ab]/30 text-white font-mono font-bold flex flex-col items-center justify-center transition-all shadow-glow-error active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center space-x-1 text-sm text-[#ffb4ab]">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>SELL</span>
                </div>
                <span className="text-xs text-[#e2e2e8] mt-0.5">
                  ${(quote.price - (quote.symbol === 'EURUSD' ? 0.0001 : 0.10)).toFixed(quote.symbol === 'EURUSD' ? 4 : 2)}
                </span>
              </button>

              {/* BUY BUTTON */}
              <button
                onClick={() => handleOrderSubmit('BUY')}
                disabled={isExecuting}
                id="btn-order-buy"
                className="py-3 px-3 rounded-xl bg-gradient-to-b from-[#05c680] to-[#038354] hover:from-[#42e39a] hover:to-[#04a269] border border-[#42e39a]/40 text-[#0c0e12] font-mono font-extrabold flex flex-col items-center justify-center transition-all shadow-glow-secondary active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center space-x-1 text-sm text-[#0c0e12]">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>BUY</span>
                </div>
                <span className="text-xs text-[#0c0e12] font-bold mt-0.5">
                  ${(quote.price + (quote.symbol === 'EURUSD' ? 0.0001 : 0.10)).toFixed(quote.symbol === 'EURUSD' ? 4 : 2)}
                </span>
              </button>
            </div>

            {/* REAL-TIME SIGNAL CONSENSUS SCORE */}
            <div className="p-3 bg-[#12151b] border border-[#232830] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#42e39a] animate-ping"></span>
                  <span className="text-xs font-bold font-mono text-[#e2e2e8]">QUANT SCORE: {indicators.signalScore}%</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  indicators.signalRating.includes('BUY') ? 'bg-[#42e39a]/10 text-[#42e39a] border border-[#42e39a]/30' :
                  indicators.signalRating.includes('SELL') ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30' : 'text-[#9a8f7e]'
                }`}>
                  {indicators.signalRating}
                </span>
              </div>

              {/* Progress Confidence Bar */}
              <div className="w-full bg-[#0c0e12] h-2 rounded-full overflow-hidden border border-[#232830]">
                <div 
                  className={`h-full transition-all duration-300 ${indicators.signalScore >= 50 ? 'bg-[#42e39a]' : 'bg-[#ffb4ab]'}`}
                  style={{ width: `${indicators.signalScore}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-[#9a8f7e] pt-1">
                <div>EMA Cross: <strong className={indicators.ema9 > indicators.ema21 ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>{indicators.ema9 > indicators.ema21 ? 'Bullish' : 'Bearish'}</strong></div>
                <div>RSI (14): <strong className="text-[#eac169]">{indicators.rsi14.toFixed(1)}</strong></div>
                <div>MACD Hist: <strong className={indicators.macdHist >= 0 ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>{indicators.macdHist >= 0 ? 'Positive' : 'Negative'}</strong></div>
                <div>Pivot Bias: <strong className={quote.price >= quote.pivots.pp ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>{quote.price >= quote.pivots.pp ? 'Above PP' : 'Below PP'}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEVEL 2 DEPTH OF MARKET (ORDER BOOK) */}
        {rightTab === 'dom' && (
          <div className="p-3 flex-1 flex flex-col font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-[#9a8f7e] pb-2 border-b border-[#232830]">
              <span>PRICE</span>
              <span>SIZE</span>
              <span>DEPTH TOTAL</span>
            </div>

            {/* Asks (Red) */}
            <div className="flex-1 flex flex-col justify-end space-y-1 py-2">
              {orderBook.asks.slice().reverse().map((ask, idx) => (
                <div key={idx} className="relative flex items-center justify-between text-[11px] px-2 py-0.5 rounded overflow-hidden">
                  <div 
                    className="absolute inset-y-0 right-0 bg-[#ffb4ab]/15 pointer-events-none"
                    style={{ width: `${ask.depthPct}%` }}
                  ></div>
                  <span className="text-[#ffb4ab] font-bold z-10">${ask.price.toFixed(quote.symbol === 'EURUSD' ? 4 : 2)}</span>
                  <span className="text-[#e2e2e8] z-10">{ask.size.toFixed(2)}</span>
                  <span className="text-[#9a8f7e] z-10">{ask.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Central Spread Display */}
            <div className="py-2 my-1 bg-[#12151b] border-y border-[#232830] flex items-center justify-between px-3 text-xs">
              <span className="text-[#eac169] font-bold">SPREAD:</span>
              <span className="text-[#ffdf9e] font-mono font-bold">${orderBook.spread.toFixed(quote.symbol === 'EURUSD' ? 4 : 2)} ({orderBook.spreadPips} pips)</span>
            </div>

            {/* Bids (Green) */}
            <div className="flex-1 flex flex-col space-y-1 py-2">
              {orderBook.bids.map((bid, idx) => (
                <div key={idx} className="relative flex items-center justify-between text-[11px] px-2 py-0.5 rounded overflow-hidden">
                  <div 
                    className="absolute inset-y-0 right-0 bg-[#42e39a]/15 pointer-events-none"
                    style={{ width: `${bid.depthPct}%` }}
                  ></div>
                  <span className="text-[#42e39a] font-bold z-10">${bid.price.toFixed(quote.symbol === 'EURUSD' ? 4 : 2)}</span>
                  <span className="text-[#e2e2e8] z-10">{bid.size.toFixed(2)}</span>
                  <span className="text-[#9a8f7e] z-10">{bid.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REAL-TIME TIME & SALES TAPE */}
        {rightTab === 'tape' && (
          <div className="p-3 flex-1 flex flex-col font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-[#9a8f7e] pb-2 border-b border-[#232830]">
              <span>TIME</span>
              <span>PRICE</span>
              <span>SIZE</span>
              <span className="text-right">SIDE</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pt-2">
              {tape.map((t) => (
                <div 
                  key={t.id}
                  className={`flex items-center justify-between p-1 rounded text-[11px] ${
                    t.isLarge ? 'bg-[#1e2024] border border-[#eac169]/30' : 'bg-[#0c0e12]'
                  }`}
                >
                  <span className="text-[#9a8f7e]">{t.time}</span>
                  <span className={`font-bold ${t.side === 'BUY' ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}`}>
                    ${t.price.toFixed(quote.symbol === 'EURUSD' ? 4 : 2)}
                  </span>
                  <span className={t.isLarge ? 'text-[#eac169] font-bold' : 'text-[#e2e2e8]'}>
                    {t.size.toFixed(2)} {t.isLarge ? '★' : ''}
                  </span>
                  <span className={`text-[10px] font-bold px-1 rounded ${
                    t.side === 'BUY' ? 'bg-[#42e39a]/10 text-[#42e39a]' : 'bg-[#ffb4ab]/10 text-[#ffb4ab]'
                  }`}>
                    {t.side}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
