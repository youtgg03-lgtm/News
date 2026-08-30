import { Timeframe, TimeframeOption } from '../types';

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { id: '1s', label: '1s', category: 'seconds', seconds: 1, description: '1 Second (Ultra High Frequency)' },
  { id: '5s', label: '5s', category: 'seconds', seconds: 5, description: '5 Seconds (Micro Scalping)' },
  { id: '15s', label: '15s', category: 'seconds', seconds: 15, description: '15 Seconds (Fast Scalping)' },
  { id: '30s', label: '30s', category: 'seconds', seconds: 30, description: '30 Seconds (Fast Momentum)' },
  { id: '1m', label: '1m', category: 'minutes', seconds: 60, description: '1 Minute (Standard Scalping)' },
  { id: '3m', label: '3m', category: 'minutes', seconds: 180, description: '3 Minutes (Short Intraday)' },
  { id: '5m', label: '5m', category: 'minutes', seconds: 300, description: '5 Minutes (Session Structure)' },
  { id: '15m', label: '15m', category: 'minutes', seconds: 900, description: '15 Minutes (Key Session Levels)' },
  { id: '30m', label: '30m', category: 'minutes', seconds: 1800, description: '30 Minutes (Intraday Trend)' },
  { id: '1H', label: '1H', category: 'hours', seconds: 3600, description: '1 Hour (Intermediate Trend)' },
  { id: '4H', label: '4H', category: 'hours', seconds: 14400, description: '4 Hours (Swing Trend)' },
  { id: '1D', label: '1D', category: 'days', seconds: 86400, description: '1 Day (Daily Market Structure)' },
  { id: '1W', label: '1W', category: 'days', seconds: 604800, description: '1 Week (Macro Long Term)' },
];

export const POPULAR_TIMEFRAMES: Timeframe[] = ['1s', '5s', '15s', '1m', '5m', '15m', '1H', '4H', '1D'];

export function getTimeframeSeconds(tf: Timeframe): number {
  const found = TIMEFRAME_OPTIONS.find(t => t.id === tf);
  return found ? found.seconds : 60;
}

export function formatRemainingTime(seconds: number): string {
  if (seconds < 60) {
    return `00:${String(seconds).padStart(2, '0')}`;
  }
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  if (mins < 60) {
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${String(hours).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
}
