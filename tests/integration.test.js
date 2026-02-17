/**
 * Tests de integración: flujo completo SSI.
 * Verifica que todos los módulos funcionan correctamente juntos.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearDID } from "../src/did.js";
import { emitirCredencial, revocarCredencial } from "../src/credential.js";
import { crearPresentacion, listarAtributosDisponibles } from "../src/presentation.js";
import { verificarPresentacion } from "../src/verifier.js";
import { BlockchainSimulada } from "../src/blockchain-simulator.js";

describe("Flujo completo SSI (integración)", () => {
  it("debe completar el flujo: DID → Credencial → Presentación → Verificación", () => {
    // 1. Crear actores
    const ciudadano = crearDID("Carlos Pérez");
    const autoridad = crearDID("Registro Civil");
    const verificador = crearDID("Banco Nacional");
    const blockchain = new BlockchainSimulada();

    blockchain.registrarDID(ciudadano.registroBlockchain);
    blockchain.registrarDID(autoridad.registroBlockchain);
    blockchain.registrarDID(verificador.registroBlockchain);

    assert.equal(blockchain.registroDIDs.length, 3);

    // 2. Emitir credencial
    const { credencialVerificable, hashCredencial, registroBlockchain } =
      emitirCredencial(autoridad, ciudadano.did, "CedulaDeIdentidad", {
        nombreCompleto: "Carlos Andrés Pérez",
        fechaNacimiento: "1985-06-20",
        nacionalidad: "Venezolano",
        numeroCedula: "V-12345678",
        direccion: "Av. Bolívar 100, Caracas",
      });

    blockchain.anclarCredencial(registroBlockchain);
    assert.equal(blockchain.registroCredenciales.length, 1);

    // 3. Crear presentación selectiva
    const presentacion = crearPresentacion(
      ciudadano,
      credencialVerificable,
      ["nombreCompleto", "nacionalidad"],
      verificador.did,
      "Apertura de cuenta bancaria"
    );

    assert.equal(presentacion.atributosRevelados.length, 2);
    assert.equal(presentacion.atributosOcultos.length, 3);

    // 4. Verificar
    const resultados = verificarPresentacion(
      presentacion,
      autoridad.claves.clavePublica,
      ciudadano.claves.clavePublica,
      blockchain.listaRevocacion
    );

    assert.equal(resultados.esValida, true);
    assert.equal(resultados.detalles.proposito, "Apertura de cuenta bancaria");
  });

  it("debe fallar verificación tras revocación de credencial", () => {
    const ciudadano = crearDID("Ana López");
    const autoridad = crearDID("Registro Civil");
    const verificador = crearDID("Empleador");
    const blockchain = new BlockchainSimulada();

    blockchain.registrarDID(ciudadano.registroBlockchain);
    blockchain.registrarDID(autoridad.registroBlockchain);

    const { credencialVerificable } = emitirCredencial(
      autoridad,
      ciudadano.did,
      "CedulaDeIdentidad",
      { nombreCompleto: "Ana López", nacionalidad: "Colombiana" }
    );

    // Revocar
    const revocacion = revocarCredencial(
      credencialVerificable.id,
      autoridad,
      "Fraude detectado"
    );
    blockchain.revocarCredencial(revocacion);

    // Crear presentación e intentar verificar
    const presentacion = crearPresentacion(
      ciudadano,
      credencialVerificable,
      ["nombreCompleto"],
      verificador.did,
      "Solicitud de empleo"
    );

    const resultados = verificarPresentacion(
      presentacion,
      autoridad.claves.clavePublica,
      ciudadano.claves.clavePublica,
      blockchain.listaRevocacion
    );

    assert.equal(resultados.esValida, false, "Credencial revocada no debe ser válida");
  });

  it("debe permitir múltiples credenciales para un mismo titular", () => {
    const ciudadano = crearDID("Laura Díaz");
    const registroCivil = crearDID("Registro Civil");
    const universidad = crearDID("UASD");
    const blockchain = new BlockchainSimulada();

    // Credencial 1: Cédula de identidad
    const cedula = emitirCredencial(
      registroCivil,
      ciudadano.did,
      "CedulaDeIdentidad",
      { nombreCompleto: "Laura Díaz", nacionalidad: "Dominicana" }
    );

    // Credencial 2: Título universitario
    const titulo = emitirCredencial(
      universidad,
      ciudadano.did,
      "TituloUniversitario",
      { nombreCompleto: "Laura Díaz", carrera: "Medicina", honores: "Magna Cum Laude" }
    );

    blockchain.anclarCredencial(cedula.registroBlockchain);
    blockchain.anclarCredencial(titulo.registroBlockchain);

    assert.equal(blockchain.registroCredenciales.length, 2);

    // Verificar ambas credenciales por separado
    assert.ok(cedula.credencialVerificable.type.includes("CedulaDeIdentidad"));
    assert.ok(titulo.credencialVerificable.type.includes("TituloUniversitario"));
    assert.notEqual(cedula.hashCredencial, titulo.hashCredencial);
  });

  it("diferentes presentaciones del mismo titular deben revelar datos distintos", () => {
    const ciudadano = crearDID("Roberto Mejía");
    const emisor = crearDID("Registro Civil");
    const empleador = crearDID("TechCorp");
    const banco = crearDID("Banco Popular");

    const { credencialVerificable } = emitirCredencial(
      emisor,
      ciudadano.did,
      "CedulaDeIdentidad",
      {
        nombreCompleto: "Roberto Mejía",
        fechaNacimiento: "1992-11-30",
        nacionalidad: "Dominicano",
        numeroCedula: "002-9876543-1",
        direccion: "Av. Winston Churchill 50",
      }
    );

    // Presentación para empleador: solo nombre y nacionalidad
    const presEmpleo = crearPresentacion(
      ciudadano,
      credencialVerificable,
      ["nombreCompleto", "nacionalidad"],
      empleador.did,
      "Solicitud de empleo"
    );

    // Presentación para banco: nombre y cédula
    const presBanco = crearPresentacion(
      ciudadano,
      credencialVerificable,
      ["nombreCompleto", "numeroCedula"],
      banco.did,
      "Apertura de cuenta"
    );

    // El empleador no ve la cédula
    assert.ok(presEmpleo.atributosOcultos.includes("numeroCedula"));
    // El banco no ve la nacionalidad
    assert.ok(presBanco.atributosOcultos.includes("nacionalidad"));

    // Ambas verifican exitosamente
    const r1 = verificarPresentacion(
      presEmpleo, emisor.claves.clavePublica, ciudadano.claves.clavePublica, []
    );
    const r2 = verificarPresentacion(
      presBanco, emisor.claves.clavePublica, ciudadano.claves.clavePublica, []
    );

    assert.equal(r1.esValida, true);
    assert.equal(r2.esValida, true);
  });

  it("un impostor no puede crear una presentación válida con el DID de otro", () => {
    const ciudadanoReal = crearDID("María Real");
    const impostor = crearDID("Impostor");
    const emisor = crearDID("Registro Civil");
    const verificador = crearDID("Verificador");

    const { credencialVerificable } = emitirCredencial(
      emisor,
      ciudadanoReal.did,
      "CedulaDeIdentidad",
      { nombreCompleto: "María Real", nacionalidad: "Dominicana" }
    );

    // El impostor intenta crear una presentación con la credencial de María
    const presentacionFalsa = crearPresentacion(
      impostor,  // Firma con SU clave, no la de María
      credencialVerificable,
      ["nombreCompleto"],
      verificador.did,
      "Intento de suplantación"
    );

    // La verificación con la clave pública de María falla
    const resultados = verificarPresentacion(
      presentacionFalsa,
      emisor.claves.clavePublica,
      ciudadanoReal.claves.clavePublica,  // Clave de María, no del impostor
      []
    );

    assert.equal(resultados.esValida, false);
  });
});
