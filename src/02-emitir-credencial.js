/**
 * PASO 2: Emisión de una Verifiable Credential
 *
 * El Registro Civil emite una credencial de identidad a María.
 * Esto simula el proceso donde una autoridad oficial certifica
 * los datos de un ciudadano en formato digital verificable.
 *
 * Conceptos clave:
 * - La credencial es firmada por el emisor (Registro Civil)
 * - Solo el hash se ancla en blockchain, NO los datos personales
 * - María recibe la credencial completa en su "wallet" (billetera digital)
 * - La credencial tiene fecha de expiración
 */

import { crearDID } from "./did.js";
import { emitirCredencial } from "./credential.js";
import { BlockchainSimulada } from "./blockchain-simulator.js";

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║  PASO 2: EMISIÓN DE CREDENCIAL VERIFICABLE             ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

// Recrear actores (en una app real, se cargarían de almacenamiento)
const maria = crearDID("María García");
const registroCivil = crearDID("Registro Civil");
const blockchain = new BlockchainSimulada();

blockchain.registrarDID(maria.registroBlockchain);
blockchain.registrarDID(registroCivil.registroBlockchain);

// --- El Registro Civil emite la credencial ---
console.log(">> El Registro Civil emite una Cédula de Identidad para María...\n");

const resultado = emitirCredencial(
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

console.log("  CREDENCIAL EMITIDA:");
console.log("  ───────────────────");
console.log(`  ID: ${resultado.credencialVerificable.id}`);
console.log(`  Tipo: ${resultado.credencialVerificable.type.join(", ")}`);
console.log(`  Emisor: ${resultado.credencialVerificable.issuer}`);
console.log(`  Titular: ${resultado.credencialVerificable.credentialSubject.id}`);
console.log(`  Emitida: ${resultado.credencialVerificable.issuanceDate}`);
console.log(`  Expira: ${resultado.credencialVerificable.expirationDate}`);

console.log("\n  DATOS EN LA CREDENCIAL (off-chain, solo María los tiene):");
console.log("  ────────────────────────────────────────────────────────");
const sujeto = resultado.credencialVerificable.credentialSubject;
for (const [clave, valor] of Object.entries(sujeto)) {
  if (clave !== "id") {
    console.log(`    ${clave}: ${valor}`);
  }
}

console.log(`\n  FIRMA DIGITAL: ${resultado.credencialVerificable.proof.proofValue.substring(0, 60)}...`);
console.log(`  Hash anclado en blockchain: ${resultado.hashCredencial.substring(0, 40)}...`);

// Anclar en blockchain
blockchain.anclarCredencial(resultado.registroBlockchain);
blockchain.imprimirEstado();

console.log("REFLEXIÓN:");
console.log("─────────");
console.log("• Los datos personales de María están SOLO en su credencial (off-chain)");
console.log("• En blockchain solo hay un hash: prueba de que se emitió algo");
console.log("• La firma del Registro Civil garantiza autenticidad");
console.log("• Nadie puede modificar la credencial sin invalidar la firma");
console.log("• María puede almacenar esta credencial en su teléfono\n");

export { maria, registroCivil, blockchain, resultado };
