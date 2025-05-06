/**
 * Tema Yöneticisi - Gürel Yönetim
 * Sürüm: 2.0.1
 * 
 * Sitenin tema ve görünüm ayarlarını yöneten sınıf.
 * Bu sınıf, kullanıcı tema tercihlerini yönetir, localStorage'a kaydeder 
 * ve HTML elementlerine uygular.
 */

class ThemeManager {
  constructor(options = {}) {
    // Varsayılan ayarlar
    this.defaults = {
      theme: 'light',          // light, dark, highContrast
      colorTheme: 'blue',      // blue, red, green, orange, purple
      fontSize: 'normal',      // small, normal, large
      animations: true,        // true, false
      useSystemPreferences: true, // Sistem tercihlerini kullan
      followSystemChanges: true,  // Sistem değişikliklerini takip et
      autoSave: true           // Değişiklikleri otomatik kaydet
    };

    // Renk temalarının değerlerini tanımla
    this.colorValues = {
      blue: '#0055a4',
      red: '#d93025',
      green: '#188038',
      orange: '#ea8600',
      purple: '#7b1fa2'
    };
    
    // Font boyutu değerlerini tanımla
    this.fontSizeValues = {
      small: '85%',
      normal: '100%',
      large: '120%'
    };

    // Kullanıcı seçeneklerini varsayılanlarla birleştir
    this.options = {
      ...this.defaults,
      ...options
    };

    // localStorage'dan ayarları yükle veya varsayılanları kullan
    this.settings = this.loadSettings();

    // Sistem tercihlerini izleyen medya sorguları
    this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Olay dinleyicileri için kayıtları tutan bir dizi
    this.eventListeners = [];

    // Başlat
    this.init();
  }

  /**
   * Tema yöneticisini başlatır ve sistem tercihlerini kontrol eder
   */
  init() {
    // Tema ayarlarını uygula
    this.applySettings();

    // Sistem renk şeması değişikliklerini izle
    if (this.options.followSystemChanges) {
      this.darkModeMediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
      this.reducedMotionMediaQuery.addEventListener('change', this.handleReducedMotionChange.bind(this));
    }
    
    // CSS geçişlerini etkinleştir
    document.documentElement.classList.add('theme-transition');

    // Temayı hemen uygulamak için olay tetikle
    this.emit('themeChanged', this.settings);
  }

  /**
   * Kullanıcı ayarlarını localStorage'dan yükler
   * @returns {Object} Yüklenen ayarlar
   */
  loadSettings() {
    let settings;
    
    try {
      // localStorage'dan kayıtlı tema ayarlarını al
      const savedSettings = localStorage.getItem('themeSettings');
      settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      // Sistem tercihlerini al (sadece başlangıçta)
      if (this.options.useSystemPreferences) {
        // Kullanıcı daha önce tema seçimi yapmadıysa sistem tercihini kullan
        if (!savedSettings || !settings.hasOwnProperty('theme')) {
          settings.theme = this.darkModeMediaQuery.matches ? 'dark' : 'light';
        }
        
        // Kullanıcı daha önce animasyon seçimi yapmadıysa sistem tercihini kullan
        if (!savedSettings || !settings.hasOwnProperty('animations')) {
          settings.animations = !this.reducedMotionMediaQuery.matches;
        }
      }
    } catch (error) {
      console.error('Tema ayarları yüklenirken hata oluştu:', error);
      settings = {};
    }

    // Eksik ayarları varsayılanlarla tamamla
    return {
      ...this.defaults,
      ...settings
    };
  }

  /**
   * Tema ayarlarını localStorage'a kaydeder
   */
  saveSettings() {
    try {
      localStorage.setItem('themeSettings', JSON.stringify(this.settings));
      this.emit('settingsSaved', this.settings);
    } catch (error) {
      console.error('Tema ayarları kaydedilirken hata oluştu:', error);
    }
  }

  /**
   * Mevcut ayarları HTML elementlerine uygular
   */
  applySettings() {
    const { theme, colorTheme, fontSize, animations } = this.settings;
    const html = document.documentElement;

    // Tema modunu uygula
    html.setAttribute('data-theme', theme);
    
    // Renk temasını uygula
    html.style.setProperty('--primary-color', this.colorValues[colorTheme] || this.colorValues.blue);
    html.setAttribute('data-color-theme', colorTheme);
    
    // Font boyutunu uygula - Bunu doğrudan style olarak ayarla
    html.style.fontSize = this.fontSizeValues[fontSize] || this.fontSizeValues.normal;
    html.setAttribute('data-font-size', fontSize);
    
    // Animasyon durumunu uygula
    html.setAttribute('data-reduced-motion', !animations);
    
    // Body sınıflarını güncelle (eski siteler için geriye uyumluluk)
    document.body.classList.remove('light-mode', 'dark-mode', 'high-contrast');
    
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else if (theme === 'highContrast') {
      document.body.classList.add('high-contrast');
    }
    
    // Değişiklikleri bildir
    this.emit('themeApplied', this.settings);
  }

  /**
   * Tema modunu değiştirir ve kaydeder
   * @param {string} theme - Tema modu (light, dark, highContrast)
   */
  setTheme(theme) {
    if (this.settings.theme === theme) return;
    
    this.settings.theme = theme;
    this.applySettings();
    
    if (this.options.autoSave) {
      this.saveSettings();
    }

    this.emit('themeChanged', this.settings);
  }

  /**
   * Renk temasını değiştirir ve kaydeder
   * @param {string} colorTheme - Renk teması (blue, red, green, orange, purple)
   */
  setColorTheme(colorTheme) {
    if (this.settings.colorTheme === colorTheme) return;
    
    this.settings.colorTheme = colorTheme;
    this.applySettings();
    
    if (this.options.autoSave) {
      this.saveSettings();
    }
    
    this.emit('colorThemeChanged', this.settings);
  }

  /**
   * Font boyutunu değiştirir ve kaydeder
   * @param {string} fontSize - Font boyutu (small, normal, large)
   */
  setFontSize(fontSize) {
    if (this.settings.fontSize === fontSize) return;
    
    // Font size değişikliğini doğrula
    if (!this.fontSizeValues[fontSize]) {
      console.error(`Geçersiz font boyutu: ${fontSize}. Geçerli değerler: small, normal, large`);
      return;
    }
    
    console.log('ThemeManager.setFontSize çağrıldı:', fontSize);
    
    // Ayarı güncelle
    this.settings.fontSize = fontSize;
    
    // Font size'ı doğrudan document.documentElement.style.fontSize olarak ayarla
    document.documentElement.style.fontSize = this.fontSizeValues[fontSize];
    document.documentElement.setAttribute('data-font-size', fontSize);
    
    // Konsola geçerli font boyutunu yazdır
    console.log('Yeni font size uygulandı:', {
      fontSize: fontSize,
      value: this.fontSizeValues[fontSize],
      appliedValue: document.documentElement.style.fontSize
    });
    
    if (this.options.autoSave) {
      this.saveSettings();
    }
    
    // Değişikliği bildir (olay yayınla)
    this.emit('fontSizeChanged', this.settings);
  }

  /**
   * Animasyon durumunu değiştirir ve kaydeder
   * @param {boolean} enabled - Animasyon durumu
   */
  setAnimations(enabled) {
    if (this.settings.animations === enabled) return;
    
    this.settings.animations = enabled;
    this.applySettings();
    
    if (this.options.autoSave) {
      this.saveSettings();
    }
    
    this.emit('animationsChanged', this.settings);
  }

  /**
   * Kullanıcının özel bir temayı kaydetmesini sağlar
   * @param {string} name - Tema adı
   * @returns {boolean} Başarılı olup olmadığı
   */
  saveCustomTheme(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Geçerli bir tema adı girmelisiniz');
    }
    
    // Özel temaları yükle
    let customThemes = this.getCustomThemes();
    
    // Aynı isimde tema var mı kontrol et
    if (customThemes[name] && !confirm(`"${name}" adında bir tema zaten var. Üzerine yazmak istiyor musunuz?`)) {
      return false;
    }
    
    // Mevcut ayarlarla özel temayı kaydet
    customThemes[name] = {
      name,
      theme: this.settings.theme,
      colorTheme: this.settings.colorTheme,
      fontSize: this.settings.fontSize,
      animations: this.settings.animations,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('customThemes', JSON.stringify(customThemes));
      this.emit('customThemeSaved', customThemes[name]);
      return true;
    } catch (error) {
      console.error('Özel tema kaydedilirken hata oluştu:', error);
      return false;
    }
  }

  /**
   * Belirli bir özel temayı uygular
   * @param {string} name - Özel tema adı
   * @returns {boolean} Başarılı olup olmadığı
   */
  applyCustomTheme(name) {
    const customThemes = this.getCustomThemes();
    const theme = customThemes[name];
    
    if (!theme) {
      console.error(`"${name}" adında bir özel tema bulunamadı`);
      return false;
    }
    
    // Özel temanın ayarlarını geçerli ayarlara uygula
    this.settings.theme = theme.theme || this.defaults.theme;
    this.settings.colorTheme = theme.colorTheme || this.defaults.colorTheme;
    this.settings.fontSize = theme.fontSize || this.defaults.fontSize;
    this.settings.animations = theme.animations !== undefined ? theme.animations : this.defaults.animations;
    
    // Ayarları uygula
    this.applySettings();
    
    if (this.options.autoSave) {
      this.saveSettings();
    }
    
    this.emit('customThemeApplied', theme);
    return true;
  }

  /**
   * Bir özel temayı siler
   * @param {string} name - Özel tema adı
   * @returns {boolean} Başarılı olup olmadığı
   */
  deleteCustomTheme(name) {
    const customThemes = this.getCustomThemes();
    
    if (!customThemes[name]) {
      console.error(`"${name}" adında bir özel tema bulunamadı`);
      return false;
    }
    
    delete customThemes[name];
    
    try {
      localStorage.setItem('customThemes', JSON.stringify(customThemes));
      this.emit('customThemeDeleted', { name });
      return true;
    } catch (error) {
      console.error('Özel tema silinirken hata oluştu:', error);
      return false;
    }
  }

  /**
   * Kullanıcının kaydettiği özel temaları getirir
   * @returns {Object} Özel temalar
   */
  getCustomThemes() {
    try {
      const savedThemes = localStorage.getItem('customThemes');
      return savedThemes ? JSON.parse(savedThemes) : {};
    } catch (error) {
      console.error('Özel temalar yüklenirken hata oluştu:', error);
      return {};
    }
  }

  /**
   * Tema ayarlarını varsayılan değerlere sıfırlar
   */
  resetToDefaults() {
    this.settings = {...this.defaults};
    this.applySettings();
    
    if (this.options.autoSave) {
      this.saveSettings();
    }
    
    this.emit('settingsReset', this.settings);
  }

  /**
   * Sistem teması değiştiğinde çağrılır
   * @param {Event} event - MediaQuery değişim olayı
   */
  handleSystemThemeChange(event) {
    // Sistem teması değişikliğini sadece otomatik tema seçiliyse uygula
    if (this.options.useSystemPreferences) {
      const newTheme = event.matches ? 'dark' : 'light';
      
      // Kullanıcı manuel olarak tema seçmiş mi kontrol et
      if (localStorage.getItem('themeSettings') && 
          JSON.parse(localStorage.getItem('themeSettings')).hasOwnProperty('theme')) {
        // Kullanıcı manuel olarak tema seçmişse, değişikliği uygulama
        this.emit('systemThemeChanged', { newTheme, applied: false });
      } else {
        // Otomatik seçim etkinse, yeni temayı uygula
        this.setTheme(newTheme);
        this.emit('systemThemeChanged', { newTheme, applied: true });
      }
    }
  }

  /**
   * Sistem animasyon tercihi değiştiğinde çağrılır
   * @param {Event} event - MediaQuery değişim olayı
   */
  handleReducedMotionChange(event) {
    // Animasyon tercihini sadece otomatik animasyon seçiliyse uygula
    if (this.options.useSystemPreferences) {
      const newAnimationState = !event.matches;
      
      // Kullanıcı manuel olarak animasyon seçimi yapmış mı kontrol et
      if (localStorage.getItem('themeSettings') && 
          JSON.parse(localStorage.getItem('themeSettings')).hasOwnProperty('animations')) {
        // Kullanıcı manuel olarak animasyon seçmişse, değişikliği uygulama
        this.emit('systemReducedMotionChanged', { newAnimationState, applied: false });
      } else {
        // Otomatik seçim etkinse, yeni animasyon durumunu uygula
        this.setAnimations(newAnimationState);
        this.emit('systemReducedMotionChanged', { newAnimationState, applied: true });
      }
    }
  }

  /**
   * Olay dinleme işlevi
   * @param {string} event - Olay adı
   * @param {Function} callback - Çağrılacak fonksiyon
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      console.error('Event callback bir fonksiyon olmalıdır');
      return;
    }
    
    this.eventListeners.push({ event, callback });
  }

  /**
   * Olay dinlemeyi durdurma işlevi
   * @param {string} event - Olay adı
   * @param {Function} callback - Durdurulacak fonksiyon
   */
  off(event, callback) {
    this.eventListeners = this.eventListeners.filter(listener => {
      return listener.event !== event || listener.callback !== callback;
    });
  }

  /**
   * Olay tetikleme işlevi
   * @param {string} event - Olay adı
   * @param {any} data - Olayla birlikte gönderilecek veri
   */
  emit(event, data) {
    this.eventListeners
      .filter(listener => listener.event === event)
      .forEach(listener => {
        try {
          listener.callback(data);
        } catch (error) {
          console.error(`Event listener (${event}) hata verdi:`, error);
        }
      });
  }

  /**
   * Sistem tercihlerini döndürür
   * @returns {Object} Sistem tercihleri
   */
  getSystemPreferences() {
    return {
      isDarkMode: this.darkModeMediaQuery.matches,
      prefersReducedMotion: this.reducedMotionMediaQuery.matches
    };
  }

  /**
   * Tema yöneticisini temizler
   */
  destroy() {
    // Medya sorgu dinleyicilerini temizle
    this.darkModeMediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    this.reducedMotionMediaQuery.removeEventListener('change', this.handleReducedMotionChange);
    
    // Olay dinleyicilerini temizle
    this.eventListeners = [];
    
    // CSS sınıfını kaldır
    document.documentElement.classList.remove('theme-transition');
    
    this.emit('destroyed');
  }
}

// Sayfa yüklendiğinde tema yöneticisini başlat
document.addEventListener('DOMContentLoaded', () => {
  // Global erişim için 
  window.themeManager = new ThemeManager({
    debug: false  // Debug modunu kapat, konsol mesajlarını azalt
  });
});

// ES Modules için dışa aktar
export default ThemeManager; 