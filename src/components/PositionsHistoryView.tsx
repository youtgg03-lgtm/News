import React, { useState } from 'react';
import { 
  Layers, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  ShieldCheck, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Position, TradeHistoryItem } from '../types';

interface PositionsHistoryViewProps {
  positions: Position[];
  history: TradeHistoryItem[];
  onClosePosition: (ticket: number) => void;
  onCloseAllPositions: () => void;
  onCloseSelectedPositions: (tickets: number[]) => void;
}

export const PositionsHistoryView: React.FC<PositionsHistoryViewProps> = ({
  positions,
  history,
  onClosePosition,
  onCloseAllPositions,
  onCloseSelectedPositions
}) => {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  // Toggle selection
  const toggleSelect = (ticket: number) => {
    setSelectedTickets(prev => 
      prev.includes(ticket) ? prev.filter(t => t !== ticket) : [...prev, ticket]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedTickets.length === positions.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(positions.map(p => p.ticket));
    }
  };

  // Close selected
  const handleCloseSelected = () => {
    if (selectedTickets.length === 0) return;
    onCloseSelectedPositions(selectedTickets);
    setSelectedTickets([]);
  };

  // Calculate totals
  const totalFloatingPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalRealizedPnl = history.reduce((acc, h) => acc + h.realizedPnl, 0);
  const winningTrades = history.filter(h => h.realizedPnl > 0).length;
  const winRate = history.length > 0 ? ((winningTrades / history.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0C10] p-4 select-none space-y-4">
      
      {/* Top Header Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Floating PnL */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-3 flex flex-col justify-between shadow-inner">
          <span className="text-[11px] font-mono text-[#9a8f7e] uppercase tracking-wider">
            Total Floating PnL
          </span>
          <div className="text-xl font-extrabold font-mono mt-1">
            <span className={totalFloatingPnl >= 0 ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>
              {totalFloatingPnl >= 0 ? `+$${totalFloatingPnl.toFixed(2)}` : `-$${Math.abs(totalFloatingPnl).toFixed(2)}`}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#9a8f7e] mt-1">{positions.length} Active Positions</span>
        </div>

        {/* Metric 2: Realized Daily PnL */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-3 flex flex-col justify-between shadow-inner">
          <span className="text-[11px] font-mono text-[#9a8f7e] uppercase tracking-wider">
            Realized Net Profit
          </span>
          <div className="text-xl font-extrabold font-mono mt-1">
            <span className={totalRealizedPnl >= 0 ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>
              {totalRealizedPnl >= 0 ? `+$${totalRealizedPnl.toFixed(2)}` : `-$${Math.abs(totalRealizedPnl).toFixed(2)}`}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#42e39a] mt-1">Today's Session</span>
        </div>

        {/* Metric 3: Win Rate */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-3 flex flex-col justify-between shadow-inner">
          <span className="text-[11px] font-mono text-[#9a8f7e] uppercase tracking-wider">
            Historical Win Rate
          </span>
          <div className="text-xl font-extrabold font-mono text-[#eac169] mt-1">
            {winRate}%
          </div>
          <span className="text-[10px] font-mono text-[#9a8f7e] mt-1">{winningTrades} Wins / {history.length - winningTrades} Losses</span>
        </div>

        {/* Metric 4: Profit Factor */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-3 flex flex-col justify-between shadow-inner">
          <span className="text-[11px] font-mono text-[#9a8f7e] uppercase tracking-wider">
            Profit Factor
          </span>
          <div className="text-xl font-extrabold font-mono text-[#ffdf9e] mt-1">
            3.42
          </div>
          <span className="text-[10px] font-mono text-[#42e39a] mt-1">Institutional Grade</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 bg-[#12151b] border border-[#232830] rounded-2xl flex flex-col overflow-hidden shadow-inner">
        
        {/* Table Toolbar & View Switcher */}
        <div className="h-12 bg-[#0c0e12] border-b border-[#232830] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('positions')}
              id="tab-open-positions-main"
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'positions'
                  ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40 shadow-sm'
                  : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Open Positions ({positions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              id="tab-history-main"
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40 shadow-sm'
                  : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Closed Trade History ({history.length})</span>
            </button>
          </div>

          {/* Batch Actions for Positions */}
          {activeTab === 'positions' && positions.length > 0 && (
            <div className="flex items-center space-x-2">
              {selectedTickets.length > 0 && (
                <button
                  onClick={handleCloseSelected}
                  id="btn-close-selected-positions"
                  className="px-2.5 py-1 rounded bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 text-xs font-mono font-bold transition-all"
                >
                  Close Selected ({selectedTickets.length})
                </button>
              )}

              <button
                onClick={onCloseAllPositions}
                id="btn-close-all-positions"
                className="px-2.5 py-1 rounded bg-[#93000a] hover:bg-[#ba1a1a] text-white text-xs font-mono font-bold transition-all shadow-glow-error"
              >
                Close All (Flatten)
              </button>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'positions' ? (
            positions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs font-mono text-[#9a8f7e] space-y-2">
                <Layers className="w-8 h-8 text-[#282a2e]" />
                <p>No open positions in book. Use the Order Ticket to enter the market.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono select-none">
                <thead>
                  <tr className="text-[#9a8f7e] border-b border-[#232830] pb-2 text-[11px]">
                    <th className="py-2 px-2 w-8">
                      <button onClick={toggleSelectAll} className="flex items-center">
                        {selectedTickets.length === positions.length ? (
                          <CheckSquare className="w-4 h-4 text-[#eac169]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#9a8f7e]" />
                        )}
                      </button>
                    </th>
                    <th className="py-2 px-2">Ticket #</th>
                    <th className="py-2 px-2">Symbol</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Volume</th>
                    <th className="py-2 px-2">Open Price</th>
                    <th className="py-2 px-2">Stop Loss</th>
                    <th className="py-2 px-2">Take Profit</th>
                    <th className="py-2 px-2">Duration</th>
                    <th className="py-2 px-2">Unrealized PnL</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232830]/50">
                  {positions.map((pos) => {
                    const isSelected = selectedTickets.includes(pos.ticket);
                    const isProfit = pos.pnl >= 0;
                    return (
                      <tr key={pos.ticket} className="hover:bg-[#1a1c20] transition-colors">
                        <td className="py-2 px-2">
                          <button onClick={() => toggleSelect(pos.ticket)} className="flex items-center">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#eac169]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#4e4638]" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-2 text-[#9a8f7e]">#{pos.ticket}</td>
                        <td className="py-2 px-2 font-bold text-[#e2e2e8]">{pos.symbol}</td>
                        <td className="py-2 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            pos.side === 'BUY' 
                              ? 'bg-[#42e39a]/10 text-[#42e39a] border border-[#42e39a]/30' 
                              : 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30'
                          }`}>
                            {pos.side}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[#e2e2e8]">{pos.lot.toFixed(2)}</td>
                        <td className="py-2 px-2 text-[#d1c5b2]">${pos.entry.toFixed(2)}</td>
                        <td className="py-2 px-2 text-[#ffb4ab]">${pos.sl.toFixed(2)}</td>
                        <td className="py-2 px-2 text-[#42e39a]">${pos.tp.toFixed(2)}</td>
                        <td className="py-2 px-2 text-[#9a8f7e]">{pos.held}</td>
                        <td className="py-2 px-2 font-bold text-sm">
                          <span className={isProfit ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>
                            {isProfit ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            onClick={() => onClosePosition(pos.ticket)}
                            id={`btn-table-close-pos-${pos.ticket}`}
                            className="px-2.5 py-1 rounded bg-[#282a2e] hover:bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:border-[#ffb4ab] text-[10px] font-bold transition-all"
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
            <table className="w-full text-left text-xs font-mono select-none">
              <thead>
                <tr className="text-[#9a8f7e] border-b border-[#232830] pb-2 text-[11px]">
                  <th className="py-2 px-2">Ticket #</th>
                  <th className="py-2 px-2">Symbol</th>
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Lots</th>
                  <th className="py-2 px-2">Entry Price</th>
                  <th className="py-2 px-2">Exit Price</th>
                  <th className="py-2 px-2">Return</th>
                  <th className="py-2 px-2">Realized PnL</th>
                  <th className="py-2 px-2 text-right">Closed Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232830]/50">
                {history.map((h) => {
                  const isProfit = h.realizedPnl >= 0;
                  return (
                    <tr key={h.ticket} className="hover:bg-[#1a1c20] transition-colors">
                      <td className="py-2 px-2 text-[#9a8f7e]">#{h.ticket}</td>
                      <td className="py-2 px-2 font-bold text-[#e2e2e8]">{h.symbol}</td>
                      <td className="py-2 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          h.side === 'BUY' 
                            ? 'bg-[#42e39a]/10 text-[#42e39a] border border-[#42e39a]/30' 
                            : 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30'
                        }`}>
                          {h.side}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[#e2e2e8]">{h.lot.toFixed(2)}</td>
                      <td className="py-2 px-2 text-[#d1c5b2]">${h.entry.toFixed(2)}</td>
                      <td className="py-2 px-2 text-[#d1c5b2]">${h.exit.toFixed(2)}</td>
                      <td className="py-2 px-2 font-bold">
                        <span className={isProfit ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>
                          {h.returnPct}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-bold">
                        <span className={isProfit ? 'text-[#42e39a]' : 'text-[#ffb4ab]'}>
                          {isProfit ? `+$${h.realizedPnl.toFixed(2)}` : `-$${Math.abs(h.realizedPnl).toFixed(2)}`}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-[#9a8f7e]">{h.closedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
