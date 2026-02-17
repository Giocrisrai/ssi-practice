/**
 * Tests para el módulo de Verifiable Presentations.
 * Verifica la divulgación selectiva y la estructura de las presentaciones.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearDID } from "../src/did.js";
import { emitirCredencial } from "../src/credential.js";
import {
  crearPresentacion,
  listarAtributosDisponibles,
} from "../src/presentation.js";

describe("Verifiable Presentations (Divulgación Selectiva)", () => {
  // Preparar escenario
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
      direccion: "Calle Las Flores 42",
      estadoCivil: "Soltera",
    }
  );

  describe("listarAtributosDisponibles()", () => {
    it("debe listar todos los atributos excepto 'id'", () => {
      const atributos = listarAtributosDisponibles(credencialVerificable);

      assert.ok(atributos.includes("nombreCompleto"));
      assert.ok(atributos.includes("fechaNacimiento"));
      assert.ok(atributos.includes("nacionalidad"));
      assert.ok(atributos.includes("numeroCedula"));
      assert.ok(atributos.includes("direccion"));
      assert.ok(atributos.includes("estadoCivil"));
      assert.ok(!atributos.includes("id"), "No debe incluir 'id'");
    });
  });

  describe("crearPresentacion()", () => {
    it("debe crear una presentación con estructura válida", () => {
      const presentacion = crearPresentacion(
        titular,
        credencialVerificable,
        ["nombreCompleto", "nacionalidad"],
        verificador.did,
        "Arriendo"
      );

      assert.equal(presentacion["@context"], "https://www.w3.org/2018/credentials/v1");
      assert.equal(presentacion.type, "VerifiablePresentation");
      assert.equal(presentacion.holder, titular.did);
      assert.ok(presentacion.proof, "Debe tener prueba del titular");
      assert.ok(presentacion.created);
      assert.ok(presentacion.challenge, "Debe tener challenge anti-replay");
    });

    it("debe revelar SOLO los atributos seleccionados", () => {
      const presentacion = crearPresentacion(
        titular,
        credencialVerificable,
        ["nombreCompleto", "nacionalidad"],
        verificador.did,
        "Arriendo"
      );

      const sujeto = presentacion.verifiableCredential[0].credentialSubject;

      // Atributos revelados: deben mostrar el valor real
      assert.equal(sujeto.nombreCompleto, "María Elena García Rodríguez");
      assert.equal(sujeto.nacionalidad, "Dominicana");

      // Atributos ocultos: deben estar enmascarados
      assert.ok(sujeto.fechaNacimiento.includes("[OCULTO"));
      assert.ok(sujeto.numeroCedula.includes("[OCULTO"));
      assert.ok(sujeto.direccion.includes("[OCULTO"));
      assert.ok(sujeto.estadoCivil.includes("[OCULTO"));
    });

    it("los atributos ocultos deben incluir un hash como prueba de existencia", () => {
      const presentacion = crearPresentacion(
        titular,
        credencialVerificable,
        ["nombreCompleto"],
        verificador.did,
        "Test"
      );

      const sujeto = presentacion.verifiableCredential[0].credentialSubject;
      assert.ok(
        sujeto.fechaNacimiento.includes("hash:"),
        "Los ocultos deben tener hash"
      );
    });

    it("debe registrar qué atributos fueron revelados y ocultos", () => {
      const presentacion = crearPresentacion(
        titular,
        credencialVerificable,
        ["nombreCompleto", "numeroCedula"],
        verificador.did,
        "Test"
      );

      assert.deepEqual(
        presentacion.atributosRevelados,
        ["nombreCompleto", "numeroCedula"]
      );
      assert.ok(presentacion.atributosOcultos.includes("fechaNacimiento"));
      assert.ok(presentacion.atributosOcultos.includes("nacionalidad"));
      assert.ok(presentacion.atributosOcultos.includes("direccion"));
      assert.ok(presentacion.atributosOcultos.includes("estadoCivil"));
    });

    it("debe incluir el destinatario y propósito", () => {
      const presentacion = crearPresentacion(
        titular,
        credencialVerificable,
        ["nombreCompleto"],
        verificador.did,
        "Solicitud de arriendo"
      );

      assert.equal(presentacion.destinatario, verificador.did);
      assert.equal(presentacion.proposito, "Solicitud de arriendo");
    });

    it("la firma debe ser del titular, no del emisor", () => {
      const presentacion = crearPresentacion(
        titular,
        credencialVerificable,
        ["nombreCompleto"],
        verificador.did,
        "Test"
      );

      assert.ok(presentacion.proof.verificationMethod.includes(titular.did));
      assert.equal(presentacion.proof.proofPurpose, "authentication");
    });

    it("debe poder revelar todos los atributos si se desea", () => {
      const todos = listarAtributosDisponibles(credencialVerificable);
      const presentacion = crearPresentacion(
        titular,
        credencialVerificable,
        todos,
        verificador.did,
        "Test completo"
      );

      assert.equal(presentacion.atributosOcultos.length, 0);

      const sujeto = presentacion.verifiableCredential[0].credentialSubject;
      for (const attr of todos) {
        assert.ok(
          !sujeto[attr].includes("[OCULTO"),
          `${attr} debería estar visible`
        );
      }
    });

    it("debe poder ocultar todos los atributos excepto uno", () => {
      const presentacion = crearPresentacion(
        titular,
        credencialVerificable,
        ["nacionalidad"],
        verificador.did,
        "Solo verificar nacionalidad"
      );

      assert.equal(presentacion.atributosRevelados.length, 1);
      assert.equal(presentacion.atributosOcultos.length, 5);
    });
  });
});
