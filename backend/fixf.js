var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

// Exact XML strings to swap
var buyerTagXml = '<w:t>{#cliente}{primerNombre} {segundoNombre} {primerApellido} {segundoApellido}{/}</w:t>';
var sellerTagXml = '<w:t>{#generadorContratos}{organizacion}{/}</w:t>';

var PH1 = '<w:t>###PH_BUYER###</w:t>';
var PH2 = '<w:t>###PH_SELLER###</w:t>';

xml = xml.replace(buyerTagXml, PH1);
xml = xml.replace(sellerTagXml, PH2);

xml = xml.replace(PH1, sellerTagXml);
xml = xml.replace(PH2, buyerTagXml);

console.log("Name tags swapped");

// Save
zip.file("word/document.xml", xml);
var output = zip.generate({ type: "nodebuffer" });
fs.writeFileSync(filepath, output);

// Verify
var Docxtemplater = require("docxtemplater");
var zip2 = new PizZip(fs.readFileSync(filepath, "binary"));
var d = new Docxtemplater(zip2, {paragraphLoop: true, linebreaks: true});
var t = d.getFullText();
var lastV = t.lastIndexOf("VENDEDOR");
console.log("\nVerificacion:");
console.log(t.substring(lastV));
