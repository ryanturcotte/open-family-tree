import { Handle, Position } from '@xyflow/react';
import { Calendar, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { useDisplaySettings } from './DisplaySettingsContext';
import { formatDate } from './dateUtils';

const themeMap = {
  purple: "border-purple-500 bg-purple-500/10 shadow-[0_4px_30px_rgba(168,85,247,0.4)]",
  blue: "border-blue-500 bg-blue-500/10 shadow-[0_4px_30px_rgba(59,130,246,0.4)]",
  emerald: "border-emerald-500 bg-emerald-500/10 shadow-[0_4px_30px_rgba(16,185,129,0.4)]",
  rose: "border-rose-500 bg-rose-500/10 shadow-[0_4px_30px_rgba(244,63,94,0.4)]",
  amber: "border-amber-500 bg-amber-500/10 shadow-[0_4px_30px_rgba(245,158,11,0.4)]",
  zinc: "border-zinc-400 dark:border-zinc-600 bg-zinc-400/10 dark:bg-zinc-600/10 shadow-[0_4px_30px_rgba(161,161,170,0.4)]",
};

const getEmoji = (sex, tone) => {
  const tones = {
    'light': '🏻',
    'medium-light': '🏼',
    'medium': '🏽',
    'medium-dark': '🏾',
    'dark': '🏿',
    'none': ''
  };
  const t = tones[tone] || '';
  
  if (sex === 'woman') return `👩${t}`;
  if (sex === 'man') return `👨${t}`;
  if (sex === 'non-binary') return `🧑${t}`;
  return '👤';
};

export default function PersonNode({ data, selected }) {
  const { dateFormat, showDatesOnNode, showBirthLocationOnNode, showDeathLocationOnNode } = useDisplaySettings();

  const getDisplayName = (data) => {
    if (!data.name) return 'Unknown';
    if (!data.maidenName) return data.name;
    const parts = data.name.trim().split(' ');
    if (parts.length > 1) {
      const last = parts.pop();
      return `${parts.join(' ')} (${data.maidenName}) ${last}`;
    }
    return `${data.name} (${data.maidenName})`;
  };

  const activeTheme = data.colorTheme || 'purple';
  const baseThemeClass = themeMap[activeTheme] || themeMap.zinc;

  const dob = formatDate(data.dob, dateFormat);
  const dod = formatDate(data.dod, dateFormat);
  const hasDates = data.dob || data.dod;
  const hasBirthLoc = showBirthLocationOnNode && data.birthLocation;
  const hasDeathLoc = showDeathLocationOnNode && data.deathLocation;

  return (
    <div 
      style={{ width: data.layoutWidth ? `${data.layoutWidth}px` : '240px' }}
      className={clsx(
      "rounded-xl overflow-hidden border-2 transition-all",
      baseThemeClass,
      selected ? "ring-2 ring-white dark:ring-zinc-300 scale-105 shadow-2xl z-10" : "hover:scale-105"
    )}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-purple-500 border-none -mt-1.5" 
      />

      <div className="p-5 flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-3 text-zinc-400 shadow-inner overflow-hidden text-[32px] leading-none select-none">
           {data.avatar ? (
             <img src={data.avatar} alt="Avatar" className="w-full h-full object-cover" />
           ) : (
             getEmoji(data.sex, data.skinTone)
           )}
        </div>
        
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg text-center leading-tight mb-2 truncate w-full">
          {getDisplayName(data)}
        </h3>
        
        <div className="w-full space-y-1">
          {showDatesOnNode && (
            hasDates ? (
              <div className="flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs bg-zinc-100 dark:bg-zinc-950/50 py-1.5 px-2 rounded-md border border-zinc-200 dark:border-zinc-800/50">
                <Calendar size={12} className="shrink-0" />
                <span className="truncate">{dob || '?'} – {dod || '?'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 dark:text-zinc-600 text-xs bg-zinc-100 dark:bg-zinc-950/50 py-1.5 px-2 rounded-md border border-zinc-200 dark:border-zinc-800/50 italic">
                No dates
              </div>
            )
          )}

          {hasBirthLoc && (
            <div className="flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px] bg-zinc-100 dark:bg-zinc-950/50 py-1 px-2 rounded-md border border-zinc-200 dark:border-zinc-800/50">
              <MapPin size={10} className="shrink-0 text-emerald-500" />
              <span className="truncate">b. {data.birthLocation}</span>
            </div>
          )}

          {hasDeathLoc && (
            <div className="flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px] bg-zinc-100 dark:bg-zinc-950/50 py-1 px-2 rounded-md border border-zinc-200 dark:border-zinc-800/50">
              <MapPin size={10} className="shrink-0 text-zinc-400" />
              <span className="truncate">d. {data.deathLocation}</span>
            </div>
          )}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-purple-500 border-none -mb-1.5" 
      />
    </div>
  );
}
