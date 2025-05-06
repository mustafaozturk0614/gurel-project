/**
 * GÜREL YÖNETİM - HEADER SCRIPT
 * Modern, performant header functionality with theme integration
 * Version 3.1 - 2024
 */

// Güvenlik için IIFE (Immediately Invoked Function Expression)
(function() {
  'use strict';
  
  // Hata yakalama ve izleme sistemi
  function setupErrorHandling() {
    try {
      window.addEventListener('error', function(e) {
        // Eklenti veya tarayıcı uzantısı kaynaklı hataları dikkate alma
        if (e.filename && (
          e.filename.includes('contentScript.bundle.js') || 
          e.filename.includes('chrome-extension')
        )) {
          console.debug('Header.js: Extension error ignored:', e.message);
          e.preventDefault();
          return true;
        }
      });
    } catch (err) {
      console.debug('Error tracking setup failed:', err);
    }
  }
  
  // Header bileşeninin tüm işlevselliğini yöneten ana sınıf
  class HeaderController {
    constructor() {
      // DOM Element Referansları
      this.header = document.querySelector('.patreon-header');
      if (!this.header) return; // Header yoksa işlemleri durdur
      
      this.navbar = this.header.querySelector('.navbar');
      this.navLinks = this.header.querySelectorAll('.nav-link');
      this.navIcons = this.header.querySelectorAll('.nav-icon');
      this.logo = this.header.querySelector('.navbar-brand');
      this.logoImage = this.header.querySelector('.header-logo');
      this.scrollProgressBar = this.header.querySelector('.scroll-progress-bar');
      this.ctaButton = this.header.querySelector('.header-button');
      this.menuToggler = this.header.querySelector('.navbar-toggler');
      this.menuCollapse = this.header.querySelector('.navbar-collapse');
      this.screenDarken = document.querySelector('.screen-darken');
      
      // Durum ve Ayarlar
      this.state = {
        lastScrollTop: 0,
        scrollTimer: null,
        isScrolling: false,
        scrollDirection: 'none',
        scrollDepth: 0,
        themeMode: document.documentElement.getAttribute('data-theme') || 'light',
        colorTheme: document.documentElement.getAttribute('data-color-theme') || 'blue',
        highContrast: document.documentElement.getAttribute('data-theme') === 'highContrast',
        reducedMotion: document.documentElement.getAttribute('data-reduced-motion') === 'true',
        isMobileMenuOpen: false,
        isPageLoaded: false
      };
      
      // Sayfanın yüklenme durumunu izle
      window.addEventListener('load', () => {
        this.state.isPageLoaded = true;
        setTimeout(() => this.refreshHeaderState(), 100);
      });
      
      // Başlangıç ayarları
      this.init();
    }
    
    /**
     * Başlangıç ayarlarını yap ve event listener'ları ekle
     */
    init() {
      // Header'ı hızlıca görünür yap - FOUC (Flash of Unstyled Content) önlemek için
      this.header.style.visibility = 'visible';
      this.header.style.opacity = '1';
      this.header.classList.add('visible');

      // Başlangıç durumlarını ayarla ve ilk kontrolleri yap
      this.setInitialState();
      
      // Event listener'ları ekle
      this.setupEventListeners();
      
      // Tema değişikliklerini izlemeyi başlat
      this.observeThemeChanges();
      
      // Scroll spy'ı başlat
      this.initScrollSpy();
      
      // Etkileşimleri kur
      this.setupInteractions();
    }
    
    /**
     * Başlangıç durumlarını ayarla
     */
    setInitialState() {
      // Sayfanın ilk yüklenmesinde mevcut scroll durumunu kontrol et
      const initialScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // DOM yüklendikten sonra header görünürlüğünü kesinleştirmek için kısa gecikme
      requestAnimationFrame(() => {
        if (initialScrollTop > 10) {
          // Scroll 0'dan büyükse, sayfa yenilendiğinde bile scroll durumunda görünsün
          this.header.classList.add('scrolled');
          this.header.classList.remove('transparent');
          
          // Header arkaplan rengi
          const theme = document.documentElement.getAttribute('data-theme') || 'light';
          const bgColor = theme === 'dark' ? 'var(--header-bg-dark)' : 
                          theme === 'highContrast' ? 'var(--header-bg-highcontrast)' : 
                          'var(--header-bg-light)';
          this.header.style.backgroundColor = bgColor;
          
          // Derin scroll durumu
          if (initialScrollTop > 300) {
            this.header.classList.add('mini-header');
          }
        } else {
          // Sayfa başındaysa transparan göster
          this.header.classList.add('transparent');
          this.header.classList.remove('scrolled', 'mini-header');
          
          // Header tamamen transparan
          this.header.style.backgroundColor = 'transparent';
          
          // Link ve butonlara transparan stiller
          this.navLinks.forEach(link => {
            link.style.color = 'var(--header-text-transparent)';
            link.style.textShadow = 'var(--header-text-shadow-transparent)';
          });
          
          if (this.logo) {
            this.logoImage.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))';
          }
        }
        
        // Progress bar'ı güncelle
        this.updateProgressBar();
        
        // Son scroll pozisyonunu kaydet
        this.state.lastScrollTop = initialScrollTop;
        
        // Header görünürlüğünü garantile
        this.header.style.visibility = 'visible';
        this.header.style.opacity = '1';
        this.header.classList.add('visible');
      });
    }
    
    /**
     * Header durumunu mevcut sayfaya göre yenile
     */
    refreshHeaderState() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.handleScrollEvents(scrollTop);
    }
    
    /**
     * Tüm gerekli event listener'ları ekle
     */
    setupEventListeners() {
      // Scroll event listener
      window.addEventListener('scroll', this.throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.handleScrollEvents(scrollTop);
      }, 10)); // 10ms throttle ile performansı artır
      
      // Resize event listener
      window.addEventListener('resize', this.debounce(() => {
        this.refreshHeaderState();
      }, 150)); // 150ms debounce ile performansı artır
    }
    
    /**
     * Tüm scroll olaylarını işle
     */
    handleScrollEvents(scrollTop) {
      // Header durumunu güncelle
      this.updateHeaderState(scrollTop);
      
      // Scroll yönünü belirle ve header pozisyonunu güncelle
      this.updateScrollDirection(scrollTop);
      
      // Progress bar'ı güncelle
      this.updateProgressBar();
      
      // Scroll spy güncelle
      this.checkActiveSection();
    }
    
    /**
     * Header durumunu scroll derinliğine göre güncelle
     */
    updateHeaderState(scrollTop) {
      // Sayfanın en başında - transparent durum
      if (scrollTop <= 10) {
        this.header.classList.add('transparent');
        this.header.classList.remove('scrolled', 'mini-header');
        this.header.style.backgroundColor = 'transparent';
        this.state.scrollDepth = 0;
        
        // Link ve butonlara transparan stiller
        this.navLinks.forEach(link => {
          link.style.color = 'var(--header-text-transparent)';
          link.style.textShadow = 'var(--header-text-shadow-transparent)';
        });
        
        if (this.logo) {
          this.logoImage.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))';
        }
      } else {
        // Sayfa kaydırıldı - scrolled durumu
        this.header.classList.remove('transparent');
        this.header.classList.add('scrolled');
        
        // Doğrudan header'a arkaplan rengi uygula - mevcut temaya göre
        this.updateThemeSpecificStyles();
        
        this.state.scrollDepth = scrollTop;
        
        // Derin scroll durumunda mini header'a geç
        if (scrollTop > 600) {
          this.header.classList.add('mini-header');
        } else {
          this.header.classList.remove('mini-header');
        }
      }
    }
    
    /**
     * Scroll yönünü ve header'ın gösterilme/gizlenme durumunu güncelle
     */
    updateScrollDirection(scrollTop) {
      const scrollDelta = Math.abs(scrollTop - this.state.lastScrollTop);
      const scrollingDown = scrollTop > this.state.lastScrollTop;
      
      // Scroll hızına göre animasyon süresini ayarla
      if (scrollDelta > 30) {
        this.header.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      } else {
        this.header.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      
      // En tepedeyse her zaman göster, scroll durumunda da headerı görünür tut
      if (scrollTop <= 10) {
        this.header.classList.remove('scroll-down', 'scroll-up');
      } else {
        // Header'ı her zaman görünür tutmak için scroll-up sınıfını ekle, scroll-down sınıfını kaldır
        this.header.classList.add('scroll-up');
        this.header.classList.remove('scroll-down');
        this.state.scrollDirection = scrollingDown ? 'down' : 'up';
      }
      
      // Son scroll pozisyonunu kaydet
      this.state.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      
      // Scroll durduktan sonra stil geçişlerini sıfırla
      clearTimeout(this.state.scrollTimer);
      this.state.scrollTimer = setTimeout(() => {
        this.header.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      }, 200);
    }
    
    /**
     * Progress bar durumunu güncelle
     */
    updateProgressBar() {
      if (!this.scrollProgressBar) return;
      
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      // Değeri güncelle ve animasyonla değiştir
      requestAnimationFrame(() => {
        this.scrollProgressBar.style.width = `${scrolled}%`;
        
        // Tamamlanmaya yaklaştıkça efekt ekle
        if (scrolled > 90) {
          this.scrollProgressBar.classList.add('glow-effect');
        } else {
          this.scrollProgressBar.classList.remove('glow-effect');
        }
      });
    }
    
    /**
     * Temaya özgü stilleri uygula
     */
    updateThemeSpecificStyles() {
      // Mevcut tema modunu ve renk varyasyonlarını al
      const theme = document.documentElement.getAttribute('data-theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      
      const colorTheme = document.documentElement.getAttribute('data-color-theme') || 'blue';
      
      this.state.themeMode = theme;
      this.state.colorTheme = colorTheme;
      this.state.highContrast = theme === 'highContrast';
      
      // Transparan durumdayken ek tema davranışları
      if (this.header.classList.contains('transparent')) {
        // Transparan durumdaki ek tema ayarları
        this.header.style.backgroundColor = 'transparent';
        
        // Link ve butonlara uygulanacak özel stiller
        this.navLinks.forEach(link => {
          link.style.color = 'var(--header-text-transparent)';
          link.style.textShadow = 'var(--header-text-shadow-transparent)';
        });
        
        if (this.logo) {
          this.logoImage.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))';
        }
      } else {
        // Scrolled durumdaki tema stillerine geri dön
        let bgColor;
        
        // Tema durumuna göre doğru arkaplan rengini belirle
        if (theme === 'dark') {
          bgColor = 'var(--header-bg-dark)';
        } else if (theme === 'highContrast') {
          bgColor = 'var(--header-bg-highcontrast)';
        } else {
          bgColor = 'var(--header-bg-light)';
        }
        
        // Header arkaplan rengini ayarla
        this.header.style.backgroundColor = bgColor;
        
        // Navbar link stillerini sıfırla
        this.navLinks.forEach(link => {
          link.style.color = '';
          link.style.textShadow = '';
        });
        
        if (this.logo) {
          this.logoImage.style.filter = '';
        }
      }
      
      // Renk varyasyonlarına göre buton stillerini ayarla
      if (this.ctaButton) {
        // Yüksek kontrast durumunda özel stil
        if (theme === 'highContrast') {
          this.ctaButton.style.background = '#ffff00';
          this.ctaButton.style.color = '#000000';
          this.ctaButton.style.border = '2px solid #ffffff';
          this.ctaButton.style.boxShadow = '0 0 0 2px #ffffff';
        } else {
          // Renk temasına göre gradient ayarla
          let gradient, boxShadow;
          
          switch (colorTheme) {
            case 'red':
              gradient = 'linear-gradient(45deg, var(--error-color), var(--error-light))';
              boxShadow = 'var(--header-button-shadow)';
              break;
            case 'green':
              gradient = 'linear-gradient(45deg, var(--success-color), var(--success-light))';
              boxShadow = 'var(--header-button-shadow)';
              break;
            case 'orange':
              gradient = 'linear-gradient(45deg, var(--secondary-color), var(--secondary-light))';
              boxShadow = 'var(--header-button-shadow)';
              break;
            case 'purple':
              gradient = 'linear-gradient(45deg, var(--purple-600, #7b1fa2), var(--purple-400, #9c27b0))';
              boxShadow = 'var(--header-button-shadow)';
              break;
            case 'teal':
              gradient = 'linear-gradient(45deg, var(--info-dark), var(--info-color))';
              boxShadow = 'var(--header-button-shadow)';
              break;
            case 'pink':
              gradient = 'linear-gradient(45deg, #d81b60, #ec407a)';
              boxShadow = 'var(--header-button-shadow)';
              break;
            default: // blue (default)
              gradient = 'linear-gradient(45deg, var(--primary-500), var(--primary-400))';
              boxShadow = 'var(--header-button-shadow)';
          }
          
          this.ctaButton.style.background = gradient;
          this.ctaButton.style.boxShadow = boxShadow;
          this.ctaButton.style.color = 'var(--header-button-text)';
          this.ctaButton.style.border = 'none';
        }
      }
    }
    
    /**
     * Tema değişikliklerini izle
     */
    observeThemeChanges() {
      // Theme değişimini gözlemlemek için MutationObserver
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-theme') {
            this.updateThemeSpecificStyles();
          } else if (mutation.attributeName === 'data-color-theme') {
            this.updateThemeSpecificStyles();
          } else if (mutation.attributeName === 'data-reduced-motion') {
            this.state.reducedMotion = document.documentElement.getAttribute('data-reduced-motion') === 'true';
          }
        });
      });
      
      // Tema ile ilgili öznitelikleri gözlemle
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-color-theme', 'data-reduced-motion']
      });
      
      // Sistem tercihi değişikliklerini izle
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeMediaQuery.addEventListener('change', () => {
        // Sadece sistemin tercihine göre çalışıyorsa (manuel tema ayarı yoksa)
        if (!document.documentElement.hasAttribute('data-theme')) {
          this.updateThemeSpecificStyles();
        }
      });
      
      // Reduced motion tercihini izle
      const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionMediaQuery.addEventListener('change', () => {
        if (!document.documentElement.hasAttribute('data-reduced-motion')) {
          this.state.reducedMotion = reducedMotionMediaQuery.matches;
        }
      });
    }
    
    /**
     * Scroll Spy fonksiyonu - aktif bölümü tespit et ve menüyü güncelle 
     */
    initScrollSpy() {
      // İlk yüklemede aktif bölümü kontrol et
      this.checkActiveSection();
    }
    
    /**
     * Aktif bölümü kontrol et ve ilgili menü öğesini işaretle
     */
    checkActiveSection() {
      const sections = document.querySelectorAll('section[id]');
      if (!sections.length || !this.navLinks.length) return;
      
      const scrollPosition = window.scrollY + 100; // Offset için biraz boşluk
      
      let currentSectionId = null;
      let lastSectionTop = 0;
      
      // Her bölümü kontrol et
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        // Scroll pozisyonu bölüm içindeyse veya son bölümse
        if ((scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) || 
            (sectionTop > lastSectionTop && !currentSectionId)) {
          currentSectionId = sectionId;
          lastSectionTop = sectionTop;
        }
      });
      
      // Eğer herhangi bir bölüm aktif değilse, sayfanın en üstündeyse ilk bölümü seç
      if (!currentSectionId && sections.length > 0 && scrollPosition < sections[0].offsetTop) {
        currentSectionId = sections[0].getAttribute('id');
      }
      
      // Tüm linklerden active sınıfını kaldır
      this.navLinks.forEach(link => link.classList.remove('active'));
      
      // Aktif bölüm varsa, ilgili menü öğesine active sınıfı ekle
      if (currentSectionId) {
        const activeLink = document.querySelector(`.nav-link[href="#${currentSectionId}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    }
    
    /**
     * Tüm etkileşimleri ayarla
     */
    setupInteractions() {
      this.setupMenuInteractions();
      this.setupLogoInteractions();
      this.setupMobileMenuInteractions();
      this.setupHeaderButtonInteractions();
    }
    
    /**
     * Menü öğeleri etkileşimlerini ayarla
     */
    setupMenuInteractions() {
      // Reduced motion tercihini kontrol et
      const useReducedMotion = this.state.reducedMotion || 
                              window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      this.navLinks.forEach(link => {
        // Hover efektleri - reduced motion desteği ile
        link.addEventListener('mouseenter', () => {
          if (!useReducedMotion) {
            link.style.transform = 'translateY(-2px)';
            
            const icon = link.querySelector('.nav-icon');
            if (icon) {
              icon.style.transform = 'scale(1.1)';
            }
          }
        });
        
        link.addEventListener('mouseleave', () => {
          link.style.transform = '';
          
          const icon = link.querySelector('.nav-icon');
          if (icon) {
            icon.style.transform = '';
          }
        });
        
        // Tıklama yönetimi - sayfa içi linkler için smooth scroll
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
              // Aktif sınıfı ekle
              this.navLinks.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
              
              // Mobil menüyü kapat
              if (window.innerWidth < 1200 && this.menuToggler && 
                  this.menuToggler.getAttribute('aria-expanded') === 'true') {
                setTimeout(() => this.menuToggler.click(), 150);
              }
              
              // Hedef elemana smooth scroll - reduced motion desteği ile
              const scrollBehavior = useReducedMotion ? 'auto' : 'smooth';
              
              window.scrollTo({
                top: targetElement.offsetTop - 80, // Header yüksekliği için offset
                behavior: scrollBehavior
              });
            }
          }
        });
      });
    }
    
    /**
     * Logo etkileşimlerini ayarla
     */
    setupLogoInteractions() {
      if (!this.logo || !this.logoImage) return;
      
      // Reduced motion tercihini kontrol et
      const useReducedMotion = this.state.reducedMotion || 
                              window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      this.logo.addEventListener('mouseenter', () => {
        if (!useReducedMotion) {
          this.logoImage.style.transform = 'scale(1.05)';
          this.logoImage.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
        }
      });
      
      this.logo.addEventListener('mouseleave', () => {
        this.logoImage.style.transform = '';
        this.logoImage.style.filter = '';
      });
      
      // Logo tıklandığında sayfanın başına git
      this.logo.addEventListener('click', (e) => {
        // Eğer link href="#" ise preventDefault yap
        if (this.logo.getAttribute('href') === '#') {
          e.preventDefault();
          
          // Hedef elemana smooth scroll - reduced motion desteği ile
          const scrollBehavior = useReducedMotion ? 'auto' : 'smooth';
          
          window.scrollTo({
            top: 0,
            behavior: scrollBehavior
          });
        }
      });
    }
    
    /**
     * Mobil menü etkileşimlerini ayarla
     */
    setupMobileMenuInteractions() {
      if (!this.menuToggler || !this.menuCollapse) return;
      
      // Menü açma/kapama durumlarını yönet
      this.menuToggler.addEventListener('click', () => {
        const isExpanded = this.menuToggler.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          // Menü kapanıyor
          if (this.screenDarken) this.screenDarken.classList.remove('active');
          document.body.classList.remove('menu-open');
          this.state.isMobileMenuOpen = false;
        } else {
          // Menü açılıyor
          if (this.screenDarken) this.screenDarken.classList.add('active');
          document.body.classList.add('menu-open');
          this.state.isMobileMenuOpen = true;
        }
      });
      
      // Karartma overlay'ine tıklandığında menüyü kapat
      if (this.screenDarken) {
        this.screenDarken.addEventListener('click', () => {
          if (this.menuToggler && this.menuToggler.getAttribute('aria-expanded') === 'true') {
            this.menuToggler.click();
          }
        });
      }
      
      // ESC tuşuna basıldığında menüyü kapat
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.isMobileMenuOpen) {
          if (this.menuToggler && this.menuToggler.getAttribute('aria-expanded') === 'true') {
            this.menuToggler.click();
          }
        }
      });
    }
    
    /**
     * Header buton etkileşimlerini ayarla
     */
    setupHeaderButtonInteractions() {
      if (!this.ctaButton) return;
      
      // Reduced motion tercihini kontrol et
      const useReducedMotion = this.state.reducedMotion || 
                              window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (useReducedMotion) {
        // Reduced motion durumunda animasyon efektlerini devre dışı bırak
        return;
      }
      
      // Mouse takibi efekti
      this.ctaButton.addEventListener('mousemove', (e) => {
        const rect = this.ctaButton.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        this.ctaButton.style.setProperty('--x-pos', x + '%');
        this.ctaButton.style.setProperty('--y-pos', y + '%');
      });
      
      // Tıklama dalgası efekti
      this.ctaButton.addEventListener('click', (e) => {
        const circle = document.createElement('span');
        const radius = Math.max(this.ctaButton.clientWidth, this.ctaButton.clientHeight);
        
        circle.style.width = circle.style.height = `${radius}px`;
        circle.style.left = `${e.clientX - this.ctaButton.getBoundingClientRect().left - radius/2}px`;
        circle.style.top = `${e.clientY - this.ctaButton.getBoundingClientRect().top - radius/2}px`;
        circle.classList.add('ripple');
        
        // Önceki ripple efektini temizle
        const oldRipple = this.ctaButton.querySelector('.ripple');
        if (oldRipple) oldRipple.remove();
        
        this.ctaButton.appendChild(circle);
        
        // Animasyon tamamlandıktan sonra temizle
        setTimeout(() => {
          circle.remove();
        }, 600);
      });
      
      // Sayfaya ilk yüklendiğinde dikkat çekmek için
      setTimeout(() => {
        this.ctaButton.classList.add('pulse-animation');
        
        // 5 saniye sonra pulsing'i durdur
        setTimeout(() => {
          this.ctaButton.classList.remove('pulse-animation');
        }, 5000);
      }, 2000);
    }
    
    /**
     * Throttle fonksiyonu - performans optimizasyonu için
     */
    throttle(callback, delay) {
      let lastCall = 0;
      return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
          return;
        }
        lastCall = now;
        return callback(...args);
      };
    }
    
    /**
     * Debounce fonksiyonu - performans optimizasyonu için
     */
    debounce(callback, delay) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), delay);
      };
    }
  }
  
  // DOM yüklendiğinde header kontrolcüsünü başlat
  document.addEventListener('DOMContentLoaded', function() {
    setupErrorHandling();
    
    // Header kontrolcüsünü başlat
    const headerController = new HeaderController();
    
    // Global olarak erişilebilir olması için
    window.headerController = headerController;
  });
})(); 