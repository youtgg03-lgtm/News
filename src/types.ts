export type ActiveTab = 'market' | 'signals' | 'auto-trade' | 'news' | 'positions' | 'history';

export type Timeframe = '1s' | '5s' | '15s' | '30s' | '1m' | '3m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | '1W';

export interface TimeframeOption {
  id: Timeframe;
  label: string;
  category: 'seconds' | 'minutes' | 'hours' | 'days';
  seconds: number;
  description: string;
}

export interface Candle {
  time: number;
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  depthPct: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPips: number;
}

export interface TapeItem {
  id: string;
  time: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  isLarge?: boolean;
}

export interface CalculatedIndicators {
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  rsiStatus: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'OVERBOUGHT' | 'OVERSOLD';
  macdLine: number;
  macdSignal: number;
  macdHist: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  atr14: number;
  signalRating: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  signalScore: number;
}

export interface AssetQuote {
  symbol: string;
  name: string;
  category: 'Stocks' | 'Crypto' | 'Forex' | 'Indices' | 'Futures';
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePct: number;
  volume: string;
  spread: number;
  pivots: {
    r2: number;
    r1: number;
    pp: number;
    s1: number;
    s2: number;
  };
}

export interface Position {
  ticket: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  lot: number;
  entry: number;
  sl: number;
  tp: number;
  pnl: number;
  held: string;
  timestamp: number;
}

export interface TradeHistoryItem {
  ticket: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  lot: number;
  entry: number;
  exit: number;
  realizedPnl: number;
  closedAt: string;
  returnPct: string;
}

export interface TechnicalConsensusItem {
  name: string;
  status: string;
  value: string;
  bias: 'bullish' | 'bearish' | 'neutral';
}

export interface AnalysisSocialPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  timeAgo: string;
  content: string;
  signalTag?: string;
  signalType?: 'LONG' | 'SHORT';
  verified?: boolean;
}

export interface ScreenerItem {
  symbol: string;
  category: string;
  chgPct: number;
  rating: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  volatility: 'Low' | 'Medium' | 'High';
}

export interface NewsItem {
  id: string;
  time: string;
  source: string;
  headline: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'HIGH' | 'MED' | 'LOW';
  category: string;
}

export interface AutoTradeConfig {
  enabled: boolean;
  dryRun: boolean;
  baseLotSize: number;
  minConfidence: number;
  maxHoldDurationMin: number;
  dailyLossLimit: number;
  dailyWinTarget: number;
  strategyName: string;
}

export interface TerminalLog {
  id: string;
  time: string;
  type: 'INFO' | 'SCAN' | 'WARN' | 'SIGNAL' | 'EXEC' | 'HALT' | 'SYS' | 'DATA';
  message: string;
}

export interface TimeframeScanRow {
  tf: string;
  trend: 'Bullish' | 'Strong Bull' | 'Neutral' | 'Bearish';
  momentum: 'High' | 'Medium' | 'Low';
  signal: '[BUY]' | '[[STRONG BUY]]' | '[HOLD]' | '[SELL]';
}

export interface TechnicalReason {
  id: string;
  icon: 'check_circle' | 'warning' | 'info';
  title: string;
  description: string;
  weight: number;
}
