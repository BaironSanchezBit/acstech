// Swap firma positions in CONTRATO DE MANDATO and PROCESO INICIALES
const fs = require('fs');
const PizZip = require('pizzip');

function swapSignatures(filepath) {
  console.log(`\nProcesando: ${filepath.split('/').pop()}`);

  const content = fs.readFileSync(filepath, 'binary');
  const zip = new PizZip(content);
  let xml = zip.file('word/document.xml').asText();
  const original = xml;

  // Strategy: Find the signature paragraph that contains both {#cliente} and {#generadorContratos}
  // and the paragraph with ID/NIT. Then swap the <w:r> groups before and after the TAB runs.

  // Split into paragraphs
  const paragraphs = xml.split(/(<w:p[ >])/);

  let nameParaIdx = -1;
  let idParaIdx = -1;

  // Reconstruct paragraphs properly
  const fullParas = [];
  let current = paragraphs[0]; // before first <w:p
  for (let i = 1; i < paragraphs.length; i += 2) {
    const paraStart = paragraphs[i]; // <w:p  or <w:p>
    const paraContent = paragraphs[i + 1] || '';
    // Find end of this paragraph
    const endIdx = paraContent.indexOf('</w:p>');
    if (endIdx !== -1) {
      fullParas.push({
        pre: current,
        xml: paraStart + paraContent.substring(0, endIdx + 6),
        idx: fullParas.length
      });
      current = paraContent.substring(endIdx + 6);
    } else {
      current += paraStart + paraContent;
    }
  }

  // Find paragraphs with signature content
  for (const para of fullParas) {
    const text = para.xml.replace(/<[^>]+>/g, '');
    if (text.includes('{#cliente}') && text.includes('{#generadorContratos}')) {
      nameParaIdx = para.idx;
    }
    if (text.includes('idFormated') && text.includes('NIT')) {
      idParaIdx = para.idx;
    }
  }

  if (nameParaIdx === -1) {
    // Could be in same paragraph
    for (const para of fullParas) {
      const text = para.xml.replace(/<[^>]+>/g, '');
      if (text.includes('{#cliente}') || text.includes('cliente}{')) {
        console.log('  Found cliente in para:', para.idx, text.substring(0, 100));
      }
    }
  }

  console.log(`  Name paragraph: ${nameParaIdx}, ID paragraph: ${idParaIdx}`);

  // For the name paragraph, swap the <w:r> groups
  if (nameParaIdx >= 0) {
    let paraXml = fullParas[nameParaIdx].xml;

    // Extract all <w:r>...</w:r> elements
    const runs = [];
    const runRegex = /<w:r[ >].*?<\/w:r>/gs;
    let match;
    while ((match = runRegex.exec(paraXml)) !== null) {
      const isTab = match[0].includes('<w:tab');
      const textMatch = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
      runs.push({
        xml: match[0],
        start: match.index,
        end: match.index + match[0].length,
        isTab: isTab,
        text: textMatch ? textMatch[1] : (isTab ? '[TAB]' : '')
      });
    }

    // Find the TAB boundary that separates left from right in the name section
    // Left name: from start to first TAB
    // Right name: from after last TAB before ID section to ID section
    let firstTabIdx = runs.findIndex(r => r.isTab);
    let afterTabIdx = -1;
    for (let i = firstTabIdx; i < runs.length; i++) {
      if (!runs[i].isTab && runs[i].text !== '') {
        afterTabIdx = i;
        break;
      }
    }

    if (firstTabIdx >= 0 && afterTabIdx >= 0) {
      // Left group: runs 0 to firstTabIdx-1
      // Tab group: runs firstTabIdx to afterTabIdx-1
      // Right group: runs afterTabIdx to end

      const leftRuns = runs.slice(0, firstTabIdx).map(r => r.xml).join('');
      const tabRuns = runs.slice(firstTabIdx, afterTabIdx).map(r => r.xml).join('');
      const rightRuns = runs.slice(afterTabIdx).map(r => r.xml).join('');

      console.log(`  Name swap: Left(${firstTabIdx} runs) <-> Right(${runs.length - afterTabIdx} runs)`);

      // Rebuild paragraph: right + tabs + left (swap!)
      const paraPrefix = paraXml.substring(0, runs[0].start);
      const paraSuffix = paraXml.substring(runs[runs.length - 1].end);

      const newParaXml = paraPrefix + rightRuns + tabRuns + leftRuns + paraSuffix;
      fullParas[nameParaIdx].xml = newParaXml;
    }
  }

  if (idParaIdx >= 0 && idParaIdx !== nameParaIdx) {
    let paraXml = fullParas[idParaIdx].xml;

    const runs = [];
    const runRegex = /<w:r[ >].*?<\/w:r>/gs;
    let match;
    while ((match = runRegex.exec(paraXml)) !== null) {
      const isTab = match[0].includes('<w:tab');
      const textMatch = match[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
      runs.push({
        xml: match[0],
        start: match.index,
        end: match.index + match[0].length,
        isTab: isTab,
        text: textMatch ? textMatch[1] : (isTab ? '[TAB]' : '')
      });
    }

    let firstTabIdx = runs.findIndex(r => r.isTab);
    let afterTabIdx = -1;
    for (let i = firstTabIdx; i < runs.length; i++) {
      if (!runs[i].isTab && runs[i].text !== '') {
        afterTabIdx = i;
        break;
      }
    }

    if (firstTabIdx >= 0 && afterTabIdx >= 0) {
      const leftRuns = runs.slice(0, firstTabIdx).map(r => r.xml).join('');
      const tabRuns = runs.slice(firstTabIdx, afterTabIdx).map(r => r.xml).join('');
      const rightRuns = runs.slice(afterTabIdx).map(r => r.xml).join('');

      console.log(`  ID swap: Left(${firstTabIdx} runs) <-> Right(${runs.length - afterTabIdx} runs)`);

      const paraPrefix = paraXml.substring(0, runs[0].start);
      const paraSuffix = paraXml.substring(runs[runs.length - 1].end);

      const newParaXml = paraPrefix + rightRuns + tabRuns + leftRuns + paraSuffix;
      fullParas[idParaIdx].xml = newParaXml;
    }
  } else if (idParaIdx === nameParaIdx && nameParaIdx >= 0) {
    // Name and ID are in the same paragraph - already handled above
    // The entire block was swapped
    console.log('  Name and ID are in same paragraph - both swapped');
  }

  // Rebuild the XML
  let newXml = '';
  for (const para of fullParas) {
    newXml += para.pre + para.xml;
  }
  newXml += current; // remaining content after last paragraph (not used above, use original trailing)

  // Actually rebuild properly from the modified paragraphs
  // Replace in original XML
  if (nameParaIdx >= 0) {
    // Find and replace the specific paragraphs
    const origNamePara = fullParas[nameParaIdx];
    // We need to find the original paragraph in the xml and replace it
  }

  // Simpler approach: rebuild entire xml from parts
  let rebuilt = fullParas[0].pre;
  for (const para of fullParas) {
    rebuilt += para.xml;
    // Need to include content between paragraphs
  }

  // Even simpler: just do targeted replacement of the two paragraphs
  // Find the original name paragraph in original xml
  if (nameParaIdx >= 0) {
    // Get runs from original paragraph
    let origPara = extractParagraphByContent(original, '{#cliente}');
    let newPara = fullParas[nameParaIdx].xml;
    if (origPara) {
      xml = xml.replace(origPara, newPara);
      console.log('  Replaced name paragraph');
    }
  }

  if (idParaIdx >= 0 && idParaIdx !== nameParaIdx) {
    let origPara = extractParagraphByContent(xml, 'idFormated');
    if (origPara && origPara.includes('NIT')) {
      let newPara = fullParas[idParaIdx].xml;
      xml = xml.replace(origPara, newPara);
      console.log('  Replaced ID paragraph');
    }
  }

  if (xml === original) {
    console.log('  WARNING: No changes made!');
    return;
  }

  // Save
  zip.file('word/document.xml', xml);
  const output = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(filepath, output);
  console.log('  Saved!');

  // Verify
  const verifyZip = new PizZip(fs.readFileSync(filepath, 'binary'));
  const verifyXml = verifyZip.file('word/document.xml').asText();
  const verifyRuns = [];
  const pos = Math.max(verifyXml.lastIndexOf('MANDANTE'), verifyXml.lastIndexOf('FIRMA'));
  const sigSection = verifyXml.substring(pos - 500);
  const runMatches = sigSection.match(/<w:t[^>]*>[^<]+<\/w:t>/g);
  if (runMatches) {
    console.log('  Verification - signature runs:');
    runMatches.forEach((r, i) => {
      const text = r.match(/>([^<]+)</)[1];
      if (text.trim()) console.log(`    ${i}: ${text}`);
    });
  }
}

function extractParagraphByContent(xml, searchText) {
  // Find a <w:p ...>...</w:p> that contains the search text
  const regex = /<w:p[ >][^]*?<\/w:p>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[0].includes(searchText)) {
      return match[0];
    }
  }
  return null;
}

// Process both templates
const templates = [
  '/app/plantillas/2026/CONTRATO DE MANDATO CON REPRESENTACIÓN.docx',
  '/app/plantillas/2026/PROCESO INICIALES - ORDEN DE ADQUISICIÓN VEHICULAR.docx',
];

templates.forEach(t => {
  if (fs.existsSync(t)) {
    swapSignatures(t);
  } else {
    console.log(`Not found: ${t}`);
  }
});
