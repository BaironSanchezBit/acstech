const fs = require('fs');
const filepath = '/app/generador/generador.controller.js';

// Backup
const content = fs.readFileSync(filepath, 'utf8');
fs.writeFileSync(filepath + '.bak.20260323', content, 'utf8');
console.log('Backup creado:', filepath + '.bak.20260323');

let modified = content;
let fixes = 0;

// PATCH 1: Add dot-notation parser to ALL Docxtemplater instances
const oldDocx = `  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOptions)],
  });`;

const newDocx = `  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOptions)],
    parser: function(tag) {
      return {
        get: function(scope) {
          if (tag === '.') return scope;
          return tag.split('.').reduce(function(obj, key) { return (obj != null) ? obj[key] : ''; }, scope) || '';
        }
      };
    },
  });`;

while (modified.includes(oldDocx)) {
  modified = modified.replace(oldDocx, newDocx);
  fixes++;
}

if (fixes > 0) {
  console.log(`PATCH 1: Parser dot-notation agregado a ${fixes} instancia(s) de Docxtemplater OK`);
} else {
  console.log('PATCH 1: SKIP - patron no encontrado, buscando alternativa...');
  // Show what's actually there for debugging
  const idx = modified.indexOf('new Docxtemplater');
  if (idx >= 0) {
    console.log('Encontrado "new Docxtemplater" en posicion', idx);
    console.log('Contexto:', modified.substring(idx, idx + 200));
  }
}

fs.writeFileSync(filepath, modified, 'utf8');
console.log(`\n=== Bloque 9C completado: ${fixes} patches aplicados ===`);
