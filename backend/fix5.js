var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

// Find actual XML around the tags
var idx1 = xml.indexOf("{#cliente}{primerNombre}");
var idx2 = xml.indexOf("{#generadorContratos}{organizacion}");

console.log("=== Buyer tag context ===");
console.log(xml.substring(idx1 - 50, idx1 + 150));
console.log("\n=== Seller tag context ===");
console.log(xml.substring(idx2 - 50, idx2 + 100));
