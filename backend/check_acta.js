var fs = require("fs");
var PizZip = require("pizzip");
var Docxtemplater = require("docxtemplater");
var c = fs.readFileSync("/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx", "binary");
var d = new Docxtemplater(new PizZip(c), {paragraphLoop: true, linebreaks: true});
var t = d.getFullText();

// Find firma/vendedor/comprador section
var idx = t.indexOf("VENDEDOR");
// Get from near the end where signatures are
var lastVendedor = t.lastIndexOf("VENDEDOR");
var lastComprador = t.lastIndexOf("COMPRADOR");
console.log("=== SIGNATURE AREA ===");
var start = Math.min(lastVendedor, lastComprador) - 100;
if (start < 0) start = 0;
console.log(t.substring(start));

console.log("\n=== ALL TAGS ===");
var tags = t.match(/\{[^}]+\}/g) || [];
console.log(JSON.stringify([...new Set(tags)]));
