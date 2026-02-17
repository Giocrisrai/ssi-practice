/**
 * Módulo de Credenciales Verificables (Verifiable Credentials).
 *
 * Una Verifiable Credential es el equivalente digital de un documento oficial
 * (cédula, título universitario, certificado médico, etc.) pero con propiedades
 * criptográficas que permiten verificar su autenticidad sin contactar al emisor.
 *
 * Actores:
 * - Emisor (Issuer): La autoridad que emite la credencial (ej: Registro Civil)
 * - Titular (Holder): La persona que recibe y controla la credencial (ej: ciudadano)
 * - Verificador (Verifier): Quien necesita verificar la credencial (ej: arrendadora)
 */

import { firmar, generarHash } from "./crypto-utils.js";

/**
 * Emite una Verifiable Credential.
 *
 * El emisor firma digitalmente la credencial con su clave privada.
 * Esto permite que cualquiera con la clave pública del emisor pueda
 * verificar que la credencial es auténtica.
 *
 * @param {object} emisor - Entidad emisora con DID y claves
 * @param {string} titularDID - DID del titular de la credencial
 * @param {string} tipo - Tipo de credencial (ej: "CedulaDeIdentidad")
 * @param {object} atributos - Datos de la credencial (nombre, fecha nacimiento, etc.)
 * @param {Date} expiracion - Fecha de expiración (opcional)
 */
export function emitirCredencial(
  emisor,
  titularDID,
  tipo,
  atributos,
  expiracion = null
) {
  const credencial = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
    ],
    id: `urn:uuid:${crypto.randomUUID()}`,
    type: ["VerifiableCredential", tipo],
    issuer: emisor.did,
    issuanceDate: new Date().toISOString(),
    expirationDate: expiracion
      ? expiracion.toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    credentialSubject: {
      id: titularDID,
      ...atributos,
    },
  };

  // El emisor firma la credencial con su clave privada
  const firma = firmar(credencial, emisor.claves.clavePrivada);

  const credencialVerificable = {
    ...credencial,
    proof: {
      type: "Ed25519Signature2020",
      created: new Date().toISOString(),
      verificationMethod: `${emisor.did}#clave-1`,
      proofPurpose: "assertionMethod",
      proofValue: firma,
    },
  };

  // Hash que podría anclarse en blockchain como prueba de emisión
  const hashCredencial = generarHash(credencial);

  return {
    credencialVerificable,
    hashCredencial,
    // Esto es lo que se registraría en blockchain (solo el hash, NO los datos)
    registroBlockchain: {
      hashCredencial,
      emisorDID: emisor.did,
      titularDID,
      tipo,
      timestamp: credencial.issuanceDate,
      // Nota: Los datos personales NO se guardan en blockchain
    },
  };
}

/**
 * Revoca una credencial. En un sistema real, esto se registraría en blockchain
 * o en una lista de revocación publicada por el emisor.
 */
export function revocarCredencial(hashCredencial, emisor, razon) {
  return {
    hashCredencial,
    revocadaPor: emisor.did,
    razon,
    timestamp: new Date().toISOString(),
  };
}
