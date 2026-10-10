// LuxeCraft Studio - Production Application Logic
// Features: Customer Auth, Order Tracking, Seller Admin Studio, Masonry Gallery, Live Customizer & Cart

// ==========================================
// 1. STATE & STORAGE MANAGEMENT
// ==========================================

// Seed a demo order if first time
const INITIAL_DEMO_ORDERS = [
  {
    orderId: "#LC-73910",
    date: "16 Sep 2026, 04:30 PM",
    customerEmail: "pooja@gmail.com",
    customerName: "Pooja Sharma",
    customerPhone: "+91 98765 43210",
    customerAddress: "Flat 402, Sunshine Heights, Lake Road, Powai",
    customerCity: "Mumbai, Maharashtra",
    customerPincode: "400076",
    paymentMethod: "upi",
    statusStep: 3, // 1: Confirmed, 2: Mockup Approved, 3: Resin Pouring & Curing, 4: Dispatched, 5: Delivered
    statusLabel: "Resin Hand-Pouring & 48hr Curing in Progress",
    items: [
      {
        name: "Preserved Floral Resin Photo Keepsake",
        size: '10" Diameter (Popular)',
        names: "Rohan & Pooja",
        date: "Anniversary • 24.11.2023",
        photoUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
        price: 2299,
        quantity: 1,
        led: true,
        giftWrap: true
      }
    ],
    totalAmount: 2299
  },
  {
    orderId: "#LC-84102",
    date: "17 Sep 2026, 11:15 AM",
    customerEmail: "sneha.patel@gmail.com",
    customerName: "Sneha Patel",
    customerPhone: "+91 91234 56789",
    customerAddress: "Plot 42, Sector 4, City Center",
    customerCity: "Bokaro Steel City, Jharkhand",
    customerPincode: "827004",
    paymentMethod: "upi",
    statusStep: 1,
    statusLabel: "Design Queue (Preview Preparation in Progress)",
    items: [
      {
        name: "Royal Gold 12\" Floral Resin Wall Clock",
        size: '12" Wall Clock',
        names: "Vikram & Sneha",
        date: "Forever & Always",
        photoUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
        price: 2899,
        quantity: 1,
        led: false,
        giftWrap: true
      }
    ],
    totalAmount: 2899
  }
];

let cart = JSON.parse(localStorage.getItem('luxecraft_cart') || '[]');
let currentUser = JSON.parse(localStorage.getItem('luxecraft_user') || 'null');
let samples = JSON.parse(localStorage.getItem('luxecraft_samples') || 'null');
let orders = JSON.parse(localStorage.getItem('luxecraft_orders') || 'null');
let adminUnlocked = false;
let adminUploadImageBase64 = null;

// Initialize samples if not in storage
if (!samples || !Array.isArray(samples) || samples.length === 0) {
  samples = [...INITIAL_SAMPLES];
  localStorage.setItem('luxecraft_samples', JSON.stringify(samples));
}

// Initialize orders if not in storage or enrich existing demo orders with phone & address
if (!orders || !Array.isArray(orders) || orders.length === 0) {
  orders = [...INITIAL_DEMO_ORDERS];
  localStorage.setItem('luxecraft_orders', JSON.stringify(orders));
} else {
  // Enrich existing orders if customerPhone was empty
  let updated = false;
  orders = orders.map(o => {
    if (!o.customerPhone && o.customerEmail === 'pooja@gmail.com') {
      updated = true;
      return {
        ...o,
        customerPhone: "+91 98765 43210",
        customerAddress: o.customerAddress || "Flat 402, Sunshine Heights, Powai",
        customerCity: o.customerCity || "Mumbai, Maharashtra",
        customerPincode: o.customerPincode || "400076",
        paymentMethod: o.paymentMethod || "upi"
      };
    }
    return o;
  });
  if (updated) {
    localStorage.setItem('luxecraft_orders', JSON.stringify(orders));
  }
}

// Active Customizer State
let activeProduct = null;
let currentCustomizerState = {
  photoUrl: SAMPLE_PHOTOS[0].url,
  names: "Kabir & Ananya",
  date: "Forever & Always • 24.11.2023",
  fontStyle: "script",
  selectedSize: null,
  ledEnabled: true,
  giftWrap: false,
  totalPrice: 0
};

// ==========================================
// 2. DOM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Supabase Cloud Database if configured
  if (typeof initSupabaseClient === 'function') {
    initSupabaseClient();
    setupSupabaseAuthListener();
  }

  renderProducts('all');
  renderMasonryGallery('all');
  renderReviews();
  updateCartBadge();
  updateAuthUI();

  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCartDrawer);
  }

  // If user is logged in, sync orders from cloud database
  if (currentUser) {
    syncOrdersFromDatabase();
  }

  // Sync uploaded sample creations from cloud database across all devices
  if (typeof syncSamplesFromDatabase === 'function') {
    syncSamplesFromDatabase();
  }

  // Setup Realtime listener for live sample updates
  if (typeof setupSupabaseRealtimeListeners === 'function') {
    setupSupabaseRealtimeListeners();
  }

  // Check if opened from a password recovery link
  if (window.location.hash && (window.location.hash.includes('type=recovery') || window.location.hash.includes('error_code=otp_expired'))) {
    if (window.location.hash.includes('type=recovery')) {
      setTimeout(() => {
        if (typeof openResetPasswordModal === 'function') {
          openResetPasswordModal();
        }
      }, 350);
    }
  }
});

// ==========================================
// 3. STOREFRONT MASONRY GALLERY ENGINE
// ==========================================
function renderMasonryGallery(categoryFilter = 'all') {
  const container = document.getElementById('masonryGalleryContainer');
  if (!container) return;

  const filtered = categoryFilter === 'all'
    ? samples
    : categoryFilter === 'ready'
      ? samples.filter(s => s.isReadyToShip)
      : samples.filter(s => s.category === categoryFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-3 text-center py-12 text-stone-400">
        <p class="text-sm">No artwork found in this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => `
    <div class="masonry-item relative group rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300">
      <!-- Image -->
      <img src="${s.imageUrl}" alt="${s.title}" class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
      
      <!-- Badges -->
      <div class="absolute top-3 left-3 z-10 flex flex-col gap-1">
        ${s.isReadyToShip ? `
          <span class="bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <i data-lucide="zap" class="w-3 h-3"></i> Ready to Ship • ₹${(s.price || 2499).toLocaleString('en-IN')}
          </span>
        ` : ''}
        ${s.isFeatured ? `
          <span class="bg-amber-500 text-stone-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <i data-lucide="sparkles" class="w-3 h-3"></i> Featured
          </span>
        ` : ''}
      </div>

      <!-- Hover Details Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
        <div class="flex items-center gap-1.5 mb-2">
          <span class="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-full">
            ${s.categoryName || s.category}
          </span>
          ${s.isReadyToShip ? '<span class="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full">In Stock</span>' : ''}
        </div>
        
        <h4 class="font-serif font-bold text-lg leading-tight">${s.title}</h4>
        ${s.description ? `<p class="text-xs text-stone-300 mt-1 line-clamp-2">${s.description}</p>` : ''}
        
        ${s.tags && s.tags.length > 0 ? `
          <div class="flex flex-wrap gap-1 mt-2">
            ${s.tags.map(t => `<span class="text-[10px] text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded-md">#${t}</span>`).join('')}
          </div>
        ` : ''}

        <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <button onclick="openLightbox('${s.id}')" class="text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1 transition">
            <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i> Inspect
          </button>

          ${s.isReadyToShip ? `
            <button onclick="addSampleToCart('${s.id}')" class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition flex items-center gap-1 shadow-md">
              <i data-lucide="shopping-bag" class="w-3 h-3"></i>
              <span>Add to Cart (₹${(s.price || 2499).toLocaleString('en-IN')})</span>
            </button>
          ` : `
            <button onclick="orderSimilar('${s.category}', '${encodeURIComponent(s.title)}')" class="px-3.5 py-1.5 rounded-xl gold-gradient-btn text-white text-xs font-bold transition flex items-center gap-1 shadow">
              <span>Order with Photo</span>
              <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </button>
          `}
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function filterGallery(cat) {
  document.querySelectorAll('.gal-filter-btn').forEach(btn => {
    if (btn.dataset.gcat === cat) {
      btn.className = 'gal-filter-btn active px-3.5 py-1.5 text-xs font-semibold rounded-full bg-stone-900 text-white transition';
    } else {
      btn.className = 'gal-filter-btn px-3.5 py-1.5 text-xs font-medium rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition';
    }
  });

  renderMasonryGallery(cat);
}

// Order Similar Design action: Pre-loads the customizer with that inspiration!
function orderSimilar(category, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  const matchingProduct = PRODUCTS.find(p => p.category === category) || PRODUCTS[0];
  openCustomizer(matchingProduct.id);

  // Set note in input names
  const dateInput = document.getElementById('inputDate');
  if (dateInput) {
    dateInput.value = `Inspired by: ${title}`;
    updateCustomizerText();
  }
}

// Lightbox Modal
function openLightbox(sampleId) {
  const sample = samples.find(s => s.id === sampleId);
  if (!sample) return;

  document.getElementById('lightboxImg').src = sample.imageUrl;
  document.getElementById('lightboxTitle').textContent = sample.title;
  document.getElementById('lightboxCategory').textContent = sample.categoryName || sample.category;
  document.getElementById('lightboxDesc').textContent = sample.description || "100% Hand-poured UV-stabilized crystal clear epoxy resin.";
  
  const orderBtn = document.getElementById('lightboxOrderBtn');
  if (orderBtn) {
    if (sample.isReadyToShip) {
      orderBtn.className = "px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold shadow flex items-center gap-1.5";
      orderBtn.innerHTML = `<span>Add to Cart (₹${(sample.price || 2499).toLocaleString('en-IN')})</span><i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>`;
      orderBtn.onclick = () => {
        closeLightbox();
        addSampleToCart(sample.id);
      };
    } else {
      orderBtn.className = "px-5 py-2.5 rounded-xl gold-gradient-btn text-white text-xs font-bold shadow flex items-center gap-1.5";
      orderBtn.innerHTML = `<span>Order with Your Photo</span><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>`;
      orderBtn.onclick = () => {
        closeLightbox();
        orderSimilar(sample.category, encodeURIComponent(sample.title));
      };
    }
  }

  const modal = document.getElementById('lightboxModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (window.lucide) lucide.createIcons();
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// 1-Click Add to Cart for Ready-to-Ship Samples (No photo upload needed)
function addSampleToCart(sampleId) {
  const sample = samples.find(s => s.id === sampleId);
  if (!sample) return;

  const item = {
    cartId: 'item_sample_' + Date.now(),
    productId: sample.id,
    name: sample.title,
    categoryName: sample.categoryName || "Ready-to-Ship Artwork",
    photoUrl: sample.imageUrl,
    names: "Original Piece (As Shown)",
    date: "⚡ In Stock • Dispatches Tomorrow",
    size: "Finished Size",
    price: sample.price || 2499,
    giftWrap: false,
    isCustomizable: false,
    quantity: 1
  };

  cart.push(item);
  saveCart();
  openCartDrawer();
}

// 1-Click Add to Cart for Catalog Ready-to-Ship Products
function addReadyToShipToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const item = {
    cartId: 'item_ready_' + Date.now(),
    productId: product.id,
    name: product.name,
    categoryName: product.categoryName,
    photoUrl: product.image,
    names: "Original Piece (As Shown)",
    date: "⚡ In Stock • Dispatches Tomorrow",
    size: product.sizes[0].label,
    price: product.basePrice,
    giftWrap: false,
    isCustomizable: false,
    quantity: 1
  };

  cart.push(item);
  saveCart();
  openCartDrawer();
}

// ==========================================
// 4. SELLER ADMIN STUDIO (ORDERS & SAMPLES)
// ==========================================
const ORDER_STATUS_MAP = {
  1: { label: "Design Queue (Preview Preparation in Progress)", badge: "bg-amber-100 text-amber-900 border-amber-300", stepName: "1. Design Queue" },
  2: { label: "Mockup Approved by Customer", badge: "bg-blue-100 text-blue-900 border-blue-300", stepName: "2. Mockup Approved" },
  3: { label: "Resin Hand-Pouring & 48hr Curing", badge: "bg-purple-100 text-purple-900 border-purple-300", stepName: "3. Resin Curing" },
  4: { label: "Packaged & Dispatched with Courier", badge: "bg-indigo-100 text-indigo-900 border-indigo-300", stepName: "4. Dispatched" },
  5: { label: "Successfully Delivered to Customer", badge: "bg-emerald-100 text-emerald-900 border-emerald-300", stepName: "5. Delivered" }
};

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const lockScreen = document.getElementById('adminLockScreen');
  const unlockedContent = document.getElementById('adminUnlockedContent');

  if (adminUnlocked) {
    lockScreen.classList.add('hidden');
    unlockedContent.classList.remove('hidden');
    switchAdminTab('orders');
    renderAdminSampleList();
    if (typeof syncSamplesFromDatabase === 'function') syncSamplesFromDatabase();
    if (typeof syncLocalSamplesToCloud === 'function') syncLocalSamplesToCloud(false);
    if (typeof updateDbStatusUI === 'function') updateDbStatusUI();
  } else {
    lockScreen.classList.remove('hidden');
    unlockedContent.classList.add('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// Secure SHA-256 hash of administrator passcode (never exposed in plaintext in source code)
const ADMIN_PASSCODE_HASH = "793ac36d337ba33a251e362df14225a6815440d4796e010ed5607f97e8ee4938";

async function computeSha256(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function unlockAdminPanel() {
  const input = document.getElementById('adminPasscodeInput');
  const pass = input ? input.value.trim() : '';
  if (!pass) return;

  const enteredHash = await computeSha256(pass);
  const activeHash = localStorage.getItem('luxecraft_admin_hash') || ADMIN_PASSCODE_HASH;

  if (enteredHash === activeHash) {
    adminUnlocked = true;
    if (input) input.value = '';
    openAdminModal();
  } else {
    showCustomAlert({
      title: "Incorrect Passcode",
      message: "Access denied. Please enter the correct administrator passcode.",
      type: "error",
      btnText: "Try Again"
    });
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

async function promptChangeAdminPasscode() {
  const currentPass = prompt("Enter your CURRENT administrator passcode:");
  if (!currentPass) return;
  const currentHash = await computeSha256(currentPass.trim());
  const activeHash = localStorage.getItem('luxecraft_admin_hash') || ADMIN_PASSCODE_HASH;
  if (currentHash !== activeHash) {
    alert("Incorrect current passcode.");
    return;
  }
  const newPass = prompt("Enter your NEW administrator passcode (minimum 6 characters):");
  if (!newPass || newPass.trim().length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }
  const confirmPass = prompt("Confirm your NEW administrator passcode:");
  if (newPass !== confirmPass) {
    alert("Passcodes do not match.");
    return;
  }
  const newHash = await computeSha256(newPass.trim());
  localStorage.setItem('luxecraft_admin_hash', newHash);
  alert("Admin passcode changed successfully!");
}

function switchAdminTab(tab) {
  const ordersSection = document.getElementById('adminOrdersSection');
  const uploadSection = document.getElementById('adminUploadSection');
  const manageSection = document.getElementById('adminManageSection');
  const dbSection = document.getElementById('adminDbSection');

  const ordersBtn = document.getElementById('adminTabOrdersBtn');
  const uploadBtn = document.getElementById('adminTabUploadBtn');
  const manageBtn = document.getElementById('adminTabManageBtn');
  const dbBtn = document.getElementById('adminTabDbBtn');

  const activeBtnClass = 'flex-1 py-2 px-3 rounded-lg bg-white text-stone-900 shadow-sm transition flex items-center justify-center gap-1.5 font-bold';
  const inactiveBtnClass = 'flex-1 py-2 px-3 rounded-lg text-stone-500 hover:text-stone-800 transition flex items-center justify-center gap-1.5';

  if (tab === 'orders') {
    if (ordersSection) ordersSection.classList.remove('hidden');
    if (uploadSection) uploadSection.classList.add('hidden');
    if (manageSection) manageSection.classList.add('hidden');
    if (dbSection) dbSection.classList.add('hidden');

    if (ordersBtn) ordersBtn.className = activeBtnClass;
    if (uploadBtn) uploadBtn.className = inactiveBtnClass;
    if (manageBtn) manageBtn.className = inactiveBtnClass;
    if (dbBtn) dbBtn.className = inactiveBtnClass;

    refreshAdminOrders();
  } else if (tab === 'upload') {
    if (ordersSection) ordersSection.classList.add('hidden');
    if (uploadSection) uploadSection.classList.remove('hidden');
    if (manageSection) manageSection.classList.add('hidden');
    if (dbSection) dbSection.classList.add('hidden');

    if (ordersBtn) ordersBtn.className = inactiveBtnClass;
    if (uploadBtn) uploadBtn.className = activeBtnClass;
    if (manageBtn) manageBtn.className = inactiveBtnClass;
    if (dbBtn) dbBtn.className = inactiveBtnClass;
  } else if (tab === 'manage') {
    if (ordersSection) ordersSection.classList.add('hidden');
    if (uploadSection) uploadSection.classList.add('hidden');
    if (manageSection) manageSection.classList.remove('hidden');
    if (dbSection) dbSection.classList.add('hidden');

    if (ordersBtn) ordersBtn.className = inactiveBtnClass;
    if (uploadBtn) uploadBtn.className = inactiveBtnClass;
    if (manageBtn) manageBtn.className = activeBtnClass;
    if (dbBtn) dbBtn.className = inactiveBtnClass;

    renderAdminSampleList();
  } else if (tab === 'database') {
    if (ordersSection) ordersSection.classList.add('hidden');
    if (uploadSection) uploadSection.classList.add('hidden');
    if (manageSection) manageSection.classList.add('hidden');
    if (dbSection) dbSection.classList.remove('hidden');

    if (ordersBtn) ordersBtn.className = inactiveBtnClass;
    if (uploadBtn) uploadBtn.className = inactiveBtnClass;
    if (manageBtn) manageBtn.className = inactiveBtnClass;
    if (dbBtn) dbBtn.className = activeBtnClass;

    updateDbStatusUI();
  }

  if (window.lucide) lucide.createIcons();
}

async function refreshAdminOrders() {
  const refreshIcon = document.getElementById('adminRefreshIcon');
  if (refreshIcon) refreshIcon.classList.add('animate-spin');

  if (isDbConnected()) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        data.forEach(dbo => {
          const ship = dbo.shipping_details || {};
          const existing = orders.find(o => o.orderId === dbo.order_id);
          if (existing) {
            if (dbo.status_step) existing.statusStep = dbo.status_step;
            if (dbo.status_label) existing.statusLabel = dbo.status_label;
            if (dbo.customer_phone && !existing.customerPhone) existing.customerPhone = dbo.customer_phone;
            if (ship.address && !existing.customerAddress) existing.customerAddress = ship.address;
            if (ship.city && !existing.customerCity) existing.customerCity = ship.city;
            if (ship.pincode && !existing.customerPincode) existing.customerPincode = ship.pincode;
            if (ship.paymentMethod && !existing.paymentMethod) existing.paymentMethod = ship.paymentMethod;
          } else {
            orders.unshift({
              orderId: dbo.order_id,
              date: dbo.created_at ? new Date(dbo.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
              customerEmail: dbo.customer_email || '',
              customerName: dbo.customer_name || 'Customer',
              customerPhone: dbo.customer_phone || '',
              customerAddress: ship.address || '',
              customerCity: ship.city || '',
              customerPincode: ship.pincode || '',
              paymentMethod: ship.paymentMethod || 'upi',
              statusStep: dbo.status_step || 1,
              statusLabel: dbo.status_label || (ORDER_STATUS_MAP[dbo.status_step]?.label || "Design Queue"),
              items: dbo.items || [],
              totalAmount: Number(dbo.total_amount) || 0
            });
          }
        });
        localStorage.setItem('luxecraft_orders', JSON.stringify(orders));
      }
    } catch (dbErr) {
      console.warn('Could not sync orders from Supabase:', dbErr);
    }
  }

  setTimeout(() => {
    if (refreshIcon) refreshIcon.classList.remove('animate-spin');
  }, 400);

  filterAdminOrders();
}

function filterAdminOrders() {
  const searchInput = document.getElementById('adminOrderSearchInput');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filterSelect = document.getElementById('adminOrderStatusFilter');
  const filterVal = filterSelect ? filterSelect.value : 'all';

  const filtered = orders.filter(o => {
    const matchSearch = !q ||
      (o.orderId && o.orderId.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
      (o.customerCity && o.customerCity.toLowerCase().includes(q));

    const matchStatus = filterVal === 'all' || Number(o.statusStep) === Number(filterVal);
    return matchSearch && matchStatus;
  });

  renderAdminOrdersList(filtered);
}

function renderAdminOrdersList(ordersToDisplay = null) {
  const list = ordersToDisplay !== null ? ordersToDisplay : orders;
  const container = document.getElementById('adminOrdersContainer');
  if (!container) return;

  // Update Summary Metric Cards
  const totalCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const activeCount = orders.filter(o => Number(o.statusStep) < 5).length;

  const totalMetric = document.getElementById('adminMetricTotalOrders');
  if (totalMetric) totalMetric.textContent = totalCount;
  const revMetric = document.getElementById('adminMetricTotalRevenue');
  if (revMetric) revMetric.textContent = '₹' + totalRevenue.toLocaleString('en-IN');
  const activeMetric = document.getElementById('adminMetricActiveOrders');
  if (activeMetric) activeMetric.textContent = `${activeCount} in progress`;
  const badge = document.getElementById('adminOrdersCountBadge');
  if (badge) badge.textContent = totalCount;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
        <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <i data-lucide="inbox" class="w-6 h-6"></i>
        </div>
        <div class="text-sm font-bold text-stone-800">No Orders Matching Criteria</div>
        <p class="text-xs text-stone-500 max-w-sm mx-auto">
          No customer orders found matching your search. Clear your filters or check back when new orders arrive!
        </p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(order => {
    const statusInfo = ORDER_STATUS_MAP[order.statusStep] || ORDER_STATUS_MAP[1];
    const cleanPhone = (order.customerPhone || '').replace(/[^0-9+]/g, '');
    let waPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
    if (waPhone.length === 10) waPhone = '91' + waPhone;

    // WhatsApp Message
    const waGreeting = `Hello ${order.customerName || 'Customer'}! 🌸 This is LuxeCraft Studio regarding your custom order *${order.orderId}*.\n\n✨ Current Status: *${order.statusLabel || statusInfo.label}*\n💰 Total Amount: ₹${Number(order.totalAmount).toLocaleString('en-IN')}\n\nWe are handcrafting your keepsake with utmost precision. Please let us know if you need any adjustments! ✨`;

    // Payment badge
    let paymentBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">UPI / Prepaid</span>`;
    if (order.paymentMethod === 'cod') {
      paymentBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">COD (Cash on Delivery)</span>`;
    } else if (order.paymentMethod === 'card') {
      paymentBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">Card Payment</span>`;
    }

    // Render items
    const itemsHtml = (order.items || []).map((item) => {
      const itemImg = item.image || item.photoUrl || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80';
      return `
        <div class="flex items-start gap-3 p-3 bg-white rounded-xl border border-stone-200">
          <img src="${itemImg}" alt="${item.name || item.title || 'Product'}" 
               onclick="openLightbox('${itemImg}', '${item.name || 'Order Item'}')"
               class="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0 cursor-zoom-in hover:opacity-90 transition">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h5 class="font-bold text-xs text-stone-900 truncate">${item.name || item.title || 'Custom Resin Piece'}</h5>
              <span class="font-bold text-xs text-stone-800 shrink-0">₹${Number(item.price).toLocaleString('en-IN')} × ${item.quantity || 1}</span>
            </div>
            ${item.size ? `<div class="text-[11px] text-stone-500 mt-0.5">Size: <span class="font-medium text-stone-700">${item.size}</span></div>` : ''}
            ${item.names ? `
              <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] bg-amber-50/80 px-2 py-1 rounded-md border border-amber-200/60">
                <span class="font-bold text-amber-900">Custom Inscription:</span>
                <span class="font-semibold text-stone-800">"${item.names}"</span>
                ${item.date ? `<span class="text-stone-500">• "${item.date}"</span>` : ''}
              </div>
            ` : ''}
            ${(item.led || item.giftWrap) ? `
              <div class="mt-1 flex items-center gap-2 text-[10px]">
                ${item.led ? `<span class="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">💡 Warm LED Base</span>` : ''}
                ${item.giftWrap ? `<span class="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">🎁 Gift Box</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:border-amber-400/80 transition space-y-0">
        <!-- Order Card Header -->
        <div class="bg-stone-50/90 px-4 sm:px-5 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-stone-900 text-white font-mono text-xs font-bold">${order.orderId}</span>
            <span class="text-xs text-stone-500 flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3 text-stone-400"></i> ${order.date}</span>
            ${paymentBadge}
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-[10px] text-stone-400 uppercase font-semibold block">Order Total</span>
              <span class="text-base font-serif font-bold text-amber-700">₹${Number(order.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <!-- Order Card Body -->
        <div class="p-4 sm:p-5 space-y-4">
          <!-- Customer Info & Shipping Address Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200 text-xs">
            <!-- Customer Contact Column -->
            <div class="space-y-1.5">
              <div class="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                <div class="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                  <i data-lucide="user" class="w-3.5 h-3.5"></i>
                </div>
                <span>${order.customerName || 'Valued Customer'}</span>
              </div>
              <div class="pl-7 space-y-1 text-stone-600">
                <div class="flex items-center gap-2">
                  <i data-lucide="phone" class="w-3.5 h-3.5 text-stone-400 shrink-0"></i>
                  ${order.customerPhone ? `
                    <a href="tel:${cleanPhone}" class="font-bold text-stone-900 hover:text-amber-700 underline">${order.customerPhone}</a>
                    <a href="https://wa.me/${waPhone}?text=${encodeURIComponent(waGreeting)}" target="_blank" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition">
                      <i data-lucide="message-circle" class="w-3 h-3"></i>
                      <span>1-Click WhatsApp</span>
                    </a>
                  ` : `<span class="text-stone-400 italic">No phone provided</span>`}
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="mail" class="w-3.5 h-3.5 text-stone-400 shrink-0"></i>
                  ${order.customerEmail ? `
                    <a href="mailto:${order.customerEmail}" class="text-stone-700 hover:text-amber-700 hover:underline">${order.customerEmail}</a>
                  ` : `<span class="text-stone-400 italic">No email provided</span>`}
                </div>
              </div>
            </div>

            <!-- Shipping Destination Column -->
            <div class="border-t md:border-t-0 md:border-l border-stone-200 md:pl-3 pt-2.5 md:pt-0 space-y-1">
              <div class="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-600"></i>
                <span>Shipping Address</span>
              </div>
              <div class="text-stone-800 font-medium leading-relaxed">
                ${order.customerAddress ? order.customerAddress : '<span class="text-stone-400 italic">No street address entered</span>'}
                ${(order.customerCity || order.customerPincode) ? `<div class="text-stone-600 font-normal">${order.customerCity || ''} ${order.customerPincode ? `• PIN: ${order.customerPincode}` : ''}</div>` : ''}
              </div>
            </div>
          </div>

          <!-- Items Ordered Section -->
          <div class="space-y-2">
            <div class="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>Ordered Products (${(order.items || []).length} item${(order.items || []).length > 1 ? 's' : ''}):</span>
              <span class="text-[10px] text-stone-400 font-normal lowercase">(click photo to zoom)</span>
            </div>
            <div class="space-y-2">
              ${itemsHtml}
            </div>
          </div>

          <!-- Live Order Status Update Toolbar -->
          <div class="pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-2xl">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold text-stone-800">Production Status:</span>
              <select onchange="updateAdminOrderStatus('${order.orderId}', this.value)" 
                      class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs cursor-pointer">
                <option value="1" ${Number(order.statusStep) === 1 ? 'selected' : ''}>⏳ Step 1: Design Queue (Preview Preparation)</option>
                <option value="2" ${Number(order.statusStep) === 2 ? 'selected' : ''}>🎨 Step 2: Digital Mockup Approved</option>
                <option value="3" ${Number(order.statusStep) === 3 ? 'selected' : ''}>✨ Step 3: Resin Pouring & 48h Curing</option>
                <option value="4" ${Number(order.statusStep) === 4 ? 'selected' : ''}>📦 Step 4: Packaged & Dispatched with Courier</option>
                <option value="5" ${Number(order.statusStep) === 5 ? 'selected' : ''}>🎉 Step 5: Delivered to Customer</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              ${order.customerPhone ? `
                <a href="https://wa.me/${waPhone}?text=${encodeURIComponent(waGreeting)}" target="_blank" 
                   class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs">
                  <i data-lucide="send" class="w-3.5 h-3.5"></i>
                  <span>WhatsApp Status to Customer</span>
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function updateAdminOrderStatus(orderId, newStep) {
  const stepNum = Number(newStep);
  const statusInfo = ORDER_STATUS_MAP[stepNum] || ORDER_STATUS_MAP[1];

  const targetOrder = orders.find(o => o.orderId === orderId);
  if (targetOrder) {
    targetOrder.statusStep = stepNum;
    targetOrder.statusLabel = statusInfo.label;
    localStorage.setItem('luxecraft_orders', JSON.stringify(orders));
  }

  // Update in Supabase if connected
  if (isDbConnected()) {
    try {
      supabaseClient
        .from('orders')
        .update({
          status_step: stepNum,
          status_label: statusInfo.label
        })
        .eq('order_id', orderId)
        .then(({ error }) => {
          if (error) console.warn('Supabase status update error:', error);
          else console.log('✅ Supabase status updated for', orderId);
        });
    } catch (e) {
      console.warn('Could not update status in Supabase:', e);
    }
  }

  showCustomAlert({
    title: "Order Status Updated!",
    message: `Order <strong>${orderId}</strong> has been updated to: <br><span class="text-amber-700 font-semibold">${statusInfo.label}</span>`,
    type: "success",
    btnText: "Done"
  });

  filterAdminOrders();
}

function updateDbStatusUI() {
  const connected = typeof isDbConnected === 'function' && isDbConnected();
  const card = document.getElementById('adminDbStatusCard');
  const icon = document.getElementById('adminDbStatusIcon');
  const title = document.getElementById('adminDbStatusTitle');
  const desc = document.getElementById('adminDbStatusDesc');
  const badge = document.getElementById('adminDbStatusBadge');
  const dot = document.getElementById('adminDbDot');
  const urlInput = document.getElementById('supabaseUrlInput');
  const keyInput = document.getElementById('supabaseKeyInput');

  if (urlInput && SUPABASE_CONFIG?.url) urlInput.value = SUPABASE_CONFIG.url;
  if (keyInput && SUPABASE_CONFIG?.anonKey) keyInput.value = SUPABASE_CONFIG.anonKey;

  if (connected) {
    if (card) card.className = 'p-4 rounded-2xl border bg-emerald-50 border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3';
    if (icon) {
      icon.className = 'w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0';
      icon.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>';
    }
    if (title) title.textContent = 'Database Status: 🟢 Cloud Database Live!';
    if (desc) desc.textContent = `Connected to PostgreSQL. All customer registrations, logins, and orders sync automatically to the cloud.`;
    if (badge) {
      badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 shrink-0 self-start sm:self-auto';
      badge.textContent = 'PostgreSQL Active';
    }
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
  } else {
    if (card) card.className = 'p-4 rounded-2xl border bg-amber-50/80 border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3';
    if (icon) {
      icon.className = 'w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0';
      icon.innerHTML = '<i data-lucide="database" class="w-5 h-5"></i>';
    }
    if (title) title.textContent = 'Database Status: Offline / Local Storage';
    if (desc) desc.textContent = 'Connect free Supabase PostgreSQL to sync user logins and orders across all devices.';
    if (badge) {
      badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 shrink-0 self-start sm:self-auto';
      badge.textContent = 'Local Storage';
    }
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400';
  }
  if (window.lucide) lucide.createIcons();
}

function handleSaveDbSettings(event) {
  event.preventDefault();
  const url = document.getElementById('supabaseUrlInput')?.value.trim();
  const key = document.getElementById('supabaseKeyInput')?.value.trim();

  if (!url || !key) {
    alert('Please enter both your Supabase Project URL and Anon API Key.');
    return;
  }

  const success = saveSupabaseCredentials(url, key);
  if (success) {
    updateDbStatusUI();
    setupSupabaseAuthListener();
    alert('🎉 Database connected successfully! Your website is now linked to Supabase PostgreSQL.');
  } else {
    alert('Failed to initialize Supabase. Please ensure you provided a valid URL and Anon API Key.');
  }
}

function copySqlSchemaToClipboard() {
  const schema = `-- LUXECRAFT STUDIO - SUPABASE DATABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status_step INT DEFAULT 1,
  status_label TEXT DEFAULT 'Design Queue (Preview Pending)',
  shipping_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update orders" ON public.orders FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), COALESCE(new.raw_user_meta_data->>'phone', ''), new.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Samples Table (Artisan Portfolio & Storefront creations across all devices)
CREATE TABLE IF NOT EXISTS public.samples (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_ready_to_ship BOOLEAN DEFAULT true,
  is_customizable BOOLEAN DEFAULT false,
  price NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read samples" ON public.samples FOR SELECT USING (true);
CREATE POLICY "Allow public insert samples" ON public.samples FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update samples" ON public.samples FOR UPDATE USING (true);
CREATE POLICY "Allow public delete samples" ON public.samples FOR DELETE USING (true);`;

  navigator.clipboard.writeText(schema).then(() => {
    const btnText = document.getElementById('copySqlBtnText');
    if (btnText) {
      btnText.textContent = 'Copied to Clipboard!';
      setTimeout(() => { btnText.textContent = 'Copy SQL Schema'; }, 2500);
    }
  }).catch(() => {
    alert('Failed to copy to clipboard. You can also view supabase_schema.sql directly in your project folder.');
  });
}

let adminUploadSelectedFile = null;

// Client-side Canvas Image Compression: Max 1200px, 0.82 Quality WebP/JPEG
function compressImage(file, maxDimension = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = e => resolve(e.target.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = function(e) {
      const img = new Image();
      img.onerror = () => resolve(e.target.result);
      img.onload = function() {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = Math.round(maxDimension);
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        } catch (err) {
          console.warn('Canvas optimization fallback:', err);
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Upload sample image to Supabase Storage or return optimized cloud string
async function uploadSampleImageToCloud(file, optimizedBase64) {
  if (!isDbConnected() || !file) return optimizedBase64;
  try {
    const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
    const fileName = `sample_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const { data, error } = await supabaseClient.storage.from('samples').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
    if (!error && data?.path) {
      const { data: publicData } = supabaseClient.storage.from('samples').getPublicUrl(data.path);
      if (publicData?.publicUrl) {
        console.log('✅ Image uploaded to Supabase Storage bucket:', publicData.publicUrl);
        return publicData.publicUrl;
      }
    }
  } catch (storageErr) {
    console.log('Supabase storage bucket notice (storing in cloud database):', storageErr);
  }
  return optimizedBase64;
}

// Global Cloud Sync: Fetches all samples from Supabase database so all devices worldwide show them
async function syncSamplesFromDatabase() {
  if (!isDbConnected()) return;
  try {
    const { data: dbSamples, error } = await supabaseClient
      .from('samples')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase samples sync notice:', error.message);
      return;
    }

    if (Array.isArray(dbSamples) && dbSamples.length > 0) {
      const cloudSamples = dbSamples.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        categoryName: d.category_name,
        imageUrl: d.image_url,
        tags: Array.isArray(d.tags) ? d.tags : [],
        isFeatured: !!d.is_featured,
        isReadyToShip: !!d.is_ready_to_ship,
        isCustomizable: !!d.is_customizable,
        price: Number(d.price) || 1999,
        date: d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Recently',
        description: d.description || '',
        isCloudSynced: true
      }));

      // Merge: cloud samples take top priority, followed by non-duplicate initial samples
      const cloudIds = new Set(cloudSamples.map(s => s.id));
      const nonDuplicateInitial = INITIAL_SAMPLES.filter(s => !cloudIds.has(s.id));
      samples = [...cloudSamples, ...nonDuplicateInitial];
      localStorage.setItem('luxecraft_samples', JSON.stringify(samples));

      // Synchronize into storefront PRODUCTS catalog so customers can order directly
      cloudSamples.forEach(cs => {
        const prodIdx = PRODUCTS.findIndex(p => p.id === cs.id);
        const prodData = {
          id: cs.id,
          name: cs.title,
          category: cs.category,
          categoryName: cs.categoryName,
          tag: cs.isReadyToShip ? "Ready to Ship" : "Personalized",
          isCustomizable: cs.isCustomizable,
          basePrice: cs.price,
          originalPrice: Math.round(cs.price * 1.35),
          rating: 5.0,
          reviewsCount: 1,
          image: cs.imageUrl,
          description: cs.description,
          deliveryNotice: cs.isReadyToShip ? "Dispatches Tomorrow • No Photo Needed" : "Made to Order • Dispatch in 3-5 days",
          customizerType: cs.category,
          sizes: [
            { label: 'Standard Finished Size (As Shown)', price: cs.price, id: "std" }
          ]
        };

        if (prodIdx >= 0) {
          PRODUCTS[prodIdx] = prodData;
        } else {
          PRODUCTS.unshift(prodData);
        }
      });

      renderProducts('all');
      renderMasonryGallery('all');
      const badge = document.getElementById('adminSamplesCountBadge');
      if (badge) badge.textContent = samples.length;
      if (typeof renderAdminSampleList === 'function') renderAdminSampleList();
    }
  } catch (err) {
    console.warn('Failed to sync samples from Supabase database:', err);
  }
}

// Push any locally uploaded Mac samples to Supabase Cloud
async function syncLocalSamplesToCloud(showToast = true) {
  if (!isDbConnected()) {
    if (showToast) {
      showCustomAlert({
        title: "Database Not Connected",
        message: "Please connect your Supabase database in the Database Setup tab first.",
        type: "error"
      });
    }
    return;
  }

  // Find samples not in INITIAL_SAMPLES or matching sample-
  const localUploaded = samples.filter(s => {
    return !INITIAL_SAMPLES.some(init => init.id === s.id && init.imageUrl === s.imageUrl);
  });

  if (localUploaded.length === 0) {
    if (showToast) {
      showCustomAlert({
        title: "All Samples Synced! ☁️",
        message: "All sample pictures on your Mac are already backed up to your Supabase Cloud database.",
        type: "info"
      });
    }
    return;
  }

  let successCount = 0;
  let tableMissing = false;

  for (const s of localUploaded) {
    const row = {
      id: s.id,
      title: s.title,
      category: s.category,
      category_name: s.categoryName || s.category,
      image_url: s.imageUrl,
      tags: s.tags || [],
      is_featured: !!s.isFeatured,
      is_ready_to_ship: !!s.isReadyToShip,
      is_customizable: !!s.isCustomizable,
      price: Number(s.price) || 1999,
      description: s.description || ''
    };

    const { error } = await supabaseClient.from('samples').upsert(row);
    if (!error) {
      successCount++;
    } else {
      console.warn('Upsert sample error:', error);
      if (error.message && (error.message.includes('relation') || error.message.includes('does not exist'))) {
        tableMissing = true;
      }
    }
  }

  if (tableMissing) {
    showCustomAlert({
      title: "Create 'samples' Table in Supabase",
      message: "The <strong>samples</strong> table needs to be created in your Supabase SQL Editor once.<br><br>The SQL code has been copied to your clipboard. Simply paste and run it in <strong>Supabase -> SQL Editor</strong>!",
      type: "warning",
      btnText: "Copy SQL Schema"
    });
    copySqlSchemaToClipboard();
  } else if (showToast) {
    showCustomAlert({
      title: "Cloud Sync Complete! ☁️",
      message: `Successfully synced <strong>${successCount}</strong> creation${successCount > 1 ? 's' : ''} to Supabase! Customers on mobile phones and computers worldwide can now view them.`,
      type: "success"
    });
  }
}

// Supabase Realtime channel for live sample additions
function setupSupabaseRealtimeListeners() {
  if (!isDbConnected()) return;
  try {
    supabaseClient
      .channel('public:samples')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'samples' }, () => {
        console.log('⚡ Realtime sample update detected from cloud!');
        syncSamplesFromDatabase();
      })
      .subscribe();
  } catch (e) {
    console.warn('Realtime channel subscribe notice:', e);
  }
}

async function handleAdminFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  adminUploadSelectedFile = file;

  const placeholder = document.getElementById('adminUploadPlaceholder');
  const previewContainer = document.getElementById('adminUploadPreviewContainer');
  const previewImg = document.getElementById('adminUploadPreviewImg');

  // Fast direct local preview
  const reader = new FileReader();
  reader.onload = function(e) {
    if (placeholder) placeholder.classList.add('hidden');
    if (previewContainer) previewContainer.classList.remove('hidden');
    if (previewImg) previewImg.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Compress to ultra-fast high resolution cloud format
  try {
    const compressed = await compressImage(file, 1200, 0.82);
    adminUploadImageBase64 = compressed || previewImg.src;
  } catch (err) {
    console.warn('Compression notice:', err);
  }
}

function updateAdminTypeUI() {
  const selectedType = document.querySelector('input[name="sampleCustomType"]:checked')?.value || 'ready';
  const readyCard = document.getElementById('typeCardReady');
  const customCard = document.getElementById('typeCardCustom');
  if (!readyCard || !customCard) return;

  if (selectedType === 'ready') {
    readyCard.className = 'flex items-start gap-3 p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 cursor-pointer transition shadow-sm';
    customCard.className = 'flex items-start gap-3 p-3.5 rounded-2xl border-2 border-stone-200 bg-white hover:border-amber-400 cursor-pointer transition';
  } else {
    readyCard.className = 'flex items-start gap-3 p-3.5 rounded-2xl border-2 border-stone-200 bg-white hover:border-emerald-400 cursor-pointer transition';
    customCard.className = 'flex items-start gap-3 p-3.5 rounded-2xl border-2 border-amber-500 bg-amber-50/70 cursor-pointer transition shadow-sm';
  }
}

async function handleAdminUpload(event) {
  event.preventDefault();

  if (!adminUploadImageBase64) {
    showCustomAlert({
      title: "No Image Selected",
      message: "Please choose or drag a finished sample picture first.",
      type: "error"
    });
    return;
  }

  const submitBtn = document.getElementById('adminUploadSubmitBtn');
  const submitText = document.getElementById('adminUploadSubmitBtnText');
  if (submitBtn) submitBtn.disabled = true;
  if (submitText) submitText.textContent = "Publishing to Cloud Database...";

  try {
    const title = document.getElementById('sampleTitleInput').value.trim();
    const category = document.getElementById('sampleCategoryInput').value;
    const tagsString = document.getElementById('sampleTagsInput').value.trim();
    const isFeatured = document.getElementById('sampleFeaturedCheck').checked;
    const priceInput = document.getElementById('samplePriceInput').value;
    const price = Number(priceInput) || 1999;

    const selectedType = document.querySelector('input[name="sampleCustomType"]:checked')?.value || 'ready';
    const isCustomizable = (selectedType === 'custom');
    const isReadyToShip = !isCustomizable;

    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

    const categoryNames = {
      resin: "Resin Art",
      clock: "Photo Clocks",
      couple: "Couple Frames",
      framing: "Classic Frames"
    };

    // Upload to Supabase Storage or get compressed cloud string
    const finalImageUrl = await uploadSampleImageToCloud(adminUploadSelectedFile, adminUploadImageBase64);

    const newSampleId = "sample-" + Date.now();
    const newSample = {
      id: newSampleId,
      title: title || (isReadyToShip ? "Ready to Ship Piece" : "Customizable Keepsake"),
      category: category,
      categoryName: categoryNames[category] || "Custom Art",
      imageUrl: finalImageUrl,
      tags: tags,
      isFeatured: isFeatured,
      isReadyToShip: isReadyToShip,
      isCustomizable: isCustomizable,
      price: price,
      date: "Just Now",
      description: isReadyToShip
        ? "Finished ready-to-ship original piece. Buy this exact piece with no photo upload needed!"
        : "Customizable keepsake design. Customer uploads their own photo and custom names to order.",
      isCloudSynced: true
    };

    // Prepend to active samples
    samples.unshift(newSample);
    localStorage.setItem('luxecraft_samples', JSON.stringify(samples));

    // Also add to PRODUCTS catalog so it appears in both catalog & gallery!
    const newProduct = {
      id: newSample.id,
      name: newSample.title,
      category: newSample.category,
      categoryName: newSample.categoryName,
      tag: isReadyToShip ? "Ready to Ship" : "Personalized",
      isCustomizable: isCustomizable,
      basePrice: price,
      originalPrice: Math.round(price * 1.35),
      rating: 5.0,
      reviewsCount: 1,
      image: finalImageUrl,
      description: newSample.description,
      deliveryNotice: isReadyToShip ? "Dispatches Tomorrow • No Photo Needed" : "Made to Order • Dispatch in 3-5 days",
      customizerType: category,
      sizes: [
        { label: 'Standard Finished Size (As Shown)', price: price, id: "std" }
      ]
    };
    PRODUCTS.unshift(newProduct);

    // Save to Supabase Cloud Database!
    let tableMissing = false;
    if (isDbConnected()) {
      try {
        const { error: dbError } = await supabaseClient.from('samples').upsert({
          id: newSample.id,
          title: newSample.title,
          category: newSample.category,
          category_name: newSample.categoryName,
          image_url: finalImageUrl,
          tags: newSample.tags,
          is_featured: newSample.isFeatured,
          is_ready_to_ship: newSample.isReadyToShip,
          is_customizable: newSample.isCustomizable,
          price: newSample.price,
          description: newSample.description
        });

        if (!dbError) {
          console.log('✅ Sample uploaded to Supabase cloud database:', newSample.id);
        } else {
          console.warn('Supabase sample insert error:', dbError);
          if (dbError.message && (dbError.message.includes('relation') || dbError.message.includes('does not exist'))) {
            tableMissing = true;
          }
        }
      } catch (dbErr) {
        console.warn('Supabase sample insert exception:', dbErr);
      }
    }

    // Reset form
    document.getElementById('adminUploadForm').reset();
    adminUploadImageBase64 = null;
    adminUploadSelectedFile = null;
    document.getElementById('adminUploadPlaceholder').classList.remove('hidden');
    document.getElementById('adminUploadPreviewContainer').classList.add('hidden');
    updateAdminTypeUI();

    // Immediately refresh storefront catalog & gallery & count badge
    renderProducts('all');
    renderMasonryGallery('all');
    const countBadge = document.getElementById('adminSamplesCountBadge');
    if (countBadge) countBadge.textContent = samples.length;

    if (tableMissing) {
      showCustomAlert({
        title: "Almost Ready! 1 Step in Supabase",
        message: `Your piece <strong>"${newSample.title}"</strong> is saved locally, but the <strong>samples</strong> table is not yet created in your Supabase database.<br><br>The SQL code has been copied to your clipboard. Simply paste and run it in <strong>Supabase -> SQL Editor</strong> so customers on mobile phones and desktops worldwide can view it!`,
        type: "warning",
        btnText: "Copy SQL Schema"
      });
      copySqlSchemaToClipboard();
    } else {
      showCustomAlert({
        title: "Creation Published Worldwide! 🌍",
        message: `<strong>"${newSample.title}"</strong> has been saved to the cloud database!<br><br>• Selling Price: ₹${price.toLocaleString('en-IN')}<br>• Mode: ${isReadyToShip ? '⚡ Ready to Ship (1-Click Buy)' : '🎨 Customizable'}<br>• Visible across all devices, mobile phones, and computers worldwide.`,
        type: "success",
        btnText: "View in Catalog"
      });
    }

    switchAdminTab('manage');
  } catch (err) {
    console.error('Upload error:', err);
    showCustomAlert({
      title: "Upload Error",
      message: "An error occurred while uploading. Please try again.",
      type: "error"
    });
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (submitText) submitText.textContent = "Publish & Sync to Cloud Database (All Devices)";
  }
}

function renderAdminSampleList() {
  const container = document.getElementById('adminSamplesList');
  const countBadge = document.getElementById('adminSamplesCountBadge');
  if (countBadge) countBadge.textContent = samples.length;
  if (!container) return;

  if (samples.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
        <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 font-bold">
          <i data-lucide="image" class="w-6 h-6"></i>
        </div>
        <div class="text-sm font-bold text-stone-800">No Samples in Catalog</div>
        <p class="text-xs text-stone-500 mt-1">Upload a sample picture to showcase your handmade creations!</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = samples.map((s) => `
    <div class="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 bg-stone-50 gap-4 hover:border-amber-400 transition">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-14 h-14 rounded-lg overflow-hidden border border-stone-300 shrink-0 bg-stone-900 relative">
          <img src="${s.imageUrl}" class="w-full h-full object-cover">
          ${s.isReadyToShip ? '<span class="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-bold text-center py-0.5">READY</span>' : '<span class="absolute bottom-0 inset-x-0 bg-amber-600 text-white text-[8px] font-bold text-center py-0.5">CUSTOM</span>'}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] font-bold uppercase tracking-wider text-stone-700 bg-stone-200 px-2 py-0.5 rounded-md">
              ${s.categoryName || s.category}
            </span>
            ${s.isReadyToShip ? `
              <span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                ⚡ Ready to Ship • ₹${(s.price || 2499).toLocaleString('en-IN')}
              </span>
            ` : `
              <span class="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                🎨 Customizable • ₹${(s.price || 2499).toLocaleString('en-IN')}
              </span>
            `}
            ${s.isFeatured ? '<span class="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">★ Featured</span>' : ''}
            <span class="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <i data-lucide="globe" class="w-2.5 h-2.5"></i> All Devices
            </span>
          </div>
          <h5 class="text-sm font-bold text-stone-900 truncate mt-0.5">${s.title}</h5>
          <div class="text-[11px] text-stone-500">${s.isReadyToShip ? '1-Click purchase (No photo needed)' : 'Customer uploads photo & names'}</div>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button onclick="toggleSampleFeatured('${s.id}')" class="px-2.5 py-1 text-xs font-semibold rounded-lg border ${s.isFeatured ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-stone-200 text-stone-600'} hover:bg-amber-50 transition">
          ${s.isFeatured ? '★ Featured' : '☆ Pin'}
        </button>
        <button onclick="deleteSample('${s.id}')" class="p-1.5 text-stone-400 hover:text-rose-600 transition" title="Delete Artwork">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function toggleSampleFeatured(sampleId) {
  const sample = samples.find(s => s.id === sampleId);
  if (!sample) return;
  sample.isFeatured = !sample.isFeatured;
  localStorage.setItem('luxecraft_samples', JSON.stringify(samples));

  if (isDbConnected()) {
    try {
      supabaseClient.from('samples').update({ is_featured: sample.isFeatured }).eq('id', sampleId).then(() => {});
    } catch (e) {}
  }

  renderAdminSampleList();
  renderMasonryGallery('all');
}

// ==========================================
// 4.5 CUSTOM MODAL POPUPS (DAILY UI #9 STYLE)
// ==========================================
let customConfirmCallback = null;

function showCustomConfirm({
  title = "Do you really want to exit the app?",
  message = "All of the unsaved progress would be lost!",
  icon = "alert-triangle",
  confirmText = "Yes",
  cancelText = "No",
  isDestructive = true,
  onConfirm = null
}) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const descEl = document.getElementById('confirmModalDesc');
  const iconContainer = document.getElementById('confirmModalIconContainer');
  const iconEl = document.getElementById('confirmModalIcon');
  const yesBtn = document.getElementById('confirmModalYesBtn');
  const noBtn = document.getElementById('confirmModalNoBtn');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = message;
  if (yesBtn) yesBtn.textContent = confirmText;
  if (noBtn) noBtn.textContent = cancelText;

  if (iconContainer && iconEl) {
    if (isDestructive) {
      iconContainer.className = "w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4 shadow-sm";
      if (yesBtn) yesBtn.className = "flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-500/20 transition active:scale-95";
      if (noBtn) noBtn.className = "flex-1 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition active:scale-95";
    } else {
      iconContainer.className = "w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto mb-4 shadow-sm";
      if (yesBtn) yesBtn.className = "flex-1 py-3 px-4 rounded-xl gold-gradient-btn text-white font-semibold text-xs shadow-md transition active:scale-95";
      if (noBtn) noBtn.className = "flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition active:scale-95";
    }
    iconEl.setAttribute('data-lucide', icon);
    if (window.lucide) lucide.createIcons();
  }

  customConfirmCallback = onConfirm;

  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCustomConfirm(confirmed = false) {
  const modal = document.getElementById('customConfirmModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  if (!confirmed) {
    customConfirmCallback = null;
  }
}

function handleConfirmModalAction(confirmed) {
  const cb = customConfirmCallback;
  closeCustomConfirm(true);
  if (confirmed && typeof cb === 'function') {
    cb();
  }
  customConfirmCallback = null;
}

let customAlertCallback = null;

function showCustomAlert({
  title = "Success!",
  message = "Action completed successfully.",
  icon = "check",
  type = "success",
  btnText = "Continue",
  onClose = null
}) {
  const modal = document.getElementById('customAlertModal');
  const titleEl = document.getElementById('alertModalTitle');
  const descEl = document.getElementById('alertModalDesc');
  const iconContainer = document.getElementById('alertModalIconContainer');
  const iconEl = document.getElementById('alertModalIcon');
  const okBtn = document.getElementById('alertModalOkBtn');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = message;
  if (okBtn) okBtn.textContent = btnText;

  if (iconContainer && iconEl) {
    if (type === 'success') {
      iconContainer.className = "w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-sm";
      iconEl.setAttribute('data-lucide', 'check');
    } else if (type === 'error') {
      iconContainer.className = "w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4 shadow-sm";
      iconEl.setAttribute('data-lucide', 'alert-circle');
    } else {
      iconContainer.className = "w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto mb-4 shadow-sm";
      iconEl.setAttribute('data-lucide', 'info');
    }
    if (window.lucide) lucide.createIcons();
  }

  customAlertCallback = onClose;

  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCustomAlert() {
  const modal = document.getElementById('customAlertModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  if (typeof customAlertCallback === 'function') {
    customAlertCallback();
  }
  customAlertCallback = null;
}

function deleteSample(sampleId) {
  showCustomConfirm({
    title: "Remove from Gallery & Cloud?",
    message: "Are you sure you want to remove this piece from your live storefront gallery and cloud database across all devices?",
    icon: "trash-2",
    confirmText: "Yes, Remove",
    cancelText: "Cancel",
    isDestructive: true,
    onConfirm: async () => {
      samples = samples.filter(s => s.id !== sampleId);
      localStorage.setItem('luxecraft_samples', JSON.stringify(samples));

      PRODUCTS = PRODUCTS.filter(p => p.id !== sampleId);

      if (isDbConnected()) {
        try {
          await supabaseClient.from('samples').delete().eq('id', sampleId);
          console.log('✅ Deleted sample from Supabase database:', sampleId);
        } catch (dbErr) {
          console.warn('Could not delete sample from Supabase:', dbErr);
        }
      }

      renderAdminSampleList();
      renderMasonryGallery('all');
      renderProducts('all');
      const countBadge = document.getElementById('adminSamplesCountBadge');
      if (countBadge) countBadge.textContent = samples.length;

      showCustomAlert({
        title: "Sample Removed Worldwide",
        message: "The artwork has been removed from the cloud database and your live gallery.",
        type: "info"
      });
    }
  });
}

// ==========================================
// 5. CUSTOMER AUTHENTICATION ENGINE
// ==========================================
function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  switchAuthTab(mode);
  if (window.lucide) lucide.createIcons();
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotPasswordForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const authTabsNav = document.getElementById('authTabsNav');
  const errorMsg = document.getElementById('authErrorMsg');
  const statusNotice = document.getElementById('authStatusNotice');

  if (errorMsg) errorMsg.classList.add('hidden');
  if (statusNotice) statusNotice.classList.add('hidden');

  if (tab === 'login') {
    if (authTabsNav) authTabsNav.classList.remove('hidden');
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (forgotForm) forgotForm.classList.add('hidden');
    if (tabLoginBtn) tabLoginBtn.className = 'flex-1 py-2 rounded-lg bg-white text-stone-900 shadow-sm transition';
    if (tabRegisterBtn) tabRegisterBtn.className = 'flex-1 py-2 rounded-lg text-stone-500 hover:text-stone-800 transition';
  } else if (tab === 'register') {
    if (authTabsNav) authTabsNav.classList.remove('hidden');
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    if (forgotForm) forgotForm.classList.add('hidden');
    if (tabLoginBtn) tabLoginBtn.className = 'flex-1 py-2 rounded-lg text-stone-500 hover:text-stone-800 transition';
    if (tabRegisterBtn) tabRegisterBtn.className = 'flex-1 py-2 rounded-lg bg-white text-stone-900 shadow-sm transition';
  } else if (tab === 'forgot') {
    if (authTabsNav) authTabsNav.classList.add('hidden');
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (forgotForm) forgotForm.classList.remove('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

async function handleForgotPassword(event) {
  event.preventDefault();

  const inputEl = document.getElementById('forgotIdentifier');
  const identifier = (inputEl ? inputEl.value : '').trim();
  const errorEl = document.getElementById('authErrorMsg');
  const noticeEl = document.getElementById('authStatusNotice');
  const submitBtn = document.getElementById('forgotSubmitBtn');
  const btnText = document.getElementById('forgotBtnText');

  if (errorEl) errorEl.classList.add('hidden');
  if (noticeEl) noticeEl.classList.add('hidden');

  if (!identifier) {
    if (errorEl) {
      errorEl.textContent = 'Please enter your registered email address or mobile number.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> Sending Reset Link...';

  try {
    let targetEmail = identifier;

    // If identifier does not contain @, it's a mobile number
    if (!identifier.includes('@')) {
      const cleanPhone = identifier.replace(/[^0-9]/g, '');
      if (isDbConnected()) {
        try {
          const { data: profiles } = await supabaseClient
            .from('profiles')
            .select('email, phone, full_name')
            .or(`phone.eq.${identifier},phone.eq.${cleanPhone}`)
            .limit(1);

          if (profiles && profiles.length > 0 && profiles[0].email && !profiles[0].email.endsWith('@luxecraft.user')) {
            targetEmail = profiles[0].email;
          } else {
            // Customer registered with phone only without email
            showCustomAlert({
              title: "Mobile Account Recovery",
              message: `Your account is registered with mobile number <strong>${identifier}</strong>.<br><br>Please message our store support on WhatsApp with your mobile number to quickly verify and reset your access!`,
              type: "info",
              btnText: "Chat on WhatsApp",
              onClose: () => {
                const waUrl = `https://wa.me/918789332585?text=${encodeURIComponent(`Hello LuxeCraft Studio! I forgot my password for my registered mobile number ${identifier}. Please help me reset my account.`)}`;
                window.open(waUrl, '_blank');
              }
            });
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Send Password Reset Link';
            return;
          }
        } catch (phoneErr) {
          console.warn('Phone profile lookup error:', phoneErr);
        }
      }
    }

    // Now send the password reset email via Supabase Auth
    if (isDbConnected()) {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { error } = await supabaseClient.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      showCustomAlert({
        title: "Password Reset Link Sent! ✉️",
        message: `A secure password reset link has been sent to <strong>${targetEmail}</strong>.<br><br>Please check your inbox (and spam folder) and click the link to set your new password.`,
        type: "success",
        btnText: "Back to Sign In",
        onClose: () => {
          switchAuthTab('login');
        }
      });
    } else {
      // Local fallback
      showCustomAlert({
        title: "Password Reset Link Sent! ✉️",
        message: `A secure password reset link has been dispatched to <strong>${targetEmail}</strong>.`,
        type: "info",
        btnText: "Back to Sign In",
        onClose: () => {
          switchAuthTab('login');
        }
      });
    }
  } catch (err) {
    console.error('Password reset error:', err);
    if (errorEl) {
      errorEl.textContent = err.message || 'Failed to send password reset link. Please verify your email.';
      errorEl.classList.remove('hidden');
    } else {
      showCustomAlert({
        title: "Reset Request Failed",
        message: err.message || "Failed to send password reset link. Please check your email and try again.",
        type: "error"
      });
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'Send Password Reset Link';
  }
}

function openResetPasswordModal() {
  closeAuthModal();
  const modal = document.getElementById('resetPasswordModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  if (window.lucide) lucide.createIcons();
}

function closeResetPasswordModal() {
  const modal = document.getElementById('resetPasswordModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

async function handleSetNewPassword(event) {
  event.preventDefault();

  const newPass = document.getElementById('newPasswordInput').value;
  const confirmPass = document.getElementById('confirmNewPasswordInput').value;
  const errorEl = document.getElementById('resetErrorMsg');
  const submitBtn = document.getElementById('setNewPasswordBtn');
  const btnText = document.getElementById('setNewPasswordBtnText');

  if (errorEl) errorEl.classList.add('hidden');

  if (newPass.length < 6) {
    if (errorEl) {
      errorEl.textContent = 'Password must be at least 6 characters long.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (newPass !== confirmPass) {
    if (errorEl) {
      errorEl.textContent = 'Passwords do not match. Please re-enter.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> Updating Password...';

  try {
    if (isDbConnected()) {
      const { data, error } = await supabaseClient.auth.updateUser({
        password: newPass
      });

      if (error) throw error;

      closeResetPasswordModal();

      // Clean up hash from URL
      if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
      }

      showCustomAlert({
        title: "Password Updated Successfully! 🎉",
        message: "Your new password has been set. You are now securely logged in.",
        type: "success",
        btnText: "Continue Shopping"
      });

      if (data?.user) {
        currentUser = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || 'Customer',
          email: data.user.email || '',
          phone: data.user.user_metadata?.phone || ''
        };
        localStorage.setItem('luxecraft_user', JSON.stringify(currentUser));
        updateAuthUI();
      }
    } else {
      closeResetPasswordModal();
      showCustomAlert({
        title: "Password Updated! 🎉",
        message: "Your new password has been saved.",
        type: "success"
      });
    }
  } catch (err) {
    console.error('Password update error:', err);
    if (errorEl) {
      errorEl.textContent = err.message || 'Failed to update password. Your recovery link may have expired.';
      errorEl.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'Save New Password & Sign In';
  }
}

async function handleCustomerLogin(event) {
  event.preventDefault();
  const inputEl = document.getElementById('loginIdentifier') || document.getElementById('loginEmail');
  const identifier = (inputEl ? inputEl.value : '').trim();
  const password = document.getElementById('loginPassword').value;

  const errorEl = document.getElementById('authErrorMsg');
  const noticeEl = document.getElementById('authStatusNotice');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const btnText = document.getElementById('loginBtnText');

  if (errorEl) errorEl.classList.add('hidden');
  if (noticeEl) noticeEl.classList.add('hidden');

  if (!identifier) {
    if (errorEl) {
      errorEl.textContent = 'Please enter your Email Address or Mobile Number.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (isDbConnected()) {
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> Authenticating...';

    try {
      let authEmail = identifier.toLowerCase();

      // If user entered a phone number instead of email:
      if (!identifier.includes('@')) {
        const cleanPhone = identifier.replace(/[^0-9]/g, '');
        // Check if there is an existing profile associated with this phone
        try {
          const { data: foundProfiles } = await supabaseClient
            .from('profiles')
            .select('email, phone')
            .or(`phone.eq.${identifier},phone.eq.${cleanPhone}`)
            .limit(1);

          if (foundProfiles && foundProfiles.length > 0 && foundProfiles[0].email) {
            authEmail = foundProfiles[0].email;
          } else {
            authEmail = `${cleanPhone}@luxecraft.user`;
          }
        } catch (phoneLookupErr) {
          authEmail = `${cleanPhone}@luxecraft.user`;
        }
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: authEmail,
        password: password
      });

      if (error) throw error;

      let profileData = null;
      try {
        const { data: prof } = await supabaseClient.from('profiles').select('*').eq('id', data.user.id).single();
        profileData = prof;
      } catch (e) {
        console.warn('Profile fetch note:', e);
      }

      currentUser = {
        id: data.user.id,
        name: profileData?.full_name || data.user.user_metadata?.full_name || identifier.split('@')[0].toUpperCase(),
        email: profileData?.email && !profileData.email.endsWith('@luxecraft.user') ? profileData.email : (identifier.includes('@') ? identifier : ''),
        phone: profileData?.phone || data.user.user_metadata?.phone || (!identifier.includes('@') ? identifier : '')
      };

      localStorage.setItem('luxecraft_user', JSON.stringify(currentUser));
      updateAuthUI();
      closeAuthModal();

      // Sync customer orders from Supabase PostgreSQL
      await syncOrdersFromDatabase();
      showCustomAlert({
        title: `Welcome Back, ${currentUser.name}! 👋`,
        message: "You have signed in successfully.",
        type: "success",
        btnText: "Track My Orders",
        onClose: () => {
          openOrdersModal();
        }
      });
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Invalid credentials. Please verify your phone/email and password.';
        errorEl.classList.remove('hidden');
      } else {
        showCustomAlert({
          title: "Sign In Failed",
          message: err.message || "Invalid credentials. Please verify your details.",
          type: "error"
        });
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Sign In & View Orders';
    }
  } else {
    // Local storage fallback
    currentUser = {
      name: identifier.includes('@') ? identifier.split('@')[0].toUpperCase() : 'CUSTOMER',
      email: identifier.includes('@') ? identifier : 'customer@luxecraft.store',
      phone: !identifier.includes('@') ? identifier : '+91 98765 43210'
    };

    localStorage.setItem('luxecraft_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();

    showCustomAlert({
      title: `Welcome, ${currentUser.name}! 👋`,
      message: "You have signed in successfully.",
      type: "success",
      btnText: "Track My Orders",
      onClose: () => {
        openOrdersModal();
      }
    });
  }
}

async function handleCustomerRegister(event) {
  event.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  const errorEl = document.getElementById('authErrorMsg');
  const noticeEl = document.getElementById('authStatusNotice');
  const submitBtn = document.getElementById('regSubmitBtn');
  const btnText = document.getElementById('regBtnText');

  if (errorEl) errorEl.classList.add('hidden');
  if (noticeEl) noticeEl.classList.add('hidden');

  // Requirement: Either phone OR email is required (only 1 mandatory)
  if (!phone && !email) {
    if (errorEl) {
      errorEl.textContent = 'Please enter either a Mobile Number or an Email Address to continue.';
      errorEl.classList.remove('hidden');
    } else {
      showCustomAlert({
        title: "Contact Required",
        message: "Please enter either a Mobile Number or an Email Address to continue.",
        type: "error"
      });
    }
    return;
  }

  if (isDbConnected()) {
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> Registering in Database...';

    try {
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
      const authEmail = email ? email.toLowerCase() : `${cleanPhone}@luxecraft.user`;

      const { data, error } = await supabaseClient.auth.signUp({
        email: authEmail,
        password: password,
        options: {
          data: {
            full_name: name,
            phone: phone || cleanPhone,
            email: email || ''
          }
        }
      });

      if (error) throw error;

      // Upsert profile in PostgreSQL
      if (data?.user) {
        try {
          await supabaseClient.from('profiles').upsert({
            id: data.user.id,
            full_name: name,
            phone: phone || cleanPhone,
            email: email || authEmail,
            role: 'customer'
          });
        } catch (profErr) {
          console.warn('Profile table insert note:', profErr);
        }
      }

      // Check if session exists (instant registration)
      if (data?.session) {
        currentUser = {
          id: data.user.id,
          name: name,
          phone: phone || cleanPhone,
          email: email || phone
        };
        localStorage.setItem('luxecraft_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();

        showCustomAlert({
          title: `Welcome, ${name}! 🎉`,
          message: "Your customer account has been created and you are now logged in.",
          type: "success",
          btnText: "Start Exploring"
        });
      } else {
        // Try immediate login in case email confirmation was turned off in Supabase
        try {
          const { data: autoLogin, error: autoErr } = await supabaseClient.auth.signInWithPassword({
            email: authEmail,
            password: password
          });
          if (autoLogin?.session) {
            currentUser = {
              id: autoLogin.user.id,
              name: name,
              phone: phone || cleanPhone,
              email: email || phone
            };
            localStorage.setItem('luxecraft_user', JSON.stringify(currentUser));
            updateAuthUI();
            closeAuthModal();

            showCustomAlert({
              title: `Welcome, ${name}! 🎉`,
              message: "Your customer account has been created and you are now logged in.",
              type: "success",
              btnText: "Start Exploring"
            });
            return;
          }
        } catch (e) {}

        // If Supabase still has "Confirm email" turned ON, guide user:
        if (noticeEl) {
          noticeEl.innerHTML = `<strong>Account Created!</strong> You can now sign in using your ${email ? 'email' : 'phone number'}. <br><span class="text-stone-600 text-[11px]">(If your store requires email verification, check your inbox or turn off "Confirm email" in Supabase settings).</span>`;
          noticeEl.classList.remove('hidden');
        } else {
          showCustomAlert({
            title: "Registration Complete",
            message: "Your account has been created. You can now sign in with your credentials.",
            type: "info",
            btnText: "Sign In Now",
            onClose: () => {
              switchAuthTab('login');
            }
          });
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Registration failed. Please try again.';
        errorEl.classList.remove('hidden');
      } else {
        showCustomAlert({
          title: "Registration Failed",
          message: err.message || "Registration could not be completed. Please check your details.",
          type: "error"
        });
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Create Customer Account';
    }
  } else {
    // Offline/local fallback
    currentUser = { name, phone, email: email || phone };
    localStorage.setItem('luxecraft_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();

    showCustomAlert({
      title: `Welcome, ${name}! 🎉`,
      message: "Your customer account is active.",
      type: "success",
      btnText: "Start Exploring"
    });
  }
}

function setupSupabaseAuthListener() {
  if (!isDbConnected()) return;
  try {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        openResetPasswordModal();
        return;
      }

      if (session?.user && !currentUser) {
        let profile = null;
        try {
          const { data } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
          profile = data;
        } catch (e) {}
        currentUser = {
          id: session.user.id,
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          email: session.user.email,
          phone: profile?.phone || session.user.user_metadata?.phone || ''
        };
        localStorage.setItem('luxecraft_user', JSON.stringify(currentUser));
        updateAuthUI();
        syncOrdersFromDatabase();
      }
    });
  } catch (e) {
    console.warn('Auth listener init error:', e);
  }
}

async function syncOrdersFromDatabase() {
  if (!isDbConnected() || !currentUser) return;
  try {
    const { data: dbOrders, error } = await supabaseClient
      .from('orders')
      .select('*')
      .or(`customer_email.eq.${currentUser.email}${currentUser.id ? `,user_id.eq.${currentUser.id}` : ''}`)
      .order('created_at', { ascending: false });

    if (dbOrders && dbOrders.length > 0) {
      const existingIds = new Set(orders.map(o => o.orderId));
      dbOrders.forEach(dbo => {
        if (!existingIds.has(dbo.order_id)) {
          orders.unshift({
            orderId: dbo.order_id,
            date: new Date(dbo.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            customerEmail: dbo.customer_email,
            customerName: dbo.customer_name,
            statusStep: dbo.status_step || 1,
            statusLabel: dbo.status_label || "Design Queue (Preview Pending)",
            items: dbo.items || [],
            totalAmount: Number(dbo.total_amount)
          });
        }
      });
      localStorage.setItem('luxecraft_orders', JSON.stringify(orders));
      renderOrdersList();
    }
  } catch (err) {
    console.warn('Failed to sync orders from database:', err);
  }
}

function fillDemoCustomer() {
  const idInput = document.getElementById('loginIdentifier') || document.getElementById('loginEmail');
  if (idInput) idInput.value = 'pooja@gmail.com';
  document.getElementById('loginPassword').value = 'password123';
}

function confirmLogout() {
  showCustomConfirm({
    title: "Do you really want to sign out?",
    message: "Your cart and custom order history will stay saved safely in your account.",
    icon: "alert-triangle",
    confirmText: "Yes",
    cancelText: "No",
    isDestructive: true,
    onConfirm: () => {
      performLogout();
    }
  });
}

async function performLogout() {
  if (isDbConnected()) {
    try {
      await supabaseClient.auth.signOut();
    } catch (err) {
      console.warn('Signout warning:', err);
    }
  }
  currentUser = null;
  localStorage.removeItem('luxecraft_user');
  updateAuthUI();

  showCustomAlert({
    title: "You have logged out",
    message: "You have been safely signed out. See you again soon!",
    type: "info",
    icon: "check",
    btnText: "Okay"
  });
}

function updateAuthUI() {
  const container = document.getElementById('authNavContainer');
  if (!container) return;

  if (currentUser) {
    container.innerHTML = `
      <div class="relative group">
        <button class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-amber-100/70 border border-amber-300 rounded-full transition">
          <div class="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
            ${currentUser.name.charAt(0)}
          </div>
          <span>${currentUser.name}</span>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-stone-500"></i>
        </button>

        <!-- Dropdown Menu -->
        <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 hidden group-hover:block z-50 animate-fade-in">
          <div class="px-4 py-2 border-b border-stone-100">
            <div class="text-xs font-bold text-stone-900">${currentUser.name}</div>
            <div class="text-[11px] text-stone-500 truncate">${currentUser.email}</div>
          </div>
          <button onclick="openOrdersModal()" class="w-full px-4 py-2 text-left text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-brand-700 flex items-center gap-2">
            <i data-lucide="package" class="w-4 h-4"></i> Track My Orders
          </button>
          <button onclick="confirmLogout()" class="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <i data-lucide="log-out" class="w-4 h-4"></i> Sign Out
          </button>
        </div>
      </div>
    `;

    // Auto-fill checkout fields if available
    const chkName = document.getElementById('chkName');
    const chkEmail = document.getElementById('chkEmail');
    const chkPhone = document.getElementById('chkPhone');
    if (chkName && !chkName.value) chkName.value = currentUser.name;
    if (chkEmail && !chkEmail.value) chkEmail.value = currentUser.email;
    if (chkPhone && !chkPhone.value) chkPhone.value = currentUser.phone || '';
  } else {
    container.innerHTML = `
      <button onclick="openAuthModal('login')" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition">
        <i data-lucide="user" class="w-4 h-4"></i>
        <span>Sign In</span>
      </button>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 6. CUSTOMER ORDERS & LIVE TRACKING ENGINE
// ==========================================
function openOrdersModal() {
  const modal = document.getElementById('ordersModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderCustomerOrders();
  if (window.lucide) lucide.createIcons();
}

function closeOrdersModal() {
  const modal = document.getElementById('ordersModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function renderCustomerOrders() {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  // Filter orders for currentUser or show all recent
  const userOrders = currentUser 
    ? orders.filter(o => o.customerEmail === currentUser.email)
    : orders;

  const displayOrders = userOrders.length > 0 ? userOrders : orders;

  if (displayOrders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="package" class="w-8 h-8"></i>
        </div>
        <h4 class="font-serif font-bold text-stone-800 text-base">No Orders Placed Yet</h4>
        <p class="text-xs text-stone-500 mt-1 max-w-xs mx-auto">Customize your keepsake or clock today to start crafting!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = displayOrders.map(order => `
    <div class="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
      
      <!-- Order Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200/80 gap-2">
        <div>
          <span class="font-mono font-bold text-brand-700 text-sm">${order.orderId}</span>
          <span class="text-xs text-stone-400 ml-2">• Placed on ${order.date}</span>
        </div>
        <div class="text-xs font-bold text-stone-900 font-serif">
          Total: ₹${order.totalAmount.toLocaleString('en-IN')}
        </div>
      </div>

      <!-- Items in Order -->
      <div class="space-y-2">
        ${order.items.map(item => `
          <div class="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-stone-200/60">
            <div class="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-stone-200 bg-stone-900">
              <img src="${item.photoUrl}" class="w-full h-full object-cover">
            </div>
            <div class="min-w-0 flex-1">
              <h5 class="text-xs font-bold text-stone-900 truncate">${item.name}</h5>
              <div class="text-[11px] text-brand-700 font-medium">${item.names} (${item.size})</div>
              <div class="text-[10px] text-stone-400">${item.date}</div>
            </div>
            <div class="text-xs font-serif font-bold text-stone-800">
              ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 4-Step Crafting Timeline Tracker -->
      <div class="pt-2">
        <div class="text-xs font-bold text-stone-800 mb-3 flex items-center justify-between">
          <span>Crafting Status:</span>
          <span class="text-brand-700 font-semibold text-[11px]">${order.statusLabel}</span>
        </div>

        <div class="relative flex items-center justify-between">
          <!-- Horizontal track bar -->
          <div class="absolute left-4 right-4 top-3.5 h-1 bg-stone-200 -z-0">
            <div class="h-full bg-amber-500 transition-all duration-500" style="width: ${((order.statusStep - 1) / 3) * 100}%"></div>
          </div>

          <!-- Step 1 -->
          <div class="flex flex-col items-center z-10">
            <div class="w-7 h-7 rounded-full ${order.statusStep >= 1 ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500'} flex items-center justify-center text-[10px] font-bold shadow">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
            </div>
            <span class="text-[10px] font-medium text-stone-600 mt-1">Confirmed</span>
          </div>

          <!-- Step 2 -->
          <div class="flex flex-col items-center z-10">
            <div class="w-7 h-7 rounded-full ${order.statusStep >= 2 ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500'} flex items-center justify-center text-[10px] font-bold shadow">
              <i data-lucide="${order.statusStep >= 2 ? 'check' : 'image'}" class="w-3.5 h-3.5"></i>
            </div>
            <span class="text-[10px] font-medium text-stone-600 mt-1">Mockup OK</span>
          </div>

          <!-- Step 3 -->
          <div class="flex flex-col items-center z-10">
            <div class="w-7 h-7 rounded-full ${order.statusStep >= 3 ? 'bg-amber-500 text-white animate-pulse' : 'bg-stone-200 text-stone-500'} flex items-center justify-center text-[10px] font-bold shadow">
              <i data-lucide="${order.statusStep >= 3 ? 'sparkles' : 'hourglass'}" class="w-3.5 h-3.5"></i>
            </div>
            <span class="text-[10px] font-medium text-stone-600 mt-1">Resin Curing</span>
          </div>

          <!-- Step 4 -->
          <div class="flex flex-col items-center z-10">
            <div class="w-7 h-7 rounded-full ${order.statusStep >= 4 ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'} flex items-center justify-center text-[10px] font-bold shadow">
              <i data-lucide="truck" class="w-3.5 h-3.5"></i>
            </div>
            <span class="text-[10px] font-medium text-stone-600 mt-1">Dispatched</span>
          </div>

        </div>
      </div>

    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 7. PRODUCT CATALOG & REVIEWS
// ==========================================
function renderProducts(categoryFilter = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const filtered = categoryFilter === 'all' 
    ? PRODUCTS 
    : categoryFilter === 'ready'
      ? PRODUCTS.filter(p => !p.isCustomizable)
      : categoryFilter === 'custom'
        ? PRODUCTS.filter(p => p.isCustomizable)
        : PRODUCTS.filter(p => p.category === categoryFilter);

  grid.innerHTML = filtered.map(p => `
    <div class="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
      <div class="relative aspect-square overflow-hidden bg-stone-100">
        <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        
        <!-- Product Badge -->
        <div class="absolute top-3 left-3 ${!p.isCustomizable ? 'bg-emerald-700 text-white' : 'bg-stone-900/80 text-amber-300'} backdrop-blur-md text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
          ${!p.isCustomizable ? '<i data-lucide="zap" class="w-3 h-3 text-emerald-300"></i>' : '<i data-lucide="sparkles" class="w-3 h-3 text-amber-400"></i>'}
          <span>${p.tag}</span>
        </div>

        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-stone-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
          <span>${p.rating}</span>
          <span class="text-stone-400 font-normal">(${p.reviewsCount})</span>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-brand-600 uppercase tracking-wider">${p.categoryName}</span>
            <span class="text-[10px] font-semibold ${!p.isCustomizable ? 'text-emerald-700' : 'text-stone-500'}">
              ${p.deliveryNotice || (!p.isCustomizable ? 'Dispatches Tomorrow' : 'Custom 3-5 days')}
            </span>
          </div>
          <h3 class="font-serif font-bold text-stone-900 text-lg mt-0.5 group-hover:text-brand-600 transition">${p.name}</h3>
          <p class="text-stone-500 text-xs mt-2 line-clamp-2 leading-relaxed">${p.description}</p>
        </div>

        <div class="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div class="text-[11px] text-stone-400">${!p.isCustomizable ? 'Price (As Shown)' : 'Starting from'}</div>
            <div class="flex items-baseline gap-1.5">
              <span class="font-serif text-xl font-bold text-stone-900">₹${p.basePrice.toLocaleString('en-IN')}</span>
              <span class="text-xs text-stone-400 line-through">₹${p.originalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          ${p.isCustomizable ? `
            <button onclick="openCustomizer('${p.id}')" class="px-4 py-2.5 rounded-xl gold-gradient-btn text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 group-hover:scale-105 transition">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>Customize with Photo</span>
            </button>
          ` : `
            <button onclick="addReadyToShipToCart('${p.id}')" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 group-hover:scale-105 transition">
              <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
              <span>1-Click Add to Cart</span>
            </button>
          `}
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function filterCategory(cat) {
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    if (btn.dataset.cat === cat) {
      btn.className = 'cat-filter-btn active px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-stone-900 text-white transition';
    } else {
      btn.className = 'cat-filter-btn px-3.5 py-2 text-xs sm:text-sm font-medium rounded-full bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 transition';
    }
  });

  renderProducts(cat);
}

function renderReviews() {
  const container = document.getElementById('reviewsGrid');
  if (!container) return;

  container.innerHTML = REVIEWS.map(r => `
    <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex text-amber-400">
            ${Array(r.rating).fill('<i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>').join('')}
          </div>
          <span class="text-xs text-stone-400">${r.date}</span>
        </div>
        <p class="text-stone-700 text-sm italic leading-relaxed">"${r.comment}"</p>
      </div>

      <div class="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
        <div>
          <div class="font-bold text-stone-900">${r.author}</div>
          <div class="text-brand-600 font-medium">${r.occasion}</div>
        </div>
        <span class="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
          <i data-lucide="shield-check" class="w-3 h-3"></i> Verified Buyer
        </span>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 8. INTERACTIVE CUSTOMIZER STUDIO
// ==========================================
function openCustomizerWithDefault() {
  openCustomizer('resin-flower-keepsake');
}

function openCustomizer(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  activeProduct = product;
  currentCustomizerState.selectedSize = product.sizes[0];
  currentCustomizerState.giftWrap = false;
  const giftCheckbox = document.getElementById('giftWrapCheck');
  if (giftCheckbox) giftCheckbox.checked = false;

  document.getElementById('custModalTitle').textContent = `Customize: ${product.name}`;

  const renderSurface = document.getElementById('renderSurface');
  const foilLayer = document.getElementById('foilLayer');
  const floralRing = document.getElementById('floralRing');
  const clockElements = document.getElementById('clockElements');
  const ledSwitchContainer = document.getElementById('ledSwitchContainer');

  renderSurface.className = 'w-full h-full relative overflow-hidden transition-all duration-300 shadow-2xl';

  if (product.customizerType === 'clock') {
    renderSurface.classList.add('rounded-full', 'border-4', 'border-amber-400/60', 'resin-gloss');
    clockElements.classList.remove('hidden');
    foilLayer.classList.remove('hidden');
    floralRing.classList.add('hidden');
    ledSwitchContainer.classList.add('hidden');
  } else if (product.customizerType === 'resin') {
    renderSurface.classList.add('rounded-full', 'border-4', 'border-amber-300/50', 'resin-gloss');
    clockElements.classList.add('hidden');
    foilLayer.classList.remove('hidden');
    floralRing.classList.remove('hidden');
    ledSwitchContainer.classList.add('hidden');
  } else if (product.customizerType === 'couple') {
    renderSurface.classList.add('rounded-2xl', 'border-8', 'border-stone-800');
    clockElements.classList.add('hidden');
    foilLayer.classList.add('hidden');
    floralRing.classList.add('hidden');
    ledSwitchContainer.classList.remove('hidden');
    applyLedLightingState();
  } else {
    renderSurface.classList.add('rounded-lg', 'border-[12px]', 'border-amber-900', 'shadow-2xl');
    clockElements.classList.add('hidden');
    foilLayer.classList.add('hidden');
    floralRing.classList.add('hidden');
    ledSwitchContainer.classList.add('hidden');
  }

  renderSizeOptions(product);
  updateCustomizerText();
  recalculateCustomPrice();

  const modal = document.getElementById('customizerModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (window.lucide) lucide.createIcons();
}

function closeCustomizerModal() {
  const modal = document.getElementById('customizerModal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function renderSizeOptions(product) {
  const container = document.getElementById('custSizeOptions');
  if (!container) return;

  container.innerHTML = product.sizes.map((s, idx) => `
    <button onclick="selectSize('${s.id}')" id="size-btn-${s.id}" 
            class="p-2.5 rounded-xl border text-left transition ${idx === 0 ? 'border-brand-500 bg-amber-50/60 ring-1 ring-brand-500' : 'border-stone-200 bg-white hover:border-stone-300'}">
      <div class="text-xs font-bold text-stone-800">${s.label}</div>
      <div class="text-xs font-serif font-bold text-brand-700 mt-0.5">₹${s.price.toLocaleString('en-IN')}</div>
    </button>
  `).join('');
}

function selectSize(sizeId) {
  if (!activeProduct) return;
  const size = activeProduct.sizes.find(s => s.id === sizeId);
  if (!size) return;

  currentCustomizerState.selectedSize = size;

  activeProduct.sizes.forEach(s => {
    const btn = document.getElementById(`size-btn-${s.id}`);
    if (btn) {
      if (s.id === sizeId) {
        btn.className = 'p-2.5 rounded-xl border text-left transition border-brand-500 bg-amber-50/60 ring-1 ring-brand-500';
      } else {
        btn.className = 'p-2.5 rounded-xl border text-left transition border-stone-200 bg-white hover:border-stone-300';
      }
    }
  });

  recalculateCustomPrice();
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    currentCustomizerState.photoUrl = e.target.result;
    document.getElementById('renderImg').src = e.target.result;
    const heroPreview = document.getElementById('heroPreviewImg');
    if (heroPreview) heroPreview.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function setSamplePhoto(index) {
  if (SAMPLE_PHOTOS[index]) {
    currentCustomizerState.photoUrl = SAMPLE_PHOTOS[index].url;
    document.getElementById('renderImg').src = SAMPLE_PHOTOS[index].url;
  }
}

function updateCustomizerText() {
  const nameInput = document.getElementById('inputNames').value || "Kabir & Ananya";
  const dateInput = document.getElementById('inputDate').value || "Forever & Always";

  currentCustomizerState.names = nameInput;
  currentCustomizerState.date = dateInput;

  const renderNames = document.getElementById('renderNames');
  const renderDate = document.getElementById('renderDate');

  if (renderNames) renderNames.textContent = nameInput;
  if (renderDate) renderDate.textContent = dateInput;
}

function setFontStyle(style) {
  currentCustomizerState.fontStyle = style;
  const renderNames = document.getElementById('renderNames');
  renderNames.classList.remove('font-script', 'font-serif', 'font-sans');

  if (style === 'script') {
    renderNames.classList.add('font-script');
  } else if (style === 'serif') {
    renderNames.classList.add('font-serif');
  } else {
    renderNames.classList.add('font-sans');
  }

  document.querySelectorAll('.font-style-btn').forEach(btn => {
    if (btn.dataset.font === style) {
      btn.classList.add('border-brand-500', 'bg-amber-50');
      btn.classList.remove('border-stone-200', 'bg-white');
    } else {
      btn.classList.remove('border-brand-500', 'bg-amber-50');
      btn.classList.add('border-stone-200', 'bg-white');
    }
  });
}

function toggleLedLighting() {
  currentCustomizerState.ledEnabled = !currentCustomizerState.ledEnabled;
  applyLedLightingState();
}

function applyLedLightingState() {
  const surface = document.getElementById('renderSurface');
  const btn = document.getElementById('ledToggleBtn');
  if (!surface || !btn) return;

  if (currentCustomizerState.ledEnabled) {
    surface.classList.add('led-glow-on');
    surface.classList.remove('led-glow-off');
    btn.textContent = 'ON';
    btn.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 transition';
  } else {
    surface.classList.remove('led-glow-on');
    surface.classList.add('led-glow-off');
    btn.textContent = 'OFF';
    btn.className = 'px-3 py-1 rounded-full text-xs font-bold bg-stone-700 text-stone-300 transition';
  }
}

function recalculateCustomPrice() {
  if (!activeProduct || !currentCustomizerState.selectedSize) return;

  let total = currentCustomizerState.selectedSize.price;
  const giftWrapCheck = document.getElementById('giftWrapCheck');
  if (giftWrapCheck && giftWrapCheck.checked) {
    total += 149;
    currentCustomizerState.giftWrap = true;
  } else {
    currentCustomizerState.giftWrap = false;
  }

  currentCustomizerState.totalPrice = total;

  const priceElem = document.getElementById('custFinalPrice');
  const origPriceElem = document.getElementById('custOriginalPrice');

  if (priceElem) priceElem.textContent = `₹${total.toLocaleString('en-IN')}`;
  if (origPriceElem) {
    const origTotal = Math.round(total * 1.45);
    origPriceElem.textContent = `₹${origTotal.toLocaleString('en-IN')}`;
  }
}

// ==========================================
// 9. CART OPERATIONS
// ==========================================
function addCustomizedItemToCart() {
  if (!activeProduct) return;

  const item = {
    cartId: 'item_' + Date.now(),
    productId: activeProduct.id,
    name: activeProduct.name,
    categoryName: activeProduct.categoryName,
    photoUrl: currentCustomizerState.photoUrl,
    names: currentCustomizerState.names,
    date: currentCustomizerState.date,
    size: currentCustomizerState.selectedSize.label,
    price: currentCustomizerState.totalPrice,
    giftWrap: currentCustomizerState.giftWrap,
    quantity: 1
  };

  cart.push(item);
  saveCart();
  closeCustomizerModal();
  openCartDrawer();
}

function saveCart() {
  localStorage.setItem('luxecraft_cart', JSON.stringify(cart));
  updateCartBadge();
  updateCartUI();
}

function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  if (!badge) return;

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalCount;

  if (totalCount > 0) {
    badge.classList.remove('scale-0');
    badge.classList.add('scale-100');
  } else {
    badge.classList.add('scale-0');
    badge.classList.remove('scale-100');
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.remove('hidden');
    updateCartUI();
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function updateCartUI() {
  const container = document.getElementById('cartItemsList');
  const footer = document.getElementById('cartFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <div class="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="shopping-bag" class="w-8 h-8"></i>
        </div>
        <h4 class="font-serif font-bold text-stone-800 text-lg">Your Cart is Empty</h4>
        <p class="text-xs text-stone-500 mt-1 max-w-xs mx-auto">Customize your first memory frame or resin keepsake to get started.</p>
        <button onclick="closeCartDrawer(); openCustomizerWithDefault();" class="mt-5 px-6 py-2.5 rounded-xl gold-gradient-btn text-white text-xs font-bold shadow">
          Start Customizing
        </button>
      </div>
    `;
    if (footer) footer.classList.add('opacity-40', 'pointer-events-none');
  } else {
    if (footer) footer.classList.remove('opacity-40', 'pointer-events-none');

    container.innerHTML = cart.map((item, idx) => `
      <div class="flex gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
        <div class="w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0 border border-stone-200 bg-stone-900 relative">
          <img src="${item.photoUrl}" class="w-full h-full object-cover">
          ${item.isCustomizable === false ? '<span class="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-bold text-center py-0.5 tracking-wider">READY</span>' : ''}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h5 class="font-bold text-xs text-stone-900 truncate">${item.name}</h5>
            <button onclick="removeCartItem(${idx})" class="text-stone-400 hover:text-rose-500 transition ml-2">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>

          ${item.isCustomizable === false ? `
            <div class="text-[11px] text-emerald-800 font-bold flex items-center gap-1 mt-0.5">
              <i data-lucide="zap" class="w-3 h-3 text-emerald-600"></i>
              <span>Ready to Ship • Dispatches Tomorrow</span>
            </div>
            <div class="text-[10px] text-stone-500">As Shown (No photo upload needed)</div>
          ` : `
            <div class="text-[11px] text-brand-700 font-medium mt-0.5">
              ${item.names} (${item.size})
            </div>
          `}

          ${item.giftWrap ? '<div class="text-[10px] text-amber-700 flex items-center gap-1 mt-0.5"><i data-lucide="gift" class="w-3 h-3"></i> Gift Packed</div>' : ''}

          <div class="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60">
            <div class="flex items-center border border-stone-300 rounded-lg bg-white">
              <button onclick="changeQty(${idx}, -1)" class="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 rounded-l-lg">-</button>
              <span class="px-2 text-xs font-semibold text-stone-800">${item.quantity}</span>
              <button onclick="changeQty(${idx}, 1)" class="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 rounded-r-lg">+</button>
            </div>

            <div class="font-serif font-bold text-sm text-stone-900">
              ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalElem = document.getElementById('cartSubtotal');
    const totalElem = document.getElementById('cartTotal');

    if (subtotalElem) subtotalElem.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (totalElem) totalElem.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  }

  if (window.lucide) lucide.createIcons();
}

function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart();
}

// ==========================================
// 10. WHATSAPP DIRECT ORDERS
// ==========================================
const STORE_WHATSAPP = "918789332585";

function orderDirectOnWhatsApp() {
  if (!activeProduct) return;

  const msg = `*NEW ORDER INQUIRY - LuxeCraft Studio* 🎁%0A%0A` +
    `*Product:* ${encodeURIComponent(activeProduct.name)}%0A` +
    `*Category:* ${encodeURIComponent(activeProduct.categoryName)}%0A` +
    `*Size:* ${encodeURIComponent(currentCustomizerState.selectedSize.label)}%0A` +
    `*Inscribed Names:* ${encodeURIComponent(currentCustomizerState.names)}%0A` +
    `*Date / Quote:* ${encodeURIComponent(currentCustomizerState.date)}%0A` +
    `*Gift Wrapping:* ${currentCustomizerState.giftWrap ? 'Yes (+₹149)' : 'No'}%0A` +
    `*Total Price:* ₹${currentCustomizerState.totalPrice.toLocaleString('en-IN')}%0A%0A` +
    `*Note:* I am uploading my high-res photo in this chat for confirmation. Please share the final mockup preview!`;

  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${msg}`, '_blank');
}

function orderAllCartOnWhatsApp() {
  if (cart.length === 0) return;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let itemsSummary = "";
  cart.forEach((it, i) => {
    itemsSummary += `%0A${i + 1}. *${encodeURIComponent(it.name)}* (Qty: ${it.quantity})%0A` +
      (it.isCustomizable === false 
        ? `   - [READY TO SHIP - ORDER AS SHOWN - NO PHOTO NEEDED]%0A`
        : `   - Custom Inscription: ${encodeURIComponent(it.names)}%0A`) +
      `   - Size: ${encodeURIComponent(it.size)}%0A` +
      `   - Price: ₹${(it.price * it.quantity).toLocaleString('en-IN')}%0A`;
  });

  const msg = `*NEW CART CHECKOUT - LuxeCraft Studio* 🛍️%0A` +
    itemsSummary +
    `%0A*Total Amount Payable:* ₹${subtotal.toLocaleString('en-IN')}%0A` +
    `*Shipping:* FREE Express Delivery%0A%0A` +
    `Hi Team, please verify my order and send the payment confirmation!`;

  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${msg}`, '_blank');
}

function sendSuccessOrderToWhatsApp() {
  const orderId = document.getElementById('successOrderId')?.textContent || '';
  const msg = `*ORDER PLACED - LuxeCraft Studio* 🛍️%0A%0A` +
    `Hello! I just placed order *${encodeURIComponent(orderId)}* on your website.%0A` +
    `Please confirm the order and share delivery / photo preview updates here. Thank you!`;
  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${msg}`, '_blank');
}

// ==========================================
// 11. CHECKOUT & ORDER PLACEMENT
// ==========================================
function openCheckoutModal() {
  if (cart.length === 0) return;
  closeCartDrawer();
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function handlePlaceOrder(event) {
  event.preventDefault();

  const customerName = document.getElementById('chkName')?.value.trim() || 'Valued Customer';
  const customerEmail = document.getElementById('chkEmail')?.value.trim() || '';
  const customerPhone = document.getElementById('chkPhone')?.value.trim() || '';
  const customerAddress = document.getElementById('chkAddress')?.value.trim() || '';
  const customerCity = document.getElementById('chkCity')?.value.trim() || '';
  const customerPincode = document.getElementById('chkPincode')?.value.trim() || '';
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'upi';
  const randomId = '#LC-' + Math.floor(10000 + Math.random() * 90000);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Record this order into orders storage
  const newOrder = {
    orderId: randomId,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    customerEmail: customerEmail,
    customerName: customerName,
    customerPhone: customerPhone,
    customerAddress: customerAddress,
    customerCity: customerCity,
    customerPincode: customerPincode,
    paymentMethod: paymentMethod,
    statusStep: 1, // 1: Confirmed
    statusLabel: "Design Queue (Preview Preparation in Progress)",
    items: [...cart],
    totalAmount: subtotal
  };

  orders.unshift(newOrder);
  localStorage.setItem('luxecraft_orders', JSON.stringify(orders));

  // Sync to Supabase PostgreSQL database if connected
  if (isDbConnected()) {
    try {
      supabaseClient.from('orders').insert({
        order_id: randomId,
        user_id: currentUser?.id || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_details: {
          address: customerAddress,
          city: customerCity,
          pincode: customerPincode,
          paymentMethod: paymentMethod
        },
        items: [...cart],
        total_amount: subtotal,
        status_step: 1,
        status_label: "Design Queue (Preview Preparation in Progress)"
      }).then(({ error }) => {
        if (error) console.warn('Supabase order sync error:', error);
        else console.log('✅ Order synced to Supabase database:', randomId);
      });
    } catch (dbErr) {
      console.warn('Could not sync order to database:', dbErr);
    }
  }

  // If user wasn't logged in, associate with this customer email
  if (!currentUser) {
    currentUser = { name: customerName, email: customerEmail, phone: customerPhone };
    localStorage.setItem('luxecraft_user', JSON.stringify(currentUser));
    updateAuthUI();
  }

  // Clear cart
  cart = [];
  saveCart();

  // Show Success
  closeCheckoutModal();
  const successOrderId = document.getElementById('successOrderId');
  if (successOrderId) successOrderId.textContent = randomId;

  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.classList.remove('hidden');
  }
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}
