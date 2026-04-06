// Swap firma positions - fixed TAB+text handling
const fs = require('fs');
const PizZip = require('pizzip');

function swapSignatures(filepath) {
  console.log(`\nProcesando: ${filepath.split('/').pop()}`);

  // First restore from backup if exists (undo previous attempt)
  const bakPath = filepath + '.bak.firmas';
  if (fs.existsSync(bakPath)) {
    console.log('  Restoring from backup first...');
    fs.copyFileSync(bakPath, filepath);
  }

  const content = fs.readFileSync(filepath, 'binary');
  const zip = new PizZip(content);
  let xml = zip.file('word/document.xml').asText();

  // Find signature paragraphs
  const paraStarts = [];
  let sf = 0;
  while (true) {
    const idx = xml.indexOf('<w:p ', sf);
    if (idx === -1) break;
    paraStarts.push(idx);
    sf = idx + 1;
  }

  let nameParaStart = -1, nameParaEnd = -1;
  let idParaStart = -1, idParaEnd = -1;

  for (let i = paraStarts.length - 1; i >= 0; i--) {
    const start = paraStarts[i];
    const end = xml.indexOf('</w:p>', start) + 6;
    const para = xml.substring(start, end);
    const text = para.replace(/<[^>]+>/g, '');

    if (nameParaStart === -1 && text.includes('cliente}{') && text.includes('generadorContratos}{')) {
      nameParaStart = start;
      nameParaEnd = end;
    }
    if (idParaStart === -1 && text.includes('idFormated') && text.includes('NIT')) {
      idParaStart = start;
      idParaEnd = end;
    }
    if (nameParaStart !== -1 && idParaStart !== -1) break;
  }

  if (nameParaStart === -1) {
    console.log('  ERROR: Signature paragraphs not found');
    return;
  }

  let changed = false;

  // Process name paragraph
  {
    const para = xml.substring(nameParaStart, nameParaEnd);
    const newPara = swapParagraph(para, 'name');
    if (newPara !== para) {
      xml = xml.substring(0, nameParaStart) + newPara + xml.substring(nameParaEnd);
      if (idParaStart > nameParaStart) {
        const diff = newPara.length - para.length;
        idParaStart += diff;
        idParaEnd += diff;
      }
      changed = true;
    }
  }

  // Process ID paragraph
  if (idParaStart !== -1 && idParaStart !== nameParaStart) {
    const para = xml.substring(idParaStart, idParaEnd);
    const newPara = swapParagraph(para, 'id');
    if (newPara !== para) {
      xml = xml.substring(0, idParaStart) + newPara + xml.substring(idParaEnd);
      changed = true;
    }
  }

  if (!changed) {
    console.log('  WARNING: No changes made');
    return;
  }

  zip.file('word/document.xml', xml);
  fs.writeFileSync(filepath, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('  Saved!');
  verify(filepath);
}

function swapParagraph(paraXml, label) {
  const runs = [];
  const runRegex = /<w:r[ >][\s\S]*?<\/w:r>/g;
  let match;
  while ((match = runRegex.exec(paraXml)) !== null) {
    const hasTab = match[0].includes('<w:tab');
    const textMatch = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
    const hasText = textMatch && textMatch[1].trim().length > 0;

    // A run is ONLY a "pure tab" if it has a tab but NO meaningful text
    runs.push({
      xml: match[0],
      start: match.index,
      end: match.index + match[0].length,
      isPureTab: hasTab && !hasText,
      hasTab: hasTab,
      text: textMatch ? textMatch[1] : ''
    });
  }

  if (runs.length === 0) return paraXml;

  // Find tab boundary using isPureTab
  let firstTabIdx = runs.findIndex(r => r.isPureTab);
  if (firstTabIdx === -1) {
    console.log(`  ${label}: No pure TABs found`);
    return paraXml;
  }

  // Find where pure tabs end
  let afterTabIdx = -1;
  for (let i = firstTabIdx; i < runs.length; i++) {
    if (!runs[i].isPureTab) {
      afterTabIdx = i;
      break;
    }
  }

  if (afterTabIdx === -1) {
    console.log(`  ${label}: No content after TABs`);
    return paraXml;
  }

  const leftRuns = runs.slice(0, firstTabIdx);
  const tabRuns = runs.slice(firstTabIdx, afterTabIdx);
  const rightRuns = runs.slice(afterTabIdx);

  // For right runs that have embedded tabs (like the "NIT" run with tab),
  // we need to remove the <w:tab/> when moving to the left position
  const cleanedRightRuns = rightRuns.map(r => {
    if (r.hasTab) {
      // Remove <w:tab/> from the run XML since it won't need tab positioning on the left
      return { ...r, xml: r.xml.replace(/<w:tab\s*\/>/g, '') };
    }
    return r;
  });

  // For left runs moving to right, we might need to add a tab to the first one
  // Actually, let's keep it simple - the tab stops in the paragraph properties handle alignment

  const leftXml = leftRuns.map(r => r.xml).join('');
  const tabsXml = tabRuns.map(r => r.xml).join('');
  const rightXml = cleanedRightRuns.map(r => r.xml).join('');

  const leftText = leftRuns.map(r => r.text).join('').trim();
  const rightText = rightRuns.map(r => r.text).join('').trim();
  console.log(`  ${label}: "${leftText}" <-> "${rightText}" (${tabRuns.length} tabs)`);

  // Rebuild: RIGHT + tabs + LEFT
  const prefix = paraXml.substring(0, runs[0].start);
  const suffix = paraXml.substring(runs[runs.length - 1].end);

  return prefix + rightXml + tabsXml + leftXml + suffix;
}

function verify(filepath) {
  const content = fs.readFileSync(filepath, 'binary');
  const zip = new PizZip(content);
  const xml = zip.file('word/document.xml').asText();
  const plain = xml.replace(/<[^>]+>/g, '');

  // Find signature area
  const lastFirma = plain.lastIndexOf('FIRMA');
  const sigArea = plain.substring(lastFirma - 20, lastFirma + 200);
  console.log('  Verification (plain text):');
  console.log('  ' + sigArea.replace(/\s+/g, ' ').trim());
}

// Process both templates
[
  '/app/plantillas/2026/CONTRATO DE MANDATO CON REPRESENTACIÓN.docx',
  '/app/plantillas/2026/PROCESO INICIALES - ORDEN DE ADQUISICIÓN VEHICULAR.docx',
].forEach(t => {
  if (fs.existsSync(t)) swapSignatures(t);
  else console.log(`Not found: ${t}`);
});
