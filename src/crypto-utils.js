/**
 * Utilidades criptográficas para el sistema SSI.
 *
 * Usa Ed25519 (curva elíptica moderna) para firmas digitales,
 * el mismo tipo de criptografía que usan protocolos reales de identidad soberana.
 */

import crypto from "node:crypto";

/**
 * Genera un par de claves Ed25519 (clave pública + clave privada).
 * En SSI, cada entidad (ciudadano, autoridad, verificador) tiene su propio par.
 */
export function generarParDeClaves() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");

  return {
    clavePublica: publicKey,
    clavePrivada: privateKey,
    clavePublicaHex: publicKey
      .export({ type: "spki", format: "der" })
      .toString("hex"),
    clavePrivadaHex: privateKey
      .export({ type: "pkcs8", format: "der" })
      .toString("hex"),
  };
}

/**
 * Firma digitalmente un objeto JSON con una clave privada Ed25519.
 * La firma prueba que el emisor (dueño de la clave privada) aprobó el contenido.
 */
export function firmar(datos, clavePrivada) {
  const mensaje = JSON.stringify(datos);
  const firma = crypto.sign(null, Buffer.from(mensaje), clavePrivada);
  return firma.toString("hex");
}

/**
 * Verifica que una firma corresponde a los datos y a la clave pública indicada.
 * Cualquiera con la clave pública puede verificar, sin necesidad de contactar al emisor.
 */
export function verificarFirma(datos, firmaHex, clavePublica) {
  const mensaje = JSON.stringify(datos);
  const firma = Buffer.from(firmaHex, "hex");
  return crypto.verify(null, Buffer.from(mensaje), clavePublica, firma);
}

/**
 * Genera un hash SHA-256 de un string. Se usa para anclar datos en blockchain
 * sin revelar el contenido original.
 */
export function generarHash(datos) {
  return crypto
    .createHash("sha256")
    .update(typeof datos === "string" ? datos : JSON.stringify(datos))
    .digest("hex");
}
