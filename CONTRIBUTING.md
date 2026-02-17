# Guia para Estudiantes

## Como entregar tu trabajo

### 1. Hacer Fork del repositorio

Haz clic en el boton **Fork** en la esquina superior derecha del repositorio en GitHub.

### 2. Clonar tu Fork

```bash
git clone https://github.com/TU-USUARIO/ssi-practice.git
cd ssi-practice
```

### 3. Crear una rama de trabajo

```bash
git checkout -b practica-ssi
```

### 4. Resolver los ejercicios

Abre los archivos en `ejercicios/` y:

1. Lee las instrucciones en los comentarios del archivo
2. Descomenta el codigo marcado con `TODO`
3. Completa las partes faltantes
4. Para el **ejercicio 3**, responde las preguntas regulatorias como comentarios al final del archivo

### 5. Verificar tu trabajo

```bash
# Ejecutar todos los tests
npm test

# O ejecutar tests por modulo
npm run test:crypto
npm run test:did
npm run test:credential
npm run test:presentation
npm run test:verifier
npm run test:integration

# Probar tus ejercicios
node ejercicios/ejercicio1.js
node ejercicios/ejercicio2.js
node ejercicios/ejercicio3.js
```

### 6. Hacer commit y push

```bash
git add ejercicios/
git commit -m "Resuelvo ejercicios de practica SSI"
git push origin practica-ssi
```

### 7. Crear un Pull Request

Desde GitHub, crea un Pull Request desde tu rama `practica-ssi` hacia `main` **de tu propio fork**.

En la descripcion del PR incluye:

- Ejercicios completados (1, 2 y/o 3)
- Resultado de `npm test` (cuantos tests pasan)
- Tus respuestas a las preguntas regulatorias del ejercicio 3

## Que se evalua

| Criterio | Peso |
|----------|------|
| Ejercicio 1: Emision de titulo universitario funciona correctamente | 25% |
| Ejercicio 2: Presentacion selectiva con datos correctos revelados/ocultos | 25% |
| Ejercicio 3: Revocacion funciona y verificacion detecta credencial revocada | 25% |
| Ejercicio 3: Respuestas a preguntas regulatorias (IL3.4) | 25% |

## Criterios de calidad

- El codigo debe ejecutar sin errores (`node ejercicios/ejercicioX.js`)
- Los tests deben pasar (`npm test`)
- Las respuestas regulatorias deben demostrar comprension de:
  - Quien es responsable en caso de fraude
  - Como se protegen los datos personales
  - Las tensiones entre blockchain inmutable y derecho al olvido
  - Mecanismos de recuperacion de identidad

## Problemas frecuentes

### "Cannot find module"

Asegurate de estar en la carpeta `ssi-practice/` al ejecutar los comandos.

### "crypto is not defined"

Necesitas Node.js version 18 o superior. Verifica con:

```bash
node --version
```

### Los tests fallan despues de modificar un ejercicio

Los tests validan los modulos en `src/`, no los ejercicios directamente. Si los tests fallan, probablemente modificaste un archivo en `src/` por error. Revisa con `git diff src/`.

### No se como empezar un ejercicio

Lee primero el archivo del paso correspondiente en `src/`. Por ejemplo, para el ejercicio 1, estudia `src/02-emitir-credencial.js` — tiene el patron exacto que necesitas seguir.
