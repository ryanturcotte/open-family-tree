import { X, UserPlus, UserMinus, Upload, Heart, Plus, Trash2, Link, Search, ChevronDown, Maximize2, PanelRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { parseMaidenName } from './genealogyLogic';

// Inline search component for linking existing people
function LinkPersonSearch({ allNodes, excludeIds, onSelect, onCancel }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const eligible = allNodes.filter(n => {
    if (excludeIds.includes(n.id)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      n.data.name?.toLowerCase().includes(q) ||
      n.data.maidenName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mt-2 rounded-md border border-purple-500/30 bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name..."
        className="w-full px-3 py-2 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none border-b border-purple-500/20 placeholder:text-zinc-500"
      />
      <div className="max-h-36 overflow-y-auto">
        {eligible.length === 0 ? (
          <p className="px-3 py-2 text-xs text-zinc-500">No matching people found</p>
        ) : (
          eligible.map(n => (
            <button
              key={n.id}
              onClick={() => onSelect(n.id)}
              className="w-full text-left px-3 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
            >
              <span className="text-base leading-none">{n.data.sex === 'man' ? '👨' : n.data.sex === 'woman' ? '👩' : '🧑'}</span>
              <span>{n.data.name || 'Unnamed'}{n.data.maidenName ? ` (${n.data.maidenName})` : ''}</span>
            </button>
          ))
        )}
      </div>
      <button
        onClick={onCancel}
        className="w-full py-1 text-xs text-zinc-500 hover:text-zinc-400 transition-colors border-t border-zinc-200 dark:border-zinc-800"
      >
        Cancel
      </button>
    </div>
  );
}

const THEMES = ['purple', 'blue', 'emerald', 'amber', 'rose', 'zinc'];
const themeColors = { 
  purple: 'bg-purple-500', 
  blue: 'bg-blue-500', 
  emerald: 'bg-emerald-500', 
  amber: 'bg-amber-500', 
  rose: 'bg-rose-500', 
  zinc: 'bg-zinc-500' 
};

export default function PersonDetailsPanel({ person, allNodes = [], onClose, onUpdate, onAddParent, onAddChild, onAddSpouse, onLinkSpouse, onLinkParent, onDelete, panelMode, onTogglePanelMode }) {
  const [formData, setFormData] = useState({ 
    name: '', maidenName: '', sex: 'unknown', skinTone: 'none',
    dob: '', birthLocation: '', dod: '', deathLocation: '',
    biography: '', colorTheme: 'purple', customFields: [] 
  });
  const [linkingFor, setLinkingFor] = useState(null);
  const [showResearch, setShowResearch] = useState(false);
  const [researchFields, setResearchFields] = useState({});
  const floatingRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResearchFields({
      name:          !!person.data.name,
      maidenName:    !!person.data.maidenName,
      birthDate:     !!person.data.dob,
      birthLocation: !!person.data.birthLocation,
      deathDate:     !!person.data.dod,
      deathLocation: !!person.data.deathLocation,
    });
  }, [person.id]);  // eslint-disable-line react-hooks/exhaustive-deps

  const buildResearchQuery = () => {
    const parts = [];
    if (researchFields.name && person.data.name)          parts.push(person.data.name);
    if (researchFields.maidenName && person.data.maidenName) parts.push(person.data.maidenName);
    if (researchFields.birthDate && person.data.dob)      parts.push(person.data.dob);
    if (researchFields.birthLocation && person.data.birthLocation) parts.push(person.data.birthLocation);
    if (researchFields.deathDate && person.data.dod)      parts.push(person.data.dod);
    if (researchFields.deathLocation && person.data.deathLocation) parts.push(person.data.deathLocation);
    return parts.join(' ');
  };

  const handleGoogleSearch = () => {
    const q = buildResearchQuery();
    if (!q.trim()) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q + ' genealogy')}`, '_blank');
  };

  const handleAncestrySearch = () => {
    const params = new URLSearchParams();
    const fullName = [
      researchFields.name ? person.data.name : '',
      researchFields.maidenName ? person.data.maidenName : '',
    ].filter(Boolean).join(' ');
    if (fullName) params.set('name', fullName.replace(/ /g, '_'));
    if (researchFields.birthDate && person.data.dob) {
      const yr = person.data.dob.match(/\d{4}/);
      if (yr) params.set('birth', yr[0]);
    }
    if (researchFields.birthLocation && person.data.birthLocation)
      params.set('birthplace', person.data.birthLocation);
    if (researchFields.deathDate && person.data.dod) {
      const yr = person.data.dod.match(/\d{4}/);
      if (yr) params.set('death', yr[0]);
    }
    if (researchFields.deathLocation && person.data.deathLocation)
      params.set('deathplace', person.data.deathLocation);
    window.open(`https://www.ancestry.com/search/?${params.toString()}`, '_blank');
  };

  const handleFamilySearch = () => {
    const params = new URLSearchParams();
    const name = researchFields.name ? person.data.name : '';
    const maiden = researchFields.maidenName ? person.data.maidenName : '';
    const nameParts = (name || maiden || '').trim().split(' ');
    if (nameParts.length >= 2) {
      params.set('q.givenName', nameParts.slice(0, -1).join(' '));
      params.set('q.surname', nameParts[nameParts.length - 1]);
    } else if (nameParts[0]) {
      params.set('q.surname', nameParts[0]);
    }
    if (maiden && researchFields.maidenName) params.set('q.spouseParentsSurname', maiden);
    if (researchFields.birthDate && person.data.dob) {
      const yr = person.data.dob.match(/\d{4}/);
      if (yr) { params.set('q.birthLikeDate.from', yr[0]); params.set('q.birthLikeDate.to', yr[0]); }
    }
    if (researchFields.birthLocation && person.data.birthLocation)
      params.set('q.birthLikePlace', person.data.birthLocation);
    if (researchFields.deathDate && person.data.dod) {
      const yr = person.data.dod.match(/\d{4}/);
      if (yr) { params.set('q.deathLikeDate.from', yr[0]); params.set('q.deathLikeDate.to', yr[0]); }
    }
    if (researchFields.deathLocation && person.data.deathLocation)
      params.set('q.deathLikePlace', person.data.deathLocation);
    window.open(`https://www.familysearch.org/search/record/results?${params.toString()}`, '_blank');
  };

  const handleMyHeritageSearch = () => {
    const params = new URLSearchParams();
    params.set('formId', 'master');
    params.set('action', 'doSearch');
    const fullName = (researchFields.name ? person.data.name : '') ||
                     (researchFields.maidenName ? person.data.maidenName : '');
    if (fullName) {
      const parts = fullName.trim().split(' ');
      params.set('firstname', parts.slice(0, -1).join(' ') || parts[0]);
      if (parts.length > 1) params.set('lastname', parts[parts.length - 1]);
    }
    if (researchFields.maidenName && person.data.maidenName)
      params.set('maiden_name', person.data.maidenName);
    if (researchFields.birthDate && person.data.dob) {
      const yr = person.data.dob.match(/\d{4}/);
      if (yr) params.set('birth_year', yr[0]);
    }
    if (researchFields.deathDate && person.data.dod) {
      const yr = person.data.dod.match(/\d{4}/);
      if (yr) params.set('death_year', yr[0]);
    }
    window.open(`https://www.myheritage.com/research/record-finder/search?${params.toString()}`, '_blank');
  };

  const handleWikiTreeSearch = () => {
    const params = new URLSearchParams();
    const fullName = researchFields.name ? person.data.name : '';
    const maiden  = researchFields.maidenName ? person.data.maidenName : '';
    if (fullName) {
      const parts = fullName.trim().split(' ');
      params.set('FirstName', parts.slice(0, -1).join(' ') || parts[0]);
      if (parts.length > 1) params.set('LastName', parts[parts.length - 1]);
    } else if (maiden) {
      params.set('LastName', maiden);
    }
    if (researchFields.birthDate && person.data.dob) {
      const yr = person.data.dob.match(/\d{4}/);
      if (yr) params.set('BirthYear', yr[0]);
    }
    if (researchFields.birthLocation && person.data.birthLocation)
      params.set('BirthLocation', person.data.birthLocation);
    window.open(`https://www.wikitree.com/wiki/Special:SearchPerson?${params.toString()}`, '_blank');
  };
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (person) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({ 
        name: person.data.name || '', 
        maidenName: person.data.maidenName || '',
        sex: person.data.sex || 'unknown',
        skinTone: person.data.skinTone || 'none',
        colorTheme: person.data.colorTheme || 'purple',
        dob: person.data.dob || '', 
        birthLocation: person.data.birthLocation || '',
        dod: person.data.dod || '',
        deathLocation: person.data.deathLocation || '',
        biography: person.data.biography || '',
        customFields: person.data.customFields || []
      });
    }
  }, [person]);

  useEffect(() => {
    if (panelMode !== 'floating' || !person) return;
    
    let isTracking = true;
    const updatePosition = () => {
      if (!isTracking) return;
      if (floatingRef.current) {
        const el = document.querySelector(`[data-id="${person.id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const panelEl = floatingRef.current;
          const panelWidth = panelEl.offsetWidth || 384;
          const panelHeight = panelEl.offsetHeight || 600;
          
          const spaceLeft = rect.left;
          const spaceRight = window.innerWidth - rect.right;
          
          let left;
          if (spaceRight > spaceLeft) {
            left = rect.right + 20;
          } else {
            left = rect.left - panelWidth - 20;
          }
          
          // Clamp to screen bounds
          left = Math.max(10, Math.min(left, window.innerWidth - panelWidth - 10));
          
          let top = rect.top;
          if (top + panelHeight > window.innerHeight) {
            top = Math.max(80, window.innerHeight - panelHeight - 10);
          } else {
            top = Math.max(80, top); // Don't clip through upper nav bar
          }
          
          panelEl.style.left = `${left}px`;
          panelEl.style.top = `${top}px`;
        }
      }
      requestAnimationFrame(updatePosition);
    };
    
    updatePosition();
    return () => { isTracking = false; };
  }, [person, panelMode]);

  if (!person) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    onUpdate(person.id, { ...person.data, [name]: value });
  };

  const handleNameBlur = () => {
    const parsed = parseMaidenName(formData.name);
    if (parsed.maidenName) {
      setFormData(prev => ({ ...prev, name: parsed.name, maidenName: parsed.maidenName }));
      onUpdate(person.id, { ...person.data, name: parsed.name, maidenName: parsed.maidenName });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 150;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
        } else {
          if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        onUpdate(person.id, { ...person.data, avatar: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleAddCustomField = () => {
    const newFields = [...formData.customFields, { label: '', value: '' }];
    setFormData(prev => ({ ...prev, customFields: newFields }));
    onUpdate(person.id, { ...person.data, customFields: newFields });
  };
  
  const handleCustomFieldChange = (index, key, val) => {
    const newFields = [...formData.customFields];
    newFields[index][key] = val;
    setFormData(prev => ({ ...prev, customFields: newFields }));
    onUpdate(person.id, { ...person.data, customFields: newFields });
  };

  const handleRemoveCustomField = (index) => {
    const newFields = formData.customFields.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, customFields: newFields }));
    onUpdate(person.id, { ...person.data, customFields: newFields });
  };

  // ── Panel content (shared between docked and floating) ──
  const panelContent = (
    <>
      <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 relative shrink-0">
        <div className="flex justify-end p-2 absolute right-0 top-0 gap-1 z-30">
          <button
            onClick={onTogglePanelMode}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
            title={panelMode === 'docked' ? 'Switch to floating' : 'Switch to docked'}
          >
            {panelMode === 'docked' ? <Maximize2 size={16} /> : <PanelRight size={16} />}
          </button>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 pb-4 flex flex-col items-center justify-center gap-3">
           <div className="relative group">
             <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden shadow-inner text-4xl select-none">
               {person.data.avatar ? (
                 <img src={person.data.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <Upload className="text-zinc-400 dark:text-zinc-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" size={24} />
               )}
             </div>
             <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" ref={fileInputRef} onChange={handleImageUpload} />
             <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                <span className="text-xs font-medium text-white shadow-sm">Upload</span>
             </div>
           </div>
           
           <div className="flex gap-2 justify-center">
             {THEMES.map(theme => (
               <button 
                 key={theme} 
                 onClick={() => handleChange({ target: { name: 'colorTheme', value: theme }})} 
                 className={`w-5 h-5 rounded-full ${themeColors[theme]} ${formData.colorTheme === theme ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'} transition-all`} 
                 title={`Theme: ${theme}`}
               />
             ))}
           </div>
           
           <div className="flex items-center gap-3 mt-1 bg-white dark:bg-zinc-950 p-1 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <button onClick={() => onUpdate(person.id, { ...person.data, customWidth: Math.max(160, (person.data.customWidth || person.data.layoutWidth || 240) - 20) })} className="w-6 h-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 font-bold transition-colors" title="Decrease Card Width">-</button>
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none w-16 text-center">Width</span>
             <button onClick={() => onUpdate(person.id, { ...person.data, customWidth: Math.min(600, (person.data.customWidth || person.data.layoutWidth || 240) + 20) })} className="w-6 h-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 font-bold transition-colors" title="Increase Card Width">+</button>
           </div>
           {person.data.customWidth && (
              <button 
                 onClick={() => { const d = {...person.data}; delete d.customWidth; onUpdate(person.id, d); }}
                 className="text-[10px] text-zinc-400 hover:text-purple-500 underline"
              >
                 Reset Width
              </button>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleNameBlur}
                   className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                   placeholder="e.g. Jane (Smith) Doe" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Maiden Name</label>
            <input type="text" name="maidenName" value={formData.maidenName} onChange={handleChange}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-all text-sm"
                  placeholder="e.g. Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Sex</label>
               <select name="sex" value={formData.sex} onChange={handleChange}
                       className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-all text-sm appearance-none">
                  <option value="unknown">Unknown</option>
                  <option value="man">Man</option>
                  <option value="woman">Woman</option>
                  <option value="non-binary">Non-binary</option>
               </select>
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Skin Tone</label>
               <select name="skinTone" value={formData.skinTone} onChange={handleChange}
                       className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-all text-sm appearance-none">
                  <option value="none">Default</option>
                  <option value="light">Light 🏻</option>
                  <option value="medium-light">Med-Light 🏼</option>
                  <option value="medium">Medium 🏽</option>
                  <option value="medium-dark">Med-Dark 🏾</option>
                  <option value="dark">Dark 🏿</option>
               </select>
             </div>
          </div>
          
          <div className="h-px bg-zinc-200 dark:bg-zinc-800/60 my-4" />
          
          <div className="grid grid-cols-[1fr_2fr] gap-3">
             <div className="flex flex-col gap-3">
               <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Birth Date</label>
                  <input type="text" name="dob" value={formData.dob} onChange={handleChange}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-all text-sm" placeholder="e.g. Month Day, Year" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Death Date</label>
                  <input type="text" name="dod" value={formData.dod} onChange={handleChange}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-all text-sm" placeholder="e.g. Month Day, Year" />
               </div>
             </div>
             
             <div className="flex flex-col gap-3">
               <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Birth Location</label>
                  <input type="text" name="birthLocation" value={formData.birthLocation} onChange={handleChange}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-all text-sm" placeholder="City, Country" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Death Location</label>
                  <input type="text" name="deathLocation" value={formData.deathLocation} onChange={handleChange}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-all text-sm" placeholder="City, Country" />
               </div>
             </div>
          </div>
          
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Biography & Notes</label>
            <textarea name="biography" value={formData.biography} onChange={handleChange} rows="3"
                   className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-all text-sm resize-y"
                   placeholder="Write a brief biography..." />
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
               Additional Fields
               <button onClick={handleAddCustomField} className="text-purple-400 hover:text-purple-300 p-1"><Plus size={14}/></button>
            </label>
            {formData.customFields.map((field, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                 <input type="text" value={field.label} onChange={(e) => handleCustomFieldChange(idx, 'label', e.target.value)} placeholder="Label" className="w-1/3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-1.5 text-zinc-700 dark:text-zinc-300 text-xs focus:outline-none focus:border-purple-500" />
                 <input type="text" value={field.value} onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)} placeholder="Value" className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-1.5 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-purple-500" />
                 <button onClick={() => handleRemoveCustomField(idx)} className="text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 p-1.5"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

        </div>

        <div className="h-px bg-zinc-200 dark:bg-zinc-800/60 my-2" />

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Relationships</h3>
          
          {/* Spouse */}
          <div className="flex gap-1">
            <button onClick={() => onAddSpouse(person.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 rounded-md transition-colors text-sm font-medium">
              <Heart size={16} /> Add Spouse
            </button>
            <button
              onClick={() => setLinkingFor(linkingFor === 'spouse' ? null : 'spouse')}
              title="Link an existing person as spouse"
              className={`px-2.5 py-2 border rounded-md transition-colors text-sm ${
                linkingFor === 'spouse'
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                  : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700/50 text-zinc-500 hover:text-purple-400'
              }`}
            >
              <Link size={14} />
            </button>
          </div>
          {linkingFor === 'spouse' && (
            <LinkPersonSearch
              allNodes={allNodes}
              excludeIds={[person.id, ...(person.data.spouses || [])]}
              onSelect={(id) => { onLinkSpouse(person.id, id); setLinkingFor(null); }}
              onCancel={() => setLinkingFor(null)}
            />
          )}

          {/* Parent / Child */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex gap-1">
              <button onClick={() => onAddParent(person.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md transition-colors text-sm">
                <UserPlus size={16} /> Parent
              </button>
              <button
                onClick={() => setLinkingFor(linkingFor === 'parent' ? null : 'parent')}
                title="Link an existing person as parent"
                className={`px-2 py-2 border rounded-md transition-colors text-sm ${
                  linkingFor === 'parent'
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                    : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700/50 text-zinc-500 hover:text-purple-400'
                }`}
              >
                <Link size={14} />
              </button>
            </div>
            <button onClick={() => onAddChild(person.id)} className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md transition-colors text-sm">
              <UserPlus size={16} /> Child
            </button>
          </div>
          {linkingFor === 'parent' && (
            <LinkPersonSearch
              allNodes={allNodes}
              excludeIds={[person.id, ...(person.data.parents || [])]}
              onSelect={(id) => { onLinkParent(person.id, id); setLinkingFor(null); }}
              onCancel={() => setLinkingFor(null)}
            />
          )}
        </div>

        {/* Research / Search */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <button
            onClick={() => setShowResearch(v => !v)}
            className="w-full flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 hover:text-zinc-400 transition-colors"
          >
            <span className="flex items-center gap-1.5"><Search size={11} /> Research</span>
            <ChevronDown size={13} className={`transition-transform ${showResearch ? 'rotate-180' : ''}`} />
          </button>

          {showResearch && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Select fields to include in search:</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {[
                  { key: 'name',          label: 'Full Name',       value: person.data.name },
                  { key: 'maidenName',    label: 'Maiden Name',     value: person.data.maidenName },
                  { key: 'birthDate',     label: 'Birth Date',      value: person.data.dob },
                  { key: 'birthLocation', label: 'Birth Location',  value: person.data.birthLocation },
                  { key: 'deathDate',     label: 'Death Date',      value: person.data.dod },
                  { key: 'deathLocation', label: 'Death Location',  value: person.data.deathLocation },
                ].map(({ key, label, value }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-1.5 text-xs cursor-pointer select-none ${
                      value ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-500 line-through opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!researchFields[key] && !!value}
                      disabled={!value}
                      onChange={e => setResearchFields(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="accent-purple-500 w-3 h-3"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={handleGoogleSearch}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md transition-colors text-xs font-medium"
                >
                  <Search size={13} /> Google
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={handleAncestrySearch} className="flex items-center justify-center gap-1.5 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-600 dark:text-amber-400 border border-amber-600/20 rounded-md transition-colors text-xs font-medium">
                    <Search size={13} /> Ancestry
                  </button>
                  <button onClick={handleFamilySearch} className="flex items-center justify-center gap-1.5 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-600/20 rounded-md transition-colors text-xs font-medium">
                    <Search size={13} /> FamilySearch
                  </button>
                  <button onClick={handleMyHeritageSearch} className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20 rounded-md transition-colors text-xs font-medium">
                    <Search size={13} /> MyHeritage
                  </button>
                  <button onClick={handleWikiTreeSearch} className="flex items-center justify-center gap-1.5 py-2 bg-teal-600/10 hover:bg-teal-600/20 text-teal-600 dark:text-teal-400 border border-teal-600/20 rounded-md transition-colors text-xs font-medium">
                    <Search size={13} /> WikiTree
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
           <button onClick={() => onDelete(person.id)} className="w-full flex items-center justify-center gap-2 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors text-sm font-medium">
            <UserMinus size={16} /> Delete Person
          </button>
        </div>
      </div>
    </>
  );

  // ── Floating mode ──
  if (panelMode === 'floating') {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none p-4 overflow-hidden">
        <div
          ref={floatingRef}
          // Make panel absolute/fixed based on JS coords, but we use fixed so it stays relative to screen!
          // Using pointer-events-auto to re-enable interaction in the panel
          className="fixed bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_10px_60px_rgba(0,0,0,0.3)] w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden z-20 transition-colors duration-300 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {panelContent}
        </div>
      </div>
    );
  }

  // ── Docked mode (default) ──
  return (
    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col z-20 transition-colors duration-300">
      {panelContent}
    </div>
  );
}
