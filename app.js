/**
 * Gürel Yönetim - Optimize Ana JavaScript
 * Version: 4.1.0 - Tema Sistemi Entegrasyonu
 */

// 1. KONFIGURASYON
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
    headerOpacity: 0.9
  },
  map: {
    zoom: 15,
    center: { lat: 39.592450, lng: 27.016894 }
  },
  breakpoints: {
    sm: 576, md: 768, lg: 992, xl: 1200
  }
};

// 2. DURUM YÖNETİMİ - AppState
const AppState = (() => {
  const state = {
    isMenuOpen: false,
    currentSection: '',
    isHeaderScrolled: false,
    activeRegion: 'Edremit',
    currentLanguage: localStorage.getItem('selectedLanguage') || 'tr',
    mapLocations: {
      'Edremit': { lat: 39.592450, lng: 27.016894, zoom: 16 },
      'Akçay': { lat: 39.583333, lng: 26.933333, zoom: 16 },
      'Güre': { lat: 39.586667, lng: 26.883333, zoom: 16 },
      'Burhaniye': { lat: 39.500000, lng: 26.966667, zoom: 16 },
      'Altınoluk': { lat: 39.566667, lng: 26.733333, zoom: 16 }
    }
  };
  
  return {
    get: (key) => state[key],
    set: (key, value) => {
      state[key] = value;
      EventBus.publish('stateChanged', { key, value });
    },
    getAll: () => ({...state})
  };
})();

// 3. EVENT BUS - ThemeSystem ile entegre edildi
const EventBus = (() => {
  const events = new Map();
  
  return {
    subscribe(event, callback) {
      if (!events.has(event)) events.set(event, new Set());
      events.get(event).add(callback);
      return () => this.unsubscribe(event, callback);
    },
    
    publish(event, data) {
      if (!events.has(event)) return;
      events.get(event).forEach(callback => {
        try { callback(data); } 
        catch (error) { console.error(`Event hatası (${event}):`, error); }
      });
    },
    
    unsubscribe(event, callback) {
      if (!events.has(event)) return;
      events.get(event).delete(callback);
      if (events.get(event).size === 0) events.delete(event);
    }
  };
})();

// 4. BAŞLATMA FONKSİYONU
function initializeApplication() {
  removeLoader();
  initCore();
  connectThemeSystem();
  initHeroVideo();
  console.log("Uygulama başlatma tamamlandı");
}

// Yükleme ekranını kaldır
function removeLoader() {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.zIndex = '-1';
    setTimeout(() => loader.style.display = 'none', 300);
  }
}

// 5. TEMEL FONKSİYONLAR
function initCore() {
  initHeader();
  initUIComponents();
  initInteractions();
  
  if (typeof AOS !== 'undefined') {
    AOS.init(CONFIG.animation);
  }
  
  // Make nav header visible after initialization
  const header = document.querySelector('.patreon-header');
  if (header) {
    header.classList.add('visible');
  }
}

// 6. HEADER VE NAVİGASYON
function initHeader() {
  const header = document.querySelector('.patreon-header');
  if (!header) return;
  
  // Header scroll olayları
  window.addEventListener('scroll', window.ThemeUtils?.throttle ?
    window.ThemeUtils.throttle(onScroll, 150) : onScroll);
  
  // Scroll olayları
  initScrollEvents();
  
  function onScroll() {
      const scrollY = window.scrollY;
      if (scrollY > CONFIG.scroll.threshold && !AppState.get('isHeaderScrolled')) {
        AppState.set('isHeaderScrolled', true);
      header.classList.add('scrolled');
      header.classList.remove('transparent');
      } else if (scrollY <= CONFIG.scroll.threshold && AppState.get('isHeaderScrolled')) {
        AppState.set('isHeaderScrolled', false);
      header.classList.remove('scrolled');
      if (document.querySelector('#home')) {
        header.classList.add('transparent');
      }
    }
    
    updateActiveNavItem();
  }
  
  // Initial call to set correct state
  onScroll();
}

// 7. UI BİLEŞENLERİ
function initUIComponents() {
  // Tab sistemi
  const tabContainers = document.querySelectorAll('.tab-container, .nav-tabs');
  if (tabContainers.length > 0) {
    tabContainers.forEach(container => {
      const tabs = container.querySelectorAll('.tab, .nav-link');
      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          const targetId = this.getAttribute('data-tab') || this.getAttribute('data-bs-target');
          if (!targetId) return;
          
          tabs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          
          const tabContents = document.querySelectorAll('.tab-content, .tab-pane');
          tabContents.forEach(content => {
            content.classList.remove('active', 'show');
            if (content.id === targetId.replace('#', '') || content.id === targetId) {
              content.classList.add('active', 'show');
            }
        });
      });
      });
    });
  }
  
  // ThemeUtils ile LazyLoading
  initLazyLoading();
}

// 8. ETKİLEŞİMLER
function initInteractions() {
  initHeroInteractions();
  initCardInteractions();
  initForms();
  initMapFeatures();
  updateCopyrightYear();
}

// 9. HERO ETKİLEŞİMLERİ
function initHeroInteractions() {
  const heroSection = document.querySelector('.patreon-hero');
  if (!heroSection) return;
  
  // Paralax efekti - ThemeUtils.isMobile ile entegre
  if (!(window.ThemeUtils?.prefersReducedMotion?.() || isMobile())) {
    const throttleFn = window.ThemeUtils?.throttle || 
                     ((fn, limit) => { let to; return (...args) => { clearTimeout(to); to = setTimeout(() => fn(...args), limit); }; });
    
    window.addEventListener('mousemove', throttleFn((e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
      const content = heroSection.querySelector('.hero-content');
      if (content) {
        content.style.transform = `translate(${mouseX * 10 - 5}px, ${mouseY * 10 - 5}px)`;
        }
        
      const card = heroSection.querySelector('.hero-3d-card');
      if (card) {
        card.style.transform = `translate(${mouseX * -10 + 5}px, ${mouseY * -10 + 5}px)`;
        }
      }, 50));
  }
  
  // Kelime değiştirme animasyonu
  const changingWord = document.getElementById('changingWord');
  if (changingWord) {
    const words = ['ekonomik', 'güvenilir', 'profesyonel', 'şeffaf'];
    let currentIndex = 0;
    
    setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      changingWord.classList.add('word-change');
      
      setTimeout(() => {
        changingWord.textContent = words[currentIndex];
        changingWord.classList.remove('word-change');
      }, 500);
    }, 4000);
  }
}

// 10. KART ETKİLEŞİMLERİ
function initCardInteractions() {
  // Tilt efekti - ThemeUtils ile entegre
  const tiltElements = document.querySelectorAll('.tilt-effect, .service-card.tilt');
  
  if (tiltElements.length > 0 && !isMobile()) {
    tiltElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX * 10;
        const deltaY = (y - centerY) / centerY * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${-deltaY}deg) rotateY(${deltaX}deg) scale(1.02)`;
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        element.style.transition = 'all 0.5s ease';
      });
    });
  }
  
  // Servis kartları animasyonları - IntersectionObserver
  createObserver(
    document.querySelectorAll('.service-card, .hero-3d-card, .animate-card'),
    (card) => card.classList.add('animated'),
    { threshold: 0.1 }
  );
}

// 11. DİĞER FONKSİYONLAR 
function initForms() {
  document.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('input-focused');
      });
      
      input.addEventListener('blur', () => {
      if (!input.value.trim()) {
          input.parentElement.classList.remove('input-focused');
        }
      });
      
    if (input.value.trim()) {
        input.parentElement.classList.add('input-focused');
      }
    });
  }

function initMapFeatures() {
  const mapElement = document.getElementById('gmap');
  
  if (mapElement && typeof google !== 'undefined') {
    const defaultLocation = AppState.get('mapLocations')[AppState.get('activeRegion')];
    
    const map = new google.maps.Map(mapElement, {
      zoom: defaultLocation.zoom || CONFIG.map.zoom,
      center: new google.maps.LatLng(
        defaultLocation.lat || CONFIG.map.center.lat,
        defaultLocation.lng || CONFIG.map.center.lng
      ),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false
    });
    
    document.querySelectorAll('.region-button').forEach(button => {
        button.addEventListener('click', () => {
          const region = button.getAttribute('data-region');
          if (!region) return;
          
          AppState.set('activeRegion', region);
          
          const location = AppState.get('mapLocations')[region];
          if (location) {
            map.panTo(new google.maps.LatLng(location.lat, location.lng));
            map.setZoom(location.zoom || CONFIG.map.zoom);
          }
        });
      });
  }
}

// 12. TEMA SİSTEMİ ENTEGRASYONU
function connectThemeSystem() {
  // Tema değişikliklerini dinle - themeMnanager zaten mevcut
  document.addEventListener('themeSystemInitialized', () => {
    console.log('Tema sistemine bağlanıldı');
    
    // AppState ile ThemeManager entegrasyonu
    if (window.themeManager) {
      // İlk durumu senkronize et
      AppState.set('isDarkMode', window.themeManager.getActiveTheme() === 'dark');
      
      // Tema değişimlerini dinle
      window.themeManager.on('themeChanged', (settings) => {
        AppState.set('isDarkMode', settings.theme === 'dark');
        EventBus.publish('themeChanged', settings);
      });
    }
  });
}

// 13. YARDIMCI FONKSİYONLAR (ThemeUtils'i kullanarak optimize edildi)
function updateActiveNavItem() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');
  
  if (!sections.length || !navItems.length) return;
  
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.body.offsetHeight;
  
  // Handle special case: scroll at bottom of page
  const isScrollBottom = (windowHeight + scrollY) >= (documentHeight - 10);
  
  let currentSection = '';
  
  if (isScrollBottom) {
    // When at bottom, activate the last section
    const lastSection = sections[sections.length - 1];
    currentSection = lastSection.getAttribute('id');
  } else {
    // Normal scrolling behavior
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });
  }
  
  navItems.forEach(item => {
    item.classList.remove('active');
    const href = item.getAttribute('href');
    if (href && href.includes('#') && href.substr(href.indexOf('#') + 1) === currentSection) {
      item.classList.add('active');
    }
  });
}

function initScrollEvents() {
  const scrollTopBtn = document.querySelector('.scroll-top');
  
  if (scrollTopBtn) {
    const throttleFn = window.ThemeUtils?.throttle || 
                     ((fn, limit) => { let lastCall = 0; return (...args) => { const now = Date.now(); if (now - lastCall >= limit) { lastCall = now; fn(...args); } }; });
    
    window.addEventListener('scroll', throttleFn(() => {
      if (window.scrollY > window.innerHeight / 2) {
        scrollTopBtn.classList.add('active');
      } else {
        scrollTopBtn.classList.remove('active');
      }
    }, 200));
    
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ThemeUtils.createObserver kullanarak veya yok ise kendi IntersectionObserver'ımızı oluşturarak
function createObserver(elements, callback, options = {}) {
  if (window.ThemeUtils?.createObserver) {
    return window.ThemeUtils.createObserver(elements, callback, options);
  }
  
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

function initLazyLoading() {
  createObserver(
    document.querySelectorAll('img[data-src], .lazy-background[data-src]'),
    (element) => {
        if (element.tagName.toLowerCase() === 'img') {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
      } else {
        element.style.backgroundImage = `url(${element.dataset.src})`;
            element.removeAttribute('data-src');
      }
          element.classList.add('loaded');
    },
    { rootMargin: '200px 0px' }
  );
}

function updateCopyrightYear() {
  document.querySelectorAll('.copyright-year').forEach(element => {
    element.textContent = new Date().getFullYear().toString();
  });
}

function isMobile() {
  return window.ThemeUtils?.isMobile?.() || window.innerWidth < CONFIG.breakpoints.lg;
}

// 14. HATA YÖNETİMİ
window.addEventListener('error', function(e) {
  if (e.filename && (e.filename.includes('contentScript.bundle.js') || e.filename.includes('chrome-extension'))) {
    console.debug('Extension error ignored:', e.message);
    return;
  }
  console.error('Uygulama hatası:', e.message);
});

// 15. UYGULAMA BAŞLATMA
document.addEventListener('DOMContentLoaded', initializeApplication);
window.addEventListener('load', removeLoader);
setTimeout(removeLoader, 5000);

function calculateReturn() {
  const propertyType = document.getElementById('property-type').value;
  if (propertyType === "0") {
    alert("Lütfen bir mülk tipi seçin");
    return;
  }
  
  const returns = {
    "1": { normal: "3.500₺", gurel: "4.100₺" },
    "2": { normal: "5.500₺", gurel: "6.400₺" },
    "3": { normal: "7.500₺", gurel: "8.700₺" },
    "4": { normal: "12.000₺", gurel: "14.800₺" }
  };
  
  const result = returns[propertyType];
  
  Swal.fire({
    title: 'Aylık Potansiyel Getiri',
    html: `
      <div class="return-comparison">
        <div class="return-item">
          <div class="return-label">Normal Yönetim</div>
          <div class="return-value">${result.normal}</div>
        </div>
        <div class="return-item highlight">
          <div class="return-label">Gürel Yönetim</div>
          <div class="return-value">${result.gurel}</div>
          <div class="return-diff">+%15 Daha Fazla</div>
        </div>
      </div>
      <div class="return-note">* Değerler ortalama olup, mülkün konumu ve durumuna göre değişiklik gösterebilir.</div>
    `,
    showCloseButton: true,
    confirmButtonText: 'Hemen Danışmanlık Alın',
    confirmButtonColor: '#2e58a6'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "https://wa.me/905305556007?text=Mülk%20yönetimi%20hakkında%20bilgi%20almak%20istiyorum";
    }
  });
}

// Video hazırlık fonksiyonu daha güvenli hale getirildi
function initHeroVideo() {
  const heroBg = document.querySelector('.hero-bg.video-bg');
  if (!heroBg) return;
  
  const video = heroBg.querySelector('video');
  if (!video) {
    console.error("Hero video elementi bulunamadı");
    heroBg.classList.remove('video-bg');
    heroBg.classList.add('image-bg');
    return;
  }
  
  // Video durumunu kontrol et
  if (video.readyState >= 2) { // HAVE_CURRENT_DATA veya daha iyi
    heroBg.classList.add('video-loaded');
    console.log("Hero video zaten yüklendi");
  } else {
    // Video yüklenmesini kontrol et
    video.addEventListener('loadeddata', function() {
      heroBg.classList.add('video-loaded');
      console.log("Hero video yüklendi");
    });
    
    // 3 saniye içinde video yüklenmezse yedek plan devreye girer
    setTimeout(function() {
      if (!heroBg.classList.contains('video-loaded')) {
        console.warn("Video yükleme zaman aşımı - yedek görünüme geçiliyor");
        heroBg.classList.remove('video-bg');
        heroBg.classList.add('image-bg');
        video.style.display = 'none';
      }
    }, 3000);
  }
  
  // Video hata durumunu kontrol et
  video.addEventListener('error', function(e) {
    console.error("Hero video yüklenme hatası:", e.target.error);
    heroBg.classList.remove('video-bg');
    heroBg.classList.add('image-bg');
    video.style.display = 'none';
  });
}
