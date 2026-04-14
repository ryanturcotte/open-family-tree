import { createPersonData } from './genealogyLogic';

export const generateDemoTree = () => {
  const nodes = [];
  
  const addNode = (id, name, sex, theme, dob, dod, bio, parents = [], spouses = [], custom = []) => {
    nodes.push({
      id: `node-${id}`,
      type: 'personNode',
      position: { x: 0, y: 0 },
      data: {
        ...createPersonData(),
        name,
        sex,
        colorTheme: theme,
        dob,
        dod,
        biography: bio,
        parents: parents.map(p => `node-${p}`),
        spouses: spouses.map(s => `node-${s}`),
        customFields: custom
      }
    });
  };

  // Starks
  addNode('rickard', 'Rickard Stark', 'man', 'zinc', '230 AC', '282 AC', 'Lord of Winterfell and Warden of the North.', [], [], [{label: 'House', value: 'Stark'}, {label: 'Title', value: 'Lord of Winterfell'}]);
  
  addNode("ned", "Eddard Stark", "man", "zinc", "263 AC", "299 AC", "Ned Stark: Honest, honorable, and ultimately doomed. Hand of the King to Robert Baratheon.", ["rickard"], ["cat"], [{label: "House", value: "Stark"}, {label: "Weapon", value: "Ice"}]);
  addNode("lyanna", "Lyanna Stark", "woman", "zinc", "267 AC", "283 AC", "The wolf maid whose abduction started Roberts Rebellion.", ["rickard"], [], [{label: "House", value: "Stark"}]);
  
  addNode("cat", "Catelyn (Tully) Stark", "woman", "blue", "264 AC", "299 AC", "Fiercely protective mother of the Stark children.", [], ["ned"], [{label: "House", value: "Tully"}]);
  
  addNode("robb", "Robb Stark", "man", "zinc", "283 AC", "299 AC", "The Young Wolf. King in the North.", ["ned", "cat"], [], [{label: "House", value: "Stark"}, {label: "Direwolf", value: "Grey Wind"}]);
  addNode("sansa", "Sansa Stark", "woman", "zinc", "286 AC", "", "Survived the political horrors of Kings Landing to become Queen in the North.", ["ned", "cat"], [], [{label: "House", value: "Stark"}, {label: "Direwolf", value: "Lady"}]);
  addNode("arya", "Arya Stark", "woman", "zinc", "289 AC", "", "Trained by the Faceless Men. A deadly assassin.", ["ned", "cat"], [], [{label: "House", value: "Stark"}, {label: "Weapon", value: "Needle"}]);
  addNode("bran", "Brandon Stark", "man", "zinc", "290 AC", "", "Bran the Broken. The Three-Eyed Raven.", ["ned", "cat"], [], [{label: "House", value: "Stark"}]);
  
  addNode('jon', 'Jon Snow', 'man', 'zinc', '283 AC', '', 'The White Wolf. Secret son of Lyanna Stark and Rhaegar Targaryen.', ['lyanna', 'rhaegar'], [], [{label: 'Weapon', value: 'Longclaw'}, {label: 'Direwolf', value: 'Ghost'}]);
  addNode('rhaegar', 'Rhaegar Targaryen', 'man', 'rose', '259 AC', '283 AC', 'The Last Dragon. Loved Lyanna Stark.', [], ['lyanna'], [{label: 'House', value: 'Targaryen'}]);

  // Lannisters
  addNode('tywin', 'Tywin Lannister', 'man', 'amber', '242 AC', '300 AC', 'Ruthless patriarch of House Lannister. The richest man in the Seven Kingdoms.', [], [], [{label: 'House', value: 'Lannister'}]);
  addNode('cersei', 'Cersei Lannister', 'woman', 'amber', '266 AC', '305 AC', 'Fiercely ambitious, completely ruthless Queen.', ['tywin'], ['robert'], [{label: 'House', value: 'Lannister'}]);
  addNode('jaime', 'Jaime Lannister', 'man', 'amber', '266 AC', '305 AC', 'The Kingslayer. Commander of the Kingsguard.', ['tywin'], [], [{label: 'House', value: 'Lannister'}, {label: 'Title', value: 'Kingsguard'}]);
  addNode('tyrion', 'Tyrion Lannister', 'man', 'amber', '273 AC', '', 'The Halfman. Brilliant strategist constantly underestimated by his family.', ['tywin'], [], [{label: 'House', value: 'Lannister'}]);

  // Baratheons
  addNode('robert', 'Robert Baratheon', 'man', 'emerald', '262 AC', '298 AC', 'Demon of the Trident. King of the Andals. Led the rebellion against the Mad King.', [], ['cersei'], [{label: 'House', value: 'Baratheon'}, {label: 'Weapon', value: 'Warhammer'}]);
  
  // (Legally Robert's, biologically Jaime's - for testing the graph structure we'll map them to Cersei + Robert)
  addNode('joffrey', 'Joffrey Baratheon', 'man', 'amber', '286 AC', '300 AC', 'Cruel, arrogant boy king.', ['cersei', 'robert'], [], [{label: 'House', value: 'Baratheon'}]);
  addNode('myrcella', 'Myrcella Baratheon', 'woman', 'amber', '290 AC', '300 AC', 'Sweet princess shipped to Dorne.', ['cersei', 'robert'], [], [{label: 'House', value: 'Baratheon'}]);

  return nodes;
};
