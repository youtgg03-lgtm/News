import React from 'react';
import { X, User, Key, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#12151b] border border-[#232830] rounded-2xl w-full max-w-md overflow-hidden shadow-glow-primary animate-in fade-in zoom-in duration-150 font-mono text-xs">
        
        {/* Header */}
        <div className="h-12 bg-[#0c0e12] border-b border-[#232830] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[#eac169]" />
            <span className="font-extrabold text-sm text-[#e2e2e8]">
              TRADER PROFILE & API KEYS
            </span>
          </div>
          <button
            onClick={onClose}
            id="btn-close-profile-modal"
            className="p-1 rounded-lg text-[#9a8f7e] hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          
          {/* Avatar & Account Info */}
          <div className="flex items-center space-x-3 bg-[#0c0e12] p-3 rounded-xl border border-[#232830]">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#eac169] shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYWr7uAXNw_IPJSAcNh5jYrx2b5DoV7sCbMVoKBG3gcKIHOHpQ7qA-JvSo7DYTNRySFiQZSvkuPLSoWDLxdrqLVA3Xi5p2Z1QyV1k_AV1htanf8puORTcmYlpwamk82tFXZ6oaMQpAI_QYZqEaTTfQzBx8RyYfB3CkXr4LxK-lS6qa8IUzIMBVyQb-kmKBJnK2oW9ZwOeJQXP5saIYSVCiAg9V5zcvZsYWNorkTFBCaR1c6D1d1m6yIA" 
                alt="Trader Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#e2e2e8]">Gold_Sniper_PRO</div>
              <div className="text-[11px] text-[#eac169] flex items-center space-x-1">
                <Award className="w-3.5 h-3.5" />
                <span>VIP INSTITUTIONAL TIER</span>
              </div>
              <div className="text-[10px] text-[#9a8f7e] mt-0.5">Account #8849-0129-XAU</div>
            </div>
          </div>

          {/* Connected Gateway Credentials */}
          <div className="space-y-2">
            <span className="text-[#9a8f7e] uppercase text-[10px]">Connected Broker & Gateway</span>
            <div className="space-y-1.5">
              <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex items-center justify-between">
                <div>
                  <div className="text-[#e2e2e8] font-bold">OANDA STP REST/V20</div>
                  <div className="text-[10px] text-[#42e39a]">Status: AUTHORIZED (ACTIVE)</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#42e39a]" />
              </div>

              <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-[#232830] flex items-center justify-between">
                <div>
                  <div className="text-[#e2e2e8] font-bold">AI Model Intelligence</div>
                  <div className="text-[10px] text-[#eac169]">Engine: Server-Side Gemini AI</div>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#eac169]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
