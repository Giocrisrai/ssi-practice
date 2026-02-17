/**
 * Módulo de Identificadores Descentralizados (DIDs).
 *
 * Un DID es un identificador globalmente único que no depende de ninguna
 * autoridad centralizada. El usuario controla su DID porque posee la clave privada.
 *
 * Formato simplificado: did:example:<hash-de-clave-publica>
 * En producción se usarían métodos como did:web, did:ion, did:ethr, etc.
 */

import { generarParDeClaves, generarHash } from "./crypto-utils.js";

/**
 * Crea un nuevo DID con su documento DID asociado.
 *
 * El Documento DID contiene:
 * - El identificador (DID)
 * - Los métodos de verificación (claves públicas)
 * - Metadatos de cuándo se creó
 *
 * IMPORTANTE: Solo el hash de la clave pública se registraría en blockchain.
 * La clave privada NUNCA sale del dispositivo del usuario.
 */
export function crearDID(nombre) {
  const claves = generarParDeClaves();
  const idUnico = generarHash(claves.clavePublicaHex).substring(0, 32);
  const did = `did:example:${idUnico}`;

  const documentoDID = {
    "@context": "https://www.w3.org/ns/did/v1",
    id: did,
    controller: did,
    verificationMethod: [
      {
        id: `${did}#clave-1`,
        type: "Ed25519VerificationKey2020",
        controller: did,
        publicKeyHex: claves.clavePublicaHex,
      },
    ],
    authentication: [`${did}#clave-1`],
    created: new Date().toISOString(),
  };

  return {
    did,
    nombre,
    documentoDID,
    claves,
    // Esto es lo que se registraría en blockchain (público)
    registroBlockchain: {
      did,
      clavePublicaHex: claves.clavePublicaHex,
      timestamp: documentoDID.created,
    },
    // Esto permanece en el dispositivo del usuario (privado)
    datosPrivados: {
      clavePrivada: claves.clavePrivada,
    },
  };
}

/**
 * Resuelve un DID buscando en el registro (simulado) de blockchain.
 * En producción, esto consultaría la red blockchain correspondiente.
 */
export function resolverDID(did, registroBlockchain) {
  const registro = registroBlockchain.find((r) => r.did === did);
  if (!registro) {
    throw new Error(`DID no encontrado: ${did}`);
  }
  return registro;
}
