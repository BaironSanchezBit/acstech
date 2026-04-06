// Add FICHA DE NEGOCIO tags to ORDEN DE COMPRA template
// Works by modifying the XML inside the .docx

var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ORDEN DE COMPRA.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

// Helper: find a label in XML and insert a tag after its closing </w:tc> and into the next cell
// The pattern in docx tables: label is in one <w:tc>, value is in the next <w:tc>

var replacements = [
  // FICHA DE NEGOCIO fields
  { label: "PRECIO PACTADO", tag: "{valorCompraNumero}" },
  { label: "SEPARACI", tag: "{separacion5porciento}" },
  { label: "VALOR CR", tag: "{valorCredito}" },
  { label: "ENTIDAD CR", tag: "{entidadCredito}" },
  { label: "FECHA DE PAGO TOTAL", tag: "{fechaEntrega}" },
  { label: "GARANTIA:", tag: "{#generadorContratos}{garantia}{/}" },
  { label: "TIEMPO GARANTIA:", tag: "{#generadorContratos}{tiempo}{/}" },
];

var changeCount = 0;

replacements.forEach(function(r) {
  // Find the label in XML
  var labelIdx = xml.indexOf(r.label);
  if (labelIdx < 0) {
    console.log("NOT FOUND: " + r.label);
    return;
  }

  // Find the cell containing the label - look for </w:tc> after the label
  var cellEnd = xml.indexOf("</w:tc>", labelIdx);
  if (cellEnd < 0) return;

  // After </w:tc> comes the next <w:tc> which is the value cell
  var nextCellStart = xml.indexOf("<w:tc>", cellEnd);
  if (nextCellStart < 0) {
    nextCellStart = xml.indexOf("<w:tc ", cellEnd);
  }
  if (nextCellStart < 0) {
    console.log("NO NEXT CELL for: " + r.label);
    return;
  }

  // Find the <w:t> inside this next cell to insert the tag
  var wtStart = xml.indexOf("<w:t", nextCellStart);
  var nextNextCell = xml.indexOf("</w:tc>", nextCellStart);

  // Check if there's already a {tag} in this cell
  var cellContent = xml.substring(nextCellStart, nextNextCell);
  if (cellContent.indexOf("{") >= 0) {
    console.log("ALREADY HAS TAG: " + r.label);
    return;
  }

  // Find the <w:t> or <w:t > tag and its closing </w:t>
  if (wtStart >= 0 && wtStart < nextNextCell) {
    // There's a <w:t> element - find closing </w:t> and put tag before it
    var wtClose = xml.indexOf("</w:t>", wtStart);
    if (wtClose >= 0 && wtClose < nextNextCell) {
      xml = xml.substring(0, wtClose) + r.tag + xml.substring(wtClose);
      changeCount++;
      console.log("ADDED: " + r.label + " -> " + r.tag);
      return;
    }
  }

  // No <w:t> found, find <w:p> inside the cell and add a run with the tag
  var wpStart = xml.indexOf("<w:p", nextCellStart);
  if (wpStart >= 0 && wpStart < nextNextCell) {
    var wpClose = xml.indexOf("</w:p>", wpStart);
    if (wpClose >= 0 && wpClose < nextNextCell) {
      var insertXml = '<w:r><w:t>' + r.tag + '</w:t></w:r>';
      xml = xml.substring(0, wpClose) + insertXml + xml.substring(wpClose);
      changeCount++;
      console.log("ADDED (new run): " + r.label + " -> " + r.tag);
      return;
    }
  }

  console.log("COULD NOT INSERT: " + r.label);
});

if (changeCount > 0) {
  zip.file("word/document.xml", xml);
  var output = zip.generate({ type: "nodebuffer" });
  fs.writeFileSync(filepath, output);
  console.log("\nTemplate guardado con " + changeCount + " tags agregados");
} else {
  console.log("\nSin cambios");
}
