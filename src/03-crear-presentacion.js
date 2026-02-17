/**
 * PASO 3: Creación de una Verifiable Presentation (Divulgación Selectiva)
 *
 * María quiere arrendar un apartamento. La arrendadora necesita verificar
 * su identidad, pero María NO quiere revelar TODOS sus datos.
 *
 * Con SSI, María puede:
 * - Compartir solo su nombre y nacionalidad
 * - OCULTAR su fecha de nacimiento, dirección actual, estado civil, etc.
 * - Controlar exactamente qué información ve la arrendadora
 *
 * Esto es DIVULGACIÓN SELECTIVA: el corazón de la privacidad en SSI.
 */

import { crearDID } from "./did.js";
import { emitirCredencial } from "./credential.js";
import { crearPresentacion, listarAtributosDisponibles } from "./presentation.js";
import { BlockchainSimulada } from "./blockchain-simulator.js";

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║  PASO 3: PRESENTACIÓN VERIFICABLE (DIVULGACIÓN SELECT.) ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

// Recrear el escenario completo
const maria = crearDID("María García");
const registroCivil = crearDID("Registro Civil");
const arrendadora = crearDID("Inmobiliaria Segura");
const blockchain = new BlockchainSimulada();

blockchain.registrarDID(maria.registroBlockchain);
blockchain.registrarDID(registroCivil.registroBlockchain);
blockchain.registrarDID(arrendadora.registroBlockchain);

const { credencialVerificable } = emitirCredencial(
  registroCivil,
  maria.did,
  "CedulaDeIdentidad",
  {
    nombreCompleto: "María Elena García Rodríguez",
    fechaNacimiento: "1990-03-15",
    nacionalidad: "Dominicana",
    numeroCedula: "001-1234567-8",
    direccion: "Calle Las Flores 42, Santo Domingo",
    estadoCivil: "Soltera",
    sexo: "Femenino",
  }
);

// --- María decide qué compartir ---
console.log(">> ESCENARIO: María solicita arrendar un apartamento\n");
console.log("  La arrendadora necesita verificar la identidad de María.");
console.log("  María decide qué información revelar:\n");

const todosLosAtributos = listarAtributosDisponibles(credencialVerificable);
console.log("  Atributos disponibles en la credencial:");
todosLosAtributos.forEach((attr) => console.log(`    - ${attr}`));

// María elige revelar solo nombre, nacionalidad y cédula
const atributosARevelar = ["nombreCompleto", "nacionalidad", "numeroCedula"];

console.log("\n  María ELIGE revelar:");
atributosARevelar.forEach((attr) => console.log(`    ✓ ${attr}`));

const atributosOcultos = todosLosAtributos.filter(
  (a) => !atributosARevelar.includes(a)
);
console.log("\n  María OCULTA:");
atributosOcultos.forEach((attr) => console.log(`    ✗ ${attr}`));

// --- Crear la presentación ---
console.log("\n>> Generando Verifiable Presentation...\n");

const presentacion = crearPresentacion(
  maria,
  credencialVerificable,
  atributosARevelar,
  arrendadora.did,
  "Solicitud de arriendo de apartamento"
);

console.log("  PRESENTACIÓN GENERADA:");
console.log("  ──────────────────────");
console.log(`  Titular: ${presentacion.holder}`);
console.log(`  Destinatario: ${presentacion.destinatario}`);
console.log(`  Propósito: ${presentacion.proposito}`);
console.log(`  Challenge (anti-replay): ${presentacion.challenge}`);

console.log("\n  DATOS QUE VE LA ARRENDADORA:");
console.log("  ────────────────────────────");
const credDerivada = presentacion.verifiableCredential[0];
for (const [clave, valor] of Object.entries(credDerivada.credentialSubject)) {
  if (clave !== "id") {
    const revelado = atributosARevelar.includes(clave);
    console.log(`    ${revelado ? "👁 " : "🔒"} ${clave}: ${valor}`);
  }
}

console.log("\nREFLEXIÓN:");
console.log("─────────");
console.log("• María comparte SOLO lo necesario para arrendar");
console.log("• La arrendadora NO ve la fecha de nacimiento ni dirección actual");
console.log("• Los datos ocultos se reemplazan por hashes (prueba de existencia)");
console.log("• La presentación va firmada por María (ella autorizó compartir)");
console.log("• La credencial original va firmada por el Registro Civil (autenticidad)");
console.log("• NADA de esto pasa por blockchain (es peer-to-peer)\n");

export { maria, registroCivil, arrendadora, blockchain, presentacion };
