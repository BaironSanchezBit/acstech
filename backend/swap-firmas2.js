// Swap firma positions - direct XML manipulation
const fs = require('fs');
const PizZip = require('pizzip');

function swapSignatures(filepath) {
  console.log(`\nProcesando: ${filepath.split('/').pop()}`);

  const content = fs.readFileSync(filepath, 'binary');
  const zip = new PizZip(content);
  let xml = zip.file('word/document.xml').asText();

  // Find the signature area: last section with {#cliente} and nearby {#generadorContratos}
  // Work with the raw XML directly

  // Find the LAST paragraph containing cliente and generadorContratos
  // A paragraph is <w:p ...>...</w:p>

  // Find all <w:p> boundaries
  const paraStarts = [];
  let searchFrom = 0;
  while (true) {
    const idx = xml.indexOf('<w:p ', searchFrom);
    if (idx === -1) break;
    paraStarts.push(idx);
    searchFrom = idx + 1;
  }

  // Find paragraphs by their content
  let nameParaStart = -1, nameParaEnd = -1;
  let idParaStart = -1, idParaEnd = -1;

  for (let i = paraStarts.length - 1; i >= 0; i--) {
    const start = paraStarts[i];
    const end = xml.indexOf('</w:p>', start) + 6;
    const para = xml.substring(start, end);

    if (nameParaStart === -1 && para.includes('cliente}{') && para.includes('generadorContratos}{')) {
      nameParaStart = start;
      nameParaEnd = end;
      console.log(`  Found name paragraph at position ${start}`);
    }
    if (idParaStart === -1 && para.includes('idFormated') && para.includes('NIT')) {
      idParaStart = start;
      idParaEnd = end;
      console.log(`  Found ID paragraph at position ${start}`);
    }
    if (nameParaStart !== -1 && idParaStart !== -1) break;
  }

  if (nameParaStart === -1) {
    console.log('  ERROR: Name paragraph not found');
    return;
  }

  let changed = false;

  // Process name paragraph
  {
    const para = xml.substring(nameParaStart, nameParaEnd);
    const newPara = swapRunsInParagraph(para, 'name');
    if (newPara !== para) {
      xml = xml.substring(0, nameParaStart) + newPara + xml.substring(nameParaEnd);
      // Adjust ID paragraph positions if it comes after
      if (idParaStart > nameParaStart) {
        const diff = newPara.length - para.length;
        idParaStart += diff;
        idParaEnd += diff;
      }
      changed = true;
      console.log('  Name paragraph swapped');
    }
  }

  // Process ID paragraph
  if (idParaStart !== -1 && idParaStart !== nameParaStart) {
    const para = xml.substring(idParaStart, idParaEnd);
    const newPara = swapRunsInParagraph(para, 'id');
    if (newPara !== para) {
      xml = xml.substring(0, idParaStart) + newPara + xml.substring(idParaEnd);
      changed = true;
      console.log('  ID paragraph swapped');
    }
  }

  if (!changed) {
    console.log('  WARNING: No changes made');
    return;
  }

  // Save
  zip.file('word/document.xml', xml);
  const output = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(filepath, output);
  console.log('  Saved!');

  // Verify
  verify(filepath);
}

function swapRunsInParagraph(paraXml, label) {
  // Extract all <w:r>...</w:r> with their positions
  const runs = [];
  const runRegex = /<w:r[ >][\s\S]*?<\/w:r>/g;
  let match;
  while ((match = runRegex.exec(paraXml)) !== null) {
    const isTab = match[0].includes('<w:tab');
    runs.push({
      xml: match[0],
      start: match.index,
      end: match.index + match[0].length,
      isTab: isTab
    });
  }

  if (runs.length === 0) return paraXml;

  // Split into: left_content, tabs, right_content
  let firstTabIdx = runs.findIndex(r => r.isTab);
  if (firstTabIdx === -1) {
    console.log(`  ${label}: No TABs found, cannot swap`);
    return paraXml;
  }

  // Find where tabs end and right content begins
  let afterTabIdx = -1;
  for (let i = firstTabIdx; i < runs.length; i++) {
    if (!runs[i].isTab) {
      afterTabIdx = i;
      break;
    }
  }

  if (afterTabIdx === -1) {
    console.log(`  ${label}: No content after TABs`);
    return paraXml;
  }

  const leftXml = runs.slice(0, firstTabIdx).map(r => r.xml).join('');
  const tabsXml = runs.slice(firstTabIdx, afterTabIdx).map(r => r.xml).join('');
  const rightXml = runs.slice(afterTabIdx).map(r => r.xml).join('');

  console.log(`  ${label}: Left(${firstTabIdx} runs) [${runs.slice(firstTabIdx, afterTabIdx).length} tabs] Right(${runs.length - afterTabIdx} runs)`);

  // Rebuild: prefix + RIGHT + tabs + LEFT + suffix
  const prefix = paraXml.substring(0, runs[0].start);
  const suffix = paraXml.substring(runs[runs.length - 1].end);

  return prefix + rightXml + tabsXml + leftXml + suffix;
}

function verify(filepath) {
  const content = fs.readFileSync(filepath, 'binary');
  const zip = new PizZip(content);
  const xml = zip.file('word/document.xml').asText();

  // Find signature area and show content
  const lastMandante = xml.lastIndexOf('MANDANTE');
  const section = xml.substring(lastMandante);
  const runs = section.match(/<w:t[^>]*>[^<]+<\/w:t>/g);
  if (runs) {
    console.log('  Verification:');
    runs.forEach((r, i) => {
      const text = r.match(/>([^<]+)</)[1];
      if (text.trim()) console.log(`    ${i}: ${text}`);
    });
  }
}

// Process both templates
[
  '/app/plantillas/2026/CONTRATO DE MANDATO CON REPRESENTACIÓN.docx',
  '/app/plantillas/2026/PROCESO INICIALES - ORDEN DE ADQUISICIÓN VEHICULAR.docx',
].forEach(t => {
  if (fs.existsSync(t)) swapSignatures(t);
  else console.log(`Not found: ${t}`);
});
