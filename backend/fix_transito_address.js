var ExcelJS = require("exceljs");
var workbook = new ExcelJS.Workbook();

workbook.xlsx.readFile("./plantillas/PROV TRANSITO ADQUISICION.xlsx").then(function() {
  var ws = workbook.getWorksheet("Hoja1");

  // Fix address: Row 45, Col 9
  var cell = ws.getCell("I45");
  console.log("Current address:", cell.value);
  cell.value = "Calle 88a # 30-49";
  console.log("New address:", cell.value);

  return workbook.xlsx.writeFile("./plantillas/PROV TRANSITO ADQUISICION.xlsx");
}).then(function() {
  console.log("Template guardado OK");

  // Verify
  var wb2 = new ExcelJS.Workbook();
  return wb2.xlsx.readFile("./plantillas/PROV TRANSITO ADQUISICION.xlsx").then(function() {
    var ws2 = wb2.getWorksheet("Hoja1");
    console.log("Verificacion - I45:", ws2.getCell("I45").value);
  });
});
