/**
 * PASO 1: Creación de Identificadores Descentralizados (DIDs)
 *
 * En este paso, creamos DIDs para tres actores del sistema:
 * 1. Un ciudadano (María García) - el titular de la identidad
 * 2. El Registro Civil - la autoridad emisora de credenciales
 * 3. Una arrendadora - el verificador que necesita comprobar la identidad
 *
 * Conceptos clave:
 * - Cada actor genera su propio par de claves (pública + privada)
 * - El DID se deriva de la clave pública
 * - La clave privada NUNCA se comparte
 * - Solo el DID y la clave pública se registran en blockchain
 */

import { crearDID } from "./did.js";
import { BlockchainSimulada } from "./blockchain-simulator.js";

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║  PASO 1: CREACIÓN DE IDENTIFICADORES DESCENTRALIZADOS  ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

// Crear la blockchain simulada
const blockchain = new BlockchainSimulada();

// --- Crear DID para el ciudadano ---
console.log(">> Creando DID para María García (ciudadana)...\n");
const maria = crearDID("María García");
console.log(`  DID: ${maria.did}`);
console.log(`  Clave pública (primeros 40 chars): ${maria.claves.clavePublicaHex.substring(0, 40)}...`);
console.log(`  Clave privada: [PROTEGIDA - nunca se comparte]\n`);

// --- Crear DID para el Registro Civil ---
console.log(">> Creando DID para el Registro Civil (autoridad emisora)...\n");
const registroCivil = crearDID("Registro Civil");
console.log(`  DID: ${registroCivil.did}`);
console.log(`  Clave pública (primeros 40 chars): ${registroCivil.claves.clavePublicaHex.substring(0, 40)}...`);
console.log(`  Rol: Emisor de credenciales de identidad\n`);

// --- Crear DID para la arrendadora ---
console.log(">> Creando DID para Inmobiliaria Segura (verificador)...\n");
const arrendadora = crearDID("Inmobiliaria Segura");
console.log(`  DID: ${arrendadora.did}`);
console.log(`  Rol: Verificador de credenciales\n`);

// --- Registrar DIDs en blockchain ---
console.log(">> Registrando DIDs en blockchain...\n");
blockchain.registrarDID(maria.registroBlockchain);
blockchain.registrarDID(registroCivil.registroBlockchain);
blockchain.registrarDID(arrendadora.registroBlockchain);

console.log("  ✓ 3 DIDs registrados exitosamente en blockchain");

// Mostrar qué quedó en blockchain vs qué es privado
blockchain.imprimirEstado();

console.log("REFLEXIÓN:");
console.log("─────────");
console.log("• María controla su identidad: ella posee la clave privada");
console.log("• Nadie más puede actuar en nombre de María sin su clave privada");
console.log("• En blockchain solo hay identificadores y claves públicas");
console.log("• NO hay datos personales en blockchain (nombre, dirección, etc.)\n");

// Exportar para uso en siguientes pasos
export { maria, registroCivil, arrendadora, blockchain };
