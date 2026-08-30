import React, { useState } from 'react';
import { 
  Newspaper, 
  Search, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  Filter,
  ExternalLink
} from 'lucide-react';
import { NewsItem } from '../types';

interface NewsViewProps {
  news: NewsItem[];
  onAddNewsItem?: (item: Omit<NewsItem, 'id'>) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({ news }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0C10] p-4 select-none space-y-4">
      
      {/* Top Header: Macro Sentiment Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Sentiment Gauge */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#9a8f7e] uppercase tracking-wider font-bold">
              GOLD MACRO SENTIMENT
            </span>
            <span className="text-xs font-mono text-[#42e39a] font-bold">BULLISH BIAS</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#42e39a] font-bold">68% Bullish</span>
              <span className="text-[#9a8f7e]">22% Neutral</span>
              <span className="text-[#ffb4ab] font-bold">10% Bearish</span>
            </div>

            {/* Tri-color progress bar */}
            <div className="h-2.5 w-full bg-[#0c0e12] rounded-full overflow-hidden flex border border-[#232830]">
              <div className="h-full bg-[#42e39a]" style={{ width: '68%' }}></div>
              <div className="h-full bg-[#eac169]" style={{ width: '22%' }}></div>
              <div className="h-full bg-[#ffb4ab]" style={{ width: '10%' }}></div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#9a8f7e] pt-2 border-t border-[#232830] mt-2">
            PBOC physical reserve accumulation providing baseline support
          </div>
        </div>

        {/* Global Central Banks Status */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#9a8f7e] uppercase tracking-wider font-bold">
              CENTRAL BANK CATALYSTS
            </span>
            <Globe className="w-4 h-4 text-[#eac169]" />
          </div>

          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between text-[#e2e2e8]">
              <span>Federal Reserve:</span>
              <span className="text-[#eac169] font-bold">Hold (5.25% - 5.50%)</span>
            </div>
            <div className="flex justify-between text-[#e2e2e8]">
              <span>PBOC Gold Reserves:</span>
              <span className="text-[#42e39a] font-bold">+18 Straight Months</span>
            </div>
            <div className="flex justify-between text-[#e2e2e8]">
              <span>ECB Rate Path:</span>
              <span className="text-[#ffdf9e] font-bold">Gradual Easing Expected</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#42e39a] pt-2 border-t border-[#232830] mt-2 flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5" />
            <span>High volatility expected around FOMC minutes</span>
          </div>
        </div>

        {/* Real Yields & DXY */}
        <div className="bg-[#12151b] border border-[#232830] rounded-2xl p-4 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#9a8f7e] uppercase tracking-wider font-bold">
              CORRELATION GAUGES
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1c20] text-[#9a8f7e] font-mono">LIVE</span>
          </div>

          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between text-[#e2e2e8]">
              <span>DXY Index:</span>
              <span className="text-[#ffb4ab] font-bold">104.35 (-0.22%)</span>
            </div>
            <div className="flex justify-between text-[#e2e2e8]">
              <span>US 10-Yr Real Yield:</span>
              <span className="text-[#eac169] font-bold">2.14% (-3.4 bps)</span>
            </div>
            <div className="flex justify-between text-[#e2e2e8]">
              <span>Gold / Silver Ratio:</span>
              <span className="text-[#42e39a] font-bold">84.20 (Bullish Expansion)</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#9a8f7e] pt-2 border-t border-[#232830] mt-2">
            Negative correlation with DXY providing upside momentum
          </div>
        </div>
      </div>

      {/* Main News List Panel */}
      <div className="flex-1 bg-[#12151b] border border-[#232830] rounded-2xl flex flex-col overflow-hidden shadow-inner">
        
        {/* News Filters Toolbar */}
        <div className="h-12 bg-[#0c0e12] border-b border-[#232830] px-4 flex items-center justify-between shrink-0 overflow-x-auto">
          {/* Categories */}
          <div className="flex items-center space-x-1.5 text-xs font-mono">
            {(['ALL', 'GOLD', 'FED', 'PBOC', 'FOREX', 'ECON'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                id={`btn-news-filter-${cat}`}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1e2024] text-[#eac169] border border-[#eac169]/40 font-bold shadow-sm'
                    : 'text-[#9a8f7e] hover:text-[#e2e2e8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8f7e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter headlines..."
              id="input-news-search"
              className="w-full bg-[#12151b] border border-[#232830] rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-[#e2e2e8] placeholder-[#4e4638] focus:border-[#eac169] focus:outline-none"
            />
          </div>
        </div>

        {/* News Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNews.map((item) => (
            <div 
              key={item.id}
              className="bg-[#0c0e12] border border-[#232830] rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#eac169]/40 transition-all group"
            >
              <div className="flex items-start space-x-3">
                <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-[#eac169]/10 text-[#eac169] border border-[#eac169]/30 shrink-0">
                  {item.source}
                </span>

                <div>
                  <h4 className="text-xs sm:text-sm font-mono font-semibold text-[#e2e2e8] leading-snug group-hover:text-[#ffdf9e] transition-colors">
                    {item.headline}
                  </h4>
                  <div className="flex items-center space-x-3 text-[11px] font-mono text-[#9a8f7e] mt-1">
                    <span>Category: <strong>{item.category}</strong></span>
                    <span>•</span>
                    <span>Received: <strong>{item.time} UTC</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  item.impact === 'HIGH' ? 'bg-[#93000a] text-white shadow-glow-error' :
                  item.impact === 'MED' ? 'bg-[#eac169]/20 text-[#eac169]' : 'bg-[#1a1c20] text-[#9a8f7e]'
                }`}>
                  {item.impact} IMPACT
                </span>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  item.sentiment === 'bullish' ? 'bg-[#42e39a]/10 text-[#42e39a]' :
                  item.sentiment === 'bearish' ? 'bg-[#ffb4ab]/10 text-[#ffb4ab]' : 'bg-[#1a1c20] text-[#9a8f7e]'
                }`}>
                  {item.sentiment.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
