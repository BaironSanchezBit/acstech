require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_MONGO).then(async () => {
  const db = mongoose.connection.db;

  // Check both collections
  const inventarios = await db.collection('inventarios').countDocuments();
  const inventories = await db.collection('inventories').countDocuments();
  console.log("inventarios:", inventarios, "docs");
  console.log("inventories:", inventories, "docs");

  // Check how the model maps
  const schema = require("./inventarios/inventarios.model");
  // Check if schema has collection option
  console.log("\nSchema collection option:", schema.options && schema.options.collection);

  // Check what collection name mongoose would use
  // When you do mongoose.model("Inventario", schema) -> collection = "inventarios"
  // When you do mongoose.model("Inventories", schema) -> collection = "inventories"

  // Search for how the model is registered in the app
  const fs = require('fs');
  const files = fs.readdirSync('/app/inventarios/');
  console.log("\nFiles in /app/inventarios/:", files.join(", "));

  // Check routes file for model registration
  const routesFiles = [
    '/app/inventarios/inventarios.routes.js',
    '/app/inventarios/inventarios.controller.js',
    '/app/server.js',
    '/app/app.js'
  ];

  for (const f of routesFiles) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      // Look for mongoose.model calls
      const modelMatches = content.match(/mongoose\.model\s*\(\s*['"]([^'"]+)['"]/g);
      if (modelMatches) {
        console.log(f + " -> model calls:", modelMatches.join(", "));
      }
      // Look for require of model
      const reqMatches = content.match(/require.*model/gi);
      if (reqMatches) {
        console.log(f + " -> requires:", reqMatches.join(", "));
      }
    }
  }

  // Check controller first line for model import
  if (fs.existsSync('/app/inventarios/inventarios.controller.js')) {
    const ctrl = fs.readFileSync('/app/inventarios/inventarios.controller.js', 'utf8');
    const lines = ctrl.split('\n').slice(0, 15);
    console.log("\nController first 15 lines:");
    lines.forEach((l, i) => console.log((i+1) + ": " + l));
  }

  // Check if inventories collection has any indexes (sign it was intentionally created)
  const indexes = await db.collection('inventories').indexes();
  console.log("\ninventories indexes:", JSON.stringify(indexes));

  mongoose.disconnect();
});
