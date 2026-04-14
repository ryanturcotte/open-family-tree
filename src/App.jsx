import { useState, useRef, useEffect } from 'react';
import { useUndoableState } from './useUndoableState';
import { initialNodes, createPersonData, generateId } from './genealogyLogic';
import TreeCanvas from './TreeCanvas';
import PersonDetailsPanel from './PersonDetailsPanel';
import OnboardingModal from './OnboardingModal';
import RestartModal from './RestartModal';
import CookieConsent from './CookieConsent';
import SettingsModal from './SettingsModal';
import { DisplaySettingsContext, defaultDisplaySettings } from './DisplaySettingsContext';
import { Download, Upload, RefreshCw, ArchiveRestore, Search, ChevronDown, FileJson, FileSpreadsheet, FileCode, Moon, Sun, Undo2, Redo2, Save, Menu, Settings, X } from 'lucide-react';
import { exportGedcom, parseGedcom } from './gedcomUtils';
import { downloadCSV } from './exportUtils';
import { generateDemoTree } from './demoTree';

// Load initial tree from auto-save, falling back to initialNodes
const loadInitialNodes = () => {
  try {
    const saved = localStorage.getItem('oft-tree-autosave');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return initialNodes;
};

function App() {
  const { nodes, setNodes, undo, redo, canUndo, canRedo } = useUndoableState(loadInitialNodes());
  const [savedIndicator, setSavedIndicator] = useState(false); // "✓ Saved" flash
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('oft-tutorial-done'));
  const [hasBackup, setHasBackup] = useState(() => !!localStorage.getItem('oft-backup-tree'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusNodeId, setFocusNodeId] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const cached = localStorage.getItem('oft-dark-mode');
    return cached ? cached === 'true' : true; // Default to dark mode
  });

  const [displaySettings, setDisplaySettings] = useState(() => {
    try {
      const cached = localStorage.getItem('oft-display-settings');
      return cached ? { ...defaultDisplaySettings, ...JSON.parse(cached) } : defaultDisplaySettings;
    } catch {
      return defaultDisplaySettings;
    }
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  const fileInputRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('oft-display-settings', JSON.stringify(displaySettings));
  }, [displaySettings]);

  // Sync Dark Mode natively with HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('oft-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  // Auto-save: debounced write to LocalStorage whenever nodes change
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('oft-tree-autosave', JSON.stringify(nodes));
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      } catch (e) { console.error('Auto-save failed:', e); }
    }, 500);
    return () => clearTimeout(saveTimerRef.current);
  }, [nodes]);

  // Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleRestartTutorial = () => {
    if (nodes.length > 1 || (nodes[0] && nodes[0].data.name !== 'Main Root')) {
      setShowRestartModal(true);
    } else {
      executeWipeAndRestart();
    }
    setShowMobileMenu(false);
  };

  const handleSaveBackupRestart = () => {
    localStorage.setItem('oft-backup-tree', JSON.stringify(nodes));
    setHasBackup(true);
    setShowRestartModal(false);
    executeWipeAndRestart();
  };

  const executeWipeAndRestart = () => {
    localStorage.removeItem('oft-tutorial-done');
    setNodes(initialNodes);
    setShowTutorial(true);
    setShowRestartModal(false);
  };

  const handleLoadBackup = () => {
    const backupStr = localStorage.getItem('oft-backup-tree');
    if (backupStr) {
      try {
        const parsed = JSON.parse(backupStr);
        if (Array.isArray(parsed)) {
          setNodes(parsed);
          setSelectedNodeId(null);
          setLayoutKey(k => k + 1);
        }
      } catch (e) {
        console.error("Failed to load backup preset:", e);
      }
    }
    setShowMobileMenu(false);
  };

  const handleCompleteTutorial = (formData) => {
    const { name, maidenName, parent1, parent1Maiden, parent2, parent2Maiden, dateFormat } = formData;
    
    if (dateFormat) {
      setDisplaySettings(prev => ({ ...prev, dateFormat }));
    }

    const newNodes = [];
    const childId = `node-${generateId()}`;
    const p1Id = (parent1.trim() || parent1Maiden?.trim()) ? `node-${generateId()}` : null;
    const p2Id = (parent2.trim() || parent2Maiden?.trim()) ? `node-${generateId()}` : null;

    const childParents = [];
    if (p1Id) childParents.push(p1Id);
    if (p2Id) childParents.push(p2Id);

    newNodes.push({
      id: childId,
      data: { ...createPersonData(), name: name || (maidenName ? '' : 'Me'), maidenName: maidenName || '', parents: childParents },
      position: { x: 0, y: 0 },
      type: 'personNode',
    });

    if (p1Id) newNodes.push({
      id: p1Id, data: { ...createPersonData(), name: parent1, maidenName: parent1Maiden || '', sex: 'man' }, position: { x: 0, y: 0 }, type: 'personNode'
    });
    if (p2Id) newNodes.push({
      id: p2Id, data: { ...createPersonData(), name: parent2, maidenName: parent2Maiden || '', sex: 'woman' }, position: { x: 0, y: 0 }, type: 'personNode'
    });

    setNodes(newNodes);
    localStorage.setItem('oft-tutorial-done', 'true');
    setShowTutorial(false);
    setSelectedNodeId(childId);
    setLayoutKey(k => k + 1);
  };

  const handleSkipTutorial = () => {
    localStorage.setItem('oft-tutorial-done', 'true');
    setShowTutorial(false);
  };

  const handleLoadDemo = () => {
    setNodes(generateDemoTree());
    localStorage.setItem('oft-tutorial-done', 'true');
    setShowTutorial(false);
    setSelectedNodeId(null);
    setLayoutKey(k => k + 1);
  };

  const handleNodeSelect = (id) => {
    setSelectedNodeId(id);
  };

  const handleUpdatePerson = (id, newData) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, data: newData } : n));
  };

  const handleAddParent = (childId) => {
    const newId = `node-${generateId()}`;
    const newNode = {
      id: newId,
      data: { ...createPersonData(), name: 'New Parent' },
      position: { x: 0, y: 0 },
      type: 'personNode',
    };
    
    setNodes(prevNodes => {
      const childNode = prevNodes.find(n => n.id === childId);
      if (!childNode) return prevNodes;
      
      const newChildData = { ...childNode.data, parents: [...(childNode.data.parents || []), newId] };
      return [...prevNodes.map(n => n.id === childId ? { ...n, data: newChildData } : n), newNode];
    });
    setSelectedNodeId(newId);
    setLayoutKey(k => k + 1); // trigger re-layout
  };

  const handleAddChild = (parentId) => {
    const newId = `node-${generateId()}`;
    const newNode = {
      id: newId,
      data: { ...createPersonData(), name: 'New Child', parents: [parentId] },
      position: { x: 0, y: 0 },
      type: 'personNode',
    };
    
    setNodes(prevNodes => [...prevNodes, newNode]);
    setSelectedNodeId(newId);
    setLayoutKey(k => k + 1);
  };

  const handleDeletePerson = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id).map(n => ({
      ...n,
      data: {
        ...n.data,
        parents: (n.data.parents || []).filter(pid => pid !== id),
        spouses: (n.data.spouses || []).filter(sid => sid !== id)
      }
    })));
    setSelectedNodeId(null);
    setLayoutKey(k => k + 1);
  };

  const handleLinkSpouse = (personId, existingId) => {
    setNodes(prev => prev.map(n => {
      if (n.id === personId) {
        return { ...n, data: { ...n.data, spouses: [...new Set([...(n.data.spouses || []), existingId])] } };
      }
      if (n.id === existingId) {
        return { ...n, data: { ...n.data, spouses: [...new Set([...(n.data.spouses || []), personId])] } };
      }
      return n;
    }));
    setLayoutKey(k => k + 1);
  };

  const handleLinkParent = (childId, existingParentId) => {
    setNodes(prev => prev.map(n => {
      if (n.id === childId) {
        return { ...n, data: { ...n.data, parents: [...new Set([...(n.data.parents || []), existingParentId])] } };
      }
      return n;
    }));
    setLayoutKey(k => k + 1);
  };

  const handleAddSpouse = (partnerId) => {
    const newId = `node-${generateId()}`;
    const newNode = {
      id: newId,
      data: { ...createPersonData(), name: 'New Spouse', spouses: [partnerId] },
      position: { x: 0, y: 0 },
      type: 'personNode',
    };
    
    setNodes(prevNodes => {
      const partnerNode = prevNodes.find(n => n.id === partnerId);
      if (!partnerNode) return prevNodes;
      
      const newPartnerData = { 
         ...partnerNode.data, 
         spouses: [...(partnerNode.data.spouses || []), newId] 
      };
      
      return [...prevNodes.map(n => n.id === partnerId ? { ...n, data: newPartnerData } : n), newNode];
    });
    setSelectedNodeId(newId);
    setLayoutKey(k => k + 1);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(nodes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    let exportFileDefaultName = 'open-family-tree-tree.json';
    
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setShowMobileMenu(false);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (file.name.toLowerCase().endsWith('.ged')) {
          const importedNodes = parseGedcom(event.target.result);
          setNodes(importedNodes);
        } else {
          const importedNodes = JSON.parse(event.target.result);
          if (Array.isArray(importedNodes)) {
            setNodes(importedNodes);
          }
        }
        setSelectedNodeId(null);
        setLayoutKey(k => k + 1);
      } catch (err) {
        alert('Failed to parse file: ' + err.message);
      }
      setShowMobileMenu(false);
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  const activePerson = nodes.find(n => n.id === selectedNodeId);

  const searchResults = nodes.filter(n => {
    if (!searchQuery.trim()) return false;
    const lower = searchQuery.toLowerCase();
    const nameMatch = n.data.name?.toLowerCase().includes(lower);
    const maidenMatch = n.data.maidenName?.toLowerCase().includes(lower);
    const locMatch = n.data.birthLocation?.toLowerCase().includes(lower);
    return nameMatch || maidenMatch || locMatch;
  });

  const handleSearchResultClick = (id) => {
    setSelectedNodeId(id);
    setFocusNodeId(id);
    setTimeout(() => setFocusNodeId(null), 100);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const renderActionButtons = () => (
    <>
      <input 
        type="file" 
        accept=".json,.ged" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImportData} 
      />
      {hasBackup && (
        <button 
          onClick={handleLoadBackup}
          className="w-full sm:w-auto px-4 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 hover:text-amber-400 rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 border border-amber-600/30"
          title="Load Local Backup Preset"
        >
          <ArchiveRestore size={16} />
          Load Backup
        </button>
      )}

      <button 
          onClick={handleRestartTutorial}
          className="w-full sm:w-auto px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700/50"
          title="Restart Tutorial"
      >
        <RefreshCw size={16} />
        Restart
      </button>
      <button 
          onClick={() => fileInputRef.current.click()}
          className="w-full sm:w-auto px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700/50"
      >
        <Upload size={16} />
        Import
      </button>
      <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 border border-purple-500"
          >
            <Download size={16} />
            Export
            <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>
          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-2xl py-1 z-50">
              <button onClick={() => { handleExportData(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800/50">
                <FileJson size={14} className="text-purple-600 dark:text-purple-400 shrink-0" /> Open Family Tree Backup (.json)
              </button>
              <button onClick={() => { downloadCSV(nodes); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800/50">
                <FileSpreadsheet size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0" /> Spreadsheet (.csv)
              </button>
              <button onClick={() => { exportGedcom(nodes); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <FileCode size={14} className="text-blue-500 dark:text-blue-400 shrink-0" /> GEDCOM (.ged)
              </button>
            </div>
          )}
      </div>
    </>
  );

  return (
    <DisplaySettingsContext.Provider value={displaySettings}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans selection:bg-purple-500/30 transition-colors duration-300">
        <header className="flex justify-between items-center px-4 sm:px-6 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10 w-full transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-purple-500/20">
              {/* Family tree icon: 2 parents → 1 child (matches favicon) */}
              <svg viewBox="0 0 100 100" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(0,100) scale(1,-1)">
                  <rect x="37" y="16" width="26" height="20" rx="4" fill="white"/>
                  <line x1="50" y1="36" x2="50" y2="48" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                  <line x1="26" y1="48" x2="74" y2="48" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                  <line x1="26" y1="48" x2="26" y2="58" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                  <line x1="74" y1="48" x2="74" y2="58" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                  <rect x="13" y="58" width="26" height="20" rx="4" fill="white"/>
                  <rect x="61" y="58" width="26" height="20" rx="4" fill="white"/>
                </g>
              </svg>
            </div>
            {/* Mobile Hamburger Menu Button */}
            <button 
              className="sm:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-indigo-300 dark:to-purple-300 text-transparent bg-clip-text drop-shadow-sm truncate">
              Open Family Tree
            </h1>
          </div>

          {/* Global Search Feature & Save Indicator */}
          <div className="flex-1 max-w-md mx-4 sm:mx-8 relative flex items-center gap-3">
             <div className="relative group flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={14} />
                <input 
                   type="text" 
                   placeholder="Search..." 
                   value={searchQuery}
                   onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setShowDropdown(true);
                   }}
                   onFocus={() => setShowDropdown(true)}
                   className="w-full bg-zinc-200 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700/50 rounded-md py-1.5 pl-9 pr-4 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                />
             </div>
             
             <span
                className={`text-xs whitespace-nowrap flex items-center gap-1 transition-all duration-500 ${
                  savedIndicator
                    ? 'text-emerald-500 dark:text-emerald-400 opacity-100'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <Save size={12} /> Saved
              </span>

             {showDropdown && searchResults.length > 0 && (
               <div className="absolute top-full left-0 mt-2 w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-2xl py-1 z-50 max-h-60 overflow-y-auto transition-colors duration-300">
                 {searchResults.map(res => (
                   <button 
                      key={res.id} 
                      onClick={() => handleSearchResultClick(res.id)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 flex justify-between items-center"
                   >
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">{res.data.name || 'Unknown'} {res.data.maidenName ? `(${res.data.maidenName})` : ''}</span>
                      <span className="text-xs text-zinc-500 truncate max-w-[40%]">{res.data.birthLocation}</span>
                   </button>
                 ))}
               </div>
             )}
          </div>
          
          <div className="flex gap-2 sm:gap-3 items-center">
            {/* Undo / Redo */}
            <div className="flex gap-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="px-2 py-1.5 sm:px-2.5 sm:py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-md transition-all flex items-center justify-center border border-zinc-300 dark:border-zinc-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="px-2 py-1.5 sm:px-2.5 sm:py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-md transition-all flex items-center justify-center border border-zinc-300 dark:border-zinc-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Redo2 size={16} />
              </button>
            </div>
            
            {/* Dark Mode toggle */}
            <button 
               onClick={() => setIsDarkMode(!isDarkMode)}
               className="hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-md transition-all items-center justify-center border border-zinc-300 dark:border-zinc-700/50"
               title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Desktop Toolbar */}
            <div className="hidden sm:flex items-center gap-2">
              {renderActionButtons()}
            </div>

            {/* Settings button */}
            <button 
               onClick={() => setShowSettingsModal(true)}
               className="px-2 py-1.5 sm:px-3 sm:py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-md transition-all flex items-center justify-center border border-zinc-300 dark:border-zinc-700/50"
               title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        {showMobileMenu && (
          <div className="sm:hidden absolute top-[57px] left-0 right-0 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-md p-4 flex flex-col gap-3 z-40 animate-in slide-in-from-top-2">
             <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-zinc-500">Menu</span>
                <button 
                   onClick={() => setIsDarkMode(!isDarkMode)}
                   className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  {isDarkMode ? <><Sun size={14} /> Light Mode</> : <><Moon size={14} /> Dark Mode</>}
                </button>
             </div>
             {renderActionButtons()}
             <div className="w-full text-center mt-2">
               <button onClick={() => setShowMobileMenu(false)} className="py-2 text-zinc-500 text-sm">
                 Close Menu
               </button>
             </div>
          </div>
        )}
        
        <main className="flex-1 relative">
          <TreeCanvas 
            genealogyNodes={nodes}
            layoutKey={layoutKey} 
            onNodeSelect={handleNodeSelect} 
            focusNodeId={focusNodeId}
            selectedNodeId={selectedNodeId}
            panelOpen={!!activePerson}
          />
          
          {activePerson && (
            <PersonDetailsPanel 
              person={activePerson}
              allNodes={nodes}
              onClose={() => setSelectedNodeId(null)}
              onUpdate={handleUpdatePerson}
              onAddParent={handleAddParent}
              onAddChild={handleAddChild}
              onAddSpouse={handleAddSpouse}
              onLinkSpouse={handleLinkSpouse}
              onLinkParent={handleLinkParent}
              onDelete={handleDeletePerson}
              panelMode={displaySettings.panelMode}
              onTogglePanelMode={() => setDisplaySettings(p => ({ ...p, panelMode: p.panelMode === 'docked' ? 'floating' : 'docked' }))}
            />
          )}

          {showTutorial && (
            <OnboardingModal 
              onComplete={handleCompleteTutorial} 
              onSkip={handleSkipTutorial} 
              onLoadDemo={handleLoadDemo}
            />
          )}

          {showRestartModal && (
            <RestartModal
              onSaveBackup={handleSaveBackupRestart}
              onDiscard={executeWipeAndRestart}
              onCancel={() => setShowRestartModal(false)}
            />
          )}

          {showSettingsModal && (
            <SettingsModal
              settings={displaySettings}
              onUpdate={setDisplaySettings}
              onClose={() => setShowSettingsModal(false)}
            />
          )}

          <CookieConsent />
        </main>
      </div>
    </DisplaySettingsContext.Provider>
  )
}

export default App
