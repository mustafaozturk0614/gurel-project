/**
 * Tema Yöneticisi - Gürel Yönetim
 * Sürüm: 2.1.0
 * 
 * Sitenin tema ve görünüm ayarlarını yöneten sınıf.
 * Bu sınıf, kullanıcı tema tercihlerini yönetir, localStorage'a kaydeder 
 * ve HTML elementlerine uygular.
 */

class ThemeManager {
  constructor(options = {}) {
    // Renk değerleri
    this.colorValues = {
      blue: '#0055a4',
      red: '#d93025',
      green: '#188038',
      orange: '#ea8600',
      purple: '#7b1fa2',
      teal: '#009688',
      pink: '#e91e63'
    };
    
    // Font boyutu değerleri
    this.fontSizeValues = {
      small: '85%',
      normal: '100%',
      large: '120%',
      xlarge: '140%'
    };
    
    // Varsayılan ayarlar
    this.settings = {
      themeMode: 'auto', // 'light', 'dark', 'auto', 'system'
      colorTheme: 'blue', // 'blue', 'red', 'green', 'orange', 'purple', 'teal', 'pink'
      contrastLevel: 0, // 0-3 (normal, hafif, orta, yüksek)
      fontSizePercent: '100', // 85%, 100%, 120%, 140% vb.
      reducedMotion: false, // Azaltılmış hareket
      ...options
    };

    // Options değişkenini sınıf özelliği olarak kaydet
    this.options = options || {};
    
    // Olay dinleyicileri dizisi
    this.eventListeners = [];

    // Debug modu
    this.debug = options.debug || false;
    
    // Media Query dinleyicileri
    this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // LocalStorage'dan kaydedilmiş ayarları yükle
    this.loadSettings();
    
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
    
    // Tema değişiminde geçiş efekti ekle
    document.documentElement.classList.add('theme-transition');
    
    // Olay dinleyiciler
    this.setupEventListeners();
    
    // Global erişim için window nesnesine ekle
    window.themeManager = this;
    
    this.log('ThemeManager başlatıldı:', this.settings);
  }

  /**
   * Olay dinleyicilerini ayarlar
   */
  setupEventListeners() {
    // Sistem teması değişikliklerini dinle
    this.darkModeMediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    
    // Sistem animasyon tercihlerini dinle
        this.reducedMotionMediaQuery.addEventListener('change', this.handleReducedMotionChange.bind(this));
    
    // Sayfa yüklenme/yükleme olayını dinle
    window.addEventListener('load', () => {
      // Geçişleri etkinleştir (sayfa tamamen yüklendikten sonra)
      document.documentElement.classList.add('theme-transition');
      this.emit('pageLoaded');
    });
    
    // Sayfa düzeni değişikliklerini yakala
    window.addEventListener('resize', this.debounce(() => {
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
   * Geçerli tema modunu döndürür
   */
  getCurrentThemeMode() {
    // Auto modundaysa saate göre hesapla
    if (this.settings.themeMode === 'auto') {
      return this.isDayTime() ? 'light' : 'dark';
    }
    
    // System modundaysa sistem ayarını kullan
    if (this.settings.themeMode === 'system') {
      return this.getSystemTheme();
    }
    
    // Diğer durumlar için doğrudan ayarı döndür
    return this.settings.themeMode;
  }

  /**
   * Sistem temasını döndürür
   */
  getSystemTheme() {
    return this.darkModeMediaQuery.matches ? 'dark' : 'light';
  }

  /**
   * Auto tema modunda gün/gece tespiti
   * 06:00 - 18:00 arası gündüz, diğer saatler gece kabul edilir
   */
  isDayTime() {
    const currentHour = new Date().getHours();
    return currentHour >= 6 && currentHour < 18;
  }

  /**
   * Kullanıcı ayarlarını localStorage'dan yükler
   */
  loadSettings() {
    try {
      // localStorage'dan kayıtlı tema ayarlarını al
      const storedSettings = {
        themeMode: localStorage.getItem('themeMode'),
        colorTheme: localStorage.getItem('colorTheme'),
        contrastLevel: localStorage.getItem('contrastLevel'),
        fontSizePercent: localStorage.getItem('fontSizePercent'),
        reducedMotion: localStorage.getItem('reducedMotion') === 'true'
      };
      
      // Yüklenen geçerli ayarları uygula
      if (storedSettings.themeMode && ['light', 'dark', 'auto', 'system'].includes(storedSettings.themeMode)) {
        this.settings.themeMode = storedSettings.themeMode;
      }
      
      if (storedSettings.colorTheme && Object.keys(this.colorValues).includes(storedSettings.colorTheme)) {
        this.settings.colorTheme = storedSettings.colorTheme;
      }
      
      if (storedSettings.contrastLevel !== null) {
        const level = parseInt(storedSettings.contrastLevel);
        if (!isNaN(level) && level >= 0 && level <= 3) {
          this.settings.contrastLevel = level;
        }
      }
      
      if (storedSettings.fontSizePercent) {
        // fontSizePercent değerinin geçerli bir değer olduğunu kontrol et
        const validSizes = Object.values(this.fontSizeValues);
        if (validSizes.includes(storedSettings.fontSizePercent) || 
            (parseInt(storedSettings.fontSizePercent) >= 80 && parseInt(storedSettings.fontSizePercent) <= 150)) {
          this.settings.fontSizePercent = storedSettings.fontSizePercent;
        }
      }
      
      if (typeof storedSettings.reducedMotion === 'boolean') {
        this.settings.reducedMotion = storedSettings.reducedMotion;
      } else if (localStorage.getItem('reducedMotion') !== null) {
        this.settings.reducedMotion = localStorage.getItem('reducedMotion') === 'true';
      } else {
        // Sistem ayarından al
        this.settings.reducedMotion = this.reducedMotionMediaQuery.matches;
      }
      
      this.log('Ayarlar yüklendi:', this.settings);
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
      Object.entries(this.settings).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString());
      });
      
      this.emit('settingsSaved', this.settings);
      this.log('Ayarlar kaydedildi:', this.settings);
    } catch (error) {
      console.error('Tema ayarları kaydedilirken hata oluştu:', error);
    }
  }

  /**
   * Kontrast seviyesini uygular
   * @param {number} level - Kontrast seviyesi (0-3)
   */
  applyContrastLevel(level) {
    if (level === undefined || level === null) {
      level = 0; // Varsayılan: normal kontrast
    }
    
    // Seviyeyi sayısal değere çevir
    level = parseInt(level);
    
    // Geçerli aralıkta olduğunu kontrol et
    if (isNaN(level) || level < 0) level = 0;
    if (level > 3) level = 3;
    
    // Önceki tüm kontrast sınıflarını temizle
    document.body.classList.remove('contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high');
    
    // Yeni kontrast sınıfını ekle
    const contrastClasses = ['contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high'];
    document.body.classList.add(contrastClasses[level]);
    
    // Ayarı güncelle
    this.settings.contrastLevel = level;
    
    // themes.css ve settings-panel.css ile uyumlu olması için
    // data-contrast özniteliğini ayarla
    document.documentElement.setAttribute('data-contrast', level.toString());
    
    // Olayı bildir
    this.emit('contrastChange', level);
    
    return level;
  }

  /**
   * Renk temasını uygular
   * @param {string} colorTheme - Renk tema adı ('blue', 'red', vb.)
   */
  applyColorTheme(colorTheme) {
    // Geçerli bir tema olduğunu kontrol et
    if (!colorTheme || !this.colorValues[colorTheme]) {
      colorTheme = 'blue'; // Varsayılan tema
    }
    
    // Önceki veri özniteliğini temizle ve yeni temayı ayarla
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    
    // Ana rengi değişken olarak ayarla
    const applyColor = this.colorValues[colorTheme];
    
    // CSS değişkenlerini güncelle
    if (applyColor) {
      // HEX rengi RGB formata çevir
      const hexToRgb = (hex) => {
        hex = hex.replace('#', '');
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16)
        };
      };
      
      const rgbColor = hexToRgb(applyColor);
      const rgbValue = `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`;
      
      // CSS değişkenlerini güncelle (themes.css ve settings-panel.css ile uyumlu)
      document.documentElement.style.setProperty('--primary-color', applyColor);
      document.documentElement.style.setProperty('--primary-rgb', rgbValue);
    }
    
    // Ayarı güncelle
    this.settings.colorTheme = colorTheme;
    
    // Olayı bildir
    this.emit('colorThemeChange', colorTheme);
    
    return colorTheme;
  }

  /**
   * Font boyutunu uygular
   * @param {string} size - Font boyutu ('85%', '100%' vb.)
   */
  applyFontSize(size) {
    // Boyutu kontrol et ve düzelt
    if (!size) {
      size = '100%'; // Varsayılan boyut
    }
    
    // % sembolünü ekle (eğer yoksa)
    if (!size.toString().includes('%')) {
      size = `${size}%`;
    }
    
    // Boyut değerini sayısal değere çevir
    let sizeValue = parseFloat(size);
    
    // Geçerli aralıkta olduğunu kontrol et
    if (isNaN(sizeValue) || sizeValue < 80) sizeValue = 100;
    if (sizeValue > 150) sizeValue = 150;
    
    // Sayısal değeri tekrar string'e çevir
    size = `${sizeValue}%`;
    
    // <html> element font-size özelliğini güncelle
    document.documentElement.style.fontSize = size;
    
    // themes.css ve settings-panel.css ile uyumlu olması için
    // data-font-size özniteliğini ayarla
    let fontSizeLabel = 'normal';
    if (sizeValue <= 85) fontSizeLabel = 'small';
    else if (sizeValue >= 120 && sizeValue < 140) fontSizeLabel = 'large';
    else if (sizeValue >= 140) fontSizeLabel = 'xlarge';
    
    document.documentElement.setAttribute('data-font-size', fontSizeLabel);
    
    // Ayarı güncelle
    this.settings.fontSizePercent = size.toString();
    
    // Olayı bildir
    this.emit('fontSizeChange', size);
    
    return size;
  }

  /**
   * Azaltılmış hareket ayarını uygular
   * @param {boolean} enabled - Azaltılmış hareket etkin/devre dışı
   */
  applyReducedMotion(enabled) {
    // Boolean değere çevir
    enabled = !!enabled;
    
    // documentElement'e veri-özniteliği ekle
    document.documentElement.setAttribute('data-reduced-motion', enabled.toString());
    
    // Ayarı güncelle
    this.settings.reducedMotion = enabled;
    
    // Olayı bildir
    this.emit('reducedMotionChange', enabled);
    
    return enabled;
  }

  /**
   * Tema modunu başlatır ve varsayılan değerlerle ayarlar
   */
  initThemeMode() {
    // Tema modunu al
    const mode = this.settings.themeMode || 'auto';
    
    // Tüm olası modlar
    const validModes = ['light', 'dark', 'auto', 'system'];
    
    // Geçerli bir mod olduğunu kontrol et
    if (!validModes.includes(mode)) {
      this.settings.themeMode = 'auto';
    }
    
    // Tema sınıflarının hepsini temizle
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    
    // Geçerli mod ile HTML özniteliğini güncelle
    document.documentElement.setAttribute('data-theme', this.settings.themeMode);
    
    // Eğer auto veya system ise, geçerli modu belirle ve uygula
    let effectiveMode;
    
    if (this.settings.themeMode === 'auto') {
      effectiveMode = this.isDayTime() ? 'light' : 'dark';
    } else if (this.settings.themeMode === 'system') {
      effectiveMode = this.getSystemTheme();
    } else {
      effectiveMode = this.settings.themeMode;
    }
    
    // Belirlenen temayı uygula
    this.applyThemeMode(effectiveMode);
    
    return effectiveMode;
  }

  /**
   * Belirli bir tema modunu uygular
   * @param {string} mode - Tema modu ('light', 'dark')
   */
  applyThemeMode(mode) {
    if (mode !== 'light' && mode !== 'dark') {
      mode = 'light'; // Varsayılan: light
    }
    
    // Önceki tema sınıflarını temizle
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Tema için gerekli sınıfları ekle
    document.documentElement.classList.add(`theme-${mode}`);
    document.body.classList.add(`theme-${mode}`);
    
    // Tema uygulandı bilgisi
    document.body.classList.add('theme-set');
    
    // Meta renk şeması güncelle (mobil cihazlar için)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (mode === 'dark') {
        metaThemeColor.setAttribute('content', '#121212');
      } else {
        // Renk temasının ana rengini kullan
        const primaryColor = this.colorValues[this.settings.colorTheme] || '#0055a4';
        metaThemeColor.setAttribute('content', primaryColor);
      }
    }
    
    // Koyu tema için özel CSS ayarlarını uygula
    if (mode === 'dark') {
      document.documentElement.style.setProperty('color-scheme', 'dark');
      // settings-panel.css ile uyumlu olması için
      document.querySelectorAll('.settings-panel, .floating-settings-panel').forEach(panel => {
        panel.classList.remove('light-panel');
        panel.classList.add('dark-panel');
      });
    } else {
      document.documentElement.style.setProperty('color-scheme', 'light');
      // settings-panel.css ile uyumlu olması için
      document.querySelectorAll('.settings-panel, .floating-settings-panel').forEach(panel => {
        panel.classList.remove('dark-panel');
        panel.classList.add('light-panel');
      });
    }
    
    // Olayı bildir
    this.emit('themeModeChange', mode);
    
    return mode;
  }

  /**
   * Tema modunu ayarlar ve kaydeder
   * @param {string} mode - Tema modu ('light', 'dark', 'auto', 'system')
   */
  setThemeMode(mode) {
    const validModes = ['light', 'dark', 'auto', 'system'];
    
    if (!validModes.includes(mode)) {
      mode = 'auto';
    }
    
    // Ayarı güncelle
    this.settings.themeMode = mode;
    
    // HTML özniteliğini güncelle
    document.documentElement.setAttribute('data-theme', mode);
    
    // Tema modunu localStorage'a kaydet
    localStorage.setItem('themeMode', mode);
    
    // Yeni temayı uygula
    this.initThemeMode();
    
    return mode;
  }

  /**
   * Kontrast seviyesini ayarlar ve kaydeder
   * @param {number} level - Kontrast seviyesi (0-3)
   */
  setContrastLevel(level) {
    // Seviyeyi sayısal değere çevir
    level = parseInt(level);
    
    // Geçerli aralıkta olduğunu kontrol et
    if (isNaN(level) || level < 0) level = 0;
    if (level > 3) level = 3;
    
    // Kontrast seviyesini uygula
    this.applyContrastLevel(level);
    
    // Kontrast seviyesini localStorage'a kaydet
    localStorage.setItem('contrastLevel', level.toString());
    
    // settings-panel.css ile uyumlu olması için
    document.documentElement.setAttribute('data-contrast', level.toString());
    
    // Olayı bildir
    this.emit('contrastChange', level);
    
    return level;
  }

  /**
   * Renk temasını ayarlar ve kaydeder
   * @param {string} colorTheme - Renk tema adı ('blue', 'red', vb.)
   */
  setColorTheme(colorTheme) {
    // Geçerli bir tema olduğunu kontrol et
    if (!colorTheme || !this.colorValues[colorTheme]) {
      colorTheme = 'blue'; // Varsayılan tema
    }
    
    // Temayı uygula
    this.applyColorTheme(colorTheme);
    
    // Renk temasını localStorage'a kaydet
    localStorage.setItem('colorTheme', colorTheme);
    
    // settings-panel.css ile uyumlu olması için
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    
    // Olayı bildir
    this.emit('colorThemeChange', colorTheme);
    
    return colorTheme;
  }

  /**
   * Font boyutunu ayarlar ve kaydeder
   * @param {string|number} size - Font boyutu ('85%', '100%' vb. veya 85, 100 vb.)
   */
  setFontSize(size) {
    if (size === undefined || size === null) {
      size = 100; // Varsayılan boyut
    }
    
    // Sayı ise string'e çevir
    if (typeof size === 'number') {
      size = `${size}%`;
    }
    
    // % sembolünü ekle (eğer yoksa)
    if (!size.toString().includes('%')) {
      size = `${size}%`;
    }
    
    // Boyut değerini sayısal değere çevir
    let sizeValue = parseFloat(size);
    
    // Geçerli aralıkta olduğunu kontrol et
    if (isNaN(sizeValue) || sizeValue < 80) sizeValue = 100;
    if (sizeValue > 150) sizeValue = 150;
    
    // Sayısal değeri tekrar string'e çevir
    size = `${sizeValue}%`;
    
    // Font boyutunu uygula
    this.applyFontSize(size);
    
    // Font boyutunu localStorage'a kaydet
    localStorage.setItem('fontSizePercent', size);
    
    // settings-panel.css için özel etiket hazırla
    let fontSizeLabel = 'normal';
    if (sizeValue <= 85) fontSizeLabel = 'small';
    else if (sizeValue >= 120 && sizeValue < 140) fontSizeLabel = 'large';
    else if (sizeValue >= 140) fontSizeLabel = 'xlarge';
    
    document.documentElement.setAttribute('data-font-size', fontSizeLabel);
    
    return size;
  }

  /**
   * Azaltılmış hareket ayarını değiştirir ve kaydeder
   * @param {boolean} enabled - Azaltılmış hareket etkin/devre dışı
   */
  setReducedMotion(enabled) {
    // Boolean değere çevir
    enabled = !!enabled;
    
    // Ayarı uygula
    this.applyReducedMotion(enabled);
    
    // Ayarı localStorage'a kaydet
    localStorage.setItem('reducedMotion', enabled.toString());
    
    // settings-panel.css ile uyumlu olması için
    document.documentElement.setAttribute('data-reduced-motion', enabled.toString());
    
    return enabled;
  }

  /**
   * Belirli bir olayı dinlemek için fonksiyon ekler
   * @param {string} event - Olay adı
   * @param {function} callback - Çağrılacak fonksiyon
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      return;
    }
    
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
    return this;
  }

  /**
   * Belirli bir olayı dinlemekten vazgeçer
   * @param {string} event - Olay adı
   * @param {function} callback - Kaldırılacak fonksiyon
   */
  off(event, callback) {
    if (!this.eventListeners[event]) {
      return;
    }
    
    this.eventListeners[event] = this.eventListeners[event].filter(
      cb => cb !== callback
    );
    
    return this;
  }

  /**
   * Belirli bir olayı tetikler ve dinleyicileri çağırır
   * @param {string} event - Olay adı
   * @param {any} data - Olayla ilgili veri
   */
  emit(event, data) {
    if (!this.eventListeners[event]) {
      return;
    }
    
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
        } catch (error) {
        console.error(`[ThemeManager] Event callback error for ${event}:`, error);
      }
    });
    
    return this;
  }

  /**
   * Sistem teması değişikliğini işler
   * @param {MediaQueryListEvent} event - Medya sorgusu olayı
   */
  handleSystemThemeChange(event) {
    // Eğer tema modu system ise, yeni sistem temasını uygula
    if (this.settings.themeMode === 'system') {
      const newTheme = event.matches ? 'dark' : 'light';
      this.applyThemeMode(newTheme);
      this.emit('systemThemeChange', newTheme);
    }
    
    this.log('Sistem teması değişti:', event.matches ? 'dark' : 'light');
  }

  /**
   * Sistem animasyon tercihleri değişikliğini işler
   * @param {MediaQueryListEvent} event - Medya sorgusu olayı
   */
  handleReducedMotionChange(event) {
    // Kullanıcı manuel bir ayar yapmadıysa, sistem ayarlarını takip et
    if (localStorage.getItem('reducedMotion') === null) {
      const reducedMotion = event.matches;
      this.applyReducedMotion(reducedMotion);
      this.emit('systemReducedMotionChange', reducedMotion);
    }
    
    this.log('Sistem animasyon tercihi değişti:', event.matches ? 'azaltılmış' : 'normal');
  }

  /**
   * Debounce fonksiyonu - sık çağrılan fonksiyonların performansını iyileştirir
   * @param {function} func - Çağrılacak fonksiyon
   * @param {number} wait - Bekleme süresi (ms)
   */
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  /**
   * Sınıfı ve olay dinleyicilerini temizler
   */
  destroy() {
    // Event listener'ları kaldır
        this.darkModeMediaQuery.removeEventListener('change', this.handleSystemThemeChange);
        this.reducedMotionMediaQuery.removeEventListener('change', this.handleReducedMotionChange);
    
    // Event listener dizisini temizle
    this.eventListeners = {};
    
    // Sınıf değişkenlerini temizle
    this.settings = null;
    this.options = null;
    
    this.log('ThemeManager kapatıldı');
  }

  /**
   * Debug log mesajları
   */
  log(...args) {
    if (this.debug) {
      console.log('[ThemeManager]', ...args);
    }
  }
}

// Sayfa yüklendiğinde ThemeManager'ı otomatik başlat
document.addEventListener('DOMContentLoaded', () => {
  if (!window.themeManager) {
    window.themeManager = new ThemeManager();
    console.log('ThemeManager otomatik olarak başlatıldı');
  }
}); 