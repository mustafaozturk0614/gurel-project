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
    if (this.getActiveTheme() === this.options.systemPreferenceKey) {
      this.setTheme(event.matches ? 'dark' : 'light');
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
}

// Export
export default ThemeManager;