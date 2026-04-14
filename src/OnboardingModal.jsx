import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { parseMaidenName } from './genealogyLogic';

const DATE_QUICK_PICKS = [
  { value: 'MDY', label: 'MM/DD/YYYY', example: 'Jan 15, 1990' },
  { value: 'DMY', label: 'DD/MM/YYYY', example: '15 Jan 1990' },
  { value: 'YMD', label: 'YYYY/MM/DD', example: '1990-01-15' },
];

export default function OnboardingModal({ onComplete, onSkip, onLoadDemo }) {
  const [step, setStep] = useState(1);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parent1: '',
    parent2: '',
    dateFormat: 'MDY',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && formData.name.trim()) {
      setStep(2);
      setConfirmEmpty(false);
    } else if (step === 2) {
      if (!formData.parent1.trim() && !formData.parent2.trim() && !confirmEmpty) {
        setConfirmEmpty(true);
        return;
      }
      const parsedSelf = parseMaidenName(formData.name);
      const parsedP1 = parseMaidenName(formData.parent1);
      const parsedP2 = parseMaidenName(formData.parent2);
      
      onComplete({
        ...formData,
        name: parsedSelf.name,
        maidenName: parsedSelf.maidenName,
        parent1: parsedP1.name,
        parent1Maiden: parsedP1.maidenName,
        parent2: parsedP2.name,
        parent2Maiden: parsedP2.maidenName,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(170,59,255,0.1)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500 delay-150">
        
        {/* Header */}
        <div className="bg-zinc-950/50 p-6 border-b border-zinc-800 text-center relative">
           <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-400 text-transparent bg-clip-text">
             Welcome to Open Family Tree
           </h2>
           <p className="text-zinc-400 mt-2 text-sm">Let's build your family tree together.</p>
           
           <button 
             onClick={onSkip}
             className="absolute top-4 right-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
           >
             Skip
           </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">To get started, what is your full name?</label>
                <input 
                  autoFocus
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-lg"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              {/* Date format quick-pick */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">How do you prefer dates?</label>
                <div className="grid grid-cols-3 gap-2">
                  {DATE_QUICK_PICKS.map(dp => (
                    <button
                      key={dp.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, dateFormat: dp.value }))}
                      className={`py-2.5 px-2 rounded-lg text-center transition-all text-xs font-medium ${
                        formData.dateFormat === dp.value
                          ? 'bg-purple-600/25 border border-purple-500/50 text-purple-300 ring-1 ring-purple-500/30'
                          : 'bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      <span className="block text-[11px] font-bold">{dp.label}</span>
                      <span className="block text-[10px] text-zinc-500 mt-0.5">{dp.example}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-600">You can change this later in Settings.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="space-y-4">
                <p className="text-sm font-medium text-zinc-300">Great to meet you, <span className="text-white font-bold">{formData.name}</span>! Would you like to add your parents?</p>
                <div className="space-y-3">
                  <input 
                    autoFocus
                    type="text" 
                    name="parent1" 
                    value={formData.parent1} 
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('parent2-input')?.focus();
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="Parent 1 Name (Optional)"
                  />
                  <input 
                    id="parent2-input"
                    type="text" 
                    name="parent2" 
                    value={formData.parent2} 
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="Parent 2 Name (Optional)"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
           <button 
             onClick={onLoadDemo} 
             className="text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md flex items-center gap-2 transition-all shadow-sm"
             title="Load Game of Thrones Example"
           >
              🐺 Load Demo Tree
           </button>
           <button 
             onClick={handleNext}
             disabled={step === 1 && !formData.name.trim()}
             className={`px-6 py-2.5 text-white rounded-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
               confirmEmpty 
                 ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_4px_14px_0_rgba(217,119,6,0.39)] hover:shadow-[0_6px_20px_rgba(217,119,6,0.23)]' 
                 : 'bg-purple-600 hover:bg-purple-500 shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.23)]'
             }`}
           >
             {step === 1 ? (
               <>Next <ChevronRight size={18} /></>
             ) : (
               confirmEmpty ? 'Skip Parents & Finish' : <>Finish <Check size={18} /></>
             )}
           </button>
        </div>

      </div>
    </div>
  );
}
