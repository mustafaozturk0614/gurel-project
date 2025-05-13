/**
 * Tema Yöneticisi - Gürel Yönetim
 * Sürüm: 4.1.0
 * 
 * Sitenin tema ve görünüm ayarlarını yöneten sınıf.
 * Bu sınıf, kullanıcı tema tercihlerini yönetir, localStorage'a kaydeder 
 * ve HTML elementlerine CSS değişkenleri aracılığıyla uygular.
 */

import ThemeUtils from './theme-utils.js';

class ThemeManager {
  constructor(options = {}) {
    // Renk değerleri - theme-variables.css ile senkronize
    this.colorValues = {
      blue: '#0055a4',    // Varsayılan ana renk
      green: '#188038',   // Çevre dostu tema
      red: '#d93025',     // Uyarı/hata temaları için
      orange: '#ea8600',  // Sıcak turuncu tema
      purple: '#7b1fa2',  // Yaratıcılık teması
      teal: '#009688',    // Ferah tema
      pink: '#e91e63'     // Modern tema
    };
    
    // Varsayılan ayarlar
    this.defaults = {
      themeMode: 'system',      // 'light', 'dark', 'auto', 'system'
      colorTheme: 'blue',       // Anarenk teması (yukarıdaki renklerden biri)
      contrastLevel: 0,         // 0-3 (normal, hafif, orta, yüksek)
      fontSizePercent: 100,     // Yüzde olarak font boyutu
      reducedMotion: false,     // Azaltılmış hareket
      dayStartHour: 6,          // Otomatik tema için gündüz başlangıç saati
      dayEndHour: 19,           // Otomatik tema için gündüz bitiş saati
      debug: false,             // Debug modu
      animatedTransitions: true // Zarif geçişler için animasyon desteği
    };
    
    // Kullanıcı ayarları ve varsayılanları birleştir
    this.settings = {
      ...this.defaults,
      ...options
    };
    
    // Media Query dinleyicileri
    this.mediaQueries = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(forced-colors: active)')
    };
    
    // Olay dinleyicileri
    this.eventListeners = {};
    
    // Mevcut tema mod durumu
    this.currentThemeMode = '';
    
    // İnitialize
    this.init();
  }
  
  /**
   * Tema yöneticisini başlatır
   */
  init() {
    // LocalStorage'dan ayarları yükle
    this.loadSettings();
    
    // Tema değişiminde geçiş efekti ekle (theme-animations.css ile uyumlu)
    document.documentElement.classList.add('theme-transition');
    
    // Olay dinleyicilerini oluştur
    this.setupEventListeners();
    
    // Tema modunu başlat
    this.initThemeMode();
    
    // Renk temasını uygula
    this.applyColorTheme(this.settings.colorTheme);
    
    // Kontrast seviyesini uygula
    this.applyContrastLevel(this.settings.contrastLevel);
    
    // Font boyutunu uygula
    this.applyFontSize(this.settings.fontSizePercent);
    
    // Azaltılmış hareket ayarını kontrol et
    this.applyReducedMotion(this.settings.reducedMotion);
    
    // Global erişim için window nesnesine ekle
    window.themeManager = this;
    
    // İnitializasyon tamamlandı
    this.log('ThemeManager başarıyla başlatıldı:', this.settings);
    this.emit('initialized', this.settings);
    
    // İnitializasyon flag'i (diğer modüllerin kontrol edebilmesi için)
    window.__themeManagerInitialized = true;
  }
  
  /**
   * Kullanıcı ayarlarını localStorage'dan yükler
   */
  loadSettings() {
    try {
      // localStorage'dan kayıtlı tema ayarlarını al
      const themeMode = ThemeUtils.getFromStorage('themeMode', this.defaults.themeMode);
      const colorTheme = ThemeUtils.getFromStorage('colorTheme', this.defaults.colorTheme);
      const contrastLevel = parseInt(ThemeUtils.getFromStorage('contrastLevel', this.defaults.contrastLevel));
      const fontSizePercent = parseInt(ThemeUtils.getFromStorage('fontSizePercent', this.defaults.fontSizePercent));
      const reducedMotion = ThemeUtils.getFromStorage('reducedMotion') === 'true';
      
      // Ayarları güncelle - geçerli değerleri kontrol ederek
      if (['light', 'dark', 'auto', 'system'].includes(themeMode)) {
        this.settings.themeMode = themeMode;
      }
      
      if (Object.keys(this.colorValues).includes(colorTheme)) {
        this.settings.colorTheme = colorTheme;
      }
      
      if (!isNaN(contrastLevel) && contrastLevel >= 0 && contrastLevel <= 3) {
        this.settings.contrastLevel = contrastLevel;
      }
      
      if (!isNaN(fontSizePercent) && fontSizePercent >= 80 && fontSizePercent <= 150) {
        this.settings.fontSizePercent = fontSizePercent;
      }
      
      // Sistem ayarını oku
      if (typeof reducedMotion === 'boolean') {
        this.settings.reducedMotion = reducedMotion;
      } else {
        this.settings.reducedMotion = this.mediaQueries.reducedMotion.matches;
      }
      
      this.log('Ayarlar başarıyla yüklendi:', this.settings);
      this.emit('settingsLoaded', this.settings);
    } catch (error) {
      console.error('Tema ayarları yüklenirken hata oluştu:', error);
      // Hata durumunda varsayılanları kullan
    }
  }
  
  /**
   * Tema ayarlarını localStorage'a kaydeder
   */
  saveSettings() {
    try {
      // Ayarları localStorage'a kaydet
      Object.entries(this.settings).forEach(([key, value]) => {
        if (['themeMode', 'colorTheme', 'contrastLevel', 'fontSizePercent', 'reducedMotion'].includes(key)) {
          ThemeUtils.saveToStorage(key, value.toString());
        }
      });
      
      this.log('Ayarlar başarıyla kaydedildi:', this.settings);
      this.emit('settingsSaved', this.settings);
      return true;
    } catch (error) {
      console.error('Tema ayarları kaydedilirken hata oluştu:', error);
      return false;
    }
  }
  
  /**
   * Olay dinleyicilerini ayarlar
   */
  setupEventListeners() {
    // Sistem teması değişikliklerini dinle
    this.mediaQueries.darkMode.addEventListener('change', this.handleSystemThemeChange.bind(this));
    
    // Sistem animasyon tercihlerini dinle
    this.mediaQueries.reducedMotion.addEventListener('change', this.handleReducedMotionChange.bind(this));
    
    // Sayfa yüklenme/yükleme olayını dinle
    window.addEventListener('load', () => {
      // Geçişleri etkinleştir (sayfa tamamen yüklendikten sonra)
      document.documentElement.classList.add('theme-transition');
      
      // Auto tema için saat değişimi kontrolü - her dakika kontrol et
      if (this.settings.themeMode === 'auto') {
        setInterval(() => {
          const isDayTime = ThemeUtils.isDayTime(
            this.settings.dayStartHour, 
            this.settings.dayEndHour
          );
          this.applyAutoTheme(isDayTime);
        }, 60000); // 1 dakika
      }
      
      this.emit('pageLoaded');
    });
    
    // Sayfa düzeni değişikliklerini yakala
    window.addEventListener('resize', ThemeUtils.debounce(() => {
      this.emit('layoutChanged');
    }, 250));
    
    // LocalStorage değişikliklerini dinle (farklı sekmeler arası senkronizasyon için)
    window.addEventListener('storage', (event) => {
      if (['themeMode', 'colorTheme', 'contrastLevel', 'fontSizePercent', 'reducedMotion'].includes(event.key)) {
        this.loadSettings();
        this.initThemeMode();
        this.applyColorTheme(this.settings.colorTheme);
        this.applyContrastLevel(this.settings.contrastLevel);
        this.applyFontSize(this.settings.fontSizePercent);
        this.applyReducedMotion(this.settings.reducedMotion);
        this.emit('settingsChanged', this.settings);
      }
    });
  }
  
  /**
   * Tema modunu başlatır
   */""
  initThemeMode() {
    const mode = this.settings.themeMode;
    
    switch (mode) {
      case 'light':
        this.applyThemeMode('light');
        break;
        
      case 'dark':
        this.applyThemeMode('dark');
        break;
        
      case 'auto':
        // Saate göre tema belirle
        const isDayTime = ThemeUtils.isDayTime(
          this.settings.dayStartHour, 
          this.settings.dayEndHour
        );
        this.applyAutoTheme(isDayTime);
        break;
        
      case 'system':
        // Sistem temasını kullan
        const isSystemDark = this.mediaQueries.darkMode.matches;
        this.applyThemeMode(isSystemDark ? 'dark' : 'light');
        break;
        
      default:
        // Varsayılan olarak açık tema
        this.applyThemeMode('light');
    }
    
    // Tema modu değiştirildiğini bildir
    this.emit('themeModeChanged', this.settings.themeMode);
  }
  
  /**
   * Otomatik tema modunu uygular - saate göre
   * @param {boolean} isDayTime - Gündüz mü?
   */
  applyAutoTheme(isDayTime) {
    this.applyThemeMode(isDayTime ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme-auto', isDayTime ? 'day' : 'night');
  }
  
  /**
   * Tema modunu değiştirir
   * @param {string} mode - Tema modu ('light', 'dark', 'auto', 'system')
   */
  setThemeMode(mode) {
    // Geçerli bir mod mu?
    if (!['light', 'dark', 'auto', 'system'].includes(mode)) {
      console.warn(`Geçersiz tema modu: ${mode}`);
      return false;
    }
    
    // Mevcut değerle aynı mı?
    if (this.settings.themeMode === mode) return true;
    
    // Ayarı güncelle
    this.settings.themeMode = mode;
    
    // Modu uygula
    this.initThemeMode();
    
    // Ayarları kaydet
    this.saveSettings();
    
    // Tema değişimini bildir
    this.log(`Tema modu değiştirildi: ${mode}`);
    
    return true;
  }
  
  /**
   * Geçerli tema modunu döndürür
   * @returns {string} - Geçerli tema modu
   */
  getCurrentThemeMode() {
    return this.settings.themeMode;
  }
  
  /**
   * Aktif olan gerçek tema modunu döndürür (light/dark)
   * @returns {string} - Aktif tema
   */
  getActiveTheme() {
    const currentMode = this.settings.themeMode;
    
    if (currentMode === 'light' || currentMode === 'dark') {
      return currentMode;
    }
    
    if (currentMode === 'auto') {
      // Saate göre
      return ThemeUtils.isDayTime(
        this.settings.dayStartHour, 
        this.settings.dayEndHour
      ) ? 'light' : 'dark';
    }
    
    if (currentMode === 'system') {
      // Sistem ayarına göre
      return this.mediaQueries.darkMode.matches ? 'dark' : 'light';
    }
    
    return 'light'; // Varsayılan
  }
  
  /**
   * Tema modunu HTML elementi üzerine uygular
   * @param {string} mode - Uygulanacak tema ('light', 'dark')
   */
  applyThemeMode(mode) {
    const previousMode = this.currentThemeMode || document.documentElement.getAttribute('data-theme') || 'light';
    
    // Mevcut modu güncelle
    this.currentThemeMode = mode;
    
    // Tema geçişi öncesi hazırlık
    if (this.settings.animatedTransitions && !this.mediaQueries.reducedMotion.matches) {
      this.beforeThemeChange(previousMode, mode);
    }
    
    // data-theme özniteliğini ayarla
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-previous-theme', previousMode);
    
    // body sınıfları
    document.body.classList.toggle('dark-mode', mode === 'dark');
    document.body.classList.toggle('light-mode', mode === 'light');
    
    // Tema flag'i - tarayıcı varsayılanlarından farklı olduğunu belirtir
    document.body.classList.add('theme-set');
    
    // Meta tema rengini güncelle (mobil tarayıcı rengi)
    this.updateMetaThemeColor(mode);
    
    // Tema geçişi sonrası efektleri
    if (this.settings.animatedTransitions && !this.mediaQueries.reducedMotion.matches) {
      this.afterThemeChange(previousMode, mode);
    }
    
    // Screen reader için temayla ilgili duyuru yap
    this.announceThemeChange(mode);
  }
  
  /**
   * Tema değişimi öncesi hazırlık yapar
   * @param {string} previousMode - Önceki tema modu
   * @param {string} newMode - Yeni tema modu
   */
  beforeThemeChange(previousMode, newMode) {
    // İlk yükleme ise sadece tema-geçiş sınıfı ekle
    if (!previousMode || previousMode === newMode) {
      return;
    }
    
    // Geçiş animasyonu için body'e geçiş sınıfı ekle
    document.body.classList.add('theme-is-changing');
    document.body.classList.add('theme-transition-active');
    
    // Ayrık tema geçiş tipi belirle (light->dark veya dark->light)
    const transitionDirection = 
      previousMode === 'light' && newMode === 'dark' ? 'to-dark' :
      previousMode === 'dark' && newMode === 'light' ? 'to-light' : '';
    
    if (transitionDirection) {
      document.documentElement.setAttribute('data-theme-transition', transitionDirection);
    }
    
    // Theme-animations.css ile uyumlu animasyonlar kullan
    if (transitionDirection === 'to-dark') {
      document.body.style.animation = 'theme-transition-light-to-dark var(--anim-duration-normal) var(--anim-timing-ease-in-out) forwards';
    } else if (transitionDirection === 'to-light') {
      document.body.style.animation = 'theme-transition-dark-to-light var(--anim-duration-normal) var(--anim-timing-ease-in-out) forwards';
    }
    
    // Geçiş öncesi olayını bildir
    this.emit('beforeThemeChange', { previousMode, newMode, direction: transitionDirection });
  }
  
  /**
   * Tema değişimi sonrası efektler uygular
   * @param {string} previousMode - Önceki tema modu
   * @param {string} newMode - Yeni tema modu
   */
  afterThemeChange(previousMode, newMode) {
    if (!previousMode || previousMode === newMode) {
      return;
    }
    
    // theme-animations.css değişkenleriyle uyumlu gecikme süresi
    const animDuration = getComputedStyle(document.documentElement).getPropertyValue('--anim-duration-normal').trim() || '0.3s';
    const delayMs = parseFloat(animDuration) * 1000 || 300;
    
    // Zamanlayıcı ile tema değişim sınıfını kaldır
    setTimeout(() => {
      document.body.classList.remove('theme-is-changing');
      document.body.classList.remove('theme-transition-active');
      document.documentElement.removeAttribute('data-theme-transition');
      document.body.style.animation = '';
      
      // Özel geçiş tamamlandı olayını bildir
      this.emit('themeTransitionComplete', { previousMode, newMode });
    }, delayMs);
    
    // Animasyonlu elementlere etki ekleme
    this.animateElementsOnThemeChange(newMode);
  }
  
  /**
   * Tema değişiminde elementlere animasyon efekti uygular
   * @param {string} mode - Yeni tema modu 
   */
  animateElementsOnThemeChange(mode) {
    // CSS değişkenlerinden gecikme değerlerini al
    const baseDelay = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--anim-delay-sm').trim() || '0.1s') * 1000;
    
    // Animasyon efekti uygulanacak elementler - theme-components.css ile uyumlu
    const animatableElements = [
      'header', '.card', '.btn-primary', '.hero-section', 
      '.feature-box', '.nav-item', '.sidebar', '.timeline-container',
      '.accordion', '.pagination', '.breadcrumb', '.stepper'
    ].join(',');
    
    const elements = document.querySelectorAll(animatableElements);
    
    // Elementlere kademeli olarak animasyon sınıfları ekle
    elements.forEach((element, index) => {
      // Varsa önceki animasyon sınıflarını temizle
      element.classList.remove('animate-fade-in', 'animate-slide-up', 'animate-scale-in');
      
      // theme-animations.css ile uyumlu sınıfları ekle
      setTimeout(() => {
        // Element türüne göre farklı animasyon seç
        if (element.tagName === 'HEADER' || element.classList.contains('hero-section')) {
          element.classList.add('fade-in');
        } else if (element.classList.contains('card') || element.classList.contains('feature-box')) {
          element.classList.add('zoom-in');
        } else {
          element.classList.add('slide-in-up');
        }
      }, baseDelay + (index * 20)); // Kademeli etki için her element için artarak gecikme
    });
  }
  
  /**
   * Ekran okuyucular için tema değişimini duyurur
   * @param {string} mode - Tema modu
   */
  announceThemeChange(mode) {
    let announcer = document.getElementById('themeAnnouncer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'themeAnnouncer';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    
    const modeText = mode === 'dark' ? 'karanlık' : 'aydınlık';
    announcer.textContent = `Tema ${modeText} moda geçti.`;
  }
  
  /**
   * Renk temasını değiştirir
   * @param {string} colorTheme - Renk teması
   * @returns {boolean} - İşlem başarılı mı?
   */
  setColorTheme(colorTheme) {
    // Geçerli bir renk teması mı?
    if (!Object.keys(this.colorValues).includes(colorTheme)) {
      console.warn(`Geçersiz renk teması: ${colorTheme}`);
      return false;
    }
    
    // Mevcut değerle aynı mı?
    if (this.settings.colorTheme === colorTheme) return true;
    
    // Ayarı güncelle
    this.settings.colorTheme = colorTheme;
    
    // Renk temasını uygula
    this.applyColorTheme(colorTheme);
    
    // Ayarları kaydet
    this.saveSettings();
    
    // Renk teması değişimini bildir
    this.log(`Renk teması değiştirildi: ${colorTheme}`);
    this.emit('colorThemeChanged', colorTheme);
    
    return true;
  }
  
  /**
   * Renk temasını HTML elementi üzerine uygular
   * @param {string} colorTheme - Uygulanacak renk teması
   */
  applyColorTheme(colorTheme) {
    // HEX rengi al
    const colorHex = this.colorValues[colorTheme] || this.colorValues.blue;
    
    // data-color-theme özniteliğini ayarla
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    
    // CSS değişkenlerini güncelle - theme-variables.css ile uyumlu
    ThemeUtils.setCssVariable('--primary-color', colorHex);
    
    // RGB değerlerini de güncelle
    const rgb = ThemeUtils.hexToRgb(colorHex);
    if (rgb) {
      ThemeUtils.setCssVariable('--primary-rgb', ThemeUtils.rgbToString(rgb));
      
      // Renk tonu varyasyonlarını hesapla
      ThemeUtils.setCssVariable('--primary-light', ThemeUtils.adjustColor(colorHex, 30)); 
      ThemeUtils.setCssVariable('--primary-dark', ThemeUtils.adjustColor(colorHex, -20));
    }
    
    // Meta tema rengini güncelle
    this.updateMetaThemeColor(this.getActiveTheme());
  }
  
  /**
   * Kontrast seviyesini değiştirir
   * @param {number} level - Kontrast seviyesi (0-3)
   * @returns {boolean} - İşlem başarılı mı?
   */
  setContrastLevel(level) {
    // Sayıya çevir
    level = parseInt(level);
    
    // Geçerli bir seviye mi?
    if (isNaN(level) || level < 0 || level > 3) {
      console.warn(`Geçersiz kontrast seviyesi: ${level}`);
      return false;
    }
    
    // Mevcut değerle aynı mı?
    if (this.settings.contrastLevel === level) return true;
    
    // Ayarı güncelle
    this.settings.contrastLevel = level;
    
    // Kontrast seviyesini uygula
    this.applyContrastLevel(level);
    
    // Ayarları kaydet
    this.saveSettings();
    
    // Kontrast seviyesi değişimini bildir
    this.log(`Kontrast seviyesi değiştirildi: ${level}`);
    this.emit('contrastLevelChanged', level);
    
    return true;
  }
  
  /**
   * Kontrast seviyesini uygular
   * @param {number} level - Kontrast seviyesi (0-3)
   */
  applyContrastLevel(level) {
    // Geçerli aralıkta olduğunu kontrol et
    level = parseInt(level);
    if (isNaN(level) || level < 0) level = 0;
    if (level > 3) level = 3;
    
    // Önceki tüm kontrast sınıflarını temizle
    document.body.classList.remove('contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high');
    
    // Yeni kontrast sınıfını ekle
    const contrastClasses = ['contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high'];
    document.body.classList.add(contrastClasses[level]);
    
    // data-contrast özniteliğini ayarla
    document.documentElement.setAttribute('data-contrast', level.toString());
  }
  
  /**
   * Font boyutunu değiştirir
   * @param {number|string} size - Font boyutu (sayı: yüzde olarak, string: 'small', 'normal', 'large', 'xlarge')
   * @returns {boolean} - İşlem başarılı mı?
   */
  setFontSize(size) {
    let fontSizePercent;
    
    // String preset değerleri sayısal değerlere çevir
    if (typeof size === 'string') {
      if (size.endsWith('%')) {
        // Yüzde işareti varsa sayıya çevir
        fontSizePercent = parseInt(size);
      } else {
        // Predefined değerler
        switch (size) {
          case 'small': fontSizePercent = 85; break;
          case 'normal': fontSizePercent = 100; break;
          case 'large': fontSizePercent = 120; break;
          case 'xlarge': fontSizePercent = 140; break;
          default: fontSizePercent = 100; // Bilinmeyen değer
        }
      }
    } else if (typeof size === 'number') {
      fontSizePercent = size;
    } else {
      fontSizePercent = 100; // Varsayılan değer
    }
    
    // Geçerli aralıkta olduğunu kontrol et
    if (fontSizePercent < 80) fontSizePercent = 80;
    if (fontSizePercent > 150) fontSizePercent = 150;
    
    // Mevcut değerle aynı mı?
    if (this.settings.fontSizePercent === fontSizePercent) return true;
    
    // Ayarı güncelle
    this.settings.fontSizePercent = fontSizePercent;
    
    // Font boyutunu uygula
    this.applyFontSize(fontSizePercent);
    
    // Ayarları kaydet
    this.saveSettings();
    
    // Font boyutu değişimini bildir
    this.log(`Font boyutu değiştirildi: ${fontSizePercent}%`);
    this.emit('fontSizeChanged', fontSizePercent);
    
    return true;
  }
  
  /**
   * Font boyutunu uygular
   * @param {number} size - Font boyutu (yüzde olarak)
   */
  applyFontSize(size) {
    // Geçerli aralıkta olduğunu kontrol et
    size = parseInt(size);
    if (isNaN(size) || size < 80) size = 80; // Minimum %80
    if (size > 150) size = 150; // Maximum %150
    
    // Font boyutunu belirle
    document.documentElement.style.fontSize = `${size}%`;
    
    // data-font-size özniteliğini ayarla
    if (size <= 90) {
      document.documentElement.setAttribute('data-font-size', 'small');
    } else if (size <= 110) {
      document.documentElement.setAttribute('data-font-size', 'normal');
    } else if (size <= 130) {
      document.documentElement.setAttribute('data-font-size', 'large');
    } else {
      document.documentElement.setAttribute('data-font-size', 'xlarge');
    }
  }
  
  /**
   * Azaltılmış hareket ayarını değiştirir
   * @param {boolean} enabled - Azaltılmış hareket etkin mi?
   * @returns {boolean} - İşlem başarılı mı?
   */
  setReducedMotion(enabled) {
    // Boolean'a çevir
    enabled = Boolean(enabled);
    
    // Mevcut değerle aynı mı?
    if (this.settings.reducedMotion === enabled) return true;
    
    // Ayarı güncelle
    this.settings.reducedMotion = enabled;
    
    // Azaltılmış hareket ayarını uygula
    this.applyReducedMotion(enabled);
    
    // Ayarları kaydet
    this.saveSettings();
    
    // Azaltılmış hareket değişimini bildir
    this.log(`Azaltılmış hareket ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`);
    this.emit('reducedMotionChanged', enabled);
    
    return true;
  }
  
  /**
   * Azaltılmış hareket ayarını uygular
   * @param {boolean} enabled - Azaltılmış hareket etkin mi?
   */
  applyReducedMotion(enabled) {
    document.documentElement.setAttribute('data-reduced-motion', enabled.toString());
    
    if (enabled) {
      document.documentElement.classList.add('reduced-motion');
      
      // theme-animations.css ile uyumlu yardımcı sınıfları ekle
      document.documentElement.classList.add('prefers-reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
      document.documentElement.classList.remove('prefers-reduced-motion');
    }
  }
  
  /**
   * Meta tema rengi öğesini günceller (mobil tarayıcılar için)
   * @param {string} mode - Tema modu
   */
  updateMetaThemeColor(mode) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    // Meta tema rengi yoksa oluştur
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Tema moduna göre rengi ayarla
    if (mode === 'dark') {
      metaThemeColor.content = '#121212'; // Karanlık tema rengi
    } else {
      // Renk teması primer rengini kullan
      const colorTheme = this.settings.colorTheme;
      metaThemeColor.content = this.colorValues[colorTheme] || this.colorValues.blue;
    }
  }
  
  /**
   * Sistem renk şeması değişikliğini işler
   * @param {MediaQueryListEvent} event - Medya sorgusu olayı
   */
  handleSystemThemeChange(event) {
    if (this.settings.themeMode !== 'system') return;
    
    const newMode = event.matches ? 'dark' : 'light';
    this.applyThemeMode(newMode);
    
    this.log(`Sistem teması değişti: ${newMode}`);
    this.emit('systemThemeChanged', newMode);
  }
  
  /**
   * Sistem animasyon tercihi değişikliğini işler
   * @param {MediaQueryListEvent} event - Medya sorgusu olayı
   */
  handleReducedMotionChange(event) {
    // Kullanıcı manuel ayar yapmamışsa sistem ayarını kullan
    if (ThemeUtils.getFromStorage('reducedMotion') === null) {
      const enabled = event.matches;
      this.settings.reducedMotion = enabled;
      this.applyReducedMotion(enabled);
      
      this.log(`Sistem animasyon tercihi değişti: ${enabled ? 'azaltılmış' : 'normal'}`);
      this.emit('systemReducedMotionChanged', enabled);
    }
  }
  
  /**
   * Tüm ayarları varsayılana döndürür
   * @returns {boolean} - İşlem başarılı mı?
   */
  resetToDefaults() {
    try {
      // Ayarları varsayılanlara döndür
      this.settings = { ...this.defaults };
      
      // LocalStorage'dan kayıtlı ayarları temizle
      ['themeMode', 'colorTheme', 'contrastLevel', 'fontSizePercent', 'reducedMotion'].forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Ayarları uygula
      this.initThemeMode();
      this.applyColorTheme(this.settings.colorTheme);
      this.applyContrastLevel(this.settings.contrastLevel);
      this.applyFontSize(this.settings.fontSizePercent);
      this.applyReducedMotion(this.settings.reducedMotion);
      
      this.log('Tüm ayarlar varsayılanlara döndürüldü:', this.settings);
      this.emit('settingsReset', this.settings);
      
      return true;
    } catch (error) {
      console.error('Ayarlar sıfırlanırken hata oluştu:', error);
      return false;
    }
  }
  
  /**
   * Olay dinleyicisi ekler
   * @param {string} event - Olay adı
   * @param {Function} callback - Olay dinleyicisi
   */
  on(event, callback) {
    if (typeof callback !== 'function') return;
    
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Olay dinleyicisini kaldırır
   * @param {string} event - Olay adı
   * @param {Function} callback - Olay dinleyicisi
   */
  off(event, callback) {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }
  
  /**
   * Olayı tetikler
   * @param {string} event - Olay adı
   * @param {any} data - Olay verileri
   */
  emit(event, data) {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`'${event}' olayı işlenirken hata:`, error);
      }
    });
    
    // Global özel olay da gönder
    ThemeUtils.dispatchCustomEvent(`theme:${event}`, data);
  }
  
  /**
   * Sınıfın kaynaklarını serbest bırakır
   */
  destroy() {
    // Media query dinleyicilerini kaldır
    this.mediaQueries.darkMode.removeEventListener('change', this.handleSystemThemeChange);
    this.mediaQueries.reducedMotion.removeEventListener('change', this.handleReducedMotionChange);
    
    // Olay dinleyicilerini temizle
    this.eventListeners = {};
    
    // Global erişimi kaldır
    window.themeManager = null;
    window.__themeManagerInitialized = false;
    
    this.log('ThemeManager başarıyla sonlandırıldı');
  }
  
  /**
   * Debug log mesajı
   * @param  {...any} args - Log argümanları
   */
  log(...args) {
    if (this.settings.debug) {
      console.log('[ThemeManager]', ...args);
    }
  }
}

// Global erişim için
window.ThemeManager = ThemeManager;

// Export
export default ThemeManager;

// Global theme işlevleri (applyThemeMode fonksiyonu eklendi)
function applyThemeMode(mode) {
  // Temayı document elementine uygula
  document.documentElement.setAttribute('data-theme', mode);
  document.body.classList.toggle('dark-mode', mode === 'dark');
  document.body.classList.toggle('light-mode', mode === 'light');
  
  // Tema değişim olayını tetikle (diğer bileşenlerin haberdar olması için)
  const themeChangeEvent = new CustomEvent('themeChanged', {
    detail: { theme: mode, source: 'auto' }
  });
  document.dispatchEvent(themeChangeEvent);
  
  // Güncellenmiş tema için önizleme animasyonlarını tetikle
  const previews = document.querySelectorAll('.theme-preview');
  previews.forEach(preview => {
    preview.classList.remove('light-anim', 'dark-anim');
    setTimeout(() => {
      preview.classList.add(mode === 'dark' ? 'dark-anim' : 'light-anim');
    }, 50);
  });
  
  // Güneş/ay görünürlüğünü güncelle
  const suns = document.querySelectorAll('.sun');
  const moons = document.querySelectorAll('.moon');
  
  suns.forEach(sun => {
    sun.style.opacity = mode === 'light' ? '1' : '0.2';
    sun.style.transform = mode === 'light' 
      ? 'translateX(-50%) scale(1.1) rotate(-5deg)' 
      : 'translateX(-60%) scale(0.8) rotate(10deg)';
  });
  
  moons.forEach(moon => {
    moon.style.opacity = mode === 'dark' ? '1' : '0.2';
    moon.style.transform = mode === 'dark'
      ? 'translateX(-50%) scale(1.1) rotate(-5deg)'
      : 'translateX(-60%) scale(0.8) rotate(-10deg)';
  });
}



// Kontrol düğmeleri için olay dinleyicileri
document.querySelectorAll('.theme-preview-control').forEach(button => {
  button.addEventListener('click', function() {
    const effect = this.getAttribute('data-effect');
    const preview = this.closest('.theme-preview');
    
    // Efekti ekle/kaldır
    if (effect === 'rain') {
      preview.classList.toggle('rain-effect');
    } else if (effect === 'snow') {
      preview.classList.toggle('snow-effect');
    } else if (effect === 'meteor') {
      // Meteor efekti tek seferlik
      preview.classList.add('meteor-shower');
      setTimeout(() => {
        preview.classList.remove('meteor-shower');
      }, 2000);
    }
  });
});

// Mouse takip efekti için
const preview = document.querySelector('.theme-preview.mouse-follow');
if (preview) {
  preview.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; 
    const mouseY = e.clientY - rect.top;
    
    // Fare pozisyonuna göre güneş/ay konumunu ayarla
    const sun = this.querySelector('.sun');
    const moon = this.querySelector('.moon');
    
    if (sun && window.getComputedStyle(sun).opacity > 0) {
      const moveX = (mouseX / rect.width - 0.5) * 10;
      const moveY = (mouseY / rect.height - 0.5) * 5;
      sun.style.transform = `translateX(calc(-50% + ${moveX}px)) translateY(${moveY}px) scale(1.15) rotate(-8deg)`;
    }
    
    if (moon && window.getComputedStyle(moon).opacity > 0) {
      const moveX = (mouseX / rect.width - 0.5) * 10;
      const moveY = (mouseY / rect.height - 0.5) * 5;
      moon.style.transform = `translateX(calc(-50% + ${moveX}px)) translateY(${moveY}px) scale(1.15) rotate(-10deg)`;
    }
  });
}

// Yağmur ve kar oluşturucu
function createWeatherElements() {
  const rain = document.querySelector('.theme-preview .rain');
  const snow = document.querySelector('.theme-preview .snow');
  
  if (rain) {
    for (let i = 0; i < 20; i++) {
      const raindrop = document.createElement('div');
      raindrop.className = 'raindrop';
      raindrop.style.left = `${Math.random() * 100}%`;
      raindrop.style.animationDelay = `${Math.random() * 1}s`;
      rain.appendChild(raindrop);
    }
  }
  
  if (snow) {
    for (let i = 0; i < 15; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.style.left = `${Math.random() * 100}%`;
      snowflake.style.animationDelay = `${Math.random() * 5}s`;
      snow.appendChild(snowflake);
    }
  }
}

// Sayfa yüklendiğinde hava efektlerini oluştur
document.addEventListener('DOMContentLoaded', createWeatherElements);

// Otomatik tema kontrolü
function checkAutoTheme() {
  const now = new Date();
  const hour = now.getHours();
  const isNight = hour >= 19 || hour < 6;
  
  // Önizleme güncelleme
  const autoPreview = document.querySelector('.theme-preview.auto-anim');
  if (autoPreview) {
    if (isNight) {
      autoPreview.classList.add('night-mode');
    } else {
      autoPreview.classList.remove('night-mode');
    }
    
    // Saat göstergesi güncelleme
    const timeIndicator = autoPreview.querySelector('.time-indicator');
    if (timeIndicator) {
      const formattedHour = now.getHours().toString().padStart(2, '0');
      const formattedMinute = now.getMinutes().toString().padStart(2, '0');
      timeIndicator.textContent = `${formattedHour}:${formattedMinute}`;
    }
  }
  
  // Otomatik tema seçiliyse, ana tema modunu güncelle
  const autoThemeRadio = document.querySelector('.theme-radio[value="auto"]:checked');
  if (autoThemeRadio) {
    applyThemeMode(isNight ? 'dark' : 'light');
  }
}

// Sayfa yüklendiğinde başlangıç temasını ayarla ve düzenli aralıklarla kontrol et
document.addEventListener('DOMContentLoaded', () => {
  // Başlangıçta otomatik tema seçili olsun
  const autoThemeRadio = document.querySelector('.theme-radio[value="auto"]');
  if (autoThemeRadio) {
    autoThemeRadio.checked = true;
  }
  
  // İlk kontrolü yap
  checkAutoTheme();
  
  // Her dakika kontrol et
  setInterval(checkAutoTheme, 60000);
});