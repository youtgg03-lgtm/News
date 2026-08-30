import React from 'react';
import { X, Terminal, Trash2, Download } from 'lucide-react';
import { TerminalLog } from '../types';

interface LogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: TerminalLog[];
  onClearLogs: () => void;
}

export const LogsDrawer: React.FC<LogsDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-[#0c0e12] border-t-2 border-[#eac169]/50 shadow-2xl h-80 flex flex-col font-mono text-xs select-none animate-in slide-in-from-bottom duration-200">
      
      {/* Header */}
      <div className="h-10 bg-[#12151b] border-b border-[#232830] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#42e39a]" />
          <span className="font-bold text-[#e2e2e8]">SYSTEM DIAGNOSTIC & EVENT LOGS</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2024] text-[#9a8f7e]">
            {logs.length} Entries
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onClearLogs}
            id="btn-clear-terminal-logs"
            className="p-1 rounded text-[#9a8f7e] hover:text-[#ffb4ab] hover:bg-[#1e2024] transition-all"
            title="Clear buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            id="btn-close-logs-drawer"
            className="p-1 rounded text-[#9a8f7e] hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-all"
            title="Close [Esc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log list */}
      <div className="flex-1 p-3 overflow-y-auto bg-[#07080b] space-y-1.5 font-mono text-xs">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-2.5">
            <span className="text-[#9a8f7e]/50 text-[11px] shrink-0">{log.time}</span>
            <span className={`px-1 rounded text-[10px] font-bold shrink-0 ${
              log.type === 'SIGNAL' ? 'bg-[#42e39a]/10 text-[#42e39a] border border-[#42e39a]/30' :
              log.type === 'EXEC' ? 'bg-[#eac169]/10 text-[#eac169] border border-[#eac169]/30' :
              log.type === 'WARN' ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30' :
              log.type === 'HALT' ? 'bg-[#93000a] text-white' :
              log.type === 'SYS' ? 'text-[#ffdf9e]' : 'text-[#9a8f7e]'
            }`}>
              [{log.type}]
            </span>
            <span className="text-[#d1c5b2]">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
