import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar } from './components/SideNavBar';
import { TickerBar } from './components/TickerBar';
import { MarketView } from './components/MarketView';
import { SignalsView } from './components/SignalsView';
import { AutoTradeView } from './components/AutoTradeView';
import { PositionsHistoryView } from './components/PositionsHistoryView';
import { NewsView } from './components/NewsView';
import { NewOrderModal } from './components/NewOrderModal';
import { WalletModal } from './components/WalletModal';
import { SettingsModal } from './components/SettingsModal';
import { SupportModal } from './components/SupportModal';
import { ProfileModal } from './components/ProfileModal';
import { LogsDrawer } from './components/LogsDrawer';
import { useLiveMarket } from './hooks/useLiveMarket';

import {
  ActiveTab,
  Position,
  TradeHistoryItem,
  AnalysisSocialPost,
  ScreenerItem,
  NewsItem,
  AutoTradeConfig,
  TerminalLog,
  Timeframe
} from './types';

import {
  INITIAL_POSITIONS,
  INITIAL_TRADE_HISTORY,
  INITIAL_SOCIAL_FEED,
  INITIAL_SCREENER,
  INITIAL_NEWS,
  INITIAL_AUTOTRADE_CONFIG,
  INITIAL_TERMINAL_LOGS
} from './data/initialData';

export function App() {
  // Global State
  const [activeTab, setActiveTab] = useState<ActiveTab>('market');
  const [currentSymbol, setCurrentSymbol] = useState<string>('XAUUSD');
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>(INITIAL_TRADE_HISTORY);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [socialFeed, setSocialFeed] = useState<AnalysisSocialPost[]>(INITIAL_SOCIAL_FEED);
  const [screener, setScreener] = useState<ScreenerItem[]>(INITIAL_SCREENER);
  const [autoTradeConfig, setAutoTradeConfig] = useState<AutoTradeConfig>(INITIAL_AUTOTRADE_CONFIG);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>(INITIAL_TERMINAL_LOGS);

  // Financial metrics state
  const [balance, setBalance] = useState<number>(104250.00);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [serverTime, setServerTime] = useState<string>('14:32:05');

  // Chart Timeframe state
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');

  // Modals state
  const [isNewOrderOpen, setIsNewOrderOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);

  // Synthesize Web Audio chime for trading feedback
  const playChime = useCallback((type: 'success' | 'alert' | 'click' = 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Log append helper
  const addLog = useCallback((type: TerminalLog['type'], message: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    const newLog: TerminalLog = {
      id: Math.random().toString(36).substring(2, 9),
      time,
      type,
      message
    };
    setTerminalLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Order Execution Handler
  const handleExecuteOrder = useCallback((
    symbol: string,
    side: 'BUY' | 'SELL',
    lot: number,
    sl?: number,
    tp?: number,
    reason?: string
  ) => {
    setPositions(prev => {
      // Find current asset price from previous state or fallback
      const newTicket = Math.floor(10000 + Math.random() * 90000);
      const newPosition: Position = {
        ticket: newTicket,
        symbol,
        side,
        lot,
        entry: 0, // Will be updated on next tick with exact live fill
        sl: sl || 0,
        tp: tp || 0,
        pnl: 0.00,
        held: 'Just now',
        timestamp: Date.now()
      };
      return [newPosition, ...prev];
    });

    playChime('success');
    addLog(
      'EXEC',
      `[${autoTradeConfig.dryRun ? 'SIM' : 'PROD'}] Order Filled: ${side} ${lot} ${symbol} ${reason ? `(${reason})` : ''}`
    );
  }, [autoTradeConfig.dryRun, playChime, addLog]);

  // Auto-Trade Hook integration
  const handleAutoTradeExecute = useCallback((
    side: 'BUY' | 'SELL',
    lot: number,
    sl?: number,
    tp?: number,
    reason?: string
  ) => {
    handleExecuteOrder(currentSymbol, side, lot, sl, tp, reason);
  }, [currentSymbol, handleExecuteOrder]);

  // Real-Time Live Market Engine Hook
  const {
    assets,
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
    setResolution,
    pushManualTick
  } = useLiveMarket({
    currentSymbol,
    autoTradeConfig,
    onAutoTradeExecute: handleAutoTradeExecute,
    onAddLog: addLog,
    playChime
  });

  // Handle timeframe change
  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
    setResolution(tf);
  };

  // Close single position
  const handleClosePosition = useCallback((ticket: number) => {
    setPositions(prev => {
      const pos = prev.find(p => p.ticket === ticket);
      if (!pos) return prev;

      const quote = assets[pos.symbol] || currentQuote;
      const realizedPnl = pos.pnl;

      // Add to history
      const historyItem: TradeHistoryItem = {
        ticket: pos.ticket,
        symbol: pos.symbol,
        side: pos.side,
        lot: pos.lot,
        entry: pos.entry || quote.price,
        exit: quote.price,
        realizedPnl,
        closedAt: new Date().toTimeString().split(' ')[0],
        returnPct: `${realizedPnl >= 0 ? '+' : ''}${((realizedPnl / (Math.max(1, pos.entry) * pos.lot)) * 100).toFixed(2)}%`
      };

      setTradeHistory(h => [historyItem, ...h]);
      setBalance(b => b + realizedPnl);
      playChime(realizedPnl >= 0 ? 'success' : 'alert');
      addLog(
        'EXEC',
        `Position Closed: #${ticket} ${pos.symbol} Realized PnL: ${realizedPnl >= 0 ? '+$' : '-$'}${Math.abs(realizedPnl).toFixed(2)}`
      );

      return prev.filter(p => p.ticket !== ticket);
    });
  }, [assets, currentQuote, playChime, addLog]);

  // Real-time floating PnL and TP/SL hit check
  useEffect(() => {
    setPositions(prev => {
      let hasChanges = false;
      const updated = prev.map(p => {
        const quote = assets[p.symbol] || currentQuote;
        const entry = p.entry === 0 ? quote.price : p.entry;
        const sl = p.sl === 0 ? (p.side === 'BUY' ? quote.pivots.s1 : quote.pivots.r1) : p.sl;
        const tp = p.tp === 0 ? (p.side === 'BUY' ? quote.pivots.r1 : quote.pivots.s1) : p.tp;

        const diff = p.side === 'BUY' ? quote.price - entry : entry - quote.price;
        const multiplier = p.symbol === 'XAUUSD' ? 100 : p.symbol === 'BTCUSD' ? 1 : 100000;
        const pnl = parseFloat((diff * p.lot * multiplier).toFixed(2));

        // Check if TP / SL hit
        if (p.side === 'BUY') {
          if (quote.price >= tp) {
            setTimeout(() => handleClosePosition(p.ticket), 0);
          } else if (quote.price <= sl) {
            setTimeout(() => handleClosePosition(p.ticket), 0);
          }
        } else {
          if (quote.price <= tp) {
            setTimeout(() => handleClosePosition(p.ticket), 0);
          } else if (quote.price >= sl) {
            setTimeout(() => handleClosePosition(p.ticket), 0);
          }
        }

        if (p.entry !== entry || p.pnl !== pnl) {
          hasChanges = true;
        }

        return { ...p, entry, sl, tp, pnl };
      });

      return hasChanges ? updated : prev;
    });
  }, [assets, currentQuote, handleClosePosition]);

  // Server clock ticker
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setServerTime(new Date().toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setActiveTab('market');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setActiveTab('signals');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        setActiveTab('auto-trade');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewOrderOpen(true);
      } else if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsLogsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsNewOrderOpen(false);
        setIsWalletOpen(false);
        setIsSettingsOpen(false);
        setIsSupportOpen(false);
        setIsProfileOpen(false);
        setIsLogsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close all positions
  const handleCloseAllPositions = () => {
    positions.forEach(p => handleClosePosition(p.ticket));
  };

  // Close selected positions
  const handleCloseSelectedPositions = (tickets: number[]) => {
    tickets.forEach(t => handleClosePosition(t));
  };

  // Add social post
  const handleAddSocialPost = (content: string) => {
    const newPost: AnalysisSocialPost = {
      id: `post-${Date.now()}`,
      author: 'Gold_Sniper_PRO',
      handle: '@SniperPro',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYWr7uAXNw_IPJSAcNh5jYrx2b5DoV7sCbMVoKBG3gcKIHOHpQ7qA-JvSo7DYTNRySFiQZSvkuPLSoWDLxdrqLVA3Xi5p2Z1QyV1k_AV1htanf8puORTcmYlpwamk82tFXZ6oaMQpAI_QYZqEaTTfQzBx8RyYfB3CkXr4LxK-lS6qa8IUzIMBVyQb-kmKBJnK2oW9ZwOeJQXP5saIYSVCiAg9V5zcvZsYWNorkTFBCaR1c6D1d1m6yIA',
      timeAgo: 'Just now',
      content,
      signalTag: `SIGNAL ${currentSymbol}`,
      signalType: 'LONG',
      verified: true
    };
    setSocialFeed(prev => [newPost, ...prev]);
    playChime('click');
  };

  // Total Floating PnL
  const floatingPnl = positions.reduce((acc, p) => acc + p.pnl, 0);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0C10] text-[#e2e2e8] overflow-hidden select-none font-sans">
      
      {/* 1. TOP HEADER NAVIGATION */}
      <TopNavBar
        balance={balance}
        floatingPnl={floatingPnl}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        serverTime={serverTime}
      />

      {/* 2. BODY CONTENT: SIDEBAR + ACTIVE VIEW */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Navigation */}
        <SideNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          quote={currentQuote}
          dryRun={autoTradeConfig.dryRun}
          onToggleDryRun={() => setAutoTradeConfig(prev => ({ ...prev, dryRun: !prev.dryRun }))}
          onOpenNewOrder={() => setIsNewOrderOpen(true)}
          onOpenLogs={() => setIsLogsOpen(prev => !prev)}
          onOpenSupport={() => setIsSupportOpen(true)}
          openPositionsCount={positions.length}
        />

        {/* Central View Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'market' && (
            <MarketView
              quote={currentQuote}
              candles={currentCandles}
              indicators={currentIndicators}
              orderBook={orderBook}
              tape={tape}
              barTimerCountdown={barTimerCountdown}
              tickSpeed={tickSpeed}
              onSetTickSpeed={setTickSpeed}
              isLiveStreaming={isLiveStreaming}
              onToggleLiveStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
              positions={positions}
              news={news}
              onOpenOrder={(side, lot, sl, tp) => handleExecuteOrder(currentSymbol, side, lot, sl, tp)}
              onClosePosition={handleClosePosition}
              onManualTick={pushManualTick}
              dryRun={autoTradeConfig.dryRun}
            />
          )}

          {activeTab === 'signals' && (
            <SignalsView
              currentQuote={currentQuote}
              assets={assets}
              candles={currentCandles}
              indicators={currentIndicators}
              onSelectAsset={(symbol) => setCurrentSymbol(symbol)}
              socialFeed={socialFeed}
              screenerItems={screener}
              onAddSocialPost={handleAddSocialPost}
              onTriggerBreachChime={() => playChime('alert')}
            />
          )}

          {activeTab === 'auto-trade' && (
            <AutoTradeView
              config={autoTradeConfig}
              onUpdateConfig={(cfg) => setAutoTradeConfig(cfg)}
              logs={terminalLogs}
              onAddLog={addLog}
              onExecuteOrderDirect={(side, lot) => handleExecuteOrder(currentSymbol, side, lot)}
            />
          )}

          {(activeTab === 'positions' || activeTab === 'history') && (
            <PositionsHistoryView
              positions={positions}
              history={tradeHistory}
              onClosePosition={handleClosePosition}
              onCloseAllPositions={handleCloseAllPositions}
              onCloseSelectedPositions={handleCloseSelectedPositions}
            />
          )}

          {activeTab === 'news' && (
            <NewsView news={news} />
          )}
        </main>
      </div>

      {/* 3. BOTTOM LIVE MARQUEE TICKER TAPE */}
      <TickerBar
        assets={assets}
        dryRun={autoTradeConfig.dryRun}
      />

      {/* 4. MODALS & POPUPS */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        quote={currentQuote}
        assets={assets}
        onSelectSymbol={(sym) => setCurrentSymbol(sym)}
        onExecuteOrder={(sym, side, lot, sl, tp) => handleExecuteOrder(sym, side, lot, sl, tp)}
        dryRun={autoTradeConfig.dryRun}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={balance}
        floatingPnl={floatingPnl}
        onDeposit={(amount) => {
          setBalance(prev => prev + amount);
          playChime('success');
          addLog('INFO', `Deposited $${amount.toFixed(2)} to trading account.`);
        }}
        onResetBalance={() => {
          setBalance(100000.00);
          playChime('alert');
          addLog('INFO', 'Account balance reset to baseline $100,000.00.');
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <LogsDrawer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={terminalLogs}
        onClearLogs={() => setTerminalLogs([])}
      />
    </div>
  );
}

export default App;
