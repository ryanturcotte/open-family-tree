export const downloadCSV = (nodes) => {
  // Discover dynamic fields across the entire graph context
  const uniqueCustomFields = new Set();
  nodes.forEach(node => {
    (node.data.customFields || []).forEach(cf => {
      if (cf.label) uniqueCustomFields.add(cf.label.trim());
    });
  });
  
  const customFieldHeaders = Array.from(uniqueCustomFields).sort();
  
  const headers = [
    'ID', 'Full Name', 'Maiden Name', 'Gender', 'Birth Year', 
    'Birth Location', 'Death Year', 'Death Location', 'Biography', 
    'Parents', 'Spouses', ...customFieldHeaders
  ];

  const escapeCSV = (str) => {
    if (!str) return '""';
    const escaped = String(str).replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = nodes.map(node => {
    // Map relationship IDs to readable Names so spreadsheet makes actual visual sense
    const parentNames = (node.data.parents || []).map(pid => {
       const p = nodes.find(n => n.id === pid);
       return p ? p.data.name : pid;
    }).join('; ');
    
    const spouseNames = (node.data.spouses || []).map(sid => {
       const s = nodes.find(n => n.id === sid);
       return s ? s.data.name : sid;
    }).join('; ');

    const coreData = [
      node.id,
      node.data.name || '',
      node.data.maidenName || '',
      node.data.gender || 'unknown',
      node.data.dob || '',
      node.data.birthLocation || '',
      node.data.dod || '',
      node.data.deathLocation || '',
      node.data.biography || '',
      parentNames,
      spouseNames
    ];

    const customData = customFieldHeaders.map(header => {
       const fieldObj = (node.data.customFields || []).find(cf => cf.label?.trim() === header);
       return fieldObj ? fieldObj.value : '';
    });

    return [...coreData, ...customData].map(escapeCSV).join(',');
  });

  const csvContent = [headers.map(escapeCSV).join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'open-family-tree-tree.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
