import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('oft-cookie-consent');
    if (!consent) {
      // Delay mounting slightly for animation effect
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('oft-cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-full max-w-2xl bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-6 z-50 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-10 duration-500 fade-in">
      <div className="p-3 bg-purple-500/10 rounded-full shrink-0">
        <ShieldCheck className="text-purple-400" size={28} />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-zinc-100 font-bold mb-1">Privacy & Tracking</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          This site uses Google Analytics to track page views.
          <span className="text-zinc-200 block mt-1 font-medium">Your family tree data is stored locally within your browser and is NEVER transmitted, collected, or uploaded to any database.</span>
        </p>
      </div>
      <div className="flex gap-3 shrink-0 mt-2 md:mt-0 w-full md:w-auto">
        <button
          onClick={handleAccept}
          className="flex-1 md:flex-none px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Got it
        </button>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
