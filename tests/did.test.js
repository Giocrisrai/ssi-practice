/**
 * Tests para el módulo de DIDs (Identificadores Descentralizados).
 * Verifica la creación y resolución de DIDs.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearDID, resolverDID } from "../src/did.js";

describe("DID (Identificadores Descentralizados)", () => {
  describe("crearDID()", () => {
    it("debe crear un DID con el formato correcto", () => {
      const identidad = crearDID("María García");

      assert.ok(
        identidad.did.startsWith("did:example:"),
        "El DID debe comenzar con did:example:"
      );
      assert.ok(identidad.did.length > 20, "El DID debe tener longitud suficiente");
    });

    it("debe incluir el nombre del titular", () => {
      const identidad = crearDID("Pedro Martínez");

      assert.equal(identidad.nombre, "Pedro Martínez");
    });

    it("debe generar un documento DID válido según W3C", () => {
      const identidad = crearDID("Test");
      const doc = identidad.documentoDID;

      assert.equal(doc["@context"], "https://www.w3.org/ns/did/v1");
      assert.equal(doc.id, identidad.did);
      assert.equal(doc.controller, identidad.did);
      assert.ok(Array.isArray(doc.verificationMethod));
      assert.ok(doc.verificationMethod.length > 0);
      assert.ok(Array.isArray(doc.authentication));
      assert.ok(doc.created, "Debe tener fecha de creación");
    });

    it("el método de verificación debe tener la estructura correcta", () => {
      const identidad = crearDID("Test");
      const metodo = identidad.documentoDID.verificationMethod[0];

      assert.ok(metodo.id.includes("#clave-1"));
      assert.equal(metodo.type, "Ed25519VerificationKey2020");
      assert.equal(metodo.controller, identidad.did);
      assert.ok(metodo.publicKeyHex, "Debe incluir la clave pública en hex");
    });

    it("debe separar datos de blockchain de datos privados", () => {
      const identidad = crearDID("Test");

      // Datos públicos (blockchain)
      assert.ok(identidad.registroBlockchain.did);
      assert.ok(identidad.registroBlockchain.clavePublicaHex);
      assert.ok(identidad.registroBlockchain.timestamp);

      // Datos privados (dispositivo del usuario)
      assert.ok(identidad.datosPrivados.clavePrivada);
    });

    it("dos DIDs deben ser diferentes", () => {
      const did1 = crearDID("Persona 1");
      const did2 = crearDID("Persona 2");

      assert.notEqual(did1.did, did2.did);
    });

    it("la clave privada NO debe estar en registroBlockchain", () => {
      const identidad = crearDID("Test");
      const registro = JSON.stringify(identidad.registroBlockchain);

      assert.ok(
        !registro.includes("clavePrivada"),
        "La clave privada no debe estar en los datos de blockchain"
      );
    });
  });

  describe("resolverDID()", () => {
    it("debe encontrar un DID registrado", () => {
      const identidad = crearDID("Test");
      const registro = [identidad.registroBlockchain];

      const resultado = resolverDID(identidad.did, registro);
      assert.equal(resultado.did, identidad.did);
    });

    it("debe lanzar error si el DID no existe", () => {
      assert.throws(
        () => resolverDID("did:example:noexiste", []),
        /DID no encontrado/
      );
    });
  });
});
