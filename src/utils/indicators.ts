import { Candle, CalculatedIndicators, OrderBook, OrderBookLevel, TapeItem, Timeframe } from '../types';
import { getTimeframeSeconds } from '../data/timeframes';

/**
 * Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const ema: number[] = [];

  // Start with SMA for the first period values if available, or just first value
  let sum = 0;
  const initialLength = Math.min(data.length, period);
  for (let i = 0; i < initialLength; i++) {
    sum += data[i];
  }
  let currentEma = sum / initialLength;

  for (let i = 0; i < data.length; i++) {
    if (i < initialLength) {
      ema.push(data[i]);
    } else {
      currentEma = data[i] * k + currentEma * (1 - k);
      ema.push(parseFloat(currentEma.toFixed(4)));
    }
  }
  return ema;
}

/**
 * Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      sma.push(parseFloat((sum / period).toFixed(4)));
    }
  }
  return sma;
}

/**
 * Relative Strength Index (RSI) - Wilder's Smoothing
 */
export function calculateRSI(closes: number[], period = 14): number[] {
  if (closes.length < 2) return closes.map(() => 50);
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // Initial average gain & loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // First values before period
  for (let i = 0; i <= period && i < closes.length; i++) {
    rsi.push(50);
  }

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const rsiVal = 100 - (100 / (1 + rs));
      rsi.push(parseFloat(rsiVal.toFixed(2)));
    }
  }

  return rsi;
}

/**
 * Moving Average Convergence Divergence (MACD)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const emaFast = calculateEMA(closes, fastPeriod);
  const emaSlow = calculateEMA(closes, slowPeriod);

  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(parseFloat((emaFast[i] - emaSlow[i]).toFixed(4)));
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    histogram.push(parseFloat((macdLine[i] - signalLine[i]).toFixed(4)));
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(
  closes: number[],
  period = 20,
  multiplier = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(closes[i] * 1.01);
      lower.push(closes[i] * 0.99);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(parseFloat((mean + multiplier * stdDev).toFixed(4)));
      lower.push(parseFloat((mean - multiplier * stdDev).toFixed(4)));
    }
  }

  return { upper, middle, lower };
}

/**
 * Average True Range (ATR)
 */
export function calculateATR(candles: Candle[], period = 14): number[] {
  if (candles.length === 0) return [];
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const trueRange = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    tr.push(trueRange);
  }

  return calculateEMA(tr, period);
}

/**
 * Generate initial continuous realistic OHLC candles calibrated to the active timeframe
 */
export function generateInitialCandles(
  symbol: string, 
  basePrice: number, 
  count = 48,
  timeframe: Timeframe = '1m'
): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const tfSeconds = getTimeframeSeconds(timeframe);
  const timeframeMs = tfSeconds * 1000;

  // Base instrument volatility
  let baseVol = symbol === 'XAUUSD' ? 1.2 : symbol === 'BTCUSD' ? 45.0 : symbol === 'EURUSD' ? 0.0008 : 0.6;
  
  // Scale volatility by square root of time ratio relative to 1m (60s)
  const timeRatio = Math.max(0.1, tfSeconds / 60);
  const volatility = baseVol * Math.min(6, Math.max(0.2, Math.sqrt(timeRatio)));

  let currentClose = basePrice - (count * 0.15 * volatility * (Math.random() > 0.5 ? 1 : -0.5));

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * timeframeMs;
    const dateObj = new Date(timestamp);
    
    let timeStr = '';
    if (tfSeconds < 60) {
      // Seconds timeframe: show HH:MM:SS
      timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
    } else if (tfSeconds < 86400) {
      // Intraday minutes & hours: show HH:MM
      timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    } else {
      // Daily / Weekly: show MM/DD
      timeStr = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
    }

    const isUp = Math.random() > 0.46;
    const delta = (Math.random() * volatility + 0.1 * volatility) * (isUp ? 1 : -0.92);
    const open = parseFloat(currentClose.toFixed(symbol === 'EURUSD' ? 4 : 2));
    const close = parseFloat((open + delta).toFixed(symbol === 'EURUSD' ? 4 : 2));
    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);
    const high = parseFloat((maxOC + Math.random() * volatility * 0.75).toFixed(symbol === 'EURUSD' ? 4 : 2));
    const low = parseFloat((minOC - Math.random() * volatility * 0.75).toFixed(symbol === 'EURUSD' ? 4 : 2));
    const volume = Math.floor((Math.random() * 850 + 150) * Math.sqrt(timeRatio));

    currentClose = close;

    candles.push({
      time: timestamp,
      timeStr,
      open,
      high,
      low,
      close,
      volume: Math.max(10, volume),
      isUp: close >= open
    });
  }

  // Ensure last candle is close to current basePrice
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, basePrice);
    last.low = Math.min(last.low, basePrice);
    last.isUp = last.close >= last.open;
  }

  return candles;
}

/**
 * Compute all technical indicators live from candle history
 */
export function calculateAllIndicators(
  candles: Candle[],
  livePrice: number,
  pivots: { pp: number }
): CalculatedIndicators {
  const closes = candles.map(c => c.close);
  if (closes.length === 0) {
    return {
      ema9: livePrice,
      ema21: livePrice,
      ema50: livePrice,
      ema200: livePrice,
      rsi14: 55.0,
      rsiStatus: 'BULLISH',
      macdLine: 0.25,
      macdSignal: 0.15,
      macdHist: 0.10,
      bbUpper: livePrice * 1.005,
      bbMiddle: livePrice,
      bbLower: livePrice * 0.995,
      atr14: 1.25,
      signalRating: 'BUY',
      signalScore: 82
    };
  }

  const ema9Series = calculateEMA(closes, 9);
  const ema21Series = calculateEMA(closes, 21);
  const ema50Series = calculateEMA(closes, 50);
  const ema200Series = calculateEMA(closes, 200);

  const rsiSeries = calculateRSI(closes, 14);
  const macd = calculateMACD(closes, 12, 26, 9);
  const bb = calculateBollingerBands(closes, 20, 2);
  const atrSeries = calculateATR(candles, 14);

  const lastIdx = closes.length - 1;
  const ema9 = ema9Series[lastIdx] ?? livePrice;
  const ema21 = ema21Series[lastIdx] ?? livePrice;
  const ema50 = ema50Series[lastIdx] ?? livePrice;
  const ema200 = ema200Series[lastIdx] ?? livePrice;

  const rsi14 = rsiSeries[lastIdx] ?? 50;
  const macdLine = macd.macdLine[lastIdx] ?? 0;
  const macdSignal = macd.signalLine[lastIdx] ?? 0;
  const macdHist = macd.histogram[lastIdx] ?? 0;

  const bbUpper = bb.upper[lastIdx] ?? livePrice * 1.01;
  const bbMiddle = bb.middle[lastIdx] ?? livePrice;
  const bbLower = bb.lower[lastIdx] ?? livePrice * 0.99;
  const atr14 = atrSeries[lastIdx] ?? 1.2;

  let rsiStatus: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'OVERBOUGHT' | 'OVERSOLD' = 'NEUTRAL';
  if (rsi14 >= 70) rsiStatus = 'OVERBOUGHT';
  else if (rsi14 <= 30) rsiStatus = 'OVERSOLD';
  else if (rsi14 > 52) rsiStatus = 'BULLISH';
  else if (rsi14 < 48) rsiStatus = 'BEARISH';

  // Quantitative signal scoring (0 to 100)
  let score = 50;
  // EMA Fast > EMA Slow
  if (ema9 > ema21) score += 15;
  else score -= 15;

  // Price above EMA50
  if (livePrice > ema50) score += 10;
  else score -= 10;

  // RSI Momentum
  if (rsi14 > 50 && rsi14 < 70) score += 12;
  else if (rsi14 < 50 && rsi14 > 30) score -= 12;
  else if (rsi14 <= 30) score += 15; // Mean reversion long
  else if (rsi14 >= 70) score -= 15; // Overbought risk

  // MACD Histogram positive & expanding
  if (macdHist > 0) score += 10;
  else score -= 10;

  // Price relative to central pivot
  if (livePrice >= pivots.pp) score += 8;
  else score -= 8;

  score = Math.max(5, Math.min(98, score));

  let signalRating: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL' = 'NEUTRAL';
  if (score >= 85) signalRating = 'STRONG BUY';
  else if (score >= 65) signalRating = 'BUY';
  else if (score <= 25) signalRating = 'STRONG SELL';
  else if (score <= 45) signalRating = 'SELL';

  return {
    ema9,
    ema21,
    ema50,
    ema200,
    rsi14,
    rsiStatus,
    macdLine,
    macdSignal,
    macdHist,
    bbUpper,
    bbMiddle,
    bbLower,
    atr14,
    signalRating,
    signalScore: score
  };
}

/**
 * Generate dynamic Level 2 Depth of Market
 */
export function generateOrderBook(price: number, symbol: string): OrderBook {
  const step = symbol === 'XAUUSD' ? 0.20 : symbol === 'BTCUSD' ? 5.0 : symbol === 'EURUSD' ? 0.0002 : 0.10;
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  let bidRunning = 0;
  let askRunning = 0;

  // 6 levels of Bids
  for (let i = 1; i <= 6; i++) {
    const p = parseFloat((price - i * step).toFixed(symbol === 'EURUSD' ? 4 : 2));
    const size = parseFloat((Math.random() * 8.5 + 0.5 * i).toFixed(2));
    bidRunning += size;
    bids.push({ price: p, size, total: parseFloat(bidRunning.toFixed(2)), depthPct: Math.min(100, i * 16) });
  }

  // 6 levels of Asks
  for (let i = 1; i <= 6; i++) {
    const p = parseFloat((price + i * step).toFixed(symbol === 'EURUSD' ? 4 : 2));
    const size = parseFloat((Math.random() * 8.5 + 0.5 * i).toFixed(2));
    askRunning += size;
    asks.push({ price: p, size, total: parseFloat(askRunning.toFixed(2)), depthPct: Math.min(100, i * 16) });
  }

  const spread = parseFloat((asks[0].price - bids[0].price).toFixed(symbol === 'EURUSD' ? 4 : 2));
  const spreadPips = symbol === 'EURUSD' ? spread * 10000 : spread * 10;

  return { bids, asks, spread, spreadPips: parseFloat(spreadPips.toFixed(1)) };
}

/**
 * Generate a new live trade packet for Time & Sales tape
 */
export function generateTapeItem(price: number, symbol: string): TapeItem {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;
  const side = Math.random() > 0.48 ? 'BUY' : 'SELL';
  const jitter = (Math.random() * 0.1 - 0.05) * (symbol === 'EURUSD' ? 0.001 : 1);
  const fillPrice = parseFloat((price + (side === 'BUY' ? Math.abs(jitter) : -Math.abs(jitter))).toFixed(symbol === 'EURUSD' ? 4 : 2));
  const isLarge = Math.random() > 0.85;
  const size = isLarge ? parseFloat((Math.random() * 15 + 5).toFixed(2)) : parseFloat((Math.random() * 2.5 + 0.1).toFixed(2));

  return {
    id: Math.random().toString(36).substring(2, 9),
    time,
    price: fillPrice,
    size,
    side,
    isLarge
  };
}
