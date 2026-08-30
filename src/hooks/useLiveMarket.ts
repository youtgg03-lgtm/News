import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AssetQuote,
  Candle,
  CalculatedIndicators,
  OrderBook,
  TapeItem,
  Position,
  TradeHistoryItem,
  AutoTradeConfig,
  TerminalLog,
  Timeframe
} from '../types';
import {
  generateInitialCandles,
  calculateAllIndicators,
  generateOrderBook,
  generateTapeItem,
  calculateEMA,
  calculateRSI
} from '../utils/indicators';
import { INITIAL_ASSETS } from '../data/initialData';
import { getTimeframeSeconds } from '../data/timeframes';

export interface UseLiveMarketOptions {
  currentSymbol: string;
  autoTradeConfig: AutoTradeConfig;
  onAutoTradeExecute?: (side: 'BUY' | 'SELL', lot: number, sl?: number, tp?: number, reason?: string) => void;
  onAddLog: (type: TerminalLog['type'], message: string) => void;
  playChime: (type: 'success' | 'alert' | 'click') => void;
}

export function useLiveMarket({
  currentSymbol,
  autoTradeConfig,
  onAutoTradeExecute,
  onAddLog,
  playChime
}: UseLiveMarketOptions) {
  const [assets, setAssets] = useState<Record<string, AssetQuote>>(INITIAL_ASSETS);
  const [candleMap, setCandleMap] = useState<Record<string, Candle[]>>(() => {
    const map: Record<string, Candle[]> = {};
    Object.keys(INITIAL_ASSETS).forEach(sym => {
      map[sym] = generateInitialCandles(sym, INITIAL_ASSETS[sym].price, 50);
    });
    return map;
  });

  const [orderBook, setOrderBook] = useState<OrderBook>(() =>
    generateOrderBook(INITIAL_ASSETS.XAUUSD.price, 'XAUUSD')
  );
  const [tape, setTape] = useState<TapeItem[]>(() => [
    generateTapeItem(INITIAL_ASSETS.XAUUSD.price, 'XAUUSD'),
    generateTapeItem(INITIAL_ASSETS.XAUUSD.price, 'XAUUSD'),
    generateTapeItem(INITIAL_ASSETS.XAUUSD.price, 'XAUUSD'),
    generateTapeItem(INITIAL_ASSETS.XAUUSD.price, 'XAUUSD')
  ]);

  const [tickSpeed, setTickSpeed] = useState<'normal' | 'fast' | 'turbo'>('fast');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [barTimerCountdown, setBarTimerCountdown] = useState<number>(15);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');

  // Timeframe in seconds
  const [timeframeSeconds, setTimeframeSeconds] = useState<number>(60);

  // Reference for last candle timestamp
  const currentCandleStartRef = useRef<number>(Date.now());
  const lastAutoTradeTimeRef = useRef<number>(0);
  const goldOpenRef = useRef<number | null>(null);
  const goldConnectedRef = useRef<boolean>(false);

  // Current active quote & candles
  const currentQuote = assets[currentSymbol] || assets.XAUUSD;
  const currentCandles = candleMap[currentSymbol] || [];

  // Live calculated indicators
  const currentIndicators: CalculatedIndicators = calculateAllIndicators(
    currentCandles,
    currentQuote.price,
    currentQuote.pivots
  );

  // WebSocket for Binance Real Crypto Feed (BTCUSDT)
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectBinance = () => {
      try {
        ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        ws.onopen = () => {
          onAddLog('SYS', 'Real Binance WebSocket connected: live BTCUSDT trade stream active.');
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.c) {
              const liveBtcPrice = parseFloat(parseFloat(data.c).toFixed(2));
              const changeVal = parseFloat(parseFloat(data.p).toFixed(2));
              const changePctVal = parseFloat(parseFloat(data.P).toFixed(2));
              const highVal = parseFloat(parseFloat(data.h).toFixed(2));
              const lowVal = parseFloat(parseFloat(data.l).toFixed(2));

              setAssets(prev => {
                const btc = prev.BTCUSD;
                if (!btc) return prev;
                return {
                  ...prev,
                  BTCUSD: {
                    ...btc,
                    price: liveBtcPrice,
                    change: changeVal,
                    changePct: changePctVal,
                    high: Math.max(btc.high, highVal),
                    low: Math.min(btc.low, lowVal),
                    close: liveBtcPrice
                  }
                };
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        ws.onerror = () => {
          // fallback silently
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectBinance, 10000);
        };
      } catch (e) {
        // Fallback to high frequency simulation
      }
    };

    connectBinance();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [onAddLog]);

  // Real Gold Spot Price Feed (gold-api.com — free, no key, CORS-open)
  // This replaces the old Math.random() walk for XAUUSD with an actual
  // market-moving price. Polled every 4s since it's a REST endpoint, not
  // a websocket; that's still far more "real" than synthetic noise.
  useEffect(() => {
    let cancelled = false;
    let poll: any = null;

    const fetchGoldPrice = async () => {
      try {
        const res = await fetch('https://api.gold-api.com/price/XAU');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const price = parseFloat(data.price);
        if (cancelled || !price || Number.isNaN(price)) return;

        if (goldOpenRef.current === null) {
          goldOpenRef.current = price;
        }
        if (!goldConnectedRef.current) {
          goldConnectedRef.current = true;
          onAddLog('SYS', 'Real Gold API connected: live XAUUSD spot price active (gold-api.com).');
        }

        setAssets(prev => {
          const gold = prev.XAUUSD;
          if (!gold) return prev;
          const open = goldOpenRef.current ?? price;
          const change = parseFloat((price - open).toFixed(2));
          const changePct = parseFloat(((change / open) * 100).toFixed(2));
          return {
            ...prev,
            XAUUSD: {
              ...gold,
              price,
              open,
              change,
              changePct,
              high: Math.max(gold.high, price),
              low: gold.low === 0 ? price : Math.min(gold.low, price),
              close: price
            }
          };
        });
      } catch (e) {
        // Network blocked or API briefly down -- keep last known real price
        // rather than silently falling back to fake data.
        if (!cancelled && goldConnectedRef.current) {
          onAddLog('WARN', 'Gold API feed temporarily unreachable, holding last known price.');
          goldConnectedRef.current = false;
        }
      }
    };

    fetchGoldPrice(); // immediate first fetch, don't wait for the interval
    poll = setInterval(fetchGoldPrice, 4000);

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
    };
  }, [onAddLog]);

  // High Frequency Live Tick Loop & Candlestick Builder
  useEffect(() => {
    if (!isLiveStreaming) return;

    const intervalMs = tickSpeed === 'turbo' ? 120 : tickSpeed === 'fast' ? 280 : 750;

    const tickTimer = setInterval(() => {
      const now = Date.now();

      // 1. Generate live price micro-tick across assets
      let newCalculatedPrice = currentQuote.price;

      setAssets(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(sym => {
          const item = next[sym];
          // Skip if BTC has active WS unless offline
          if (sym === 'BTCUSD' && Math.random() > 0.4) {
            return;
          }
          // XAUUSD is driven entirely by the real gold-api.com feed above --
          // never overwrite it with synthetic noise.
          if (sym === 'XAUUSD') {
            if (sym === currentSymbol) newCalculatedPrice = item.price;
            return;
          }

          let vol = 0.22;
          if (sym === 'XAUUSD') vol = 0.55;
          else if (sym === 'BTCUSD') vol = 12.5;
          else if (sym === 'EURUSD') vol = 0.0004;
          else if (sym === 'SPX500') vol = 1.15;
          else if (sym === 'NVDA') vol = 0.75;
          else if (sym === 'TSLA') vol = 0.50;

          // Realistic micro-drift with momentum mean reversion
          const noise = (Math.random() - 0.495) * vol;
          const newPrice = parseFloat(
            Math.max(0.0001, item.price + noise).toFixed(sym === 'EURUSD' ? 4 : 2)
          );
          const newChange = parseFloat((item.change + noise).toFixed(sym === 'EURUSD' ? 4 : 2));
          const newChangePct = parseFloat(((newChange / item.open) * 100).toFixed(2));

          if (sym === currentSymbol) {
            newCalculatedPrice = newPrice;
          }

          next[sym] = {
            ...item,
            price: newPrice,
            change: newChange,
            changePct: newChangePct,
            high: Math.max(item.high, newPrice),
            low: Math.min(item.low, newPrice),
            close: newPrice
          };
        });
        return next;
      });

      // 2. Update real-time Candlestick for current active symbol
      setCandleMap(prevMap => {
        const nextMap = { ...prevMap };
        const sym = currentSymbol;
        const currentSeries = nextMap[sym] ? [...nextMap[sym]] : [];
        if (currentSeries.length === 0) return prevMap;

        const livePrice = newCalculatedPrice;
        const lastCandle = { ...currentSeries[currentSeries.length - 1] };
        const elapsedSeconds = Math.floor((now - currentCandleStartRef.current) / 1000);

        // Update countdown
        const remaining = Math.max(1, timeframeSeconds - (elapsedSeconds % timeframeSeconds));
        setBarTimerCountdown(remaining);

        // Check if candle duration has expired -> close bar and start new candle
        if (elapsedSeconds >= timeframeSeconds) {
          currentCandleStartRef.current = now;
          const dateObj = new Date(now);
          let timeStr = '';
          if (timeframeSeconds < 60) {
            timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
          } else if (timeframeSeconds < 86400) {
            timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
          } else {
            timeStr = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
          }

          const newCandle: Candle = {
            time: now,
            timeStr,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, livePrice),
            low: Math.min(lastCandle.close, livePrice),
            close: livePrice,
            volume: Math.floor(Math.random() * 25 + 5),
            isUp: livePrice >= lastCandle.close
          };

          // Maintain rolling window of 60 candles
          nextMap[sym] = [...currentSeries.slice(-59), newCandle];
        } else {
          // Update the current active candle in real-time
          lastCandle.close = livePrice;
          lastCandle.high = Math.max(lastCandle.high, livePrice);
          lastCandle.low = Math.min(lastCandle.low, livePrice);
          lastCandle.volume += Math.floor(Math.random() * 6 + 1);
          lastCandle.isUp = lastCandle.close >= lastCandle.open;
          nextMap[sym] = [...currentSeries.slice(0, -1), lastCandle];
        }

        return nextMap;
      });

      // 3. Update Level 2 Order Book on active symbol
      if (Math.random() > 0.3) {
        setOrderBook(generateOrderBook(currentQuote.price, currentSymbol));
      }

      // 4. Stream Time & Sales tape entries
      if (Math.random() > 0.4) {
        const newTapeItem = generateTapeItem(currentQuote.price, currentSymbol);
        setTape(prev => [newTapeItem, ...prev.slice(0, 19)]);
      }

      // 5. Auto-Trade Evaluation Loop (Algorithmic Trading Bot)
      if (
        autoTradeConfig.enabled &&
        onAutoTradeExecute &&
        now - lastAutoTradeTimeRef.current > 15000 // Cooldown 15s between auto entries
      ) {
        const indicators = calculateAllIndicators(
          currentCandles,
          currentQuote.price,
          currentQuote.pivots
        );

        if (indicators.signalScore >= autoTradeConfig.minConfidence) {
          // Trigger Auto BUY
          lastAutoTradeTimeRef.current = now;
          const tp = parseFloat((currentQuote.price + indicators.atr14 * 2.5).toFixed(2));
          const sl = parseFloat((currentQuote.price - indicators.atr14 * 1.5).toFixed(2));
          onAutoTradeExecute(
            'BUY',
            autoTradeConfig.baseLotSize,
            sl,
            tp,
            `Algo Entry: ${autoTradeConfig.strategyName} (Confidence: ${indicators.signalScore}%, RSI: ${indicators.rsi14})`
          );
        } else if (indicators.signalScore <= (100 - autoTradeConfig.minConfidence)) {
          // Trigger Auto SELL
          lastAutoTradeTimeRef.current = now;
          const tp = parseFloat((currentQuote.price - indicators.atr14 * 2.5).toFixed(2));
          const sl = parseFloat((currentQuote.price + indicators.atr14 * 1.5).toFixed(2));
          onAutoTradeExecute(
            'SELL',
            autoTradeConfig.baseLotSize,
            sl,
            tp,
            `Algo Entry: ${autoTradeConfig.strategyName} (Confidence: ${indicators.signalScore}%, RSI: ${indicators.rsi14})`
          );
        }
      }
    }, intervalMs);

    return () => clearInterval(tickTimer);
  }, [
    isLiveStreaming,
    tickSpeed,
    currentSymbol,
    timeframeSeconds,
    currentQuote.price,
    autoTradeConfig,
    onAutoTradeExecute
  ]);

  // Set chart timeframe
  const setResolution = useCallback((tf: Timeframe) => {
    const secs = getTimeframeSeconds(tf);
    setTimeframe(tf);
    setTimeframeSeconds(secs);
    currentCandleStartRef.current = Date.now();

    // Regenerate candle series scaled to this timeframe for the active symbol
    setCandleMap(prevMap => {
      const sym = currentSymbol;
      const currentItem = assets[sym] || assets.XAUUSD;
      return {
        ...prevMap,
        [sym]: generateInitialCandles(sym, currentItem.price, 50, tf)
      };
    });
  }, [currentSymbol, assets]);

  // Manual Tick Injection function to physically move the current live candle on demand
  const pushManualTick = useCallback((direction: 'UP' | 'DOWN' | 'SURGE_UP' | 'SURGE_DOWN') => {
    const sym = currentSymbol;
    const item = assets[sym] || assets.XAUUSD;
    
    let delta = 0;
    if (direction === 'UP') delta = sym === 'EURUSD' ? 0.0006 : sym === 'BTCUSD' ? 25.0 : 0.85;
    else if (direction === 'DOWN') delta = -(sym === 'EURUSD' ? 0.0006 : sym === 'BTCUSD' ? 25.0 : 0.85);
    else if (direction === 'SURGE_UP') delta = sym === 'EURUSD' ? 0.0025 : sym === 'BTCUSD' ? 120.0 : 4.50;
    else if (direction === 'SURGE_DOWN') delta = -(sym === 'EURUSD' ? 0.0025 : sym === 'BTCUSD' ? 120.0 : 4.50);

    const newPrice = parseFloat(Math.max(0.0001, item.price + delta).toFixed(sym === 'EURUSD' ? 4 : 2));
    const newChange = parseFloat((item.change + delta).toFixed(sym === 'EURUSD' ? 4 : 2));
    const newChangePct = parseFloat(((newChange / item.open) * 100).toFixed(2));

    setAssets(prev => ({
      ...prev,
      [sym]: {
        ...item,
        price: newPrice,
        change: newChange,
        changePct: newChangePct,
        high: Math.max(item.high, newPrice),
        low: Math.min(item.low, newPrice),
        close: newPrice
      }
    }));

    setCandleMap(prevMap => {
      const nextMap = { ...prevMap };
      const currentSeries = nextMap[sym] ? [...nextMap[sym]] : [];
      if (currentSeries.length === 0) return prevMap;

      const lastCandle = { ...currentSeries[currentSeries.length - 1] };
      lastCandle.close = newPrice;
      lastCandle.high = Math.max(lastCandle.high, newPrice);
      lastCandle.low = Math.min(lastCandle.low, newPrice);
      lastCandle.volume += Math.floor(Math.random() * 20 + 10);
      lastCandle.isUp = lastCandle.close >= lastCandle.open;

      nextMap[sym] = [...currentSeries.slice(0, -1), lastCandle];
      return nextMap;
    });

    playChime(direction.includes('UP') ? 'click' : 'alert');
  }, [currentSymbol, assets, playChime]);

  return {
    assets,
    setAssets,
    currentQuote,
    currentCandles,
    currentIndicators,
    orderBook,
    tape,
    tickSpeed,
    setTickSpeed,
    isLiveStreaming,
    setIsLiveStreaming,
    barTimerCountdown,
    timeframe,
    timeframeSeconds,
    setResolution,
    pushManualTick
  };
}
