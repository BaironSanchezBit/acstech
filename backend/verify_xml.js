var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

var ne = xml.lastIndexOf("NOMBRE EMPRESA");
var nc = xml.lastIndexOf("NOMBRE COMPLETO");

console.log("NOMBRE EMPRESA at pos:", ne);
console.log("NOMBRE COMPLETO at pos:", nc);
console.log("EMPRESA comes first?", ne < nc);

// Show what tag follows each label
var afterNE = xml.substring(ne, ne + 500);
var afterNC = xml.substring(nc, nc + 500);

var neTagMatch = afterNE.match(/\{[#/]?[^}]+\}/g);
var ncTagMatch = afterNC.match(/\{[#/]?[^}]+\}/g);

console.log("\nAfter NOMBRE EMPRESA, tags:", neTagMatch ? neTagMatch.slice(0, 6) : "none");
console.log("After NOMBRE COMPLETO, tags:", ncTagMatch ? ncTagMatch.slice(0, 6) : "none");
