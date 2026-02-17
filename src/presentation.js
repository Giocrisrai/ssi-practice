/**
 * Módulo de Presentaciones Verificables (Verifiable Presentations).
 *
 * Una Verifiable Presentation permite al titular compartir selectivamente
 * solo ciertos atributos de sus credenciales. Por ejemplo, un ciudadano
 * puede probar que es mayor de edad sin revelar su fecha exacta de nacimiento.
 *
 * Este es el mecanismo central de la privacidad en SSI:
 * El titular decide QUÉ información compartir y CON QUIÉN.
 */

import { firmar, generarHash } from "./crypto-utils.js";

/**
 * Crea una Verifiable Presentation con divulgación selectiva.
 *
 * El titular selecciona qué atributos revelar de cada credencial.
 * Luego firma la presentación con su propia clave privada, lo que
 * demuestra que él autorizó compartir esos datos específicos.
 *
 * @param {object} titular - Entidad titular con DID y claves
 * @param {object} credencial - La credencial verificable completa
 * @param {string[]} atributosARevelar - Lista de atributos a incluir
 * @param {string} destinatarioDID - DID del verificador que recibirá la presentación
 * @param {string} proposito - Para qué se comparte (ej: "Solicitud de arriendo")
 */
export function crearPresentacion(
  titular,
  credencial,
  atributosARevelar,
  destinatarioDID,
  proposito
) {
  // Extraer solo los atributos seleccionados de la credencial
  const atributosFiltrados = {};
  const atributosOcultos = [];

  for (const [clave, valor] of Object.entries(
    credencial.credentialSubject
  )) {
    if (clave === "id") {
      atributosFiltrados[clave] = valor;
    } else if (atributosARevelar.includes(clave)) {
      atributosFiltrados[clave] = valor;
    } else {
      // En lugar del valor real, incluimos un hash como prueba de existencia
      atributosFiltrados[clave] = `[OCULTO - hash: ${generarHash(String(valor)).substring(0, 16)}...]`;
      atributosOcultos.push(clave);
    }
  }

  // Crear la credencial derivada (con divulgación selectiva)
  const credencialDerivada = {
    ...credencial,
    credentialSubject: atributosFiltrados,
    // Mantenemos la prueba original del emisor para verificación
    _proofOriginal: credencial.proof,
  };

  const presentacion = {
    "@context": "https://www.w3.org/2018/credentials/v1",
    type: "VerifiablePresentation",
    holder: titular.did,
    verifiableCredential: [credencialDerivada],
    proposito,
    destinatario: destinatarioDID,
    atributosRevelados: atributosARevelar,
    atributosOcultos,
    created: new Date().toISOString(),
    // Challenge para prevenir ataques de replay
    challenge: generarHash(`${Date.now()}-${Math.random()}`).substring(0, 32),
  };

  // El titular firma la presentación con SU clave privada
  const firma = firmar(presentacion, titular.claves.clavePrivada);

  return {
    ...presentacion,
    proof: {
      type: "Ed25519Signature2020",
      created: new Date().toISOString(),
      verificationMethod: `${titular.did}#clave-1`,
      proofPurpose: "authentication",
      proofValue: firma,
    },
  };
}

/**
 * Lista los atributos disponibles en una credencial para que el titular
 * pueda decidir cuáles compartir.
 */
export function listarAtributosDisponibles(credencial) {
  return Object.keys(credencial.credentialSubject).filter((k) => k !== "id");
}
