/**
 * Gürel Yönetim - Ana JavaScript Dosyası
 * Version: 3.0.0
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

// İnitializasyon durumlarını izleyen değişkenler
const INIT_STATUS = {
  appInitialized: false
};

// Debounce fonksiyonu tanımı
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Tekli bir DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded event tetiklendi - app.js");
  
  // Tüm başlatma işlemleri burada merkezi olarak yapılır
  initializeApplication();
});

/**
 * Uygulama başlatma ana fonksiyonu
 * Tüm bileşenleri doğru sırayla başlatır
 */
function initializeApplication() {
  // Yükleme ekranını kaldırmayı dene
  try {
    removeLoader();
  } catch (error) {
    console.error("Yükleme ekranı kaldırılırken hata:", error);
  }
  
  // Sırayla başlatma işlemleri
  initApp();
  
  // Başlatma tamamlandı
  INIT_STATUS.appInitialized = true;
  console.log("Uygulama başlatma tamamlandı");
}

/**
 * Yükleme ekranını kaldırmak için ayrı fonksiyon
 */
function removeLoader() {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.zIndex = '-1';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 300);
  }
}

// Sayfa yüklenme olayı - şimdi daha kontrollü
window.addEventListener('load', () => {
  removeLoader();
});

// 5 saniye sonra loader'ı kaldır (uzun süren yüklemelerde)
setTimeout(removeLoader, 5000);

// Uygulama State Yönetimi - Singleton Pattern
const AppState = (() => {
  // Private state
  const state = {
    isMenuOpen: false,
    currentSection: '',
    isHeaderScrolled: false,
    activeRegion: 'Edremit',
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    currentLanguage: localStorage.getItem('selectedLanguage') || 'tr',
    // MAP_LOCATIONS entegrasyonu
    mapLocations: {
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
    }
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
   * İyileştirilmiş mobil kontrol fonksiyonu
   */
  isMobile() {
    // İlk çağrıda hesaplanır ve saklanır (memoization)
    if (this._isMobileResult === undefined) {
      this._isMobileResult = window.innerWidth < CONFIG.breakpoints.lg;
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
  },
  
  /**
   * Genelleştirilmiş IntersectionObserver yardımcı fonksiyonu
   * Birçok yerde tekrarlanan kodu tek bir yerden yönetir
   */
  createObserver(elements, callback, options = {}) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          if (options.unobserve) observer.unobserve(entry.target);
        }
      });
    }, options);
    
    elements.forEach(el => observer.observe(el));
    return observer;
  }
};

// Window resize olayında mobil durum önbelleğini sıfırla
window.addEventListener('resize', Utils.resetMobileCache.bind(Utils));

/**
 * Uygulama Başlatma Fonksiyonu - Sadeleştirilmiş
 */
function initApp() {
  console.log("initApp fonksiyonu çağrıldı");
  
  // Ana init fonksiyonları
  initHeaderSystem();
  initTabSystem();
  initModernHero();
  initParallaxEffects();
  initTiltEffects();
  initCounters();
  initMapFeatures();
  initScrollEvents();
  updateCopyrightYear();
  initMobileMenu();
  initTeamAnimations(); 
  initAddressChecker();
  initLazyLoading();
  initServiceAnimations();
  initThemeSupport(); // Yeni tema sistemini entegre et

  // AOS Kütüphanesi init
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: CONFIG.animation.duration,
      easing: CONFIG.animation.easing,
      once: CONFIG.animation.once,
      mirror: CONFIG.animation.mirror,
      offset: CONFIG.animation.offset
    });
  }
  
  // jQuery efektlerini başlat
  initJQueryEffects();
}

/**
 * jQuery ile hizmet kartları için tilt efekti
 */
function initJQueryEffects() {
  // jQuery hazır olduğunda çalıştır
  if (typeof $ !== 'undefined' && typeof $.fn.tilt !== 'undefined') {
    $('.service-card.tilt').tilt({
      glare: true,
      maxGlare: 0.3,
      maxTilt: 10,
      perspective: 1000
    });
  }
}

/**
 * Header Sistemleri
 */
function initHeaderSystem() {
  const header = document.querySelector('#header');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (header) {
    // Header scroll olayları
    window.addEventListener('scroll', Utils.throttle(() => {
      const scrollY = window.scrollY;
      
      // Header scroll durumunu güncelle
      if (scrollY > CONFIG.scroll.threshold && !AppState.get('isHeaderScrolled')) {
        AppState.set('isHeaderScrolled', true);
        header.classList.add('header-scrolled');
      } else if (scrollY <= CONFIG.scroll.threshold && AppState.get('isHeaderScrolled')) {
        AppState.set('isHeaderScrolled', false);
        header.classList.remove('header-scrolled');
      }
    }, 150));
    
    // Mobil menüyü kapat (link tıklandığında)
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (Utils.isMobile() && AppState.get('isMenuOpen')) {
          const mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
          if (mobileMenuToggle) mobileMenuToggle.click();
        }
      });
    });
  }
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
  const tabContainers = document.querySelectorAll('.tab-container');
  
  if (tabContainers.length > 0) {
    tabContainers.forEach(container => {
      const tabs = container.querySelectorAll('.tab');
      const tabContents = container.querySelectorAll('.tab-content');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetId = tab.getAttribute('data-tab');
          
          // Aktif tab'ı güncelle
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          // İçerikleri güncelle
          tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.getAttribute('id') === targetId) {
              content.classList.add('active');
            }
        });
      });
      });
    });
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
  const serviceItems = document.querySelectorAll('.service-item');
  
  if (serviceItems.length > 0) {
    // IntersectionObserver ile animasyon
    Utils.createObserver(serviceItems, (item) => {
      item.classList.add('animated');
    }, { threshold: 0.2 });
    
    // Hover efektleri
    serviceItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.classList.add('hovered');
      });
      
      item.addEventListener('mouseleave', () => {
        item.classList.remove('hovered');
    });
  });
  }
}

/**
 * Modern Hero Özellikleri
 */
function initModernHero() {
  const heroSection = document.querySelector('.hero-section');
  
  if (heroSection) {
    // Yükleme sonrası animasyon
    setTimeout(() => {
      heroSection.classList.add('loaded');
    }, 500);
    
    // Parallax efektleri
    if (!Utils.isMobile()) {
      const heroContent = heroSection.querySelector('.hero-content');
      const heroImage = heroSection.querySelector('.hero-image');
      
      window.addEventListener('mousemove', Utils.throttle((e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        if (heroContent) {
          heroContent.style.transform = `translate(${mouseX * 20 - 10}px, ${mouseY * 20 - 10}px)`;
        }
        
        if (heroImage) {
          heroImage.style.transform = `translate(${mouseX * -20 + 10}px, ${mouseY * -20 + 10}px)`;
        }
      }, 50));
    }
  }
}

/**
 * Paralaks Efektleri
 */
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  if (parallaxElements.length > 0 && !Utils.isMobile()) {
    window.addEventListener('scroll', Utils.throttle(() => {
      parallaxElements.forEach(element => {
        const scrolled = window.scrollY;
        const speed = parseFloat(element.getAttribute('data-speed') || '0.5');
        const direction = element.getAttribute('data-direction') || 'up';
        const offset = element.offsetTop;
        
        let translateY;
        
        if (direction === 'up') {
          translateY = (scrolled - offset) * speed;
        } else {
          translateY = (scrolled - offset) * -speed;
        }
        
        // Uygulamadan önce görünürlüğü kontrol et
        if (Utils.isInViewport(element, 300)) {
          element.style.transform = `translate3d(0, ${translateY}px, 0)`;
        }
      });
    }, 50));
  }
}

/**
 * Tilt Efektleri
 */
function initTiltEffects() {
  const tiltElements = document.querySelectorAll('.tilt-effect');
  
  if (tiltElements.length > 0 && !Utils.isMobile()) {
    tiltElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX * 10;
        const deltaY = (y - centerY) / centerY * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${-deltaY}deg) rotateY(${deltaX}deg)`;
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        element.style.transition = 'transform 0.5s ease';
      });
      
      element.addEventListener('mouseenter', () => {
        element.style.transition = 'transform 0.1s ease';
      });
    });
  }
}

/**
 * Sayaç Animasyonları
 */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  
  if (counters.length > 0) {
    // IntersectionObserver kullanarak optimize et
    Utils.createObserver(counters, (counter) => {
      // Hedef değeri al
      const target = parseInt(counter.getAttribute('data-count'), 10);
      const duration = parseInt(counter.getAttribute('data-duration') || '2000', 10);
                let current = 0;
                
      // Başlangıç değerini ayarla
      counter.textContent = '0';
      
      // Sayaç animasyonu
      const step = (timestamp) => {
        if (!counter.startTime) counter.startTime = timestamp;
        const progress = timestamp - counter.startTime;
        
        // Yüzde hesapla
        const percent = Math.min(progress / duration, 1);
        current = Math.floor(percent * target);
        counter.textContent = current.toLocaleString();
        
        // Animasyonu devam ettir
        if (percent < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      // Animasyonu başlat
      window.requestAnimationFrame(step);
    }, { threshold: 0.1 });
  }
}

/**
 * Form Doğrulama Yardımcı Nesnesi
 * Tüm form işlemleri için merkezi bir yer
 */
const FormValidator = {
  // Form doğrulama yardımcı fonksiyonları
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  isValidPhone(phone) {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);
  },
  
  // Form alanı hata gösterimi
  showError(input, message) {
    if (!input) return;
    
    input.classList.add('is-invalid');
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  },
  
  // Hata mesajını temizleme
  clearError(input) {
    if (!input) return;
    
    input.classList.remove('is-invalid');
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  },
  
  // Tüm form hatalarını temizleme
  clearAllErrors(form) {
    if (!form) return;
    
    form.querySelectorAll('.error-message').forEach(elem => {
      elem.textContent = '';
      elem.style.display = 'none';
    });
    
    form.querySelectorAll('.is-invalid').forEach(input => {
      input.classList.remove('is-invalid');
    });
  },
  
  // Form alanını doğrulama
  validateField(input) {
    if (!input) return true;
    
    const name = input.getAttribute('name');
    const value = input.value.trim();
    let isValid = true;
    
    switch (name) {
      case 'name':
        if (!value) {
          this.showError(input, 'Ad Soyad alanı zorunludur');
          isValid = false;
        } else if (value.length < 3) {
          this.showError(input, 'Ad Soyad en az 3 karakter olmalıdır');
          isValid = false;
        } else {
          this.clearError(input);
        }
        break;
        
      case 'email':
        if (!value) {
          this.showError(input, 'E-posta alanı zorunludur');
    isValid = false;
        } else if (!this.isValidEmail(value)) {
          this.showError(input, 'Geçerli bir e-posta adresi giriniz');
    isValid = false;
        } else {
          this.clearError(input);
        }
        break;
        
      case 'phone':
        if (!value) {
          this.showError(input, 'Telefon alanı zorunludur');
    isValid = false;
        } else if (!this.isValidPhone(value)) {
          this.showError(input, 'Geçerli bir telefon numarası giriniz');
    isValid = false;
        } else {
          this.clearError(input);
        }
        break;
        
      case 'message':
        if (!value) {
          this.showError(input, 'Mesaj alanı zorunludur');
    isValid = false;
        } else if (value.length < 10) {
          this.showError(input, 'Mesajınız en az 10 karakter olmalıdır');
    isValid = false;
        } else {
          this.clearError(input);
        }
        break;
        
      case 'service':
        if (!value) {
          this.showError(input, 'Lütfen bir hizmet seçiniz');
    isValid = false;
        } else {
          this.clearError(input);
        }
        break;
        
      case 'consent':
        if (input.type === 'checkbox' && !input.checked) {
          this.showError(input, 'Bu alanı işaretlemelisiniz');
    isValid = false;
        } else {
          this.clearError(input);
        }
        break;
        
      default:
        // Diğer alan tipleri için varsayılan doğrulama
        if (input.hasAttribute('required') && !value) {
          this.showError(input, 'Bu alan zorunludur');
    isValid = false;
        } else {
          this.clearError(input);
        }
  }
  
  return isValid;
    },
    
  // Formun tamamını doğrulama
  validateForm(form) {
    if (!form) return false;
    
    let isValid = true;
    this.clearAllErrors(form);
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  },
  
  // Form gönderimi
  async submitForm(form, options = {}) {
    if (!form) return false;
    
    try {
      // Form verilerini topla
      const formData = new FormData(form);
      const formDataObj = {};
      
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      // Yükleniyor göster
  if (typeof Swal !== 'undefined') {
    Swal.fire({
          title: options.loadingTitle || 'İşleminiz Gerçekleştiriliyor',
          text: options.loadingText || 'Lütfen bekleyin...',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
        }
        
      // API endpoint'i ile iletişim
      if (options.apiEndpoint) {
        // Gerçek form gönderimi
        const response = await fetch(options.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formDataObj)
        });
        
        if (!response.ok) {
          throw new Error('Form gönderimi başarısız oldu');
        }
      } else {
        // Simülasyon modu - gerçek API yoksa
        await new Promise(resolve => setTimeout(resolve, options.simulationTime || 1500));
      }
        
        // Formu temizle
      form.reset();
        
        // Başarı mesajı göster
        if (typeof Swal !== 'undefined') {
      Swal.fire({
          title: options.successTitle || 'Teşekkürler!',
          text: options.successText || 'İşleminiz başarıyla tamamlandı.',
        icon: 'success',
          confirmButtonText: options.confirmButtonText || 'Tamam'
      });
  } else {
        alert(options.successText || 'İşleminiz başarıyla tamamlandı.');
      }
      
      // Başarı callback'ini çağır
      if (typeof options.onSuccess === 'function') {
        options.onSuccess(formDataObj);
        }
        
        // Event yayınla
      EventBus.publish('formSubmitted', { 
        success: true,
        formId: form.id,
        data: formDataObj
      });
      
      return true;
      } catch (error) {
        console.error('Form gönderme hatası:', error);
        
      // Hata mesajı göster
        if (typeof Swal !== 'undefined') {
          Swal.fire({
          title: options.errorTitle || 'Hata!',
          text: options.errorText || 'İşleminiz gerçekleştirilemedi. Lütfen daha sonra tekrar deneyin.',
            icon: 'error',
          confirmButtonText: options.confirmButtonText || 'Tamam'
          });
        } else {
        alert(options.errorText || 'İşleminiz gerçekleştirilemedi. Lütfen daha sonra tekrar deneyin.');
      }
      
      // Hata callback'ini çağır
      if (typeof options.onError === 'function') {
        options.onError(error);
        }
        
        // Event yayınla
        EventBus.publish('formSubmitted', { 
          success: false, 
        formId: form.id,
          error: error.message 
        });
      
      return false;
    }
  },
  
  // Form input olaylarını başlatma
  initFormInputs(form) {
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
      // Input değiştiğinde doğrulama
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            this.validateField(input);
          }
        });
        
      // Focus kaybolduğunda doğrulama
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
      
      // Focus stilleri
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('input-focused');
        const icon = input.parentElement.querySelector('.form-icon');
        if (icon) {
          icon.classList.add('active-icon');
        }
      });
      
      input.addEventListener('blur', () => {
        if (input.value === '') {
          input.parentElement.classList.remove('input-focused');
        }
        const icon = input.parentElement.querySelector('.form-icon');
        if (icon) {
          icon.classList.remove('active-icon');
        }
      });
      
      // Başlangıçta değer varsa stil ekle
      if (input.value !== '') {
        input.parentElement.classList.add('input-focused');
      }
    });
  }
};

/**
 * Harita Özellikleri
 */
function initMapFeatures() {
  // Google Maps entegrasyonu için
  const mapElement = document.getElementById('gmap');
  const regionButtons = document.querySelectorAll('.region-button');
  
  if (mapElement && typeof google !== 'undefined') {
    // AppState'teki mapLocations'i kullan
    const defaultLocation = AppState.get('mapLocations')[AppState.get('activeRegion')];
    
    // Harita özelliklerini konfigüre et
    const mapOptions = {
      zoom: defaultLocation.zoom || CONFIG.map.zoom,
      center: new google.maps.LatLng(
        defaultLocation.lat || CONFIG.map.center.lat,
        defaultLocation.lng || CONFIG.map.center.lng
      ),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false,
      styles: [
        // Harita stilleri burada olacak
      ]
    };
    
    // Haritayı oluştur
    const map = new google.maps.Map(mapElement, mapOptions);
    
    // Tüm konumlar için marker ekle
    const markers = {};
    
    Object.entries(AppState.get('mapLocations')).forEach(([region, location]) => {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.lat, location.lng),
        map,
        title: region,
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'assets/img/map-marker.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      });
      
      // Click olayını ekle
      marker.addListener('click', () => {
        // İlgili bölgeye git (varsa)
        const regionButton = document.querySelector(`.region-button[data-region="${region}"]`);
        if (regionButton) {
          regionButton.click();
        }
      });
      
      markers[region] = marker;
    });
    
    // Bölge butonları için click olayı
    if (regionButtons.length > 0) {
      regionButtons.forEach(button => {
        button.addEventListener('click', () => {
          const region = button.getAttribute('data-region');
          if (!region) return;
          
          // Active sınıfını değiştir
          regionButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // AppState'i güncelle
          AppState.set('activeRegion', region);
          
          // Haritayı yeni konuma kaydır
          const location = AppState.get('mapLocations')[region];
          
          if (location) {
            map.panTo(new google.maps.LatLng(location.lat, location.lng));
            map.setZoom(location.zoom || CONFIG.map.zoom);
            
            // Markeri vurgula
            Object.values(markers).forEach(m => {
              m.setAnimation(null);
            });
            
            if (markers[region]) {
              markers[region].setAnimation(google.maps.Animation.BOUNCE);
              setTimeout(() => markers[region].setAnimation(null), 1500);
            }
          }
        });
      });
    }
    
    // Pencere boyutu değiştiğinde haritayı yeniden boyutlandır
    window.addEventListener('resize', () => {
      const center = map.getCenter();
      google.maps.event.trigger(map, 'resize');
      map.setCenter(center);
    });
  }
}

/**
 * Scroll Olayları 
 */
function initScrollEvents() {
  const sections = document.querySelectorAll('section[id]');
  const scrollTopBtn = document.querySelector('.scroll-top');
  
  if (sections.length > 0) {
    // IntersectionObserver ile etkin bölüm takibi
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Ekran içindeki bölümü tespit et
        if (entry.isIntersecting) {
          // Mevcut bölümü güncelle
          const currentSection = entry.target.getAttribute('id');
          AppState.set('currentSection', currentSection);
          
          // İlgili nav linkini aktif et
          document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
            if (navLink.getAttribute('href') === `#${currentSection}`) {
              navLink.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.3 });
    
    // Her bölümü gözlemle
    sections.forEach(section => sectionObserver.observe(section));
  }
  
  // Yukarı kaydır butonu
  if (scrollTopBtn) {
    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.scrollY > window.innerHeight / 2) {
        scrollTopBtn.classList.add('active');
      } else {
        scrollTopBtn.classList.remove('active');
      }
    }, 200));
    
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Yardımcı Fonksiyonlar
 */
function updateCopyrightYear() {
  const copyrightElements = document.querySelectorAll('.copyright-year');
    const currentYear = new Date().getFullYear();
  
  copyrightElements.forEach(element => {
    element.textContent = currentYear.toString();
  });
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
 * Tema Sistemi Entegrasyonu
 */
function initThemeSupport() {
  console.log('Tema sistemi theme-system/theme-manager.js ile entegre ediliyor...');
  
  // ES6 modülleri ve geleneksel script dosyaları arasında uyum sağla
  document.addEventListener('themeSystemInitialized', function(e) {
    console.log('Tema sistemi başarıyla başlatıldı.');
    
    // Tema değişikliklerini EventBus aracılığıyla yayınla
    if (window.themeManager) {
      window.themeManager.on('themeChanged', (settings) => {
        EventBus.publish('themeChanged', { 
          isDarkMode: settings.theme === 'dark',
          theme: settings.theme,
          colorTheme: settings.colorTheme
        });
      });
      
      // Sistem tema değişikliklerini izle
      window.themeManager.on('systemThemeChanged', (data) => {
        console.log('Sistem teması değişti:', data);
      });
    }
  });
  
  // Tema sistemi zaten yüklenmişse
  if (window.themeSystem || window.themeManager) {
    console.log('Tema sistemi zaten yüklenmiş.');
    
    // Tema değişikliklerini EventBus aracılığıyla yayınla
    if (window.themeManager) {
      window.themeManager.on('themeChanged', (settings) => {
        EventBus.publish('themeChanged', { 
          isDarkMode: settings.theme === 'dark',
          theme: settings.theme,
          colorTheme: settings.colorTheme
        });
      });
    }
  }
  
  // Yeni tema sistemi entegrasyonu
  if (typeof window.ThemeUtils !== 'undefined') {
    console.log('ThemeUtils başarıyla entegre edildi');
    
    // Yardımcı fonksiyonları EventBus ile entegre et
    if (window.ThemeUtils.dispatchCustomEvent) {
      window.ThemeUtils.dispatchCustomEvent('appThemeInitialized');
    }
  }
}

/**
 * Mobil Menü Sistemleri
 */
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-nav');
  const backdrop = document.querySelector('.mobile-backdrop');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      // Menü durumunu değiştir
      const isOpen = AppState.get('isMenuOpen');
      AppState.set('isMenuOpen', !isOpen);
      
      // DOM üzerinde değişiklikleri yap
      Utils.batchDOMUpdates(() => {
        if (!isOpen) {
          // Menüyü aç
          document.body.classList.add('mobile-nav-active');
          mobileMenuToggle.classList.add('active');
          if (backdrop) backdrop.style.display = 'block';
          
          // Menüyü göster (animasyon ile)
          setTimeout(() => {
            mobileMenu.style.transform = 'translateX(0)';
            if (backdrop) backdrop.style.opacity = '1';
          }, 50);
    } else {
          // Menüyü kapat
          mobileMenuToggle.classList.remove('active');
          mobileMenu.style.transform = 'translateX(-100%)';
          if (backdrop) backdrop.style.opacity = '0';
          
          // Temizleme ve gizleme
      setTimeout(() => {
            document.body.classList.remove('mobile-nav-active');
            if (backdrop) backdrop.style.display = 'none';
      }, 300);
    }
  });
    });
    
    // Backdrop tıklama olayı
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        if (AppState.get('isMenuOpen')) {
          mobileMenuToggle.click();
        }
      });
    }
    
    // Escape tuşu ile menü kapatma
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.get('isMenuOpen')) {
        mobileMenuToggle.click();
      }
    });
  }
}

// İnitialize
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
});

// Tab geçişini animasyonlu hale getirme
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.service-category-tabs .nav-link');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            // Aktif tab'ın altındaki çizginin animasyonu için
            let indicatorPosition = e.target.offsetLeft;
            let indicatorWidth = e.target.offsetWidth;
            
            // İstersek JavaScript ile de animasyon ekleyebiliriz
            // Ancak CSS :before ile zaten hallediliyor
        });
    });
    
    // Sayfa yüklendiğinde aktif tab'a animasyon uygula
    const activeTab = document.querySelector('.service-category-tabs .nav-link.active');
    if (activeTab) {
        // İlk animasyonu tetikle
        activeTab.classList.add('animated');
        setTimeout(() => {
            activeTab.classList.remove('animated');
        }, 300);
    }
});

// Tab ilüstrasyon animasyonları
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.service-category-tabs .nav-link');
    
    tabs.forEach(tab => {
        tab.addEventListener('mouseenter', function() {
            const illustration = this.querySelector('.tab-illustration');
            if (illustration) {
                illustration.style.transform = 'translateY(-50%) rotate(10deg) scale(1.2)';
                setTimeout(() => {
                    illustration.style.transform = 'translateY(-50%) scale(1.1)';
                }, 200);
            }
        });
    });
});

// Hizmet kartları mikro animasyonları
document.addEventListener('DOMContentLoaded', function() {
    // Tüm hizmet kutularını seç
    const serviceBoxes = document.querySelectorAll('.service-box');
    
    serviceBoxes.forEach(box => {
        // 3D perspektif efekti için mouseMove olayı
        box.addEventListener('mousemove', function(e) {
            const boxRect = box.getBoundingClientRect();
            const boxCenterX = boxRect.left + boxRect.width / 2;
            const boxCenterY = boxRect.top + boxRect.height / 2;
            
            // Fare pozisyonunu hesapla (-20 ile 20 arası)
            const mouseX = (e.clientX - boxCenterX) / (boxRect.width / 2) * 5;
            const mouseY = (e.clientY - boxCenterY) / (boxRect.height / 2) * 5;
            
            // 3D dönüşüm uygula
            box.style.transform = `translateY(-10px) rotateX(${-mouseY}deg) rotateY(${mouseX}deg)`;
            
            // İkon ve diğer elementlere özel efektler
            const icon = box.querySelector('.service-box-icon');
            if (icon) {
                icon.style.transform = `translateZ(25px) scale(1.15) translateX(${mouseX * 0.5}px) translateY(${mouseY * 0.5}px)`;
            }
            
            const title = box.querySelector('.service-box-title');
            if (title) {
                title.style.transform = `translateY(-5px) translateX(${mouseX * 0.2}px)`;
            }
            
            const logo = box.querySelector('.service-box-logo');
            if (logo) {
                logo.style.transform = `translateZ(15px) translateX(${-mouseX * 0.3}px) translateY(${-mouseY * 0.3}px)`;
            }
            
            // Özel ikon animasyonları
            const iconElement = box.querySelector('.service-box-icon i');
            if (iconElement) {
                // Hesap makinesi ikonu için animasyon (muhasebe için)
                if (iconElement.classList.contains('fa-calculator')) {
                    iconElement.classList.add('animate-calculator');
                }
                // Süpürge ikonu için animasyon (temizlik için)
                else if (iconElement.classList.contains('fa-broom')) {
                    iconElement.classList.add('animate-sweep');
                }
                // Diğer ikonlar için...
            }
        });
        
        // Mouse çıkınca default pozisyona dön
        box.addEventListener('mouseleave', function() {
            box.style.transform = 'translateY(-10px) rotateX(2deg) rotateY(2deg)';
            
            const icon = box.querySelector('.service-box-icon');
            if (icon) {
                icon.style.transform = 'scale(1.15) translateZ(25px) rotate(10deg)';
            }
            
            const title = box.querySelector('.service-box-title');
            if (title) {
                title.style.transform = 'translateY(-5px)';
            }
            
            const logo = box.querySelector('.service-box-logo');
            if (logo) {
                logo.style.transform = 'translateZ(15px)';
            }
            
            // Ikon animasyonlarını durdur
            const iconElement = box.querySelector('.service-box-icon i');
            if (iconElement) {
                iconElement.classList.remove('animate-calculator', 'animate-sweep');
            }
        });
        
        // Işık efektini tetikle
        box.addEventListener('mouseenter', function() {
            setTimeout(() => {
                // Işık efekti animasyonunu yeniden çalıştır
                box.classList.add('light-effect-animation');
                setTimeout(() => {
                    box.classList.remove('light-effect-animation');
                }, 1000);
            }, 100);
        });

        // Tıklama geri bildirimleri
        box.addEventListener('click', function(e) {
            // Tıklama dalgası (ripple) efekti oluştur
            const ripple = document.createElement('div');
            ripple.classList.add('click-ripple');
            
            // Tıklama pozisyonunu ayarla
            const rect = box.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Tıklama dalgasını ekle
            box.appendChild(ripple);
            
            // Hafif titreşim efekti
            box.classList.add('pulse-effect');
            
            // Efektleri temizle
            setTimeout(() => {
                ripple.remove();
                box.classList.remove('pulse-effect');
            }, 600);
        });

        // Detay açılır panel işlevselliği
        const detailsBtn = box.querySelector('.service-box-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', function(e) {
                // Tam sayfa yönlendirmesi yerine dropdown açılması için olay engelleme
                const isDetailsToggle = this.classList.contains('details-toggle');
                if (isDetailsToggle) {
                    e.preventDefault();
                    
                    // Paneli aç/kapat
                    const panel = box.querySelector('.service-details-panel');
                    if (panel) {
                        const isOpen = panel.classList.contains('open');
                        
                        if (isOpen) {
                            panel.classList.remove('open');
                            panel.style.maxHeight = '0';
                            this.innerHTML = 'Detaylı Bilgi <i class="fas fa-arrow-right"></i>';
                        } else {
                            panel.classList.add('open');
                            panel.style.maxHeight = panel.scrollHeight + 'px';
                            this.innerHTML = 'Kapat <i class="fas fa-arrow-up"></i>';
                        }
                    }
                }
            });
        }
    });

    // Scroll animasyonları - IntersectionObserver ile
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Elementin görünürlüğünü kontrol et
            if (entry.isIntersecting) {
                // Görünür olan elementlere animasyon sınıfı ekle
                entry.target.classList.add('scrolled-in');
                
                // Göründükten sonra gözlemlemeyi durdur
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null, // viewport baz alınır
        threshold: 0.15, // elementin %15'i göründüğünde tetiklenir
        rootMargin: '0px 0px -50px 0px' // viewport alt kısmına yaklaştığında tetiklenecek
    });

    // Tüm servis kartlarını gözlemle
    serviceBoxes.forEach(box => {
        scrollObserver.observe(box);
    });
});

// Tematik Renk Kodlaması - Her hizmet türü için ayrı renk
document.addEventListener('DOMContentLoaded', function() {
    // Hizmet türleri için renk kodları
    const serviceColors = {
        'muhasebe': {
            primary: '#0052cc',
            secondary: 'rgba(0, 82, 204, 0.15)'
        },
        'temizlik': {
            primary: '#2196F3',
            secondary: 'rgba(33, 150, 243, 0.15)'
        },
        'hukuk': {
            primary: '#673AB7',
            secondary: 'rgba(103, 58, 183, 0.15)'
        },
        'bakım': {
            primary: '#4CAF50',
            secondary: 'rgba(76, 175, 80, 0.15)'
        },
        'bahçe': {
            primary: '#8BC34A',
            secondary: 'rgba(139, 195, 74, 0.15)'
        },
        'güvenlik': {
            primary: '#F44336',
            secondary: 'rgba(244, 67, 54, 0.15)'
        },
        'kalorifer': {
            primary: '#FF9800',
            secondary: 'rgba(255, 152, 0, 0.15)'
        },
        'havuz': {
            primary: '#00BCD4',
            secondary: 'rgba(0, 188, 212, 0.15)'
        }
    };

    // Hizmet kartlarına tematik renkler uygula
    const serviceBoxes = document.querySelectorAll('.service-box');
    
    serviceBoxes.forEach(box => {
        // Hizmet kategorisini belirle
        const title = box.querySelector('.service-box-title');
        if (!title) return;
        
        const titleText = title.textContent.toLowerCase();
        let serviceType = null;
        
        // Başlık içinde hizmet türünü ara
        Object.keys(serviceColors).forEach(type => {
            if (titleText.includes(type)) {
                serviceType = type;
            }
        });
        
        // Eğer eşleşen hizmet türü bulunduysa renkleri uygula
        if (serviceType && serviceColors[serviceType]) {
            const colors = serviceColors[serviceType];
            
            // Renk varyasyonlarını uygula
            const icon = box.querySelector('.service-box-icon');
            if (icon) {
                icon.style.color = colors.primary;
                icon.style.backgroundColor = colors.secondary;
            }
            
            // Buton rengini ayarla
            const btn = box.querySelector('.service-box-btn');
            if (btn) {
                btn.style.background = `linear-gradient(120deg, ${colors.primary}, ${colors.primary}CC)`;
            }
            
            // Rozet rengini ayarla
            const badges = box.querySelectorAll('.service-badge');
            if (badges.length) {
                badges.forEach(badge => {
                    if (!badge.classList.contains('alt')) {
                        badge.style.backgroundColor = colors.secondary;
                        badge.style.color = colors.primary;
                    }
                });
            }
            
            // Feature ikonlarının rengini ayarla
            const featureIcons = box.querySelectorAll('.service-feature i');
            if (featureIcons.length) {
                featureIcons.forEach(icon => {
                    icon.style.color = colors.primary;
                });
            }
        }
    });
});

// Tipografi ve Okunabilirlik İyileştirmesi
document.addEventListener('DOMContentLoaded', function() {
    // Başlıklar için vurgu
    const serviceTitles = document.querySelectorAll('.service-box-title');
    serviceTitles.forEach(title => {
        title.style.textShadow = '0 2px 10px rgba(0, 0, 0, 0.8)';
    });
    
    // İçerik hiyerarşisi için metin büyüklükleri
    const serviceDescriptions = document.querySelectorAll('.service-box-description');
    serviceDescriptions.forEach(desc => {
        desc.style.fontSize = '15px';
        desc.style.lineHeight = '1.6';
    });
    
    // Özellik metinleri
    const featureTexts = document.querySelectorAll('.service-feature span');
    featureTexts.forEach(text => {
        text.style.fontSize = '14px';
        text.style.fontWeight = '500';
    });
    
    // Metin-arka plan kontrastını artır
    const serviceBoxContents = document.querySelectorAll('.service-box-content');
    serviceBoxContents.forEach(content => {
        content.style.backgroundColor = '#ffffff';
        content.style.color = '#333333';
    });
});

// Detay açılır panel oluşturma fonksiyonu
function createDetailPanels() {
    const serviceBoxes = document.querySelectorAll('.service-box');
    
    serviceBoxes.forEach(box => {
        // Mevcut butonu güncelle
        const btn = box.querySelector('.service-box-btn');
        if (btn && !btn.getAttribute('data-has-panel')) {
            // Butona toggle özelliğini ekle
            btn.classList.add('details-toggle');
            btn.setAttribute('data-has-panel', 'true');
            
            // Servis içeriğini al
            const title = box.querySelector('.service-box-title').textContent;
            const features = Array.from(box.querySelectorAll('.service-feature span')).map(span => span.textContent);
            
            // Panel içeriği oluştur
            const panelContent = `
                <div class="service-details-panel">
                    <div class="panel-section">
                        <h4 class="panel-title">${title} Detayları</h4>
                        <p class="panel-desc">Bu hizmetimiz kapsamında sunduğumuz çözümler:</p>
                    </div>
                    
                    <div class="panel-section">
                        <h5 class="panel-subtitle">Sunduğumuz Avantajlar</h5>
                        <ul class="panel-list">
                            ${features.map(feature => `<li>${feature}</li>`).join('')}
                            <li>7/24 hizmet desteği</li>
                            <li>Deneyimli personel</li>
                        </ul>
                    </div>
                    
                    <div class="panel-section">
                        <h5 class="panel-subtitle">Fiyat Bilgisi</h5>
                        <p>Detaylı fiyat bilgisi için lütfen iletişime geçin.</p>
                        <a href="#contact" class="panel-link">İletişim Formu</a>
                    </div>
                </div>
            `;
            
            // Paneli ekle
            const content = box.querySelector('.service-box-content');
            if (content) {
                // Mevcut içeriğin sonuna panel ekle
                content.insertAdjacentHTML('beforeend', panelContent);
            }
        }
    });
}

// Sayfa yüklendikten sonra detay panellerini oluştur
document.addEventListener('DOMContentLoaded', function() {
    // Detay panelleri oluştur
    createDetailPanels();
});

// Hizmet kartları için tıklama geri bildirimleri
function initServiceCardInteractions() {
    const serviceBoxes = document.querySelectorAll('.service-box');
    const detailButtons = document.querySelectorAll('.service-btn');
    
    // Detay açılır panel için tıklama fonksiyonu
    detailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Detay sayfasına gitme linki varsa, normal çalışsın
            if (this.getAttribute('href') && this.getAttribute('href') !== '#') return;
            
            // Link yoksa veya # ise panel açılımını yönet
            e.preventDefault();
            const card = this.closest('.service-box');
            const panel = card.querySelector('.service-details-panel');
            
            // Panel yoksa işlem yapma
            if (!panel) return;
            
            if (panel.classList.contains('open')) {
                panel.classList.remove('open');
                this.innerHTML = 'Detaylı Bilgi <i class="fas fa-arrow-right"></i>';
            } else {
                // Diğer tüm açık panelleri kapat
                document.querySelectorAll('.service-details-panel.open').forEach(p => {
                    if (p !== panel) {
                        p.classList.remove('open');
                        const btn = p.closest('.service-box').querySelector('.service-btn');
                        btn.innerHTML = 'Detaylı Bilgi <i class="fas fa-arrow-right"></i>';
                    }
                });
                
                panel.classList.add('open');
                this.innerHTML = 'Kapat <i class="fas fa-times"></i>';
            }
        });
    });
    
    // 3D etkisi için kartlar üzerinde mouse hareketi
    serviceBoxes.forEach(box => {
        box.addEventListener('mousemove', function(e) {
            const boxRect = box.getBoundingClientRect();
            const boxCenterX = boxRect.left + boxRect.width / 2;
            const boxCenterY = boxRect.top + boxRect.height / 2;
            
            // -5 ile 5 arasında değer hesaplama
            const angleX = ((e.clientY - boxCenterY) / 20) * -1;
            const angleY = (e.clientX - boxCenterX) / 20;
            
            // 3D dönüş efekti
            box.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.01, 1.01, 1.01)`;
        });
        
        // Mouse ayrıldığında orijinal haline dönme
        box.addEventListener('mouseleave', function() {
            box.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
        
        // Tıklama efekti
        box.addEventListener('mousedown', function() {
            box.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(0.98, 0.98, 0.98)';
            box.style.transition = 'transform 0.1s';
        });
        
        box.addEventListener('mouseup', function() {
            box.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Scroll animasyonları için gözlemci
function initScrollAnimations() {
    const animateCards = document.querySelectorAll('.animate-card');
    
    // Intersection Observer kurulumu
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const animation = card.dataset.animation || 'fade-up';
                card.classList.add(animation);
                observer.unobserve(card);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Her kart için gözlemci ekleme
    animateCards.forEach(card => {
        observer.observe(card);
    });
}

// Sayfa yüklendiğinde tüm interaktif özellikleri başlat
document.addEventListener('DOMContentLoaded', function() {
    // Diğer başlatma fonksiyonları...
    initMobileMenu();
    initServiceCardInteractions();
    initScrollAnimations();
    
    // Tab değişim animasyonunu başlat
    const tabs = document.querySelectorAll('.service-category-tabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Tab animasyonları
        });
    });
    
    // İkon animasyonları için interval ayarla
    setInterval(() => {
        const icons = document.querySelectorAll('.service-icon-animate');
        icons.forEach(icon => {
            // Rastgele bir ikona animasyon uygula
            if (Math.random() > 0.8) {
                icon.classList.add('pulse-animation');
                setTimeout(() => {
                    icon.classList.remove('pulse-animation');
                }, 1000);
            }
        });
    }, 3000);
    
    // Featured hizmetlere özel vurgulama
    const featuredServices = document.querySelectorAll('.service-box.featured');
    featuredServices.forEach(service => {
        // Vurgulu hizmet kartları için özel efekt
        service.classList.add('highlight-pulse');
    });
});

// İletişim Bölümü İçin Efektler
document.addEventListener('DOMContentLoaded', function() {
    // İletişim formundaki giriş animasyonları
    const formInputs = document.querySelectorAll('.input-animate');
    
    formInputs.forEach(input => {
        // Form elemanlarına animasyon ekle
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('input-focused');
            }
        });
        
        // Başlangıçta değeri olanlar için sınıf ekle
        if (input.value !== '') {
            input.parentElement.classList.add('input-focused');
        }
    });
    
    // Ripple efekti (dalga) eklemek için
    const rippleButtons = document.querySelectorAll('.ripple-button, .ripple-effect');
    
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            
            const diameter = Math.max(rect.width, rect.height);
            const radius = diameter / 2;
            
            ripple.style.width = ripple.style.height = `${diameter}px`;
            ripple.style.left = `${e.clientX - rect.left - radius}px`;
            ripple.style.top = `${e.clientY - rect.top - radius}px`;
            ripple.classList.add('ripple');
            
            const rippleContainer = this.querySelector('.ripple-effect') || this;
            
            // Önceki ripple efektlerini temizle
            const existingRipple = rippleContainer.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove();
            }
            
            rippleContainer.appendChild(ripple);
            
            // Animasyon tamamlandıktan sonra kaldır
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Kartlara hover efekti ekle (3D dönüş)
    const cardItems = document.querySelectorAll('.card-hover-effect');
    
    cardItems.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Kartın ortası
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // X ve Y eksenleri için dönüş derecesi hesapla (-10 ile 10 derece arası)
            const rotateY = ((x - centerX) / centerX) * 3;
            const rotateX = -((y - centerY) / centerY) * 3;
            
            // Kart glow efekti için hesapla
            const glow = this.querySelector('.card-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.3), transparent 50%)`;
            }
            
            // Dönüş efektini uygula
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            this.style.transition = 'transform 0.1s ease';
        });
        
        // Mouse karttan çıktığında efekti sıfırla
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            this.style.transition = 'transform 0.3s ease';
            
            const glow = this.querySelector('.card-glow');
            if (glow) {
                glow.style.background = 'none';
            }
        });
    });
    
    // İletişim bilgi öğeleri için efekt ekle
    const interactItems = document.querySelectorAll('.interact-item');
    
    interactItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.contact-icon');
            if (icon) {
                icon.classList.add('animated');
                
                // İkona titreşim efekti ekle
                icon.style.animation = 'iconShake 0.5s ease-in-out';
                
                setTimeout(() => {
                    icon.style.animation = '';
                }, 500);
            }
        });
    });
    
    // SSS Toggle İşlevi
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Tüm diğer açık SSS öğelerini kapat
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = null;
                }
            });
            
            // Tıklanan öğeyi aç/kapat
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            }
        });
    });
});

// İletişim Bölümü Etkileşim Efektleri
function initContactInteractions() {
  // Kart 3D efekti
  const cards = document.querySelectorAll('.card-hover-effect');
  
  cards.forEach(card => {
    const glow = card.querySelector('.card-glow');
    
    // Mouse hareketi ile 3D efekt
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const angleX = (y - centerY) / 20;
      const angleY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1, 1, 1)`;
      
      if (glow) {
        // Parlama efekti takip etsin
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.2) 0%, transparent 80%)`;
      }
    });
    
    // Mouse ayrıldığında efekti sıfırla
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      if (glow) {
        glow.style.background = 'none';
      }
    });
  });
  
  // Ripple efekti
  const rippleButtons = document.querySelectorAll('.ripple-button, .ripple-effect');
  
  rippleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Sık Sorulan Sorular akordiyon
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Diğer açık olanları kapat
      document.querySelectorAll('.faq-item.active').forEach(activeItem => {
        if (activeItem !== item) {
          activeItem.classList.remove('active');
        }
      });
      
      // Tıklanan öğenin durumunu değiştir
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
  
  // Form etkileşimleri
  const formInputs = document.querySelectorAll('.input-animate');
  
  formInputs.forEach(input => {
    // Input focus stillerini yönet
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('input-focused');
    });
    
    input.addEventListener('blur', function() {
      if (this.value === '') {
        this.parentElement.classList.remove('input-focused');
      }
    });
    
    // Daha önceden değer varsa stil ekle
    if (input.value !== '') {
      input.parentElement.classList.add('input-focused');
    }
  });
  
  // Form gönderimi
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Basit form doğrulaması
      const isValid = validateContactForm();
      
      if (isValid) {
        // Form gönderme animasyonu
        const submitBtn = this.querySelector('.btn-send');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Gönderiliyor...`;
        
        try {
          // Gerçek hayatta burada bir API'ye istek gönderilir
          await simulateFormSubmission();
          
          // Başarılı yanıt
          showFormResponse('success', 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
          this.reset();
          
          // Input stillerini sıfırla
          formInputs.forEach(input => {
            input.parentElement.classList.remove('input-focused');
          });
          
        } catch (error) {
          // Hata durumu
          showFormResponse('error', 'Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
          console.error('Form submission error:', error);
        } finally {
          // Butonu eski haline getir
          submitBtn.disabled = false;
          submitBtn.innerHTML = `Mesajı Gönder <span class="btn-icon"><i class="fas fa-paper-plane"></i></span>`;
        }
      }
    });
  }
  
  // Form yanıt mesajını göster
  function showFormResponse(type, message) {
    const responseEl = document.getElementById('formResponse');
    if (responseEl) {
      responseEl.className = 'form-response';
      responseEl.classList.add(type, 'show');
      responseEl.innerHTML = message;
      
      // 5 saniye sonra mesajı gizle
      setTimeout(() => {
        responseEl.classList.remove('show');
      }, 5000);
    }
  }
  
  // Basit form doğrulaması
  function validateContactForm() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const consent = document.getElementById('consent');
    let isValid = true;
    
    // İsim kontrolü
    if (!name.value.trim()) {
      showInputError(name);
      isValid = false;
    } else {
      hideInputError(name);
    }
    
    // E-posta kontrolü
    if (!email.value.trim() || !isValidEmail(email.value)) {
      showInputError(email);
      isValid = false;
    } else {
      hideInputError(email);
    }
    
    // Mesaj kontrolü
    if (!message.value.trim()) {
      showInputError(message);
      isValid = false;
    } else {
      hideInputError(message);
    }
    
    // Onay kontrolü
    if (!consent.checked) {
      showInputError(consent);
      isValid = false;
    } else {
      hideInputError(consent);
    }
    
    return isValid;
  }
  
  // Input hata gösterimi
  function showInputError(input) {
    input.classList.add('is-invalid');
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.style.display = 'block';
    }
  }
  
  // Input hata gizleme
  function hideInputError(input) {
    input.classList.remove('is-invalid');
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.style.display = 'none';
    }
  }
  
  // E-posta geçerliliğini kontrol et
  function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Form gönderimini simüle et
  function simulateFormSubmission() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1500);
    });
  }
}

// Sayfa yüklendiğinde etkileşimleri başlat
document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  
  // İletişim etkileşimlerini başlat
  initContactInteractions();
});

/**
 * Adres Kontrolü ve Bölge Eşleştirme
 */
function initAddressChecker() {
  const addressForm = document.getElementById('addressCheckerForm');
  const regionSelect = document.getElementById('region-select');
  
  if (addressForm && regionSelect) {
    // Bölge değişimi olayı
    regionSelect.addEventListener('change', () => {
      const selectedRegion = regionSelect.value;
      const mapElement = document.getElementById('gmap');
      
      // Seçilen bölgeyi AppState'e kaydet
      if (selectedRegion && AppState.get('mapLocations')[selectedRegion]) {
        AppState.set('activeRegion', selectedRegion);
        
        // Region butonunu aktif et (varsa)
        const regionButton = document.querySelector(`.region-button[data-region="${selectedRegion}"]`);
        if (regionButton) {
          regionButton.click();
        }
      }
    });
    
    // Form gönderimi
    addressForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // Form doğrulama
      if (FormValidator.validateForm(addressForm)) {
        const formData = new FormData(addressForm);
        const data = {};
        
        formData.forEach((value, key) => {
          data[key] = value;
        });
        
        // Sweet Alert ile mesaj göster
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Adresiniz Kontrol Ediliyor',
            text: `${data.address} adresinde hizmet kontrolü yapılıyor...`,
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'Tamam',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          // Adres kontrolü simülasyonu
          setTimeout(() => {
            // Simüle edilmiş kontrol sonucu
            const isServiceAvailable = Math.random() > 0.3;
            
            if (isServiceAvailable) {
              Swal.fire({
                title: 'Harika!',
                text: 'Belirttiğiniz adrese hizmet verebiliyoruz. Sizi hemen arayalım!',
                icon: 'success',
                confirmButtonText: 'İletişime Geç'
              }).then((result) => {
                if (result.isConfirmed) {
                  // İletişim formu kısmına kaydır
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              });
        } else {
              Swal.fire({
                title: 'Üzgünüz!',
                text: 'Belirttiğiniz adres henüz hizmet alanımız dışında. Başka bir adres deneyebilir misiniz?',
                icon: 'error',
                confirmButtonText: 'Tekrar Dene'
              });
            }
          }, 2000);
        }
      }
    });
  }
}

/**
 * Lazy Loading İşlevselliği
 * Sayfa içindeki resim ve video öğelerinin lazily yüklenmesini sağlar
 */
function initLazyLoading() {
  // Görüntüleme alanına giren öğeleri yüklemek için Intersection Observer kullan
  const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        if (element.tagName.toLowerCase() === 'img') {
          // Lazy load edilecek resim
          if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
          }
          
          if (element.dataset.srcset) {
            element.srcset = element.dataset.srcset;
            element.removeAttribute('data-srcset');
          }
          
          element.classList.add('loaded');
        } 
        else if (element.tagName.toLowerCase() === 'video') {
          // Video için lazy loading
          if (!element.getAttribute('src') && element.querySelector('source')) {
            // Source öğeleri ile video
            const sources = element.querySelectorAll('source');
            sources.forEach(source => {
              if (source.dataset.src) {
                source.src = source.dataset.src;
                source.removeAttribute('data-src');
              }
            });
            
            // Videoyu yükle
            element.load();
            
            // Otomatik oynatma varsa başlat
            if (element.hasAttribute('autoplay')) {
              try {
                element.play().catch(err => {
                  console.warn('Video otomatik oynatılamadı:', err);
                });
              } catch (e) {
                console.warn('Video oynatmada hata:', e);
              }
            }
          } 
          else if (element.dataset.src) {
            // Doğrudan src özelliğine sahip video
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            
            // Videoyu yükle
            element.load();
            
            // Otomatik oynatma varsa başlat
            if (element.hasAttribute('autoplay')) {
              try {
                element.play().catch(err => {
                  console.warn('Video otomatik oynatılamadı:', err);
                });
              } catch (e) {
                console.warn('Video oynatmada hata:', e);
              }
            }
          }
          
          element.classList.add('loaded');
        } 
        else if (element.classList.contains('lazy-background')) {
          // Arka plan resmi için lazy loading
          const src = element.dataset.src;
          if (src) {
            element.style.backgroundImage = `url(${src})`;
            element.removeAttribute('data-src');
            element.classList.add('loaded');
          }
        }
        
        // Gözlemlemeyi sonlandır
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: '200px 0px', // Görüntüleme alanından 200px önce yüklemeye başla
    threshold: 0.01 // Element görünür hale geldiği an yükleme başlasın
  });
  
  // Lazy loading yapılacak tüm öğeleri belirle ve gözlemle
  const lazyElements = document.querySelectorAll('img[data-src], video[data-src], video source[data-src], .lazy-background[data-src]');
  lazyElements.forEach(element => {
    lazyLoadObserver.observe(element);
  });
  
  // Hero videosunu özel olarak işle
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    // Video kaynağını doğrudan ayarla
    const videoSrc = heroVideo.getAttribute('src');
    if (videoSrc) {
      // Video zaten src özelliğine sahip, sadece yüklenmesini sağla
      heroVideo.addEventListener('loadeddata', function() {
        heroVideo.classList.add('loaded');
        const videoParent = heroVideo.closest('.hero-video-background');
        if (videoParent) {
          videoParent.classList.add('video-loaded');
        }
      });
      
      // Mobil cihazda ise video yerine sadece poster göster
      if (window.innerWidth < 768) {
        heroVideo.setAttribute('preload', 'none');
        heroVideo.removeAttribute('autoplay');
      } else {
        // Masaüstünde videoyu yükle
        heroVideo.load();
        
        // Otomatik oynatma
        if (heroVideo.hasAttribute('autoplay')) {
          heroVideo.play().catch(e => {
            console.warn('Hero video otomatik oynatılamadı:', e);
          });
        }
      }
    }
  }
  
  // Sayfa kaydırma olayını dinle ve görünür olan lazy öğeleri kontrol et
  window.addEventListener('scroll', debounce(() => {
    lazyElements.forEach(element => {
      if (isInViewport(element, 200) && !element.classList.contains('loaded')) {
        lazyLoadObserver.observe(element);
      }
    });
  }, 200));
  
  // Element görüntüleme alanında mı kontrolü
  function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight + offset) &&
      rect.left <= (window.innerWidth + offset) &&
      rect.bottom >= (0 - offset) &&
      rect.right >= (0 - offset)
    );
  }
  
  // Debounce fonksiyonu
  function debounce(func, wait = 20) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
}

// Hata yakalama mekanizması - konsol hatalarını temizler
(function handleRuntimeErrors() {
    // Chrome/Edge eklenti hatalarını bastır
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
        console.warn('Eklenti hatası bastırıldı:', chrome.runtime.lastError);
    }
    
    // Sayfa yüklendiğinde eklenti hatalarını gözardı et
    window.addEventListener('load', function() {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            const originalSendMessage = chrome.runtime.sendMessage;
            chrome.runtime.sendMessage = function() {
                try {
                    return originalSendMessage.apply(this, arguments);
                } catch (e) {
                    console.warn('Eklenti mesaj hatası bastırıldı');
                    return false;
                }
            };
        }
        
       
    });
})();

/**
 * Ekip Kartları için Animasyonlar ve Etkileşimler
 */
function initTeamAnimations() {
  const teamMembers = document.querySelectorAll('.team-member');
  
  if (teamMembers.length > 0) {
    teamMembers.forEach(member => {
      // Hover olayları
      member.addEventListener('mouseenter', () => {
        member.classList.add('hovered');
      });
      
      member.addEventListener('mouseleave', () => {
        member.classList.remove('hovered');
      });
      
      // IntersectionObserver ile giriş animasyonu
      Utils.createObserver([member], (el) => {
        el.classList.add('animated');
      }, { threshold: 0.3 });
    });
  }
}