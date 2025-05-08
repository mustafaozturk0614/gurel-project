/**
 * Ayarlar Paneli - Gürel Yönetim Tema Sistemi
 * 
 * Bu modül, kullanıcı teması ayarları için bir kontrol paneli oluşturur.
 * ThemeManager ile entegre çalışır.
 * Versiyon: 4.0.0
 * 
 * Özellikler:
 * - Geliştirilmiş ekran okuyucu uyumluluğu
 * - Kademeli kontrast ayarları
 * - Sistem teması otomatik algılama
 * - Performans optimizasyonları
 * - Modüler yapı
 */

import ThemeUtils from './theme-utils.js';

class SettingsPanel {
  constructor(options = {}) {
    // Varsayılan ayarlar
    this.defaults = {
      panelPosition: 'right',
      colorThemes: [
        { name: 'Mavi', color: '#0055a4', theme: 'blue' },
        { name: 'Kırmızı', color: '#d93025', theme: 'red' },
        { name: 'Yeşil', color: '#188038', theme: 'green' },
        { name: 'Turuncu', color: '#ea8600', theme: 'orange' },
        { name: 'Mor', color: '#7b1fa2', theme: 'purple' },
        { name: 'Turkuaz', color: '#009688', theme: 'teal' },
        { name: 'Pembe', color: '#e91e63', theme: 'pink' }
      ],
      autoInit: true,
      quietMode: false,
      debug: false,
      isCacheText: true  // Cache kullanımı için yeni bayrak
    };

    // Kullanıcı ayarları ile birleştir
    this.options = {
      ...this.defaults,
      ...options
    };

    // ThemeManager referansı
    this.themeManager = window.themeManager;
    
    // Panel elementleri
    this.elements = {
      panel: null,
      toggleButton: null,
      themeToggles: null,
      contrastSlider: null,
      fontSizeSlider: null,
      colorOptions: null,
      resetButton: null
    };
    
    // Panel durumu
    this.state = {
      isOpen: false, // Başlangıçta kapalı
      isInitialized: false,
      initializationInProgress: false
    };
    
    // Olay dinleyicileri
    this.eventListeners = {};
    
    // Otomatik başlatma
    if (this.options.autoInit) {
      // DOMContentLoaded olayını bekle
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => this.init(), 10);
        });
      } else {
        // Doküman zaten yüklendi
        setTimeout(() => this.init(), 10);
      }
    }
  }

  /**
   * Ayarlar panelini initialize eder
   */
  init() {
    console.log('SettingsPanel.init başlatılıyor...');
    
    // Çift başlatmayı önle
    if (window.__settingsPanelInitialized || this.state.isInitialized) {
      if (!this.options.quietMode) {
        console.log('SettingsPanel zaten başlatılmış, tekrar başlatılmayacak.');
      }
      return;
    }
    
    // Başlatma işleminin devam ettiğini işaretle
    if (this.state.initializationInProgress) {
      if (!this.options.quietMode) {
        console.log('SettingsPanel başlatma işlemi zaten devam ediyor.');
      }
      return;
    }
    
    // Başlatma işlemi başlıyor
    this.state.initializationInProgress = true;
    
    if (!this.options.quietMode) {
      console.log('Ayarlar paneli başlatılıyor...');
    }
    
    // Panel elementlerini seç/oluştur
    this.initElements();
    
    // ThemeManager'ı kontrol et - eğer yüklü değilse bekle
    if (!this.themeManager) {
      this.log('ThemeManager bulunamadı. Yüklenmeyi bekliyorum...');
      
      const checkThemeManager = setInterval(() => {
        this.themeManager = window.themeManager;
        if (this.themeManager) {
          clearInterval(checkThemeManager);
          this.completeInitialization();
        }
      }, 100);
      
      // 2 saniye sonra hala bulunamazsa devam et
      setTimeout(() => {
        if (!this.themeManager) {
          clearInterval(checkThemeManager);
          this.log('ThemeManager bulunamadığı için varsayılan ayarlarla devam ediliyor.');
          this.completeInitialization();
        }
      }, 2000);
      
      return;
    }
    
    // ThemeManager zaten yüklüyse devam et
    this.completeInitialization();
    
    // Açılış tamamlandıktan sonra toggle butonunu tekrar kontrol et
    setTimeout(() => {
      // Panel butonu varsa direkt DOM'dan al
      const toggleBtn = document.getElementById('settingsToggle');
      if (toggleBtn && (!this.elements.toggleButton || !this.elements.toggleButton._hasClickHandler)) {
        console.log('Toggle butonunu yeniden bağlıyorum...');
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('DOM üzerinden eklenen olay dinleyicisi: Ayarlar butonu tıklandı!');
          
          // Panel referansını kontrol et ve gerekirse güncelle
          if (!this.elements.panel) {
            this.elements.panel = document.getElementById('settingsPanel');
          }
          
          // Panel referansını kontrol et ve gerekirse güncelle
          if (!this.elements.toggleButton) {
            this.elements.toggleButton = toggleBtn;
          }
          
          this.toggleSettingsPanel();
        });
        
        // İşaretleyici ekle
        toggleBtn._hasClickHandler = true;
        
        // Kaydet
        this.elements.toggleButton = toggleBtn;
      }
    }, 1000);
  }
  
  /**
   * Panel elementlerini seçer veya oluşturur
   */
  initElements() {
    // Panel elementini bul
    this.elements.panel = document.getElementById('settingsPanel');
    
    // Panel yoksa oluştur
    if (!this.elements.panel) {
      console.log('Settings panel bulunamadı, yeni panel oluşturuluyor...');
      this.createSettingsPanel();
    } else {
      console.log('Mevcut settings panel bulundu');
    }
    
    // Toggle butonunu bul
    this.elements.toggleButton = document.getElementById('settingsToggle');
    
    // Toggle butonu yoksa oluştur
    if (!this.elements.toggleButton) {
      console.log('Settings toggle butonu bulunamadı, yeni buton oluşturuluyor...');
      this.createToggleButton();
    } else {
      console.log('Mevcut settings toggle butonu bulundu, event listener ekleniyor...');
      // Butonun zaten olay dinleyicisi var mı kontrol et
      if (!this.elements.toggleButton._hasClickHandler) {
        // Yeni olay dinleyicisi ekle
        this.elements.toggleButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Mevcut toggle butonuna tıklandı!');
          this.toggleSettingsPanel();
        });
        // İşaretleyici ekle
        this.elements.toggleButton._hasClickHandler = true;
      }
    }
    
    // CSS sınıflarını güncelle
    if (this.elements.panel) {
      // Panel kapalı durumda başlamalı
      this.elements.panel.classList.remove('open');
      this.elements.panel.style.opacity = '0';
      this.elements.panel.style.visibility = 'hidden';
      
      // Panel pozisyonunu ayarla
      this.elements.panel.classList.remove('left', 'right');
      this.elements.panel.classList.add(this.options.panelPosition || 'right');
    }
  }
  
  /**
   * Settings panel elementini oluşturur
   */
  createSettingsPanel() {
    const panel = document.createElement('div');
    panel.id = 'settingsPanel';
    panel.className = 'settings-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'settingsPanelTitle');
    panel.setAttribute('aria-hidden', 'true');
    
    // Panel pozisyonu
    panel.classList.add(this.options.panelPosition || 'right');
    
    // Panel içeriği
    panel.innerHTML = `
      <div class="settings-panel-header">
        <h2 id="settingsPanelTitle" class="settings-panel-title">Tema Ayarları</h2>
        <button id="settingsPanelClose" class="settings-panel-close" aria-label="Paneli kapat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="settings-section">
        <span class="settings-section-title">Tema Modu</span>
        <div class="theme-mode-options">
          <div class="theme-mode-option">
            <input type="radio" id="themeModeLight" name="themeMode" value="light" class="theme-radio">
            <label for="themeModeLight">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
              </svg>
              <span>Açık</span>
            </label>
          </div>
          <div class="theme-mode-option">
            <input type="radio" id="themeModeDark" name="themeMode" value="dark" class="theme-radio">
            <label for="themeModeDark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <span>Koyu</span>
            </label>
          </div>
          <div class="theme-mode-option">
            <input type="radio" id="themeModeAuto" name="themeMode" value="auto" class="theme-radio">
            <label for="themeModeAuto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 6V2M12 22v-4M18 12h4M2 12h4M19.07 5L16 8M8 16l-3.07 3M19.07 19L16 16M8 8 4.93 5"></path>
              </svg>
              <span>Otomatik</span>
            </label>
          </div>
          <div class="theme-mode-option">
            <input type="radio" id="themeModeSystem" name="themeMode" value="system" class="theme-radio">
            <label for="themeModeSystem">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M8 21h8M12 17v4"></path>
              </svg>
              <span>Sistem</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <span class="settings-section-title">Renk Teması</span>
        <div class="color-theme-options">
          ${this.options.colorThemes.map(theme => `
            <button class="color-option" data-theme="${theme.theme}" data-color="${theme.color}" 
              style="background-color: ${theme.color};" aria-label="${theme.name} teması" tabindex="0">
              <span class="color-option-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <div class="settings-section">
        <span class="settings-section-title">Kontrast</span>
        <div class="contrast-control">
          <div class="contrast-slider-container">
            <input type="range" id="contrastSlider" min="0" max="3" step="1" value="0" 
              aria-label="Kontrast seviyesi" class="settings-slider">
          </div>
          <div class="contrast-levels">
            <span class="contrast-level active" data-level="0">Normal</span>
            <span class="contrast-level" data-level="1">Hafif</span>
            <span class="contrast-level" data-level="2">Orta</span>
            <span class="contrast-level" data-level="3">Yüksek</span>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <span class="settings-section-title">Font Boyutu</span>
        <div class="font-size-control">
          <button id="decreaseFontSize" class="font-size-btn" aria-label="Font boyutunu küçült">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12h8"></path>
            </svg>
          </button>
          <div class="font-size-slider-container">
            <input type="range" id="fontSizeSlider" min="80" max="150" step="5" value="100" 
              aria-label="Font boyutu" class="settings-slider">
            <span id="currentFontSize" class="current-size">100%</span>
          </div>
          <button id="increaseFontSize" class="font-size-btn" aria-label="Font boyutunu büyüt">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v8M8 12h8"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="settings-section">
        <span class="settings-section-title">Hareket Efektleri</span>
        <div class="switch-control">
          <input type="checkbox" id="reducedMotionToggle" class="switch-checkbox">
          <label for="reducedMotionToggle" class="switch-label">
            <span class="switch-inner"></span>
            <span class="switch-switch"></span>
          </label>
          <span class="switch-text">Hareketi azalt</span>
        </div>
      </div>
      
      <div class="settings-footer">
        <button id="resetSettings" class="reset-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          <span>Varsayılanlara Sıfırla</span>
        </button>
      </div>
    `;
    
    // Kapatma düğmesi
    const applyPanelStyles = () => {
      // Başlangıçta kapalı halde başla
      if (this.options.panelPosition === 'left') {
        panel.style.transform = 'translateX(-100%)';
      } else {
        panel.style.transform = 'translateX(100%)';
      }
      
      panel.style.opacity = '0';
      panel.style.visibility = 'hidden';
      panel.style.display = 'none';
      panel.style.pointerEvents = 'none';
    };
    
    // Paneli body'ye ekle
    document.body.appendChild(panel);
    this.elements.panel = panel;
    
    // Stilleri uygula
    applyPanelStyles();
    
    // Kapatma düğmesi olayını ekle
    setTimeout(() => {
      const closeButton = panel.querySelector('#settingsPanelClose');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          console.log('Kapatma düğmesine tıklandı');
          this.toggleSettingsPanel(false);
        });
      }
    }, 0);
  }
  
  /**
   * Toggle butonunu oluşturur
   */
  createToggleButton() {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'settingsToggle';
    toggleButton.className = 'settings-toggle';
    toggleButton.setAttribute('type', 'button');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', 'settingsPanel');
    toggleButton.setAttribute('aria-label', 'Tema Ayarları');
    
    // Toggle buton ikonu
    toggleButton.innerHTML = `
      <svg class="settings-toggle-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.22 2C12.1 2 11.97 2 11.86 2C11.48 2.02 11.11 2.16 10.81 2.41C10.52 2.65 10.31 2.98 10.23 3.35L9.98 4.25C9.89 4.66 9.67 5.02 9.37 5.3C9.07 5.58 8.69 5.75 8.28 5.8C8.11 5.82 7.94 5.85 7.77 5.88C7.38 5.94 7.01 6.11 6.7 6.36C6.39 6.62 6.16 6.96 6.04 7.34L5.93 7.68C5.81 8.06 5.8 8.47 5.91 8.85C6.02 9.23 6.23 9.57 6.54 9.82C6.85 10.08 7.04 10.43 7.1 10.81C7.12 10.97 7.14 11.14 7.17 11.31C7.22 11.72 7.16 12.13 6.98 12.5C6.81 12.87 6.53 13.17 6.18 13.37C5.83 13.56 5.53 13.85 5.33 14.2C5.13 14.55 5.04 14.95 5.07 15.35L5.11 15.75C5.14 16.16 5.28 16.54 5.53 16.86C5.77 17.18 6.1 17.42 6.48 17.54C6.87 17.66 7.19 17.91 7.41 18.23C7.49 18.34 7.56 18.46 7.63 18.59C7.84 18.97 7.94 19.4 7.92 19.84C7.9 20.27 7.77 20.69 7.54 21.05L7.4 21.27C7.18 21.62 7.07 22.03 7.1 22.44C7.11 22.64 7.17 22.83 7.27 23.01C7.36 23.18 7.5 23.32 7.66 23.42C7.98 23.63 8.36 23.75 8.74 23.75H15.01C15.4 23.75 15.77 23.63 16.1 23.42C16.26 23.32 16.39 23.18 16.49 23.01C16.59 22.83 16.65 22.64 16.66 22.44C16.69 22.03 16.58 21.62 16.36 21.27L16.22 21.05C15.99 20.69 15.86 20.27 15.84 19.84C15.82 19.4 15.92 18.97 16.13 18.59C16.2 18.46 16.27 18.34 16.35 18.23C16.57 17.91 16.89 17.66 17.28 17.54C17.66 17.42 17.99 17.18 18.23 16.86C18.48 16.54 18.62 16.16 18.65 15.75L18.69 15.35C18.72 14.95 18.63 14.55 18.43 14.2C18.23 13.85 17.94 13.56 17.58 13.37C17.23 13.17 16.95 12.87 16.78 12.5C16.6 12.13 16.54 11.72 16.59 11.31C16.62 11.14 16.64 10.97 16.66 10.81C16.72 10.43 16.91 10.08 17.22 9.82C17.53 9.57 17.74 9.23 17.85 8.85C17.96 8.47 17.95 8.06 17.83 7.68L17.72 7.34C17.6 6.96 17.37 6.62 17.05 6.36C16.74 6.11 16.38 5.94 15.99 5.88C15.82 5.85 15.65 5.82 15.48 5.8C15.07 5.75 14.69 5.58 14.39 5.3C14.09 5.02 13.87 4.66 13.78 4.25L13.53 3.35C13.44 2.98 13.24 2.65 12.95 2.41C12.65 2.16 12.28 2.02 11.9 2H12.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Buton animasyonu ekle
    toggleButton.classList.add('pulse');
    
    // 3 kez yanıp söndükten sonra animasyonu kaldır
    setTimeout(() => {
      toggleButton.classList.remove('pulse');
    }, 4500);
    
    // Butonu body'ye ekle
    document.body.appendChild(toggleButton);
    
    // Referansı kaydet
    this.elements.toggleButton = toggleButton;
    
    // Olay dinleyicisini doğrudan burada ekle
    toggleButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Olayın yayılmasını engelle
      console.log('Ayarlar butonu tıklandı!');
      this.toggleSettingsPanel();
    });
    
    // Log
    console.log('Ayarlar butonu oluşturuldu ve bağlandı');
  }

  /**
   * ThemeManager kontrolü sonrası başlatmayı tamamla
   */
  completeInitialization() {
    // İnitializasyon bayrağı
    window.__settingsPanelInitialized = true;
    this.state.isInitialized = true;
    this.state.initializationInProgress = false;
    
    // Tema modu radio butonlarını başlat
    this.initThemeModeOptions();
    
    // Kontrast kaydırıcısını başlat
    this.initContrastSlider();
    
    // Font boyutu kaydırıcısını başlat
    this.initFontSizeSlider();
    
    // Renk seçeneklerini başlat
    this.initColorOptions();
    
    // Azaltılmış hareket toggle'ını başlat
    this.initReducedMotionToggle();
    
    // Sıfırlama butonunu başlat
    this.initResetButton();
    
    // Olay dinleyicilerini ekle
    this.attachEventListeners();
    
    // Panel temasını doküman temasıyla senkronize et
    this.syncPanelWithDocumentTheme();
    
    // ARIA erişilebilirlik iyileştirmeleri
    this.improveAccessibility();
    
    // Tema değişikliklerini dinle
    this.listenToThemeChanges();
    
    // Başlatma işlemi tamamlandı bilgisi
    if (!this.options.quietMode) {
      console.log('SettingsPanel başarıyla başlatıldı');
    }
    
    // Başlatma olayını tetikle
    this.emit('initialized');
  }

  /**
   * Tema modu seçeneklerini (otomatik, açık, koyu, sistem) başlatır
   */
  initThemeModeOptions() {
    // Tema modu radio butonlarını seç
    const themeRadios = document.querySelectorAll('input[name="themeMode"]');
    if (!themeRadios.length) {
      this.log('Tema modu radio butonları bulunamadı!');
      return;
    }
    
    // Mevcut tema modu
    let currentThemeMode = 'auto'; // Varsayılan tema modu
    
    // ThemeManager varsa ondan al
    if (this.themeManager && this.themeManager.settings) {
      currentThemeMode = this.themeManager.settings.themeMode || 'auto';
    } else {
      // Kaydedilmiş tema modu varsa kullan
      const savedThemeMode = ThemeUtils.getFromStorage('themeMode');
      if (savedThemeMode) {
        currentThemeMode = savedThemeMode;
      }
    }
    
    // İlgili radio butonu seç
    const selectedRadio = document.querySelector(`input[name="themeMode"][value="${currentThemeMode}"]`);
    if (selectedRadio) {
      selectedRadio.checked = true;
    }
    
    // Olay dinleyicileri ekle
    themeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const newThemeMode = radio.value;
          
          // ThemeManager ile modu değiştir
          if (this.themeManager && typeof this.themeManager.setThemeMode === 'function') {
            this.themeManager.setThemeMode(newThemeMode);
          } else {
            this.manuallyApplyThemeMode(newThemeMode);
          }
          
          // UI güncellemeleri
          this.syncPanelWithDocumentTheme();
          
          // Log
          this.log(`Tema modu değiştirildi: ${newThemeMode}`);
          
          // Olay tetikle
          this.emit('themeModeChanged', newThemeMode);
        }
      });
    });
    
    // Referansı sakla
    this.elements.themeToggles = themeRadios;
  }

  /**
   * Manuel olarak tema modunu uygula (ThemeManager yoksa)
   * @param {string} mode - Tema modu ('light', 'dark', 'auto', 'system')
   */
  manuallyApplyThemeMode(mode) {
    // Önceki tema
    const prevMode = document.documentElement.getAttribute('data-theme');
    
    // Tema değişimini uygula
    switch (mode) {
      case 'light':
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-mode');
        ThemeUtils.saveToStorage('themeMode', 'light');
        break;
      case 'dark':
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
        ThemeUtils.saveToStorage('themeMode', 'dark');
        break;
      case 'auto': {
        const currentHour = new Date().getHours();
        const isDark = (currentHour >= 19 || currentHour < 7);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', isDark);
        ThemeUtils.saveToStorage('themeMode', 'auto');
        break;
      }
      case 'system': {
        const prefersDarkMode = ThemeUtils.prefersDarkTheme();
        document.documentElement.setAttribute('data-theme', prefersDarkMode ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', prefersDarkMode);
        ThemeUtils.saveToStorage('themeMode', 'system');
        break;
      }
    }

    // Tema değişikliğini bildir
    ThemeUtils.dispatchCustomEvent('themeChanged', { 
      oldTheme: prevMode, 
      newTheme: mode 
    });
    
    // UI güncellemeleri
    this.syncPanelWithDocumentTheme();
    
    // Erişilebilirlik için bildiri
    ThemeUtils.announceToScreenReader(`${this.capitalizeFirstLetter(mode)} tema etkinleştirildi`);
  }
  
  /**
   * Kontrast slider'ını başlatır
   */
  initContrastSlider() {
    const contrastSlider = document.getElementById('contrastSlider');
    const contrastLevels = document.querySelectorAll('.contrast-level');
    
    if (!contrastSlider) {
      this.log('Kontrast slider bulunamadı!');
      return;
    }
    
    // Mevcut kontrast seviyesini kontrol et
    let currentLevel = 0;
    
    if (this.themeManager && this.themeManager.settings) {
      currentLevel = this.themeManager.settings.contrastLevel || 0;
    } else {
      const savedLevel = ThemeUtils.getFromStorage('contrastLevel');
      if (savedLevel !== null) {
        currentLevel = parseInt(savedLevel);
      }
    }
    
    // Slider değerini ayarla
    contrastSlider.value = currentLevel;
    
    // Aktif kontrast seviyesi sınıfını güncelle
    this.updateActiveContrastLevel(currentLevel);
    
    // Slider değişiminde
    contrastSlider.addEventListener('input', () => {
      const level = parseInt(contrastSlider.value);
      
      // UI güncelle
      this.updateActiveContrastLevel(level);
      
      // ThemeManager ile kontrast seviyesini değiştir
      if (this.themeManager && typeof this.themeManager.setContrastLevel === 'function') {
        this.themeManager.setContrastLevel(level);
      } else {
        // Manuel uygula
        document.body.classList.remove('contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high');
        document.body.classList.add(['contrast-normal', 'contrast-mild', 'contrast-medium', 'contrast-high'][level]);
        ThemeUtils.saveToStorage('contrastLevel', level);
      }
      
      // Log
      this.log(`Kontrast seviyesi değiştirildi: ${level}`);
      
      // Olay tetikle
      this.emit('contrastLevelChanged', level);
    });
    
    // Etiketlere tıklandığında değeri değiştir
    contrastLevels.forEach(level => {
      level.addEventListener('click', () => {
        const levelValue = parseInt(level.getAttribute('data-level'));
        contrastSlider.value = levelValue;
        contrastSlider.dispatchEvent(new Event('input'));
      });
    });
    
    // Referansı sakla
    this.elements.contrastSlider = contrastSlider;
  }
  
  /**
   * Aktif kontrast seviyesi etiketini güncelle
   * @param {number} level - Kontrast seviyesi
   */
  updateActiveContrastLevel(level) {
    document.querySelectorAll('.contrast-level').forEach(item => {
      item.classList.toggle('active', parseInt(item.getAttribute('data-level')) === level);
    });
  }
  
  /**
   * Font boyutu slider'ını başlatır
   */
  initFontSizeSlider() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeDisplay = document.getElementById('currentFontSize');
    const decreaseBtn = document.getElementById('decreaseFontSize');
    const increaseBtn = document.getElementById('increaseFontSize');
    
    if (!fontSizeSlider) {
      this.log('Font boyutu slider bulunamadı!');
      return;
    }
    
    // Mevcut font boyutunu kontrol et
    let currentFontSize = 100;
    
    if (this.themeManager && this.themeManager.settings) {
      currentFontSize = this.themeManager.settings.fontSizePercent || 100;
    } else {
      const savedFontSize = ThemeUtils.getFromStorage('fontSizePercent');
      if (savedFontSize) {
        currentFontSize = parseInt(savedFontSize);
      }
    }
    
    // Slider değerini ayarla
    fontSizeSlider.value = currentFontSize;
    
    // Font boyutu göstergesini güncelle
    if (fontSizeDisplay) {
      fontSizeDisplay.textContent = currentFontSize + '%';
    }
    
    // Slider değişiminde
    fontSizeSlider.addEventListener('input', () => {
      const size = parseInt(fontSizeSlider.value);
      
      // Font boyutu göstergesini güncelle
      if (fontSizeDisplay) {
        fontSizeDisplay.textContent = size + '%';
        fontSizeDisplay.classList.add('updated');
        setTimeout(() => fontSizeDisplay.classList.remove('updated'), 500);
      }
      
      // ThemeManager ile font boyutunu değiştir
      if (this.themeManager && typeof this.themeManager.setFontSize === 'function') {
        this.themeManager.setFontSize(size);
      } else {
        // Manuel uygula
        document.documentElement.style.fontSize = size + '%';
        ThemeUtils.saveToStorage('fontSizePercent', size);
      }
      
      // Log
      this.log(`Font boyutu değiştirildi: ${size}%`);
      
      // Olay tetikle
      this.emit('fontSizeChanged', size);
    });
    
    // Artırma ve azaltma butonları
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        const currentSize = parseInt(fontSizeSlider.value);
        const newSize = Math.max(80, currentSize - 5); // Minimum 80%
        fontSizeSlider.value = newSize;
        fontSizeSlider.dispatchEvent(new Event('input'));
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        const currentSize = parseInt(fontSizeSlider.value);
        const newSize = Math.min(150, currentSize + 5); // Maximum 150%
        fontSizeSlider.value = newSize;
        fontSizeSlider.dispatchEvent(new Event('input'));
      });
    }
    
    // Referansı sakla
    this.elements.fontSizeSlider = fontSizeSlider;
  }
  
  /**
   * Azaltılmış hareket toggle'ını başlatır
   */
  initReducedMotionToggle() {
    const reducedMotionToggle = document.getElementById('reducedMotionToggle');
    
    if (!reducedMotionToggle) {
      this.log('Azaltılmış hareket toggle bulunamadı!');
      return;
    }
    
    // Mevcut ayarı kontrol et
    let reducedMotion = false;
    
    if (this.themeManager && this.themeManager.settings) {
      reducedMotion = this.themeManager.settings.reducedMotion;
    } else {
      // Sistem ayarı veya localStorage'dan oku
      const savedSetting = ThemeUtils.getFromStorage('reducedMotion');
      reducedMotion = savedSetting !== null ? savedSetting === 'true' : ThemeUtils.prefersReducedMotion();
    }
    
    // Toggle durumunu ayarla
    reducedMotionToggle.checked = reducedMotion;
    
    // Toggle değişikliğinde
    reducedMotionToggle.addEventListener('change', () => {
      const enabled = reducedMotionToggle.checked;
      
      // ThemeManager ile ayarı değiştir
      if (this.themeManager && typeof this.themeManager.setReducedMotion === 'function') {
        this.themeManager.setReducedMotion(enabled);
      } else {
        // Manuel uygula
        document.documentElement.setAttribute('data-reduced-motion', enabled.toString());
        document.documentElement.classList.toggle('reduced-motion', enabled);
        ThemeUtils.saveToStorage('reducedMotion', enabled);
      }
      
      // Log
      this.log(`Azaltılmış hareket ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`);
      
      // Olay tetikle
      this.emit('reducedMotionChanged', enabled);
    });
  }

  /**
   * Renk tema seçeneklerini başlatır
   */
  initColorOptions() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    if (!colorOptions || colorOptions.length === 0) {
      this.log('Renk seçenekleri bulunamadı!');
      return;
    }
    
    // Mevcut renk temasını al
    let currentTheme = 'blue'; // Varsayılan
    
    if (this.themeManager && this.themeManager.settings) {
      currentTheme = this.themeManager.settings.colorTheme || 'blue';
    } else {
      // Kaydedilmiş tema varsa kullan
      const savedTheme = ThemeUtils.getFromStorage('colorTheme');
      if (savedTheme) {
        currentTheme = savedTheme;
      }
    }
    
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
        if (this.themeManager && typeof this.themeManager.setColorTheme === 'function') {
          this.themeManager.setColorTheme(theme);
        } else {
          // Manuel uygula
          document.documentElement.setAttribute('data-color-theme', theme);
          ThemeUtils.setCssVariable('--primary-color', color);
          
          // RGB değerlerini güncelle
          const rgb = ThemeUtils.hexToRgb(color);
          if (rgb) {
            ThemeUtils.setCssVariable('--primary-rgb', ThemeUtils.rgbToString(rgb));
          }
          
          ThemeUtils.saveToStorage('colorTheme', theme);
        }
        
        // Log
        this.log(`Renk teması değiştirildi: ${theme}`);
        
        // Olay tetikle
        this.emit('colorThemeChanged', { theme, color });
      });
    });
    
    // Referansı sakla
    this.elements.colorOptions = colorOptions;
  }
  
  /**
   * Sıfırlama butonunu başlatır
   */
  initResetButton() {
    const resetButton = document.getElementById('resetSettings');
    
    if (!resetButton) {
      this.log('Sıfırlama butonu bulunamadı!');
      return;
    }
    
    // Tıklama olayı ekle
    resetButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Buton animasyonu
      resetButton.classList.add('resetting');
      resetButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        <span>Sıfırlanıyor...</span>
      `;
      resetButton.disabled = true;
      
      // Sıfırlama işlemi
      setTimeout(() => {
        this.resetSettings();
        
        // Butonu normal haline getir
        setTimeout(() => {
          resetButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Sıfırlandı!</span>
          `;
          
          setTimeout(() => {
            resetButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Varsayılanlara Sıfırla</span>
            `;
            resetButton.classList.remove('resetting');
            resetButton.disabled = false;
          }, 1500);
        }, 500);
        
        // Erişilebilirlik için bildirim
        ThemeUtils.announceToScreenReader('Ayarlar varsayılan değerlere sıfırlandı');
      }, 500);
    });
    
    // Referansı sakla
    this.elements.resetButton = resetButton;
  }
  
  /**
   * Ayarları varsayılana sıfırlar
   */
  resetSettings() {
    try {
      if (this.themeManager && typeof this.themeManager.resetToDefaults === 'function') {
        // ThemeManager ile sıfırla
        this.themeManager.resetToDefaults();
      } else {
        // Manuel sıfırla
        // LocalStorage temizle
        ['themeMode', 'colorTheme', 'contrastLevel', 'fontSizePercent', 'reducedMotion'].forEach(key => {
          localStorage.removeItem(key);
        });
        
        // 1. Tema modunu sıfırla - varsayılan: auto
        document.documentElement.setAttribute('data-theme', 'light');
        const autoRadio = document.querySelector('input[name="themeMode"][value="auto"]');
        if (autoRadio) autoRadio.checked = true;
        
        // 2. Kontrast seviyesini sıfırla - varsayılan: normal (0)
        document.body.classList.remove('contrast-mild', 'contrast-medium', 'contrast-high');
        document.body.classList.add('contrast-normal');
        const contrastSlider = document.getElementById('contrastSlider');
        if (contrastSlider) {
          contrastSlider.value = 0;
          this.updateActiveContrastLevel(0);
        }
        
        // 3. Font boyutunu sıfırla - varsayılan: normal (100%)
        document.documentElement.style.fontSize = '100%';
        const fontSlider = document.getElementById('fontSizeSlider');
        const fontSizeDisplay = document.getElementById('currentFontSize');
        if (fontSlider) fontSlider.value = 100;
        if (fontSizeDisplay) fontSizeDisplay.textContent = '100%';
        
        // 4. Tema rengini sıfırla - varsayılan: mavi
        document.documentElement.setAttribute('data-color-theme', 'blue');
        ThemeUtils.setCssVariable('--primary-color', '#0055a4');
        ThemeUtils.setCssVariable('--primary-rgb', '0, 85, 164');
        
        // Renk seçeneklerini güncelle
        document.querySelectorAll('.color-option').forEach(option => {
          option.classList.toggle('active', option.getAttribute('data-theme') === 'blue');
        });
        
        // 5. Azaltılmış hareket ayarını sıfırla - varsayılan: false
        document.documentElement.setAttribute('data-reduced-motion', 'false');
        document.documentElement.classList.remove('reduced-motion');
        const reducedMotionToggle = document.getElementById('reducedMotionToggle');
        if (reducedMotionToggle) reducedMotionToggle.checked = false;
      }
      
      // Başarı mesajı
      this.log('✅ Ayarlar başarıyla sıfırlandı!');
      
      // Olay tetikle
      this.emit('settingsReset');
      
      // Bildirim göster
      this.showResetNotification();
      
      return true;
    } catch (error) {
      console.error('❌ Ayarlar sıfırlanırken hata:', error);
      return false;
    }
  }

  /**
   * Panel temasını doküman temasıyla senkronize eder
   */
  syncPanelWithDocumentTheme() {
    if (!this.elements.panel) return;
    
    // Doküman temasını kontrol et
    const documentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Panele tema sınıfı ekle
    this.elements.panel.classList.remove('light-panel', 'dark-panel', 'high-contrast-panel');
    
    if (documentTheme === 'dark') {
      this.elements.panel.classList.add('dark-panel');
      this.elements.panel.setAttribute('data-panel-theme', 'dark');
    } else if (documentTheme === 'highContrast') {
      this.elements.panel.classList.add('high-contrast-panel');
      this.elements.panel.setAttribute('data-panel-theme', 'highContrast');
    } else {
      this.elements.panel.classList.add('light-panel');
      this.elements.panel.setAttribute('data-panel-theme', 'light');
    }
  }

  /**
   * ARIA erişilebilirlik iyileştirmeleri
   */
  improveAccessibility() {
    // Toggle button ARIA durumunu ayarla
    if (this.elements.toggleButton) {
      this.elements.toggleButton.setAttribute('aria-expanded', 'false');
    }
    
    // Tema modu radio butonlarına keyboard erişimi ekle
    document.querySelectorAll('.theme-radio').forEach(radio => {
      radio.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }
      });
    });
    
    // Renk seçeneklerine keyboard erişimi
    document.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          option.click();
        }
      });
    });
    
    // Kaydırıcılar için ARIA etiketleri
    const contrastSlider = document.getElementById('contrastSlider');
    if (contrastSlider) {
      contrastSlider.setAttribute('aria-valuemin', '0');
      contrastSlider.setAttribute('aria-valuemax', '3');
      contrastSlider.setAttribute('aria-valuenow', contrastSlider.value);
      contrastSlider.addEventListener('input', () => {
        contrastSlider.setAttribute('aria-valuenow', contrastSlider.value);
      });
    }
    
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
      fontSizeSlider.setAttribute('aria-valuemin', '80');
      fontSizeSlider.setAttribute('aria-valuemax', '150');
      fontSizeSlider.setAttribute('aria-valuenow', fontSizeSlider.value);
      fontSizeSlider.addEventListener('input', () => {
        fontSizeSlider.setAttribute('aria-valuenow', fontSizeSlider.value);
        fontSizeSlider.setAttribute('aria-valuetext', `${fontSizeSlider.value}%`);
      });
    }
    
    // Erişilebilirlik durumunu bildir
    this.log('Erişilebilirlik iyileştirmeleri uygulandı');
  }
  
  /**
   * Tema değişikliklerini dinle (ThemeManager'dan gelen olaylar)
   */
  listenToThemeChanges() {
    if (!this.themeManager) return;
    
    // ThemeManager olaylarını dinle
    this.themeManager.on('themeModeChanged', (mode) => {
      // Radio butonunu güncelle
      const radio = document.querySelector(`input[name="themeMode"][value="${mode}"]`);
      if (radio) radio.checked = true;
      
      // Paneli güncelle
      this.syncPanelWithDocumentTheme();
    });
    
    this.themeManager.on('colorThemeChanged', (theme) => {
      // Renk seçeneğini güncelle
      document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-theme') === theme);
      });
    });
    
    this.themeManager.on('contrastLevelChanged', (level) => {
      // Kontrast kaydırıcısını güncelle
      const slider = document.getElementById('contrastSlider');
      if (slider) slider.value = level;
      
      // Etiketleri güncelle
      this.updateActiveContrastLevel(level);
    });
    
    this.themeManager.on('fontSizeChanged', (size) => {
      // Font boyutu kaydırıcısını güncelle
      const slider = document.getElementById('fontSizeSlider');
      const display = document.getElementById('currentFontSize');
      
      if (slider) slider.value = size;
      if (display) display.textContent = `${size}%`;
    });
    
    this.themeManager.on('reducedMotionChanged', (enabled) => {
      // Azaltılmış hareket toggle'ını güncelle
      const toggle = document.getElementById('reducedMotionToggle');
      if (toggle) toggle.checked = enabled;
    });
  }
  
  /**
   * Olay dinleyicilerini ekler
   */
  attachEventListeners() {
    // Panel açma/kapatma butonu
    if (this.elements.toggleButton) {
      this.elements.toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSettingsPanel();
      });
    }
    
    // Panel dışına tıklama ile kapatma
    document.addEventListener('click', (e) => {
      if (this.elements.panel && 
          this.elements.panel.classList.contains('open') && 
          !this.elements.panel.contains(e.target) && 
          e.target !== this.elements.toggleButton) {
        this.toggleSettingsPanel(false);
      }
    });
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.elements.panel && this.elements.panel.classList.contains('open')) {
        this.toggleSettingsPanel(false);
      }
    });
    
    // Panel içine tıklandığında olayı durdur
    if (this.elements.panel) {
      this.elements.panel.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }
  
  /**
   * Ayarlar panelini açar/kapatır
   * @param {boolean|null} forceState - Zorla belirli bir duruma getir (null ise durumu değiştirir)
   */
  toggleSettingsPanel(forceState = null) {
    // Debug
    console.log('toggleSettingsPanel çağrıldı. Mevcut durum:', this.state.isOpen, 'Zorlanan durum:', forceState);
    
    // Eğer özel bir durum zorlanıyorsa (açık/kapalı) onu kullan, yoksa mevcut durumun tersini al
    const newState = forceState !== null ? forceState : !this.state.isOpen;
    
    console.log('Panelin yeni durumu:', newState);
    
    if (newState === this.state.isOpen) {
      console.log('Panel zaten istenen durumda, işlem yapılmayacak');
      return; // Zaten istenen durumda, bir şey yapma
    }
    
    // Panel elementlerini kontrol et
    if (!this.elements.panel) {
      console.error('Panel elementi bulunamadı!');
      // DOM'dan tekrar bulmayı dene
      this.elements.panel = document.getElementById('settingsPanel');
      if (!this.elements.panel) {
        console.error('Panel element id=settingsPanel bulunamadı!');
        return;
      }
    }
    
    if (!this.elements.toggleButton) {
      console.error('Toggle butonu bulunamadı!');
      // DOM'dan tekrar bulmayı dene
      this.elements.toggleButton = document.getElementById('settingsToggle');
      if (!this.elements.toggleButton) {
        console.error('Toggle buton id=settingsToggle bulunamadı!');
        return;
      }
    }
    
    // Panel durumunu güncelle
    this.state.isOpen = newState;
    
    // Panel sınıflarını güncelle
    if (newState) {
      console.log('Panel açılıyor... DOM manipülasyonu uygulanıyor');

      // *** CSS Sınıfları ile ***
      this.elements.panel.classList.add('open');
      
      // *** Doğrudan stil ile (CSS'i geçersiz kılar) ***
      // Önce opacity 0'dan 1'e - hemen görünür yap
      this.elements.panel.style.display = 'flex';
      this.elements.panel.style.visibility = 'visible';
      this.elements.panel.style.opacity = '1';
      this.elements.panel.style.transform = 'translateX(0)';
      this.elements.panel.style.pointerEvents = 'auto';
      
      // Toggle butonunda aktif sınıfı
      this.elements.toggleButton.classList.add('active');
      this.elements.toggleButton.setAttribute('aria-expanded', 'true');
      
      // Ekran okuyucular için duyuruyu güncelle
      const announcer = document.getElementById('themeAnnouncer');
      if (announcer) {
        announcer.textContent = 'Tema ayarları paneli açıldı.';
      }
      
      // Panel içeriğini güncelle
      this.syncPanelWithDocumentTheme();
      
      // Odağı panele taşı (erişilebilirlik için)
      setTimeout(() => {
        const closeButton = document.getElementById('settingsPanelClose');
        if (closeButton) {
          closeButton.focus();
        }
      }, 100);
      
      // Klavye dolaşımı için tab sırasını düzenle
      if (typeof this.setupTabNavigation === 'function') {
        this.setupTabNavigation();
      }
      
      // Debugging bilgisi
      console.log('Panel açık durumu:', {
        display: this.elements.panel.style.display,
        visibility: this.elements.panel.style.visibility,
        opacity: this.elements.panel.style.opacity,
        transform: this.elements.panel.style.transform
      });
      
      // Olay yayınla
      this.emit('panelOpened');
    } else {
      console.log('Panel kapatılıyor... DOM manipülasyonu uygulanıyor');
      
      // *** CSS Sınıfları ile ***
      this.elements.panel.classList.remove('open');
      
      // *** Doğrudan stil ile (CSS'i geçersiz kılar) ***
      // Öncelikle transform ve opacity değişikliklerini uygula
      if (this.options.panelPosition === 'left') {
        this.elements.panel.style.transform = 'translateX(-100%)';
      } else {
        this.elements.panel.style.transform = 'translateX(100%)';
      }
      this.elements.panel.style.opacity = '0';
      this.elements.panel.style.pointerEvents = 'none';
      
      // visibility'yi opacity geçişinden sonra sıfırla
      setTimeout(() => {
        this.elements.panel.style.visibility = 'hidden';
        this.elements.panel.style.display = 'none';
      }, 300); // CSS transition ile aynı süre
      
      this.elements.panel.setAttribute('aria-hidden', 'true');
      
      // Toggle butonundan aktif sınıfını kaldır
      this.elements.toggleButton.classList.remove('active');
      this.elements.toggleButton.setAttribute('aria-expanded', 'false');
      
      // Ekran okuyucular için duyuruyu güncelle
      const announcer = document.getElementById('themeAnnouncer');
      if (announcer) {
        announcer.textContent = 'Tema ayarları paneli kapatıldı.';
      }
      
      // Odağı toggle butonuna geri taşı
      setTimeout(() => {
        this.elements.toggleButton.focus();
      }, 100);
      
      // Debugging bilgisi
      console.log('Panel kapalı durumu:', {
        display: this.elements.panel.style.display,
        visibility: this.elements.panel.style.visibility,
        opacity: this.elements.panel.style.opacity,
        transform: this.elements.panel.style.transform
      });
      
      // Olay yayınla
      this.emit('panelClosed');
    }
  }
  
  /**
   * Sıfırlama işlemi bildirimini gösterir
   */
  showResetNotification() {
    // Mevcut bildirimi temizle
    const existingNotification = document.getElementById('resetNotification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.id = 'resetNotification';
    notification.className = 'reset-notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    // Bildirim içeriği
    notification.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <path d="M22 4L12 14.01l-3-3"></path>
      </svg>
      <span>Ayarlar başarıyla sıfırlandı</span>
    `;
    
    // Tema kontrastına göre renk belirleme
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    const isHighContrast = document.body.classList.contains('contrast-high');
    
    // Bildirim stilini ayarla
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = isHighContrast 
      ? (isDarkTheme ? '#ffffff' : '#000000') 
      : 'rgba(40, 167, 69, 0.95)';
    notification.style.color = isHighContrast 
      ? (isDarkTheme ? '#000000' : '#ffffff') 
      : 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '8px';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    notification.style.zIndex = '10000';
    notification.style.opacity = '0';
    notification.style.transition = 'all 0.3s ease';
    notification.style.border = isHighContrast 
      ? `2px solid ${isDarkTheme ? '#000000' : '#ffffff'}` 
      : 'none';
    
    // Sayfaya ekle
    document.body.appendChild(notification);
    
    // Animasyon ile göster
    setTimeout(() => {
      notification.style.opacity = '1';
      
      // 3 saniye sonra gizle
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }, 100);
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
    ThemeUtils.dispatchCustomEvent(`settings:${event}`, data);
  }
  
  /**
   * Sınıfın kaynaklarını serbest bırakır
   */
  destroy() {
    try {
      // Panel ve düğmeleri kaldır (varsa)
      if (this.elements.panel && this.elements.panel.parentNode) {
        this.elements.panel.parentNode.removeChild(this.elements.panel);
      }
      
      if (this.elements.toggleButton && this.elements.toggleButton.parentNode) {
        this.elements.toggleButton.parentNode.removeChild(this.elements.toggleButton);
      }
      
      // Olay dinleyicilerini temizle
      this.eventListeners = {};
      
      // Global erişimi kaldır
      window.settingsPanel = null;
      window.__settingsPanelInitialized = false;
      
      this.log('SettingsPanel başarıyla sonlandırıldı');
      return true;
    } catch (error) {
      console.error('SettingsPanel kapatılırken hata:', error);
      return false;
    }
  }
  
  /**
   * Helper metod - Stringin ilk harfini büyük harfe çevirir
   * @param {string} string - İlk harfi büyük harfe çevrilecek string
   * @return {string} - İlk harfi büyük harfle değiştirilmiş string
   */
  capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  /**
   * Debug log mesajı
   * @param  {...any} args - Log argümanları
   */
  log(...args) {
    // Konsol hatalarını önlemek için try-catch bloğu içinde
    try {
      if (this.options && this.options.debug) {
        console.log('[SettingsPanel]', ...args);
      }
    } catch (error) {
      // Sessizce hataları görmezden gel
    }
  }

  /**
   * Panel için klavye ile dolaşma (tab) sırasını düzenler
   * Erişilebilirlik için panelin açıkken tab ile gezilebilmesini sağlar
   */
  setupTabNavigation() {
    // Tab ile dolaşılabilir elementleri bul
    const focusableElements = this.elements.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Son elementten sonra tab tuşuna basılırsa ilk elemente dön
    lastElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        firstElement.focus();
      }
    });
    
    // İlk elementte shift+tab basılırsa son elemente dön
    firstElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        lastElement.focus();
      }
    });
    
    // Erişilebilirlik durumunu logla
    this.log('Tab dolaşımı ayarlandı');
  }
}

// Global erişim için
window.SettingsPanel = SettingsPanel;

// Export
export default SettingsPanel; 