# 🎓 Starknet Bootcamp NFT

Este es el proyecto final para el Bootcamp de Starknet. Es una dApp (Aplicación Descentralizada) construida con **Scaffold-Stark 2**, que permite a los profesores gestionar una lista de alumnos aprobados y a los estudiantes acuñar (mint) su propio NFT como certificado de finalización del curso.

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- [Node.js](https://nodejs.org/en/download/) (v18.17 o superior)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1 o v3+)
- [Scarb](https://docs.swmansion.com/scarb/download.html) (Versión 2.x para compilar contratos en Cairo)
- [Starkli](https://book.starkli.rs/installation) (Para interactuar con la red y hacer el deploy)
- Una billetera Starknet en tu navegador (ej. [Argent X](https://www.argent.xyz/argent-x/) o [Braavos](https://braavos.app/))

## 📦 1. Clonar e Instalar

Clona este repositorio en tu máquina local e instala automáticamente las dependencias para todos los espacios de trabajo (frontend y contratos):

```bash
git clone https://github.com/BeyonderCrypto/starknet-bootcamp-nft.git
cd starknet-bootcamp-nft
yarn install
```

## 🛠️ 2. Compilar los Smart Contracts (Cairo)

Usando la configuración nativa de Scaffold-Stark, puedes compilar los contratos directamente desde la raíz del proyecto ejecutando:

```bash
yarn compile
```

Esto procesará el contrato `BootcampNFT.cairo` dentro del paquete `snfoundry` y generará los artefactos listos para el deploy.

## ⚙️ 3. Configuración para Deploy en Sepolia (.env)

Para hacer el deploy en la red de pruebas **Starknet Sepolia**, necesitas configurar tus variables de entorno y tu cuenta de Starkli en el paquete de contratos.

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

Vuelve a la **carpeta raíz del proyecto** y ejecuta el script integrado de Scaffold-Stark para hacer el deploy en la red Sepolia:

```bash
cd ../../  # Volver a la raíz (si estabas en snfoundry)
yarn deploy --network sepolia
```

> **Rol del Administrador:** La billetera que realiza el deploy (`ACCOUNT_ADDRESS`) quedará registrada automáticamente en el contrato como el **Administrador**. Sólo el administrador puede habilitar estudiantes para el minteo.

Gracias a Scaffold-Stark, las direcciones del contrato y sus ABIs se exportarán y actualizarán automáticamente en el Frontend (`packages/nextjs/contracts/deployedContracts.ts`).

## 💻 5. Iniciar el Frontend

Para iniciar la interfaz web, ejecuta el siguiente comando desde la **raíz del proyecto**:

```bash
yarn start
```

La aplicación arrancará automáticamente en [http://localhost:3000](http://localhost:3000). Asegúrate de conectar tu billetera (Argent X o Braavos) en la red **Starknet Sepolia Testnet**.

---

## 👥 Flujo de Uso y Accesos

### 👨‍🏫 Administrador (Profesor)
- La interfaz para administradores está ubicada en `http://localhost:3000/admin`.
- **Condición Estricta:** Solo la **billetera que hizo el deploy** puede acceder a las funciones y ejecutar acciones de administrador.
- **Acciones:**
  - El administrador puede registrar a los alumnos de manera masiva mediante un campo de texto o subiendo un archivo `.txt`/`.csv`.
  - Al hacer click en "Register Students", Scaffold-Stark se encargará de gestionar el `MultiCall` respectivo para registrar a todos los alumnos calificados en el Smart Contract.

### 🎓 Estudiante (Participante)
- Los estudiantes acceden directamente a la página de inicio `http://localhost:3000`.
- **Condición Estricta:** Antes de poder interactuar, deben conectar su billetera a la red Sepolia.
- **Acciones:**
  - Si el Profesor ya añadió su dirección a la lista blanca (aprobados), el botón principal de **Mint NFT** estará habilitado y podrán obtener su certificado.
  - Si no han sido aprobados por el profesor, el botón de Mint permanecerá deshabilitado o arrojará un error indicando que la dirección no tiene autorización.
