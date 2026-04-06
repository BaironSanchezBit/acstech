var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

// Current state (from previous fix attempt - labels swapped but tags didn't swap):
// VENDEDOR: NOMBRE EMPRESA {#cliente}{primerNombre}...{/}  + NIT {NIT}
// COMPRADOR: NOMBRE COMPLETO {#generadorContratos}{organizacion}{/} + ID {idFormated}
//
// Need to swap just the tags now:
// VENDEDOR: NOMBRE EMPRESA {#generadorContratos}{organizacion}{/} + NIT {NIT}  ← NIT already correct
// COMPRADOR: NOMBRE COMPLETO {#cliente}{primerNombre}...{/} + ID {idFormated}  ← ID already correct

// So only the name tags need swapping
var buyerTag = '{#cliente}{primerNombre} {segundoNombre} {primerApellido} {segundoApellido}{/}';
var sellerTag = '{#generadorContratos}{organizacion}{/}';

var PH1 = '###BUYER_NAME_PH###';
var PH2 = '###SELLER_NAME_PH###';

// Replace with placeholders
xml = xml.replace(buyerTag, PH1);
xml = xml.replace(sellerTag, PH2);

// Swap
xml = xml.replace(PH1, sellerTag);  // Where buyer was (VENDEDOR), put seller tag
xml = xml.replace(PH2, buyerTag);   // Where seller was (COMPRADOR), put buyer tag

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
