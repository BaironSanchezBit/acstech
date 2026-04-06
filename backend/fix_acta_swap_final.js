var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

// Current state:
// NOMBRE EMPRESA (VENDEDOR) -> {#cliente}{primerNombre}...{/}  (WRONG - buyer tag)
// NOMBRE COMPLETO (COMPRADOR) -> {#generadorContratos}{organizacion}{/} (WRONG - seller tag)
//
// Need to swap so:
// NOMBRE EMPRESA (VENDEDOR) -> {#generadorContratos}{organizacion}{/}  (seller tag - CORRECT)
// NOMBRE COMPLETO (COMPRADOR) -> {#cliente}{primerNombre}...{/}  (buyer tag - CORRECT)

// Find position of NOMBRE EMPRESA label
var nePos = xml.lastIndexOf("NOMBRE EMPRESA");
// Find position of NOMBRE COMPLETO label
var ncPos = xml.lastIndexOf("NOMBRE COMPLETO");

console.log("NOMBRE EMPRESA at:", nePos);
console.log("NOMBRE COMPLETO at:", ncPos);

// Extract the XML region after each label to find the exact <w:t> containing the tags
// Look for the first <w:t> containing {# after each label

function findTagWt(xml, startPos, maxSearch) {
  // Search forward from startPos for <w:t> elements containing template tags
  var searchRegion = xml.substring(startPos, startPos + maxSearch);
  // Find <w:t>...{#...}...{/}...</w:t> pattern
  var match = searchRegion.match(/<w:t[^>]*>\{#[^}]+\}[^<]*\{\/\}<\/w:t>/);
  if (match) {
    return {
      text: match[0],
      offset: startPos + searchRegion.indexOf(match[0])
    };
  }
  return null;
}

var vendedorTag = findTagWt(xml, nePos, 2000);
var compradorTag = findTagWt(xml, ncPos, 2000);

if (!vendedorTag) {
  console.log("ERROR: No encontre tag template despues de NOMBRE EMPRESA");
  process.exit(1);
}
if (!compradorTag) {
  console.log("ERROR: No encontre tag template despues de NOMBRE COMPLETO");
  process.exit(1);
}

console.log("\nVENDEDOR tag found:", vendedorTag.text);
console.log("at offset:", vendedorTag.offset);
console.log("\nCOMPRADOR tag found:", compradorTag.text);
console.log("at offset:", compradorTag.offset);

// Now swap them using positional replacement (replace from end first to preserve offsets)
var newXml;
if (vendedorTag.offset > compradorTag.offset) {
  // vendedor comes after comprador - replace vendedor first
  newXml = xml.substring(0, vendedorTag.offset) + compradorTag.text + xml.substring(vendedorTag.offset + vendedorTag.text.length);
  newXml = newXml.substring(0, compradorTag.offset) + vendedorTag.text + newXml.substring(compradorTag.offset + compradorTag.text.length);
} else {
  // comprador comes after vendedor - replace comprador first
  newXml = xml.substring(0, compradorTag.offset) + vendedorTag.text + xml.substring(compradorTag.offset + compradorTag.text.length);
  newXml = newXml.substring(0, vendedorTag.offset) + compradorTag.text + newXml.substring(vendedorTag.offset + vendedorTag.text.length);
}

console.log("\nTags swapped!");

// Save
zip.file("word/document.xml", newXml);
var output = zip.generate({ type: "nodebuffer" });
fs.writeFileSync(filepath, output);
console.log("Template guardado");

// Verify
var Docxtemplater = require("docxtemplater");
var zip2 = new PizZip(fs.readFileSync(filepath, "binary"));
var d = new Docxtemplater(zip2, {paragraphLoop: true, linebreaks: true});
var t = d.getFullText();
var lastV = t.lastIndexOf("VENDEDOR");
console.log("\nVerificacion final:");
console.log(t.substring(lastV));
