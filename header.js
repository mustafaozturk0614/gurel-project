/**
 * Gürel Yönetim - Header Bileşeni JS
 * Versiyon 4.0 - 2024
 * Yazarlar: Mustafa Öztürk
 * Tema Sistemine Tam Entegre
 */

document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initMobileMenu();
  initSectionScrollSpy();
  listenForThemeChanges(); // Tema değişikliklerini dinle
  initLogoEffects(); // Logo efektleri
});

function initHeader() {
  const header = document.querySelector('.patreon-header');
  if (!header) return;
  
  // Scroll olayları
  window.addEventListener('scroll', handleScroll);
  
  // İlk yükleme için header durumunu ayarla
  setTimeout(() => {
    handleScroll();
    header.classList.add('visible');
  }, 100);
  
  // Scroll progress bar
  initScrollProgressBar();
}

// Tema değişikliklerini dinle
function listenForThemeChanges() {
  // Tema modu değişikliklerini takip et (light, dark, highContrast)
  document.addEventListener('themeChanged', function(e) {
    const newTheme = e.detail.theme;
    
    // Header bileşenlerini yeni temaya göre güncelle
    updateHeaderForTheme(newTheme);
  });
  
  // Renk teması değişikliklerini takip et (blue, red, green vb.)
  document.addEventListener('colorThemeChanged', function(e) {
    const newColorTheme = e.detail.colorTheme;
    
    // Renk temasına göre header butonlarını güncelle
    updateHeaderForColorTheme(newColorTheme);
  });
  
  // Erişilebilirlik tercihlerini takip et
  document.addEventListener('accessibilityChanged', function(e) {
    const preferences = e.detail;
    
    // Erişilebilirlik tercihlerine göre header'ı güncelle
    updateHeaderForAccessibility(preferences);
  });
  
  // İlk yükleme için mevcut tema bilgilerini al
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const currentColorTheme = document.documentElement.getAttribute('data-color-theme') || 'default';
  
  // İlk yükleme tema uygulamaları
  updateHeaderForTheme(currentTheme);
  updateHeaderForColorTheme(currentColorTheme);
}

// Temaya göre header'ı güncelleme
function updateHeaderForTheme(theme) {
  const header = document.querySelector('.patreon-header');
  if (!header) return;
  
  // Tema tabanlı CSS değişkenlerini JS ile set etmeye gerek yok
  // Bunlar CSS'de data-theme attribute seçicileri ile otomatik uygulanacak
  
  // Tema bazlı özel işlemler (gerekli ise)
  if (theme === 'dark') {
    // Karanlık mod özel işlemleri
  } else if (theme === 'highContrast') {
    // Yüksek kontrast modu özel işlemleri
  } else {
    // Light tema (varsayılan) özel işlemleri
  }
}

// Renk temasına göre header'ı güncelleme
function updateHeaderForColorTheme(colorTheme) {
  // Renk teması değişikliği - özel JS işlemleri gerekirse
}

// Erişilebilirlik tercihlerine göre header'ı güncelleme
function updateHeaderForAccessibility(preferences) {
  const reducedMotion = preferences.reducedMotion || false;
  
  // Azaltılmış hareket tercihlerini uygula
  if (reducedMotion) {
    document.documentElement.setAttribute('data-reduced-motion', 'true');
  } else {
    document.documentElement.removeAttribute('data-reduced-motion');
  }
}

// Scroll olaylarını işle
function handleScroll() {
  const header = document.querySelector('.patreon-header');
  if (!header) return;
  
  const scrollY = window.scrollY;
  const threshold = 50;
  
  // Aşağı/yukarı scroll tespiti
  const currentScroll = window.pageYOffset;
  if (currentScroll <= threshold) {
    header.classList.remove('scrolled', 'mini-header', 'scroll-up', 'scroll-down');
    if (header.classList.contains('transparent')) {
      header.classList.add('transparent');
    }
  } else {
    header.classList.add('scrolled');
    header.classList.remove('transparent');
    
    // Yüksek scroll değerlerinde mini header
    if (scrollY > 300) {
      header.classList.add('mini-header');
    } else {
      header.classList.remove('mini-header');
    }
  }
}

// Scroll progress bar
function initScrollProgressBar() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;
  
  // Sayfa yüksekliği hesaplama
  function getDocumentHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  }
  
  // Scroll progress güncelleme
  function updateScrollProgress() {
    const windowScroll = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = getDocumentHeight();
    
    const totalScrollable = docHeight - windowHeight;
    const scrollPercentage = (windowScroll / totalScrollable) * 100;
    
    // Progress bar genişliğini güncelle
    progressBar.style.width = `${scrollPercentage}%`;
    
    // İsteğe bağlı glow efekti
    if (scrollPercentage > 0) {
      progressBar.classList.add('glow-effect');
        } else {
      progressBar.classList.remove('glow-effect');
    }
  }
  
  // Scroll olayı dinleme
  window.addEventListener('scroll', updateScrollProgress);
  
  // İlk yükleme için çağır
  updateScrollProgress();
}

// Mobil menüyü başlat
function initMobileMenu() {
  const hamburgerBtn = document.querySelector('.hamburger-menu');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileMenuCloseBtn = document.querySelector('.mobile-menu-close');
  const mobileMenuLinks = document.querySelectorAll('.mobile-nav-link');
  
  if (!hamburgerBtn || !mobileMenu || !mobileMenuOverlay) return;
  
  // Hamburger butonu tıklama
  hamburgerBtn.addEventListener('click', toggleMobileMenu);
  
  // Overlay tıklama ile kapatma
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  
  // Kapatma butonu
  if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
  }
  
  // Mobile menü linkleri ile kapatma ve ilgili bölüme scroll yapma
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      // Eğer link bir anchor (section) ise
      const href = this.getAttribute('href');
      
      // Animasyon için sınıf ekleme
      this.classList.add('clicked');
      
      if (href && href.startsWith('#')) {
        event.preventDefault(); // Varsayılan davranışı engelle
        
        const targetSection = document.querySelector(href);
        
        if (targetSection) {
          // Menüyü kapat
          closeMobileMenu();
          
          // Kısa bir gecikme ile scrollu gerçekleştir (menü kapanma animasyonu için)
          setTimeout(() => {
            // Offset hesaplama (header height göz önünde bulundurarak)
            const headerHeight = document.querySelector('.patreon-header').offsetHeight;
            const targetOffset = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            // Smooth scroll
            window.scrollTo({
              top: targetOffset,
              behavior: 'smooth'
            });
            
            // Gezinme geçmişini güncelle
            history.pushState(null, null, href);
          }, 400);
        }
      } else {
        // Normal link ise sadece menüyü kapat
        setTimeout(() => {
          closeMobileMenu();
        }, 300);
      }
    });
  });
  
  // Ekran boyutu değişimini izle
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1000) {
      closeMobileMenu();
    }
  });
  
  // ESC tuşu ile menüyü kapatma
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
  
  // HTML'e overflow-hidden ekleyen yardımcı fonksiyon
  function toggleBodyScroll(disableScroll) {
    if (disableScroll) {
      document.documentElement.classList.add('mobile-menu-open');
      document.body.classList.add('mobile-menu-open');
    } else {
      document.documentElement.classList.remove('mobile-menu-open');
      document.body.classList.remove('mobile-menu-open');
    }
  }
  
  // Mobil menüyü aç/kapat
  function toggleMobileMenu() {
    if (mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }
  
  // Mobil menüyü aç
  function openMobileMenu() {
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    
    // Önce overlay'i göster
    mobileMenuOverlay.classList.add('active');
    
    // Scroll'u devre dışı bırak - sayfa kaymayı önle
    toggleBodyScroll(true);
    
    // Sonra menüyü göster - 10ms gecikme ekleyerek CSS geçişinin düzgün çalışmasını sağla
    setTimeout(() => {
      mobileMenu.classList.add('active');
      
      // Animasyonlar için index ekle
      const navItems = document.querySelectorAll('.mobile-nav-item');
      navItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
      });
      
      // Animasyon tamamlandıktan sonra ARIA atributeleri güncelle
      setTimeout(() => {
        mobileMenu.setAttribute('aria-hidden', 'false');
      }, 500);
    }, 10);
  }
  
  // Mobil menüyü kapat
  function closeMobileMenu() {
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    
    // Önce menüyü gizle
    mobileMenu.classList.remove('active');
    
    // Scroll'u tekrar etkinleştir
    toggleBodyScroll(false);
    
    // Overlay'i animasyon tamamlandıktan sonra gizle
    setTimeout(() => {
      mobileMenuOverlay.classList.remove('active');
    }, 300);
    
    // ARIA atributeleri hemen güncelle
    mobileMenu.setAttribute('aria-hidden', 'true');
    
    // Link tıklama animasyonlarını temizle
    mobileMenuLinks.forEach(link => {
      link.classList.remove('clicked');
    });
  }
}

// Aktif menü öğesini güncelleme (Mobil ve Normal menü için)
function updateActiveNavItem() {
  // Tüm section elementlerini al
  const sections = document.querySelectorAll('section[id]');
  
  // Scroll pozisyonu al
  const scrollY = window.pageYOffset;
  
  // Header yüksekliğini al (offset hesaplamak için)
  const headerHeight = document.querySelector('.patreon-header')?.offsetHeight || 100;
  
  // Aktif bir bölüm var mı kontrolü
  let hasActiveSection = false;
  
  // Her section için kontrol et
  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - headerHeight - 100; // Header yüksekliği ve ek tolerans için çıkarma
    const sectionId = current.getAttribute('id');
    
    // Bu section görünür alanda mı?
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      hasActiveSection = true;
      
      // Desktop nav item
      document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
      
      // Mobil nav item
      document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.classList.remove('active', 'section-active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active', 'section-active');
        }
      });
    }
  });
  
  // Eğer aktif section yoksa ve sayfanın en üstündeyse
  if (!hasActiveSection && scrollY <= 100) {
    // İlk menü elemanını aktif et veya home/anasayfa elemanını bul
    const homeLink = document.querySelector('.navbar-nav .nav-link[href="#home"], .navbar-nav .nav-link[href="#"]');
    const mobilHomeLink = document.querySelector('.mobile-nav-link[href="#home"], .mobile-nav-link[href="#"]');
    
    if (homeLink) homeLink.classList.add('active');
    if (mobilHomeLink) mobilHomeLink.classList.add('active', 'section-active');
  }
}

// Sayfadaki section'ları izleme ve aktif menü öğelerini güncelleme
function initSectionScrollSpy() {
  // Sayfa yüklendiğinde aktif öğeyi kontrol et
  updateActiveNavItem();
  
  // Scroll olayını dinle
  window.addEventListener('scroll', function() {
    updateActiveNavItem();
  });
  
  // Sayfa yüklendiğinde URL hash kontrolü
  if (window.location.hash) {
    const targetSection = document.querySelector(window.location.hash);
    
    if (targetSection) {
      setTimeout(() => {
        const headerHeight = document.querySelector('.patreon-header')?.offsetHeight || 100;
        const targetOffset = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetOffset,
          behavior: 'smooth'
        });
      }, 500);
    }
  }
}

// Dil değiştirme fonksiyonu
function changeLang(lang) {
  // Dil değiştirme mantığını buraya ekleyebilirsiniz
  console.log(`Dil '${lang}' olarak değiştirildi`);
}

// Header üzerindeki butonlar için ripple efekti
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.header-button');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Azaltılmış hareket tercihi varsa efekti devre dışı bırak
      if (document.documentElement.getAttribute('data-reduced-motion') === 'true') return;
      
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      button.appendChild(ripple);
      
      // Temizlik
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
    
    // Mouse hareketi ile interaktif ışık efekti
    button.addEventListener('mousemove', function(e) {
      // Azaltılmış hareket tercihi varsa efekti devre dışı bırak
      if (document.documentElement.getAttribute('data-reduced-motion') === 'true') return;
      
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      button.style.setProperty('--x-pos', x + 'px');
      button.style.setProperty('--y-pos', y + 'px');
    });
  });
});

// Logo için özel efektler
function initLogoEffects() {
  const logo = document.querySelector('.header-logo');
  const brand = document.querySelector('.navbar-brand');
  
  if (!logo || !brand) return;

  // Tooltip mesajını ekle
  brand.setAttribute('data-tooltip', 'Logoyu büyütmek için çift tıklayın');

  // Gelişmiş hover efektleri için mouse takibi
  brand.addEventListener('mousemove', function(e) {
    // Reduced motion tercihini kontrol et
    if (document.documentElement.getAttribute('data-reduced-motion') === 'true') return;
    
    const rect = brand.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Merkeze göre konumu hesapla (-1 ile 1 arasında değerler)
    const centerX = mouseX / rect.width * 2 - 1; 
    const centerY = mouseY / rect.height * 2 - 1;
    
    // 3D döndürme efekti - hafif
    logo.style.transform = `scale(1.15) perspective(800px) rotateY(${centerX * 5}deg) rotateX(${-centerY * 5}deg)`;
    
    // Parlaklık ve gölge efektlerini ayarla
    const distance = Math.sqrt(centerX * centerX + centerY * centerY);
    const brightness = 1.05 + distance * 0.1; // 1.05 - 1.15 arası
    
    logo.style.filter = `drop-shadow(${centerX * 8}px ${centerY * 8}px 12px rgba(0,0,0,0.3)) brightness(${brightness})`;
  });
  
  // Mouse ayrıldığında efektleri sıfırla
  brand.addEventListener('mouseleave', function() {
    logo.style.transform = '';
    logo.style.filter = '';
  });
  
  // Opsiyonel: Logo üzerine çift tıklandığında tam ekran gösterme
  logo.addEventListener('dblclick', function(e) {
    e.preventDefault();
    
    // Tam ekran logosu için geçici bir overlay oluştur
    const overlay = document.createElement('div');
    overlay.className = 'logo-fullscreen-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(5px);
    `;
    
    // Overlay'a büyük logo ekle
    const fullLogo = document.createElement('img');
    fullLogo.src = logo.src;
    fullLogo.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      transform: scale(0.9);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      filter: drop-shadow(0 8px 25px rgba(0,0,0,0.4));
    `;
    
    // Kapat butonu
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255,255,255,0.2);
      color: #fff;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;
    
    // Kapatma fonksiyonu
    const closeOverlay = () => {
      fullLogo.style.transform = 'scale(0.8)';
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    };
    
    // Overlay'a herhangi bir yere tıklandığında kapat
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeOverlay();
    });
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeOverlay();
    }, { once: true });
    
    // Kapat butonuyla kapatma
    closeBtn.addEventListener('click', closeOverlay);
    
    // DOM'a ekle
    overlay.appendChild(fullLogo);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    // Animasyon için timeout
    setTimeout(() => {
      overlay.style.opacity = '1';
      fullLogo.style.transform = 'scale(1)';
    }, 50);
  });
}

// Logo hover durumunda ses efekti
document.addEventListener('DOMContentLoaded', function() {
  const logo = document.querySelector('.header-logo');
  if (!logo) return;
  
  // Hover durumunu algıla
  logo.addEventListener('mouseenter', function() {
    // Hover sesi - isteğe bağlı
    /* 
    const hoverSound = new Audio('assets/sounds/hover.mp3');
    hoverSound.volume = 0.1;
    hoverSound.play();
    */
  });
}); 