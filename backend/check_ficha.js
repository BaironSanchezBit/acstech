var fs = require("fs");
var PizZip = require("pizzip");
var Docxtemplater = require("docxtemplater");
var c = fs.readFileSync("/app/plantillas/2026/ORDEN DE COMPRA.docx", "binary");
var d = new Docxtemplater(new PizZip(c), {paragraphLoop: true, linebreaks: true});
var t = d.getFullText();
var i = t.indexOf("FICHA");
if (i >= 0) {
  console.log("FICHA section:");
  console.log(t.substring(i, i + 800));
} else {
  console.log("FICHA NOT FOUND");
}

// Also list ALL tags
var tags = t.match(/\{[^}]+\}/g) || [];
console.log("\nALL TAGS:");
console.log(JSON.stringify([...new Set(tags)]));
