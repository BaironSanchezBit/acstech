const fs = require("fs");
const path = "/app/inventarios/inventarios.controller.js";
let c = fs.readFileSync(path, "utf8");

// Replace the query to only check inventories created from today onwards
const old = `const inventories = await Inventories.find({}).populate('vehiculo');
        const estadosExcluidos = ['VENDIDO', 'TERMINADO', 'DECLINADO'];`;

const fix = `// Solo notificar inventarios creados desde 2026-03-25 en adelante
        const fechaCorte = new Date('2026-03-25T00:00:00.000Z');
        const inventories = await Inventories.find({ createdAt: { $gte: fechaCorte } }).populate('vehiculo');
        const estadosExcluidos = ['VENDIDO', 'TERMINADO', 'DECLINADO'];`;

if (c.includes(old)) {
  c = c.replace(old, fix);
  fs.writeFileSync(path, c);
  console.log("OK: Solo notificará inventarios creados desde 2026-03-25");
} else {
  console.log("ERROR: Patrón no encontrado");
}
