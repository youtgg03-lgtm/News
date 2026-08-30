import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Crosshair, 
  Layers, 
  Maximize2, 
  Activity,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ChevronDown,
  Timer
} from 'lucide-react';
import { Candle, CalculatedIndicators, Position, AssetQuote, Timeframe } from '../types';
import { calculateEMA, calculateBollingerBands } from '../utils/indicators';
import { TIMEFRAME_OPTIONS, POPULAR_TIMEFRAMES, formatRemainingTime } from '../data/timeframes';

interface CandleChartProps {
  quote: AssetQuote;
  candles: Candle[];
  indicators: CalculatedIndicators;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  barTimerCountdown: number;
  tickSpeed: 'normal' | 'fast' | 'turbo';
  onSetTickSpeed: (speed: 'normal' | 'fast' | 'turbo') => void;
  isLiveStreaming: boolean;
  onToggleLiveStreaming: () => void;
  onManualTick?: (direction: 'UP' | 'DOWN' | 'SURGE_UP' | 'SURGE_DOWN') => void;
  positions: Position[];
  showEmaRibbons: boolean;
  setShowEmaRibbons: (show: boolean) => void;
  showBollinger: boolean;
  setShowBollinger: (show: boolean) => void;
  showPivots: boolean;
  setShowPivots: (show: boolean) => void;
  showVolume: boolean;
  setShowVolume: (show: boolean) => void;
  onQuickOrder?: (side: 'BUY' | 'SELL') => void;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  quote,
  candles,
  indicators,
  timeframe,
  onTimeframeChange,
  barTimerCountdown,
  tickSpeed,
  onSetTickSpeed,
  isLiveStreaming,
  onToggleLiveStreaming,
  onManualTick,
  positions,
  showEmaRibbons,
  setShowEmaRibbons,
  showBollinger,
  setShowBollinger,
  showPivots,
  setShowPivots,
  showVolume,
  setShowVolume,
  onQuickOrder
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeframeMenuRef = useRef<HTMLDivElement>(null);
  const [isTimeframeMenuOpen, setIsTimeframeMenuOpen] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 460 });
  const [hoverData, setHoverData] = useState<{
    candle: Candle | null;
    x: number;
    y: number;
    price: number;
  } | null>(null);

  // Close timeframe dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timeframeMenuRef.current && !timeframeMenuRef.current.contains(e.target as Node)) {
        setIsTimeframeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resize observer to ensure responsive vector scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: Math.floor(entry.contentRect.width),
            height: Math.floor(entry.contentRect.height)
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Flash state for micro-tick visual effect
  const [tickFlash, setTickFlash] = useState<'UP' | 'DOWN' | null>(null);
  const prevPriceRef = useRef<number>(quote.price);

  useEffect(() => {
    if (quote.price > prevPriceRef.current) {
      setTickFlash('UP');
    } else if (quote.price < prevPriceRef.current) {
      setTickFlash('DOWN');
    }
    prevPriceRef.current = quote.price;

    const timer = setTimeout(() => {
      setTickFlash(null);
    }, 220);

    return () => clearTimeout(timer);
  }, [quote.price]);

  // Chart coordinate math
  const { width, height } = dimensions;
  const paddingRight = 68; // Price scale axis on right
  const paddingBottom = 26; // Time scale axis on bottom
  const paddingTop = 28; // Header margin
  const paddingLeft = 12;

  const chartWidth = Math.max(100, width - paddingRight - paddingLeft);
  const chartHeight = Math.max(100, height - paddingBottom - paddingTop);

  // Derive min, max, price range with padding
  const chartMath = useMemo(() => {
    const data = candles.length > 0 ? candles : [{
      time: Date.now(),
      timeStr: '12:00:00',
      open: quote.price,
      high: quote.price + 1,
      low: quote.price - 1,
      close: quote.price,
      volume: 100,
      isUp: true
    }];

    const closes = data.map(c => c.close);
    const ema9 = calculateEMA(closes, 9);
    const ema21 = calculateEMA(closes, 21);
    const ema50 = calculateEMA(closes, 50);
    const bb = calculateBollingerBands(closes, 20, 2);

    let min = Math.min(...data.map(c => c.low));
    let max = Math.max(...data.map(c => c.high));

    // Also include pivots if shown to ensure they fit in view nicely
    if (showPivots && quote.pivots) {
      min = Math.min(min, quote.pivots.s2);
      max = Math.max(max, quote.pivots.r2);
    }

    // Include open positions' SL/TP
    positions.filter(p => p.symbol === quote.symbol).forEach(p => {
      if (p.entry > 0) {
        min = Math.min(min, p.entry);
        max = Math.max(max, p.entry);
      }
      if (p.sl > 0) min = Math.min(min, p.sl);
      if (p.tp > 0) max = Math.max(max, p.tp);
    });

    const pad = (max - min) * 0.08 || 1;
    min -= pad;
    max += pad;
    const range = max - min || 1;

    const count = data.length;
    const maxVolume = Math.max(1, ...data.map(c => c.volume));

    // Coordinate conversion functions
    const getY = (price: number) => {
      return paddingTop + ((max - price) / range) * chartHeight;
    };

    const getPriceFromY = (y: number) => {
      const clampedY = Math.max(paddingTop, Math.min(paddingTop + chartHeight, y));
      return max - ((clampedY - paddingTop) / chartHeight) * range;
    };

    const candleSlotWidth = chartWidth / count;
    const candleBodyWidth = Math.max(3, Math.min(18, candleSlotWidth * 0.72));

    const getX = (index: number) => {
      return paddingLeft + (index + 0.5) * candleSlotWidth;
    };

    // EMA polyline paths
    const toPath = (series: number[]) => {
      return series.map((val, idx) => {
        const x = getX(idx);
        const y = getY(val);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
    };

    // Bollinger band filled polygon
    let bbUpperPoints: string[] = [];
    let bbLowerPoints: string[] = [];
    if (showBollinger) {
      bbUpperPoints = bb.upper.map((val, idx) => `${getX(idx).toFixed(1)},${getY(val).toFixed(1)}`);
      bbLowerPoints = bb.lower.map((val, idx) => `${getX(idx).toFixed(1)},${getY(val).toFixed(1)}`).reverse();
    }
    const bbPolygon = [...bbUpperPoints, ...bbLowerPoints].join(' ');

    return {
      minPrice: min,
      maxPrice: max,
      priceRange: range,
      count,
      maxVolume,
      getY,
      getPriceFromY,
      getX,
      candleSlotWidth,
      candleBodyWidth,
      ema9Path: toPath(ema9),
      ema21Path: toPath(ema21),
      ema50Path: toPath(ema50),
      bbUpperPath: toPath(bb.upper),
      bbMiddlePath: toPath(bb.middle),
      bbLowerPath: toPath(bb.lower),
      bbPolygon,
      data
    };
  }, [candles, quote, showPivots, showBollinger, positions, chartWidth, chartHeight, paddingTop, paddingLeft]);

  // Handle Mouse Hover / Crosshair HUD
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX >= paddingLeft && mouseX <= paddingLeft + chartWidth && mouseY >= paddingTop && mouseY <= paddingTop + chartHeight) {
      const idx = Math.floor((mouseX - paddingLeft) / chartMath.candleSlotWidth);
      const clampedIdx = Math.max(0, Math.min(chartMath.data.length - 1, idx));
      const candle = chartMath.data[clampedIdx];
      const price = chartMath.getPriceFromY(mouseY);

      setHoverData({
        candle,
        x: chartMath.getX(clampedIdx),
        y: mouseY,
        price
      });
    } else {
      setHoverData(null);
    }
  }, [chartMath, chartWidth, chartHeight, paddingLeft, paddingTop]);

  const handleMouseLeave = useCallback(() => {
    setHoverData(null);
  }, []);

  // Format price helper according to symbol precision
  const formatPrice = (p: number) => {
    return quote.symbol === 'EURUSD' ? p.toFixed(4) : p.toFixed(2);
  };

  // Generate 6 horizontal price grid lines
  const gridLines = useMemo(() => {
    const lines: { y: number; price: number }[] = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const price = chartMath.minPrice + (chartMath.priceRange / steps) * i;
      const y = chartMath.getY(price);
      lines.push({ y, price });
    }
    return lines;
  }, [chartMath]);

  // Generate vertical time grid lines (every ~8-10 candles)
  const timeGridLines = useMemo(() => {
    const lines: { x: number; timeStr: string }[] = [];
    const step = Math.max(5, Math.floor(chartMath.count / 6));
    for (let i = 0; i < chartMath.count; i += step) {
      const c = chartMath.data[i];
      if (c) {
        lines.push({
          x: chartMath.getX(i),
          timeStr: c.timeStr || new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    }
    return lines;
  }, [chartMath]);

  // Current live price Y coordinate
  const livePriceY = chartMath.getY(quote.price);
  const activeCandleIdx = chartMath.count - 1;
  const activeCandleX = chartMath.getX(activeCandleIdx);
  const activeCandle = chartMath.data[activeCandleIdx];

  // Active Symbol open positions
  const symbolPositions = positions.filter(p => p.symbol === quote.symbol);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080b] relative select-none overflow-hidden" ref={containerRef}>
      
      {/* 1. TOP STATUS BAR: Live Price, Interactive Toggles & Tick Controls */}
      <div className="h-11 bg-[#0c0e12] border-b border-[#232830] px-3 flex items-center justify-between shrink-0 z-30 overflow-x-auto">
        
        {/* Left: Active Symbol & Dynamic Micro-Tick Metrics */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm font-mono text-[#eac169] tracking-wider">
              {quote.symbol}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#eac169]/10 text-[#eac169] font-mono border border-[#eac169]/30 font-bold">
              LIVE CANDLE
            </span>
          </div>

          {/* Pulsing Live Price Badge */}
          <div className={`flex items-center space-x-2 text-xs font-mono px-2 py-0.5 rounded transition-all duration-150 ${
            tickFlash === 'UP' ? 'bg-[#00e676]/20 ring-1 ring-[#00e676]' :
            tickFlash === 'DOWN' ? 'bg-[#ff4455]/20 ring-1 ring-[#ff4455]' :
            'bg-[#12151b]'
          }`}>
            <span className="text-white font-black text-sm tracking-tight flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${
                quote.change >= 0 ? 'bg-[#00e676]' : 'bg-[#ff4455]'
              } ${isLiveStreaming ? 'animate-ping' : ''}`}></span>
              <span>${formatPrice(quote.price)}</span>
            </span>
            <span className={`text-[11px] font-bold flex items-center ${
              quote.change >= 0 ? 'text-[#00e676]' : 'text-[#ff4455]'
            }`}>
              {quote.change >= 0 ? <ArrowUp className="w-3 h-3 inline mr-0.5" /> : <ArrowDown className="w-3 h-3 inline mr-0.5" />}
              {quote.change >= 0 ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)} ({quote.changePct}%)
            </span>
          </div>

          {/* Quick Candle OHLC Values */}
          <div className="hidden xl:flex items-center space-x-3 text-[11px] font-mono text-[#9a8f7e] pl-2 border-l border-[#232830]">
            <span>O: <strong className="text-[#e2e2e8]">${formatPrice(quote.open)}</strong></span>
            <span>H: <strong className="text-[#00e676]">${formatPrice(quote.high)}</strong></span>
            <span>L: <strong className="text-[#ff4455]">${formatPrice(quote.low)}</strong></span>
            <span>ATR: <strong className="text-[#eac169]">{indicators.atr14.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Center/Right: Interactive Candle Controls (Manual Ticks, Timeframe, Overlays) */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Manual Real Candle Mover Trigger Buttons */}
          {onManualTick && (
            <div className="flex items-center bg-[#12151b] rounded-lg p-0.5 border border-[#232830] space-x-1">
              <button
                onClick={() => onManualTick('UP')}
                id="btn-candle-tick-up"
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e676]/10 text-[#00e676] hover:bg-[#00e676]/25 border border-[#00e676]/30 transition-all flex items-center space-x-0.5 active:scale-95"
                title="Inject instant Bullish micro-tick to move current candle up"
              >
                <ArrowUp className="w-2.5 h-2.5" />
                <span>+Tick</span>
              </button>

              <button
                onClick={() => onManualTick('DOWN')}
                id="btn-candle-tick-down"
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff4455]/10 text-[#ff4455] hover:bg-[#ff4455]/25 border border-[#ff4455]/30 transition-all flex items-center space-x-0.5 active:scale-95"
                title="Inject instant Bearish micro-tick to move current candle down"
              >
                <ArrowDown className="w-2.5 h-2.5" />
                <span>-Tick</span>
              </button>

              <button
                onClick={() => onManualTick('SURGE_UP')}
                id="btn-candle-surge"
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#eac169]/10 text-[#eac169] hover:bg-[#eac169]/25 border border-[#eac169]/30 transition-all flex items-center space-x-0.5 active:scale-95"
                title="Simulate sudden high-volatility breakout candle"
              >
                <Zap className="w-2.5 h-2.5 text-[#eac169]" />
                <span>Surge</span>
              </button>
            </div>
          )}

          {/* Live Tick Speed Switcher */}
          <div className="hidden lg:flex items-center bg-[#12151b] rounded-lg p-0.5 border border-[#232830] text-[11px] font-mono">
            {(['normal', 'fast', 'turbo'] as const).map(speed => (
              <button
                key={speed}
                onClick={() => onSetTickSpeed(speed)}
                id={`btn-speed-${speed}`}
                className={`px-2 py-0.5 rounded uppercase font-bold transition-all ${
                  tickSpeed === speed
                    ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40'
                    : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
                }`}
              >
                {speed === 'turbo' ? '⚡ 100ms' : speed === 'fast' ? '250ms' : '600ms'}
              </button>
            ))}
          </div>

          {/* Live Stream Play/Pause */}
          <button
            onClick={onToggleLiveStreaming}
            id="btn-chart-toggle-stream"
            className={`p-1.5 rounded-lg border text-xs font-mono transition-all flex items-center space-x-1 ${
              isLiveStreaming 
                ? 'bg-[#12151b] border-[#00e676]/40 text-[#00e676]' 
                : 'bg-[#93000a]/20 border-[#ffb4ab]/40 text-[#ffb4ab]'
            }`}
            title={isLiveStreaming ? 'Pause live market ticks' : 'Resume live market ticks'}
          >
            {isLiveStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="text-[10px] font-bold hidden sm:inline">{isLiveStreaming ? 'LIVE' : 'PAUSED'}</span>
          </button>

          {/* Timeframe Selector with Quick Chips + Full Menu */}
          <div className="relative flex items-center bg-[#12151b] rounded-lg p-0.5 border border-[#eac169]/30 shadow-sm" ref={timeframeMenuRef}>
            <div className="hidden sm:flex items-center px-1.5 py-0.5 text-[9px] font-mono font-black text-[#eac169] uppercase tracking-wider bg-[#eac169]/10 rounded mr-1">
              TF
            </div>

            {/* Popular quick-select buttons */}
            {POPULAR_TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  onTimeframeChange(tf);
                  setIsTimeframeMenuOpen(false);
                }}
                id={`btn-chart-tf-${tf}`}
                className={`px-1.5 sm:px-2 py-0.5 text-[11px] font-mono rounded-md transition-all ${
                  timeframe === tf
                    ? 'bg-[#eac169] text-[#3f2e00] font-black shadow-sm ring-1 ring-[#eac169]'
                    : 'text-[#9a8f7e] hover:text-[#e2e2e8] hover:bg-[#1a1c20]'
                }`}
                title={`Switch chart timeframe to ${tf}`}
              >
                {tf}
              </button>
            ))}

            {/* Timeframe Dropdown Menu Toggle */}
            <button
              onClick={() => setIsTimeframeMenuOpen(!isTimeframeMenuOpen)}
              id="btn-chart-tf-dropdown"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md flex items-center space-x-0.5 transition-all ${
                !POPULAR_TIMEFRAMES.includes(timeframe)
                  ? 'bg-[#eac169] text-[#3f2e00] font-bold shadow-sm'
                  : 'text-[#9a8f7e] hover:text-[#e2e2e8] hover:bg-[#1a1c20]'
              }`}
              title="View all timeframes (seconds, minutes, hours, daily, weekly)"
            >
              {!POPULAR_TIMEFRAMES.includes(timeframe) ? <span className="font-black mr-0.5">{timeframe}</span> : null}
              <ChevronDown className={`w-3 h-3 transition-transform ${isTimeframeMenuOpen ? 'rotate-180 text-[#eac169]' : ''}`} />
            </button>

            {/* Full Timeframe Popover */}
            {isTimeframeMenuOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-[#12151b] border border-[#232830] rounded-xl shadow-2xl p-3 z-50 animate-fadeIn text-left backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase text-[#9a8f7e] font-bold tracking-wider mb-2 flex items-center justify-between pb-1.5 border-b border-[#232830]">
                  <span className="flex items-center space-x-1">
                    <Timer className="w-3 h-3 text-[#eac169]" />
                    <span>Select Timeframe</span>
                  </span>
                  <span className="text-[#eac169]">{timeframe}</span>
                </div>

                {/* Categories */}
                {(['seconds', 'minutes', 'hours', 'days'] as const).map(cat => {
                  const items = TIMEFRAME_OPTIONS.filter(o => o.category === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat} className="mb-2.5 last:mb-0">
                      <div className="text-[9px] uppercase font-mono text-[#5b6270] font-extrabold tracking-wider mb-1">
                        {cat}
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {items.map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              onTimeframeChange(item.id);
                              setIsTimeframeMenuOpen(false);
                            }}
                            id={`btn-menu-tf-${item.id}`}
                            className={`py-1 px-1.5 rounded text-[11px] font-mono font-bold transition-all text-center ${
                              timeframe === item.id
                                ? 'bg-[#eac169] text-[#3f2e00] shadow'
                                : 'bg-[#181b22] text-[#d1c5b2] hover:bg-[#232830] hover:text-white border border-[#232830]'
                            }`}
                          >
                            {item.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Indicator Overlays Buttons */}
          <div className="hidden md:flex items-center space-x-1 pl-1 border-l border-[#232830]">
            <button
              onClick={() => setShowEmaRibbons(!showEmaRibbons)}
              id="btn-chart-toggle-ema"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all ${
                showEmaRibbons 
                  ? 'bg-[#1e2024] text-[#eac169] border-[#eac169]/40 font-bold' 
                  : 'bg-transparent text-[#9a8f7e] border-transparent hover:border-[#232830]'
              }`}
            >
              EMA
            </button>

            <button
              onClick={() => setShowBollinger(!showBollinger)}
              id="btn-chart-toggle-bb"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all ${
                showBollinger 
                  ? 'bg-[#1e2024] text-[#38bdf8] border-[#38bdf8]/40 font-bold' 
                  : 'bg-transparent text-[#9a8f7e] border-transparent hover:border-[#232830]'
              }`}
            >
              BB(20,2)
            </button>

            <button
              onClick={() => setShowPivots(!showPivots)}
              id="btn-chart-toggle-pivots"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all ${
                showPivots 
                  ? 'bg-[#1e2024] text-[#00e676] border-[#00e676]/40 font-bold' 
                  : 'bg-transparent text-[#9a8f7e] border-transparent hover:border-[#232830]'
              }`}
            >
              PIVOTS
            </button>

            <button
              onClick={() => setShowVolume(!showVolume)}
              id="btn-chart-toggle-vol"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all ${
                showVolume 
                  ? 'bg-[#1e2024] text-[#d1c5b2] border-[#4e4638] font-bold' 
                  : 'bg-transparent text-[#9a8f7e] border-transparent hover:border-[#232830]'
              }`}
            >
              VOL
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN REAL-TIME CANDLESTICK SVG STAGE */}
      <div className="flex-1 w-full relative overflow-hidden">
        
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 bg-grid-tech opacity-20 pointer-events-none"></div>

        {/* Hover Crosshair HUD Tooltip */}
        {hoverData && hoverData.candle && (
          <div className="absolute top-2 left-4 z-40 bg-[#12151b]/95 border border-[#eac169]/60 px-3 py-1.5 rounded-lg text-xs font-mono text-[#e2e2e8] flex items-center space-x-3 shadow-2xl backdrop-blur pointer-events-none animate-fadeIn">
            <span className="text-[#eac169] font-bold">{hoverData.candle.timeStr}</span>
            <span>O: <strong className="text-[#d1c5b2]">${formatPrice(hoverData.candle.open)}</strong></span>
            <span>H: <strong className="text-[#00e676]">${formatPrice(hoverData.candle.high)}</strong></span>
            <span>L: <strong className="text-[#ff4455]">${formatPrice(hoverData.candle.low)}</strong></span>
            <span>C: <strong className={hoverData.candle.isUp ? 'text-[#00e676]' : 'text-[#ff4455]'}>${formatPrice(hoverData.candle.close)}</strong></span>
            <span>Vol: <strong className="text-[#9a8f7e]">{hoverData.candle.volume}</strong></span>
          </div>
        )}

        {/* Bar Close Timer Floating Indicator (Clickable to toggle timeframe) */}
        <button
          onClick={() => setIsTimeframeMenuOpen(!isTimeframeMenuOpen)}
          id="btn-floating-tf-timer"
          className="absolute top-2 right-20 z-30 bg-[#12151b]/90 hover:bg-[#1a1d24] border border-[#eac169]/40 hover:border-[#eac169] px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center space-x-1.5 shadow-md transition-all cursor-pointer group"
          title="Click to change chart timeframe"
        >
          <Clock className="w-3 h-3 text-[#eac169] animate-spin group-hover:scale-110 transition-transform" style={{ animationDuration: '4s' }} />
          <span className="text-[#eac169] font-extrabold uppercase tracking-wider">{timeframe}</span>
          <span className="text-[#9a8f7e]">close:</span>
          <span className="text-[#ffdf9e] font-bold font-mono">{formatRemainingTime(barTimerCountdown)}</span>
          <ChevronDown className="w-2.5 h-2.5 text-[#9a8f7e] group-hover:text-[#eac169]" />
        </button>

        {/* Scalable SVG Surface */}
        <svg
          className="w-full h-full cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            {/* Bullish Gradient */}
            <linearGradient id="bullCandleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00e676" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00b050" stopOpacity="0.75" />
            </linearGradient>

            {/* Bearish Gradient */}
            <linearGradient id="bearCandleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4455" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c7001e" stopOpacity="0.75" />
            </linearGradient>

            {/* Active Candle Glow Filter */}
            <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Price Line Dash Gradient */}
            <linearGradient id="priceLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eac169" stopOpacity="0.15" />
              <stop offset="85%" stopColor="#eac169" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#eac169" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* A. Horizontal Price Grid Lines */}
          {gridLines.map((line, idx) => (
            <g key={`grid-${idx}`}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="#1a1e26"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Right Axis Price Tag */}
              <text
                x={width - paddingRight + 6}
                y={line.y + 3.5}
                fill="#5b6270"
                fontSize="10"
                fontFamily="monospace"
              >
                {formatPrice(line.price)}
              </text>
            </g>
          ))}

          {/* B. Vertical Time Grid Lines */}
          {timeGridLines.map((tLine, idx) => (
            <g key={`time-${idx}`}>
              <line
                x1={tLine.x}
                y1={paddingTop}
                x2={tLine.x}
                y2={height - paddingBottom}
                stroke="#15181f"
                strokeWidth="1"
              />
              <text
                x={tLine.x}
                y={height - paddingBottom + 16}
                fill="#5b6270"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {tLine.timeStr}
              </text>
            </g>
          ))}

          {/* C. Floor Pivots Horizontal Guides */}
          {showPivots && quote.pivots && (
            <g className="pivots-layer opacity-80">
              {/* R2 Resistance */}
              <line
                x1={paddingLeft}
                y1={chartMath.getY(quote.pivots.r2)}
                x2={width - paddingRight}
                y2={chartMath.getY(quote.pivots.r2)}
                stroke="#ff4455"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={paddingLeft + 8}
                y={chartMath.getY(quote.pivots.r2) - 4}
                fill="#ff4455"
                fontSize="9"
                fontFamily="monospace"
              >
                R2: ${formatPrice(quote.pivots.r2)}
              </text>

              {/* R1 Resistance */}
              <line
                x1={paddingLeft}
                y1={chartMath.getY(quote.pivots.r1)}
                x2={width - paddingRight}
                y2={chartMath.getY(quote.pivots.r1)}
                stroke="#ffdf9e"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={paddingLeft + 8}
                y={chartMath.getY(quote.pivots.r1) - 4}
                fill="#ffdf9e"
                fontSize="9"
                fontFamily="monospace"
              >
                R1: ${formatPrice(quote.pivots.r1)}
              </text>

              {/* PP Pivot Equilibrium */}
              <line
                x1={paddingLeft}
                y1={chartMath.getY(quote.pivots.pp)}
                x2={width - paddingRight}
                y2={chartMath.getY(quote.pivots.pp)}
                stroke="#eac169"
                strokeWidth="1.2"
                strokeDasharray="6 3"
                opacity="0.8"
              />
              <text
                x={paddingLeft + 8}
                y={chartMath.getY(quote.pivots.pp) - 4}
                fill="#eac169"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                PIVOT PP: ${formatPrice(quote.pivots.pp)}
              </text>

              {/* S1 Support */}
              <line
                x1={paddingLeft}
                y1={chartMath.getY(quote.pivots.s1)}
                x2={width - paddingRight}
                y2={chartMath.getY(quote.pivots.s1)}
                stroke="#00e676"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={paddingLeft + 8}
                y={chartMath.getY(quote.pivots.s1) - 4}
                fill="#00e676"
                fontSize="9"
                fontFamily="monospace"
              >
                S1: ${formatPrice(quote.pivots.s1)}
              </text>

              {/* S2 Major Support */}
              <line
                x1={paddingLeft}
                y1={chartMath.getY(quote.pivots.s2)}
                x2={width - paddingRight}
                y2={chartMath.getY(quote.pivots.s2)}
                stroke="#00b050"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={paddingLeft + 8}
                y={chartMath.getY(quote.pivots.s2) - 4}
                fill="#00b050"
                fontSize="9"
                fontFamily="monospace"
              >
                S2: ${formatPrice(quote.pivots.s2)}
              </text>
            </g>
          )}

          {/* D. Bollinger Bands Channel & Polylines */}
          {showBollinger && (
            <g className="bollinger-layer">
              <polygon
                points={chartMath.bbPolygon}
                fill="#38bdf8"
                fillOpacity="0.06"
              />
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
                points={chartMath.bbUpperPath}
                opacity="0.6"
              />
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                points={chartMath.bbMiddlePath}
                opacity="0.4"
              />
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
                points={chartMath.bbLowerPath}
                opacity="0.6"
              />
            </g>
          )}

          {/* E. Volume Histogram Bars (Bottom) */}
          {showVolume && (
            <g className="volume-layer opacity-40">
              {chartMath.data.map((c, idx) => {
                const x = chartMath.getX(idx);
                const barHeight = (c.volume / chartMath.maxVolume) * 36;
                const y = height - paddingBottom - barHeight;
                const barWidth = Math.max(2, chartMath.candleBodyWidth * 0.7);

                return (
                  <rect
                    key={`vol-${idx}`}
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={c.isUp ? '#00e676' : '#ff4455'}
                    rx="1"
                  />
                );
              })}
            </g>
          )}

          {/* F. EMA Ribbons (9 Fast, 21 Medium, 50 Slow) */}
          {showEmaRibbons && (
            <g className="ema-layer">
              {/* EMA 50 (Sky Blue) */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                points={chartMath.ema50Path}
                opacity="0.75"
              />
              {/* EMA 21 (Emerald) */}
              <polyline
                fill="none"
                stroke="#00e676"
                strokeWidth="1.8"
                points={chartMath.ema21Path}
                opacity="0.9"
              />
              {/* EMA 9 (Gold) */}
              <polyline
                fill="none"
                stroke="#eac169"
                strokeWidth="2.2"
                points={chartMath.ema9Path}
                className="drop-shadow-[0_0_5px_rgba(234,193,105,0.6)]"
              />
            </g>
          )}

          {/* G. Candlestick Bodies & Wicks (Dynamic Real-Time Array) */}
          <g className="candlesticks-layer">
            {chartMath.data.map((candle, idx) => {
              const x = chartMath.getX(idx);
              const yHigh = chartMath.getY(candle.high);
              const yLow = chartMath.getY(candle.low);
              const yOpen = chartMath.getY(candle.open);
              const yClose = chartMath.getY(candle.close);

              const bodyTop = Math.min(yOpen, yClose);
              const bodyBottom = Math.max(yOpen, yClose);
              const bodyHeight = Math.max(2, bodyBottom - bodyTop);

              const isUp = candle.isUp;
              const isLast = idx === chartMath.count - 1;

              return (
                <g 
                  key={`candle-${candle.time || idx}`}
                  className={`transition-all duration-75 ${isLast ? 'active-moving-candle' : ''}`}
                >
                  {/* Upper & Lower Wick Line */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={isUp ? '#00e676' : '#ff4455'}
                    strokeWidth={isLast ? '1.5' : '1.2'}
                    strokeLinecap="round"
                  />

                  {/* Candlestick Body Rectangle */}
                  <rect
                    x={x - chartMath.candleBodyWidth / 2}
                    y={bodyTop}
                    width={chartMath.candleBodyWidth}
                    height={bodyHeight}
                    fill={isUp ? 'url(#bullCandleGrad)' : 'url(#bearCandleGrad)'}
                    stroke={isUp ? '#00e676' : '#ff4455'}
                    strokeWidth={isLast ? '1.5' : '1'}
                    rx="1.5"
                    filter={isLast ? 'url(#activeGlow)' : undefined}
                  />

                  {/* Active forming candle live pulse dot on close price */}
                  {isLast && (
                    <g>
                      {/* Radiating wave circle */}
                      <circle
                        cx={x}
                        cy={yClose}
                        r="6"
                        fill={isUp ? '#00e676' : '#ff4455'}
                        opacity="0.4"
                        className="animate-ping"
                      />
                      {/* Core hot center */}
                      <circle
                        cx={x}
                        cy={yClose}
                        r="3"
                        fill="#ffffff"
                        stroke={isUp ? '#00e676' : '#ff4455'}
                        strokeWidth="1.5"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* H. Open Positions Entry, SL & TP Lines on Chart */}
          {symbolPositions.map((pos) => {
            const entryY = chartMath.getY(pos.entry);
            const slY = pos.sl > 0 ? chartMath.getY(pos.sl) : null;
            const tpY = pos.tp > 0 ? chartMath.getY(pos.tp) : null;

            return (
              <g key={`pos-${pos.ticket}`}>
                {/* Entry Price Line */}
                {pos.entry > 0 && (
                  <g>
                    <line
                      x1={paddingLeft}
                      y1={entryY}
                      x2={width - paddingRight}
                      y2={entryY}
                      stroke={pos.side === 'BUY' ? '#38bdf8' : '#f59e0b'}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <rect
                      x={paddingLeft + 8}
                      y={entryY - 9}
                      width="150"
                      height="18"
                      fill="#12151b"
                      stroke={pos.side === 'BUY' ? '#38bdf8' : '#f59e0b'}
                      strokeWidth="1"
                      rx="3"
                    />
                    <text
                      x={paddingLeft + 14}
                      y={entryY + 3.5}
                      fill={pos.side === 'BUY' ? '#38bdf8' : '#f59e0b'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {pos.side} #{pos.ticket} {pos.lot}L @ ${formatPrice(pos.entry)}
                    </text>
                  </g>
                )}

                {/* Stop Loss Line */}
                {slY !== null && (
                  <g>
                    <line
                      x1={paddingLeft}
                      y1={slY}
                      x2={width - paddingRight}
                      y2={slY}
                      stroke="#ff4455"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <rect
                      x={paddingLeft + 8}
                      y={slY - 8}
                      width="95"
                      height="16"
                      fill="#93000a"
                      rx="2"
                    />
                    <text
                      x={paddingLeft + 12}
                      y={slY + 3}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      SL: ${formatPrice(pos.sl)}
                    </text>
                  </g>
                )}

                {/* Take Profit Line */}
                {tpY !== null && (
                  <g>
                    <line
                      x1={paddingLeft}
                      y1={tpY}
                      x2={width - paddingRight}
                      y2={tpY}
                      stroke="#00e676"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <rect
                      x={paddingLeft + 8}
                      y={tpY - 8}
                      width="95"
                      height="16"
                      fill="#006c35"
                      rx="2"
                    />
                    <text
                      x={paddingLeft + 12}
                      y={tpY + 3}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      TP: ${formatPrice(pos.tp)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* I. Live Real-Time Price Laser Tracking Beam & Right Tag */}
          <g className="live-price-tracker">
            {/* Horizontal Laser Line extending from active candle to scale */}
            <line
              x1={activeCandleX}
              y1={livePriceY}
              x2={width - paddingRight}
              y2={livePriceY}
              stroke="url(#priceLineGrad)"
              strokeWidth="1.8"
              strokeDasharray="4 2"
            />

            {/* Right Axis Glowing Live Price Badge */}
            <rect
              x={width - paddingRight}
              y={livePriceY - 11}
              width={paddingRight - 2}
              height="22"
              fill={quote.change >= 0 ? '#00e676' : '#ff4455'}
              rx="3"
              className="drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]"
            />
            <text
              x={width - paddingRight + 6}
              y={livePriceY + 4}
              fill="#000000"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="900"
            >
              ${formatPrice(quote.price)}
            </text>
          </g>

          {/* J. Crosshair Hover Guides */}
          {hoverData && (
            <g className="crosshair-guide pointer-events-none">
              {/* Vertical Crosshair Line */}
              <line
                x1={hoverData.x}
                y1={paddingTop}
                x2={hoverData.x}
                y2={height - paddingBottom}
                stroke="#eac169"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.75"
              />
              {/* Horizontal Crosshair Line */}
              <line
                x1={paddingLeft}
                y1={hoverData.y}
                x2={width - paddingRight}
                y2={hoverData.y}
                stroke="#eac169"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.75"
              />
              {/* Floating Price Tag on Crosshair Right Edge */}
              <rect
                x={width - paddingRight}
                y={hoverData.y - 9}
                width={paddingRight - 2}
                height="18"
                fill="#eac169"
                rx="2"
              />
              <text
                x={width - paddingRight + 4}
                y={hoverData.y + 3.5}
                fill="#12151b"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ${formatPrice(hoverData.price)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* 3. CHART FOOTER: Indicator Badges & Quick Action Panel */}
      <div className="h-7 bg-[#0c0e12] border-t border-[#232830] px-3 flex items-center justify-between text-[10px] font-mono text-[#9a8f7e] shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#eac169]"></span>
            <span>EMA(9): <strong className="text-[#e2e2e8]">${formatPrice(indicators.ema9)}</strong></span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#00e676]"></span>
            <span>EMA(21): <strong className="text-[#e2e2e8]">${formatPrice(indicators.ema21)}</strong></span>
          </span>
          <span className="flex items-center space-x-1 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
            <span>EMA(50): <strong className="text-[#e2e2e8]">${formatPrice(indicators.ema50)}</strong></span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span>RSI(14): <strong className="text-[#eac169]">{indicators.rsi14.toFixed(1)}</strong> ({indicators.rsiStatus})</span>
          <span className="hidden md:inline">Signal: <strong className={
            indicators.signalRating.includes('BUY') ? 'text-[#00e676]' :
            indicators.signalRating.includes('SELL') ? 'text-[#ff4455]' : 'text-[#eac169]'
          }>{indicators.signalRating} ({indicators.signalScore}%)</strong></span>
        </div>
      </div>
    </div>
  );
};
