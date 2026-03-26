# 🎓 Starknet Bootcamp NFT

Este es el proyecto final para el Bootcamp de Starknet. Es una dApp (Aplicación Descentralizada) construida con **Scaffold-Stark 2**, que permite a los profesores gestionar una lista de alumnos aprobados y a los estudiantes acuñar (mint) su propio NFT como certificado de finalización del curso.

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- [Node.js](https://nodejs.org/en/download/) (v18.17 o superior)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1 o v3+)
- [Scarb](https://docs.swmansion.com/scarb/download.html) (Versión 2.x para compilar contratos en Cairo)
- [Starkli](https://book.starkli.rs/installation) (Para interactuar con la red y hacer el deploy)
- Una billetera Starknet en tu navegador (ej. [Argent X](https://www.argent.xyz/argent-x/) o [Braavos](https://braavos.app/))

## 📦 1. Clonar y Configurar el Proyecto

Clona este repositorio en tu máquina local e instala las dependencias necesarias:

```bash
git clone https://github.com/BeyonderCrypto/starknet-bootcamp-nft.git
cd starknet-bootcamp-nft
yarn install
```

## 🛠️ 2. Compilar los Smart Contracts (Cairo)

Los contratos inteligentes se encuentran dentro del paquete `snfoundry`. Para compilar el contrato `BootcampNFT.cairo`:

```bash
cd packages/snfoundry
scarb build
```

Si todo está correcto, Scarb generará los artefactos de compilación dentro de la carpeta `target/dev/`.

## ⚙️ 3. Configuración para Deploy en Sepolia (.env)

Para hacer el deploy en la red de pruebas **Starknet Sepolia**, necesitas configurar tus variables de entorno y tu cuenta de Starkli.

1. Navega a la carpeta de contratos y copia el archivo de entorno de ejemplo:
   ```bash
   cd packages/snfoundry
   cp .env.example .env
   ```

2. Configura tu Keystore y Account usando Starkli (si aún no tienes uno):
   ```bash
   starkli signer keystore from-key ~/.starkli-wallets/deployer/keystore.json
   starkli account fetch <TU_DIRECCION_DE_WALLET_EN_SEPOLIA> --output ~/.starkli-wallets/deployer/account.json
   ```

3. Abre el archivo `packages/snfoundry/.env` y complétalo con tus datos:
   ```env
   # Proveedor RPC para Sepolia (puedes usar BlastAPI, Infura, o Alchemy)
   RPC_URL_SEPOLIA="https://starknet-sepolia.public.blastapi.io"
   
   # La dirección de la wallet que será el Administrador (Profesor)
   ACCOUNT_ADDRESS="<0xTuDireccionWalletAdmin>"
   
   # Rutas hacia tus archivos de cuenta y keystore de starkli
   KEYSTORE_PATH="/home/tu-usuario/.starkli-wallets/deployer/keystore.json"
   ACCOUNT_PATH="/home/tu-usuario/.starkli-wallets/deployer/account.json"
   KEYSTORE_PASSWORD="TuContraseñaDelKeystore"
   ```

## 🚀 4. Hacer el Deploy en Sepolia

Con el `.env` configurado correctamente, ejecuta el siguiente script para desplegar el contrato `BootcampNFT` en Sepolia:

```bash
yarn deploy --network sepolia
```

> **Nota:** La billetera que realiza el deploy (`ACCOUNT_ADDRESS`) quedará registrada como el **Administrador** del contrato. Sólo el administrador puede agregar alumnos aprobados.

Una vez finalizado, las direcciones del contrato y sus ABIs se exportarán automáticamente a `packages/nextjs/contracts/deployedContracts.ts` para que el Frontend pueda interactuar con ellos.

## 💻 5. Iniciar el Frontend

Para arrancar la interfaz web, abre una nueva terminal, ve a la carpeta de Next.js y ejecuta:

```bash
cd packages/nextjs
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000). Asegúrate de conectar tu billetera (Argent X o Braavos) en la red **Starknet Sepolia Testnet**.

---

## 👥 Flujo de Uso y Roles

### 👨‍🏫 Administrador (Profesor)
- La interfaz del administrador está en `http://localhost:3000/admin`.
- **Condición:** Solo la **billetera que hizo el deploy** puede acceder a las funciones del administrador.
- **Acciones:**
  - En la pestaña de administrador, puedes pegar una lista de direcciones de billeteras (separadas por comas, saltos de línea, o desde un archivo `.txt`/`.csv`).
  - Al hacer click en "Agregar Alumnos" (Register Students), se ejecuta una transacción `MultiCall` (o iterativa sobre `add_approved_student`) para registrar a todos los alumnos calificados en el Smart Contract.

### 🎓 Estudiante (Participante)
- Los estudiantes entran a la página principal `http://localhost:3000`.
- Después de conectar su billetera a Sepolia:
  - Si el Profesor ya agregó su dirección a la lista de aprobados, verán habilitado el botón para hacer **Mint de su NFT**.
  - Si aún no están aprobados, el botón estará deshabilitado o indicará que no están autorizados (Not Approved).
