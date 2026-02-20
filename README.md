<div align="center">

# Pokelytro

App web para explorar Pokémon usando stack **MEAN**: **Angular (frontend)** + **Node/Express (backend)** + **MongoDB Atlas (DB)**.

<a href="https://pokelytro.vercel.app" target="_blank">
  <img alt="Ver Demo" src="https://img.shields.io/badge/Ver%20Demo-pokelytro.vercel.app-000?style=for-the-badge&logo=vercel" />
</a>

<br/><br/>

<img alt="Angular" src="https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=angular&logoColor=white" />
<img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
<img alt="Express" src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
<img alt="MongoDB Atlas" src="https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />

</div>

---

## Demo

- https://pokelytro.vercel.app

---

## Estructura del proyecto

```text
/
├─ frontend/   # Angular
└─ backend/    # Node.js + Express (API)
```

---

## Requisitos

- Node.js (LTS recomendado)
- npm
- Angular CLI (`npm i -g @angular/cli`) si vas a usar `ng` en local
- MongoDB Atlas (una URI de conexión válida)

---

## Configuración (MongoDB Atlas + variables de entorno)

En `./backend` crea un archivo `.env` (si tu proyecto usa dotenv) con algo como:

```bash
PORT=3000
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"
```

## Instalación y ejecución (local)

### 1) Backend (API)

```bash
cd backend
npm install
npm run dev
```

La API normalmente quedará en:
- `http://localhost:3000`

### 2) Frontend (Angular)

```bash
cd frontend
npm install
ng serve -o
```

Frontend en:
- `http://localhost:4200`

---

## Build (producción)

### Frontend
```bash
cd frontend
ng build
```

### Backend
```bash
cd backend
npm run build
npm start
```

---

## Despliegue

- **Frontend**: Vercel (demo: https://pokelytro.vercel.app)
- **Base de datos**: MongoDB Atlas
- **Backend**: Node + Express

---


## Autores

- @pitumola
- @RubenMMPS
- @ahmad-azhari

