// Product Catalog Data with customization specifications
const PRODUCTS = [
  // --- READY TO SHIP PRODUCTS (No photo upload needed, buy as shown) ---
  {
    id: "geode-resin-clock-ready",
    name: "Emerald & Gold Leaf Geode Resin Wall Clock",
    category: "clock",
    categoryName: "Photo Clocks & Watches",
    tag: "Ready to Ship",
    isCustomizable: false,
    basePrice: 2899,
    originalPrice: 3899,
    rating: 4.98,
    reviewsCount: 84,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
    description: "In-Stock Finished Piece. Hand-poured emerald green epoxy resin with crushed raw quartz crystals, 24K gold foil veins, and silent sweep golden clock hands. Ships within 24 hours.",
    deliveryNotice: "Dispatches Tomorrow • No Photo Needed",
    sizes: [
      { label: '12" Diameter (As Shown)', price: 2899, id: "12-inch" }
    ]
  },
  {
    id: "botanical-resin-plaque-ready",
    name: "Real Preserved Crimson Rose Resin Keepsake",
    category: "resin",
    categoryName: "Resin Art",
    tag: "Ready to Ship",
    isCustomizable: false,
    basePrice: 1899,
    originalPrice: 2599,
    rating: 4.92,
    reviewsCount: 110,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    description: "In-Stock Finished Piece. Crystal-clear museum grade epoxy preserving real dried crimson roses and gold shimmer. Includes solid teakwood display stand. Ready to gift.",
    deliveryNotice: "Dispatches Tomorrow • No Photo Needed",
    sizes: [
      { label: '10" Diameter (As Shown)', price: 1899, id: "10-inch" }
    ]
  },
  {
    id: "ocean-wave-tray-ready",
    name: "Ocean Foam 3D Resin Art Plaque",
    category: "resin",
    categoryName: "Resin Art",
    tag: "Ready to Ship",
    isCustomizable: false,
    basePrice: 1999,
    originalPrice: 2799,
    rating: 4.95,
    reviewsCount: 67,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    description: "In-Stock Finished Piece. Multi-layer realistic ocean surf with white crashing lacing seafoam and natural sand base. Ships immediately with acrylic easel stand.",
    deliveryNotice: "Dispatches Tomorrow • No Photo Needed",
    sizes: [
      { label: '10" Round (As Shown)', price: 1999, id: "10-inch" }
    ]
  },

  // --- CUSTOMIZABLE PRODUCTS (Customer uploads photo & custom names) ---
  {
    id: "resin-flower-keepsake",
    name: "Personalized Preserved Floral Resin Photo Keepsake",
    category: "resin",
    categoryName: "Resin Art",
    tag: "Personalized",
    isCustomizable: true,
    basePrice: 1699,
    originalPrice: 2499,
    rating: 4.9,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted crystal-clear epoxy resin plaque embedding your personal photo with real preserved baby's breath flowers and 24K gold foil leaf accents.",
    deliveryNotice: "Made to Order • Dispatch in 3-5 days",
    customizerType: "resin",
    sizes: [
      { label: '8" Diameter (Tabletop)', price: 1699, id: "8-inch" },
      { label: '10" Diameter (Popular)', price: 2299, id: "10-inch" },
      { label: '12" Diameter (Centerpiece)', price: 2999, id: "12-inch" }
    ],
    shapes: ["Circular Disc", "Romantic Heart", "Modern Hexagon"],
    foilColors: ["Gold Foil", "Silver Shimmer", "Rose Gold", "No Foil"],
    standIncluded: "Solid Teakwood Easel Stand Included"
  },
  {
    id: "photo-wall-clock",
    name: "Customized Photo Resin Wall Clock",
    category: "clock",
    categoryName: "Photo Clocks & Watches",
    tag: "Personalized",
    isCustomizable: true,
    basePrice: 2499,
    originalPrice: 3499,
    rating: 4.95,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
    description: "A luxury 100% silent sweep quartz clock customized with your memorable photo inside high-gloss resin with Roman numerals and golden metal needle hands.",
    deliveryNotice: "Made to Order • Dispatch in 3-5 days",
    customizerType: "clock",
    sizes: [
      { label: '10" Wall Clock', price: 2499, id: "10-inch" },
      { label: '12" Statement Clock', price: 3299, id: "12-inch" },
      { label: '14" Grand Clock', price: 4199, id: "14-inch" }
    ],
    needleStyles: ["Golden Royal", "Minimalist Black", "Silver Sleek"],
    dialStyles: ["Roman Numerals", "Minimal Dots", "Modern Numbers"],
    standIncluded: "Heavy Duty Wall Hook & Battery Included"
  },
  {
    id: "couple-led-frame",
    name: "Eternal Couple Warm-LED Photo Shadow Box",
    category: "couple",
    categoryName: "Couple Frames",
    tag: "Personalized",
    isCustomizable: true,
    basePrice: 1899,
    originalPrice: 2699,
    rating: 4.88,
    reviewsCount: 215,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
    description: "Deep shadow box wooden frame featuring your couple portrait illuminated with warm-white fairy LED backlight. Creates a magical bedroom glow.",
    deliveryNotice: "Made to Order • Dispatch in 3-5 days",
    customizerType: "couple",
    sizes: [
      { label: '8x10" Desk Frame', price: 1899, id: "8x10" },
      { label: '10x12" Wall Frame', price: 2499, id: "10x12" },
      { label: '12x15" Master Frame', price: 3199, id: "12x15" }
    ],
    frameColors: ["Matte Black", "Rustic Walnut", "Ivory White"],
    lightingModes: ["Warm Golden Glow", "Dual Mode (USB + Battery)"]
  },
  {
    id: "acrylic-floating-frame",
    name: "Dual-Layer Acrylic Floating Couple Frame",
    category: "couple",
    categoryName: "Couple Frames",
    tag: "Personalized",
    isCustomizable: true,
    basePrice: 1499,
    originalPrice: 2199,
    rating: 4.85,
    reviewsCount: 64,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    description: "High-grade UV-printed acrylic sheets held by solid brass standoffs. Gives your cherished couple portrait a borderless floating glass effect.",
    deliveryNotice: "Made to Order • Dispatch in 3-5 days",
    customizerType: "couple",
    sizes: [
      { label: '6x8" Compact', price: 1499, id: "6x8" },
      { label: '8x10" Standard', price: 1999, id: "8x10" },
      { label: '11x14" Gallery', price: 2699, id: "11x14" }
    ],
    frameColors: ["Gold Standoffs", "Chrome Silver", "Matte Black"],
    lightingModes: ["Standard Clear", "Frosted Edge Glow"]
  },
  {
    id: "classic-wood-memory-frame",
    name: "Heritage Teakwood Inscribed Memory Frame",
    category: "framing",
    categoryName: "Framing Photos",
    tag: "Personalized",
    isCustomizable: true,
    basePrice: 1299,
    originalPrice: 1899,
    rating: 4.9,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    description: "Solid natural teakwood frame with museum-grade anti-glare glass and precision laser-engraved custom nameplate on the bottom bezel.",
    deliveryNotice: "Made to Order • Dispatch in 3-5 days",
    customizerType: "framing",
    sizes: [
      { label: '8x10" Frame', price: 1299, id: "8x10" },
      { label: '10x12" Frame', price: 1699, id: "10x12" },
      { label: '12x18" Frame', price: 2299, id: "12x18" }
    ],
    frameColors: ["Natural Teak", "Dark Walnut", "Vintage Distressed White"],
    standIncluded: "Dual Wall Hook & Tabletop Stand"
  }
];

// Curated Sample Pictures (Artisan Portfolio with Ready-To-Ship options)
const INITIAL_SAMPLES = [
  {
    id: "sample-1",
    title: "12\" Royal Midnight Resin Wall Clock",
    category: "clock",
    categoryName: "Photo Clocks",
    imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
    tags: ["in-stock", "roman-dial", "gold-needles", "ready-to-ship"],
    isFeatured: true,
    isReadyToShip: true,
    price: 2499,
    date: "Sep 2026",
    description: "In stock finished clock with metallic gold flakes and silent sweep mechanism. Buy this exact piece today."
  },
  {
    id: "sample-2",
    title: "Preserved Rose Petals & Gold Flake Keepsake",
    category: "resin",
    categoryName: "Resin Art",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    tags: ["in-stock", "preserved-roses", "24k-gold", "ready-to-ship"],
    isFeatured: true,
    isReadyToShip: true,
    price: 1799,
    date: "Aug 2026",
    description: "Finished 10-inch circular resin art disc embedding preserved red roses and gold flakes. Ready to ship."
  },
  {
    id: "sample-3",
    title: "Warm-White LED Couple Shadow Box",
    category: "couple",
    categoryName: "Couple Frames",
    imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
    tags: ["custom-order", "led-glow", "romantic", "bedroom-decor"],
    isFeatured: true,
    isReadyToShip: false,
    price: 1899,
    date: "Sep 2026",
    description: "Sample custom engagement piece with soft fairy LED backlight. Order a customized piece with your photo."
  },
  {
    id: "sample-4",
    title: "Ocean Foam 3D Resin Art Plaque",
    category: "resin",
    categoryName: "Resin Art",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    tags: ["in-stock", "seafoam", "3d-waves", "ready-to-ship"],
    isFeatured: false,
    isReadyToShip: true,
    price: 1999,
    date: "Aug 2026",
    description: "Finished multi-layer ocean surf plaque with real sand base and white seafoam waves. Ships in 24 hrs."
  },
  {
    id: "sample-5",
    title: "Minimalist Brass-Standoff Floating Portrait",
    category: "couple",
    categoryName: "Couple Frames",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    tags: ["custom-order", "acrylic", "floating"],
    isFeatured: false,
    isReadyToShip: false,
    price: 1499,
    date: "Jul 2026",
    description: "Custom portrait showcase with brass standoffs. Customize this design with your own photo."
  },
  {
    id: "sample-6",
    title: "Vintage Laser-Engraved Heritage Teakwood",
    category: "framing",
    categoryName: "Classic Frames",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    tags: ["custom-order", "solid-teak", "museum-glass"],
    isFeatured: false,
    isReadyToShip: false,
    price: 1299,
    date: "Jul 2026",
    description: "Solid teakwood keepsake frame with laser inscribed brass plaque. Customize with your family photo."
  }
];

const REVIEWS = [
  {
    author: "Pooja & Rohan S.",
    occasion: "1st Wedding Anniversary",
    product: "Handcrafted Resin Photo Wall Clock",
    rating: 5,
    date: "2 days ago",
    comment: "The clock looks 10x more stunning in real life! The resin gloss is incredible and the photo of our pheras inside looks crystal clear. Silent movement is totally noise-free!",
    verified: true
  },
  {
    author: "Kavita M.",
    occasion: "Husband's Birthday",
    product: "Preserved Floral Resin Photo Keepsake",
    rating: 5,
    date: "1 week ago",
    comment: "Ordered the 10-inch circular resin art. The gold foil shimmer with real dried roses around our photo looks like a museum luxury piece. He was literally in tears. Thank you LuxeCraft!",
    verified: true
  },
  {
    author: "Aditya & Meera",
    occasion: "Engagement Gift",
    product: "Eternal Couple Warm-LED Photo Frame",
    rating: 5,
    date: "2 weeks ago",
    comment: "The LED backlighting gives such a cozy romantic vibe to our bedroom bedside table. The names engraved at the bottom are so crisp. WhatsApp preview confirmation was super helpful!",
    verified: true
  }
];

const SAMPLE_PHOTOS = [
  {
    name: "Romantic Couple",
    url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Wedding Vows",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sunset Hug",
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80"
  }
];
