/**
 * Gürel Yönetim - Ana JavaScript Dosyası
 */

// Sabitler
const SETTINGS = {
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
    zoom: 15
  }
};

// Harita koordinatları
const MAP_COORDINATES = {
  Edremit: { lat: 39.592450, lng: 27.016894, top: '48%', left: '52%' },
  Akçay: { lat: 39.592450, lng: 27.016894, top: '45%', left: '48%' },
  Güre: { lat: 39.592450, lng: 27.016894, top: '42%', left: '54%' },
  Burhaniye: { lat: 39.592450, lng: 27.016894, top: '52%', left: '56%' },
  Altınoluk: { lat: 39.592450, lng: 27.016894, top: '40%', left: '43%' }
};

// Harita bölgesi için koordinatlar ve pin pozisyonları
const MAP_POSITIONS = {
    'Edremit': { 
        top: '50%', 
        left: '50%' 
    },
    'Akçay': { 
        top: '45%', 
        left: '35%' 
    },
    'Güre': { 
        top: '42%', 
        left: '30%' 
    },
    'Burhaniye': { 
        top: '65%', 
        left: '55%' 
    },
    'Altınoluk': { 
        top: '35%', 
        left: '25%' 
    }
};

// Harita bölgesi için koordinatlar
const MAP_LOCATIONS = {
    'Edremit': {
        lat: 39.592450,
        lng: 27.016894,
        zoom: 16
    },
    'Akçay': {
        lat: 39.592450,  // Gürel Yönetim ofis konumu
        lng: 27.016894,  // Haritada sadece pin noktası değişecek
        zoom: 16
    },
    'Güre': {
        lat: 39.592450,  // Gürel Yönetim ofis konumu
        lng: 27.016894,  // Haritada sadece pin noktası değişecek
        zoom: 16
    },
    'Burhaniye': {
        lat: 39.592450,  // Gürel Yönetim ofis konumu
        lng: 27.016894,  // Haritada sadece pin noktası değişecek
        zoom: 16
    },
    'Altınoluk': {
        lat: 39.592450,  // Gürel Yönetim ofis konumu
        lng: 27.016894,  // Haritada sadece pin noktası değişecek
        zoom: 16
    }
};

// Ana başlatma işlevi
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

// Tüm modülleri başlatan ana fonksiyon
function initApp() {
  // UI Bileşenleri
  initHeaderSystem();
  initTabSystem();
  initServiceAnimations();
  initModernHero();
  initParallaxEffects();
  initTiltEffects();
  initCounters();
  
  // İşlevsel Bileşenler
  initFormValidation();
  initMapFeatures();
  
  // Ek Özellikler
  initScrollEvents();
  updateCopyrightYear();
  
  // AOS Animasyon Kütüphanesi
  if (typeof AOS !== 'undefined') {
    AOS.init(SETTINGS.animation);
  }
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
  const updateHeader = () => {
    const scrollTop = window.scrollY;
    const isScrolled = scrollTop > SETTINGS.scroll.threshold;
    const opacity = Math.min(scrollTop / SETTINGS.scroll.threshold * SETTINGS.scroll.headerOpacity, SETTINGS.scroll.headerOpacity);
    const blur = Math.min(scrollTop / SETTINGS.scroll.threshold * SETTINGS.scroll.blurAmount, SETTINGS.scroll.blurAmount);
    
    header.classList.toggle('scrolled', isScrolled);
    
    if (header.classList.contains('transparent')) {
      header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      header.style.backdropFilter = `blur(${blur}px)`;
    } else {
      header.style.backgroundColor = isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent';
    }
    
    // Aktif menü öğesini güncelle
    updateActiveNavItem();
  };
  
  // İlk yükleme için header durumunu ayarla
  updateHeader();
  
  // Scroll olayını dinle
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateHeader);
  });
  
  // Navbar toggle işlevi
  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', () => {
      const expanded = navbarToggler.getAttribute('aria-expanded') === 'true';
      navbarToggler.setAttribute('aria-expanded', String(!expanded));
      navbarCollapse.classList.toggle('show', !expanded);
      document.body.classList.toggle('menu-open', !expanded);
      
      // Menü açıldığında headerin görünümünü ayarla
      if (!expanded && window.innerWidth < 992) {
        header.classList.remove('transparent');
        header.classList.add('scrolled');
      } else if (window.scrollY <= SETTINGS.scroll.threshold) {
        header.classList.add('transparent');
        header.classList.remove('scrolled');
      }
    });
    
    // Menüde bir öğeye tıklandığında menüyü kapat
    document.querySelectorAll('.nav-link, .header-button').forEach(link => {
      link.addEventListener('click', () => {
        if (navbarCollapse.classList.contains('show')) {
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
      if (navbarCollapse.classList.contains('show') && 
          !navbarCollapse.contains(e.target) && 
          !navbarToggler.contains(e.target)) {
        navbarCollapse.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        
        // Header durumunu güncelle
        if (window.scrollY <= SETTINGS.scroll.threshold) {
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
    }
  });
  
  navItems.forEach(item => {
    item.classList.remove('active');
    const href = item.getAttribute('href');
    if (href && href.includes('#') && href.substr(href.indexOf('#') + 1) === currentSection) {
      item.classList.add('active');
    }
  });
  
  // Eğer hiçbir bölüm aktif değilse ve sayfa başındaysak, Ana Sayfa linkini aktif yap
  if (!currentSection && window.scrollY < 100) {
    const homeLink = document.querySelector('.patreon-header .nav-link[href="#home"], .patreon-header .nav-link[href="#"]');
    if (homeLink) {
      homeLink.classList.add('active');
    }
  }
}

/**
 * Tab Sistemi
 */
function initTabSystem() {
  // Hero alanı tab sistemini başlat
  const tabElms = document.querySelectorAll('#serviceTabList [data-bs-toggle="tab"]');
  tabElms.forEach((tabElm, idx, tabElmsArr) => {
    tabElm.addEventListener('click', function(e) {
      e.preventDefault();
      // Tüm hero tablarını pasif yap
      tabElmsArr.forEach(t => {
        t.classList.remove('active');
        const tabPane = document.querySelector(t.getAttribute('data-bs-target'));
        if (tabPane) {
          tabPane.classList.remove('show', 'active');
        }
      });
      // Tıklanan hero tabını aktif yap
      this.classList.add('active');
      const target = document.querySelector(this.getAttribute('data-bs-target'));
      if (target) {
        target.classList.add('show', 'active');
        animateCards(target);
      }
    });
    // Klavye navigasyonu: Ok tuşları/Home/End ile sekme değiştirme
    tabElm.addEventListener('keydown', function(e) {
      let newIndex;
      switch (e.key) {
        case 'ArrowRight': newIndex = (idx + 1) % tabElmsArr.length; break;
        case 'ArrowLeft': newIndex = (idx - 1 + tabElmsArr.length) % tabElmsArr.length; break;
        case 'Home': newIndex = 0; break;
        case 'End': newIndex = tabElmsArr.length - 1; break;
        default: return;
      }
      e.preventDefault();
      tabElmsArr[newIndex].focus();
      tabElmsArr[newIndex].click();
    });
  });
  
  // Servis kategorisi sekmelerini başlat
  const serviceTabs = document.querySelectorAll('.service-category-tabs .nav-link');
  if (serviceTabs.length) {
    serviceTabs.forEach((tab, idx, serviceTabsArr) => {
      tab.addEventListener('click', function() {
        serviceTabsArr.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const targetId = this.getAttribute('data-bs-target').replace('#', '');
        // Sadece servis bölümündeki panelleri seç
        const tabContentContainer = document.querySelector('.service-category-tabs + .tab-content');
        if (!tabContentContainer) return;
        const tabPanes = tabContentContainer.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
          pane.classList.remove('show', 'active');
          if (pane.id === targetId) {
            pane.classList.add('show', 'active');
            animateCards(pane);
          }
        });
      });
      // Klavye ile sekme açma: Enter veya Space
      tab.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
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
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + (index * 100));
  });
}

/**
 * Servis Animasyonları
 */
function initServiceAnimations() {
  const cards = document.querySelectorAll('.services-section .service-card');
  if (!cards.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  cards.forEach(card => {
    card.classList.add('not-visible');
    observer.observe(card);
  });
  
  // Kart tıklama dalgalanma efekti
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('div');
      ripple.classList.add('ripple-effect');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/**
 * Modern Hero Özellikleri
 */
function initModernHero() {
  // Paralaks efekti (masaüstü için)
    if (window.innerWidth > 1199) {
        document.addEventListener('mousemove', (e) => {
            const layers = document.querySelectorAll('.parallax-layer');
            const pageX = e.clientX;
            const pageY = e.clientY;
            
            layers.forEach(layer => {
        const speed = layer.getAttribute('data-depth') || 0.05;
                const x = (window.innerWidth - pageX * speed) / 100;
                const y = (window.innerHeight - pageY * speed) / 100;
                layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
            });
        });
    }
    
  // 3D kart efekti (masaüstü için)
    const card = document.querySelector('.hero-3d-card');
    if (card && window.innerWidth > 1199) {
        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const mouseX = e.clientX - cardCenterX;
            const mouseY = e.clientY - cardCenterY;
            
            // Dönüş hassasiyetini azaltmak için bölücüyü büyüt
            const rotateX = -mouseY / 20;
            const rotateY = mouseX / 20;
            
      const cardWrapper = card.querySelector('.card-3d-wrapper');
      if (cardWrapper) {
        cardWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
        // Derinlik efekti
            const items = card.querySelectorAll('.service-icon, h4, p');
            items.forEach((item, index) => {
                const depth = index * 0.5 + 2;
                item.style.transform = `translateZ(${depth}px)`;
            });
      }
        });
        
        card.addEventListener('mouseleave', () => {
      const cardWrapper = card.querySelector('.card-3d-wrapper');
      if (cardWrapper) {
        cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
            
        // Derinliği sıfırla
            const items = card.querySelectorAll('.service-icon, h4, p');
            items.forEach(item => {
                item.style.transform = 'translateZ(0px)';
            });
      }
    });
  }
  
  // VanillaTilt ile 3D efektler
  if (window.VanillaTilt && document.querySelector('.hero-3d-card')) {
    VanillaTilt.init(document.querySelector('.hero-3d-card'), {
      max: 10,
      speed: 300,
      glare: true,
      "max-glare": 0.2,
      gyroscope: true
    });
  }
  
  // Video lazy loading
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    const loadVideo = () => {
      if (heroVideo.getAttribute('data-loaded') === 'true') return;
      heroVideo.setAttribute('data-loaded', 'true');
      heroVideo.load();
      heroVideo.play();
    };
    
    // IntersectionObserver API ile görüntüye girdiğinde yükle
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadVideo();
          observer.unobserve(heroVideo);
        }
      });
    });
    
    observer.observe(heroVideo);
    
    // Yedek olarak kullanıcı etkileşimi durumunda yükle
    window.addEventListener('scroll', loadVideo, {once: true});
    window.addEventListener('mousemove', loadVideo, {once: true});
    window.addEventListener('touchstart', loadVideo, {once: true});
  }
  
  // Scroll göstergesi
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        window.addEventListener('scroll', () => {
      scrollIndicator.classList.toggle('hidden', window.scrollY > 300);
    });
  }
}

/**
 * Paralaks Efektleri
 */
function initParallaxEffects() {
  // Parallax elementlerini güncelle
  const updateParallaxElements = () => {
    const scrollTop = window.scrollY;
    const elements = {
      '.hero-wave-transition': { transform: `translateY(${scrollTop * 0.02}px) scale(1.02)` },
      '.floating-feature-card': { transform: `translateY(${scrollTop * -0.03}px)` }
    };
    
    Object.entries(elements).forEach(([selector, styles]) => {
      const element = document.querySelector(selector);
      if (element) {
        Object.assign(element.style, styles);
      }
    });
  };
  
  // Scroll olayını dinle
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateParallaxElements);
  });
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
  const contactForm = document.getElementById('contactForm');
  
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Tüm form alanlarını al
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const phoneInput = document.getElementById('phoneInput');
    const serviceSelect = document.getElementById('serviceSelect');
    const messageInput = document.getElementById('messageInput');
    
    // Doğrulama fonksiyonu
    const isValid = validateForm(nameInput, emailInput, phoneInput, serviceSelect, messageInput);
    
    if (isValid) {
      // Form geçerliyse gönderme işlemini gerçekleştir
      submitForm(contactForm);
    }
  });
  
  // Form ikonları animasyonu
  const formControls = document.querySelectorAll('.form-control, .form-select');
  formControls.forEach(input => {
    ['focus', 'blur'].forEach(eventType => {
      input.addEventListener(eventType, () => {
        const icon = input.parentElement.querySelector('.form-icon');
        icon?.classList.toggle('active-icon', eventType === 'focus');
      });
    });
  });
}

/**
 * Form doğrulama işlevi
 */
function validateForm(nameInput, emailInput, phoneInput, serviceSelect, messageInput) {
  let isValid = true;
  
  // Hata mesajlarını temizle
  clearErrors();
  
  // Ad Soyad doğrulama
  if (!nameInput.value.trim()) {
    showError(nameInput, 'Ad Soyad alanı zorunludur');
    isValid = false;
  } else if (nameInput.value.trim().length < 3) {
    showError(nameInput, 'Ad Soyad en az 3 karakter olmalıdır');
    isValid = false;
  }
  
  // Email doğrulama
  if (!emailInput.value.trim()) {
    showError(emailInput, 'E-posta alanı zorunludur');
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, 'Geçerli bir e-posta adresi giriniz');
    isValid = false;
  }
  
  // Telefon doğrulama
  if (!phoneInput.value.trim()) {
    showError(phoneInput, 'Telefon alanı zorunludur');
    isValid = false;
  } else if (!isValidPhone(phoneInput.value)) {
    showError(phoneInput, 'Geçerli bir telefon numarası giriniz');
    isValid = false;
  }
  
  // Hizmet seçimi doğrulama
  if (!serviceSelect.value) {
    showError(serviceSelect, 'Lütfen bir hizmet seçiniz');
    isValid = false;
  }
  
  // Mesaj doğrulama
  if (!messageInput.value.trim()) {
    showError(messageInput, 'Mesaj alanı zorunludur');
    isValid = false;
  } else if (messageInput.value.trim().length < 10) {
    showError(messageInput, 'Mesajınız en az 10 karakter olmalıdır');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Form yardımcı işlevleri
 */
function showError(input, message) {
  const errorElement = input.parentElement.querySelector('.error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    input.classList.add('is-invalid');
  }
}

function clearErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  const invalidInputs = document.querySelectorAll('.is-invalid');
  
  errorElements.forEach(elem => {
    elem.textContent = '';
    elem.style.display = 'none';
  });
  
  invalidInputs.forEach(input => {
    input.classList.remove('is-invalid');
  });
}

function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
}

function isValidPhone(phone) {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
}

function submitForm(form) {
  // Form verilerini al
  const formData = new FormData(form);
  const formObject = {};
  
  // FormData'yı objeye dönüştür
  formData.forEach((value, key) => {
    formObject[key] = value;
  });
  
  // SweetAlert2 varsa yükleniyor göster
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
    
    // Simüle edilmiş gönderim
    setTimeout(() => {
      form.reset();
      
      Swal.fire({
        title: 'Teşekkürler!',
        text: 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.',
        icon: 'success',
        confirmButtonText: 'Tamam'
      });
    }, 1500);
  } else {
    // SweetAlert2 yoksa normal alert göster
    alert('Mesajınız gönderiliyor...');
    
    setTimeout(() => {
      form.reset();
      alert('Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.');
    }, 1500);
  }
}

/**
 * Harita Özellikleri
 */
function initMapFeatures() {
    const regionTags = document.querySelectorAll('.region-tag');
    const mapContainer = document.querySelector('.map-container');
    
  if (!regionTags || !regionTags.length || !mapContainer) return;
    
    // Bölge etiketlerine tıklama olayı ekle
    regionTags.forEach(tag => {
        if (tag.dataset.region) {
            tag.addEventListener('click', function() {
                // Aktif sınıfını kaldır
                regionTags.forEach(t => t.classList.remove('active'));
                // Tıklanan etikete aktif sınıfı ekle
                this.classList.add('active');
                
                // Pin'i hareket ettir
                positionPinByRegion(this.dataset.region);
                
                // Bölge bilgilerini güncelle
                updateRegionInfo(this.dataset.region);
                
                // Harita animasyonu
                mapContainer.classList.add('animate-map');
                setTimeout(() => {
                    mapContainer.classList.remove('animate-map');
                }, 500);
            });
        }
    });
    
    // İlk bölgeyi aktif et
    if (regionTags.length > 0 && regionTags[0].dataset.region) {
        regionTags[0].classList.add('active');
        positionPinByRegion(regionTags[0].dataset.region);
    updateRegionInfo(regionTags[0].dataset.region);
  }
  
  // Map expand button - modal harita işlevi
  const mapExpandButton = document.querySelector('.map-expand-button');
  if (mapExpandButton && typeof bootstrap !== 'undefined') {
    mapExpandButton.addEventListener('click', function() {
      const mapModal = new bootstrap.Modal(document.getElementById('mapModal'));
      if (mapModal) {
        mapModal.show();
      }
    });
  }
  
  // Tooltip ekleme
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    regionTags.forEach(tag => {
      const region = tag.getAttribute('data-region');
      const tooltipContent = `${region} bölgesi hizmet alanımız`;
      
      new bootstrap.Tooltip(tag, {
        title: tooltipContent,
        placement: 'top',
        trigger: 'hover'
      });
    });
  }
}

/**
 * Harita pin pozisyonu ve bölge bilgileri
 */
function positionPinByRegion(regionName) {
    const pinMarker = document.querySelector('.map-pin-marker');
    if (!pinMarker) return;
    
  const position = MAP_COORDINATES[regionName] || MAP_COORDINATES['Edremit'];
    
    // Pin konumunu güncelle
    pinMarker.style.top = position.top;
    pinMarker.style.left = position.left;
    
    // Pin animasyonu
    pinMarker.classList.add('pin-bounce');
    setTimeout(() => {
        pinMarker.classList.remove('pin-bounce');
    }, 1000);
}

function updateRegionInfo(regionName) {
    const infoContainer = document.querySelector('.location-details');
    if (!infoContainer) return;
    
    // Bölge bilgileri
    const regionInfo = {
        'Edremit': {
            title: 'Edremit',
            address: 'Gürel Apartman ve Site Yönetimi, Akçay Mah. Güven Yolu No:5, Edremit/Balıkesir',
            properties: '120+ Yönetilen Mülk',
            service: 'Tüm Yönetim Hizmetleri'
        },
        'Akçay': {
            title: 'Akçay',
            address: 'Akçay, Edremit/Balıkesir',
            properties: '85+ Yönetilen Mülk',
            service: 'Site ve Apartman Yönetimi'
        },
        'Güre': {
            title: 'Güre',
            address: 'Güre, Edremit/Balıkesir',
            properties: '60+ Yönetilen Mülk',
            service: 'Site ve Apartman Yönetimi'
        },
        'Burhaniye': {
            title: 'Burhaniye',
            address: 'Burhaniye/Balıkesir',
            properties: '40+ Yönetilen Mülk',
            service: 'Site Yönetimi'
        },
        'Altınoluk': {
            title: 'Altınoluk',
            address: 'Altınoluk, Edremit/Balıkesir',
            properties: '50+ Yönetilen Mülk',
            service: 'Site ve Apartman Yönetimi'
        }
    };
    
    const info = regionInfo[regionName] || regionInfo['Edremit'];
    
    // Bilgileri HTML'e yerleştir
    infoContainer.innerHTML = `
        <div class="location-item">
            <div class="icon-box">
                <i class="fas fa-map-marker"></i>
            </div>
            <div class="location-text">
                <h5>${info.title}</h5>
                <p>${info.address}</p>
            </div>
        </div>
        <div class="location-item">
            <div class="icon-box">
                <i class="fas fa-building"></i>
            </div>
            <div class="location-text">
                <h5>Hizmet Alanı</h5>
                <p>${info.properties}</p>
                <p>${info.service}</p>
            </div>
        </div>
    `;
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
