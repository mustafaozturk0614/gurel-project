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
  // Tema sistemi entegrasyonu
  try {
    if (window.themeManager) {
      console.log('Tema sistemi bağlanıyor...');
      
      // Tema değişikliklerini dinle
      window.themeManager.on('themeModeChanged', (mode) => {
        document.body.setAttribute('data-theme-mode', mode);
        document.documentElement.classList.add('theme-transition');
        
        // Geçiş animasyonunu iyileştirmek için
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 500);
      });
      
      // Tema durumunu doğrula ve gerekirse senkronize et
      const currentThemeMode = window.themeManager.settings.themeMode || 'light';
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      
      // Eğer tema modu ile HTML özniteliği uyumsuzsa, düzelt
      if (currentThemeMode === 'light' && htmlTheme !== 'light') {
        window.themeManager.setThemeMode('light');
      } else if (currentThemeMode === 'dark' && htmlTheme !== 'dark') {
        window.themeManager.setThemeMode('dark');
      } else if (currentThemeMode === 'auto') {
        // Otomatik moddaysak, zamanlama kontrolü yap
        const currentHour = new Date().getHours();
        const isDark = (currentHour >= 19 || currentHour < 7);
        const expectedTheme = isDark ? 'dark' : 'light';
        
        if (htmlTheme !== expectedTheme) {
          window.themeManager.setThemeMode('auto');
        }
      }
      
      console.log('Tema sistemi başarıyla bağlandı');
    } else {
      console.warn('Tema sistemi bulunamadı!');
      
      // Tema sistemi yoksa bile temel tema desteği sağla
      const savedThemeMode = localStorage.getItem('themeMode');
      if (savedThemeMode === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
      }
    }
  } catch (error) {
    console.error('Tema sistemi bağlanırken hata:', error);
  }
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

document.addEventListener('DOMContentLoaded', function() {
  // Gelişmiş tab geçişlerini kullan
  window.useEnhancedTabs = true;
  
  // Tab yapısını başlat
  initHeroTabs();
  
  // Yeni kart ve geçiş efektlerini başlat
  try {
    console.log('Tab efektleri başlatılıyor...');
    
    // Animasyon yardımcılarını hemen başlat
    addParticleAnimations();
    initCardEffects();
    
    // Gelişmiş geçiş efektlerini tek seferde uygula
    enhanceTabTransitions();
    console.log('Gelişmiş tab geçiş efektleri başlatıldı');
    
    // İlk açılışta aktif paneldeki kartları animasyonla göster
    const activePane = document.querySelector('.hero-tab-pane.active');
    if (activePane) {
      activePane.style.display = 'block'; // Görünür olduğundan emin ol
      
      const cards = activePane.querySelectorAll('.business-card');
      cards.forEach((card, index) => {
        // Başlangıçta kartlar görünmez olsun
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        // Kademeli olarak kartları göster
        setTimeout(() => {
          card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          
          // Animasyon tamamlandıktan sonra float animasyonunu başlat
          setTimeout(() => {
            card.style.animation = 'cardFloatAnimation 8s ease-in-out infinite';
          }, 800);
        }, 300 + (index * 150));
      });
    }
  } catch (e) {
    console.error('Kart ve tab efektleri başlatılırken hata: ', e);
  
    // Hata durumunda basit tab yapısını kullan
    const tabs = document.querySelectorAll('.hero-tab-btn');
    const panes = document.querySelectorAll('.hero-tab-pane');
    
    // İlk aktif olmayan tüm panelleri gizle 
    panes.forEach(pane => {
      if (!pane.classList.contains('active')) {
        pane.style.display = 'none';
      }
    });
    
    // Basit click listener ekle
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const target = this.getAttribute('data-tab');
        
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        panes.forEach(p => {
          p.style.display = 'none';
          p.classList.remove('active');
        });
        
        document.getElementById(target).style.display = 'block';
        document.getElementById(target).classList.add('active');
      });
    });
  }
});

// Kart Mouse Takibi ve 3D Efektleri
function initCardEffects() {
  const cards = document.querySelectorAll('.business-card');
  
  cards.forEach(card => {
    // Mouse takibi ile 3D dönüş efekti
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      
      // İmlecin kart merkezine göre konumu
      const mouseX = e.clientX - cardCenterX;
      const mouseY = e.clientY - cardCenterY;
      
      // Kart eğim açıları hesaplanıyor
      const rotateY = (mouseX / (rect.width / 2)) * 8; // Max 8 derece
      const rotateX = -(mouseY / (rect.height / 2)) * 8; // Max 8 derece
      
      // Karta 3D dönüş efekti uygula
      card.style.transform = `perspective(1200px) translateZ(20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      // Mouse takibi değişkenleri
      card.style.setProperty('--x', `${(e.offsetX / rect.width) * 100}%`);
      card.style.setProperty('--y', `${(e.offsetY / rect.height) * 100}%`);
      
      // İmlecin takip ettiği parıltı efekti
      const mouseEffectElem = card.querySelector('.mouse-move-effect');
      if (mouseEffectElem) {
        mouseEffectElem.style.opacity = '0.7';
        mouseEffectElem.style.left = `${e.offsetX}px`;
        mouseEffectElem.style.top = `${e.offsetY}px`;
      }
    });
    
    // Mouse karttan çıktığında varsayılan stile dön
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      
      // İmleç efektini gizle
      const mouseEffectElem = card.querySelector('.mouse-move-effect');
      if (mouseEffectElem) {
        mouseEffectElem.style.opacity = '0';
      }
    });
    
    // Mause tıklamasında hafif ölçeklendirme animasyonu
    card.addEventListener('mousedown', () => {
      card.style.transform = 'scale(0.98) translateZ(0)';
    });
    
    card.addEventListener('mouseup', () => {
      card.style.transform = '';
    });
    
    // Card içindeki her öğeye 3D derinlik etkisi ekle
    const elements = card.querySelectorAll('.card-title, .card-tag, .card-icon-container, .card-button, .card-features li');
    elements.forEach((el, index) => {
      // Her element için farklı Z-depth değeri
      const zDepth = 20 + (index % 3) * 10; // 20, 30, 40px arası
      el.style.transform = `translateZ(${zDepth}px)`;
    });
  });
  
  // Dekoratif parçacıklar için rastgele hareket
  createCardParticles();
}

// Kart parçacıkları oluşturma ve animasyon
function createCardParticles() {
  const particles = document.querySelectorAll('.card-particle');
  
  particles.forEach((particle, index) => {
    // Rastgele konumlar
    const randX = Math.floor(Math.random() * 80) + 10; // %10-90 arası
    const randY = Math.floor(Math.random() * 80) + 10; // %10-90 arası
    const size = Math.floor(Math.random() * 8) + 4; // 4-12px arası
    const duration = Math.floor(Math.random() * 20) + 10; // 10-30s arası
    
    // Stil atamaları
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${randX}%`;
    particle.style.top = `${randY}%`;
    particle.style.opacity = '0.3';
    particle.style.borderRadius = '50%';
    particle.style.position = 'absolute';
    particle.style.background = 'rgba(255, 255, 255, 0.6)';
    particle.style.filter = 'blur(1px)';
    particle.style.animation = `floatingParticle ${duration}s infinite ease-in-out`;
    
    // İndex'e göre farklı renk ve animasyon gecikmesi
    if (index % 2 === 0) {
      particle.style.background = `rgba(var(--primary-rgb), 0.5)`;
      particle.style.animationDelay = '0s';
    } else {
      particle.style.background = `rgba(var(--accent-rgb), 0.5)`;
      particle.style.animationDelay = '2s';
    }
  });
  
  // Bağlantı çizgileri
  const lines = document.querySelectorAll('.connection-line');
  lines.forEach((line, index) => {
    // Rastgele konumlar ve boyutlar
    const randTop = Math.floor(Math.random() * 70) + 15; // %15-85 arası
    const width = Math.floor(Math.random() * 50) + 50; // 50-100px arası
    
    // Stil atamaları
    line.style.width = `${width}px`;
    line.style.top = `${randTop}%`;
    line.style.right = index % 2 === 0 ? '10%' : 'auto';
    line.style.left = index % 2 === 0 ? 'auto' : '10%';
  });
}

// Kayan parçacıklar için CSS animasyon ekleme
function addParticleAnimations() {
  // CSS animasyonu ekle
  if (!document.querySelector('#particle-animation-style')) {
    const style = document.createElement('style');
    style.id = 'particle-animation-style';
    style.textContent = `
      @keyframes floatingParticle {
        0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.2; }
        25% { transform: translate(15px, -10px) rotate(45deg); opacity: 0.4; }
        50% { transform: translate(0, -20px) rotate(90deg); opacity: 0.6; }
        75% { transform: translate(-15px, -10px) rotate(45deg); opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Tab içeriği geçişlerini animasyonla zenginleştiren fonksiyon
function enhanceTabTransitions() {
  // Çift aktivasyonu önlemek için guard
  if (window.__tabTransitionsEnhanced) return;
  window.__tabTransitionsEnhanced = true;
  
  const tabButtons = document.querySelectorAll('.hero-tab-btn');
  const tabPanes = document.querySelectorAll('.hero-tab-pane');
  
  // İlk başta tüm panelleri gizleyip sadece aktif olanı göster
  tabPanes.forEach(pane => {
    if (!pane.classList.contains('active')) {
      pane.style.display = 'none';
    } else {
      pane.style.display = 'block';
    }
  });
  
  // Tab butonlarını referans olarak saklayacak boş bir dizi
  const newButtons = [];
  
  // Önce mevcut olay dinleyicileri temizle
  tabButtons.forEach(button => {
    // Yeni bir klonla değiştirerek eski event listener'ları temizle
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Yeni butonu diziye ekle
    newButtons.push(newButton);
    
    // Yeni click olayı ekle
    newButton.addEventListener('click', () => {
      // Aktif tab butonunu güncelle - güncel newButtons dizisini kullan
      newButtons.forEach(btn => btn.classList.remove('active'));
      newButton.classList.add('active');
      
      // Aktif içeriği göster ve animasyonu tetikle
      const tabId = newButton.getAttribute('data-tab');
      
      // Önce mevcut aktif paneli kapat
      const currentActive = document.querySelector('.hero-tab-pane.active');
      if (currentActive) {
        currentActive.style.opacity = '0';
        currentActive.style.transform = 'translateY(-20px)';
        
        // Mevcut panelin kapanma animasyonu tamamlanınca hedef paneli göster
        setTimeout(() => {
          currentActive.classList.remove('active');
          currentActive.style.display = 'none';
          
          // Hedef paneli göster
          const targetPane = document.getElementById(tabId);
          if (targetPane) {
            // Önce görünmez yap ama display: block ile DOM'da göster
            targetPane.style.opacity = '0';
            targetPane.style.transform = 'translateY(30px)';
            targetPane.style.display = 'block';
            
            // DOM güncellemesinin tamamlanması için bekle
            requestAnimationFrame(() => {
              // Sonra animasyonu başlat
              targetPane.classList.add('active');
              targetPane.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              targetPane.style.opacity = '1';
              targetPane.style.transform = 'translateY(0)';
              
              // Kart animasyonlarını da başlat
              const cards = targetPane.querySelectorAll('.business-card');
              cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                  card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                  card.style.opacity = '1';
                  card.style.transform = 'translateY(0)';
                }, 100 + (index * 100)); // Kart başına 100ms gecikme
              });
            });
          }
        }, 200); // 200ms'lik kapanma animasyonu
      }
    });
  });
  
  // İlk açılışta başlangıç aktiflik durumunu yeniden ayarla
  const initialActiveTab = document.querySelector('.hero-tab-btn.active') || newButtons[0];
  const activeTabId = initialActiveTab.getAttribute('data-tab');
  
  // İlk açılışta başlangıç aktiflik durumunu düzelt
  newButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === activeTabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  console.log('Tab geçişleri geliştirildi (enhanced)');
}

// Tab yapısını başlatan fonksiyon
function initHeroTabs() {
  // Prevent multiple initializations
  if (window.__heroTabsInitialized) return;
  window.__heroTabsInitialized = true;
  try {
    console.log('Tab yapısı başlatılıyor...');
    const tabButtons = document.querySelectorAll('.hero-tab-btn');
    const tabPanes = document.querySelectorAll('.hero-tab-pane');
    
    console.log(`${tabButtons.length} adet tab butonu, ${tabPanes.length} adet tab içeriği bulundu`);
    
    if (tabButtons.length === 0 || tabPanes.length === 0) {
      console.error('Tab butonları veya içerikleri bulunamadı!');
      return;
    }
    
    // İlk olarak tüm tab panellerini gizle ve tab butonlarından active class'ını kaldır
    tabPanes.forEach(pane => {
      pane.classList.remove('active');
      pane.style.display = 'none';
    });
    
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Sayfa yüklendiğinde ilk tab'ı aktif yap (HTML'de belirtilen veya ilk tab)
    const initialActiveBtn = document.querySelector('.hero-tab-btn.active') || tabButtons[0];
    initialActiveBtn.classList.add('active'); // Active class'ı ekle
    
    const initialActiveTabId = initialActiveBtn.getAttribute('data-tab');
    console.log(`Başlangıçta aktif tab: ${initialActiveTabId}`);
    
    // İlk aktif tab'ı göster
    const activePane = document.getElementById(initialActiveTabId);
    if (activePane) {
      activePane.classList.add('active');
      activePane.style.display = 'block';
    } else {
      console.error(`İlk aktif tab içeriği bulunamadı: #${initialActiveTabId}`);
    }
    
    // enhanceTabTransitions kullanılacaksa, burada click handler'ları eklemeyelim
    // böylece çift olay işleme olmayacak
    if (!window.useEnhancedTabs) {
    // Tab butonlarına click event listener ekle
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        console.log(`Tab değiştiriliyor: ${tabId}`);
        
        // Aktif tab butonunu değiştir
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Aktif tab içeriğini değiştir
        tabPanes.forEach(pane => {
          pane.classList.remove('active');
          pane.style.display = 'none'; // Tüm tab panellerini gizle
        });
        
        const targetPane = document.getElementById(tabId);
        if (targetPane) {
          targetPane.classList.add('active');
          targetPane.style.display = 'block'; // Aktif tab panelini göster
          
          // Tab değişikliğinde kart animasyonlarını yeniden başlat
          const cards = targetPane.querySelectorAll('.business-card');
          cards.forEach((card, index) => {
            // Önce kartları gizle
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            // Kısa bir gecikme sonra kartları animasyonla göster
            setTimeout(() => {
              card.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50 * (index + 1)); // Her kart için biraz gecikme ekle
          });
        } else {
          console.error(`Tab içeriği bulunamadı: #${tabId}`);
        }
      });
    });
    }
    
    console.log('Tab yapısı başarıyla başlatıldı');
  } catch (error) {
    console.error('Tab yapısı başlatılırken hata oluştu:', error);
  }
}

// 3D dekoratif öğeleri canlandırmak için
function initDecoElements() {
  const decorElements = document.querySelectorAll('.decorative-shape');
  
  // Fare hareketi ile şekilleri hareket ettir
  document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) / 50;
    const moveY = (e.clientY - window.innerHeight / 2) / 50;
    
    decorElements.forEach(elem => {
      // Her elemana biraz farklı hareket ekle
      if (elem.classList.contains('shape-circle')) {
        elem.style.transform = `translate(${moveX * -1}px, ${moveY * -1}px) scale(1.05)`;
      } else if (elem.classList.contains('shape-dots')) {
        elem.style.transform = `rotate(15deg) translate(${moveX * 1.5}px, ${moveY * 1.5}px)`;
      }
    });
  });
}
