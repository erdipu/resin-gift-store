# LuxeCraft Studio 💎
### Bespoke Resin Art, Keepsakes & Personalized Photo Gifting E-Commerce Store

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Frontend: Vanilla JS](https://img.shields.io/badge/Frontend-ES6%2B%20%7C%20TailwindCSS-orange.svg)](https://tailwindcss.com/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Zero Build](https://img.shields.io/badge/Build-Zero%20Dependency-brightgreen.svg)]()

A high-converting, responsive e-commerce storefront featuring an **Interactive Live Photo Customizer Studio**, real-time **Supabase Cloud Database sync**, customer order tracking, and dual checkout funnels (Direct Online Gateway + WhatsApp Business).

---

## 🌟 Key Features

### 1. 🎨 Interactive Live Customizer Studio
- **Customer Photo Upload**: Instant drag-and-drop or camera file upload with aspect-ratio centering.
- **Physical Resin Aesthetics Simulation**:
  - High-gloss epoxy sheen with specular light reflections.
  - 24K gold foil flakes and floating sparkle elements.
  - Preserved botanical flower garland frame border.
  - Quartz clock hands movement for customized wall clocks.
  - Toggleable **Warm LED Backlight Glow** (3000K warm amber drop-shadow).
- **Personalized Inscription Engine**: Real-time laser engraving typography for couple names, anniversary dates, and sentimental quotes. Choose between *Calligraphy Script*, *Luxury Serif*, and *Modern Clean*.
- **Dynamic Pricing Engine**: Automatically updates base price according to size dimensions (8", 10", 12", 14"), LED circuit add-on, and luxury gift wrapping.

### 2. 🔐 Customer Accounts & Secure Password Recovery
- Flexible signup: Customers can register using either **Email Address** OR **Mobile Number** (only 1 mandatory).
- Full **Forgot Password** recovery flow powered by Supabase Auth with automatic recovery token handling and in-app password update modal.
- 1-Click WhatsApp verification fallback for phone-only registered accounts.

### 3. 📦 Real-Time Customer Order Tracking
- Dedicated **"My Custom Orders"** modal.
- 5-stage artisan manufacturing progress bar:
  1. *Design Queue (Preview Pending)*
  2. *Artisan Resin Pouring & Casting*
  3. *48hr Curing & Diamond Polishing*
  4. *Final Quality Check & Gift Boxing*
  5. *Express Dispatched with Courier Tracking*
- Live sync directly with Supabase `orders` table.

### 4. 💼 Administrative Seller Operations Studio
- **Passcode Protected**: Secure access using cryptographically hashed administrative credentials.
- **Live Orders Manager**: View all orders, update crafting stages, copy customer details, and 1-click WhatsApp customer chat.
- **Catalog & Sample Uploader**: Upload new sample creations from Mac or phone. Automatically compressed using HTML5 Canvas to under 100KB and synchronized across all customer devices worldwide via Supabase PostgreSQL.
- **Realtime Database Monitor**: Live connection status, SQL schema generator, and one-click cloud backup.

### 5. 🛒 Dual Checkout Experience
- **1-Click WhatsApp Ordering**: Generates structured, pre-filled WhatsApp messages with customer inscription details and order parameters directly to the artisan (`+91 87893 32585`).
- **Direct Online Checkout**: Complete address form, pin code validator, delivery date selector, and payment gateway simulator (UPI QR, Credit/Debit Card, Net Banking, and COD).

---

## 🏗️ Architecture Overview

The application follows a **Zero-Build, Client-Orchestrated Single Page Architecture**:

```
resin-gift-store/
├── index.html           # Main storefront markup, customizer canvas, and modals
├── app.js               # Application core: customizer engine, cart, auth & admin logic
├── products.js          # Product catalog and default sample creations
├── styles.css           # Custom animations, glassmorphism, and gold foil gradients
├── supabase-config.js   # Supabase client configuration and credentials
├── supabase_schema.sql  # Complete PostgreSQL schema, tables, and RLS policies
├── server.py            # Local zero-dependency Python 3 HTTP server
├── docker-compose.yml   # Containerized deployment configuration
├── ARCHITECTURE.md      # Detailed system architecture document with Mermaid diagrams
└── README.md            # Project documentation & user guide
```

For complete technical specifications, rendering pipeline breakdowns, and database ER diagrams, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🚀 Getting Started

### Option A: Run Locally with Python (Recommended)
You don't need `node.js` or `npm`. Python 3 is already available on macOS and Linux:

```bash
# 1. Navigate to the project directory
cd resin-gift-store

# 2. Start the local server
python3 server.py

# 3. Open your browser
# 👉 http://localhost:8080
```

### Option B: Run Directly in Browser
Simply double-click `index.html` to open it directly in Google Chrome, Safari, or Microsoft Edge.

### Option C: Run with Docker
```bash
docker-compose up -d
# 👉 http://localhost:8080
```

---

## ☁️ Supabase Cloud Database Setup

To enable worldwide cross-device synchronization and customer authentication:

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **SQL Editor > New Query**.
3. Copy and run the contents of [`supabase_schema.sql`](supabase_schema.sql):
   - Creates `profiles`, `orders`, and `samples` tables.
   - Sets up Row-Level Security (RLS) policies.
   - Enables Realtime publication on `samples` and `orders`.
4. Ensure your project URL and public anon key are set in [`supabase-config.js`](supabase-config.js).

---

## 🌐 Deploy to Production (Free)

### Deploy to Netlify (1-Click)
1. Log in to [Netlify](https://app.netlify.com).
2. Drag and drop the `resin-gift-store` folder into the Netlify Drop zone.
3. Your site will be live with free SSL in seconds!

### Deploy to GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Under **Branch**, select `main` and root (`/`).
4. Click **Save**. Your site will be available at `https://<username>.github.io/<repo-name>`.

---

## 🔒 Seller Access Credentials

| Field | Value |
|---|---|
| **Seller Portal URL** | Click **"Seller Portal"** in website footer |
| **Admin Access** | Protected via SHA-256 Passcode Verification |
| **Store WhatsApp** | `+91 87893 32585` |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
