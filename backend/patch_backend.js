// ============================================================
// Patch: Agrega campos faltantes al backend generador.controller.js
// - nombreCompletoMandante (concatenar nombre del cliente)
// - tipoIdMandatario (hardcoded "NIT")
// - direccionEmpresa (dirección de la empresa)
// ============================================================

const fs = require('fs');
const filepath = '/app/generador/generador.controller.js';

let code = fs.readFileSync(filepath, 'utf8');
let fixes = 0;

// Find the contratoMandatoRepre function and add new fields
// The function uses: const docData = { ...datos, NIT: ..., imagen: ..., soporte: ... }
// We need to add: nombreCompletoMandante, tipoIdMandatario, direccionEmpresa

// Strategy: Find where docData is built and add the new fields

// Pattern 1: Look for the spread of datos in contratoMandatoRepre
if (code.includes('contratoMandatoRepre')) {
  console.log('OK: contratoMandatoRepre encontrado');

  // Find the docData or data object construction
  // It typically looks like: const docData = { ...datos, NIT: ...
  // or: const data = { ...datos, ...

  // Add nombreCompletoMandante computation before the docData construction
  // Look for the pattern where NIT is assigned in this function

  // First, let's find the function boundaries
  const funcIdx = code.indexOf('contratoMandatoRepre');
  const funcStart = code.lastIndexOf('const ', funcIdx) || code.lastIndexOf('exports.', funcIdx);

  // Find where ...datos is spread into the doc data
  const spreadIdx = code.indexOf('...datos', funcIdx);

  if (spreadIdx !== -1) {
    console.log('OK: ...datos spread encontrado');

    // Find the line with ...datos and the object that contains it
    const lineStart = code.lastIndexOf('\n', spreadIdx);
    const objStart = code.lastIndexOf('{', spreadIdx);

    // We need to add computed fields AFTER the spread
    // Find the closing of this object or the NIT line
    const nitLine = code.indexOf('NIT:', spreadIdx);

    if (nitLine !== -1) {
      // Find what comes after NIT assignment
      const afterNit = code.indexOf('\n', nitLine);
      const nitLineText = code.substring(nitLine, afterNit);
      console.log(`NIT line: ${nitLineText.trim()}`);

      // Check if nombreCompletoMandante already exists
      if (code.includes('nombreCompletoMandante')) {
        console.log('SKIP: nombreCompletoMandante ya existe');
      } else {
        // Insert new fields after the NIT line
        const insertPoint = afterNit;
        const newFields = `
      // Campos agregados para nuevo contrato 2025
      nombreCompletoMandante: datos.cliente
        ? [datos.cliente.primerNombre, datos.cliente.segundoNombre, datos.cliente.primerApellido, datos.cliente.segundoApellido].filter(Boolean).join(' ')
        : '',
      tipoIdMandatario: 'NIT',
      direccionEmpresa: 'Calle 36 No 15-42 Bucaramanga',`;

        code = code.substring(0, insertPoint) + newFields + code.substring(insertPoint);
        fixes++;
        console.log('FIX: nombreCompletoMandante, tipoIdMandatario, direccionEmpresa agregados');
      }
    } else {
      console.log('WARNING: NIT: no encontrado, buscando alternativa...');

      // Try to find right after ...datos
      const afterSpread = code.indexOf(',', spreadIdx);
      if (afterSpread !== -1) {
        const insertPoint = afterSpread + 1;
        const newFields = `
      // Campos agregados para nuevo contrato 2025
      nombreCompletoMandante: datos.cliente
        ? [datos.cliente.primerNombre, datos.cliente.segundoNombre, datos.cliente.primerApellido, datos.cliente.segundoApellido].filter(Boolean).join(' ')
        : '',
      tipoIdMandatario: 'NIT',
      direccionEmpresa: 'Calle 36 No 15-42 Bucaramanga',`;

        code = code.substring(0, insertPoint) + newFields + code.substring(insertPoint);
        fixes++;
        console.log('FIX: campos agregados después de ...datos');
      }
    }
  } else {
    console.log('WARNING: ...datos no encontrado, mostrando contexto de la función...');
    const snippet = code.substring(funcIdx, funcIdx + 500);
    console.log(snippet);
  }
} else {
  console.log('ERROR: contratoMandatoRepre NO encontrado en el archivo');
}

if (fixes > 0) {
  // Backup
  fs.copyFileSync(filepath, filepath + '.bak.20260324');
  fs.writeFileSync(filepath, code, 'utf8');
  console.log(`\n=== Backend patch: ${fixes} cambios aplicados ===`);
} else {
  console.log('\n=== No se aplicaron cambios ===');
}
