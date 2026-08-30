import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { AssetQuote } from '../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: AssetQuote;
  assets: Record<string, AssetQuote>;
  onSelectSymbol: (symbol: string) => void;
  onExecuteOrder: (symbol: string, side: 'BUY' | 'SELL', lot: number, sl?: number, tp?: number) => void;
  dryRun: boolean;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  quote,
  assets,
  onSelectSymbol,
  onExecuteOrder,
  dryRun
}) => {
  if (!isOpen) return null;

  const [selectedSide, setSelectedSide] = useState<'BUY' | 'SELL'>('BUY');
  const [lot, setLot] = useState<number>(1.00);
  const [sl, setSl] = useState<string>(quote.pivots.s1.toFixed(2));
  const [tp, setTp] = useState<string>(quote.pivots.r1.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onExecuteOrder(quote.symbol, selectedSide, lot, parseFloat(sl) || undefined, parseFloat(tp) || undefined);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const marginRequired = (quote.price * lot * 100) / 500; // 1:500 leverage approx

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#12151b] border border-[#eac169]/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-glow-primary animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="h-12 bg-[#0c0e12] border-b border-[#232830] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#eac169]" />
            <span className="font-extrabold font-mono text-sm text-[#e2e2e8] uppercase">
              CREATE NEW ORDER [{dryRun ? 'DRY RUN' : 'LIVE PROD'}]
            </span>
          </div>
          <button
            onClick={onClose}
            id="btn-close-new-order-modal"
            className="p-1 rounded-lg text-[#9a8f7e] hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 font-mono text-xs">
          
          {/* Symbol Selector */}
          <div className="space-y-1">
            <label className="text-[#9a8f7e]">TRADING ASSET</label>
            <select
              value={quote.symbol}
              onChange={(e) => onSelectSymbol(e.target.value)}
              id="modal-select-symbol"
              className="w-full bg-[#0c0e12] border border-[#232830] rounded-xl px-3 py-2 text-sm font-bold text-[#eac169] focus:border-[#eac169] focus:outline-none"
            >
              {(Object.values(assets) as AssetQuote[]).map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} - {a.name} (${a.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Order Side Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSelectedSide('BUY')}
              id="modal-btn-select-buy"
              className={`py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
                selectedSide === 'BUY'
                  ? 'bg-[#42e39a] text-[#0c0e12] shadow-glow-secondary'
                  : 'bg-[#0c0e12] border border-[#232830] text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>BUY (LONG)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSide('SELL')}
              id="modal-btn-select-sell"
              className={`py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
                selectedSide === 'SELL'
                  ? 'bg-[#93000a] text-white shadow-glow-error'
                  : 'bg-[#0c0e12] border border-[#232830] text-[#9a8f7e] hover:text-[#e2e2e8]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>SELL (SHORT)</span>
            </button>
          </div>

          {/* Lot Size with Slider */}
          <div className="space-y-2 bg-[#0c0e12] p-3 rounded-xl border border-[#232830]">
            <div className="flex items-center justify-between">
              <span className="text-[#9a8f7e]">VOLUME (LOTS):</span>
              <span className="text-sm font-bold text-[#eac169]">{lot.toFixed(2)} Lots</span>
            </div>

            <input
              type="range"
              min="0.01"
              max="5.00"
              step="0.01"
              value={lot}
              onChange={(e) => setLot(parseFloat(e.target.value))}
              id="modal-slider-lot"
              className="w-full accent-[#eac169]"
            />

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[0.10, 0.50, 1.00, 2.00].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setLot(preset)}
                  className={`py-1 rounded text-[10px] border transition-all ${
                    lot === preset ? 'bg-[#1e2024] text-[#eac169] border-[#eac169]' : 'bg-[#12151b] text-[#9a8f7e] border-[#232830]'
                  }`}
                >
                  {preset.toFixed(2)} Lots
                </button>
              ))}
            </div>
          </div>

          {/* SL & TP fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#ffb4ab] block mb-1">STOP LOSS PRICE</label>
              <input
                type="text"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                id="modal-input-sl"
                className="w-full bg-[#0c0e12] border border-[#ffb4ab]/40 rounded-lg px-3 py-1.5 text-sm text-[#e2e2e8] focus:border-[#ffb4ab] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[#42e39a] block mb-1">TAKE PROFIT PRICE</label>
              <input
                type="text"
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                id="modal-input-tp"
                className="w-full bg-[#0c0e12] border border-[#42e39a]/40 rounded-lg px-3 py-1.5 text-sm text-[#e2e2e8] focus:border-[#42e39a] focus:outline-none"
              />
            </div>
          </div>

          {/* Margin & Leverage breakdown */}
          <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex justify-between text-[11px] text-[#9a8f7e]">
            <span>Est. Margin Required: <strong className="text-[#e2e2e8]">${marginRequired.toFixed(2)}</strong></span>
            <span>Leverage: <strong className="text-[#42e39a]">1:500 (STP)</strong></span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            id="modal-btn-execute-order"
            className="w-full py-3 bg-gradient-to-r from-[#eac169] to-[#c9a34e] hover:from-[#c9a34e] hover:to-[#b08b3a] text-[#3f2e00] font-extrabold text-sm rounded-xl transition-all shadow-glow-primary active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIRM & TRANSMIT ORDER</span>
          </button>
        </form>
      </div>
    </div>
  );
};
