/**
 * Ayarlar Paneli - Gürel Yönetim Tema Sistemi
 * 
 * Bu modül, kullanıcı teması ayarları için bir kontrol paneli oluşturur.
 * ThemeManager ile entegre çalışır.
 */

class SettingsPanel {
  constructor(options = {}) {
    // Varsayılan ayarlar
    this.defaults = {
      panelPosition: 'right', // right, left, bottom
      colorThemes: [
        { name: 'Mavi', color: '#0055a4', theme: 'blue' },
        { name: 'Kırmızı', color: '#d93025', theme: 'red' },
        { name: 'Yeşil', color: '#188038', theme: 'green' },
        { name: 'Turuncu', color: '#ea8600', theme: 'orange' },
        { name: 'Mor', color: '#7b1fa2', theme: 'purple' }
      ],
      fontSizes: {
        small: '85%',
        normal: '100%',
        large: '120%'
      },
      debug: true  // Debug modu açık, sorunu görmek için
    };

    // Kullanıcı ayarları ile birleştir
    this.options = {
      ...this.defaults,
      ...options
    };

    // Panel elementleri
    this.panel = null;
    this.toggleButton = null;
    this.isOpen = false;

    // ThemeManager'a erişim
    this.themeManager = window.themeManager;
    
    // Başlat
    this.init();
  }

  /**
   * Ayarlar panelini initialize eder
   */
  init() {
    console.log('SettingsPanel.init() çağrıldı');
    
    // Panel elementlerini seç
    this.panel = document.getElementById('settingsPanel');
    this.toggleButton = document.getElementById('settingsToggle');
    
    if (!this.panel) {
      console.error('Panel elemanı bulunamadı! #settingsPanel ID\'li eleman eksik.');
      return;
    }
    
    if (!this.toggleButton) {
      console.error('Toggle butonu bulunamadı! #settingsToggle ID\'li eleman eksik.');
      return;
    }
    
    // ThemeManager'ı kontrol et - eğer yüklü değilse tekrar dene
    if (!this.themeManager) {
      console.warn('ThemeManager bulunamadı. Yüklenmeyi bekliyorum...');
      
      // ThemeManager'ın yüklenmesini bekle
      const checkThemeManager = setInterval(() => {
        this.themeManager = window.themeManager;
        if (this.themeManager) {
          console.log('ThemeManager bulundu, devam ediliyor');
          clearInterval(checkThemeManager);
          this.completeInitialization();
        }
      }, 100);
      
      // 3 saniye sonra hala bulunamazsa hata ver ve devam et
      setTimeout(() => {
        if (!this.themeManager) {
          console.error('ThemeManager 3 saniye içinde yüklenemedi.');
          clearInterval(checkThemeManager);
          
          // Manuel ThemeManager oluştur
          window.themeManager = {
            settings: { theme: 'light', fontSize: 'normal', colorTheme: 'blue' },
            setTheme: function(theme) { 
              console.log('Manuel ThemeManager: setTheme', theme);
              document.documentElement.setAttribute('data-theme', theme);
              this.settings.theme = theme;
            },
            setFontSize: function(size) { 
              console.log('Manuel ThemeManager: setFontSize', size);
              document.documentElement.style.fontSize = size === 'small' ? '85%' : size === 'large' ? '120%' : '100%';
              this.settings.fontSize = size;
            },
            setColorTheme: function(theme) { 
              console.log('Manuel ThemeManager: setColorTheme', theme);
              document.documentElement.setAttribute('data-color-theme', theme);
              this.settings.colorTheme = theme;
            },
            on: function(event, callback) {
              console.log('Manuel ThemeManager: on', event);
            }
          };
          
          this.themeManager = window.themeManager;
          this.completeInitialization();
        }
      }, 3000);
      
      return;
    }
    
    // ThemeManager zaten yüklüyse devam et
    this.completeInitialization();
  }
  
  /**
   * ThemeManager kontrolü sonrası başlatmayı tamamla
   */
  completeInitialization() {
    console.log('SettingsPanel.completeInitialization() çağrıldı');
    
    // Tema değiştiren elementleri initialize et
    this.initThemeToggle();
    this.initContrastToggle();
    this.initFontSizeControls();
    this.initColorOptions();
    
    // Olay dinleyicileri ekle
    this.attachEventListeners();
    
    // UI'ı güncelle
    this.updateUI();
    
    console.log('SettingsPanel başlatma tamamlandı');
  }
  
  /**
   * Tema toggle düğmesini başlatır
   */
  initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
      console.error('themeToggle elementi bulunamadı!');
      return;
    }
    
    // Mevcut durumu ayarla
    if (this.themeManager && this.themeManager.settings) {
      themeToggle.checked = this.themeManager.settings.theme === 'dark';
      this.updateThemePreview(themeToggle.checked);
    }
    
    // Olay dinleyici ekle
    themeToggle.addEventListener('change', () => {
      console.log('Tema değiştiriliyor: ', themeToggle.checked ? 'dark' : 'light');
      const newTheme = themeToggle.checked ? 'dark' : 'light';
      
      // Tema önizlemesini güncelle
      this.updateThemePreview(themeToggle.checked);
      
      if (this.themeManager) {
        this.themeManager.setTheme(newTheme);
      } else {
        // ThemeManager yoksa manuel olarak tema değiştir
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Custom event gönder
        const event = new CustomEvent('themeChanged', { detail: { theme: newTheme } });
        document.dispatchEvent(event);
      }
    });
  }
  
  /**
   * Kontrast toggle düğmesini başlatır
   */
  initContrastToggle() {
    const contrastToggle = document.getElementById('contrastToggle');
    if (!contrastToggle) {
      console.error('contrastToggle elementi bulunamadı!');
      return;
    }
    
    // Mevcut durumu ayarla
    if (this.themeManager && this.themeManager.settings) {
      contrastToggle.checked = this.themeManager.settings.theme === 'highContrast';
    }
    
    // Olay dinleyici ekle
    contrastToggle.addEventListener('change', () => {
      console.log('Kontrast değiştiriliyor: ', contrastToggle.checked ? 'highContrast' : 'light');
      const newTheme = contrastToggle.checked ? 'highContrast' : 'light';
      if (this.themeManager) {
        this.themeManager.setTheme(newTheme);
      } else {
        // ThemeManager yoksa manuel olarak tema değiştir
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    });
  }
  
  /**
   * Font boyutu kontrollerini başlatır
   */
  initFontSizeControls() {
    const decreaseBtn = document.getElementById('decreaseFontSize');
    const increaseBtn = document.getElementById('increaseFontSize');
    const fontSizeDisplay = document.getElementById('currentFontSize');
    
    if (!decreaseBtn || !increaseBtn || !fontSizeDisplay) {
      console.error('Font boyutu kontrol elementleri bulunamadı!');
      return;
    }
    
    // Font boyutunu görüntüle
    this.updateFontSizeDisplay(fontSizeDisplay);
    
    // Azaltma butonu
    decreaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Font boyutu azaltılıyor');
      
      const fontSize = this.themeManager && this.themeManager.settings ? this.themeManager.settings.fontSize : 'normal';
      let newSize = 'normal';
      
      if (fontSize === 'normal') {
        newSize = 'small';
      } else if (fontSize === 'large') {
        newSize = 'normal';
      }
      
      this.setFontSize(newSize);
      this.updateFontSizeDisplay(fontSizeDisplay);
      
      // Buton etkisi
      decreaseBtn.classList.add('clicked');
      setTimeout(() => decreaseBtn.classList.remove('clicked'), 300);
    });
    
    // Artırma butonu
    increaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Font boyutu artırılıyor');
      
      const fontSize = this.themeManager && this.themeManager.settings ? this.themeManager.settings.fontSize : 'normal';
      let newSize = 'normal';
      
      if (fontSize === 'normal') {
        newSize = 'large';
      } else if (fontSize === 'small') {
        newSize = 'normal';
      }
      
      this.setFontSize(newSize);
      this.updateFontSizeDisplay(fontSizeDisplay);
      
      // Buton etkisi
      increaseBtn.classList.add('clicked');
      setTimeout(() => increaseBtn.classList.remove('clicked'), 300);
    });
  }
  
  /**
   * Font boyutunu ayarlar
   */
  setFontSize(size) {
    if (this.themeManager) {
      this.themeManager.setFontSize(size);
      console.log('Font boyutu ayarlandı:', size);
    } else {
      // ThemeManager yoksa manuel olarak font boyutu değiştir
      const fontSizeValue = 
        size === 'small' ? '85%' : 
        size === 'large' ? '120%' : '100%';
        
      document.documentElement.style.fontSize = fontSizeValue;
      console.log('Font boyutu manuel ayarlandı:', size, fontSizeValue);
      
      // Custom event gönder - bazı komponentler bunu dinliyor olabilir
      const event = new CustomEvent('fontSizeChanged', { detail: { fontSize: size, value: fontSizeValue } });
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Font boyutu göstergesini günceller
   */
  updateFontSizeDisplay(display) {
    if (!display) return;
    
    const fontSize = this.themeManager && this.themeManager.settings ? this.themeManager.settings.fontSize : 'normal';
    const sizeText = this.options.fontSizes[fontSize] || '100%';
    console.log('Font boyutu göstergesi güncelleniyor:', fontSize, sizeText);
    display.textContent = sizeText;
    
    // Animasyon efekti
    display.classList.add('updated');
    setTimeout(() => display.classList.remove('updated'), 500);
  }
  
  /**
   * Renk seçeneklerini başlatır
   */
  initColorOptions() {
    const colorOptions = document.querySelectorAll('.color-option');
    if (!colorOptions.length) {
      console.error('Renk seçenekleri bulunamadı!');
      return;
    }
    
    // İlk durumda aktif rengi ayarla
    if (this.themeManager && this.themeManager.settings) {
      this.updateColorOptions(colorOptions, this.themeManager.settings.colorTheme);
    }
    
    // Her bir renk seçeneği için event listener ekle
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        const colorTheme = option.getAttribute('data-theme');
        const colorValue = option.getAttribute('data-color');
        
        if (colorTheme) {
          console.log('Renk teması değiştiriliyor:', colorTheme, colorValue);
          
          // Animasyon efekti
          option.classList.add('clicked');
          setTimeout(() => option.classList.remove('clicked'), 300);
          
          // Renk temasını ayarla
          this.setColorTheme(colorTheme, colorValue);
          this.updateColorOptions(colorOptions, colorTheme);
        }
      });
    });
  }
  
  /**
   * Renk temasını ayarlar
   */
  setColorTheme(theme, color) {
    if (this.themeManager) {
      this.themeManager.setColorTheme(theme);
    } else {
      // ThemeManager yoksa manuel olarak renk teması değiştir
      document.documentElement.setAttribute('data-color-theme', theme);
      
      // CSS değişkenlerini güncelle
      document.documentElement.style.setProperty('--primary-color', color);
      document.documentElement.style.setProperty('--primary-color-dark', this.adjustColorBrightness(color, -20));
      document.documentElement.style.setProperty('--primary-color-light', this.adjustColorBrightness(color, 20));
      
      // Custom event gönder
      const event = new CustomEvent('colorThemeChanged', { detail: { theme, color } });
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Rengin parlaklığını ayarlar
   */
  adjustColorBrightness(hex, percent) {
    hex = hex.replace(/^\s*#|\s*$/g, '');
    
    // 3 karakterli hex'i 6 karaktere dönüştür
    if(hex.length == 3) {
      hex = hex.replace(/(.)/g, '$1$1');
    }
    
    // Hex'i RGB'ye dönüştür
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    
    // Parlaklığı ayarla
    r = this.clamp(r + Math.floor(r * (percent / 100)), 0, 255);
    g = this.clamp(g + Math.floor(g * (percent / 100)), 0, 255);
    b = this.clamp(b + Math.floor(b * (percent / 100)), 0, 255);
    
    // RGB'yi hex'e dönüştür
    return '#' + 
      ((r < 16 ? '0' : '') + r.toString(16)) +
      ((g < 16 ? '0' : '') + g.toString(16)) +
      ((b < 16 ? '0' : '') + b.toString(16));
  }
  
  /**
   * Değeri belirli bir aralıkta tutar
   */
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }
  
  /**
   * Renk seçeneklerinin aktif durumunu günceller
   */
  updateColorOptions(options, activeTheme) {
    options.forEach(option => {
      const theme = option.getAttribute('data-theme');
      if (theme === activeTheme) {
        option.classList.add('active');
        
        // Diğer elemanlarda aktif renkten stil için kullan
        document.documentElement.style.setProperty('--active-color', option.getAttribute('data-color'));
      } else {
        option.classList.remove('active');
      }
    });
  }

  /**
   * Olayları bağlar
   */
  attachEventListeners() {    
    console.log('Panel event listenerları ekleniyor');
    
    // Toggle düğmesi
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Tıklama olayının yayılmasını durdur
        console.log('Settings toggle düğmesine tıklandı');
        this.togglePanel();
      });
    }
    
    // Kapatma düğmesi
    const closeButton = document.getElementById('settingsClose');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Settings panel kapatma düğmesine tıklandı');
        this.closePanel();
      });
    }
    
    // Panel dışı tıklama - DÜZELTME
    document.addEventListener('click', (e) => {
      if (this.isOpen && 
          this.panel && 
          !this.panel.contains(e.target) && 
          e.target !== this.toggleButton &&
          !this.toggleButton.contains(e.target)) {
        console.log('Panel dışına tıklandı, panel kapatılıyor');
        this.closePanel();
      }
    });
    
    // ESC tuşu
    document.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        console.log('ESC tuşuna basıldı, panel kapatılıyor');
        this.closePanel();
      }
    });
  }

  /**
   * Panel açılıp/kapanmasını kontrol eder - DÜZELTME
   */
  togglePanel() {
    console.log('togglePanel fonksiyonu çağrıldı');
    
    // Timeout ekleyerek aynı çevrimde açılıp kapanma sorununu önle
    setTimeout(() => {
      if (this.isOpen) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }, 10);
  }

  /**
   * Paneli açar - BASİTLEŞTİRİLDİ
   */
  openPanel() {
    if (!this.panel) return;
    
    // 1. Panel sınıfı ekle
    this.panel.classList.add('open');
    
    // 2. Panel durumunu güncelle
    this.isOpen = true;
    
    // 3. ARIA güncelle
    if (this.toggleButton) {
      this.toggleButton.setAttribute('aria-expanded', 'true');
    }
    
    console.log('Panel açıldı:', this.isOpen);
  }

  /**
   * Paneli kapatır - BASİTLEŞTİRİLDİ
   */
  closePanel() {
    if (!this.panel) return;
    
    // 1. Panel sınıfını kaldır
    this.panel.classList.remove('open');
    
    // 2. Panel durumunu güncelle
    this.isOpen = false;
    
    // 3. ARIA güncelle
    if (this.toggleButton) {
      this.toggleButton.setAttribute('aria-expanded', 'false');
    }
    
    console.log('Panel kapatıldı:', this.isOpen);
  }

  /**
   * UI güncellemesi yapar
   */
  updateUI() {
    console.log('updateUI fonksiyonu çağrıldı');
    
    // Tema toggle durumunu güncelle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle && this.themeManager && this.themeManager.settings) {
      themeToggle.checked = this.themeManager.settings.theme === 'dark';
    }
    
    // Kontrast toggle durumunu güncelle
    const contrastToggle = document.getElementById('contrastToggle');
    if (contrastToggle && this.themeManager && this.themeManager.settings) {
      contrastToggle.checked = this.themeManager.settings.theme === 'highContrast';
    }
    
    // Font boyutu göstergesini güncelle
    const fontSizeDisplay = document.getElementById('currentFontSize');
    this.updateFontSizeDisplay(fontSizeDisplay);
    
    // Renk seçeneklerini güncelle
    const colorOptions = document.querySelectorAll('.color-option');
    if (colorOptions.length && this.themeManager && this.themeManager.settings) {
      this.updateColorOptions(colorOptions, this.themeManager.settings.colorTheme);
    }
  }

  /**
   * Tema önizlemesini günceller (güneş/ay animasyonu)
   */
  updateThemePreview(isDark) {
    const preview = document.querySelector('.theme-preview');
    if (!preview) return;
    
    if (isDark) {
      preview.classList.add('dark-preview');
    } else {
      preview.classList.remove('dark-preview');
    }
  }
}

// Sayfa yüklendiğinde otomatik olarak başlat
document.addEventListener('DOMContentLoaded', () => {
  console.log('SettingsPanel başlatılıyor - DOMContentLoaded');
  
  // SettingsPanel'i global olarak tanımla
  window.settingsPanel = new SettingsPanel();
});

// ThemeManager'ın yüklenmesini beklemek için ek güvenlik (başlangıç kodumuz çalışmazsa)
window.addEventListener('load', () => {
  console.log('SettingsPanel kontrol ediliyor - window.load');
  // SettingsPanel'i kontrol et, yoksa oluştur
  if (!window.settingsPanel) {
    console.log('SettingsPanel yüklenememiş, tekrar başlatılıyor');
    window.settingsPanel = new SettingsPanel();
  }
});

// Global erişim için
// export default SettingsPanel; 