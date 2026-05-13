# Folio — Convertisseur PDF Professionnel

SaaS de conversion de fichiers PDF : convertissez, compressez et manipulez vos PDF sans friction. Hébergé en France, conforme RGPD.

## Stack technique

- **Frontend** : React + Vite + TailwindCSS + Framer Motion
- **Backend** : Node.js + Express + BullMQ + Redis
- **Conversions** : LibreOffice headless + Ghostscript + pdf-lib
- **Infra** : Docker Compose

## Démarrage rapide (développement)

### Prérequis
- Node.js 18+
- Redis (local ou via Docker)
- LibreOffice (`brew install --cask libreoffice` sur macOS)
- Ghostscript (`brew install ghostscript`)

### 1. Installer les dépendances

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Lancer Redis

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Lancer le serveur API

```bash
cd server && npm run dev
# → http://localhost:4000
```

### 4. Lancer le worker de conversion (optionnel sans Redis local)

```bash
cd server && npm run worker
```

### 5. Lancer le client React

```bash
cd client && npm run dev
# → http://localhost:3000
```

## Démarrage avec Docker Compose (production)

```bash
docker-compose up --build
```

- Client : http://localhost:3000
- API : http://localhost:4000

## Structure du projet

```
folio/
├── client/                 # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # Button, Badge, Toggle, Toast, FileCard, ProgressBar
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── hooks/
│   │   │   └── useConvert.js   # Logique upload + polling
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Convert.jsx     # Interface de conversion
│   │   │   └── Pricing.jsx     # Page tarifs
│   │   └── styles/
│   │       └── globals.css     # Variables CSS + Tailwind
│   └── index.html
├── server/                 # Express API
│   └── src/
│       ├── index.js            # Point d'entrée
│       ├── routes/
│       │   └── convert.js      # Endpoints /api/*
│       ├── workers/
│       │   └── convertWorker.js # BullMQ worker
│       ├── middleware/
│       │   └── upload.js       # Multer + validation MIME
│       └── utils/
│           └── cleanup.js      # Suppression auto après 1h
├── uploads/                # Fichiers temporaires (auto-nettoyage)
├── converted/              # Fichiers convertis (auto-nettoyage)
├── docker-compose.yml
└── README.md
```

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/upload` | Upload d'un fichier (multipart) |
| `POST` | `/api/convert` | Lance une conversion |
| `GET` | `/api/status/:jobId` | Polling de l'état du job |
| `GET` | `/api/download/:jobId` | Téléchargement du résultat |
| `DELETE` | `/api/cancel/:jobId` | Annulation et nettoyage |

## Outils disponibles

| Outil | Route | Conversion |
|-------|-------|------------|
| PDF → Word | `/convert/pdf-to-word` | LibreOffice |
| PDF → Excel | `/convert/pdf-to-excel` | LibreOffice |
| Word → PDF | `/convert/word-to-pdf` | LibreOffice |
| Compresser PDF | `/convert/compress` | Ghostscript |
| Fusionner PDFs | `/convert/merge` | pdf-lib |
| OCR Scan → Texte | `/convert/ocr` | ocrmypdf |

## Sécurité

- Validation MIME côté serveur (pas uniquement l'extension)
- Noms de fichiers sanitizés (path traversal prevention)
- Rate limiting : 10 req/min par IP
- Headers de sécurité via Helmet
- Suppression automatique des fichiers après 1 heure (cron toutes les 5 min)
- Aucun log du contenu des fichiers

## Design

Direction artistique : **Luxe industriel minimal**

- Palette : `#FAFAF8` (fond) · `#0A0A0A` (texte) · `#C17A3F` (accent cuivré)
- Typographie : Playfair Display (titres) + DM Sans (corps)
- Animations : Framer Motion, 200ms ease-out, jamais de bounce
