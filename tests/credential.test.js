/**
 * Tests para el módulo de Verifiable Credentials.
 * Verifica la emisión y estructura de credenciales.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearDID } from "../src/did.js";
import { emitirCredencial, revocarCredencial } from "../src/credential.js";

describe("Verifiable Credentials", () => {
  const emisor = crearDID("Registro Civil");
  const titular = crearDID("María García");

  const atributosCredencial = {
    nombreCompleto: "María Elena García Rodríguez",
    fechaNacimiento: "1990-03-15",
    nacionalidad: "Dominicana",
    numeroCedula: "001-1234567-8",
  };

  describe("emitirCredencial()", () => {
    it("debe emitir una credencial con estructura W3C válida", () => {
      const resultado = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );
      const vc = resultado.credencialVerificable;

      assert.ok(vc["@context"], "Debe tener @context");
      assert.ok(vc.id, "Debe tener id único");
      assert.ok(Array.isArray(vc.type), "type debe ser un array");
      assert.ok(vc.type.includes("VerifiableCredential"));
      assert.ok(vc.type.includes("CedulaDeIdentidad"));
      assert.ok(vc.issuer, "Debe tener emisor");
      assert.ok(vc.issuanceDate, "Debe tener fecha de emisión");
      assert.ok(vc.expirationDate, "Debe tener fecha de expiración");
      assert.ok(vc.credentialSubject, "Debe tener credentialSubject");
      assert.ok(vc.proof, "Debe tener prueba criptográfica");
    });

    it("el emisor debe ser el DID de la autoridad", () => {
      const { credencialVerificable } = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );

      assert.equal(credencialVerificable.issuer, emisor.did);
    });

    it("el titular debe ser el DID del ciudadano", () => {
      const { credencialVerificable } = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );

      assert.equal(credencialVerificable.credentialSubject.id, titular.did);
    });

    it("debe incluir todos los atributos proporcionados", () => {
      const { credencialVerificable } = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );
      const sujeto = credencialVerificable.credentialSubject;

      assert.equal(sujeto.nombreCompleto, "María Elena García Rodríguez");
      assert.equal(sujeto.fechaNacimiento, "1990-03-15");
      assert.equal(sujeto.nacionalidad, "Dominicana");
      assert.equal(sujeto.numeroCedula, "001-1234567-8");
    });

    it("la prueba debe tener el formato Ed25519", () => {
      const { credencialVerificable } = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );
      const proof = credencialVerificable.proof;

      assert.equal(proof.type, "Ed25519Signature2020");
      assert.equal(proof.proofPurpose, "assertionMethod");
      assert.ok(proof.proofValue, "Debe tener valor de firma");
      assert.ok(proof.verificationMethod.includes(emisor.did));
      assert.ok(proof.created, "Debe tener timestamp");
    });

    it("debe generar un hash para anclar en blockchain", () => {
      const resultado = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );

      assert.ok(resultado.hashCredencial);
      assert.equal(resultado.hashCredencial.length, 64, "SHA-256 = 64 hex chars");
    });

    it("el registro blockchain NO debe contener datos personales", () => {
      const resultado = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );
      const registro = JSON.stringify(resultado.registroBlockchain);

      assert.ok(!registro.includes("María"), "No debe tener el nombre");
      assert.ok(!registro.includes("1990"), "No debe tener fecha nacimiento");
      assert.ok(!registro.includes("Dominicana"), "No debe tener nacionalidad");
      assert.ok(!registro.includes("001-1234567-8"), "No debe tener cédula");
    });

    it("la fecha de expiración debe ser futura", () => {
      const { credencialVerificable } = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );

      const expiracion = new Date(credencialVerificable.expirationDate);
      assert.ok(expiracion > new Date(), "La expiración debe ser futura");
    });

    it("cada credencial debe tener un ID único", () => {
      const r1 = emitirCredencial(emisor, titular.did, "Test", { a: 1 });
      const r2 = emitirCredencial(emisor, titular.did, "Test", { a: 1 });

      assert.notEqual(
        r1.credencialVerificable.id,
        r2.credencialVerificable.id
      );
    });
  });

  describe("revocarCredencial()", () => {
    it("debe generar un registro de revocación válido", () => {
      const resultado = emitirCredencial(
        emisor, titular.did, "CedulaDeIdentidad", atributosCredencial
      );

      const revocacion = revocarCredencial(
        resultado.hashCredencial, emisor, "Datos incorrectos"
      );

      assert.equal(revocacion.hashCredencial, resultado.hashCredencial);
      assert.equal(revocacion.revocadaPor, emisor.did);
      assert.equal(revocacion.razon, "Datos incorrectos");
      assert.ok(revocacion.timestamp);
    });
  });
});
