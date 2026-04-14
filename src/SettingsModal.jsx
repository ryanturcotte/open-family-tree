import { X, Settings } from 'lucide-react';

const DATE_FORMATS = [
  { value: 'raw',  label: 'As Entered',       example: 'No formatting' },
  { value: 'MDY',  label: 'Month Day, Year',   example: 'Jan 15, 1990' },
  { value: 'DMY',  label: 'Day Month Year',    example: '15 Jan 1990' },
  { value: 'YMD',  label: 'Year-Month-Day',    example: '1990-01-15' },
];

export default function SettingsModal({ settings, onUpdate, onClose }) {
  const set = (key, value) => onUpdate({ ...settings, [key]: value });
  const toggle = (key) => set(key, !settings[key]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.12)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Settings size={18} className="text-purple-500" /> Settings
          </h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Date Format */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Date Format</label>
            <div className="space-y-1">
              {DATE_FORMATS.map(f => (
                <button
                  key={f.value}
                  onClick={() => set('dateFormat', f.value)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center transition-colors ${
                    settings.dateFormat === f.value
                      ? 'bg-purple-600/20 border border-purple-500/50 text-purple-700 dark:text-purple-300'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="text-xs text-zinc-400">{f.example}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Node display info */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Info Shown on Tree Nodes</label>
            <div className="space-y-2">
              {[
                { key: 'showDatesOnNode',         label: 'Birth / Death dates' },
                { key: 'showBirthLocationOnNode',  label: 'Birth location' },
                { key: 'showDeathLocationOnNode',  label: 'Death location' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={() => toggle(key)}
                    className="accent-purple-500 w-4 h-4"
                  />
                  {label}
                </label>
              ))}
              <div className="h-px bg-zinc-200 dark:bg-zinc-800/60 my-3" />
              <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!settings.fixedCardSize}
                  onChange={() => toggle('fixedCardSize')}
                  className="accent-purple-500 w-4 h-4"
                />
                Fixed Card Sizing (240px Default)
              </label>
            </div>
          </div>

          {/* Panel mode */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Details Panel Style</label>
            <div className="flex gap-2">
              {[
                { value: 'docked',   label: '⬅ Docked' },
                { value: 'floating', label: '◻ Floating' },
              ].map(mode => (
                <button
                  key={mode.value}
                  onClick={() => set('panelMode', mode.value)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    settings.panelMode === mode.value
                      ? 'bg-purple-600/20 border border-purple-500/50 text-purple-700 dark:text-purple-300'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
