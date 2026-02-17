/**
 * PASO 4: Verificación Criptográfica
 *
 * La arrendadora (Inmobiliaria Segura) recibe la presentación de María
 * y verifica criptográficamente que:
 *
 * 1. María autorizó compartir estos datos (firma del titular)
 * 2. La credencial fue emitida por el Registro Civil (firma del emisor)
 * 3. La credencial no ha expirado
 * 4. La credencial no ha sido revocada
 * 5. La presentación es reciente (protección anti-replay)
 *
 * Todo esto se hace SIN contactar al Registro Civil.
 * La arrendadora solo necesita la clave pública del emisor (de blockchain).
 */

import { crearDID } from "./did.js";
import { emitirCredencial } from "./credential.js";
import { crearPresentacion } from "./presentation.js";
import { verificarPresentacion, imprimirReporteVerificacion } from "./verifier.js";
import { BlockchainSimulada } from "./blockchain-simulator.js";

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║  PASO 4: VERIFICACIÓN CRIPTOGRÁFICA                    ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

// Recrear escenario completo
const maria = crearDID("María García");
const registroCivil = crearDID("Registro Civil");
const arrendadora = crearDID("Inmobiliaria Segura");
const blockchain = new BlockchainSimulada();

blockchain.registrarDID(maria.registroBlockchain);
blockchain.registrarDID(registroCivil.registroBlockchain);
blockchain.registrarDID(arrendadora.registroBlockchain);

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

const { credencialVerificable } = resultado;
blockchain.anclarCredencial(resultado.registroBlockchain);

const presentacion = crearPresentacion(
  maria,
  credencialVerificable,
  ["nombreCompleto", "nacionalidad", "numeroCedula"],
  arrendadora.did,
  "Solicitud de arriendo de apartamento"
);

// --- La arrendadora verifica la presentación ---
console.log(">> La arrendadora recibe la presentación de María");
console.log(">> Iniciando verificación criptográfica...\n");

// La arrendadora busca la clave pública de María y del Registro Civil en blockchain
const registroMaria = blockchain.buscarDID(maria.did);
const registroRC = blockchain.buscarDID(registroCivil.did);

console.log("  1. Buscando claves públicas en blockchain...");
console.log(`     ✓ Clave pública de María encontrada`);
console.log(`     ✓ Clave pública del Registro Civil encontrada\n`);

// Realizar la verificación
const resultados = verificarPresentacion(
  presentacion,
  registroCivil.claves.clavePublica,
  maria.claves.clavePublica,
  blockchain.listaRevocacion
);

imprimirReporteVerificacion(resultados);

// --- Demostrar qué pasa si se manipula la credencial ---
console.log("\n>> PRUEBA DE SEGURIDAD: ¿Qué pasa si alguien modifica los datos?\n");

const presentacionManipulada = JSON.parse(JSON.stringify(presentacion));
presentacionManipulada.verifiableCredential[0].credentialSubject.nombreCompleto =
  "Juan Pérez (MANIPULADO)";

console.log("  Intentando verificar una presentación con datos alterados...\n");

const resultadosManipulados = verificarPresentacion(
  presentacionManipulada,
  registroCivil.claves.clavePublica,
  maria.claves.clavePublica,
  blockchain.listaRevocacion
);

imprimirReporteVerificacion(resultadosManipulados);

console.log("REFLEXIÓN:");
console.log("─────────");
console.log("• La verificación es instantánea y no requiere contactar al Registro Civil");
console.log("• Las firmas criptográficas detectan cualquier manipulación de datos");
console.log("• La arrendadora puede confiar en la credencial sin intermediarios");
console.log("• El modelo es descentralizado: no hay un punto único de fallo\n");

console.log("PREGUNTAS REGULATORIAS (IL3.4):");
console.log("───────────────────────────────");
console.log("• ¿Quién es responsable si una credencial contiene datos falsos?");
console.log("  → El emisor (Registro Civil) que firmó datos incorrectos");
console.log("• ¿Cumple este modelo con la protección de datos (GDPR/LOPD)?");
console.log("  → Sí: el usuario controla sus datos (principio de minimización)");
console.log("  → Los datos personales NO están en blockchain");
console.log("• ¿Qué pasa si María pierde su clave privada?");
console.log("  → Necesita un mecanismo de recuperación (guardián social, backup)");
console.log("• ¿Puede el Registro Civil revocar la credencial?");
console.log("  → Sí, publicando la revocación en blockchain\n");
