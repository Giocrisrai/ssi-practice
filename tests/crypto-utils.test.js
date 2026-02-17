/**
 * Tests para el módulo de utilidades criptográficas.
 * Verifica que las funciones de firma y hash funcionan correctamente.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generarParDeClaves,
  firmar,
  verificarFirma,
  generarHash,
} from "../src/crypto-utils.js";

describe("crypto-utils", () => {
  describe("generarParDeClaves()", () => {
    it("debe generar un par de claves con todos los campos", () => {
      const claves = generarParDeClaves();

      assert.ok(claves.clavePublica, "Debe tener clavePublica");
      assert.ok(claves.clavePrivada, "Debe tener clavePrivada");
      assert.ok(claves.clavePublicaHex, "Debe tener clavePublicaHex");
      assert.ok(claves.clavePrivadaHex, "Debe tener clavePrivadaHex");
    });

    it("debe generar claves únicas cada vez", () => {
      const claves1 = generarParDeClaves();
      const claves2 = generarParDeClaves();

      assert.notEqual(
        claves1.clavePublicaHex,
        claves2.clavePublicaHex,
        "Dos pares de claves deben ser diferentes"
      );
    });

    it("las claves deben ser strings hexadecimales válidos", () => {
      const claves = generarParDeClaves();
      const hexRegex = /^[0-9a-f]+$/i;

      assert.match(claves.clavePublicaHex, hexRegex);
      assert.match(claves.clavePrivadaHex, hexRegex);
    });
  });

  describe("firmar() y verificarFirma()", () => {
    it("debe firmar datos y verificar correctamente", () => {
      const claves = generarParDeClaves();
      const datos = { mensaje: "Hola SSI" };

      const firma = firmar(datos, claves.clavePrivada);
      const esValida = verificarFirma(datos, firma, claves.clavePublica);

      assert.equal(esValida, true, "La firma debe ser válida");
    });

    it("debe rechazar una firma con datos manipulados", () => {
      const claves = generarParDeClaves();
      const datosOriginales = { nombre: "María" };
      const datosManipulados = { nombre: "Juan" };

      const firma = firmar(datosOriginales, claves.clavePrivada);
      const esValida = verificarFirma(datosManipulados, firma, claves.clavePublica);

      assert.equal(esValida, false, "Datos manipulados deben invalidar la firma");
    });

    it("debe rechazar una firma verificada con otra clave pública", () => {
      const claves1 = generarParDeClaves();
      const claves2 = generarParDeClaves();
      const datos = { mensaje: "test" };

      const firma = firmar(datos, claves1.clavePrivada);
      const esValida = verificarFirma(datos, firma, claves2.clavePublica);

      assert.equal(esValida, false, "Otra clave pública debe invalidar la verificación");
    });

    it("la firma debe ser un string hexadecimal", () => {
      const claves = generarParDeClaves();
      const firma = firmar({ dato: 1 }, claves.clavePrivada);

      assert.match(firma, /^[0-9a-f]+$/i);
      assert.ok(firma.length > 0);
    });
  });

  describe("generarHash()", () => {
    it("debe generar un hash SHA-256 determinista", () => {
      const hash1 = generarHash("hola");
      const hash2 = generarHash("hola");

      assert.equal(hash1, hash2, "Mismo input debe dar mismo hash");
    });

    it("debe generar hashes diferentes para inputs diferentes", () => {
      const hash1 = generarHash("hola");
      const hash2 = generarHash("mundo");

      assert.notEqual(hash1, hash2);
    });

    it("debe aceptar objetos y strings", () => {
      const hashString = generarHash("test");
      const hashObjeto = generarHash({ clave: "valor" });

      assert.equal(hashString.length, 64, "SHA-256 produce 64 chars hex");
      assert.equal(hashObjeto.length, 64);
    });

    it("el hash debe tener exactamente 64 caracteres hex (256 bits)", () => {
      const hash = generarHash("cualquier cosa");

      assert.equal(hash.length, 64);
      assert.match(hash, /^[0-9a-f]{64}$/);
    });
  });
});
