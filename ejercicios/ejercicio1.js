/**
 * ============================================================================
 * EJERCICIO 1: Emisión de un Título Universitario como Verifiable Credential
 * ============================================================================
 *
 * CONTEXTO:
 * La Universidad Autónoma de Santo Domingo (UASD) quiere emitir títulos
 * universitarios como Verifiable Credentials. El estudiante Pedro Martínez
 * acaba de graduarse de Ingeniería en Sistemas.
 *
 * TU TAREA:
 * 1. Crear un DID para Pedro Martínez (estudiante graduado)
 * 2. Crear un DID para la UASD (universidad emisora)
 * 3. Emitir una credencial de tipo "TituloUniversitario" con los atributos:
 *    - nombreCompleto: "Pedro Luis Martínez Sánchez"
 *    - carrera: "Ingeniería en Sistemas"
 *    - fechaGraduacion: "2025-07-15"
 *    - promedioGeneral: "3.8"
 *    - honores: "Cum Laude"
 *    - numeroMatricula: "100-XXXX-XXXX" (inventa uno)
 * 4. Registrar los DIDs y anclar la credencial en blockchain
 * 5. Imprimir la credencial y el estado de la blockchain
 *
 * PISTAS:
 * - Mira cómo se hace en src/02-emitir-credencial.js
 * - Usa las funciones crearDID() y emitirCredencial()
 * - Usa blockchain.registrarDID() y blockchain.anclarCredencial()
 *
 * PREGUNTA DE REFLEXIÓN:
 * ¿Qué ventajas tiene un título digital verificable sobre un título en papel?
 * ¿Quién debería poder revocar un título y bajo qué circunstancias?
 * ============================================================================
 */

import { crearDID } from "../src/did.js";
import { emitirCredencial } from "../src/credential.js";
import { BlockchainSimulada } from "../src/blockchain-simulator.js";

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  EJERCICIO 1: Título Universitario como Verifiable Credential║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

const blockchain = new BlockchainSimulada();

// TODO: Paso 1 - Crear DID para Pedro Martínez
// const pedro = crearDID("Pedro Martínez");
// console.log(`DID de Pedro: ${pedro.did}`);

// TODO: Paso 2 - Crear DID para la UASD
// const uasd = crearDID("UASD");
// console.log(`DID de la UASD: ${uasd.did}`);

// TODO: Paso 3 - Registrar ambos DIDs en blockchain
// blockchain.registrarDID(pedro.registroBlockchain);
// blockchain.registrarDID(uasd.registroBlockchain);

// TODO: Paso 4 - Emitir la credencial de título universitario
// const titulo = emitirCredencial(
//   uasd,           // emisor
//   pedro.did,      // titular
//   "TituloUniversitario",  // tipo
//   {
//     // Completa los atributos aquí...
//   }
// );

// TODO: Paso 5 - Anclar en blockchain
// blockchain.anclarCredencial(titulo.registroBlockchain);

// TODO: Paso 6 - Imprimir resultados
// console.log("Credencial emitida:");
// console.log(JSON.stringify(titulo.credencialVerificable, null, 2));
// blockchain.imprimirEstado();

console.log("  >> Descomenta el código y completa los TODOs para resolver el ejercicio.\n");
console.log("  PISTA: Sigue el patrón de src/02-emitir-credencial.js\n");
