import React from 'react';
import { AssetQuote } from '../types';

interface TickerBarProps {
  assets: Record<string, AssetQuote>;
  dryRun: boolean;
}

export const TickerBar: React.FC<TickerBarProps> = ({ assets, dryRun }) => {
  const tickerItems = Object.values(assets) as AssetQuote[];
  // Duplicate for seamless infinite loop
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="h-7 bg-[#0c0e12] border-t border-[#232830] flex items-center overflow-hidden z-20 text-[11px] font-mono select-none">
      {/* Left persistent badge */}
      <div className="bg-[#171b22] h-full px-3 flex items-center space-x-2 border-r border-[#232830] shrink-0 z-10 text-[#eac169] font-bold">
        <span className="w-2 h-2 rounded-full bg-[#42e39a] animate-pulse"></span>
        <span className="hidden sm:inline">LIVE WIRE</span>
      </div>

      {/* Marquee Ticker Stream */}
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-ticker flex space-x-6 py-1">
          {displayItems.map((item, idx) => {
            const isPos = item.change >= 0;
            return (
              <div key={`${item.symbol}-${idx}`} className="flex items-center space-x-1.5 shrink-0">
                <span className="text-[#9a8f7e] font-semibold">{item.symbol}:</span>
                <span className="text-[#e2e2e8] font-bold">${item.price.toFixed(item.price < 10 ? 4 : 2)}</span>
                <span className={`text-[10px] font-bold px-1 rounded ${isPos ? 'text-[#42e39a] bg-[#42e39a]/10' : 'text-[#ffb4ab] bg-[#ffb4ab]/10'}`}>
                  {isPos ? `+${item.changePct}%` : `${item.changePct}%`}
                </span>
                <span className="text-[#333539] pl-2">•</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Terminal Health Status */}
      <div className="hidden md:flex bg-[#12151b] h-full px-3 items-center space-x-3 border-l border-[#232830] shrink-0 text-[10px] text-[#9a8f7e]">
        <div>
          <span>EXEC: </span>
          <span className="text-[#eac169] font-semibold">{dryRun ? 'DRY-RUN' : 'LIVE'}</span>
        </div>
        <div>
          <span>PING: </span>
          <span className="text-[#42e39a] font-semibold">14ms</span>
        </div>
        <div>
          <span>CONN: </span>
          <span className="text-[#42e39a] font-semibold">OANDA-STP</span>
        </div>
      </div>
    </div>
  );
};
