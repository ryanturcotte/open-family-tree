import { createPersonData } from './genealogyLogic';

export const exportGedcom = (nodes) => {
  let famCounter = 1;
  const families = []; 
  
  const getFamilyId = (parentsArray) => {
     if (parentsArray.length === 0) return null;
     const sortedParents = [...parentsArray].sort();
     let f = families.find(fam => {
        if (fam.parents.length !== sortedParents.length) return false;
        return fam.parents.every((p, i) => p === sortedParents[i]);
     });
     if (!f) {
       f = { id: `@F${famCounter++}@`, parents: sortedParents, chil: [] };
       families.push(f);
     }
     return f.id;
  };

  nodes.forEach(node => {
     (node.data.spouses || []).forEach(sid => {
        if (node.id < sid) {
           getFamilyId([node.id, sid]);
        }
     });

     if (node.data.parents && node.data.parents.length > 0) {
        const fid = getFamilyId(node.data.parents);
        const fam = families.find(f => f.id === fid);
        if (fam && !fam.chil.includes(node.id)) fam.chil.push(node.id);
     }
  });

  let gedcom = `0 HEAD\n1 CHAR UTF-8\n1 SOUR OpenFamilyTree\n`;

  nodes.forEach(node => {
    gedcom += `0 @I${node.id.replace('node-', '')}@ INDI\n`;
    if (node.data.name) {
      const parts = node.data.name.split(' ');
      const last = parts.pop();
      const first = parts.join(' ');
      if (node.data.maidenName) gedcom += `1 NAME ${first} /${node.data.maidenName}/\n`;
      else gedcom += `1 NAME ${first} /${last}/\n`;
    }
    
    if (node.data.gender === 'male') gedcom += `1 SEX M\n`;
    else if (node.data.gender === 'female') gedcom += `1 SEX F\n`;
    else gedcom += `1 SEX U\n`;

    if (node.data.dob || node.data.birthLocation) {
      gedcom += `1 BIRT\n`;
      if (node.data.dob) gedcom += `2 DATE ${node.data.dob}\n`;
      if (node.data.birthLocation) gedcom += `2 PLAC ${node.data.birthLocation}\n`;
    }

    if (node.data.dod || node.data.deathLocation) {
      gedcom += `1 DEAT\n`;
      if (node.data.dod) gedcom += `2 DATE ${node.data.dod}\n`;
      if (node.data.deathLocation) gedcom += `2 PLAC ${node.data.deathLocation}\n`;
    }
    
    if (node.data.biography) {
      const lines = node.data.biography.split('\n');
      gedcom += `1 NOTE ${lines[0]}\n`;
      for(let i=1; i<lines.length; i++) gedcom += `2 CONT ${lines[i]}\n`;
    }

    if (node.data.parents && node.data.parents.length > 0) {
      const fid = getFamilyId(node.data.parents);
      gedcom += `1 FAMC ${fid}\n`;
    }

    families.forEach(fam => {
       if (fam.parents.includes(node.id)) {
          gedcom += `1 FAMS ${fam.id}\n`;
       }
    });
  });

  families.forEach(fam => {
     gedcom += `0 ${fam.id} FAM\n`;
     if (fam.parents.length > 0) {
        const p1 = nodes.find(n => n.id === fam.parents[0]);
        if (p1 && p1.data.gender === 'female') {
           gedcom += `1 WIFE @I${p1.id.replace('node-', '')}@\n`;
           if (fam.parents[1]) gedcom += `1 HUSB @I${fam.parents[1].replace('node-', '')}@\n`;
        } else {
           gedcom += `1 HUSB @I${fam.parents[0].replace('node-', '')}@\n`;
           if (fam.parents[1]) gedcom += `1 WIFE @I${fam.parents[1].replace('node-', '')}@\n`;
        }
     }
     fam.chil.forEach(cid => {
       gedcom += `1 CHIL @I${cid.replace('node-', '')}@\n`;
     });
  });

  gedcom += `0 TRLR\n`;

  const blob = new Blob([gedcom], { type: 'text/gedcom;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'open-family-tree-export.ged');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseGedcom = (gedcomString) => {
  const lines = gedcomString.split('\n').filter(l => l.trim().length > 0);
  const rawNodes = {};
  const rawFams = {};
  
  let currentObj = null;
  let currentType = null; 
  let currentSubTag = null;
  let hasValidData = false;

  lines.forEach(line => {
    const parts = line.trim().split(' ');
    const level = parseInt(parts[0], 10);
    const tagObj = parts[1];
    const rest = parts.slice(2).join(' ');

    if (level === 0) {
      if (rest === 'INDI') {
         currentType = 'INDI';
         currentObj = { id: `node-${tagObj.replace(/@/g, '')}`, data: createPersonData(), FAMS: [], FAMC: null };
         rawNodes[currentObj.id] = currentObj;
         hasValidData = true;
      } else if (rest === 'FAM') {
         currentType = 'FAM';
         currentObj = { id: tagObj.replace(/@/g, ''), HUSB: null, WIFE: null, CHIL: [] };
         rawFams[currentObj.id] = currentObj;
      } else {
         currentType = null;
      }
    } else if (currentType === 'INDI' && level === 1) {
       currentSubTag = null;
       const tag = parts[1];
       const val = parts.slice(2).join(' ');
       if (tag === 'NAME') {
          const nameParts = val.split('/');
          currentObj.data.name = nameParts[0].trim() + (nameParts[1] ? ' ' + nameParts[1].trim() : '');
          if (nameParts[1]) currentObj.data.maidenName = nameParts[1].trim();
       } else if (tag === 'SEX') {
          if (val === 'M') currentObj.data.gender = 'male';
          else if (val === 'F') currentObj.data.gender = 'female';
       } else if (tag === 'BIRT' || tag === 'DEAT') {
          currentSubTag = tag;
       } else if (tag === 'FAMC') {
          currentObj.FAMC = val.replace(/@/g, '');
       } else if (tag === 'FAMS') {
          currentObj.FAMS.push(val.replace(/@/g, ''));
       } else if (tag === 'NOTE') {
          currentObj.data.biography = val;
       }
    } else if (currentType === 'INDI' && level === 2) {
       const tag = parts[1];
       const val = parts.slice(2).join(' ');
       if (currentSubTag === 'BIRT') {
          if (tag === 'DATE') currentObj.data.dob = val;
          if (tag === 'PLAC') currentObj.data.birthLocation = val;
       } else if (currentSubTag === 'DEAT') {
          if (tag === 'DATE') currentObj.data.dod = val;
          if (tag === 'PLAC') currentObj.data.deathLocation = val;
       }
       if (parts[1] === 'CONT' && currentObj.data.biography !== undefined) {
          currentObj.data.biography += '\n' + val;
       }
    } else if (currentType === 'FAM' && level === 1) {
       const tag = parts[1];
       const val = parts.slice(2).join(' ').replace(/@/g, '');
       if (tag === 'HUSB') currentObj.HUSB = `node-${val}`;
       if (tag === 'WIFE') currentObj.WIFE = `node-${val}`;
       if (tag === 'CHIL') currentObj.CHIL.push(`node-${val}`);
    }
  });

  if (!hasValidData) throw new Error("Invalid or empty GEDCOM file");

  const nodesResult = Object.values(rawNodes);

  nodesResult.forEach(node => {
     if (node.FAMC) {
        const fam = rawFams[node.FAMC];
        if (fam) {
           node.data.parents = [fam.HUSB, fam.WIFE].filter(Boolean);
        }
     }
  });

  nodesResult.forEach(node => {
     node.FAMS.forEach(famId => {
        const fam = rawFams[famId];
        if (fam) {
           const partner = fam.HUSB === node.id ? fam.WIFE : fam.HUSB;
           if (partner && !node.data.spouses.includes(partner)) {
               node.data.spouses.push(partner);
           }
        }
     });
  });
  
  nodesResult.forEach(n => {
     delete n.FAMS;
     delete n.FAMC;
     n.type = 'personNode';
     n.position = { x: 0, y: 0 };
  });

  return nodesResult;
};
