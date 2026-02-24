import fs from 'fs';

const filePath = 'src/app/components/ChatArea.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Patch 1: After line 417 - add auto-expand for demo Q&A
const line417Index = lines.findIndex((line, idx) => 
  idx > 410 && line.includes('setMessages(prev => [...prev, aiResponse]);') && 
  lines[idx + 1]?.trim() === '' &&
  lines[idx + 2]?.includes('// After processing delay')
);
if (line417Index !== -1) {
  console.log(`Found Patch 1 location at line ${line417Index + 1}`);
  lines.splice(line417Index + 1, 0, '                  // Auto-expand panel when analysis starts');
  lines.splice(line417Index + 2, 0, '                  setAnalysisPanelExpanded(prev => ({ ...prev, [aiMsgId]: true }));');
}

// Patch 2: Before setIsProcessing(false) after line 432 - add auto-collapse for demo Q&A
const line433Index = lines.findIndex((line, idx) =>
  idx > 425 && line.trim() === 'setIsProcessing(false);' &&
  lines[idx - 1]?.includes('}));') &&
  lines[idx + 1]?.includes('}, chartType ? 5000 : 1500')
);
if (line433Index !== -1) {
  console.log(`Found Patch 2 location at line ${line433Index + 1}`);
  lines.splice(line433Index, 0, '                      // Auto-collapse panel when analysis completes');
  lines.splice(line433Index + 1, 0, '                      setAnalysisPanelExpanded(prev => ({ ...prev, [aiMsgId]: false }));');
}

// Patch 3: After line 480 - add auto-expand for default logic
const line480Index = lines.findIndex((line, idx) =>
  idx > 475 && line.includes('setMessages(prev => [...prev, aiResponse]);') &&
  lines[idx + 1]?.trim() === '' &&
  lines[idx + 2]?.includes('// 2. Final Response')
);
if (line480Index !== -1) {
  console.log(`Found Patch 3 location at line ${line480Index + 1}`);
  lines.splice(line480Index + 1, 0, '      // Auto-expand panel when analysis starts');
  lines.splice(line480Index + 2, 0, '      if (chartType) {');
  lines.splice(line480Index + 3, 0, '        setAnalysisPanelExpanded(prev => ({ ...prev, [aiMsgId]: true }));');
  lines.splice(line480Index + 4, 0, '      }');
}

// Patch 4: Before setIsProcessing(false) around line 668 - add auto-collapse for default logic  
const line668Index = lines.findIndex((line, idx) =>
  idx > 660 && line.trim() === 'setIsProcessing(false);' &&
  lines[idx - 1]?.includes('}));') &&
  lines[idx + 1]?.includes('}, processingTime')
);
if (line668Index !== -1) {
  console.log(`Found Patch 4 location at line ${line668Index + 1}`);
  lines.splice(line668Index, 0, '        // Auto-collapse panel when analysis completes');
  lines.splice(line668Index + 1, 0, '        if (chartType) {');
  lines.splice(line668Index + 2, 0, '          setAnalysisPanelExpanded(prev => ({ ...prev, [aiMsgId]: false }));');
  lines.splice(line668Index + 3, 0, '        }');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('All patches applied successfully!');
