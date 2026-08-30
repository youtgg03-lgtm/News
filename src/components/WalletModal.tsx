import React, { useState } from 'react';
import { X, Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  floatingPnl: number;
  onDeposit: (amount: number) => void;
  onResetBalance: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  balance,
  floatingPnl,
  onDeposit,
  onResetBalance
}) => {
  if (!isOpen) return null;

  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const equity = balance + floatingPnl;
  const usedMargin = 1250.00;
  const freeMargin = Math.max(0, equity - usedMargin);
  const marginLevel = usedMargin > 0 ? ((equity / usedMargin) * 100).toFixed(0) : '0';

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      onDeposit(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#12151b] border border-[#232830] rounded-2xl w-full max-w-md overflow-hidden shadow-glow-primary animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="h-12 bg-[#0c0e12] border-b border-[#232830] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-[#eac169]" />
            <span className="font-extrabold font-mono text-sm text-[#e2e2e8]">
              ACCOUNT MARGIN & WALLET
            </span>
          </div>
          <button
            onClick={onClose}
            id="btn-close-wallet-modal"
            className="p-1 rounded-lg text-[#9a8f7e] hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 font-mono text-xs">
          {/* Equity Big Display */}
          <div className="bg-[#0c0e12] border border-[#232830] p-4 rounded-xl text-center">
            <span className="text-[#9a8f7e] text-[11px] uppercase tracking-wider">Net Account Equity</span>
            <div className="text-2xl font-black text-[#e2e2e8] mt-1">
              ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] mt-1">
              Floating PnL: <span className={floatingPnl >= 0 ? 'text-[#42e39a] font-bold' : 'text-[#ffb4ab] font-bold'}>
                {floatingPnl >= 0 ? `+$${floatingPnl.toFixed(2)}` : `-$${Math.abs(floatingPnl).toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#0c0e12] p-3 rounded-xl border border-[#232830]">
              <span className="text-[#9a8f7e]">Cash Balance</span>
              <div className="text-sm font-bold text-[#e2e2e8] mt-0.5">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-[#0c0e12] p-3 rounded-xl border border-[#232830]">
              <span className="text-[#9a8f7e]">Free Margin</span>
              <div className="text-sm font-bold text-[#42e39a] mt-0.5">${freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-[#0c0e12] p-3 rounded-xl border border-[#232830]">
              <span className="text-[#9a8f7e]">Used Margin</span>
              <div className="text-sm font-bold text-[#ffdf9e] mt-0.5">${usedMargin.toFixed(2)}</div>
            </div>
            <div className="bg-[#0c0e12] p-3 rounded-xl border border-[#232830]">
              <span className="text-[#9a8f7e]">Margin Level</span>
              <div className="text-sm font-bold text-[#42e39a] mt-0.5">{marginLevel}%</div>
            </div>
          </div>

          {/* Quick Simulation Deposit */}
          <form onSubmit={handleDepositSubmit} className="space-y-2 pt-2 border-t border-[#232830]">
            <span className="text-[#9a8f7e] block">DEPOSIT SIMULATED CAPITAL:</span>
            <div className="flex space-x-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                id="input-deposit-amount"
                className="flex-1 bg-[#0c0e12] border border-[#232830] rounded-xl px-3 py-2 text-[#e2e2e8] focus:border-[#eac169] focus:outline-none"
              />
              <button
                type="submit"
                id="btn-confirm-deposit"
                className="px-3 py-2 rounded-xl bg-[#eac169] hover:bg-[#c9a34e] text-[#3f2e00] font-bold shadow-glow-primary active:scale-95 transition-all"
              >
                Deposit
              </button>
            </div>
          </form>

          {/* Reset Button */}
          <div className="pt-2 flex justify-between items-center text-[11px]">
            <span className="text-[#9a8f7e]">Broker: OANDA Institutional</span>
            <button
              type="button"
              onClick={onResetBalance}
              id="btn-reset-balance"
              className="text-[#ffb4ab] hover:underline flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to $100k</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
