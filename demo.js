/**
 * ============================================================================
 * DEMO COMPLETO: Flujo de Identidad Soberana (SSI)
 * ============================================================================
 *
 * Este script ejecuta el flujo completo de SSI en un solo archivo:
 *
 *   1. Creación de DIDs (Identificadores Descentralizados)
 *   2. Emisión de Verifiable Credential (por el Registro Civil)
 *   3. Creación de Verifiable Presentation (divulgación selectiva)
 *   4. Verificación criptográfica (por la arrendadora)
 *
 * Ejecutar: node demo.js
 * ============================================================================
 */

import { crearDID } from "./src/did.js";
import { emitirCredencial } from "./src/credential.js";
import {
  crearPresentacion,
  listarAtributosDisponibles,
} from "./src/presentation.js";
import {
  verificarPresentacion,
  imprimirReporteVerificacion,
} from "./src/verifier.js";
import { BlockchainSimulada } from "./src/blockchain-simulator.js";

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================

const blockchain = new BlockchainSimulada();

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║           DEMO: IDENTIDAD SOBERANA (SSI)                    ║");
console.log("║   Flujo completo: DID → Credencial → Presentación → Verif. ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

// ============================================================================
// PASO 1: CREACIÓN DE DIDS
// ============================================================================

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PASO 1: Creación de Identificadores Descentralizados (DIDs)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const ciudadana = crearDID("María García");
const registroCivil = crearDID("Registro Civil de RD");
const arrendadora = crearDID("Inmobiliaria Segura");

// Registrar en blockchain (solo DIDs y claves públicas)
blockchain.registrarDID(ciudadana.registroBlockchain);
blockchain.registrarDID(registroCivil.registroBlockchain);
blockchain.registrarDID(arrendadora.registroBlockchain);

console.log("  Actores creados:");
console.log(`    Ciudadana:     ${ciudadana.did}`);
console.log(`    Registro Civil: ${registroCivil.did}`);
console.log(`    Arrendadora:   ${arrendadora.did}`);
console.log("\n  [i] Solo los DIDs y claves públicas se registran en blockchain.");
console.log("  [i] Las claves privadas quedan en el dispositivo de cada actor.\n");

// ============================================================================
// PASO 2: EMISIÓN DE CREDENCIAL VERIFICABLE
// ============================================================================

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PASO 2: El Registro Civil emite una Cédula de Identidad");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const credencial = emitirCredencial(
  registroCivil,
  ciudadana.did,
  "CedulaDeIdentidad",
  {
    nombreCompleto: "María Elena García Rodríguez",
    fechaNacimiento: "1990-03-15",
    nacionalidad: "Dominicana",
    numeroCedula: "001-1234567-8",
    direccion: "Calle Las Flores 42, Santo Domingo",
    estadoCivil: "Soltera",
    sexo: "Femenino",
    lugarNacimiento: "Santiago de los Caballeros",
  }
);

// Anclar hash en blockchain
blockchain.anclarCredencial(credencial.registroBlockchain);

console.log("  Credencial emitida exitosamente:");
console.log(`    Tipo: Cédula de Identidad`);
console.log(`    Emisor: Registro Civil (${registroCivil.did.substring(0, 30)}...)`);
console.log(`    Titular: María (${ciudadana.did.substring(0, 30)}...)`);
console.log(`    Expira: ${credencial.credencialVerificable.expirationDate}`);
console.log(`\n  [i] Datos personales: almacenados SOLO en el wallet de María`);
console.log(`  [i] En blockchain: solo el hash ${credencial.hashCredencial.substring(0, 20)}...\n`);

// Mostrar todos los atributos de la credencial
console.log("  Atributos en la credencial:");
const atributos = listarAtributosDisponibles(credencial.credencialVerificable);
atributos.forEach((a) => {
  console.log(`    - ${a}: ${credencial.credencialVerificable.credentialSubject[a]}`);
});

// ============================================================================
// PASO 3: PRESENTACIÓN VERIFICABLE (DIVULGACIÓN SELECTIVA)
// ============================================================================

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PASO 3: María crea una Presentación con Divulgación Selectiva");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("  ESCENARIO: María quiere arrendar un apartamento.");
console.log("  La arrendadora pide verificar su identidad.\n");

// María decide compartir SOLO lo necesario
const atributosCompartidos = ["nombreCompleto", "nacionalidad", "numeroCedula"];

console.log("  María decide qué compartir:");
atributos.forEach((a) => {
  const compartido = atributosCompartidos.includes(a);
  console.log(`    ${compartido ? "[REVELAR]" : "[OCULTAR]"} ${a}`);
});

const presentacion = crearPresentacion(
  ciudadana,
  credencial.credencialVerificable,
  atributosCompartidos,
  arrendadora.did,
  "Solicitud de arriendo - Apartamento 3B, Edificio Sol"
);

console.log("\n  Presentación creada y firmada por María.");
console.log(`  Propósito: ${presentacion.proposito}`);
console.log(`  Datos revelados: ${presentacion.atributosRevelados.join(", ")}`);
console.log(`  Datos ocultos: ${presentacion.atributosOcultos.join(", ")}`);

// Mostrar lo que la arrendadora realmente ve
console.log("\n  Lo que la arrendadora recibe:");
const credDerivada = presentacion.verifiableCredential[0];
for (const [clave, valor] of Object.entries(credDerivada.credentialSubject)) {
  if (clave !== "id") {
    const esVisible = atributosCompartidos.includes(clave);
    console.log(`    ${esVisible ? "[VISIBLE] " : "[OCULTO]  "} ${clave}: ${valor}`);
  }
}

// ============================================================================
// PASO 4: VERIFICACIÓN CRIPTOGRÁFICA
// ============================================================================

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PASO 4: La arrendadora verifica la presentación");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("  La arrendadora consulta las claves públicas en blockchain...");

const resultados = verificarPresentacion(
  presentacion,
  registroCivil.claves.clavePublica,
  ciudadana.claves.clavePublica,
  blockchain.listaRevocacion
);

imprimirReporteVerificacion(resultados);

// ============================================================================
// ESTADO FINAL DE LA BLOCKCHAIN
// ============================================================================

blockchain.imprimirEstado();

// ============================================================================
// RESUMEN EDUCATIVO
// ============================================================================

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║                    RESUMEN DEL FLUJO                        ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

console.log("  1. CREACIÓN DE DID");
console.log("     → Cada actor genera sus claves criptográficas");
console.log("     → El DID se registra en blockchain (público)");
console.log("     → La clave privada queda en el dispositivo (privado)\n");

console.log("  2. EMISIÓN DE CREDENCIAL");
console.log("     → La autoridad firma la credencial con su clave privada");
console.log("     → Solo el hash va a blockchain (integridad)");
console.log("     → Los datos personales quedan off-chain (privacidad)\n");

console.log("  3. PRESENTACIÓN SELECTIVA");
console.log("     → El titular elige qué atributos revelar");
console.log("     → Firma la presentación (autorización)");
console.log("     → La comparte directamente con el verificador (P2P)\n");

console.log("  4. VERIFICACIÓN");
console.log("     → El verificador consulta claves públicas en blockchain");
console.log("     → Verifica firmas, vigencia y estado de revocación");
console.log("     → No necesita contactar al emisor (descentralizado)\n");

console.log("═══════════════════════════════════════════════════════════════\n");
