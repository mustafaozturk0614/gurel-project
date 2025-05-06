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
      debug: false  // Debug modu kapalı 
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
            settings: { theme: 'light', fontSize: 'normal', colorTheme: 'blue' }, // Varsayılan olarak light tema
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
    
    // Mevcut tema durumunu kontrol et ve toggle'ı ayarla
    if (this.themeManager && this.themeManager.settings) {
      const currentTheme = this.themeManager.settings.theme;
      themeToggle.checked = currentTheme === 'dark';
      this.updateThemePreview(themeToggle.checked);
      
      // Etiketleri güncelle
      this.updateToggleLabels(currentTheme);
    }
    
    // Olay dinleyici ekle
    themeToggle.addEventListener('change', () => {
      console.log('Tema değiştiriliyor: ', themeToggle.checked ? 'dark' : 'light');
      const newTheme = themeToggle.checked ? 'dark' : 'light';
      
      // Tema önizlemesini güncelle
      this.updateThemePreview(themeToggle.checked);
      
      if (this.themeManager) {
        this.themeManager.setTheme(newTheme);
        // Etiketleri güncelle
        this.updateToggleLabels(newTheme);
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
   * Tema durumuna göre toggle etiketlerini günceller
   * @param {string} theme - Mevcut tema (light, dark, highContrast)
   */
  updateToggleLabels(theme) {
    const darkModeLabel = document.querySelector('label[for="themeToggle"]');
    const highContrastLabel = document.querySelector('label[for="contrastToggle"]');
    
    if (darkModeLabel) {
      // Dark mod etiketini güncelle
      if (theme === 'dark') {
        darkModeLabel.textContent = 'Açık Moda Geç';
        darkModeLabel.style.color = '#ffffff';
      } else {
        darkModeLabel.textContent = 'Karanlık Mod';
        darkModeLabel.style.color = '#333333';
      }
    }
    
    if (highContrastLabel) {
      // Yüksek kontrast etiketini güncelle
      if (theme === 'highContrast') {
        highContrastLabel.textContent = 'Normal Kontrasta Geç';
        highContrastLabel.style.color = '#ffffff';
      } else {
        highContrastLabel.textContent = 'Yüksek Kontrast';
        highContrastLabel.style.color = theme === 'dark' ? '#ffffff' : '#333333';
      }
    }
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
      
      // Etiket güncelle
      this.updateToggleLabels(this.themeManager.settings.theme);
    }
    
    // Olay dinleyici ekle
    contrastToggle.addEventListener('change', () => {
      console.log('Kontrast değiştiriliyor: ', contrastToggle.checked ? 'highContrast' : 'light');
      const newTheme = contrastToggle.checked ? 'highContrast' : 'light';
      if (this.themeManager) {
        this.themeManager.setTheme(newTheme);
        // Etiketleri güncelle
        this.updateToggleLabels(newTheme);
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
   * Font boyutunu değiştirir
   * @param {string} size - Font boyutu (small, normal, large)
   */
  setFontSize(size) {
    if (!size || !['small', 'normal', 'large'].includes(size)) {
      console.error('Geçersiz font boyutu:', size);
      return;
    }
    
    if (this.themeManager) {
      this.themeManager.setFontSize(size);
    } else {
      // ThemeManager yoksa manuel olarak font boyutunu değiştir
      const sizeValues = {
        small: '85%',
        normal: '100%',
        large: '120%'
      };
      
      document.documentElement.style.fontSize = sizeValues[size];
    }
  }
  
  /**
   * Font boyutu göstergesi güncellenir
   * @param {HTMLElement} display - Font boyutu gösteren element
   */
  updateFontSizeDisplay(display) {
    if (!display) return;
    
    const fontSize = this.themeManager && this.themeManager.settings 
      ? this.themeManager.settings.fontSize 
      : 'normal';
    
    // Yüzde değeri oluştur
    let percentValue;
    if (fontSize === 'small') percentValue = '85%';
    else if (fontSize === 'large') percentValue = '120%';
    else percentValue = '100%';
    
    // Değeri göster
    display.textContent = percentValue;
    display.classList.add('updated');
    setTimeout(() => display.classList.remove('updated'), 500);
  }
  
  /**
   * Renk tema seçeneklerini başlatır
   */
  initColorOptions() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    if (!colorOptions || colorOptions.length === 0) {
      console.error('Renk seçenekleri bulunamadı!');
      return;
    }
    
    // Mevcut renk temasını al
    const currentTheme = this.themeManager && this.themeManager.settings 
      ? this.themeManager.settings.colorTheme 
      : 'blue';
    
    // Renk seçeneklerini döngüye al ve olay dinleyicileri ekle
    colorOptions.forEach(option => {
      const theme = option.getAttribute('data-theme');
      const color = option.getAttribute('data-color');
      
      // Aktif rengi işaretle
      if (theme === currentTheme) {
        option.classList.add('active');
      }
      
      // Tıklama olayı ekle
      option.addEventListener('click', () => {
        // Önceki aktif seçeneği kaldır
        colorOptions.forEach(opt => opt.classList.remove('active'));
        
        // Yeni seçeneği aktif yap
        option.classList.add('active');
        
        // Tema rengini değiştir
        this.setColorTheme(theme, color);
        
        // Tıklama efekti
        option.classList.add('clicked');
        setTimeout(() => option.classList.remove('clicked'), 300);
      });
    });
    
    // Mevcut temayı güncelle
    this.updateColorOptions(colorOptions, currentTheme);
  }
  
  /**
   * Renk temasını değiştirir
   * @param {string} theme - Renk tema adı (blue, red, green, orange, purple)
   * @param {string} color - Renk değeri (hex kodu)
   */
  setColorTheme(theme, color) {
    if (!theme) return;
    
    if (this.themeManager) {
      this.themeManager.setColorTheme(theme);
    } else {
      // ThemeManager yoksa manuel olarak renk temasını değiştir
      document.documentElement.style.setProperty('--primary-color', color);
      document.documentElement.setAttribute('data-color-theme', theme);
    }
  }
  
  /**
   * Renk değerinin parlaklığını ayarlar
   * @param {string} hex - Hexadecimal renk değeri (#RRGGBB)
   * @param {number} percent - Parlaklık değişim yüzdesi (-100 ile 100 arası)
   * @returns {string} - Yeni hexadecimal renk değeri
   */
  adjustColorBrightness(hex, percent) {
    let r = parseInt(hex.substr(1, 2), 16),
        g = parseInt(hex.substr(3, 2), 16),
        b = parseInt(hex.substr(5, 2), 16);

    r = this.clamp(r + (percent * r / 100), 0, 255);
    g = this.clamp(g + (percent * g / 100), 0, 255);
    b = this.clamp(b + (percent * b / 100), 0, 255);

    const rStr = Math.round(r).toString(16).padStart(2, '0');
    const gStr = Math.round(g).toString(16).padStart(2, '0');
    const bStr = Math.round(b).toString(16).padStart(2, '0');

    return `#${rStr}${gStr}${bStr}`;
  }

  /**
   * Değeri belirli bir aralıkla sınırlar
   * @param {number} val - Değer
   * @param {number} min - Minimum değer
   * @param {number} max - Maksimum değer
   * @returns {number} - Sınırlanmış değer
   */
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  /**
   * Renk seçeneklerini günceller
   * @param {NodeList} options - Renk seçenek elementleri
   * @param {string} activeTheme - Aktif renk teması
   */
  updateColorOptions(options, activeTheme) {
    options.forEach(option => {
      const theme = option.getAttribute('data-theme');
      option.classList.toggle('active', theme === activeTheme);
    });
  }
  
  /**
   * Olay dinleyicilerini ekler
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
    
    // Panel dışına tıklama olayını izle ve panel açıksa kapat
    document.addEventListener('click', (e) => {
      // Panel açık değilse işlem yapma
      if (!this.isOpen) return;
      
      // Tıklanan element panelin içinde veya toggle butonu ise işlem yapma
      if (this.panel && this.panel.contains(e.target)) return;
      if (this.toggleButton && this.toggleButton.contains(e.target)) return;
      
      console.log('Panel dışına tıklandı, panel kapatılıyor');
      this.closePanel();
    });

    // ThemeManager olaylarını dinle
    if (this.themeManager) {
      // Tema değiştiğinde UI'ı güncelle
      this.themeManager.on('themeChanged', () => {
        this.updateUI();
      });
    } else {
      // ThemeManager yoksa doküman olaylarını dinle
      document.addEventListener('themeChanged', () => {
        this.updateUI();
      });
    }
  }

  /**
   * Paneli açıp kapatır
   */
  togglePanel() {
    console.log('togglePanel fonksiyonu çağrıldı');
    if (!this.panel) {
      console.error('Panel elementi tanımlı değil!');
      return;
    }
    
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }
  
  /**
   * Paneli açar
   */
  openPanel() {
    if (!this.panel) return;
    
    this.panel.classList.add('open');
    this.isOpen = true;
    
    // Olay tetikle
    console.log('Panel açıldı:', this.isOpen);
    
    // Tema rengine göre panelin stilini güncelle
    this.updatePanelStylesForTheme();
    
    // Açıldığında UI'ı güncelle
    this.updateUI();
  }
  
  /**
   * Paneli kapatır
   */
  closePanel() {
    if (!this.panel) return;
    
    this.panel.classList.remove('open');
    this.isOpen = false;
    
    // Olay tetikle
    console.log('Panel kapatıldı:', this.isOpen);
  }
  
  /**
   * Temaya göre panel stillerini günceller
   */
  updatePanelStylesForTheme() {
    if (!this.panel) return;
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Temaya göre panel text renklerini güncelle
    const allTextElements = this.panel.querySelectorAll('.settings-section > span, .toggle-label, #currentFontSize');
    allTextElements.forEach(element => {
      if (currentTheme === 'dark' || currentTheme === 'highContrast') {
        element.style.color = '#ffffff';
      } else {
        element.style.color = '#333333';
      }
    });
  }
  
  /**
   * Arayüzü günceller
   */
  updateUI() {
    if (!this.panel) return;
    
    // Mevcut ayarları al
    let currentTheme = 'light';
    let currentColorTheme = 'blue';
    let currentFontSize = 'normal';
    
    if (this.themeManager && this.themeManager.settings) {
      currentTheme = this.themeManager.settings.theme;
      currentColorTheme = this.themeManager.settings.colorTheme;
      currentFontSize = this.themeManager.settings.fontSize;
    } else {
      // ThemeManager yoksa doküman özelliklerinden oku
      currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      currentColorTheme = document.documentElement.getAttribute('data-color-theme') || 'blue';
    }
    
    // Toggle düğmelerini güncelle
    const themeToggle = document.getElementById('themeToggle');
    const contrastToggle = document.getElementById('contrastToggle');
    
    if (themeToggle) {
      themeToggle.checked = currentTheme === 'dark';
    }
    
    if (contrastToggle) {
      contrastToggle.checked = currentTheme === 'highContrast';
    }
    
    // Renk seçeneklerini güncelle
    const colorOptions = document.querySelectorAll('.color-option');
    this.updateColorOptions(colorOptions, currentColorTheme);
    
    // Font boyutu göstergesini güncelle
    const fontSizeDisplay = document.getElementById('currentFontSize');
    this.updateFontSizeDisplay(fontSizeDisplay);
    
    // Tema önizlemesini güncelle
    this.updateThemePreview(currentTheme === 'dark');
    
    // Tema durumuna göre toggle etiketlerini güncelle
    this.updateToggleLabels(currentTheme);
    
    // Panel stillerini güncelle
    this.updatePanelStylesForTheme();
  }
  
  /**
   * Tema önizlemesini günceller
   * @param {boolean} isDark - Koyu tema mı?
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

// Sayfa yüklendiğinde ayarlar panelini başlat
document.addEventListener('DOMContentLoaded', () => {
  window.settingsPanel = new SettingsPanel();
});

// ThemeManager'a erişim için global değişken
window.settingsPanel = null; 