var fs = require("fs");
var filepath = "/app/generador/generador.controller.js";
var code = fs.readFileSync(filepath, "utf8");

// Find the data injection area in contratoMandatoRepre
// Add fichaNegocio field mapping before the dataDocument creation
var searchStr = '    const dataDocument = {\n      ...datos,\n      NIT: NIT,\n      // Campos agregados para nuevo contrato 2025';

var replacement = '    // Mapear campos del formulario fichaNegocio a los tags del template\n' +
'    if (datos.fichaNegocio) {\n' +
'      datos.fichaNegocio.liquidacionDeudaFinanciera = datos.fichaNegocio.valorCreditoPrenda || "";\n' +
'      datos.fichaNegocio.entidadDeudaFinanciera = datos.fichaNegocio.entidadCreditoPrenda || "";\n' +
'      datos.fichaNegocio.valorAnticipo = datos.fichaNegocio.valorAnticipoNegocio || "";\n' +
'    }\n' +
'    const dataDocument = {\n      ...datos,\n      NIT: NIT,\n      // Campos agregados para nuevo contrato 2025';

if (code.indexOf(searchStr) >= 0) {
  code = code.replace(searchStr, replacement);
  fs.writeFileSync(filepath, code, "utf8");
  console.log("OK: fichaNegocio field mapping added to contratoMandatoRepre");
} else {
  console.log("ERROR: Search string not found");
  // Try to find it
  var idx = code.indexOf("const dataDocument");
  if (idx >= 0) {
    console.log("Found dataDocument at char:", idx);
    console.log("Context:", code.substring(idx - 100, idx + 100));
  }
}

// Verify
var verifyCode = fs.readFileSync(filepath, "utf8");
var vIdx = verifyCode.indexOf("liquidacionDeudaFinanciera");
if (vIdx >= 0) {
  console.log("\nVerification - mapping found at char:", vIdx);
  console.log(verifyCode.substring(vIdx - 50, vIdx + 200));
}
