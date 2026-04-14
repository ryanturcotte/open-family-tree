import { AlertTriangle, Download, X, RefreshCw } from 'lucide-react';

export default function RestartModal({ onSaveBackup, onDiscard, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="text-rose-500" size={24} />
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Active Tree Detected</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
          You currently have people mapped on the canvas. Restarting the tutorial will clear your screen. Do you want to save a quick backup preset before wiping your data?
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onSaveBackup}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/25 transition-all flex justify-center items-center gap-2"
          >
            <Download size={18} />
            Save Backup & Restart
          </button>
          
          <button 
            onClick={onDiscard}
            className="w-full py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium transition-all flex justify-center items-center gap-2"
          >
            <RefreshCw size={18} />
            Discard Data & Restart
          </button>
        </div>
      </div>
    </div>
  );
}
