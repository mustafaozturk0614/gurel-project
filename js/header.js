/**
 * Gürel Yönetim - Header JavaScript
 * Modern, Responsive ve Tema Uyumlu Header İşlevselliği
 * Versiyon: 2.1 - 2024
 */

// DOM içeriği yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', function() {
  console.log('Header.js yüklendi - v2.1');
  
  // Header elementlerini seç
  const header = document.querySelector('.patreon-header');
  const logo = document.querySelector('.header-logo');
  
  // Header'ı görünür yap
  if (header) {
    // Daha hızlı görünürlük için performans iyileştirmesi
    requestAnimationFrame(() => {
      header.classList.add('visible');
    });
  }
  
  // Tema değişkenlerini CSS'den oku
  const cssVars = readCSSVariables();
  
  // Global handleScroll fonksiyonu oluşturmak yerine, closure içinde tanımlayarak
  // referans tutulmasını ve bellek sızıntısını önlüyoruz
  const { handleScroll } = setupScrollHandlers(cssVars);
  
  // Mobil menü işlevleri
  setupMobileMenu();
  
  // Scroll progress bar
  setupScrollProgress();
  
  // Logo etkileşimleri
  setupLogoInteractions();
  
  // Erişilebilirlik ayarları
  setupAccessibility();
  
  // İlk yüklemede scroll kontrolü
  handleScroll();
  
  // Medya sorgusu değişikliklerini izle
  setupMediaQueryListeners(handleScroll, cssVars);
  
  // Performans iyileştirmesi: Pasif scroll dinleyici
  window.addEventListener('scroll', handleScroll, { passive: true });
});

/**
 * CSS değişkenlerini oku ve önbelleğe al
 * @returns {Object} CSS değişkenleri
 */
function readCSSVariables() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  
  // parseInt ile sayısal değerleri dönüştür, varsayılan değerler ekle
  return {
    headerHeight: style.getPropertyValue('--header-height').trim() || '190px',
    headerHeightScrolled: style.getPropertyValue('--header-height-scrolled').trim() || '100px',
    headerHeightMini: style.getPropertyValue('--header-height-mini').trim() || '80px',
    logoHeight: style.getPropertyValue('--header-logo-height').trim() || '100px',
    logoHeightScrolled: style.getPropertyValue('--header-logo-height-scrolled').trim() || '94px',
    logoHeightMobile: style.getPropertyValue('--header-logo-height-mobile').trim() || '100px',
    logoHeightMini: style.getPropertyValue('--header-logo-height-mini').trim() || '60px',
    transitionBase: style.getPropertyValue('--transition-base').trim() || '0.3s ease-in-out',
    mobileMenuWidth: style.getPropertyValue('--mobile-menu-width').trim() || '280px'
  };
}

/**
 * Scroll olaylarını yapılandır
 * @param {Object} cssVars - CSS değişkenleri
 * @returns {Object} - handleScroll fonksiyonu
 */
function setupScrollHandlers(cssVars) {
  // Değişkenler
  let lastScrollTop = 0;
  let lastScrollDir = 'none';
  let scrollTimeout = null;
  const scrollThreshold = 50;
  
  // Scroll olayını işle - optimize edilmiş
function handleScroll() {
  const header = document.querySelector('.patreon-header');
  if (!header) return;
  
    // Performance API ile daha doğru scroll pozisyonu
    const scrollY = window.scrollY || window.pageYOffset;
    const currentScrollTop = scrollY;
    
    // Yukarı/aşağı scroll tespiti
    const isScrollingDown = currentScrollTop > lastScrollTop;
    const scrollDelta = Math.abs(currentScrollTop - lastScrollTop);
    
    // Çok küçük scroll hareketi varsa işlemi atla (performans için)
    if (scrollDelta < 5 && lastScrollDir !== 'none') return;
    
    // Güncel scroll yönünü kaydet
    lastScrollDir = isScrollingDown ? 'down' : 'up';
    
    // requestAnimationFrame ile render optimizasyonu
    requestAnimationFrame(() => {
      // Scroll durumunu değiştir
      if (currentScrollTop <= scrollThreshold) {
        // En üstteyiz - normal durum
    header.classList.remove('scrolled', 'mini-header', 'scroll-up', 'scroll-down');
        
        // Transparent sınıfını koru
        if (header.hasAttribute('data-transparent')) {
      header.classList.add('transparent');
    }
        
        // Logo boyutunu normal yap
        updateHeaderVisuals(header, 'normal', cssVars);
        
  } else {
    header.classList.add('scrolled');
    header.classList.remove('transparent');
    
        // Yukarı/aşağı scroll sınıfları - header'ın kaybolmasını engelle
        // Aşağı kaydırırken header'ı gizlemeyi kaldırdım
        if (!isScrollingDown && scrollDelta > 10) {
          header.classList.add('scroll-up');
          header.classList.remove('scroll-down');
        }
        
        // Derin scroll için mini header
    if (scrollY > 300) {
      header.classList.add('mini-header');
          updateHeaderVisuals(header, 'mini', cssVars);
    } else {
      header.classList.remove('mini-header');
          updateHeaderVisuals(header, 'scrolled', cssVars);
        }
      }
      
      // Scroll progress barını güncelle
      updateScrollProgress(scrollY);
    });
    
    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    
    // Scroll işlemlerini grupla (debounce) - performans iyileştirmesi
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Scroll durduktan sonra yapılacak işlemler
      document.body.classList.remove('is-scrolling');
    }, 150);
    
    if (!document.body.classList.contains('is-scrolling')) {
      document.body.classList.add('is-scrolling');
    }
  }
  
  /**
   * Scroll progress barını güncelle - ayrı fonksiyon olarak
   * @param {number} scrollY - Scroll pozisyonu
   */
  function updateScrollProgress(scrollY) {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;
  
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight, 
      document.documentElement.clientHeight, 
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const winHeight = window.innerHeight;
    const scrollPercent = scrollY / (docHeight - winHeight);
    const scrollPercentRounded = Math.min(Math.max(scrollPercent, 0), 1) * 100;
    
    progressBar.style.width = scrollPercentRounded + '%';
    
    // Yüksek ilerleme durumunda glow efektini ayarla
    if (scrollPercentRounded > 80) {
      progressBar.classList.add('near-end');
    } else {
      progressBar.classList.remove('near-end');
    }
  }
  
  // Sadece handleScroll fonksiyonunu dışarı açıyoruz
  return { handleScroll };
}

/**
 * Header görsel öğelerini güncelle
 * @param {HTMLElement} header - Header elementi
 * @param {string} state - Header durumu (normal, scrolled, mini)
 * @param {Object} cssVars - CSS değişkenleri
 */
function updateHeaderVisuals(header, state, cssVars) {
  const logo = header.querySelector('.header-logo');
  const navbarBrand = header.querySelector('.navbar-brand');
  
  if (!logo || !navbarBrand) return;
  
  // State değişikliğini veri özniteliğinde tut (CSS'den erişilebilir)
  header.setAttribute('data-state', state);
  
  // CSS sınıfları yönetimi
  if (state === 'normal') {
    logo.classList.remove('scrolled-logo', 'mini-logo');
    navbarBrand.classList.remove('scrolled');
    
    // CSS değişkenlerini kullan
    logo.style.height = cssVars.logoHeight;
    // Force reflow için - bazen Firefox'ta gerekebilir
    logo.offsetHeight;
  } 
  else if (state === 'scrolled') {
    logo.classList.add('scrolled-logo');
    logo.classList.remove('mini-logo');
    navbarBrand.classList.add('scrolled');
    
    // CSS değişkenlerini kullan
    logo.style.height = cssVars.logoHeightScrolled;
    // Force reflow için
    logo.offsetHeight;
  }
  else if (state === 'mini') {
    logo.classList.add('scrolled-logo', 'mini-logo');
    navbarBrand.classList.add('scrolled');
    
    // CSS değişkenlerini kullan
    logo.style.height = cssVars.logoHeightMini;
    // Force reflow için
    logo.offsetHeight;
  }
  
  // CSS kural seti - özellikle !important ile
  logo.style.setProperty('max-height', 'var(--header-logo-max-height, 200px)', 'important');
  
  // Animasyon performansı için will-change özelliği
  logo.style.willChange = 'height, transform';
  
  // Doğrudan stil uygulama (tarayıcı uyumluluğunu artırmak için)
  if (state === 'normal') {
    logo.style.setProperty('height', cssVars.logoHeight);
  } else if (state === 'scrolled') {
    logo.style.setProperty('height', cssVars.logoHeightScrolled );
  } else if (state === 'mini') {
    logo.style.setProperty('height', cssVars.logoHeightMini);
  }
  
  // Değişimleri logla (sadece geliştirme ortamında)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`Logo durumu: ${state}, Yükseklik: ${logo.style.height}`);
  }
}

/**
 * Mobil menü işlevlerini ayarla
 */
function setupMobileMenu() {
  const hamburgerButton = document.querySelector('.hamburger-menu');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const closeButton = document.querySelector('.mobile-menu-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  if (!hamburgerButton || !mobileMenu || !mobileMenuOverlay) return;
  
  // Animasyon değişkenlerini ayarla
  let itemIndex = 0;
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  mobileNavItems.forEach(item => {
    item.style.setProperty('--item-index', itemIndex++);
  });
  
  // Hamburger menü tıklanınca
  hamburgerButton.addEventListener('click', function() {
    toggleMobileMenu(true);
    hamburgerButton.classList.add('active');
    hamburgerButton.setAttribute('aria-expanded', 'true');
  });
  
  // Kapat butonuna tıklanınca
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      toggleMobileMenu(false);
      hamburgerButton.classList.remove('active');
      hamburgerButton.setAttribute('aria-expanded', 'false');
    });
  }
  
  // Overlay'a tıklanınca
  mobileMenuOverlay.addEventListener('click', function() {
    toggleMobileMenu(false);
    hamburgerButton.classList.remove('active');
    hamburgerButton.setAttribute('aria-expanded', 'false');
  });
  
  // Mobil nav linklerine tıklanınca menüyü kapat
  if (mobileNavLinks) {
    mobileNavLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        toggleMobileMenu(false);
        hamburgerButton.classList.remove('active');
        hamburgerButton.setAttribute('aria-expanded', 'false');
      });
    });
  }
  
  // Escape tuşuna basıldığında menüyü kapat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      toggleMobileMenu(false);
      hamburgerButton.classList.remove('active');
      hamburgerButton.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Mobil menüyü aç/kapat
  function toggleMobileMenu(open) {
    if (open) {
      mobileMenu.classList.add('active');
      mobileMenuOverlay.classList.add('active');
      document.body.classList.add('mobile-menu-open');
      document.documentElement.classList.add('mobile-menu-open');
      
      // Odağı menüye taşı - erişilebilirlik
      setTimeout(() => {
        if (closeButton) closeButton.focus();
      }, 100);
    } else {
      mobileMenu.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      document.body.classList.remove('mobile-menu-open');
      document.documentElement.classList.remove('mobile-menu-open');
      
      // Odağı hamburger düğmesine geri getir - erişilebilirlik
      setTimeout(() => {
        hamburgerButton.focus();
      }, 100);
    }
  }
}

/**
 * Scroll progress bar'ı ayarla
 */
function setupScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  
  if (!progressBar) return;
  
  // Parlama efekti ekle
  progressBar.classList.add('glow-effect');
}

/**
 * Logo etkileşimlerini ayarla
 */
function setupLogoInteractions() {
  const navbarBrand = document.querySelector('.navbar-brand');
  
  if (!navbarBrand) return;
  
  // Mouse takibi değişkenlerini ayarla
  navbarBrand.addEventListener('mousemove', function(e) {
    // Performans iyileştirmesi için throttle tekniği
    if (!this.lastMove || Date.now() - this.lastMove > 40) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      this.style.setProperty('--x-pos', x + '%');
      this.style.setProperty('--y-pos', y + '%');
      
      this.lastMove = Date.now();
    }
  });
  
  // Logoya ripple efekti ekle
  navbarBrand.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

/**
 * Erişilebilirlik ayarlarını kur
 */
function setupAccessibility() {
  // Azaltılmış hareket kontrolü
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.documentElement.setAttribute('data-reduced-motion', 'true');
    // Animasyonları kaldırma
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      [data-reduced-motion="true"] * {
        transition-duration: 0.001ms !important;
        animation-duration: 0.001ms !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Yüksek kontrast kontrolü
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  
  if (prefersHighContrast) {
    document.documentElement.setAttribute('data-high-contrast', 'true');
  }
  
  
}

/**
 * Medya sorgusu değişikliklerini izle
 * @param {Function} handleScroll - Scroll işleme fonksiyonu
 * @param {Object} cssVars - CSS değişkenleri
 */
function setupMediaQueryListeners(handleScroll, cssVars) {
  // Karanlık/Aydınlık mod değişiklikleri
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  function handleDarkModeChange(e) {
    if (e.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
  
  // İlk yükleme kontrolü
  handleDarkModeChange(darkModeQuery);
  
  // Değişiklik dinleyicisi
  darkModeQuery.addEventListener('change', handleDarkModeChange);
  
  // Ekran genişliği değişiklikleri
  const mobileBp = window.matchMedia('(max-width: 768px)');
  const tabletBp = window.matchMedia('(min-width: 769px) and (max-width: 1200px)');
  
  function handleMobileChange(e) {
    if (e.matches) {
      handleDeviceChange('mobile', handleScroll, cssVars);
    }
  }
  
  function handleTabletChange(e) {
    if (e.matches) {
      handleDeviceChange('tablet', handleScroll, cssVars);
    }
  }
  
  // İlk yükleme kontrolü
  if (mobileBp.matches) {
    handleDeviceChange('mobile', handleScroll, cssVars);
  } else if (tabletBp.matches) {
    handleDeviceChange('tablet', handleScroll, cssVars);
  } else {
    handleDeviceChange('desktop', handleScroll, cssVars);
  }
  
  // Değişiklik dinleyicileri
  mobileBp.addEventListener('change', handleMobileChange);
  tabletBp.addEventListener('change', handleTabletChange);
}

/**
 * Cihaz değişikliklerini yönet
 * @param {string} device - Cihaz türü
 * @param {Function} handleScroll - Scroll işleme fonksiyonu 
 * @param {Object} cssVars - CSS değişkenleri
 */
function handleDeviceChange(device, handleScroll, cssVars) {
  const header = document.querySelector('.patreon-header');
  if (!header) return;
  
  header.setAttribute('data-device', device);
  
  // Yeni CSS değişkenlerini oku
  const newCssVars = readCSSVariables();
  Object.assign(cssVars, newCssVars);
  
  // Header durumunu güncelle
  handleScroll();
}