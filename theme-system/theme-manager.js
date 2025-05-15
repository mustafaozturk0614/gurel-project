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
    this.options = {
      storageKey: 'user-theme-preferences',
      defaultTheme: 'light',
      systemPreferenceKey: 'system',
      transitionDuration: 300,
      ...options
    };

    this.themes = new Map();
    this.activeTheme = null;
    this.observers = new Set();
    this.eventListeners = new Map(); // Event listener'ları saklamak için
    
    // Kullanıcı ayarlarını saklamak için
    this.settings = {
      themeMode: 'auto', // 'light', 'dark', 'auto', 'system'
      colorTheme: 'blue',
      contrastLevel: 0,
      fontSizePercent: 100,
      reducedMotion: false
    };
    
    // Otomatik mod için zamanlayıcı
    this._autoModeTimer = null;
    
    this.init();
  }

  /**
   * Tema sistemini başlatır
   */
  init() {
    // Sistem tema değişikliklerini dinle
    this.systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeQuery.addListener(this.handleSystemThemeChange.bind(this));

    // Kayıtlı tema tercihini yükle
    const savedPreferences = this.loadPreferences();
    if (savedPreferences) {
      this.applyPreferences(savedPreferences);
    } else {
      this.setTheme(this.options.defaultTheme);
    }

    // RTL desteği için yön değişikliklerini dinle
    this.handleDirectionChange();
    
    // Kayıtlı ayarları yükle
    this.loadSettings();
    
    // Otomatik temayı ayarla
    if (this.settings.themeMode === 'auto') {
      this.startAutoModeTimer();
    }
  }
  
  /**
   * Kullanıcı ayarlarını yükler
   */
  loadSettings() {
    try {
      // Kaydedilmiş ayarları oku
      this.settings = {
        themeMode: ThemeUtils.getFromStorage('themeMode', 'light'), // Varsayılan: light
        colorTheme: ThemeUtils.getFromStorage('colorTheme', 'blue'), // Varsayılan: blue
        contrastLevel: parseInt(ThemeUtils.getFromStorage('contrastLevel', '0')), // Varsayılan: normal
        fontSizePercent: parseInt(ThemeUtils.getFromStorage('fontSizePercent', '100')), // Varsayılan: 100%
        reducedMotion: ThemeUtils.getFromStorage('reducedMotion') === 'true' // Varsayılan: false
      };
      
      // Önemli: Tema modunu hemen uygula
      document.documentElement.setAttribute('data-theme', this.settings.themeMode === 'auto' ? 
        (this.isNightTime() ? 'dark' : 'light') : 
        this.settings.themeMode);
      
      // Dark mode sınıfını body'ye uygula
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      // Diğer tema ayarlarını uygula
      document.documentElement.setAttribute('data-color-theme', this.settings.colorTheme);
      document.documentElement.setAttribute('data-reduced-motion', this.settings.reducedMotion.toString());
      document.documentElement.style.fontSize = this.settings.fontSizePercent + '%';
      
      // Kontrast sınıflarını uygula
      document.body.classList.remove('contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high');
      document.body.classList.add(
        ['contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high'][this.settings.contrastLevel]
      );
      
      this.log('✅ Tema ayarları başarıyla yüklendi!', this.settings);
      return this.settings;
    } catch (error) {
      if (this.options && this.options.debug) {
        console.log('[ThemeManager] ❌ Tema ayarları yüklenirken hata:', error);
      }
      return null;
    }
  }

  /**
   * Tema modunu değiştirir (light, dark, auto, system)
   * @param {string} mode - Tema modu
   */
  setThemeMode(mode) {
    // Geçerlilik kontrolü
    if (!['light', 'dark', 'auto', 'system'].includes(mode)) {
      console.error(`Geçersiz tema modu: ${mode}`);
      return false;
    }
    
    // Tema değişimi sırasında geçiş için sınıf ekle
    document.documentElement.classList.add('theme-transition', 'theme-changing');
    
    // Önceki tema 
    const prevTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = mode;
    
    // Tema modunu ayarla
    switch (mode) {
      case 'light':
        newTheme = 'light';
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-mode');
        break;
        
      case 'dark':
        newTheme = 'dark';
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
        
        // Koyu tema için sayfa içeriğini karartma
        document.querySelectorAll('.card, .service-box, .team-card, .business-card')
          .forEach(el => el.style.transition = 'background-color 0.5s ease, color 0.3s ease');
        break;
        
      case 'auto':
        // Günün saatine göre açık veya koyu tema
        const isDark = this.isNightTime();
        newTheme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.classList.toggle('dark-mode', isDark);
        
        // Otomatik modda zamanlamalı kontrol başlat
        this.startAutoModeTimer();
        break;
        
      case 'system':
        // Sistem temasına göre açık veya koyu tema
        const prefersDark = ThemeUtils.prefersDarkTheme();
        newTheme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.classList.toggle('dark-mode', prefersDark);
        break;
    }
    
    // Ayarları güncelle ve kaydet
    this.settings.themeMode = mode;
    ThemeUtils.saveToStorage('themeMode', mode);
    
    // Geçiş sınıfını belirli bir süre sonra kaldır
    setTimeout(() => {
      document.documentElement.classList.remove('theme-changing');
      
      // DOM güncellemesini zorla
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
      }, 500);
    }, 300);
    
    // Tema değişim olayını tetikle
    this.emit('themeModeChanged', mode);
    
    // Özelleştirilmiş olay gönder
    ThemeUtils.dispatchCustomEvent('themeChanged', { 
      oldTheme: prevTheme, 
      newTheme: newTheme, 
      mode: mode
    });
    
    this.log(`Tema modu değiştirildi: ${mode} -> ${newTheme}`);
    return true;
  }
  
  /**
   * Otomatik tema modu için zamanlayıcıyı başlatır
   */
  startAutoModeTimer() {
    // Önceki zamanlayıcıyı temizle
    if (this._autoModeTimer) {
      clearInterval(this._autoModeTimer);
    }
    
    // İlk kontrol
    this.checkAutoModeTime();
    
    // Zamanlayıcıyı başlat
    this._autoModeTimer = setInterval(() => {
      this.checkAutoModeTime();
    }, 60000); // Her dakika kontrol et
  }
  
  /**
   * Otomatik tema için saati kontrol eder ve gerekirse temayı değiştirir
   */
  checkAutoModeTime() {
    // Eğer aktif mod otomatik değilse çık
    if (this.settings.themeMode !== 'auto') return;
    
    // Saati kontrol et
    const currentHour = new Date().getHours();
    const isDark = (currentHour >= 19 || currentHour < 7);
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // Eğer tema saate göre uygun değilse değiştir
    if ((isDark && currentTheme !== 'dark') || (!isDark && currentTheme !== 'light')) {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.body.classList.toggle('dark-mode', isDark);
      
      console.log(`Otomatik mod: Tema ${isDark ? 'koyu' : 'açık'} moda ayarlandı (Saat: ${currentHour})`);
      
      // Tema değişikliği olayını tetikle
      this.emit('themeChanged', {
        oldTheme: isDark ? 'light' : 'dark',
        newTheme: isDark ? 'dark' : 'light'
      });
    }
  }
  
  /**
   * Renk temasını değiştirir
   * @param {string} theme - Renk teması (örn: 'blue', 'red', 'green')
   */
  setColorTheme(theme) {
    this.settings.colorTheme = theme;
    ThemeUtils.saveToStorage('colorTheme', theme);
    
    document.documentElement.setAttribute('data-color-theme', theme);
    
    // Tema değişikliği olayını tetikle
    this.emit('colorThemeChanged', theme);
  }
  
  /**
   * Kontrast seviyesini değiştirir
   * @param {number} level - Kontrast seviyesi (0-3)
   */
  setContrastLevel(level) {
    level = Math.min(3, Math.max(0, level)); // 0-3 aralığına sınırla
    
    this.settings.contrastLevel = level;
    ThemeUtils.saveToStorage('contrastLevel', level);
    
    // Kontrast sınıflarını güncelle
    document.body.classList.remove('contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high');
    document.body.classList.add(['contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high'][level]);
    
    // Kontrast değişikliği olayını tetikle
    this.emit('contrastLevelChanged', level);
  }
  
  /**
   * Font boyutunu değiştirir
   * @param {number} size - Font boyutu yüzdesi (80-150)
   */
  setFontSize(size) {
    size = Math.min(150, Math.max(80, size)); // 80-150 aralığına sınırla
    
    this.settings.fontSizePercent = size;
    ThemeUtils.saveToStorage('fontSizePercent', size);
    
    // Font boyutunu güncelle
    document.documentElement.style.fontSize = size + '%';
    
    // Font boyutu değişikliği olayını tetikle
    this.emit('fontSizeChanged', size);
  }
  
  /**
   * Azaltılmış hareket modunu değiştirir
   * @param {boolean} enabled - Azaltılmış hareket etkin mi?
   */
  setReducedMotion(enabled) {
    this.settings.reducedMotion = enabled;
    ThemeUtils.saveToStorage('reducedMotion', enabled);
    
    // Azaltılmış hareket sınıfını güncelle
    document.documentElement.setAttribute('data-reduced-motion', enabled.toString());
    document.documentElement.classList.toggle('reduced-motion', enabled);
    
    // Azaltılmış hareket değişikliği olayını tetikle
    this.emit('reducedMotionChanged', enabled);
  }
  
  /**
   * Tüm ayarları varsayılan değerlere sıfırlar
   */
  resetToDefaults() {
    // Varsayılan değerler
    const defaults = {
      themeMode: 'auto',
      colorTheme: 'blue',
      contrastLevel: 0,
      fontSizePercent: 100,
      reducedMotion: false
    };
    
    // LocalStorage'dan ayarları temizle
    Object.keys(defaults).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Ayarları varsayılan değerlere ayarla
    this.settings = { ...defaults };
    
    // Temayı güncelle
    this.setThemeMode(defaults.themeMode);
    
    // Renk temasını güncelle
    document.documentElement.setAttribute('data-color-theme', defaults.colorTheme);
    
    // Kontrast seviyesini güncelle
    document.body.classList.remove('contrast-mild', 'contrast-medium', 'contrast-high');
    document.body.classList.add('contrast-normal');
    
    // Font boyutunu güncelle
    document.documentElement.style.fontSize = defaults.fontSizePercent + '%';
    
    // Azaltılmış hareket modunu güncelle
    document.documentElement.setAttribute('data-reduced-motion', 'false');
    document.documentElement.classList.remove('reduced-motion');
    
    // Sıfırlama olayını tetikle
    this.emit('settingsReset');
    
    return true;
  }

  /**
   * Yeni bir tema tanımlar
   * @param {string} name - Tema adı
   * @param {Object} config - Tema yapılandırması
   */
  defineTheme(name, config) {
    const theme = {
      name,
      variables: config.variables || {},
      darkMode: config.darkMode || false,
      highContrast: config.highContrast || false,
      rtl: config.rtl || false,
      ...config
    };

    this.themes.set(name, theme);
    this.generateThemeStyles(theme);
  }

  /**
   * Tema stillerini oluşturur ve belgeye ekler
   * @param {Object} theme - Tema yapılandırması
   */
  generateThemeStyles(theme) {
    const styleId = `theme-${theme.name}`;
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const variables = Object.entries(theme.variables)
      .map(([key, value]) => `--${key}: ${value};`)
      .join('\n');

    styleElement.textContent = `
      [data-theme="${theme.name}"] {
        ${variables}
      }
    `;
  }

  /**
   * Temayı değiştirir
   * @param {string} themeName - Tema adı
   */
  async setTheme(themeName) {
    const theme = this.themes.get(themeName);
    if (!theme) return;

    const oldTheme = this.activeTheme;
    
    // Tema değişimi öncesi event'i tetikle
    this.emit('beforeThemeChange', {
      oldTheme: oldTheme?.name,
      newTheme: themeName
    });

    this.activeTheme = theme;

    // Tema geçiş animasyonu
    await this.animateThemeTransition(oldTheme, theme);

    // Tema sınıflarını güncelle
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.classList.toggle('dark-mode', theme.darkMode);
    document.documentElement.classList.toggle('high-contrast', theme.highContrast);

    // Tercihleri kaydet
    this.savePreferences({
      theme: themeName,
      darkMode: theme.darkMode,
      highContrast: theme.highContrast
    });

    // Tema değişimi sonrası event'i tetikle
    this.emit('themeTransitionComplete', {
      oldTheme: oldTheme?.name,
      newTheme: themeName,
      newMode: theme.darkMode ? 'dark' : 'light'
    });

    // Gözlemcileri bilgilendir
    this.notifyObservers();
  }

  /**
   * Tema geçiş animasyonunu yönetir
   * @param {Object} oldTheme - Eski tema
   * @param {Object} newTheme - Yeni tema
   */
  async animateThemeTransition(oldTheme, newTheme) {
    const root = document.documentElement;
    const duration = this.options.transitionDuration;

    // Geçiş sınıfını ekle
    root.classList.add('theme-transition');
    root.style.setProperty('--theme-transition-duration', `${duration}ms`);

    // Animasyonu bekle
    await ThemeUtils.animate(root, 'theme-fade', { duration });

    // Geçiş sınıfını kaldır
    root.classList.remove('theme-transition');
  }

  /**
   * Sistem tema değişikliklerini yönetir
   * @param {MediaQueryListEvent} event - Medya sorgusu olayı
   */
  handleSystemThemeChange(event) {
    if (this.settings.themeMode === 'system') {
      const isDark = event.matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.body.classList.toggle('dark-mode', isDark);
    }
  }

  /**
   * RTL desteği için yön değişikliklerini yönetir
   */
  handleDirectionChange() {
    const observer = new MutationObserver(() => {
      const isRTL = ThemeUtils.isRTL();
      document.documentElement.classList.toggle('rtl', isRTL);
      this.notifyObservers();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });
  }

  /**
   * Tema tercihlerini kaydeder
   * @param {Object} preferences - Tema tercihleri
   */
  savePreferences(preferences) {
    localStorage.setItem(
      this.options.storageKey,
      JSON.stringify(preferences)
    );
  }

  /**
   * Kayıtlı tema tercihlerini yükler
   * @returns {Object|null} - Tema tercihleri
   */
  loadPreferences() {
    const saved = localStorage.getItem(this.options.storageKey);
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Aktif temayı döndürür
   * @returns {Object} - Aktif tema
   */
  getActiveTheme() {
    return this.activeTheme;
  }

  /**
   * Tema değişiklik gözlemcisi ekler
   * @param {Function} callback - Gözlemci fonksiyonu
   */
  addObserver(callback) {
    this.observers.add(callback);
  }

  /**
   * Tema değişiklik gözlemcisini kaldırır
   * @param {Function} callback - Gözlemci fonksiyonu
   */
  removeObserver(callback) {
    this.observers.delete(callback);
  }

  /**
   * Tüm gözlemcileri bilgilendirir
   */
  notifyObservers() {
    this.observers.forEach(callback => {
      callback(this.activeTheme);
    });
  }

  /**
   * Tema önizlemesi oluşturur
   * @param {string} themeName - Tema adı
   * @returns {HTMLElement} - Önizleme elementi
   */
  createThemePreview(themeName) {
    const theme = this.themes.get(themeName);
    if (!theme) return null;

    return ThemeUtils.createThemePreview(themeName, theme.variables);
  }

  /**
   * Event listener ekler
   * @param {string} eventName - Event adı
   * @param {Function} callback - Callback fonksiyonu
   */
  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName).add(callback);
  }

  /**
   * Event listener'ı kaldırır
   * @param {string} eventName - Event adı
   * @param {Function} callback - Callback fonksiyonu
   */
  off(eventName, callback) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).delete(callback);
    }
  }

  /**
   * Event'i tetikler
   * @param {string} eventName - Event adı
   * @param {any} data - Event verisi
   */
  emit(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event handler error for ${eventName}:`, error);
        }
      });
    }
  }

  // Şu anki saatin gece olup olmadığını kontrol eden yardımcı fonksiyon
  isNightTime() {
    const currentHour = new Date().getHours();
    // Gece modu: Akşam 19:00 - Sabah 7:00 arası
    return (currentHour >= 19 || currentHour < 7);
  }

  log(...args) {
    // Konsol hatalarını önlemek için try-catch bloğu içinde
    try {
      if (this.options && this.options.debug) {
        console.log('[ThemeManager]', ...args);
      }
    } catch (error) {
      // Sessizce hataları görmezden gel
    }
  }
}

// Export
export default ThemeManager;