// Add bold to signature name/ID runs in both templates
const fs = require('fs');
const PizZip = require('pizzip');

function boldSignatures(filepath) {
  console.log(`\nProcesando: ${filepath.split('/').pop()}`);

  const content = fs.readFileSync(filepath, 'binary');
  const zip = new PizZip(content);
  let xml = zip.file('word/document.xml').asText();

  // Find signature paragraphs (name + ID)
  const paraStarts = [];
  let sf = 0;
  while (true) {
    const idx = xml.indexOf('<w:p ', sf);
    if (idx === -1) break;
    paraStarts.push(idx);
    sf = idx + 1;
  }

  let targets = [];
  for (let i = paraStarts.length - 1; i >= 0; i--) {
    const start = paraStarts[i];
    const end = xml.indexOf('</w:p>', start) + 6;
    const para = xml.substring(start, end);
    const text = para.replace(/<[^>]+>/g, '');

    if (text.includes('generadorContratos') && text.includes('cliente}{')) {
      targets.push({ start, end, label: 'names' });
    }
    if (text.includes('idFormated') && text.includes('NIT')) {
      targets.push({ start, end, label: 'ids' });
    }
    if (targets.length >= 2) break;
  }

  // Sort by position descending so replacements don't shift positions
  targets.sort((a, b) => b.start - a.start);

  for (const t of targets) {
    const para = xml.substring(t.start, t.end);
    const newPara = addBoldToRuns(para);
    if (newPara !== para) {
      xml = xml.substring(0, t.start) + newPara + xml.substring(t.end);
      console.log(`  ${t.label}: bold added`);
    }
  }

  zip.file('word/document.xml', xml);
  fs.writeFileSync(filepath, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('  Saved!');
}

function addBoldToRuns(paraXml) {
  // Add <w:b/> to every <w:r> that has text content (skip pure tab runs)
  return paraXml.replace(/<w:r([ >])([\s\S]*?)<\/w:r>/g, (match, after, inner) => {
    const hasText = /<w:t[^>]*>[^<]+<\/w:t>/.test(match);
    const isPureTab = match.includes('<w:tab') && !hasText;
    if (isPureTab) return match; // Don't bold pure tab runs

    // Check if already has <w:rPr> with <w:b/>
    if (match.includes('<w:b/>') || match.includes('<w:b ')) return match;

    // If has <w:rPr>, add <w:b/> inside it
    if (match.includes('<w:rPr>')) {
      return match.replace('<w:rPr>', '<w:rPr><w:b/>');
    }
    // If has <w:rPr ...>, add <w:b/> after the closing >
    if (match.includes('<w:rPr')) {
      return match.replace(/(<w:rPr[^>]*>)/, '$1<w:b/>');
    }
    // No rPr exists - add one after <w:r> or <w:r ...>
    return match.replace(/(<w:r[ >])/, '$1<w:rPr><w:b/></w:rPr>');
  });
}

[
  '/app/plantillas/2026/CONTRATO DE MANDATO CON REPRESENTACIÓN.docx',
  '/app/plantillas/2026/PROCESO INICIALES - ORDEN DE ADQUISICIÓN VEHICULAR.docx',
].forEach(t => {
  if (fs.existsSync(t)) boldSignatures(t);
  else console.log(`Not found: ${t}`);
});
