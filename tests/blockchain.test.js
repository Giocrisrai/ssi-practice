/**
 * Tests para el simulador de blockchain.
 * Verifica el registro de DIDs, anclaje de credenciales y revocación.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearDID } from "../src/did.js";
import { BlockchainSimulada } from "../src/blockchain-simulator.js";

describe("Blockchain Simulada", () => {
  describe("inicialización", () => {
    it("debe iniciar con el bloque génesis", () => {
      const bc = new BlockchainSimulada();

      assert.equal(bc.cadena.length, 1);
      assert.equal(bc.cadena[0].indice, 0);
      assert.equal(bc.cadena[0].datos.tipo, "GENESIS");
      assert.equal(bc.cadena[0].hashAnterior, "0");
    });

    it("debe iniciar con registros vacíos", () => {
      const bc = new BlockchainSimulada();

      assert.equal(bc.registroDIDs.length, 0);
      assert.equal(bc.registroCredenciales.length, 0);
      assert.equal(bc.listaRevocacion.length, 0);
    });
  });

  describe("registrarDID()", () => {
    it("debe agregar un bloque al registrar un DID", () => {
      const bc = new BlockchainSimulada();
      const identidad = crearDID("Test");

      bc.registrarDID(identidad.registroBlockchain);

      assert.equal(bc.cadena.length, 2); // génesis + registro
      assert.equal(bc.registroDIDs.length, 1);
      assert.equal(bc.cadena[1].datos.tipo, "REGISTRO_DID");
    });

    it("cada bloque debe referenciar el hash del anterior", () => {
      const bc = new BlockchainSimulada();
      const id1 = crearDID("Uno");
      const id2 = crearDID("Dos");

      bc.registrarDID(id1.registroBlockchain);
      bc.registrarDID(id2.registroBlockchain);

      assert.equal(bc.cadena[1].hashAnterior, bc.cadena[0].hash);
      assert.equal(bc.cadena[2].hashAnterior, bc.cadena[1].hash);
    });

    it("debe poder registrar múltiples DIDs", () => {
      const bc = new BlockchainSimulada();

      for (let i = 0; i < 5; i++) {
        bc.registrarDID(crearDID(`Actor ${i}`).registroBlockchain);
      }

      assert.equal(bc.registroDIDs.length, 5);
      assert.equal(bc.cadena.length, 6); // génesis + 5 registros
    });
  });

  describe("buscarDID()", () => {
    it("debe encontrar un DID registrado", () => {
      const bc = new BlockchainSimulada();
      const identidad = crearDID("María");
      bc.registrarDID(identidad.registroBlockchain);

      const resultado = bc.buscarDID(identidad.did);
      assert.equal(resultado.did, identidad.did);
    });

    it("debe retornar undefined para un DID no registrado", () => {
      const bc = new BlockchainSimulada();
      const resultado = bc.buscarDID("did:example:noexiste");

      assert.equal(resultado, undefined);
    });
  });

  describe("anclarCredencial()", () => {
    it("debe anclar el hash de una credencial", () => {
      const bc = new BlockchainSimulada();
      const registro = {
        hashCredencial: "abc123",
        emisorDID: "did:example:emisor",
        titularDID: "did:example:titular",
        tipo: "CedulaDeIdentidad",
        timestamp: new Date().toISOString(),
      };

      bc.anclarCredencial(registro);

      assert.equal(bc.registroCredenciales.length, 1);
      const ultimoBloque = bc.cadena[bc.cadena.length - 1];
      assert.equal(ultimoBloque.datos.tipo, "HASH_CREDENCIAL");
    });
  });

  describe("revocarCredencial()", () => {
    it("debe registrar una revocación", () => {
      const bc = new BlockchainSimulada();
      const revocacion = {
        hashCredencial: "abc123",
        revocadaPor: "did:example:emisor",
        razon: "Datos incorrectos",
        timestamp: new Date().toISOString(),
      };

      bc.revocarCredencial(revocacion);

      assert.equal(bc.listaRevocacion.length, 1);
      const ultimoBloque = bc.cadena[bc.cadena.length - 1];
      assert.equal(ultimoBloque.datos.tipo, "REVOCACION");
    });
  });

  describe("integridad de la cadena", () => {
    it("cada bloque debe tener un hash único", () => {
      const bc = new BlockchainSimulada();
      bc.registrarDID(crearDID("A").registroBlockchain);
      bc.registrarDID(crearDID("B").registroBlockchain);
      bc.registrarDID(crearDID("C").registroBlockchain);

      const hashes = bc.cadena.map((b) => b.hash);
      const hashesUnicos = new Set(hashes);
      assert.equal(hashes.length, hashesUnicos.size, "Todos los hashes deben ser únicos");
    });

    it("los índices deben ser secuenciales", () => {
      const bc = new BlockchainSimulada();
      bc.registrarDID(crearDID("A").registroBlockchain);
      bc.registrarDID(crearDID("B").registroBlockchain);

      bc.cadena.forEach((bloque, i) => {
        assert.equal(bloque.indice, i);
      });
    });
  });
});
