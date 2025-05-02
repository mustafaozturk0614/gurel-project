/**
 * Gürel Yönetim - Ana JavaScript Dosyası
 * Version: 2.0.0
 */

// Sabitler ve Yapılandırma
const CONFIG = {
  animation: {
    duration: 800,
    easing: 'ease-in-out',
    once: false,
    mirror: true,
    offset: 50
  },
  scroll: {
    threshold: 50,
    headerOpacity: 0.9,
    blurAmount: 3
  },
  map: {
    zoom: 15,
    center: {
      lat: 39.592450,
      lng: 27.016894
    }
  },
  breakpoints: {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
  }
};

// Harita Konumları
const MAP_LOCATIONS = {
    'Edremit': { 
    lat: 39.592450,
    lng: 27.016894,
    zoom: 16,
    position: { top: '50%', left: '50%' }
    },
    'Akçay': { 
    lat: 39.583333,
    lng: 26.933333,
    zoom: 16,
    position: { top: '45%', left: '35%' }
    },
    'Güre': { 
    lat: 39.586667,
    lng: 26.883333,
    zoom: 16,
    position: { top: '42%', left: '30%' }
    },
    'Burhaniye': { 
    lat: 39.500000,
    lng: 26.966667,
    zoom: 16,
    position: { top: '65%', left: '55%' }
    },
    'Altınoluk': { 
    lat: 39.566667,
    lng: 26.733333,
    zoom: 16,
    position: { top: '35%', left: '25%' }
  }
};

// Uygulama State Yönetimi - Singleton Pattern
const AppState = (() => {
  // Private state
  const state = {
    isMenuOpen: false,
    currentSection: '',
    isHeaderScrolled: false,
    activeRegion: 'Edremit',
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    currentLanguage: localStorage.getItem('selectedLanguage') || 'tr'
  };
  
  // Public API
  return {
    get: (key) => state[key],
    set: (key, value) => {
      state[key] = value;
      // State değişikliğinde event yayınlama
      EventBus.publish('stateChanged', { key, value });
    },
    getAll: () => ({...state})
  };
})();

// Event Bus - Singleton Pattern ve WeakMap kullanımı ile optimize edilmiş
const EventBus = (() => {
  // WeakMap kullanarak bellek sızıntılarını önleme
  const events = new Map();
  
  // Yardımcı fonksiyonlar
  function getEventCallbacks(event) {
    if (!events.has(event)) {
      events.set(event, new Set());
    }
    return events.get(event);
  }
  
  return {
    // Event dinleme
    subscribe(event, callback) {
      const callbacks = getEventCallbacks(event);
      callbacks.add(callback);
      
      // Unsubscribe fonksiyonu döndürme (Cleanup kolaylığı)
      return () => this.unsubscribe(event, callback);
    },
    
    // Event tetikleme
    publish(event, data) {
      if (!events.has(event)) return;
      
      const callbacks = events.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event callback error (${event}):`, error);
        }
      });
    },
    
    // Event dinlemeyi durdurma
    unsubscribe(event, callback) {
      if (!events.has(event)) return;
      
      const callbacks = events.get(event);
      callbacks.delete(callback);
      
      // Boş event listelerini temizleme (memory optimization)
      if (callbacks.size === 0) {
        events.delete(event);
      }
    },
    
    // Tüm eventleri temizleme (test ve debug için)
    clear() {
      events.clear();
    }
  };
})();

// Utility Fonksiyonları - Performans ve kullanım iyileştirmeleri
const Utils = {
  /**
   * Performans optimize edilmiş debounce fonksiyonu
   * Bir fonksiyonun çalışmasını geciktirerek, sık tekrarlanan 
   * çağrıları gruplaştırır.
   */
  debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
      // Bu fonksiyonu referanslayabiliriz
      const context = this;
      
      // setTimeout'un dönüş değerini sakla
      const later = () => {
        timeout = null;
        func.apply(context, args);
      };
      
      // Timeout'u temizle ve yeni bir tane ata
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Performans optimize edilmiş throttle fonksiyonu
   * Bir fonksiyonun belirli bir süre içinde en fazla bir kez
   * çalışmasını sağlar.
   */
  throttle(func, limit = 300) {
    let inThrottle;
    let lastFunc;
    let lastRan;
    
    return function(...args) {
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        lastRan = Date.now();
        inThrottle = true;
      } else {
        clearTimeout(lastFunc);
        
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  },
  
  /**
   * Element viewport içinde mi kontrol eder
   * IntersectionObserver kullanmak daha verimli bir alternatif olabilir
   */
  isInViewport(element, offset = 0) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 - offset &&
      rect.left >= 0 - offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  },
  
  /**
   * İyileştirilmiş mobil kontrol fonksiyonu (tarayıcı algılama dahil)
   */
  isMobile() {
    // İlk çağrıda hesaplanır ve saklanır (memoization)
    if (this._isMobileResult === undefined) {
      this._isMobileResult = window.innerWidth < CONFIG.breakpoints.lg || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    return this._isMobileResult;
  },
  
  /**
   * Ekran boyutu değiştiğinde önbelleği temizle
   */
  resetMobileCache() {
    this._isMobileResult = undefined;
  },
  
  /**
   * DOM elementlerini verimli bir şekilde cache'leyerek performans arttırma
   */
  domCache: new Map(),
  
  getElement(selector) {
    if (!this.domCache.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        this.domCache.set(selector, element);
      }
    }
    return this.domCache.get(selector);
  },
  
  /**
   * DOM manipülasyonlarını optimize etme
   */
  batchDOMUpdates(updates) {
    // requestAnimationFrame kullanarak DOM güncellemelerini bir sonraki 
    // frame'e taşıyoruz ve bir arada yapıyoruz.
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        updates();
        resolve();
      });
    });
  }
};

// Window resize olayında mobil durum önbelleğini sıfırla
window.addEventListener('resize', Utils.resetMobileCache.bind(Utils));

// Ana başlatma işlevi
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Tüm modülleri başlatan ana fonksiyon
function initApp() {
  // Sayfa yükleme animasyonunu kaldır
  setTimeout(() => {
    document.getElementById('loading').style.display = 'none';
    document.documentElement.classList.add('loaded');
  }, 500);

  // Header sistemini başlat
  initHeaderSystem();

  // Tab sistemi
  initTabSystem();

  // Modern hero efektleri
  initModernHero();

  // Paralaks efektleri
  initParallaxEffects();

  // Tilt kart efektleri
  initTiltEffects();

  // Sayaçları başlat
  initCounters();
  
  // Form doğrulamasını başlat
  initFormValidation();
  
  // Harita özelliklerini başlat
  initMapFeatures();
  
  // Telif hakkı yılını güncelle
  updateCopyrightYear();
  
  // Smooth scroll için scroll olaylarını başlat
  initScrollEvents();
  
  // Animasyonları başlat
  initServiceAnimations();
  

  
  // Tema sistemini başlat (dark/light mode)
  initThemeSystem();
  
  // Mobil menüyü başlat
  initMobileMenu();

  // AOS - Animate on scroll kütüphanesini başlat
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });
}

/**
 * Header Sistemleri
 */
function initHeaderSystem() {
  const header = document.querySelector('.patreon-header');
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  
  if (!header) return;
  
  // Header scroll olayı
  const updateHeader = Utils.throttle(() => {
    const scrollTop = window.scrollY;
    const isScrolled = scrollTop > CONFIG.scroll.threshold;
    
    // Header durumunu güncelle
    header.classList.toggle('scrolled', isScrolled);
    AppState.set('isHeaderScrolled', isScrolled);
    
    // Opaklık ve blur efektlerini ayarla
    if (header.classList.contains('transparent')) {
      const opacity = Math.min(scrollTop / CONFIG.scroll.threshold * CONFIG.scroll.headerOpacity, CONFIG.scroll.headerOpacity);
      const blur = Math.min(scrollTop / CONFIG.scroll.threshold * CONFIG.scroll.blurAmount, CONFIG.scroll.blurAmount);
      
      header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      header.style.backdropFilter = `blur(${blur}px)`;
    }
    
    // Aktif menü öğesini güncelle
    updateActiveNavItem();
    
    // Event yayınla
    EventBus.publish('headerStateChanged', { isScrolled, scrollTop });
  }, 16); // 60fps için 16ms throttle
  
  // İlk yükleme için header durumunu ayarla
  updateHeader();
  
  // Scroll olayını dinle
  window.addEventListener('scroll', updateHeader);
  
  // Navbar toggle işlevi
  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', () => {
      const expanded = navbarToggler.getAttribute('aria-expanded') === 'true';
      const newState = !expanded;
      
      // Durumu güncelle
      AppState.set('isMenuOpen', newState);
      navbarToggler.setAttribute('aria-expanded', String(newState));
      navbarCollapse.classList.toggle('show', newState);
      document.body.classList.toggle('menu-open', newState);
      
      // Menü açıldığında headerin görünümünü ayarla
      if (newState && Utils.isMobile()) {
        header.classList.remove('transparent');
        header.classList.add('scrolled');
      } else if (window.scrollY <= CONFIG.scroll.threshold) {
        header.classList.add('transparent');
        header.classList.remove('scrolled');
      }
      
      // Event yayınla
      EventBus.publish('menuStateChanged', { isOpen: newState });
    });
    
    // Menü öğelerine tıklandığında menüyü kapat
    document.querySelectorAll('.nav-link, .header-button').forEach(link => {
      link.addEventListener('click', () => {
        if (AppState.get('isMenuOpen')) {
          AppState.set('isMenuOpen', false);
          navbarCollapse.classList.remove('show');
          navbarToggler.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('menu-open');
          
          // Header durumunu güncelle
          setTimeout(updateHeader, 300);
        }
      });
    });
    
    // Sayfa dışına tıklandığında menüyü kapat
    document.addEventListener('click', (e) => {
      if (AppState.get('isMenuOpen') && 
          !navbarCollapse.contains(e.target) && 
          !navbarToggler.contains(e.target)) {
        AppState.set('isMenuOpen', false);
        navbarCollapse.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        
        // Header durumunu güncelle
        if (window.scrollY <= CONFIG.scroll.threshold) {
          header.classList.add('transparent');
          header.classList.remove('scrolled');
        }
      }
    });
  }
  
  // Yumuşak geçiş için tüm çapa linklerini düzenle
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = header.offsetHeight || 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        
        window.scrollTo({
          top: targetPosition - headerHeight,
          behavior: 'smooth'
        });
        
        // URL'i güncelle
        history.pushState(null, '', targetId);
      }
    });
  });
}

/**
 * Aktif menü öğesini güncelleme
 */
function updateActiveNavItem() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.patreon-header .nav-link');
  
  if (!sections.length || !navItems.length) return;
  
  const headerHeight = document.querySelector('.patreon-header')?.offsetHeight || 0;
  const scrollY = window.scrollY + headerHeight + 50;
  
  let currentSection = null;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
      AppState.set('currentSection', currentSection);
    }
  });
  
  navItems.forEach(item => {
    item.classList.remove('active');
    const href = item.getAttribute('href');
    if (href && href.includes('#') && href.substr(href.indexOf('#') + 1) === currentSection) {
      item.classList.add('active');
    }
  });
  
  // Ana sayfa linkini kontrol et
  if (!currentSection && window.scrollY < 100) {
    const homeLink = document.querySelector('.patreon-header .nav-link[href="#home"], .patreon-header .nav-link[href="#"]');
    if (homeLink) {
      homeLink.classList.add('active');
    }
  }
  
  // Event yayınla
  EventBus.publish('activeNavItemChanged', { currentSection });
}

/**
 * Tab Sistemi
 */
function initTabSystem() {
  // Hero alanı tab sistemini başlat
  const tabElms = document.querySelectorAll('#serviceTabList [data-bs-toggle="tab"]');
  
  if (!tabElms.length) return;
  
  const TabManager = {
    activeTab: null,
    
    init() {
  tabElms.forEach((tabElm, idx, tabElmsArr) => {
        // Tıklama olayı
        tabElm.addEventListener('click', (e) => {
      e.preventDefault();
          this.switchTab(tabElm, idx, tabElmsArr);
        });
        
        // Klavye navigasyonu
        tabElm.addEventListener('keydown', (e) => {
          let newIndex;
          switch (e.key) {
            case 'ArrowRight': 
              newIndex = (idx + 1) % tabElmsArr.length; 
              break;
            case 'ArrowLeft': 
              newIndex = (idx - 1 + tabElmsArr.length) % tabElmsArr.length; 
              break;
            case 'Home': 
              newIndex = 0; 
              break;
            case 'End': 
              newIndex = tabElmsArr.length - 1; 
              break;
            default: 
              return;
          }
          e.preventDefault();
          tabElmsArr[newIndex].focus();
          this.switchTab(tabElmsArr[newIndex], newIndex, tabElmsArr);
        });
      });
      
      // İlk tabı aktif et
      if (tabElms[0]) {
        this.switchTab(tabElms[0], 0, tabElms);
      }
    },
    
    switchTab(tabElm, index, allTabs) {
      // Önceki aktif tabı deaktive et
      allTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
        const tabPane = document.querySelector(t.getAttribute('data-bs-target'));
        if (tabPane) {
          tabPane.classList.remove('show', 'active');
        }
      });
      
      // Yeni tabı aktive et
      tabElm.classList.add('active');
      tabElm.setAttribute('aria-selected', 'true');
      tabElm.setAttribute('tabindex', '0');
      
      const target = document.querySelector(tabElm.getAttribute('data-bs-target'));
      if (target) {
        target.classList.add('show', 'active');
        animateCards(target);
      }
      
      this.activeTab = index;
      
      // Event yayınla
      EventBus.publish('tabChanged', { 
        index, 
        tabId: tabElm.getAttribute('data-bs-target') 
      });
    }
  };
  
  TabManager.init();
  
  // Servis kategorisi sekmelerini başlat
  const serviceTabs = document.querySelectorAll('.service-category-tabs .nav-link');
  if (serviceTabs.length) {
    const ServiceTabManager = {
      init() {
        serviceTabs.forEach((tab, idx) => {
          tab.addEventListener('click', () => {
            this.switchServiceTab(tab, idx);
          });
          
          // Klavye ile sekme açma
          tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.switchServiceTab(tab, idx);
            }
          });
        });
        
        // İlk servis tabını aktif et
        if (serviceTabs[0]) {
          this.switchServiceTab(serviceTabs[0], 0);
        }
      },
      
      switchServiceTab(tab, index) {
        serviceTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        const targetId = tab.getAttribute('data-bs-target').replace('#', '');
        const tabContentContainer = document.querySelector('.service-category-tabs + .tab-content');
        
        if (tabContentContainer) {
        const tabPanes = tabContentContainer.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
          pane.classList.remove('show', 'active');
          if (pane.id === targetId) {
            pane.classList.add('show', 'active');
            animateCards(pane);
          }
        });
        }
        
        // Event yayınla
        EventBus.publish('serviceTabChanged', { index, targetId });
      }
    };
    
    ServiceTabManager.init();
  }
}

/**
 * Tab değişiminde kart animasyonları
 */
function animateCards(container) {
  const cards = container.querySelectorAll('.service-card');
  
  cards.forEach((card, index) => {
    // Animasyon başlamadan önce kartı gizle
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    // FLIP animasyon tekniği
    const first = card.getBoundingClientRect();
    
    requestAnimationFrame(() => {
      // Animasyon
      card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      
      // Son pozisyonu al
      const last = card.getBoundingClientRect();
      
      // Animasyonu uygula
      const deltaY = first.top - last.top;
      
      card.style.transform = `translateY(${deltaY}px)`;
      requestAnimationFrame(() => {
        card.style.transform = '';
        card.style.transition = `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`;
      });
    });
  });
}

/**
 * Servis Animasyonları
 */
function initServiceAnimations() {
  const cards = document.querySelectorAll('.services-section .service-card');
  if (!cards.length) return;
  
  // Intersection Observer ile görünüm animasyonu
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
        observer.unobserve(entry.target);
        
        // Event yayınla
        EventBus.publish('serviceCardVisible', { 
          cardId: entry.target.id 
        });
      }
    });
  }, { 
    threshold: 0.2,
    rootMargin: '50px'
  });
  
  cards.forEach(card => {
    // Başlangıç durumu
    card.classList.add('not-visible');
    observer.observe(card);
  
  // Kart tıklama dalgalanma efekti
    card.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Ripple elementi oluştur
      const ripple = document.createElement('div');
      ripple.classList.add('ripple-effect');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      // Ripple elementini temizle
      setTimeout(() => {
        ripple.remove();
      }, 600);
      
      // Event yayınla
      EventBus.publish('serviceCardClicked', {
        cardId: this.id,
        position: { x, y }
      });
    });
  });
}

/**
 * Modern Hero Özellikleri
 */
function initModernHero() {
  // Paralaks efekti (masaüstü için)
  if (window.innerWidth > CONFIG.breakpoints.lg) {
    const ParallaxManager = {
      layers: document.querySelectorAll('.parallax-layer'),
      
      init() {
        if (!this.layers.length) return;
        
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
      },
      
      handleMouseMove(e) {
            const pageX = e.clientX;
            const pageY = e.clientY;
            
        requestAnimationFrame(() => {
          this.layers.forEach(layer => {
        const speed = layer.getAttribute('data-depth') || 0.05;
                const x = (window.innerWidth - pageX * speed) / 100;
                const y = (window.innerHeight - pageY * speed) / 100;
            
            layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          });
        });
      },
      
      handleDeviceOrientation(e) {
        if (!e.beta || !e.gamma) return;
        
        requestAnimationFrame(() => {
          const x = e.gamma / 45;
          const y = e.beta / 45;
          
          this.layers.forEach(layer => {
            const speed = layer.getAttribute('data-depth') || 0.05;
            layer.style.transform = `translate3d(${x * speed * 100}px, ${y * speed * 100}px, 0)`;
            });
        });
    }
    };
    
    ParallaxManager.init();
  }
  
  // 3D kart efekti
  const Card3DManager = {
    card: document.querySelector('.hero-3d-card'),
    
    init() {
      if (!this.card || window.innerWidth <= CONFIG.breakpoints.lg) return;
      
      this.card.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.card.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
      
      // VanillaTilt entegrasyonu
      if (window.VanillaTilt) {
        VanillaTilt.init(this.card, {
          max: 10,
          speed: 300,
          glare: true,
          "max-glare": 0.2,
          gyroscope: true
        });
      }
    },
    
    handleMouseMove(e) {
      const cardRect = this.card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const mouseX = e.clientX - cardCenterX;
            const mouseY = e.clientY - cardCenterY;
            
            const rotateX = -mouseY / 20;
            const rotateY = mouseX / 20;
            
      const cardWrapper = this.card.querySelector('.card-3d-wrapper');
      if (cardWrapper) {
        cardWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
        // Derinlik efekti
        const items = this.card.querySelectorAll('.service-icon, h4, p');
            items.forEach((item, index) => {
                const depth = index * 0.5 + 2;
                item.style.transform = `translateZ(${depth}px)`;
            });
      }
    },
        
    handleMouseLeave() {
      const cardWrapper = this.card.querySelector('.card-3d-wrapper');
      if (cardWrapper) {
        cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
            
        // Derinliği sıfırla
        const items = this.card.querySelectorAll('.service-icon, h4, p');
            items.forEach(item => {
                item.style.transform = 'translateZ(0px)';
            });
      }
    }
  };
  
  Card3DManager.init();
  
  // Video lazy loading
  const VideoManager = {
    video: document.getElementById('hero-video'),
    
    init() {
      if (!this.video) return;
      
      // IntersectionObserver ile görünüm kontrolü
      const observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        { threshold: 0.1 }
      );
      
      observer.observe(this.video);
      
      // Yedek yükleme olayları
      window.addEventListener('scroll', () => this.loadVideo(), { once: true });
      window.addEventListener('mousemove', () => this.loadVideo(), { once: true });
      window.addEventListener('touchstart', () => this.loadVideo(), { once: true });
    },
    
    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadVideo();
        }
      });
    },
    
    loadVideo() {
      if (this.video.getAttribute('data-loaded') === 'true') return;
      
      this.video.setAttribute('data-loaded', 'true');
      this.video.load();
      
      // Video hazır olduğunda oynat
      this.video.addEventListener('loadeddata', () => {
        this.video.play();
        EventBus.publish('heroVideoLoaded', null);
      });
    }
  };
  
  VideoManager.init();
  
  // Scroll göstergesi
  const ScrollIndicator = {
    indicator: document.querySelector('.scroll-indicator'),
    
    init() {
      if (!this.indicator) return;
      
      this.indicator.addEventListener('click', this.handleClick.bind(this));
      window.addEventListener('scroll', this.handleScroll.bind(this));
    },
    
    handleClick() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
    },
        
    handleScroll() {
      this.indicator.classList.toggle('hidden', window.scrollY > 300);
  }
  };
  
  ScrollIndicator.init();
}

/**
 * Paralaks Efektleri
 */
function initParallaxEffects() {
  const ParallaxElements = {
    elements: {
      '.hero-wave-transition': { factor: 0.02, scale: true },
      '.floating-feature-card': { factor: -0.03 }
    },
    
    init() {
      window.addEventListener('scroll', () => {
        requestAnimationFrame(this.updateElements.bind(this));
      });
    },
    
    updateElements() {
    const scrollTop = window.scrollY;
    
      Object.entries(this.elements).forEach(([selector, config]) => {
      const element = document.querySelector(selector);
        if (!element) return;
        
        const translateY = scrollTop * config.factor;
        const transform = config.scale
          ? `translateY(${translateY}px) scale(1.02)`
          : `translateY(${translateY}px)`;
        
        element.style.transform = transform;
      });
    }
  };
  
  ParallaxElements.init();
}

/**
 * Tilt Efektleri
 */
function initTiltEffects() {
  const tiltElements = document.querySelectorAll('[data-tilt]');
  
  if (!tiltElements.length) return;
  
  // Vanilla JS ile basit tilt efekti
  tiltElements.forEach(element => {
    const handleTilt = (e) => {
      if (e.type === 'mousemove') {
        const { left, top, width, height } = element.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        element.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.03, 1.03, 1.03)`;
      } else {
        element.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
      }
    };
    
    element.addEventListener('mousemove', handleTilt);
    element.addEventListener('mouseleave', handleTilt);
  });
  
  // VanillaTilt kütüphanesi varsa daha gelişmiş efektler ekle
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(tiltElements, {
      max: 5,
      speed: 400,
      perspective: 800,
      scale: 1.03
    });
  }
}

/**
 * Sayaç Animasyonları
 */
function initCounters() {
  // Hero stats için sayaç animasyonu
  const startHeroStatsCounter = () => {
    const heroStats = document.querySelectorAll('.hero-stats .counting');
    if (heroStats.length === 0) return;
    
    const observer = new IntersectionObserver(
        entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-count');
                const increment = Math.max(1, Math.trunc(target / 50));
                let current = 0;
                
                const updateCount = () => {
                    if (current < target) {
                        current += increment;
                        if (current > target) current = target;
                        entry.target.textContent = current;
                        requestAnimationFrame(updateCount);
                    }
                };
                
                updateCount();
                observer.unobserve(entry.target);
            }
        }),
        { threshold: 0.5 }
    );
    
    heroStats.forEach(stat => observer.observe(stat));
  };
  
  // Genel sayaç animasyonu
  const startCounting = () => {
    document.querySelectorAll('.counting').forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const increment = Math.trunc(target / 200);
      
      const updateCount = () => {
        const count = +counter.innerText.replace(/,/g, '');
        if (count < target) {
          counter.innerText = (count + increment).toString();
          setTimeout(updateCount, 1);
        } else {
          counter.innerText = target.toString();
        }
      };
      
      updateCount();
    });
  };
  
  // Sayaç gözlemcisi
    const observer = new IntersectionObserver(
        entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
        if (entry.target.classList.contains('hero-stats')) {
          startHeroStatsCounter();
        } else {
                startCounting();
        }
                observer.unobserve(entry.target);
            }
        }),
        { threshold: 0.4 }
    );

  // Sayaç içeren elementleri gözlemle
  const statsWrappers = document.querySelectorAll('.hero-stats, .stats-wrapper');
  statsWrappers.forEach(wrapper => {
    observer.observe(wrapper);
  });
}

/**
 * Form Doğrulama
 */
function initFormValidation() {
  const FormValidator = {
    form: document.getElementById('contactForm'),
    
    init() {
      if (!this.form) return;
      
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      this.initFormIcons();
      this.initInputValidation();
    },
    
    handleSubmit(e) {
    e.preventDefault();
    
      const formData = new FormData(this.form);
      const formFields = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        message: formData.get('message')
      };
      
      if (this.validateForm(formFields)) {
        this.submitForm(formFields);
      }
    },
    
    validateForm(fields) {
  let isValid = true;
      this.clearErrors();
  
  // Ad Soyad doğrulama
      if (!fields.name?.trim()) {
        this.showError('name', 'Ad Soyad alanı zorunludur');
    isValid = false;
      } else if (fields.name.trim().length < 3) {
        this.showError('name', 'Ad Soyad en az 3 karakter olmalıdır');
    isValid = false;
  }
  
  // Email doğrulama
      if (!fields.email?.trim()) {
        this.showError('email', 'E-posta alanı zorunludur');
    isValid = false;
      } else if (!this.isValidEmail(fields.email)) {
        this.showError('email', 'Geçerli bir e-posta adresi giriniz');
    isValid = false;
  }
  
  // Telefon doğrulama
      if (!fields.phone?.trim()) {
        this.showError('phone', 'Telefon alanı zorunludur');
    isValid = false;
      } else if (!this.isValidPhone(fields.phone)) {
        this.showError('phone', 'Geçerli bir telefon numarası giriniz');
    isValid = false;
  }
  
  // Hizmet seçimi doğrulama
      if (!fields.service) {
        this.showError('service', 'Lütfen bir hizmet seçiniz');
    isValid = false;
  }
  
  // Mesaj doğrulama
      if (!fields.message?.trim()) {
        this.showError('message', 'Mesaj alanı zorunludur');
    isValid = false;
      } else if (fields.message.trim().length < 10) {
        this.showError('message', 'Mesajınız en az 10 karakter olmalıdır');
    isValid = false;
  }
  
  return isValid;
    },
    
    showError(fieldName, message) {
      const input = this.form.querySelector(`[name="${fieldName}"]`);
      const errorElement = input?.parentElement.querySelector('.error-message');
      
      if (input && errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    input.classList.add('is-invalid');
  }
    },
    
    clearErrors() {
      this.form.querySelectorAll('.error-message').forEach(elem => {
    elem.textContent = '';
    elem.style.display = 'none';
  });
  
      this.form.querySelectorAll('.is-invalid').forEach(input => {
    input.classList.remove('is-invalid');
  });
    },
    
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    isValidPhone(phone) {
      return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);
    },
    
    async submitForm(formData) {
      try {
        // SweetAlert2 ile yükleniyor göster
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Mesajınız Gönderiliyor',
      text: 'Lütfen bekleyin...',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
        }
        
        // Form verilerini gönder
        // TODO: API endpoint'i eklenecek
        // const response = await fetch('/api/contact', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(formData)
        // });
        
        // Simüle edilmiş başarılı gönderim
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Formu temizle
        this.form.reset();
        
        // Başarı mesajı göster
        if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Teşekkürler!',
        text: 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.',
        icon: 'success',
        confirmButtonText: 'Tamam'
      });
  } else {
      alert('Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.');
        }
        
        // Event yayınla
        EventBus.publish('formSubmitted', { success: true });
        
      } catch (error) {
        console.error('Form gönderme hatası:', error);
        
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Hata!',
            text: 'Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.',
            icon: 'error',
            confirmButtonText: 'Tamam'
          });
        } else {
          alert('Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.');
        }
        
        // Event yayınla
        EventBus.publish('formSubmitted', { 
          success: false, 
          error: error.message 
        });
      }
    },
    
    initFormIcons() {
      const formControls = this.form.querySelectorAll('.form-control, .form-select');
      
      formControls.forEach(input => {
        ['focus', 'blur'].forEach(eventType => {
          input.addEventListener(eventType, () => {
            const icon = input.parentElement.querySelector('.form-icon');
            if (icon) {
              icon.classList.toggle('active-icon', eventType === 'focus');
            }
          });
        });
      });
    },
    
    initInputValidation() {
      const inputs = this.form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            this.validateField(input);
          }
        });
        
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
      });
    },
    
    validateField(input) {
      const name = input.getAttribute('name');
      const value = input.value.trim();
      
      switch (name) {
        case 'name':
          if (value.length < 3) {
            this.showError(name, 'Ad Soyad en az 3 karakter olmalıdır');
          } else {
            this.clearFieldError(input);
          }
          break;
          
        case 'email':
          if (!this.isValidEmail(value)) {
            this.showError(name, 'Geçerli bir e-posta adresi giriniz');
          } else {
            this.clearFieldError(input);
          }
          break;
          
        case 'phone':
          if (!this.isValidPhone(value)) {
            this.showError(name, 'Geçerli bir telefon numarası giriniz');
          } else {
            this.clearFieldError(input);
          }
          break;
          
        case 'message':
          if (value.length < 10) {
            this.showError(name, 'Mesajınız en az 10 karakter olmalıdır');
          } else {
            this.clearFieldError(input);
          }
          break;
      }
    },
    
    clearFieldError(input) {
      input.classList.remove('is-invalid');
      const errorElement = input.parentElement.querySelector('.error-message');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }
  };
  
  FormValidator.init();
}

/**
 * Harita Özellikleri
 */
function initMapFeatures() {
  const MapManager = {
    regionTags: document.querySelectorAll('.region-tag'),
    mapContainer: document.querySelector('.map-container'),
    pinMarker: document.querySelector('.map-pin-marker'),
    infoContainer: document.querySelector('.location-details'),
    currentRegion: 'Edremit',
    
    init() {
      if (!this.regionTags.length || !this.mapContainer) return;
      
      // Bölge etiketlerine tıklama olayı ekle
      this.regionTags.forEach(tag => {
        if (tag.dataset.region) {
          tag.addEventListener('click', () => {
            this.handleRegionClick(tag);
          });
        }
      });
      
      // İlk bölgeyi aktif et
      if (this.regionTags[0]?.dataset.region) {
        this.handleRegionClick(this.regionTags[0]);
      }
      
      // Map expand button
      this.initExpandButton();
      
      // Tooltips
      this.initTooltips();
    },
    
    handleRegionClick(tag) {
      const region = tag.dataset.region;
      
      // Aktif sınıfını güncelle
      this.regionTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      
      // Pin'i hareket ettir
      this.updatePinPosition(region);
      
      // Bölge bilgilerini güncelle
      this.updateRegionInfo(region);
      
      // Harita animasyonu
      this.animateMap();
      
      // State güncelle
      this.currentRegion = region;
      
      // Event yayınla
      EventBus.publish('regionChanged', { region });
    },
    
    updatePinPosition(region) {
      if (!this.pinMarker) return;
      
      const position = MAP_LOCATIONS[region]?.position || MAP_LOCATIONS['Edremit'].position;
      
      // Pin konumunu güncelle
      this.pinMarker.style.top = position.top;
      this.pinMarker.style.left = position.left;
      
      // Pin animasyonu
      this.pinMarker.classList.add('pin-bounce');
      setTimeout(() => {
        this.pinMarker.classList.remove('pin-bounce');
      }, 1000);
    },
    
    updateRegionInfo(region) {
      if (!this.infoContainer) return;
      
      const info = MAP_LOCATIONS[region] || MAP_LOCATIONS['Edremit'];
      
      this.infoContainer.innerHTML = `
        <div class="location-item">
            <div class="icon-box">
                <i class="fas fa-map-marker"></i>
            </div>
            <div class="location-text">
            <h5>${region}</h5>
            <p>${info.address || ''}</p>
            </div>
        </div>
        <div class="location-item">
            <div class="icon-box">
                <i class="fas fa-building"></i>
            </div>
            <div class="location-text">
                <h5>Hizmet Alanı</h5>
            <p>${info.properties || ''}</p>
            <p>${info.service || ''}</p>
            </div>
        </div>
    `;
    },
    
    animateMap() {
      this.mapContainer.classList.add('animate-map');
      setTimeout(() => {
        this.mapContainer.classList.remove('animate-map');
      }, 500);
    },
    
    initExpandButton() {
      const expandButton = document.querySelector('.map-expand-button');
      
      if (expandButton && typeof bootstrap !== 'undefined') {
        expandButton.addEventListener('click', () => {
          const mapModal = new bootstrap.Modal(document.getElementById('mapModal'));
          if (mapModal) {
            mapModal.show();
          }
        });
      }
    },
    
    initTooltips() {
      if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
      
      this.regionTags.forEach(tag => {
        const region = tag.getAttribute('data-region');
        const tooltipContent = `${region} bölgesi hizmet alanımız`;
        
        new bootstrap.Tooltip(tag, {
          title: tooltipContent,
          placement: 'top',
          trigger: 'hover'
        });
      });
    }
  };
  
  MapManager.init();
}

/**
 * Scroll Olayları 
 */
function initScrollEvents() {
  // Scroll progress bar
  const scrollProgressBar = document.querySelector('.scroll-progress-bar');
  
  if (scrollProgressBar) {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollPosition / scrollHeight) * 100;
      
      scrollProgressBar.style.width = `${scrollProgress}%`;
    });
  }
  
  // Scroll indicator
  const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      scrollIndicator.classList.toggle('visible', scrollPosition > 300);
    });
  }
}

/**
 * Yardımcı Fonksiyonlar
 */
function updateCopyrightYear() {
  const copyrightElement = document.getElementById('copyright-year');
  if (copyrightElement) {
    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    copyrightElement.textContent = startYear === currentYear ? 
      startYear : `${startYear}-${currentYear}`;
  }
}

// Buton dalgalanma efekti
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.btn-outline-light').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--click-x', `${e.clientX - rect.left}px`);
      btn.style.setProperty('--click-y', `${e.clientY - rect.top}px`);
      });
    });
});

/**
 * Tema Sistemi
 */
function initThemeSystem() {
  const ThemeManager = {
    settingsToggle: document.getElementById('settingsToggle'),
    settingsPanel: document.getElementById('settingsPanel'),
    settingsClose: document.getElementById('settingsClose'),
    themeToggle: document.getElementById('themeToggle'),
    contrastToggle: document.getElementById('contrastToggle'),
    fontSizeControls: document.querySelectorAll('.font-size-btn'),
    colorOptions: document.querySelectorAll('.color-option'),
    
    init() {
      if (!this.settingsPanel || !this.settingsToggle) return;
      
      // Panel toggle
      this.settingsToggle.addEventListener('click', this.handlePanelToggle.bind(this));
      
      // Panel kapatma
      this.settingsClose.addEventListener('click', this.handlePanelClose.bind(this));
      
      // Tema değiştirme
      if (this.themeToggle) {
        this.themeToggle.addEventListener('change', this.handleThemeChange.bind(this));
      }
      
      // Kontrast modu
      if (this.contrastToggle) {
        this.contrastToggle.addEventListener('change', this.handleContrastChange.bind(this));
      }
      
      // Font boyutu kontrolleri
      this.fontSizeControls.forEach(btn => {
        btn.addEventListener('click', () => this.handleFontSizeChange(btn));
      });
      
      // Renk seçenekleri
      this.colorOptions.forEach(option => {
        option.addEventListener('click', () => this.handleColorChange(option));
      });
      
      // Dışarı tıklama
      document.addEventListener('click', this.handleOutsideClick.bind(this));
      
      // Kaydedilmiş ayarları yükle
      this.loadSettings();
    },
    
    handlePanelToggle() {
      this.settingsPanel.classList.toggle('active');
      this.settingsToggle.classList.toggle('active');
    },
    
    handlePanelClose() {
      this.settingsPanel.classList.remove('active');
      this.settingsToggle.classList.remove('active');
    },
    
    handleThemeChange() {
      document.body.classList.toggle('dark-mode');
      this.saveSettings('theme', this.themeToggle.checked ? 'dark' : 'light');
      
      // Event yayınla
      EventBus.publish('themeChanged', { 
        isDark: this.themeToggle.checked 
      });
    },
    
    handleContrastChange() {
      document.body.classList.toggle('high-contrast');
      this.saveSettings('contrast', this.contrastToggle.checked);
      
      // Event yayınla
      EventBus.publish('contrastChanged', { 
        isHighContrast: this.contrastToggle.checked 
      });
    },
    
    handleFontSizeChange(btn) {
      const currentSize = parseInt(document.documentElement.style.fontSize) || 100;
      const isIncrease = btn.id === 'increaseFontSize';
      const newSize = isIncrease ? currentSize + 10 : currentSize - 10;
      
      if (newSize >= 70 && newSize <= 130) {
        document.documentElement.style.fontSize = newSize + '%';
        document.getElementById('currentFontSize').textContent = newSize + '%';
        this.saveSettings('fontSize', newSize);
        
        // Event yayınla
        EventBus.publish('fontSizeChanged', { size: newSize });
      }
    },
    
    handleColorChange(option) {
      const color = option.getAttribute('data-color');
      const theme = option.getAttribute('data-theme');
      
      document.documentElement.style.setProperty('--primary-color', color);
      this.colorOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      this.saveSettings('themeColor', { color, theme });
      
      // Event yayınla
      EventBus.publish('colorChanged', { color, theme });
    },
    
    handleOutsideClick(e) {
      if (!this.settingsPanel.contains(e.target) && 
          !this.settingsToggle.contains(e.target)) {
        this.settingsPanel.classList.remove('active');
        this.settingsToggle.classList.remove('active');
      }
    },
    
    saveSettings(key, value) {
      const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
      settings[key] = value;
      localStorage.setItem('siteSettings', JSON.stringify(settings));
    },
    
    loadSettings() {
      const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
      
      // Tema
      if (settings.theme) {
        document.body.classList.toggle('dark-mode', settings.theme === 'dark');
        this.themeToggle.checked = settings.theme === 'dark';
      }
      
      // Kontrast
      if (settings.contrast !== undefined) {
        document.body.classList.toggle('high-contrast', settings.contrast);
        this.contrastToggle.checked = settings.contrast;
      }
      
      // Font boyutu
      if (settings.fontSize) {
        document.documentElement.style.fontSize = settings.fontSize + '%';
        document.getElementById('currentFontSize').textContent = settings.fontSize + '%';
      }
      
      // Tema rengi
      if (settings.themeColor) {
        document.documentElement.style.setProperty('--primary-color', settings.themeColor.color);
        this.colorOptions.forEach(opt => {
          if (opt.getAttribute('data-theme') === settings.themeColor.theme) {
            opt.classList.add('active');
          }
        });
      }
      
      // Event yayınla
      EventBus.publish('settingsLoaded', settings);
    }
  };
  
  ThemeManager.init();
}

/**
 * Mobil Menü Sistemleri
 */
function initMobileMenu() {
  const navbar = document.querySelector('.navbar');
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  
  // Arka plan karartma elementi (screen-darken)
  let overlay = document.querySelector('.screen-darken');
  
  // Overlay yoksa oluştur
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'screen-darken';
    document.body.appendChild(overlay);
  }
  
  if (!navbar || !navbarToggler || !navbarCollapse) return;
  
  // Menü açma/kapama
  navbarToggler.addEventListener('click', () => {
    const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true';
    navbarToggler.setAttribute('aria-expanded', !isExpanded);
    
    if (!isExpanded) {
      // Menüyü açarken
      navbarCollapse.classList.add('show');
      document.body.classList.add('overflow-hidden');
      overlay.classList.add('active');
      
      // Force reflow ve animasyon için timeout
      void navbarCollapse.offsetWidth;
      navbarCollapse.style.right = '0';
    } else {
      // Menüyü kapatırken
      navbarCollapse.style.right = '-100%';
      overlay.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
      
      // Animasyon tamamlandıktan sonra show sınıfını kaldır
      setTimeout(() => {
        navbarCollapse.classList.remove('show');
      }, 300);
    }
  });
  
  // Overlay'e tıklandığında menüyü kapat
  overlay.addEventListener('click', () => {
    navbarToggler.setAttribute('aria-expanded', 'false');
    navbarCollapse.style.right = '-100%';
    overlay.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
    
    // Animasyon tamamlandıktan sonra show sınıfını kaldır
    setTimeout(() => {
      navbarCollapse.classList.remove('show');
    }, 300);
  });
  
  // Menü öğelerine tıklandığında menüyü kapat
  document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .header-button').forEach(link => {
    link.addEventListener('click', () => {
      navbarToggler.setAttribute('aria-expanded', 'false');
      navbarCollapse.style.right = '-100%';
      overlay.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
      
      // Animasyon tamamlandıktan sonra show sınıfını kaldır
      setTimeout(() => {
        navbarCollapse.classList.remove('show');
      }, 300);
    });
  });
  
  // Sayfa kaydırıldığında hamburger butonunun ve header'ın görünümünü ayarla
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.patreon-header');
    if (header && window.scrollY > 50) {
      navbarToggler.style.background = 'rgba(255, 255, 255, 0.1)';
    } else {
      navbarToggler.style.background = 'rgba(0, 0, 0, 0.2)';
    }
  });
  
  // Ekran boyutu değiştiğinde kontrol
  window.addEventListener('resize', () => {
    if (window.innerWidth >= CONFIG.breakpoints.lg) {
      navbarToggler.setAttribute('aria-expanded', 'false');
      navbarCollapse.classList.remove('show');
      navbarCollapse.style.right = '';
      overlay.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
    }
  });
}

// İnitialize
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
});
