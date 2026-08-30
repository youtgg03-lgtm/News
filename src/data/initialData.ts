import {
  AssetQuote,
  Position,
  TradeHistoryItem,
  AnalysisSocialPost,
  ScreenerItem,
  NewsItem,
  AutoTradeConfig,
  TerminalLog,
  TimeframeScanRow,
  TechnicalReason
} from '../types';

export const INITIAL_ASSETS: Record<string, AssetQuote> = {
  XAUUSD: {
    symbol: 'XAUUSD',
    name: 'Gold / US Dollar',
    category: 'Futures',
    price: 2342.10,
    open: 2329.65,
    high: 2345.20,
    low: 2325.10,
    close: 2342.10,
    change: 12.45,
    changePct: 0.53,
    volume: '1.2M',
    spread: 2.1,
    pivots: {
      r2: 2350.00,
      r1: 2345.00,
      pp: 2340.00,
      s1: 2335.00,
      s2: 2330.00,
    }
  },
  BTCUSD: {
    symbol: 'BTCUSD',
    name: 'Bitcoin / US Dollar',
    category: 'Crypto',
    price: 64210.50,
    open: 64287.00,
    high: 64950.00,
    low: 63800.00,
    close: 64210.50,
    change: -76.50,
    changePct: -0.12,
    volume: '28.4K',
    spread: 5.0,
    pivots: {
      r2: 65800.00,
      r1: 65000.00,
      pp: 64150.00,
      s1: 63400.00,
      s2: 62500.00,
    }
  },
  EURUSD: {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    category: 'Forex',
    price: 1.0742,
    open: 1.0861,
    high: 1.0875,
    low: 1.0730,
    close: 1.0742,
    change: -0.0119,
    changePct: -1.10,
    volume: '450K',
    spread: 0.8,
    pivots: {
      r2: 1.0880,
      r1: 1.0820,
      pp: 1.0770,
      s1: 1.0720,
      s2: 1.0680,
    }
  },
  SPX500: {
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    category: 'Indices',
    price: 5214.30,
    open: 5150.00,
    high: 5222.10,
    low: 5145.80,
    close: 5214.30,
    change: 64.30,
    changePct: 1.25,
    volume: '3.4B',
    spread: 1.2,
    pivots: {
      r2: 5260.00,
      r1: 5235.00,
      pp: 5190.00,
      s1: 5160.00,
      s2: 5120.00,
    }
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Stocks',
    price: 892.15,
    open: 856.20,
    high: 898.00,
    low: 852.10,
    close: 892.15,
    change: 35.95,
    changePct: 4.20,
    volume: '42.1M',
    spread: 0.5,
    pivots: {
      r2: 915.00,
      r1: 900.00,
      pp: 875.00,
      s1: 855.00,
      s2: 830.00,
    }
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'Stocks',
    price: 165.20,
    open: 169.95,
    high: 171.40,
    low: 164.80,
    close: 165.20,
    change: -4.75,
    changePct: -2.80,
    volume: '68.5M',
    spread: 0.4,
    pivots: {
      r2: 176.00,
      r1: 172.00,
      pp: 168.00,
      s1: 162.00,
      s2: 156.00,
    }
  },
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Stocks',
    price: 173.50,
    open: 172.10,
    high: 174.80,
    low: 171.90,
    close: 173.50,
    change: 1.40,
    changePct: 0.80,
    volume: '34.2M',
    spread: 0.3,
    pivots: {
      r2: 178.00,
      r1: 175.50,
      pp: 172.50,
      s1: 170.00,
      s2: 167.50,
    }
  }
};

export const INITIAL_POSITIONS: Position[] = [
  {
    ticket: 10294,
    symbol: 'XAUUSD',
    side: 'BUY',
    lot: 1.00,
    entry: 2340.50,
    sl: 2335.00,
    tp: 2350.00,
    pnl: 160.00,
    held: '2h 14m',
    timestamp: Date.now() - 8040000
  },
  {
    ticket: 10295,
    symbol: 'XAUUSD',
    side: 'BUY',
    lot: 0.50,
    entry: 2341.10,
    sl: 2338.00,
    tp: 2348.00,
    pnl: 50.00,
    held: '1h 02m',
    timestamp: Date.now() - 3720000
  },
  {
    ticket: 10301,
    symbol: 'XAUUSD',
    side: 'SELL',
    lot: 2.00,
    entry: 2343.00,
    sl: 2348.00,
    tp: 2330.00,
    pnl: -180.00,
    held: '14m',
    timestamp: Date.now() - 840000
  }
];

export const INITIAL_TRADE_HISTORY: TradeHistoryItem[] = [
  {
    ticket: 10280,
    symbol: 'XAUUSD',
    side: 'BUY',
    lot: 1.50,
    entry: 2336.20,
    exit: 2338.33,
    realizedPnl: 320.00,
    closedAt: '14:15:00',
    returnPct: '+0.09%'
  },
  {
    ticket: 10281,
    symbol: 'XAUUSD',
    side: 'SELL',
    lot: 0.50,
    entry: 2339.10,
    exit: 2340.00,
    realizedPnl: -45.00,
    closedAt: '13:30:22',
    returnPct: '-0.04%'
  },
  {
    ticket: 10285,
    symbol: 'BTCUSD',
    side: 'BUY',
    lot: 2.00,
    entry: 64005.00,
    exit: 64210.00,
    realizedPnl: 410.00,
    closedAt: '11:05:10',
    returnPct: '+0.32%'
  },
  {
    ticket: 10288,
    symbol: 'XAUUSD',
    side: 'SELL',
    lot: 1.00,
    entry: 2345.50,
    exit: 2344.10,
    realizedPnl: 140.00,
    closedAt: '09:45:00',
    returnPct: '+0.06%'
  },
  {
    ticket: 10272,
    symbol: 'EURUSD',
    side: 'BUY',
    lot: 2.50,
    entry: 1.0740,
    exit: 1.0740,
    realizedPnl: 0.00,
    closedAt: '08:15:33',
    returnPct: '0.00%'
  },
  {
    ticket: 10265,
    symbol: 'NVDA',
    side: 'BUY',
    lot: 5.00,
    entry: 845.00,
    exit: 889.00,
    realizedPnl: 220.00,
    closedAt: '07:30:12',
    returnPct: '+5.20%'
  }
];

export const INITIAL_SOCIAL_FEED: AnalysisSocialPost[] = [
  {
    id: 'post-1',
    author: 'MacroTrader',
    handle: '@MacroTrader',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY3cDS390496E_7AAIzXhTBKGSRurc8eG5oC6W47c3D8rItqo7SHSSmvr0PcGDpZAUk-wgbovxQuTOjA-5t1VEhVDUAcio8h57BXUbWUthh8JLCp2Ol6G4NH9MxVzB0X3UnLk89HXhxispO5v-xjE8KDiNCnD-MpG8u3wgEDKEMv4xLxjugF653rKj6uR1E4q4YpQ-gjkMdh0_6W2N2hPS8xVMf9J1rs1F4OKZIWALy1HcqIdbYTkJww',
    timeAgo: 'Just now',
    content: 'XAUUSD approaching major resistance at 2350. Volume drying up on the 15m. Looking for a short entry.',
    signalTag: 'SHORT XAUUSD',
    signalType: 'SHORT',
    verified: true
  },
  {
    id: 'post-2',
    author: 'QuantQueen',
    handle: '@QuantQueen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbG3uIzGIJq_MZt9_fFHv5vEDn2-nBmLGOnrgSICIcINKKigt7Cup5n30y4R8NP1FUc6maTohPynhblIAWY_7sEk48Xl0kF5dJYNZ-eDukkpAwMW5IzIi_MyWjNhF0j7rbbJZXMpkyAdAQj3-mk1MhEMLbWTWgqgGKCEa-MSWopnmjpZtWi8ffsrc4UOJC3xii1huEzJnvMskDZm-1XIHXcMDwGqnAfwIvBYU39IuYGZ2TAZBj4B46cA',
    timeAgo: '15m ago',
    content: 'Algorithm triggered strong buy signal on SPX500. Momentum oscillators align with 4H volume spike.',
    signalTag: 'LONG SPX500',
    signalType: 'LONG',
    verified: true
  },
  {
    id: 'post-3',
    author: 'TapeReader',
    handle: '@TapeReader',
    avatar: '',
    timeAgo: '1h ago',
    content: 'BTC forming a massive bull flag on 4H. Order book depth shows thick bids at 63,800 cluster.',
    signalTag: 'WATCH BTC',
    signalType: 'LONG',
    verified: false
  }
];

export const INITIAL_SCREENER: ScreenerItem[] = [
  { symbol: 'NVDA', category: 'Stocks', chgPct: 4.2, rating: 'Strong Buy', volatility: 'High' },
  { symbol: 'EURUSD', category: 'Forex', chgPct: -1.1, rating: 'Sell', volatility: 'Medium' },
  { symbol: 'XAUUSD', category: 'Futures', chgPct: 0.53, rating: 'Buy', volatility: 'High' },
  { symbol: 'TSLA', category: 'Stocks', chgPct: -2.8, rating: 'Strong Sell', volatility: 'High' },
  { symbol: 'BTCUSD', category: 'Crypto', chgPct: 0.1, rating: 'Neutral', volatility: 'Medium' },
  { symbol: 'SPX500', category: 'Indices', chgPct: 1.25, rating: 'Strong Buy', volatility: 'Medium' },
  { symbol: 'AAPL', category: 'Stocks', chgPct: 0.8, rating: 'Buy', volatility: 'Low' }
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    time: '09:42:15',
    source: 'PBOC',
    headline: 'Central bank accumulation provides strong floor near $2,348.',
    sentiment: 'bullish',
    impact: 'HIGH',
    category: 'GOLD'
  },
  {
    id: 'news-2',
    time: '09:38:02',
    source: 'FOMC',
    headline: 'Market awaits minutes for interest rate trajectory clarity; Gold volatility expected.',
    sentiment: 'neutral',
    impact: 'HIGH',
    category: 'FED'
  },
  {
    id: 'news-3',
    time: '09:30:00',
    source: 'XAU',
    headline: 'Gold maintains record highs despite high-yield US Treasury competition.',
    sentiment: 'bullish',
    impact: 'MED',
    category: 'GOLD'
  },
  {
    id: 'news-4',
    time: '09:15:44',
    source: 'ECON',
    headline: 'US Jobless Claims lower than consensus; DXY strengthens temporarily against majors.',
    sentiment: 'bearish',
    impact: 'MED',
    category: 'FOREX'
  },
  {
    id: 'news-5',
    time: '09:02:11',
    source: 'GOLD',
    headline: 'Central bank gold purchases continue at record pace in emerging market reserves.',
    sentiment: 'bullish',
    impact: 'HIGH',
    category: 'GOLD'
  },
  {
    id: 'news-6',
    time: '08:45:19',
    source: 'FED',
    headline: 'Powell hints at sustained rates; balance sheet reduction continues on schedule.',
    sentiment: 'neutral',
    impact: 'MED',
    category: 'FED'
  }
];

export const INITIAL_AUTOTRADE_CONFIG: AutoTradeConfig = {
  enabled: false,
  dryRun: true,
  baseLotSize: 0.10,
  minConfidence: 85,
  maxHoldDurationMin: 120,
  dailyLossLimit: 500.00,
  dailyWinTarget: 1500.00,
  strategyName: 'XAU_Scalp_V2'
};

export const INITIAL_TERMINAL_LOGS: TerminalLog[] = [
  { id: '1', time: '10:42:01', type: 'INFO', message: 'Engine initialized in Dry Run mode.' },
  { id: '2', time: '10:42:05', type: 'INFO', message: 'Loaded strategy configuration: XAU_Scalp_V2.' },
  { id: '3', time: '10:45:12', type: 'SCAN', message: 'Analyzing XAUUSD M5 structure... no clear setup.' },
  { id: '4', time: '10:51:30', type: 'WARN', message: 'Spread widening detected (> 4.5 pips). Pausing entry logic temporarily.' },
  { id: '5', time: '11:05:22', type: 'SCAN', message: 'Spread normalized (2.1 pips). Resuming scan.' },
  { id: '6', time: '11:12:45', type: 'SIGNAL', message: 'Valid BUY signal detected. Conf: 88%. (Simulated execution due to Dry Run)' },
  { id: '7', time: '11:12:46', type: 'EXEC', message: '[SIM] Order sent: BUY 0.10 XAUUSD @ 2342.15. TP: 2345.00 SL: 2340.00' },
  { id: '8', time: '11:45:10', type: 'EXEC', message: '[SIM] Order closed: Take Profit hit. PnL: +$285.00' },
  { id: '9', time: '11:45:11', type: 'HALT', message: 'Daily Win Target ($1500) reached historically. Auto-orders paused for current session.' },
  { id: '10', time: '11:45:12', type: 'SYS', message: 'Awaiting manual intervention or session reset...' }
];

export const TIMEFRAME_SCAN_DATA: TimeframeScanRow[] = [
  { tf: '1m', trend: 'Bullish', momentum: 'High', signal: '[BUY]' },
  { tf: '5m', trend: 'Bullish', momentum: 'Medium', signal: '[BUY]' },
  { tf: '15m', trend: 'Strong Bull', momentum: 'High', signal: '[[STRONG BUY]]' },
  { tf: '30m', trend: 'Neutral', momentum: 'Low', signal: '[HOLD]' },
  { tf: '1h', trend: 'Bearish', momentum: 'Medium', signal: '[SELL]' }
];

export const TECHNICAL_REASONS: TechnicalReason[] = [
  {
    id: 'r1',
    icon: 'check_circle',
    title: 'EMA9 crossed above EMA21',
    description: 'Short-term moving average confirms bullish momentum on 15m timeframe.',
    weight: 15
  },
  {
    id: 'r2',
    icon: 'check_circle',
    title: 'RSI(14) at 62.5 (Bullish Divergence)',
    description: 'Relative Strength Index shows room for upward movement before overbought levels.',
    weight: 10
  },
  {
    id: 'r3',
    icon: 'warning',
    title: 'Approaching Resistance Zone (2345.00)',
    description: 'Historical volume profile indicates significant selling pressure overhead.',
    weight: -5
  },
  {
    id: 'r4',
    icon: 'check_circle',
    title: 'MACD Histogram expanding positively',
    description: 'MACD line extending gap from signal line, confirming trend strength.',
    weight: 12
  }
];

export const DEFAULT_PINE_SCRIPT = `//@version=5
indicator("Gold Terminal EMA Ribbon", overlay=true)

var int len1 = 20
var int len2 = 50

ema1 = ta.ema(close, len1)
ema2 = ta.ema(close, len2)

plot(ema1, color=color.new(#eac169, 0), title="EMA 20")
plot(ema2, color=color.new(#42e39a, 0), title="EMA 50")
`;
