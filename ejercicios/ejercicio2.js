/**
 * ============================================================================
 * EJERCICIO 2: Presentación Selectiva para Solicitar un Empleo
 * ============================================================================
 *
 * CONTEXTO:
 * Pedro Martínez (del ejercicio 1) quiere aplicar a un empleo en una empresa
 * de tecnología. La empresa necesita verificar que Pedro tiene un título
 * universitario en un área relevante, pero NO necesita ver todos sus datos.
 *
 * TU TAREA:
 * 1. Crear DIDs para Pedro, la UASD y la empresa TechCorp
 * 2. Emitir el título universitario (reutiliza el código del ejercicio 1)
 * 3. Crear una Verifiable Presentation donde Pedro revele SOLO:
 *    - nombreCompleto
 *    - carrera
 *    - honores
 *    (Ocultando: fechaGraduacion, promedioGeneral, numeroMatricula)
 * 4. Verificar la presentación desde el lado de TechCorp
 * 5. EXTRA: Crear una segunda presentación donde Pedro revele atributos
 *    DIFERENTES (por ejemplo, para un banco que necesita el promedio)
 *
 * PISTAS:
 * - Mira src/03-crear-presentacion.js y src/04-verificar-credencial.js
 * - Usa crearPresentacion() con la lista de atributos a revelar
 * - Usa verificarPresentacion() para la verificación
 *
 * PREGUNTA DE REFLEXIÓN:
 * ¿Por qué es importante la divulgación selectiva?
 * ¿Qué datos mínimos debería pedir un empleador? ¿Y un banco?
 * ¿Cómo protege esto la privacidad del ciudadano?
 * ============================================================================
 */

import { crearDID } from "../src/did.js";
import { emitirCredencial } from "../src/credential.js";
import { crearPresentacion, listarAtributosDisponibles } from "../src/presentation.js";
import { verificarPresentacion, imprimirReporteVerificacion } from "../src/verifier.js";
import { BlockchainSimulada } from "../src/blockchain-simulator.js";

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  EJERCICIO 2: Presentación Selectiva para Solicitar Empleo  ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

const blockchain = new BlockchainSimulada();

// TODO: Paso 1 - Crear DIDs para Pedro, UASD y TechCorp
// const pedro = crearDID("Pedro Martínez");
// const uasd = crearDID("UASD");
// const techcorp = crearDID("TechCorp");

// TODO: Paso 2 - Registrar DIDs en blockchain
// blockchain.registrarDID(pedro.registroBlockchain);
// blockchain.registrarDID(uasd.registroBlockchain);
// blockchain.registrarDID(techcorp.registroBlockchain);

// TODO: Paso 3 - Emitir credencial de título (igual que ejercicio 1)
// const titulo = emitirCredencial(uasd, pedro.did, "TituloUniversitario", {
//   nombreCompleto: "Pedro Luis Martínez Sánchez",
//   carrera: "Ingeniería en Sistemas",
//   fechaGraduacion: "2025-07-15",
//   promedioGeneral: "3.8",
//   honores: "Cum Laude",
//   numeroMatricula: "100-5678-9012",
// });

// TODO: Paso 4 - Listar atributos disponibles
// const atributos = listarAtributosDisponibles(titulo.credencialVerificable);
// console.log("Atributos disponibles:", atributos);

// TODO: Paso 5 - Crear presentación para TechCorp (solo nombre, carrera, honores)
// const presentacionEmpleo = crearPresentacion(
//   pedro,
//   titulo.credencialVerificable,
//   ["nombreCompleto", "carrera", "honores"],  // Solo estos atributos
//   techcorp.did,
//   "Solicitud de empleo - Desarrollador Senior"
// );

// TODO: Paso 6 - Verificar la presentación
// const resultados = verificarPresentacion(
//   presentacionEmpleo,
//   uasd.claves.clavePublica,
//   pedro.claves.clavePublica,
//   blockchain.listaRevocacion
// );
// imprimirReporteVerificacion(resultados);

// TODO EXTRA: Crear una segunda presentación para un banco
// ¿Qué atributos necesitaría un banco? ¿Por qué serían diferentes?
// const banco = crearDID("Banco Nacional");
// const presentacionBanco = crearPresentacion(
//   pedro,
//   titulo.credencialVerificable,
//   ["nombreCompleto", "carrera", "promedioGeneral"],  // ¿Esto es correcto?
//   banco.did,
//   "Solicitud de préstamo estudiantil"
// );

console.log("  >> Descomenta el código y completa los TODOs para resolver el ejercicio.\n");
console.log("  PISTA: Compara qué datos necesita un empleador vs un banco.\n");
