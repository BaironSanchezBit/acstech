var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

// The signature area has tags in wrong positions
// VENDEDOR side has buyer data, COMPRADOR side has seller data
// We need to swap them

// Strategy: Find the signature tags and swap their content
// The text "NOMBRE COMPLETO" followed by buyer tags should be under COMPRADOR
// The text "NOMBRE EMPRESA" followed by seller tags should be under VENDEDOR

// Let's find and swap the content in the XML

// Find "NOMBRE COMPLETO" near the signature area (last occurrence)
var ncIdx = xml.lastIndexOf("NOMBRE COMPLETO");
var neIdx = xml.lastIndexOf("NOMBRE EMPRESA");

if (ncIdx < 0 || neIdx < 0) {
  console.log("ERROR: Could not find signature labels");
  process.exit(1);
}

console.log("Found NOMBRE COMPLETO at:", ncIdx);
console.log("Found NOMBRE EMPRESA at:", neIdx);

// The tags after NOMBRE COMPLETO (buyer name) should go to COMPRADOR side
// The tags after NOMBRE EMPRESA (org name) should go to VENDEDOR side

// Find the w:tc (table cell) containing each
function findCellBounds(xml, pos) {
  // Find the <w:tc that contains this position
  var tcStart = xml.lastIndexOf("<w:tc", pos);
  if (tcStart < 0) tcStart = xml.lastIndexOf("<w:tc ", pos);
  var tcEnd = xml.indexOf("</w:tc>", pos);
  if (tcEnd >= 0) tcEnd += "</w:tc>".length;
  return { start: tcStart, end: tcEnd };
}

var ncCell = findCellBounds(xml, ncIdx);
var neCell = findCellBounds(xml, neIdx);

console.log("NOMBRE COMPLETO cell:", ncCell.start, "-", ncCell.end);
console.log("NOMBRE EMPRESA cell:", neCell.start, "-", neCell.end);

if (ncCell.start < 0 || ncCell.end < 0 || neCell.start < 0 || neCell.end < 0) {
  console.log("ERROR: Could not find cell boundaries");
  process.exit(1);
}

// Extract both cells
var ncCellContent = xml.substring(ncCell.start, ncCell.end);
var neCellContent = xml.substring(neCell.start, neCell.end);

console.log("\nNC cell has cliente tags:", ncCellContent.indexOf("cliente") >= 0);
console.log("NE cell has generadorContratos tags:", neCellContent.indexOf("generadorContratos") >= 0);

// Swap the cells
// We need to be careful about order - replace the later one first
if (ncCell.start < neCell.start) {
  // NC comes first, NE comes second
  xml = xml.substring(0, neCell.start) + ncCellContent + xml.substring(neCell.end);
  xml = xml.substring(0, ncCell.start) + neCellContent + xml.substring(ncCell.end);
} else {
  // NE comes first, NC comes second
  xml = xml.substring(0, ncCell.start) + neCellContent + xml.substring(ncCell.end);
  xml = xml.substring(0, neCell.start) + ncCellContent + xml.substring(neCell.end);
}

// Now also swap the ID/NIT row
// Find "ID " tag (last occurrence near signatures) and "NIT " tag
var idIdx = xml.lastIndexOf(">ID ");
var nitIdx = xml.lastIndexOf(">NIT ");

if (idIdx >= 0 && nitIdx >= 0) {
  var idCell2 = findCellBounds(xml, idIdx);
  var nitCell2 = findCellBounds(xml, nitIdx);

  console.log("\nID cell:", idCell2.start, "-", idCell2.end);
  console.log("NIT cell:", nitCell2.start, "-", nitCell2.end);

  var idCellContent = xml.substring(idCell2.start, idCell2.end);
  var nitCellContent = xml.substring(nitCell2.start, nitCell2.end);

  if (idCell2.start < nitCell2.start) {
    xml = xml.substring(0, nitCell2.start) + idCellContent + xml.substring(nitCell2.end);
    xml = xml.substring(0, idCell2.start) + nitCellContent + xml.substring(idCell2.end);
  } else {
    xml = xml.substring(0, idCell2.start) + nitCellContent + xml.substring(idCell2.end);
    xml = xml.substring(0, nitCell2.start) + idCellContent + xml.substring(nitCell2.end);
  }
  console.log("ID/NIT cells swapped");
}

// Save
zip.file("word/document.xml", xml);
var output = zip.generate({ type: "nodebuffer" });
fs.writeFileSync(filepath, output);
console.log("\nTemplate guardado con firmas corregidas");

// Verify
var zip2 = new PizZip(fs.readFileSync(filepath, "binary"));
var Docxtemplater = require("docxtemplater");
var d = new Docxtemplater(zip2, {paragraphLoop: true, linebreaks: true});
var t = d.getFullText();
var lastV = t.lastIndexOf("VENDEDOR");
console.log("\nVerificacion:");
console.log(t.substring(lastV));
