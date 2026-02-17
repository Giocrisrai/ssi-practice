/**
 * ============================================================================
 * EJERCICIO 3: Revocación de Credenciales y Análisis Regulatorio
 * ============================================================================
 *
 * CONTEXTO:
 * Se descubre que una credencial de identidad fue emitida con datos falsos
 * (error administrativo o fraude). El Registro Civil necesita revocarla.
 * Además, debes analizar las implicaciones legales y regulatorias.
 *
 * TU TAREA:
 * 1. Crear el flujo completo: DID → Credencial → Presentación → Verificación
 * 2. Revocar la credencial después de la emisión
 * 3. Intentar verificar la credencial DESPUÉS de la revocación
 * 4. Comparar los resultados de verificación (antes vs después de revocar)
 * 5. Responder las preguntas regulatorias al final
 *
 * PISTAS:
 * - Usa revocarCredencial() de src/credential.js
 * - Usa blockchain.revocarCredencial() para registrar la revocación
 * - Pasa blockchain.listaRevocacion a verificarPresentacion()
 *
 * PREGUNTAS DE REFLEXIÓN REGULATORIA (IL3.4):
 * Responde estas preguntas como comentarios al final del archivo:
 *
 * 1. ¿Quién es legalmente responsable si la credencial revocada ya fue
 *    usada para firmar un contrato de arriendo?
 *
 * 2. ¿Debe el Registro Civil notificar a todos los verificadores que
 *    alguna vez vieron esa credencial? ¿Es esto compatible con la privacidad?
 *
 * 3. ¿Cumple este modelo de SSI con el "derecho al olvido" del GDPR?
 *    ¿Qué pasa si hay hashes en blockchain que no se pueden borrar?
 *
 * 4. ¿Qué mecanismos de recuperación debería tener un ciudadano si
 *    pierde acceso a su clave privada?
 *
 * 5. En el contexto de tu país, ¿qué autoridades deberían poder emitir
 *    credenciales verificables? ¿Quién las regula?
 * ============================================================================
 */

import { crearDID } from "../src/did.js";
import { emitirCredencial, revocarCredencial } from "../src/credential.js";
import { crearPresentacion } from "../src/presentation.js";
import { verificarPresentacion, imprimirReporteVerificacion } from "../src/verifier.js";
import { BlockchainSimulada } from "../src/blockchain-simulator.js";

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  EJERCICIO 3: Revocación y Análisis Regulatorio             ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

const blockchain = new BlockchainSimulada();

// TODO: Paso 1 - Crear actores (ciudadano, Registro Civil, verificador)
// ...

// TODO: Paso 2 - Emitir credencial
// ...

// TODO: Paso 3 - Crear presentación y verificar (ANTES de revocar)
// console.log("=== VERIFICACIÓN ANTES DE REVOCACIÓN ===");
// ...

// TODO: Paso 4 - Revocar la credencial
// Nota: revocarCredencial recibe el ID de la credencial (credencialVerificable.id),
// NO el hashCredencial. El verificador compara contra el ID de la credencial.
//
// const revocacion = revocarCredencial(
//   credencial.credencialVerificable.id,
//   registroCivil,
//   "Datos incorrectos - error administrativo"
// );
// blockchain.revocarCredencial(revocacion);
// console.log("Credencial revocada!");

// TODO: Paso 5 - Intentar verificar DESPUÉS de revocar
// console.log("\n=== VERIFICACIÓN DESPUÉS DE REVOCACIÓN ===");

// TODO: Paso 6 - Comparar resultados e imprimir conclusiones

console.log("  >> Descomenta el código y completa los TODOs para resolver el ejercicio.\n");
console.log("  PISTA: La clave está en pasar blockchain.listaRevocacion");
console.log("  a verificarPresentacion() y comparar antes/después.\n");
console.log("  IMPORTANTE: No olvides responder las preguntas regulatorias\n");

// ============================================================================
// TUS RESPUESTAS A LAS PREGUNTAS REGULATORIAS (completa aquí):
// ============================================================================

// PREGUNTA 1: ¿Quién es legalmente responsable si la credencial revocada
//              ya fue usada para firmar un contrato?
// TU RESPUESTA:
//

// PREGUNTA 2: ¿Debe el Registro Civil notificar a los verificadores anteriores?
// TU RESPUESTA:
//

// PREGUNTA 3: ¿Cumple SSI con el "derecho al olvido"? ¿Qué pasa con los hashes?
// TU RESPUESTA:
//

// PREGUNTA 4: ¿Qué mecanismos de recuperación debería tener un ciudadano?
// TU RESPUESTA:
//

// PREGUNTA 5: En tu país, ¿quién debería emitir y regular credenciales verificables?
// TU RESPUESTA:
//
