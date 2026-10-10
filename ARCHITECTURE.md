# Architecture & Technical Design Document

**LuxeCraft Studio** — Bespoke Resin Art & Photo Gifting E-Commerce Platform

---

## 1. Executive Summary & Design Philosophy

LuxeCraft Studio is an ultra-fast, zero-build, client-orchestrated e-commerce application engineered specifically for personalized resin artwork, floral keepsakes, and customized photo gifting.

### Key Architectural Tenets:
1. **Zero-Build Architecture**: Runs natively in modern web browsers without requiring Node.js bundlers (Webpack/Vite/Rollup) during runtime or deployment. Can be served from any static web server, CDN, Netlify, GitHub Pages, or Docker.
2. **Real-Time Client-Side Customizer**: Composite rendering engine utilizing HTML5 Canvas, SVG overlays, CSS transform filters, and specular lighting models for instantaneous visual feedback without server-side rendering lag.
3. **Resilient Dual-Tier Persistence**: Operates in hybrid mode — leveraging **Supabase Cloud Database (PostgreSQL 15)** for worldwide cross-device synchronization, and seamlessly falling back to browser `localStorage` for offline resilience.
4. **Dual Conversion Funnel**: Bridges automated online cart checkout with high-touch direct WhatsApp Business ordering.
5. **Real-time Bi-directional Synchronization**: Supabase WebSocket channels keep storefront galleries, customer tracking, and the seller operations studio in lockstep.

---

## 2. High-Level System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Frontend Client Layer (Browser)"]
        direction TB
        UI["Tailwind CSS 3 + Lucide UI\nResponsive Storefront"]
        Customizer["🎨 Interactive Customizer Engine\n(Canvas + Gloss + LED + Clock)"]
        Cart["🛒 Cart & State Store\n(Local Storage + Memory)"]
        AuthModal["🔐 Auth & Recovery Modal\n(Email / Mobile No.)"]
        SellerStudio["💼 Seller Operations Studio\n(SHA-256 Protected)"]
    end

    subgraph ServiceIntegrations["🔌 External Services & Gateways"]
        WhatsApp["💬 WhatsApp Business API\n(+91 87893 32585)"]
        PaymentMock["💳 Payment Gateway Layer\n(UPI / Cards / COD)"]
        CDN["🌐 Static CDN / Netlify Edge"]
    end

    subgraph CloudBackend["☁️ Supabase Cloud Backend (PostgreSQL 15)"]
        direction TB
        AuthService["Supabase Auth Service\nJWT & Email Recovery"]
        
        subgraph PostgresDB["PostgreSQL Database"]
            ProfilesTable[("profiles\nCustomer Metadata")]
            OrdersTable[("orders\nOrder Details & Status")]
            SamplesTable[("samples\nGallery & Showcase")]
        end

        RealtimeService["Supabase Realtime Engine\nWebSocket Publication/Subscription"]
    end

    UI --> Customizer
    Customizer --> Cart
    Cart --> WhatsApp
    Cart --> PaymentMock
    PaymentMock --> OrdersTable

    AuthModal --> AuthService
    AuthService --> ProfilesTable

    SellerStudio --> OrdersTable
    SellerStudio --> SamplesTable

    SamplesTable -.->|WebSocket Broadcast| RealtimeService
    RealtimeService -.->|Live Push| UI
    OrdersTable -.->|Live Status| UI

    CDN --> ClientLayer
```

---

## 3. Interactive Photo Customizer Rendering Pipeline

The customizer mimics a 3-dimensional poured epoxy resin piece with layered physical aesthetics:

```mermaid
flowchart LR
    PhotoUpload["📸 Customer Photo Upload\n(Local File / Camera)"] --> ImageLoader["Image Decoder & Object URL"]
    
    subgraph CompositeStack["Composite Rendering Stack"]
        BaseLayer["Layer 0: Premium Teakwood / Black Acrylic Base"]
        PhotoLayer["Layer 1: Scaled & Centered Photo Canvas"]
        EpoxyGloss["Layer 2: High-Gloss Specular Highlight (Linear Gradient)"]
        FoilLayer["Layer 3: 24K Gold Leaf Flakes & Flitter"]
        FloralBorder["Layer 4: Preserved Botanical & Floral Garland"]
        ClockMovement["Layer 5: Clock Hands Engine (Hour / Min / Sec Quartz)"]
        LEDLayer["Layer 6: Warm Amber LED Backlight Glow (3000K)"]
        TextOverlay["Layer 7: Custom Laser Inscription (Script / Serif / Modern)"]
    end

    ImageLoader --> PhotoLayer
    BaseLayer --> CompositeStack
    EpoxyGloss --> CompositeStack
    FoilLayer --> CompositeStack
    FloralBorder --> CompositeStack
    ClockMovement --> CompositeStack
    LEDLayer --> CompositeStack
    TextOverlay --> CompositeStack

    CompositeStack --> RealtimePreview["👁️ Instant Live Interactive Preview"]
    CompositeStack --> ThumbnailGenerator["🖼️ Cart Item Thumbnail DataURI"]
```

### Rendering Pipeline Mechanics:
1. **Dynamic Lighting**: CSS filters (`drop-shadow`, `box-shadow`, `hue-rotate`) emulate internal LED strip diffusion.
2. **Dynamic Inscription**: Real-time reactive data bindings update couple names and anniversary dates in selected typography:
   - *Calligraphy Script*: Handcrafted romantic flow.
   - *Luxury Serif*: High-fashion museum framing aesthetic.
   - *Modern Clean*: Minimalist contemporary look.
3. **Dynamic Clockwork**: Live mathematical calculation for quartz clock hands based on current client time or static aesthetic showcase time.

---

## 4. Database Schema & Supabase Architecture

The database runs on Supabase (PostgreSQL 15) with Row-Level Security (RLS) policies ensuring data isolation and client safety.

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        text full_name
        text email
        text phone
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        text order_id PK
        uuid user_id FK
        text customer_name
        text customer_email
        text customer_phone
        text delivery_address
        text pin_code
        jsonb items
        numeric total_amount
        text payment_method
        int status_step
        text status_label
        text tracking_number
        timestamp created_at
    }

    SAMPLES {
        text id PK
        text title
        text category
        text category_name
        text image_url
        jsonb tags
        boolean is_featured
        boolean is_ready_to_ship
        boolean is_customizable
        numeric price
        text description
        timestamp created_at
    }

    PROFILES ||--o{ ORDERS : "places"
```

### Table Definitions & Purpose:
1. **`profiles`**: Stores customer identity data linked to Supabase Auth UID. Allows registration with either Email or Mobile Number.
2. **`orders`**: Contains immutable order snapshots, including item customized parameters (photo thumbnails, dimensions, LED options, inscriptions), delivery addresses, and a 5-step progression tracker.
3. **`samples`**: Global showcase gallery of seller-uploaded sample pictures. Seller uploads from Mac are compressed and saved here, enabling customers on any mobile or desktop worldwide to view them.

---

## 5. Order Lifecycle & Status Progression State Machine

Orders move through a strict 5-stage artisan manufacturing workflow managed via the Seller Studio:

```mermaid
stateDiagram-v2
    [*] --> Step1_DesignQueue : Order Placed
    Step1_DesignQueue : Step 1: Design Queue (Preview Pending)
    Step1_DesignQueue --> Step2_ResinPour : Seller Approves Layout
    
    Step2_ResinPour : Step 2: Artisan Resin Pouring & Casting
    Step2_ResinPour --> Step3_Curing : UV & Chemical Casting Done
    
    Step3_Curing : Step 3: 48hr Curing & Diamond Polishing
    Step3_Curing --> Step4_Inspection : Hardness & Polish Verified
    
    Step4_Inspection : Step 4: Final Quality Check & Gift Boxing
    Step4_Inspection --> Step5_Dispatched : Courier Waybill Generated
    
    Step5_Dispatched : Step 5: Express Dispatched with Courier Tracking
    Step5_Dispatched --> [*] : Delivery Completed
```

---

## 6. Authentication & Password Recovery Workflow

The system provides flexible authentication: customers can register with an email address or mobile number, with integrated password reset handling:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as LuxeCraft Web Client
    participant SupabaseAuth as Supabase Auth Service
    participant Mail as Customer Email Inbox
    participant WhatsApp as Store WhatsApp (+91 87893 32585)

    alt Password Reset via Email
        Customer->>Frontend: Clicks "Forgot Password?" & enters Email
        Frontend->>SupabaseAuth: auth.resetPasswordForEmail(email, { redirectTo })
        SupabaseAuth->>Mail: Dispatches Password Reset Email with magic token
        Customer->>Mail: Clicks recovery link in email
        Mail->>Frontend: Redirects to site with #type=recovery&access_token=...
        Frontend->>Frontend: onAuthStateChange('PASSWORD_RECOVERY') triggers
        Frontend->>Customer: Displays "Set New Password" Modal
        Customer->>Frontend: Submits New Password (min 6 characters)
        Frontend->>SupabaseAuth: auth.updateUser({ password })
        SupabaseAuth-->>Frontend: Password Updated & Session Refreshed
        Frontend->>Customer: Alert "Password Saved!" & Signs in customer
    else Mobile-Only Account Recovery
        Customer->>Frontend: Enters registered Phone Number
        Frontend->>Frontend: Detects phone-only account
        Frontend->>WhatsApp: Generates 1-Click WhatsApp Support link
        WhatsApp->>Customer: Seller verifies customer & resets password securely
    end
```

---

## 7. Cross-Device Seller Sample Media Pipeline

To ensure photos uploaded by the seller on a Mac are accessible instantly to mobile users worldwide without exhausting database limits, images go through an in-browser optimization pipeline:

```mermaid
flowchart TD
    SellerDevice["🖥️ Seller Mac / Mobile"] --> FileSelect["Select Sample Photo (Up to 25MB)"]
    FileSelect --> CanvasCompressor["HTML5 Offscreen Canvas Compressor\n- Aspect-preserving resize (Max 1200px)\n- WebP/JPEG quality balance (0.82)\n- Output size: ~75KB - 110KB"]
    CanvasCompressor --> Base64Payload["Base64 Encoded Image Data"]
    Base64Payload --> UpsertDB["Supabase Postgres: samples table (upsert)"]
    UpsertDB --> BroadcastChannel["Supabase Realtime Channel: public:samples"]
    BroadcastChannel --> PhoneA["📱 Customer iPhone (Delhi)"]
    BroadcastChannel --> PhoneB["📱 Customer Android (Mumbai)"]
    BroadcastChannel --> DesktopC["💻 Customer Desktop (London)"]
```

---

## 8. Security & Access Control Model

1. **Seller Operations Studio**:
   - Protected by administrative authorization passcode verified using irreversible SHA-256 cryptographic hashing.
   - Sessions are protected via cryptographic client state checks.
2. **Supabase Row-Level Security (RLS)**:
   - `samples`: Public SELECT (read), authenticated/admin upsert & delete.
   - `orders`: Public INSERT (guest checkout permitted), SELECT filtered by authenticated user UID or customer email, UPDATE restricted to admin.
   - `profiles`: SELECT & UPDATE restricted to profile owner (`auth.uid() = id`).
3. **Data Sanitization**:
   - Customer inscriptions, addresses, and order inputs are sanitized to prevent XSS.
   - Strict length constraints on couple names and messages.

---

## 9. Deployment Topologies

LuxeCraft Studio is ready for deployment across multiple infrastructure environments:

| Environment | Hosting Method | Configuration |
|---|---|---|
| **Netlify / Vercel** | Drag-and-drop or Git continuous deployment | Zero build step (`Publish directory: .`) |
| **GitHub Pages** | Static Pages Branch (`main` / `docs`) | Standard web root hosting |
| **Docker Container** | `docker-compose up` | Lightweight Nginx/Python alpine container |
| **Local Standalone** | `python3 server.py` | Built-in Python HTTP server on port 8080 |
