# Recurso 3.3.2 – Práctica de Identidad Soberana (SSI)

## Descripción

Este repositorio contiene código educativo que simula el flujo completo de **Identidad Soberana (Self-Sovereign Identity - SSI)**:

1. **Creación de un DID** para un ciudadano (Identificador Descentralizado)
2. **Emisión de una Verifiable Credential** por una autoridad (Registro Civil)
3. **Generación de una Verifiable Presentation** con divulgación selectiva
4. **Verificación criptográfica** por un tercero (arrendadora, empleador, banco)

Al ejecutar y modificar este código, comprenderás:
- Cómo funcionan las **firmas digitales** en el contexto de identidad
- Qué datos quedan en **blockchain** y cuáles permanecen **off-chain** bajo control del usuario
- Cómo implementar un caso de uso de **confianza distribuida** (IL3.3)
- Las implicaciones **regulatorias y de protección de datos** (IL3.4)

## Requisitos

- **Node.js v18+** (usa `node --version` para verificar)
- No requiere dependencias externas (usa solo módulos nativos de Node.js)

## Instalación

```bash
git clone <URL-del-repositorio>
cd ssi-practice
```

No necesitas `npm install` — el proyecto usa solo la librería estándar de Node.js.

## Estructura del Proyecto

```
ssi-practice/
├── demo.js                          # Demo completo (ejecuta todo el flujo)
├── src/
│   ├── crypto-utils.js              # Utilidades criptográficas (Ed25519)
│   ├── did.js                       # Creación de DIDs
│   ├── credential.js                # Emisión de Verifiable Credentials
│   ├── presentation.js              # Verifiable Presentations (divulgación selectiva)
│   ├── verifier.js                  # Verificación criptográfica
│   ├── blockchain-simulator.js      # Simulador de blockchain educativo
│   ├── 01-crear-did.js              # Paso 1: Crear DIDs
│   ├── 02-emitir-credencial.js      # Paso 2: Emitir credencial
│   ├── 03-crear-presentacion.js     # Paso 3: Presentación selectiva
│   └── 04-verificar-credencial.js   # Paso 4: Verificación
├── ejercicios/
│   ├── ejercicio1.js                # Emitir título universitario
│   ├── ejercicio2.js                # Presentación selectiva para empleo
│   └── ejercicio3.js                # Revocación + análisis regulatorio
├── package.json
└── README.md
```

## Uso Rápido

### Ejecutar el demo completo

```bash
node demo.js
```

### Ejecutar paso a paso

```bash
node src/01-crear-did.js
node src/02-emitir-credencial.js
node src/03-crear-presentacion.js
node src/04-verificar-credencial.js
```

### Ejecutar ejercicios

```bash
node ejercicios/ejercicio1.js
node ejercicios/ejercicio2.js
node ejercicios/ejercicio3.js
```

## Guía de la Práctica

### Parte 1: Explorar el Demo (30 min)

1. Ejecuta `node demo.js` y lee la salida completa
2. Identifica en la salida:
   - ¿Qué datos están en blockchain?
   - ¿Qué datos están off-chain?
   - ¿Cómo funciona la divulgación selectiva?
3. Lee el código fuente de `demo.js` y los módulos en `src/`

### Parte 2: Paso a Paso (30 min)

Ejecuta cada paso individualmente y lee los comentarios en el código:

1. `node src/01-crear-did.js` — Entiende cómo se crean los DIDs
2. `node src/02-emitir-credencial.js` — Observa la emisión y firma
3. `node src/03-crear-presentacion.js` — Experimenta con divulgación selectiva
4. `node src/04-verificar-credencial.js` — Verifica y prueba la seguridad

### Parte 3: Ejercicios Prácticos (60 min)

Cada ejercicio tiene instrucciones detalladas en los comentarios del archivo:

| Ejercicio | Tema | Dificultad |
|-----------|------|------------|
| `ejercicio1.js` | Emitir un título universitario como VC | Básico |
| `ejercicio2.js` | Presentación selectiva para empleo y banco | Intermedio |
| `ejercicio3.js` | Revocación + análisis regulatorio | Avanzado |

## Conceptos Clave

### ¿Qué es un DID?

Un **Identificador Descentralizado (DID)** es un identificador globalmente único que no depende de ninguna autoridad centralizada. El usuario lo controla porque posee la clave privada asociada.

```
did:example:a1b2c3d4e5f6...
```

### ¿Qué es una Verifiable Credential?

Es el equivalente digital de un documento oficial (cédula, título, certificado) con propiedades criptográficas que permiten verificar su autenticidad **sin contactar al emisor**.

### ¿Qué es una Verifiable Presentation?

Permite al titular compartir **solo ciertos atributos** de sus credenciales. Por ejemplo, probar que tienes un título universitario sin revelar tu promedio.

### On-Chain vs Off-Chain

| En Blockchain (público) | Fuera de Blockchain (privado) |
|------------------------|-------------------------------|
| DIDs (identificadores) | Datos personales |
| Claves públicas | Claves privadas |
| Hashes de credenciales | Contenido de credenciales |
| Registros de revocación | Presentaciones verificables |

## Preguntas de Reflexión Regulatoria (IL3.4)

Al completar los ejercicios, reflexiona sobre:

1. **Responsabilidad**: ¿Quién es responsable si una credencial contiene datos fraudulentos?
2. **Protección de datos**: ¿Cumple este modelo con la normativa de protección de datos (GDPR)?
3. **Derecho al olvido**: Si hay hashes en blockchain que no se pueden borrar, ¿se vulnera este derecho?
4. **Recuperación**: ¿Qué pasa si un ciudadano pierde su clave privada?
5. **Gobernanza**: ¿Quién debería regular las credenciales verificables en tu país?

## Tecnologías Usadas

- **Node.js** con módulos ES (ESM)
- **Ed25519** para firmas digitales (curva elíptica moderna)
- **SHA-256** para hashing
- **crypto** (módulo nativo de Node.js, sin dependencias externas)

## Referencias

- [W3C DID Specification](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [DIF (Decentralized Identity Foundation)](https://identity.foundation/)

## Licencia

MIT — Uso libre para fines educativos.
