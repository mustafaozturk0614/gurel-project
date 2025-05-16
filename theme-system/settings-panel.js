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
        { name: 'Royal Blue', color: '#0d47a1', theme: 'blue' },
        { name: 'Royal Purple', color: '#673ab7', theme: 'lavender' },
        { name: 'Coral Breeze', color: '#f44336', theme: 'coral' },
        { name: 'Emerald Green', color: '#00897b', theme: 'emerald' },
        { name: 'Amber Gold', color: '#ff8f00', theme: 'amber' },
        { name: 'Midnight Blue', color: '#263238', theme: 'midnight' },
        { name: 'Turquoise', color: '#00838f', theme: 'turquoise' },
        { name: 'Rose Pink', color: '#d81b60', theme: 'rose' }
      ],
      autoInit: true,
      quietMode: false,
      debug: false,
      isCacheText: false  // Cache ayarı = false
    };

    // Kullanıcı ayarları ile birleştir
    this.options = {
      ...this.defaults,
      ...options
    };
    
    // Cache ayarını doğrula ve logla
    console.log(`[SettingsPanel] Cache ayarı: isCacheText = ${this.options.isCacheText}`);
    
    // isCacheText ayarını global olarak da kaydet (ThemeManager için)
    if (window.themeConfig) {
      window.themeConfig.isCacheText = this.options.isCacheText;
    } else {
      window.themeConfig = { isCacheText: this.options.isCacheText };
    }

    // ThemeManager referansı
    this.themeManager = window.themeManager;
    
    // Eğer ThemeManager varsa cache ayarını ona da bildir
    if (this.themeManager && typeof this.themeManager.setOption === 'function') {
      this.themeManager.setOption('isCacheText', this.options.isCacheText);
    }
    
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
      initializationInProgress: false, // Başlatma işlemi devam ediyor
      themeModeChangeInProgress: false, // Tema değişikliği kontrol bayrağı
      lastThemeChange: 0, // Son tema değişikliği zamanı
      lastColorTheme: null, // Son renk teması
      lastContrastLevel: null, // Son kontrast seviyesi
      lastFontSize: null, // Son font boyutu
      lastReducedMotion: null, // Son azaltılmış hareket
      blockThemeManagerEvents: false // ThemeManager olaylarını geçici olarak engelleme
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
    console.log('%c[SettingsPanel] init() başlatılıyor...', 'color: purple; font-weight: bold');
    
    // Çift başlatmayı önle
    if (window.__settingsPanelInitialized || this.state.isInitialized) {
      console.warn('SettingsPanel zaten başlatılmış, tekrar başlatılmayacak.');
      return;
    }
    
    // Başlatma işleminin devam ettiğini işaretle
    if (this.state.initializationInProgress) {
      console.warn('SettingsPanel başlatma işlemi zaten devam ediyor.');
      return;
    }
    
    // Başlatma işlemi başlıyor
    this.state.initializationInProgress = true;
    
    console.log('Ayarlar paneli başlatılıyor...');
    
    // Panel elementlerini seç/oluştur
    this.initElements();
    
    // ThemeManager'ı kontrol et - eğer yüklü değilse bekle
    if (!this.themeManager) {
      console.log('ThemeManager bulunamadı. Yüklenmeyi bekliyorum...');
      
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
          console.log('ThemeManager bulunamadığı için varsayılan ayarlarla devam ediliyor.');
          this.completeInitialization();
        }
      }, 2000);
      
      return;
    }
    
    // ThemeManager zaten yüklüyse devam et
    this.completeInitialization();
    
    // Toggle butonunu tekrar kontrol et
    setTimeout(() => {
      console.log('Toggle butonunu son kez kontrol ediyorum');
      
      // Toggle buton hala çalışmıyorsa manuel olarak yeniden bağla
      const toggleBtn = document.getElementById('settingsToggle');
      if (toggleBtn) {
        console.log('Toggle butonu DOM\'da mevcut');
        
        // Temiz bir yaklaşım: Tüm eventleri kaldırıp yeniden ekle
        const newBtn = toggleBtn.cloneNode(true);
        if (toggleBtn.parentNode) {
          toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
          
          // Yeni olayı ekle
          newBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('%c[SettingsPanel] Yeniden bağlanan toggle butonu tıklandı', 'color: orange');
            this.toggleSettingsPanel();
          };
          
          // Referansı güncelle
          this.elements.toggleButton = newBtn;
          console.log('Toggle butonu başarıyla yeniden bağlandı');
        }
      } else {
        console.warn('Toggle butonu DOM\'da bulunamadı!');
      }
      
      // TEST: Panel açılışını konsol üzerinden deneyebilmek için global method
      window.openThemePanel = () => {
        console.log('%c[TEST] Paneli açma komutu çalıştırıldı', 'color: red');
        this.toggleSettingsPanel(true);
      };
      
      console.log('%c[SettingsPanel] Başlatma tamamlandı. Test için konsola "openThemePanel()" yazabilirsiniz.', 'color: green; font-weight: bold');
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
      console.log('Mevcut settings toggle butonu bulundu, dinleyici index.js tarafından eklendi.');
      this.elements.toggleButton._hasClickHandler = true;
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
    // Removing aria-hidden as it conflicts with focusable elements inside
    // panel.setAttribute('aria-hidden', 'true');
    
    // Panel pozisyonu
    panel.classList.add(this.options.panelPosition || 'right');
    
    // Panel içeriği
    const cssClass = '';
    
    const panelHTML = `
      <div class="theme-preview" aria-hidden="true">
        <div class="sky">
          <div class="sun">
            <div class="sun-ray"></div>
            <div class="sun-ray"></div>
            <div class="sun-ray"></div>
            <div class="sun-ray"></div>
            <div class="sun-ray"></div>
            <div class="sun-ray"></div>
            <div class="sun-ray"></div>
            <div class="sun-ray"></div>
          </div>
          <div class="moon"></div>
          <div class="star star1"></div>
          <div class="star star2"></div>
          <div class="star star3"></div>
          <div class="star star4"></div>
          <div class="star star5"></div>
          <div class="star star6"></div>
          <div class="star star7"></div>
          <div class="star star8"></div>
          <div class="star star9"></div>
          <div class="horizon">
            <svg viewBox="0 0 120 28" preserveAspectRatio="none"><path d="M0,20 Q30,28 60,20 T120,20 V28 H0Z" fill="#b0b8c9" opacity=".7"/></svg>
          </div>
          <div class="cloud"></div>
          <div class="cloud cloud2"></div>
          <div class="time-indicator">00:00</div>
          <span class="auto-icon" title="Otomatik Tema">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="16" cy="16" r="12" stroke-dasharray="4 4"/>
              <path d="M16 8v4M16 20v4M8 16h4M20 16h4"/>
            </svg>
          </span>
        </div>
      </div>
      <div class="settings-panel-header">
        <h2 class="settings-panel-title">Tema Ayarları</h2>
        <button class="settings-panel-close" aria-label="Kapat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="settings-section">
        <div class="settings-section-title">Tema Modu</div>
        <div class="theme-mode-options">
          <div class="theme-mode-option">
            <input type="radio" id="themeLight" name="themeMode" class="theme-radio" value="light">
            <label for="themeLight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              Açık
            </label>
          </div>
          <div class="theme-mode-option">
            <input type="radio" id="themeDark" name="themeMode" class="theme-radio" value="dark">
            <label for="themeDark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              Koyu
            </label>
          </div>
          <div class="theme-mode-option">
            <input type="radio" id="themeAuto" name="themeMode" class="theme-radio" value="auto">
            <label for="themeAuto">
              <div class="auto-theme-icon">
                <div class="sun-moon-icon sun-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M6 6l-1-1M19 19l-1-1M18 6l1-1M5 19l1-1"></path>
                  </svg>
                </div>
                <div class="sun-moon-icon moon-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                </div>
              </div>
              Otomatik
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
    
    // Panel içeriğini ayarla
    panel.innerHTML = panelHTML;

    // Animasyon fonksiyonu ekle
    this.initThemePreviewAnimation(panel);

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
      const closeButton = panel.querySelector('.settings-panel-close');
      if (closeButton) {
        closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // Olayın yayılmasını engelle
          this.toggleSettingsPanel(false);
        });
      }
    }, 0);
  }
  
  // Tema önizleme animasyonunu başlatan fonksiyon
  initThemePreviewAnimation(panel) {
    const preview = panel.querySelector('.theme-preview');
    const sun = preview.querySelector('.sun');
    const moon = preview.querySelector('.moon');
    const stars = preview.querySelectorAll('.star');
    const timeIndicator = preview.querySelector('.time-indicator');
    const clouds = preview.querySelectorAll('.cloud, .cloud2');
    const skyElement = preview.querySelector('.sky');
    const horizonElement = preview.querySelector('.horizon');
    
    // Ek yıldızlar ekle (daha zengin bir gece görünümü için)
    const addExtraStars = () => {
      // Önce yıldızlar konteynerini oluştur (kullanılmıyorsa)
      let starsContainer = preview.querySelector('.extra-stars');
      if (!starsContainer) {
        starsContainer = document.createElement('div');
        starsContainer.className = 'extra-stars';
        starsContainer.style.position = 'absolute';
        starsContainer.style.top = '0';
        starsContainer.style.left = '0';
        starsContainer.style.width = '100%';
        starsContainer.style.height = '100%';
        starsContainer.style.pointerEvents = 'none';
        starsContainer.style.opacity = '0';
        starsContainer.style.transition = 'opacity 2s ease';
        skyElement.appendChild(starsContainer);
      }
      
      // Eğer yıldızlar zaten eklenmişse tekrar ekleme
      if (starsContainer.children.length > 0) return;
      
      // 20 ek yıldız ekle (daha yoğun gece gökyüzü için)
      for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'extra-star';
        star.style.position = 'absolute';
        star.style.width = (Math.random() * 2 + 1) + 'px';  // 1-3px arası rastgele boyut
        star.style.height = star.style.width;
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.opacity = '0';
        star.style.boxShadow = '0 0 ' + (Math.random() * 6 + 4) + 'px rgba(255, 255, 255, 0.9)';
        
        // Yıldız parıltı animasyonu
        const animDuration = Math.random() * 3 + 2; // 2-5s arası rastgele süre
        const animDelay = Math.random() * 5; // 0-5s arası rastgele gecikme
        star.style.animation = `twinkle ${animDuration}s infinite alternate ${animDelay}s`;
        
        starsContainer.appendChild(star);
      }
    };
    
    // Ek yıldızları göster/gizle
    const toggleExtraStars = (show) => {
      const starsContainer = preview.querySelector('.extra-stars');
      if (!starsContainer) return;
      
      starsContainer.style.opacity = show ? '1' : '0';
      
      // Eğer gösterilecekse, her yıldızı sırayla yak
      if (show) {
        Array.from(starsContainer.children).forEach((star, index) => {
          setTimeout(() => {
            star.style.opacity = '1';
          }, index * 80); // Daha hızlı aralıklarla yak
        });
      } else {
        // Gizlenecekse hepsini hemen kapat
        Array.from(starsContainer.children).forEach(star => {
          star.style.opacity = '0';
        });
      }
    };
    
    // Ek yıldızları oluştur
    addExtraStars();
    
    // Her tema modu için saat göstergesini başlatıcak ve güncelleyecek fonksiyon
    const updateClock = () => {
      if (timeIndicator) {
        const now = new Date();
        const formattedHour = now.getHours().toString().padStart(2, '0');
        const formattedMinute = now.getMinutes().toString().padStart(2, '0');
        timeIndicator.textContent = `${formattedHour}:${formattedMinute}`;
        
        // Saate göre gece/gündüz modunu ayarla (otomatik tema için)
        const hour = now.getHours();
        const isNight = hour >= 19 || hour < 6;
        
        // Auto-anim sınıfı var mı kontrol et (otomatik modda mıyız?)
        if (preview.classList.contains('auto-anim')) {
          if (isNight && !preview.classList.contains('night-mode')) {
            // Gece saati ama gündüz gösteriliyor, gece moduna geç
            preview.classList.add('night-mode');
            
            // Gökyüzünü karanlık yap
            skyElement.style.background = 'linear-gradient(140deg, #0a1525 0%, #162942 100%)';
            
            // Güneşi gizle, ayı göster animasyonu
            sun.style.opacity = '0';
            sun.style.transform = 'translateY(20px) scale(0.8)';
            
            // Güneş ışınlarını gizle
            const sunRays = sun.querySelectorAll('.sun-ray');
            if (sunRays && sunRays.length) {
              sunRays.forEach(ray => {
                ray.style.opacity = '0';
              });
            }
            
            // Bulutları gizle
            clouds.forEach(cloud => {
              cloud.style.backgroundColor = 'rgba(180, 185, 195, 0.25)';
              cloud.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
              cloud.style.opacity = '0';
              cloud.style.transform = 'translateY(20px)';
            });
            
            // Ay ve yıldızları göster
            setTimeout(() => {
              moon.style.opacity = '1';
              moon.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
              
              // Yıldızları yak
              toggleExtraStars(true);
              stars.forEach((star, index) => {
                setTimeout(() => {
                  star.style.opacity = '0.7';
                }, 100 + index * 50); // Daha hızlı bir şekilde yıldızları yak
              });
            }, 300);
          } else if (!isNight && preview.classList.contains('night-mode')) {
            // Gündüz saati ama gece gösteriliyor, gündüz moduna geç
            preview.classList.remove('night-mode');
            
            // Gökyüzünü aydınlat
            skyElement.style.background = 'linear-gradient(140deg, #e0e7ef 0%, #f5f7fa 50%, #ffe6c9 100%)';
            
            // Ayı gizle
            moon.style.opacity = '0';
            moon.style.transform = 'translateY(20px) scale(0.8)';
            
            // Yıldızları söndür
            stars.forEach(star => {
              star.style.opacity = '0';
            });
            toggleExtraStars(false);
            
            // Bulutları göster
            clouds.forEach(cloud => {
              cloud.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
              cloud.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
              cloud.style.opacity = '0.75';
              cloud.style.transform = 'translateY(0)';
            });
            
            // Güneşi göster
            setTimeout(() => {
              sun.style.opacity = '1';
              sun.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
              
              // Güneş ışınlarını göster
              const sunRays = sun.querySelectorAll('.sun-ray');
              if (sunRays && sunRays.length) {
                sunRays.forEach(ray => {
                  ray.style.opacity = '1';
                });
              }
            }, 300);
          }
        }
      }
    };
    
    // Saati başlat
    updateClock();
    
    // Her 60 saniyede bir saati güncelle
    clearInterval(this._timeUpdateInterval);
    this._timeUpdateInterval = setInterval(updateClock, 60000);
    
    // Tema değişiminde gelişmiş animasyon tetikleme
    const animate = (mode) => {
      // Tüm animasyon sınıflarını kaldır
      preview.classList.remove('light-anim', 'dark-anim', 'auto-anim');
      
      // Animasyonu geciktir, performans için requestAnimationFrame kullan
      requestAnimationFrame(() => {
        if (mode === 'light') {
          // Gece modundaysa gündüz moduna geçiş animasyonu
          if (preview.classList.contains('night-mode')) {
            // Önce gece modu sınıfını kaldır
            preview.classList.remove('night-mode');
            
            // Gökyüzü arka planını ayarla
            skyElement.style.background = 'linear-gradient(140deg, #e0e7ef 0%, #f5f7fa 50%, #ffe6c9 100%)';
            
            // Yıldızları gizle
            stars.forEach(star => {
              star.style.opacity = '0';
            });
            
            // Ek yıldızları gizle
            toggleExtraStars(false);
            
            // Ay kaybolsun
            moon.style.opacity = '0';
            moon.style.transform = 'translateY(20px) scale(0.8)';
            
            // Bulutları güncelle - gündüz modu için
            clouds.forEach(cloud => {
              cloud.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
              cloud.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
              cloud.style.opacity = '0.75';
              cloud.style.transform = 'translateY(0)';
            });
            
            // Kısa bir gecikme sonra güneş doğsun
            setTimeout(() => {
              // Güneş görünür olsun
              sun.style.opacity = '1';
              sun.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
              
              // Işınları görünür yap
              const sunRays = sun.querySelectorAll('.sun-ray');
              if (sunRays && sunRays.length) {
                sunRays.forEach(ray => {
                  ray.style.opacity = '1';
                });
              }
              
              // Animasyon sınıfını ekle
              preview.classList.add('light-anim');
            }, 300);
          } else {
            // Doğrudan gündüz modu animasyonu
            skyElement.style.background = 'linear-gradient(140deg, #e0e7ef 0%, #f5f7fa 50%, #ffe6c9 100%)';
            
            // Ay gizli, güneş görünür
            moon.style.opacity = '0';
            moon.style.transform = 'translateY(20px) scale(0.8)';
            sun.style.opacity = '1';
            sun.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
            
            // Işınları görünür yap
            const sunRays = sun.querySelectorAll('.sun-ray');
            if (sunRays && sunRays.length) {
              sunRays.forEach(ray => {
                ray.style.opacity = '1';
              });
            }
            
            // Bulutları güncelle
            clouds.forEach(cloud => {
              cloud.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
              cloud.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
              cloud.style.opacity = '0.75';
              cloud.style.transform = 'translateY(0)';
            });
            
            preview.classList.add('light-anim');
          }
        } else if (mode === 'dark') {
          // Gündüz modundaysa gece moduna geçiş
          if (!preview.classList.contains('night-mode')) {
            // Gece modu sınıfını ekle
            preview.classList.add('night-mode');
            
            // Gökyüzü arka planını ayarla - gece moduna uygun karanlık renk
            skyElement.style.background = 'linear-gradient(140deg, #0a1525 0%, #162942 100%)';
            
            // Güneş batsın
            sun.style.opacity = '0';
            sun.style.transform = 'translateY(20px) scale(0.8)';
            
            // Işınları gizle
            const sunRays = sun.querySelectorAll('.sun-ray');
            if (sunRays && sunRays.length) {
              sunRays.forEach(ray => {
                ray.style.opacity = '0';
              });
            }
            
            // Bulutları güncelle - gece modu için daha transparan
            clouds.forEach(cloud => {
              cloud.style.backgroundColor = 'rgba(180, 185, 195, 0.25)';
              cloud.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
              cloud.style.opacity = '0';
              cloud.style.transform = 'translateY(20px)';
            });
            
            // Kısa bir gecikme sonra ay ve yıldızlar görünsün
            setTimeout(() => {
              // Ayın görünmesi
              moon.style.opacity = '1';
              moon.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
              
              // Ek yıldızları göster
              toggleExtraStars(true);
              
              // Yıldızları sırayla göster
              stars.forEach((star, index) => {
                setTimeout(() => {
                  star.style.opacity = '0.7';
                }, index * 100);
              });
              
              // Animasyon sınıfını ekle
              preview.classList.add('dark-anim');
            }, 300);
          } else {
            // Doğrudan gece modu
            skyElement.style.background = 'linear-gradient(140deg, #0a1525 0%, #162942 100%)';
            
            // Güneş gizli, ay görünür
            sun.style.opacity = '0';
            sun.style.transform = 'translateY(20px) scale(0.8)';
            moon.style.opacity = '1';
            moon.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
            
            // Bulutları güncelle
            clouds.forEach(cloud => {
              cloud.style.backgroundColor = 'rgba(180, 185, 195, 0.25)';
              cloud.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
              cloud.style.opacity = '0';
              cloud.style.transform = 'translateY(20px)';
            });
            
            // Yıldızları göster
            stars.forEach(star => {
              star.style.opacity = '0.7';
            });
            
            // Ek yıldızları göster
            toggleExtraStars(true);
            
            preview.classList.add('dark-anim');
          }
        } else if (mode === 'auto') {
          preview.classList.add('auto-anim');
          
          // Saate göre güneş/ay pozisyonunu ayarla
          const now = new Date();
          const hour = now.getHours();
          const isNight = hour >= 19 || hour < 6;
          
          // İlk yükleme için doğru gece/gündüz durumunu ayarla
          if (isNight) {
            // Şimdi gece saati - gece moduna geç
            preview.classList.add('night-mode');
            
            // Gökyüzü karanlık
            skyElement.style.background = 'linear-gradient(140deg, #0a1525 0%, #162942 100%)';
            
            // Güneş gizli, ay görünür
            sun.style.opacity = '0';
            sun.style.transform = 'translateY(20px) scale(0.8)';
            moon.style.opacity = '1';
            moon.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
            
            // Güneş ışınları gizli
            const sunRays = sun.querySelectorAll('.sun-ray');
            if (sunRays && sunRays.length) {
              sunRays.forEach(ray => {
                ray.style.opacity = '0';
              });
            }
            
            // Bulutlar transparent
            clouds.forEach(cloud => {
              cloud.style.backgroundColor = 'rgba(180, 185, 195, 0.25)';
              cloud.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
              cloud.style.opacity = '0';
              cloud.style.transform = 'translateY(20px)';
            });
            
            // Yıldızlar görünür
            toggleExtraStars(true);
            stars.forEach(star => {
              star.style.opacity = '0.7';
            });
          } else {
            // Şimdi gündüz saati - gündüz moduna geç
            preview.classList.remove('night-mode');
            
            // Gökyüzü aydınlık
            skyElement.style.background = 'linear-gradient(140deg, #e0e7ef 0%, #f5f7fa 50%, #ffe6c9 100%)';
            
            // Ay gizli, güneş görünür
            moon.style.opacity = '0';
            moon.style.transform = 'translateY(20px) scale(0.8)';
            sun.style.opacity = '1'; 
            sun.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
            
            // Güneş ışınları görünür
            const sunRays = sun.querySelectorAll('.sun-ray');
            if (sunRays && sunRays.length) {
              sunRays.forEach(ray => {
                ray.style.opacity = '1';
              });
            }
            
            // Bulutlar görünür
            clouds.forEach(cloud => {
              cloud.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
              cloud.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
              cloud.style.opacity = '0.75';
              cloud.style.transform = 'translateY(0)';
            });
            
            // Yıldızlar gizli
            toggleExtraStars(false);
            stars.forEach(star => {
              star.style.opacity = '0';
            });
          }
        }
        
        // Her tema değişikliğinde saati güncelle
        updateClock();
      });
    };
    
    // İlk yüklemede mevcut temaya göre animasyon
    let currentTheme = 'light'; // Varsayılan tema
    
    // ThemeManager veya doküman özniteliğinden tema modunu al
    if (this.themeManager && this.themeManager.settings) {
      currentTheme = this.themeManager.settings.themeMode || 'light';
    } else {
      currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    }
    
    // Mevcut saate göre gündüz/gece stilini belirle
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour >= 19 || hour < 6;
    
    // Güneş ve ay pozisyonlarını CSS değişkenine uygun ayarla
    if (sun) {
      sun.style.bottom = 'var(--sun-position-bottom, 42px)';
      sun.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
    }
    
    if (moon) {
      moon.style.bottom = 'var(--moon-position-bottom, 42px)';
      moon.style.transform = 'translateX(-50%) scale(1.1) rotate(-5deg)';
    }
    
    // Eğer tema otomatikse veya gece modu etkinse gece stilini uygula
    if (currentTheme === 'auto' && isNight) {
      preview.classList.add('night-mode');
      
      // Gökyüzü ve horizon başlangıç renkleri - daha koyu
      skyElement.style.background = 'linear-gradient(140deg, #0a1525 0%, #162942 100%)';
      
      // Bulutları güncelle - daha transparan
      clouds.forEach(cloud => {
        cloud.style.backgroundColor = 'rgba(180, 185, 195, 0.25)';
        cloud.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        cloud.style.opacity = '0';
        cloud.style.transform = 'translateY(20px)';
      });
      
      // Ay görünür, güneş gizli
      moon.style.opacity = '1';
      sun.style.opacity = '0';
      sun.style.transform = 'translateY(20px) scale(0.8)';
      
      // Işınları gizle
      const sunRays = sun.querySelectorAll('.sun-ray');
      if (sunRays && sunRays.length) {
        sunRays.forEach(ray => {
          ray.style.opacity = '0';
        });
      }
      
      // Yıldızlar görünür
      stars.forEach(star => {
        star.style.opacity = '0.7';
      });
      
      // Ek yıldızları göster
      toggleExtraStars(true);
    } else if (currentTheme === 'dark') {
      preview.classList.add('night-mode');
      
      // Gökyüzü ve horizon başlangıç renkleri - daha koyu
      skyElement.style.background = 'linear-gradient(140deg, #0a1525 0%, #162942 100%)';
      
      // Bulutları güncelle - daha transparan
      clouds.forEach(cloud => {
        cloud.style.backgroundColor = 'rgba(180, 185, 195, 0.25)';
        cloud.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        cloud.style.opacity = '0';
        cloud.style.transform = 'translateY(20px)';
      });
      
      // Ay görünür, güneş gizli
      moon.style.opacity = '1';
      sun.style.opacity = '0';
      sun.style.transform = 'translateY(20px) scale(0.8)';
      
      // Işınları gizle
      const sunRays = sun.querySelectorAll('.sun-ray');
      if (sunRays && sunRays.length) {
        sunRays.forEach(ray => {
          ray.style.opacity = '0';
        });
      }
      
      // Yıldızlar görünür
      stars.forEach(star => {
        star.style.opacity = '0.7';
      });
      
      // Ek yıldızları göster
      toggleExtraStars(true);
    } else {
      // Gündüz modu - güneş görünür, ay gizli
      preview.classList.remove('night-mode');
      
      // Gökyüzü ve horizon başlangıç renkleri - daha canlı
      skyElement.style.background = 'linear-gradient(140deg, #e0e7ef 0%, #f5f7fa 50%, #ffe6c9 100%)';
      
      // Bulutları güncelle - daha opak
      clouds.forEach(cloud => {
        cloud.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        cloud.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
        cloud.style.opacity = '0.75';
        cloud.style.transform = 'translateY(0)';
      });
      
      sun.style.opacity = '1';
      moon.style.opacity = '0';
      moon.style.transform = 'translateY(20px) scale(0.8)';
      
      // Işınları görünür yap
      const sunRays = sun.querySelectorAll('.sun-ray');
      if (sunRays && sunRays.length) {
        sunRays.forEach(ray => {
          ray.style.opacity = '1';
        });
      }
      
      // Yıldızlar gizli
      stars.forEach(star => {
        star.style.opacity = '0';
      });
      
      // Ek yıldızları gizle
      toggleExtraStars(false);
    }
    
    // İlk animasyonu başlat
    animate(currentTheme);
    
    // Tema değişiminde tetikleme
    this.on('themeModeChanged', animate);
    
    // Başlatma olayında tetikleme
    this.on('initialized', () => animate(currentTheme));
    
    // Sayfadan ayrılırken zamanlayıcıyı temizle
    window.addEventListener('beforeunload', () => {
      clearInterval(this._timeUpdateInterval);
    });

    // Bulutlara animasyon ekle
    clouds.forEach(cloud => {
      // Float-cloud animasyonunun CSS'de tanımlandığından emin ol
      const randomDuration = Math.floor(Math.random() * 20) + 40; // 40-60s arası
      const randomDelay = Math.floor(Math.random() * 10); // 0-10s arası
      
      cloud.style.animation = `float-cloud ${randomDuration}s linear infinite`;
      cloud.style.animationDelay = `${randomDelay}s`;
    });
  }
  
  /**
   * Toggle butonunu oluşturur
   */
  createToggleButton() {
    // Önce mevcut butonu kontrol et
    let toggleButton = document.getElementById('settingsToggle');
    
    // Mevcut buton varsa, özellikleri kontrol et
    if (toggleButton) {
      console.log('Mevcut toggle butonu kullanılıyor');
      
      // Butonun önceki tüm event listener'larını temizle
      const newButton = toggleButton.cloneNode(true);
      toggleButton.parentNode.replaceChild(newButton, toggleButton);
      toggleButton = newButton;
    } 
    // Yoksa yeni buton oluştur
    else {
      console.log('Yeni toggle butonu oluşturuluyor');
      toggleButton = document.createElement('button');
      toggleButton.id = 'settingsToggle';
      toggleButton.className = 'settings-toggle';
      toggleButton.setAttribute('type', 'button');
      toggleButton.setAttribute('aria-expanded', 'false');
      toggleButton.setAttribute('aria-controls', 'settingsPanel');
      toggleButton.setAttribute('aria-label', 'Tema Ayarları');
      
      // Toggle buton ikonunu doğrudan içeriğe ekle
      toggleButton.innerHTML = `
        <svg class="settings-toggle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
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
    }
    
    // Referansı kaydet
    this.elements.toggleButton = toggleButton;
    
    // Net ve basit bir tıklama olayı ekle
    console.log('Toggle butonuna tıklama olayı ekleniyor');
    toggleButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('%c[SettingsPanel] Toggle butonu tıklandı!', 'color: blue; font-weight: bold');
      this.toggleSettingsPanel();
    };
    
    // İşaretleme
    toggleButton._hasClickHandler = true;
    
    // Log
    console.log('Ayarlar butonu hazır');
    
    return toggleButton;
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
    let currentThemeMode = 'light'; // Varsayılan tema modu
    
    // ThemeManager varsa ondan al
    if (this.themeManager && this.themeManager.settings) {
      currentThemeMode = this.themeManager.settings.themeMode || 'light';
    } else {
      // Kaydedilmiş tema modu varsa kullan
      const savedThemeMode = ThemeUtils.getFromStorage('themeMode');
      if (savedThemeMode) {
        currentThemeMode = savedThemeMode;
      }
    }
    
    // Son tema modunu kaydet (çift değişimleri önlemek için)
    this.state.lastThemeMode = currentThemeMode;
    console.log(`[SettingsPanel] Başlangıç tema modu: ${currentThemeMode}`);
    
    // İlgili radio butonu seç
    const selectedRadio = document.querySelector(`input[name="themeMode"][value="${currentThemeMode}"]`);
    if (selectedRadio) {
      selectedRadio.checked = true;
    }
    
    // HTML ve Body'deki tema durumunu kontrol et ve senkronize et
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    
    // Eğer HTML'deki tema doğru değilse, düzelt
    if (currentThemeMode === 'light' && htmlTheme !== 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-mode');
    } else if (currentThemeMode === 'dark' && htmlTheme !== 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
    } else if (currentThemeMode === 'auto') {
      // Otomatik modda saate göre doğru tema uygulanmış mı kontrol et
      this.updateAutoModeTheme();
      this.startAutoModeTimeCheck();
    }
    
    // ÖNEMLİ: Tema değişikliklerini işleyen fonksiyon
    const handleThemeChange = (newThemeMode) => {
      // Tema değişikliği sırasında yeni değişiklikleri önle
      if (this.state.themeModeChangeInProgress) {
        console.log(`[SettingsPanel] Tema değişikliği zaten işleniyor, yeni istek iptal edildi`);
        return;
      }
      
      // ÖNEMLİ: Kritik aynı tema kontrolü
      if (newThemeMode === this.state.lastThemeMode) {
        console.log(`[SettingsPanel] Aynı tema modu değişimi algılandı ve DURDURULDU: ${newThemeMode}`);
        return false; // Değişiklik yok
      }
      
      // Tema değişikliği işlem bayrağını ayarla
      this.state.themeModeChangeInProgress = true;
      
      // Performans ölçümü başlat
      console.time('themeChange');
      
      // Önceki tema modunu hatırla
      const prevThemeMode = this.state.lastThemeMode;
      
      // Yeni tema modunu kaydet
      this.state.lastThemeMode = newThemeMode;
      
      // Konsola detaylı bilgi
      console.log(`[SettingsPanel] Tema değişikliği işleniyor: ${prevThemeMode} -> ${newThemeMode}`);
      
      // ThemeManager ile modu değiştir - ÖNEMLİ: processChangeByUs bayrağı ekle
      if (this.themeManager && typeof this.themeManager.setThemeMode === 'function') {
        // Özel bayrak ile çağrı
        if (typeof this.themeManager.setThemeMode === 'function' && this.themeManager.setThemeMode.length >= 2) {
          // API 2 parametre kabul ediyorsa bayrak ekle
          this.themeManager.setThemeMode(newThemeMode, { processedBySettingsPanel: true });
        } else {
          // Standart API, bayrak yok
          this.themeManager.setThemeMode(newThemeMode);
        }
      } else {
        this.manuallyApplyThemeMode(newThemeMode);
      }
      
      // UI güncellemeleri
      this.syncPanelWithDocumentTheme();
      
      // Log
      this.log(`Tema modu değiştirildi: ${newThemeMode}`);
      
      // Olay tetikle
      this.emit('themeModeChanged', newThemeMode);
      
      // Performans ölçümü bitir
      console.timeEnd('themeChange');
      
      // İşlem bayrağını sıfırla
      setTimeout(() => {
        this.state.themeModeChangeInProgress = false;
      }, 100);
      
      return true; // Değişiklik başarılı
    };
    
    // Olay dinleyicileri ekle - performans için debounce ile
    themeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const newThemeMode = radio.value;
          
          // RequestAnimationFrame'i kaldırarak doğrudan çağrı yap
          handleThemeChange(newThemeMode);
        }
      });
    });
    
    // Yardımcı metod olarak dışa aktar
    this._handleThemeChange = handleThemeChange;
    
    // Referansı sakla
    this.elements.themeToggles = themeRadios;
  }

  /**
   * Otomatik mod için tema güncellemesini yapar
   */
  updateAutoModeTheme() {
    const currentHour = new Date().getHours();
    const isDark = (currentHour >= 19 || currentHour < 7);
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // Eğer tema günün saatine göre uygun değilse değiştir
    if ((isDark && currentTheme !== 'dark') || (!isDark && currentTheme !== 'light')) {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.body.classList.toggle('dark-mode', isDark);
      
      // Debug bilgisi
      this.log(`Otomatik mod (güncelleme): Tema ${isDark ? 'koyu' : 'açık'} moda ayarlandı (Saat: ${currentHour})`);
      
      // UI güncellemeleri
      this.syncPanelWithDocumentTheme();
      
      // Tema değişim olayını tetikle
      ThemeUtils.dispatchCustomEvent('themeChanged', {
        oldTheme: isDark ? 'light' : 'dark',
        newTheme: isDark ? 'dark' : 'light'
      });
    }
  }

  /**
   * Manuel olarak tema modunu uygula (ThemeManager yoksa)
   * @param {string} mode - Tema modu ('light', 'dark', 'auto', 'system')
   */
  manuallyApplyThemeMode(mode) {
    // Performans ölçümü başlat
    console.time('manualThemeChange');
    
    // Önceki tema
    const prevMode = document.documentElement.getAttribute('data-theme');
    
    // Aynı tema modunu tekrar uygulamayı önle
    if ((mode === 'light' && prevMode === 'light') || 
        (mode === 'dark' && prevMode === 'dark')) {
      console.log(`[SettingsPanel] Aynı tema modu tekrar uygulanmaya çalışılıyor, işlem iptal edildi: ${mode}`);
      console.timeEnd('manualThemeChange');
      return;
    }
    
    // Tüm CSS değişikliklerini tek bir requestAnimationFrame içinde yap
    requestAnimationFrame(() => {
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
          
          // Otomatik mod için saat değişimini dinleyecek zamanlayıcı başlat
          this.startAutoModeTimeCheck();
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
      
      // UI güncellemeleri - tek bir reflow'da yapmak için birleştir
      this.syncPanelWithDocumentTheme();
      
      // Erişilebilirlik için bildiri
      ThemeUtils.announceToScreenReader(`${this.capitalizeFirstLetter(mode)} tema etkinleştirildi`);
      
      // Performans ölçümü bitir
      console.timeEnd('manualThemeChange');
    });
  }
  
  /**
   * Otomatik mod için saat değişimini kontrol eden zamanlayıcıyı başlatır
   * Bu fonksiyon, saate bağlı tema değişimi için gerekli
   */
  startAutoModeTimeCheck() {
    // Önceki zamanlayıcıyı temizle
    if (this._autoModeTimeChecker) {
      clearInterval(this._autoModeTimeChecker);
    }
    
    // Her dakika kontrol et
    this._autoModeTimeChecker = setInterval(() => {
      // Eğer aktif mod otomatik değilse zamanlayıcıyı durdur
      const currentMode = ThemeUtils.getFromStorage('themeMode');
      if (currentMode !== 'auto') {
        clearInterval(this._autoModeTimeChecker);
        this._autoModeTimeChecker = null;
        return;
      }
      
      // Şu anki saati kontrol et ve gerekirse tema modunu değiştir
      const currentHour = new Date().getHours();
      const isDark = (currentHour >= 19 || currentHour < 7);
      const currentTheme = document.documentElement.getAttribute('data-theme');
      
      // Eğer tema günün saatine göre uygun değilse değiştir
      if ((isDark && currentTheme !== 'dark') || (!isDark && currentTheme !== 'light')) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', isDark);
        
        // UI güncellemeleri
        this.syncPanelWithDocumentTheme();
        
        // Debug bilgisi
        this.log(`Otomatik mod: Saat değişimine göre tema ${isDark ? 'koyu' : 'açık'} moda ayarlandı (Saat: ${currentHour})`);
        
        // Tema değişim olayını tetikle
        ThemeUtils.dispatchCustomEvent('themeChanged', {
          oldTheme: isDark ? 'light' : 'dark',
          newTheme: isDark ? 'dark' : 'light'
        });
      }
    }, 60000); // Her dakika kontrol et
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
      
      // Tıklama olayı ekle - Performans için Throttle eklendi
      let isProcessing = false;
      
      option.addEventListener('click', () => {
        // Aynı rengi tekrar seçmeyi önle
        if (option.classList.contains('active')) {
          console.log(`[SettingsPanel] Aynı renk teması zaten seçili: ${theme}`);
          return;
        }
        
        // İşlem devam ediyorsa yeni tıklamayı önle
        if (isProcessing) {
          console.log(`[SettingsPanel] Renk değişikliği işlemi devam ediyor, lütfen bekleyin`);
          return;
        }
        
        isProcessing = true;
        
        // Renk değişikliklerini tek bir render çerçevesinde yap
        requestAnimationFrame(() => {
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
          
          // İşlemi tamamla
          setTimeout(() => {
            isProcessing = false;
          }, 100);
        });
      });
    });
    
    // Referansı sakla
    this.elements.colorOptions = colorOptions;
    
    // Cache ayarını kontrol et ve log
    console.log(`[SettingsPanel] Cache ayarı: isCacheText = ${this.options.isCacheText}`);
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
      // ThemeManager ayarlarını sıfırlamadan önce değişiklik olaylarını geçici devre dışı bırak
      let originalThemeManagerListener = null;
      if (this.themeManager && this.themeManager.eventListeners && this.themeManager.eventListeners.themeModeChanged) {
        originalThemeManagerListener = this.themeManager.eventListeners.themeModeChanged;
        this.themeManager.eventListeners.themeModeChanged = []; // Geçici olarak dinleyicileri devre dışı bırak
      }
      
      if (this.themeManager && typeof this.themeManager.resetToDefaults === 'function') {
        // ThemeManager ile sıfırla
        this.themeManager.resetToDefaults();
      } else {
        // Manuel sıfırla - tüm değişiklikleri tek seferde yap
        requestAnimationFrame(() => {
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
          
          // Değişikliklerin uygulanmasını bekle
          setTimeout(() => {
            // UI güncellemeleri
            this.syncPanelWithDocumentTheme();
            
            // Olay tetikle
            this.emit('settingsReset');
            
            // Bildirim göster
            this.showResetNotification();
          }, 50);
        });
      }
      
      // ThemeManager dinleyicilerini geri yükle
      if (originalThemeManagerListener) {
        setTimeout(() => {
          this.themeManager.eventListeners.themeModeChanged = originalThemeManagerListener;
        }, 100);
      }
      
      // Başarı mesajı
      this.log('✅ Ayarlar başarıyla sıfırlandı!');
      
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
    
    // Sınıfları sadece gerekli ise değiştir - gereksiz DOM manipülasyonlarından kaçınmak için
    requestAnimationFrame(() => {
      const currentPanelTheme = this.elements.panel.getAttribute('data-panel-theme');
      
      // Eğer tema zaten aynıysa, gereksiz DOM manipülasyonlarını önle
      if (currentPanelTheme === documentTheme) return;
      
      // Sınıfları sadece gerekirse değiştir
      if (documentTheme === 'dark') {
        if (!this.elements.panel.classList.contains('dark-panel')) {
          this.elements.panel.classList.remove('light-panel', 'high-contrast-panel');
          this.elements.panel.classList.add('dark-panel');
        }
      } else if (documentTheme === 'highContrast') {
        if (!this.elements.panel.classList.contains('high-contrast-panel')) {
          this.elements.panel.classList.remove('light-panel', 'dark-panel');
          this.elements.panel.classList.add('high-contrast-panel');
        }
      } else {
        if (!this.elements.panel.classList.contains('light-panel')) {
          this.elements.panel.classList.remove('dark-panel', 'high-contrast-panel');
          this.elements.panel.classList.add('light-panel');
        }
      }
      
      // Veri özniteliğini güncelle
      this.elements.panel.setAttribute('data-panel-theme', documentTheme);
    });
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
    this.themeManager.on('themeModeChanged', (mode, details) => {
      // Eğer zaten bizim tarafımızdan işlendiyse, tekrar etme
      if (details && details.processedBySettingsPanel) {
        console.log(`[SettingsPanel] ThemeManager bildirim atlandı, zaten işlendi: ${mode}`);
        return;
      }
      
      // Aynı tema modunu tekrar işlemeyi önle
      if (this.state.lastThemeMode === mode) {
        console.log(`[SettingsPanel] ThemeManager'dan aynı tema modu bildirim atlanıyor: ${mode}`);
        return;
      }
      
      // Patlama (debounce) için zaman kontrolü
      const now = Date.now();
      if (now - this.state.lastThemeChange < 100) {
        console.log(`[SettingsPanel] ThemeManager'dan tema değişikliği kısıtlandı, çok sık bildirim`);
        return;
      }
      this.state.lastThemeChange = now;
      
      console.log(`[SettingsPanel] ThemeManager'dan yeni tema modu: ${this.state.lastThemeMode} -> ${mode}`);
      
      // Yeni tema modunu kaydet
      this.state.lastThemeMode = mode;
      
      // Radio butonunu güncelle
      requestAnimationFrame(() => {
        const radio = document.querySelector(`input[name="themeMode"][value="${mode}"]`);
        if (radio && !radio.checked) {
          console.log(`[SettingsPanel] Radio butonu güncelleniyor: ${mode}`);
          radio.checked = true;
        }
        
        // Paneli güncelle
        this.syncPanelWithDocumentTheme();
      });
    });
    
    // Renk değişikliği dinleyicisi
    this.themeManager.on('colorThemeChanged', (theme) => {
      if (this.state.lastColorTheme === theme) {
        console.log(`[SettingsPanel] Aynı renk teması (${theme}) değişikliği atlanıyor.`);
        return;
      }
      
      this.state.lastColorTheme = theme;
      
      // Renk seçeneğini güncelle - performans için requestAnimationFrame içinde
      requestAnimationFrame(() => {
        document.querySelectorAll('.color-option').forEach(option => {
          option.classList.toggle('active', option.getAttribute('data-theme') === theme);
        });
      });
    });
    
    // Kontrast seviyesi değişikliği dinleyicisi
    this.themeManager.on('contrastLevelChanged', (level) => {
      if (this.state.lastContrastLevel === level) {
        console.log(`[SettingsPanel] Aynı kontrast seviyesi (${level}) değişikliği atlanıyor.`);
        return;
      }
      
      this.state.lastContrastLevel = level;
      
      // Kontrast kaydırıcısını güncelle - performans için requestAnimationFrame içinde
      requestAnimationFrame(() => {
        const slider = document.getElementById('contrastSlider');
        if (slider && parseInt(slider.value) !== level) {
          slider.value = level;
          
          // Etiketleri güncelle
          this.updateActiveContrastLevel(level);
        }
      });
    });
    
    // Font boyutu değişikliği dinleyicisi
    this.themeManager.on('fontSizeChanged', (size) => {
      if (this.state.lastFontSize === size) {
        console.log(`[SettingsPanel] Aynı font boyutu (${size}) değişikliği atlanıyor.`);
        return;
      }
      
      this.state.lastFontSize = size;
      
      // Font boyutu kaydırıcısını güncelle - performans için requestAnimationFrame içinde
      requestAnimationFrame(() => {
        const slider = document.getElementById('fontSizeSlider');
        const display = document.getElementById('currentFontSize');
        
        if (slider && parseInt(slider.value) !== size) {
          slider.value = size;
        }
        
        if (display) {
          display.textContent = `${size}%`;
        }
      });
    });
    
    // Azaltılmış hareket değişikliği dinleyicisi
    this.themeManager.on('reducedMotionChanged', (enabled) => {
      if (this.state.lastReducedMotion === enabled) {
        console.log(`[SettingsPanel] Aynı hareket efekti (${enabled}) değişikliği atlanıyor.`);
        return;
      }
      
      this.state.lastReducedMotion = enabled;
      
      // Azaltılmış hareket toggle'ını güncelle - performans için requestAnimationFrame içinde
      requestAnimationFrame(() => {
        const toggle = document.getElementById('reducedMotionToggle');
        if (toggle && toggle.checked !== enabled) {
          toggle.checked = enabled;
        }
      });
    });
  }
  
  /**
   * Olay dinleyicilerini ekler
   */
  attachEventListeners() {
    console.log('%c[SettingsPanel] Olay dinleyicileri ekleniyor', 'color: blue');
    
    // Önceki document click dinleyicisini temizle
    if (this._documentClickHandler) {
      document.removeEventListener('click', this._documentClickHandler);
    }
    
    // Çok basit ve doğrudan document click dinleyicisi ekle
    this._documentClickHandler = (e) => {
      // Panel açıksa ve tıklama dışarıda ise kapat
      if (!this.state.isOpen) return; // Panel kapalıysa işlem yapma
      
      // Elementleri DOM'dan doğrudan al
      const panel = document.getElementById('settingsPanel');
      const toggleBtn = document.getElementById('settingsToggle');
      
      // Hedef elementi kontrol et
      if (e.target === toggleBtn || toggleBtn.contains(e.target)) {
        // Toggle butonu tıklamalarını burada işleme, toggleSettingsPanel'e bırak
        return;
      }
      
      if (panel && !panel.contains(e.target)) {
        console.log('%c[SettingsPanel] Panel dışına tıklandı, kapatılıyor', 'color: orange');
        this.toggleSettingsPanel(false);
      }
    };
    
    // Document click dinleyicisini ekle
    document.addEventListener('click', this._documentClickHandler);
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        console.log('%c[SettingsPanel] ESC tuşu ile kapatılıyor', 'color: orange');
        this.toggleSettingsPanel(false);
      }
    });
    
    // Panel içindeki kapatma butonu
    const closeButton = document.querySelector('.settings-panel-close');
    if (closeButton) {
      closeButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('%c[SettingsPanel] Kapatma butonu tıklandı', 'color: orange');
        this.toggleSettingsPanel(false);
      };
    }
    
    console.log('%c[SettingsPanel] Olay dinleyicileri eklendi', 'color: blue');
  }
  
  /**
   * Ayarlar panelini açar/kapatır
   * @param {boolean|null} forceState - Zorla belirli bir duruma getir (null ise durumu değiştirir)
   */
  toggleSettingsPanel(forceState = null) {
    // ÖNEMLİ: Bu metodun ne yaptığını açıkça görmek için ayrıntılı log ekleyelim
    console.log('%c[SettingsPanel] toggleSettingsPanel çağrıldı', 'color: green; font-weight: bold;');
    console.log('Mevcut durum:', this.state.isOpen, 'Zorlanan durum:', forceState);
    
    // Elementleri DOM'dan alalım
    const panel = document.getElementById('settingsPanel');
    const toggleBtn = document.getElementById('settingsToggle');
    
    if (!panel) {
      console.error('HATA: Panel elementi (#settingsPanel) bulunamadı!');
      return;
    }
    
    if (!toggleBtn) {
      console.error('HATA: Toggle butonu (#settingsToggle) bulunamadı!');
      return;
    }
    
    // Referansları güncelle
    this.elements.panel = panel;
    this.elements.toggleButton = toggleBtn;
    
    // Yeni durumu belirle
    const newState = forceState !== null ? forceState : !this.state.isOpen;
    console.log('Panelin yeni durumu:', newState ? 'AÇIK' : 'KAPALI');
    
    // Mevcut durum istenen durumla aynıysa hiçbir şey yapma
    if (newState === this.state.isOpen) {
      console.log('Panel zaten istenen durumda, işlem yapılmayacak');
      return;
    }
    
    // Durum değişkenini güncelle
    this.state.isOpen = newState;
    
    // Panel açılıyor
    if (newState) {
      console.log('Panel AÇILIYOR...');
      
      // Açık sınıfı ekle
      panel.classList.add('open');
      
      // Basit ve doğrudan stil değişiklikleri
      panel.style.display = 'flex';
      panel.style.visibility = 'visible';
      panel.style.opacity = '1';
      panel.style.transform = 'translateX(0)';
      panel.style.pointerEvents = 'auto';
      
      // Toggle buton durumunu güncelle
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      
      // Senkronize et
      this.syncPanelWithDocumentTheme();
      
      // Olay bildir
      this.emit('panelOpened');
    } 
    // Panel kapanıyor
    else {
      console.log('Panel KAPANIYOR...');
      
      // Kapalı sınıfı ekle
      panel.classList.remove('open');
      
      // Panel pozisyonuna göre transformu ayarla
      if (this.options.panelPosition === 'left') {
        panel.style.transform = 'translateX(-100%)';
      } else {
        panel.style.transform = 'translateX(100%)';
      }
      
      // Diğer stiller
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
      
      // Toggle buton durumunu güncelle
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      
      // Transition bittikten sonra gizle (300ms)
      setTimeout(() => {
        // Panel hala kapalı durumdaysa gizle
        if (!this.state.isOpen) {
          panel.style.visibility = 'hidden';
          panel.style.display = 'none';
        }
      }, 300);
      
      // Olay bildir
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
      
      // Zaman ayarlayıcıları temizle
      if (this._timeUpdateInterval) {
        clearInterval(this._timeUpdateInterval);
      }
      
      if (this._autoModeTimeChecker) {
        clearInterval(this._autoModeTimeChecker);
        this._autoModeTimeChecker = null;
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