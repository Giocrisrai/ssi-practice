/**
 * Simulador de Blockchain para fines educativos.
 *
 * Este módulo simula una blockchain simplificada para demostrar:
 * - Qué datos se almacenan ON-CHAIN (públicos e inmutables)
 * - Qué datos permanecen OFF-CHAIN (privados, bajo control del usuario)
 *
 * En un sistema SSI real, la blockchain almacena:
 * ✓ Documentos DID (identificadores + claves públicas)
 * ✓ Hashes de credenciales (prueba de emisión)
 * ✓ Registros de revocación
 *
 * La blockchain NO almacena:
 * ✗ Datos personales (nombre, fecha nacimiento, etc.)
 * ✗ Claves privadas
 * ✗ El contenido de las credenciales
 * ✗ Las presentaciones (son peer-to-peer)
 */

import { generarHash } from "./crypto-utils.js";

export class BlockchainSimulada {
  constructor() {
    this.cadena = [this._crearBloqueGenesis()];
    this.registroDIDs = [];
    this.registroCredenciales = [];
    this.listaRevocacion = [];
  }

  _crearBloqueGenesis() {
    return {
      indice: 0,
      timestamp: new Date().toISOString(),
      datos: { tipo: "GENESIS", mensaje: "Bloque inicial de la cadena SSI" },
      hashAnterior: "0",
      hash: generarHash("genesis"),
    };
  }

  _agregarBloque(datos) {
    const bloqueAnterior = this.cadena[this.cadena.length - 1];
    const bloque = {
      indice: this.cadena.length,
      timestamp: new Date().toISOString(),
      datos,
      hashAnterior: bloqueAnterior.hash,
      hash: generarHash(
        JSON.stringify(datos) + bloqueAnterior.hash + Date.now()
      ),
    };
    this.cadena.push(bloque);
    return bloque;
  }

  /**
   * Registra un DID en la blockchain.
   * Solo se almacena el DID y la clave pública, NUNCA datos personales.
   */
  registrarDID(registroDID) {
    this.registroDIDs.push(registroDID);
    const bloque = this._agregarBloque({
      tipo: "REGISTRO_DID",
      did: registroDID.did,
      clavePublica: registroDID.clavePublicaHex,
    });
    return bloque;
  }

  /**
   * Ancla el hash de una credencial en blockchain.
   * Solo se almacena el hash, NO el contenido de la credencial.
   */
  anclarCredencial(registroCredencial) {
    this.registroCredenciales.push(registroCredencial);
    const bloque = this._agregarBloque({
      tipo: "HASH_CREDENCIAL",
      hash: registroCredencial.hashCredencial,
      emisor: registroCredencial.emisorDID,
      tipoCredencial: registroCredencial.tipo,
    });
    return bloque;
  }

  /**
   * Registra una revocación de credencial.
   */
  revocarCredencial(revocacion) {
    this.listaRevocacion.push(revocacion);
    const bloque = this._agregarBloque({
      tipo: "REVOCACION",
      hashCredencial: revocacion.hashCredencial,
      revocadaPor: revocacion.revocadaPor,
    });
    return bloque;
  }

  /**
   * Busca un DID en el registro.
   */
  buscarDID(did) {
    return this.registroDIDs.find((r) => r.did === did);
  }

  /**
   * Imprime el estado de la blockchain mostrando qué hay on-chain vs off-chain.
   */
  imprimirEstado() {
    console.log("\n" + "=".repeat(60));
    console.log("  ESTADO DE LA BLOCKCHAIN (datos ON-CHAIN)");
    console.log("=".repeat(60));

    console.log(`\n  Total de bloques: ${this.cadena.length}`);
    console.log(`  DIDs registrados: ${this.registroDIDs.length}`);
    console.log(`  Credenciales ancladas: ${this.registroCredenciales.length}`);
    console.log(`  Revocaciones: ${this.listaRevocacion.length}`);

    console.log("\n  --- Bloques ---");
    for (const bloque of this.cadena) {
      console.log(
        `  [Bloque #${bloque.indice}] ${bloque.datos.tipo} | Hash: ${bloque.hash.substring(0, 20)}...`
      );
    }

    console.log("\n" + "-".repeat(60));
    console.log("  DATOS QUE NO ESTAN EN BLOCKCHAIN (OFF-CHAIN)");
    console.log("-".repeat(60));
    console.log("  - Nombres, fechas de nacimiento, direcciones");
    console.log("  - Contenido completo de las credenciales");
    console.log("  - Claves privadas de los usuarios");
    console.log("  - Presentaciones verificables");
    console.log("  - Historial de verificaciones");
    console.log("=".repeat(60) + "\n");
  }
}
