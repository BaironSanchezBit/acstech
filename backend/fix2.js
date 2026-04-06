var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

// Show XML around signature area
var ncIdx = xml.lastIndexOf("NOMBRE COMPLETO");
var neIdx = xml.lastIndexOf("NOMBRE EMPRESA");
var idIdx = xml.lastIndexOf(">ID ");
var nitIdx = xml.lastIndexOf("NIT ");

console.log("=== Around NOMBRE COMPLETO (pos " + ncIdx + ") ===");
console.log(xml.substring(ncIdx - 200, ncIdx + 300));
console.log("\n=== Around NOMBRE EMPRESA (pos " + neIdx + ") ===");
console.log(xml.substring(neIdx - 200, neIdx + 300));
console.log("\n=== Around ID (pos " + idIdx + ") ===");
console.log(xml.substring(idIdx - 100, idIdx + 300));
console.log("\n=== Around NIT (pos " + nitIdx + ") ===");
console.log(xml.substring(nitIdx - 100, nitIdx + 300));
