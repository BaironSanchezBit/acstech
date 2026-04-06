const fs = require("fs");
const path = "/app/inventarios/inventarios.controller.js";
let c = fs.readFileSync(path, "utf8");

const old = `const Inventories = require('./inventarios.dao');
const PreInventories = require('../inventarioIniciales/inventarioIniciales.dao');`;

const fix = `const Inventories = require('./inventarios.dao');
const PreInventories = require('../inventarioIniciales/inventarioIniciales.dao');
// Registrar modelos para populate
require('../vehiculos/vehiculos.dao');
require('../clientes/clientes.dao');`;

if (c.includes(old)) {
  c = c.replace(old, fix);
  fs.writeFileSync(path, c);
  console.log("OK: Agregados requires de vehiculos.dao y clientes.dao para populate");
} else {
  console.log("ERROR: Patrón no encontrado");
  // Check if already added
  if (c.includes("require('../vehiculos/vehiculos.dao')")) {
    console.log("Ya están agregados");
  }
}
