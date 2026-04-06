const fs = require("fs");
const path = "/app/inventarios/inventarios.controller.js";
let c = fs.readFileSync(path, "utf8");
let fixes = 0;

// Fix 1: Restore getAll
const oldGetAll = `exports.getAll = async (req, res) => {
    try {
        const inventories = await Inventories.find({}).sort({ "_id": -1 }).populate("vehiculo").populate("cliente");
        res.status(200).send(inventories);
    } catch (error) {
        res.status(500).send(error);
    }
};`;

const newGetAll = `exports.getAll = async (req, res) => {
    try {
        const inventories = await Inventories.find({});
        res.status(200).send(inventories);
    } catch (error) {
        res.status(500).send(error);
    }
};`;

if (c.includes(oldGetAll)) {
  c = c.replace(oldGetAll, newGetAll);
  fixes++;
  console.log("FIX 1: getAll restaurado (sin populate, sin sort)");
} else {
  console.log("SKIP 1: getAll no encontrado con ese patron");
}

// Fix 2: Restore getInventoriesByPage
const oldByPage = `const inventories = await Inventories.find({})
            .sort({ "_id": -1 }) // Ordenar por mas reciente primero
            .populate("vehiculo")
            .populate("cliente")
            .limit(limit) // Límite de elementos por página
            .skip((page - 1) * limit); // Saltar los anteriores
        res.status(200).send(inventories); // Mantiene el formato esperado en el front
    } catch (error) {
        console.error("Error al obtener los inventarios:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
};

exports.getInventoriesByPageF`;

const newByPage = `const inventories = await Inventories.find({})
            .sort({ "estadoInventario": -1, "_id": 1 }) // Ordenar por valor de venta de mayor
            .limit(limit) // Límite de elementos por página
            .skip((page - 1) * limit); // Saltar los anteriores
        res.status(200).send(inventories); // Mantiene el formato esperado en el front
    } catch (error) {
        console.error("Error al obtener los inventarios:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
};

exports.getInventoriesByPageF`;

if (c.includes(oldByPage)) {
  c = c.replace(oldByPage, newByPage);
  fixes++;
  console.log("FIX 2: getInventoriesByPage restaurado");
} else {
  console.log("SKIP 2: getInventoriesByPage no encontrado");
}

// Fix 3: Restore getInventoriesByPageF
const oldByPageF = `const inventories = await Inventories.find({})
            .sort({ "_id": -1 }) // Ordenar por mas reciente primero
            .populate("vehiculo")
            .populate("cliente")
            .limit(limit) // Límite de elementos por página
            .skip((page - 1) * limit); // Saltar los anteriores
        res.status(200).send(inventories); // Mantiene el formato esperado en el front
    } catch (error) {
        console.error("Error al obtener los inventarios:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
};
//--fin de la creacion.`;

const newByPageF = `const inventories = await Inventories.find({})
            .limit(limit) // Límite de elementos por página
            .skip((page - 1) * limit); // Saltar los anteriores
        res.status(200).send(inventories); // Mantiene el formato esperado en el front
    } catch (error) {
        console.error("Error al obtener los inventarios:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
};
//--fin de la creacion.`;

if (c.includes(oldByPageF)) {
  c = c.replace(oldByPageF, newByPageF);
  fixes++;
  console.log("FIX 3: getInventoriesByPageF restaurado");
} else {
  console.log("SKIP 3: getInventoriesByPageF no encontrado");
}

// Also remove the unnecessary requires we added
const oldReq = `const Inventories = require('./inventarios.dao');
const PreInventories = require('../inventarioIniciales/inventarioIniciales.dao');
// Registrar modelos para populate
require('../vehiculos/vehiculos.dao');
require('../clientes/clientes.dao');`;

const newReq = `const Inventories = require('./inventarios.dao');
const PreInventories = require('../inventarioIniciales/inventarioIniciales.dao');`;

if (c.includes(oldReq)) {
  c = c.replace(oldReq, newReq);
  fixes++;
  console.log("FIX 4: requires extra removidos");
} else {
  console.log("SKIP 4: requires extra no encontrados");
}

fs.writeFileSync(path, c);
console.log("\n=== " + fixes + " restauraciones aplicadas ===");
