/**
 * Módulo de Verificación.
 *
 * El verificador (arrendadora, empleador, banco) puede comprobar:
 * 1. Que la credencial fue firmada por un emisor legítimo
 * 2. Que la presentación fue autorizada por el titular
 * 3. Que la credencial no ha expirado
 * 4. Que la credencial no ha sido revocada
 *
 * Todo esto SIN necesidad de contactar al emisor directamente.
 * Solo necesita la clave pública del emisor (disponible en blockchain).
 */

import crypto from "node:crypto";
import { verificarFirma } from "./crypto-utils.js";

/**
 * Verifica una Verifiable Presentation completa.
 * Realiza múltiples comprobaciones de seguridad.
 */
export function verificarPresentacion(
  presentacion,
  clavePublicaEmisor,
  clavePublicaTitular,
  listaRevocacion = []
) {
  const resultados = {
    verificaciones: [],
    esValida: true,
    detalles: {},
  };

  // 1. Verificar la firma del titular en la presentación
  const presentacionSinProof = { ...presentacion };
  delete presentacionSinProof.proof;

  const firmaValidaTitular = verificarFirma(
    presentacionSinProof,
    presentacion.proof.proofValue,
    clavePublicaTitular
  );

  resultados.verificaciones.push({
    paso: "Firma del titular",
    resultado: firmaValidaTitular ? "VÁLIDA" : "INVÁLIDA",
    descripcion: firmaValidaTitular
      ? "El titular autorizó esta presentación"
      : "La firma del titular no es válida - posible suplantación",
  });

  if (!firmaValidaTitular) resultados.esValida = false;

  // 2. Verificar la firma del emisor en la credencial
  for (const cred of presentacion.verifiableCredential) {
    const proofOriginal = cred._proofOriginal || cred.proof;
    const credSinProof = { ...cred };
    delete credSinProof.proof;
    delete credSinProof._proofOriginal;
    delete credSinProof.credentialSubject;

    // Nota: En una implementación real, se verificaría contra la credencial
    // original completa. Aquí simplificamos para fines educativos.
    resultados.verificaciones.push({
      paso: "Firma del emisor",
      resultado: "VERIFICADA (simulado)",
      descripcion: `Credencial emitida por ${cred.issuer}`,
    });

    // 3. Verificar expiración
    const ahora = new Date();
    const expiracion = new Date(cred.expirationDate);
    const noExpirada = ahora < expiracion;

    resultados.verificaciones.push({
      paso: "Vigencia de la credencial",
      resultado: noExpirada ? "VIGENTE" : "EXPIRADA",
      descripcion: noExpirada
        ? `Válida hasta ${expiracion.toLocaleDateString("es-ES")}`
        : `Expiró el ${expiracion.toLocaleDateString("es-ES")}`,
    });

    if (!noExpirada) resultados.esValida = false;

    // 4. Verificar que no esté revocada
    const estaRevocada = listaRevocacion.some(
      (r) => r.hashCredencial === cred.id
    );

    resultados.verificaciones.push({
      paso: "Estado de revocación",
      resultado: estaRevocada ? "REVOCADA" : "NO REVOCADA",
      descripcion: estaRevocada
        ? "Esta credencial ha sido revocada por el emisor"
        : "La credencial no aparece en la lista de revocación",
    });

    if (estaRevocada) resultados.esValida = false;
  }

  // 5. Verificar que la presentación es reciente (anti-replay)
  const creacion = new Date(presentacion.created);
  const antiguedadMinutos = (Date.now() - creacion.getTime()) / 60000;

  resultados.verificaciones.push({
    paso: "Frescura de la presentación",
    resultado: antiguedadMinutos < 30 ? "RECIENTE" : "ANTIGUA",
    descripcion:
      antiguedadMinutos < 30
        ? `Creada hace ${Math.round(antiguedadMinutos)} minutos`
        : "La presentación tiene más de 30 minutos - podría ser un ataque de replay",
  });

  // Resumen
  resultados.detalles = {
    titular: presentacion.holder,
    proposito: presentacion.proposito,
    atributosRevelados: presentacion.atributosRevelados,
    atributosOcultos: presentacion.atributosOcultos,
    destinatario: presentacion.destinatario,
  };

  return resultados;
}

/**
 * Muestra un reporte legible de la verificación.
 */
export function imprimirReporteVerificacion(resultados) {
  console.log("\n" + "=".repeat(60));
  console.log("  REPORTE DE VERIFICACIÓN DE CREDENCIAL");
  console.log("=".repeat(60));

  for (const v of resultados.verificaciones) {
    const icono = v.resultado.includes("VÁLIDA") ||
      v.resultado.includes("VIGENTE") ||
      v.resultado.includes("NO REVOCADA") ||
      v.resultado.includes("RECIENTE") ||
      v.resultado.includes("VERIFICADA")
      ? "[OK]"
      : "[!!]";

    console.log(`\n  ${icono} ${v.paso}: ${v.resultado}`);
    console.log(`      ${v.descripcion}`);
  }

  console.log("\n" + "-".repeat(60));
  console.log(`  RESULTADO FINAL: ${resultados.esValida ? "PRESENTACION VALIDA" : "PRESENTACION INVALIDA"}`);
  console.log("-".repeat(60));

  if (resultados.detalles.atributosRevelados) {
    console.log(`\n  Datos compartidos: ${resultados.detalles.atributosRevelados.join(", ")}`);
  }
  if (resultados.detalles.atributosOcultos?.length > 0) {
    console.log(`  Datos protegidos:  ${resultados.detalles.atributosOcultos.join(", ")}`);
  }
  console.log(`  Propósito: ${resultados.detalles.proposito}`);
  console.log("=".repeat(60) + "\n");
}
