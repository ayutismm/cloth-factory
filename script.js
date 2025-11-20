
(() => {
  const CART_KEY = "cf_cart_items";
  const THEME_KEY = "cf_theme";
  const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Product data for quick view  
  const PRODUCTS = {
    'bugs-bunny': {
      name: "Bugs Bunny: Hot Moves",
      price: 1699,
      image: "./image copy 4.png",
      description: "Electric gradients meet Looney Tunes nostalgia. Cut from breathable combed cotton with a buttery finish and a playful oversized fit."
    },
    'samurai-jack': {
      name: "Samurai Jack: Warrior",
      price: 1699,
      image: "./image copy 5.png",
      description: "Honor and style collide in this modern tribute to the legendary samurai. Premium cotton with vibrant prints."
    },
    'spider-man': {
      name: "Spider-Man: Hero Swing",
      price: 1699,
      image: "./image copy 6.png",
      description: "Swing into action with this dynamic Spider-Man design. Features premium fabric and bold graphics."
    },
    'jurassic-park': {
      name: "Jurassic Park: Tilescape",
      price: 1699,
      image: "./image copy 7.png",
      description: "Classic Jurassic Park nostalgia in a fresh tiled design. Soft cotton blend with iconic branding."
    },
    'super-pants': {
      name: "Super Pants: Brown Stripes",
      price: 1699,
      image: "./image copy 8.png",
      description: "Retro vibes with modern comfort. Striped design on ultra-soft fabric for all-day wear."
    }
  };

  function formatCurrency(value) {
    return `rs-${Number(value).toFixed(0)}`;
  }

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount(items);
    renderCartDrawer();
  }

  function updateCartCount(items = readCart()) {
    const count = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
    const els = [document.getElementById("cartCount"), document.getElementById("cartCountNav")];
    els.forEach(el => { if (el) el.textContent = String(count); });
  }

  function addItem(name, price, image = null) {
    const items = readCart();
    const idx = items.findIndex((i) => i.name === name);
    if (idx >= 0) {
      items[idx].quantity = (items[idx].quantity || 1) + 1;
    } else {
      items.push({ name, price: Number(price), quantity: 1, image });
    }
    writeCart(items);
    bumpCartCount();
    showToast(name, 'success', 'Added to cart!');
  }

  function removeItem(name) {
    const items = readCart().filter((i) => i.name !== name);
    writeCart(items);
    renderCartPage();
  }

  function changeQty(name, delta) {
    const items = readCart();
    const idx = items.findIndex((i) => i.name === name);
    if (idx >= 0) {
      items[idx].quantity = Math.max(1, (items[idx].quantity || 1) + delta);
      writeCart(items);
      renderCartPage();
    }
  }

  function clearCart() {
    writeCart([]);
    renderCartPage();
  }

  function getTotal(items = readCart()) {
    return items.reduce((sum, i) => sum + Number(i.price) * (i.quantity || 1), 0);
  }

  // ====== CART DRAWER ======
  function openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (drawer && backdrop) {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-visible');
      document.body.style.overflow = '';
    }
  }

  function renderCartDrawer() {
    const itemsContainer = document.getElementById('cartDrawerItems');
    const emptyState = document.getElementById('cartDrawerEmpty');
    const footer = document.getElementById('cartDrawerFooter');
    const totalEl = document.getElementById('cartDrawerTotal');

    if (!itemsContainer) return;

    const items = readCart();

    if (items.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (footer) footer.style.display = 'none';
      itemsContainer.querySelectorAll('.cart-drawer-item').forEach(el => el.remove());
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';

    itemsContainer.innerHTML = items.map(item => `
      <div class="cart-drawer-item">
        ${item.image ? `<img class="cart-drawer-item__image" src="${item.image}" alt="${item.name}" />` : ''}
        <div class="cart-drawer-item__details">
          <div class="cart-drawer-item__name">${item.name}</div>
          <div class="cart-drawer-item__price">${formatCurrency(item.price)}</div>
          <div class="cart-drawer-item__controls">
            <button class="cart-drawer-item__qty-btn" data-drawer-action="dec" data-name="${item.name}">−</button>
            <span class="cart-drawer-item__qty">${item.quantity || 1}</span>
            <button class="cart-drawer-item__qty-btn" data-drawer-action="inc" data-name="${item.name}">+</button>
            <button class="cart-drawer-item__remove" data-drawer-action="remove" data-name="${item.name}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = formatCurrency(getTotal(items));
  }

  // ====== QUICK VIEW MODAL ======
  let currentQuickViewProduct = null;
  let selectedSize = 'M';

  function openQuickView(productKey) {
    const product = PRODUCTS[productKey];
    if (!product) return;

    currentQuickViewProduct = product;
    selectedSize = 'M';

    const modal = document.getElementById('quickViewModal');
    const image = document.getElementById('quickViewImage');
    const title = document.getElementById('quickViewTitle');
    const description = document.getElementById('quickViewDescription');
    const price = document.getElementById('quickViewPrice');

    if (modal && image && title && description && price) {
      image.src = product.image;
      image.alt = product.name;
      title.textContent = product.name;
      description.textContent = product.description;
      price.textContent = formatCurrency(product.price);

      // Reset size selection
      document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.size === 'M');
      });

      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      currentQuickViewProduct = null;
    }
  }

  // ====== SUCCESS PARTICLES ======
  function createSuccessParticles(x, y) {
    if (motionQuery.matches) return;

    const colors = ['#ffb4f6', '#ff8b5d', '#8aa8ff', '#64ff96', '#ffd700'];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'success-particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];

      const tx = (Math.random() - 0.5) * 200;
      const ty = (Math.random() - 0.5) * 200 - 50;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);

      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }



  // ====== ENHANCED TOAST NOTIFICATIONS ======
  let toastQueue = [];
  let toastContainer = null;

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function showToast(title, type = 'success', message = '', actions = []) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    const icon = icons[type] || icons.info;

    let actionsHTML = '';
    if (type === 'success' && !actions.length) {
      actionsHTML = `
        <div class="toast__actions">
          <button class="toast__action" data-toast-action="view-cart">View Cart</button>
        </div>
      `;
    }

    toast.innerHTML = `
      <div class="toast__icon">${icon}</div>
      <div class="toast__content">
        <strong>${title}</strong>
        ${message ? `<div style="opacity:0.8; font-size:0.9rem;">${message}</div>` : ''}
      </div>
      ${actionsHTML}
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
    });

    // Add action listeners
    toast.querySelectorAll('[data-toast-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.toastAction;
        if (action === 'view-cart') {
          openCartDrawer();
          removeToast(toast);
        }
      });
    });

    // Auto remove
    setTimeout(() => removeToast(toast), 4000);
  }

  function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }

  function renderCheckoutPage() {
    const host = document.getElementById("checkoutSummary");
    if (!host) return;
    const items = readCart();
    if (!items.length) {
      host.innerHTML = '<p class="empty-state">Your cart is empty. <a href="./shop.html">Go to shop</a>.</p>';
      return;
    }
    const markup = items
      .map(
        (item) => `
        <div class="cart-row">
          <div>${item.name} <span style="opacity:0.7;">× ${item.quantity || 1}</span></div>
          <div class="paise" style="font-size:1.1rem;">${formatCurrency(
          Number(item.price) * (item.quantity || 1)
        )}</div>
        </div>`
      )
      .join("");
    host.innerHTML = `${markup}<div class="paise" style="align-self:flex-end;">Total: ${formatCurrency(getTotal(items))}</div>`;
  }

  function renderCartPage() {
    const list = document.getElementById("cartItems");
    if (!list) return;
    const items = readCart();
    list.innerHTML = "";
    const empty = document.getElementById("cartEmpty");
    const totalEl = document.getElementById("cartTotal");
    if (items.length === 0) {
      if (empty) empty.style.display = "block";
      if (totalEl) totalEl.textContent = "0";
      return;
    }
    if (empty) empty.style.display = "none";
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-row reveal";
      row.innerHTML = `
        <div>${item.name}</div>
        <div class="cart-row-actions">
          <button class="btn btn--ghost" data-action="dec" data-name="${item.name}" aria-label="decrease quantity">-</button>
          <span class="badge" style="padding:0.25rem 0.9rem; font-size:1rem;">${item.quantity || 1}</span>
          <button class="btn btn--ghost" data-action="inc" data-name="${item.name}" aria-label="increase quantity">+</button>
          <div class="paise" style="font-size:1.1rem;">${formatCurrency(Number(item.price) * (item.quantity || 1))}</div>
          <button class="btn btn--ghost" data-action="remove" data-name="${item.name}">Remove</button>
        </div>
      `;
      list.appendChild(row);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => row.classList.add("revealed"));
      });
    });
    if (totalEl) totalEl.textContent = String(getTotal(items));
  }

  function syncThemeToggle(mode) {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
    toggle.dataset.theme = mode;
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const initial = saved || (prefersLightScheme.matches ? "light" : "dark");
    if (saved) {
      setTheme(saved);
      syncThemeToggle(saved);
    } else {
      document.documentElement.setAttribute("data-theme", initial);
      syncThemeToggle(initial);
    }
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "dark";
        const next = current === "light" ? "dark" : "light";
        setTheme(next);
        syncThemeToggle(next);
      });
    }
    prefersLightScheme.addEventListener("change", (event) => {
      if (!localStorage.getItem(THEME_KEY)) {
        const mode = event.matches ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", mode);
        syncThemeToggle(mode);
      }
    });
  }

  function initTiltCards() {
    if (motionQuery.matches) return;
    document.querySelectorAll("[data-tilt-card]").forEach((card) => {
      let bounds = card.getBoundingClientRect();
      const updateBounds = () => {
        bounds = card.getBoundingClientRect();
      };
      window.addEventListener("resize", updateBounds);
      card.addEventListener("pointermove", (event) => {
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const rotateY = ((x - bounds.width / 2) / (bounds.width / 2)) * 3;
        const rotateX = ((y - bounds.height / 2) / (bounds.height / 2)) * -3;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      const reset = () => {
        card.style.transform = "";
      };
      card.addEventListener("pointerleave", reset);
      card.addEventListener("pointerup", reset);
    });
  }

  function initGlassReveal() {
    const glassObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("glass-ready");
            glassObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-tilt-card]").forEach((el) => glassObserver.observe(el));
  }

  // ====== EVENT LISTENERS ======
  document.addEventListener("click", (e) => {
    const target = e.target;

    // Add to cart from product cards
    if (target && target.classList && target.classList.contains("add-to-cart")) {
      const name = target.getAttribute("data-name") || "Unknown";
      const price = target.getAttribute("data-price") || 0;
      const image = target.getAttribute("data-image") || null;
      addItem(name, price, image);
      createSuccessParticles(e.clientX, e.clientY);
    }

    // Cart page actions
    if (target && target.getAttribute) {
      const action = target.getAttribute("data-action");
      const name = target.getAttribute("data-name");
      if (action === "inc" && name) changeQty(name, 1);
      if (action === "dec" && name) changeQty(name, -1);
      if (action === "remove" && name) removeItem(name);
    }

    // Cart drawer actions
    const drawerAction = target.getAttribute?.("data-drawer-action");
    const drawerName = target.getAttribute?.("data-name");
    if (drawerAction && drawerName) {
      const items = readCart();
      const idx = items.findIndex(i => i.name === drawerName);
      if (idx >= 0) {
        if (drawerAction === "inc") {
          items[idx].quantity = (items[idx].quantity || 1) + 1;
          writeCart(items);
        } else if (drawerAction === "dec") {
          items[idx].quantity = Math.max(1, (items[idx].quantity || 1) - 1);
          writeCart(items);
        } else if (drawerAction === "remove") {
          items.splice(idx, 1);
          writeCart(items);
        }
      }
    }

    // Quick view triggers
    const quickViewCard = target.closest('[data-quick-view]');
    if (quickViewCard) {
      // Only trigger quick view if clicking the CTA
      if (target.closest('.product-card__cta')) {
        e.preventDefault();
        const productKey = quickViewCard.getAttribute('data-quick-view');
        openQuickView(productKey);
      }
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    initCursorGlow();
    initTheme();
    updateCartCount();
    renderCartDrawer();

    // Cart drawer controls
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');

    if (openCartBtn) openCartBtn.addEventListener('click', openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
    if (cartDrawerBackdrop) cartDrawerBackdrop.addEventListener('click', closeCartDrawer);

    // Quick view controls
    const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');
    const quickViewBackdrop = document.getElementById('quickViewBackdrop');
    const quickViewAddToCart = document.getElementById('quickViewAddToCart');

    if (closeQuickViewBtn) closeQuickViewBtn.addEventListener('click', closeQuickView);
    if (quickViewBackdrop) quickViewBackdrop.addEventListener('click', closeQuickView);

    if (quickViewAddToCart) {
      quickViewAddToCart.addEventListener('click', (e) => {
        if (currentQuickViewProduct) {
          addItem(currentQuickViewProduct.name, currentQuickViewProduct.price, currentQuickViewProduct.image);
          createSuccessParticles(e.clientX, e.clientY);
          closeQuickView();
        }
      });
    }

    // Size selector
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('size-option')) {
        document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
        selectedSize = e.target.dataset.size;
      }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCartDrawer();
        closeQuickView();
      }
    });

    const clearBtn = document.getElementById("clearCart");
    if (clearBtn) clearBtn.addEventListener("click", clearCart);
    renderCartPage();
    renderCheckoutPage();

    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const items = readCart();
        if (!items.length) {
          alert("Your cart is empty.");
          return;
        }

        const name = document.getElementById("fullName").value || "Customer";
        const summary = document.getElementById("checkoutSummary");
        writeCart([]);
        if (summary) {
          summary.innerHTML = `<div style="font-family:Bebas Neue; color: rgb(92,52,0);">Thank you, ${name}! Your order has been placed.</div>`;
        }
        checkoutForm.reset();
      });
    }

    initTiltCards();
    initGlassReveal();

    // Simple scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // Parallax background effect
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || window.pageYOffset;
          const offset = Math.round(y * -0.2);
          document.body.style.backgroundPosition = `center ${offset}px`;
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  });
})();

function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("cf_theme", mode);
}

function bumpCartCount() {
  const els = [document.getElementById("cartCount"), document.getElementById("cartCountNav")];
  els.forEach(el => {
    if (!el) return;
    el.classList.remove("cart-bump");
    void el.offsetWidth;
    el.classList.add("cart-bump");
  });
}

function initGlassReveal() {
  const glassObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("glass-ready");
          glassObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll("[data-tilt-card]").forEach((el) => glassObserver.observe(el));
}

// ====== EVENT LISTENERS ======


document.addEventListener("DOMContentLoaded", () => {
  initCursorGlow();
  initTheme();
  updateCartCount();
  renderCartDrawer();

  // Cart drawer controls
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');

  if (openCartBtn) openCartBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerBackdrop) cartDrawerBackdrop.addEventListener('click', closeCartDrawer);

  // Quick view controls
  const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');
  const quickViewBackdrop = document.getElementById('quickViewBackdrop');
  const quickViewAddToCart = document.getElementById('quickViewAddToCart');

  if (closeQuickViewBtn) closeQuickViewBtn.addEventListener('click', closeQuickView);
  if (quickViewBackdrop) quickViewBackdrop.addEventListener('click', closeQuickView);

  if (quickViewAddToCart) {
    quickViewAddToCart.addEventListener('click', (e) => {
      if (currentQuickViewProduct) {
        addItem(currentQuickViewProduct.name, currentQuickViewProduct.price, currentQuickViewProduct.image);
        createSuccessParticles(e.clientX, e.clientY);
        closeQuickView();
      }
    });
  }

  // Size selector
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('size-option')) {
      document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('selected'));
      e.target.classList.add('selected');
      selectedSize = e.target.dataset.size;
    }
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeQuickView();
    }
  });

  const clearBtn = document.getElementById("clearCart");
  if (clearBtn) clearBtn.addEventListener("click", clearCart);
  renderCartPage();
  renderCheckoutPage();

  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const items = readCart();
      if (!items.length) {
        alert("Your cart is empty.");
        return;
      }

      const name = document.getElementById("fullName").value || "Customer";
      const summary = document.getElementById("checkoutSummary");
      writeCart([]);
      if (summary) {
        summary.innerHTML = `<div style="font-family:Bebas Neue; color: rgb(92,52,0);">Thank you, ${name}! Your order has been placed.</div>`;
      }
      checkoutForm.reset();
    });
  }

  initTiltCards();
  initGlassReveal();
  initScrollProgress();
  initTextReveal();

  // Simple scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Parallax background effect
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        const offset = Math.round(y * -0.2);
        document.body.style.backgroundPosition = `center ${offset}px`;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
});

function initCursorGlow() {
  const motionPref = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionPref.matches) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  let isVisible = false;
  let rafId = null;
  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;
  let targetX = currentX;
  let targetY = currentY;

  const updateGlow = () => {
    const lerp = 0.15;
    currentX += (targetX - currentX) * lerp;
    currentY += (targetY - currentY) * lerp;
    glow.style.transform = `translate3d(${currentX - glow.offsetWidth / 2}px, ${currentY - glow.offsetHeight / 2}px, 0)`;
    rafId = requestAnimationFrame(updateGlow);
  };

  const handleMove = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(updateGlow);
    }
    if (!isVisible) {
      glow.style.opacity = "1";
      isVisible = true;
    }
  };

  document.addEventListener("pointermove", handleMove);
  document.addEventListener("pointerleave", () => {
    glow.style.opacity = "0";
    isVisible = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });
}

function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
  }, { passive: true });
}

function initTextReveal() {
  const head = document.querySelector('.head');
  if (!head) return;

  const text = head.textContent;
  head.textContent = '';

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'char-reveal';
    span.style.animationDelay = `${i * 0.05}s`;
    if (char === ' ') span.style.marginRight = '0.3em';
    head.appendChild(span);
  });
}
