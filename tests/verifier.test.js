/**
 * Tests para el módulo de verificación.
 * Verifica que la validación criptográfica funciona correctamente.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearDID } from "../src/did.js";
import { emitirCredencial } from "../src/credential.js";
import { crearPresentacion } from "../src/presentation.js";
import { verificarPresentacion } from "../src/verifier.js";

describe("Verificación Criptográfica", () => {
  // Preparar escenario completo
  const titular = crearDID("María García");
  const emisor = crearDID("Registro Civil");
  const verificador = crearDID("Inmobiliaria Segura");

  const { credencialVerificable } = emitirCredencial(
    emisor,
    titular.did,
    "CedulaDeIdentidad",
    {
      nombreCompleto: "María Elena García Rodríguez",
      fechaNacimiento: "1990-03-15",
      nacionalidad: "Dominicana",
      numeroCedula: "001-1234567-8",
    }
  );

  const presentacion = crearPresentacion(
    titular,
    credencialVerificable,
    ["nombreCompleto", "nacionalidad"],
    verificador.did,
    "Solicitud de arriendo"
  );

  describe("verificarPresentacion() - caso exitoso", () => {
    it("debe validar una presentación legítima", () => {
      const resultados = verificarPresentacion(
        presentacion,
        emisor.claves.clavePublica,
        titular.claves.clavePublica,
        []
      );

      assert.equal(resultados.esValida, true);
    });

    it("debe incluir todas las verificaciones necesarias", () => {
      const resultados = verificarPresentacion(
        presentacion,
        emisor.claves.clavePublica,
        titular.claves.clavePublica,
        []
      );

      const pasos = resultados.verificaciones.map((v) => v.paso);
      assert.ok(pasos.includes("Firma del titular"));
      assert.ok(pasos.includes("Firma del emisor"));
      assert.ok(pasos.includes("Vigencia de la credencial"));
      assert.ok(pasos.includes("Estado de revocación"));
      assert.ok(pasos.includes("Frescura de la presentación"));
    });

    it("debe reportar los detalles de la presentación", () => {
      const resultados = verificarPresentacion(
        presentacion,
        emisor.claves.clavePublica,
        titular.claves.clavePublica,
        []
      );

      assert.equal(resultados.detalles.titular, titular.did);
      assert.equal(resultados.detalles.proposito, "Solicitud de arriendo");
      assert.deepEqual(
        resultados.detalles.atributosRevelados,
        ["nombreCompleto", "nacionalidad"]
      );
    });
  });

  describe("verificarPresentacion() - detección de manipulación", () => {
    it("debe detectar si los datos de la presentación fueron manipulados", () => {
      // Clonar y manipular la presentación
      const presentacionFalsa = JSON.parse(JSON.stringify(presentacion));
      presentacionFalsa.holder = "did:example:impostor";

      const resultados = verificarPresentacion(
        presentacionFalsa,
        emisor.claves.clavePublica,
        titular.claves.clavePublica,
        []
      );

      assert.equal(resultados.esValida, false, "Presentación manipulada debe ser inválida");
    });

    it("debe rechazar una firma verificada con la clave pública incorrecta", () => {
      const otroUsuario = crearDID("Impostor");

      const resultados = verificarPresentacion(
        presentacion,
        emisor.claves.clavePublica,
        otroUsuario.claves.clavePublica,  // Clave incorrecta
        []
      );

      assert.equal(resultados.esValida, false);
      const firmaCheck = resultados.verificaciones.find(
        (v) => v.paso === "Firma del titular"
      );
      assert.ok(firmaCheck.resultado.includes("INVÁLIDA"));
    });
  });

  describe("verificarPresentacion() - credencial expirada", () => {
    it("debe detectar una credencial expirada", () => {
      // Emitir credencial que ya expiró
      const expiracion = new Date("2020-01-01");
      const { credencialVerificable: credExpirada } = emitirCredencial(
        emisor,
        titular.did,
        "CedulaDeIdentidad",
        { nombreCompleto: "Test" },
        expiracion
      );

      const presentacionExpirada = crearPresentacion(
        titular,
        credExpirada,
        ["nombreCompleto"],
        verificador.did,
        "Test expiración"
      );

      const resultados = verificarPresentacion(
        presentacionExpirada,
        emisor.claves.clavePublica,
        titular.claves.clavePublica,
        []
      );

      assert.equal(resultados.esValida, false);
      const vigencia = resultados.verificaciones.find(
        (v) => v.paso === "Vigencia de la credencial"
      );
      assert.ok(vigencia.resultado.includes("EXPIRADA"));
    });
  });

  describe("verificarPresentacion() - credencial revocada", () => {
    it("debe detectar una credencial revocada", () => {
      const listaRevocacion = [
        { hashCredencial: credencialVerificable.id },
      ];

      const resultados = verificarPresentacion(
        presentacion,
        emisor.claves.clavePublica,
        titular.claves.clavePublica,
        listaRevocacion
      );

      assert.equal(resultados.esValida, false);
      const revocacion = resultados.verificaciones.find(
        (v) => v.paso === "Estado de revocación"
      );
      assert.ok(revocacion.resultado.includes("REVOCADA"));
    });

    it("debe pasar si la credencial no está en la lista de revocación", () => {
      const listaVacia = [];

      const resultados = verificarPresentacion(
        presentacion,
        emisor.claves.clavePublica,
        titular.claves.clavePublica,
        listaVacia
      );

      const revocacion = resultados.verificaciones.find(
        (v) => v.paso === "Estado de revocación"
      );
      assert.ok(revocacion.resultado.includes("NO REVOCADA"));
    });
  });
});
