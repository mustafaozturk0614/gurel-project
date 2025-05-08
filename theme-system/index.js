/**
 * Gürel Yönetim - Gelişmiş Tema Sistemi
 * Ana başlatma modülü
 * Sürüm: 4.0.0
 * 
 * Bu dosya, tema sistemini başlatır, ThemeManager ve SettingsPanel'i otomatik olarak yükler.
 */

import ThemeManager from './theme-manager.js';
import SettingsPanel from './settings-panel.js';
import ThemeUtils from './theme-utils.js';

// Sistem başlatma durumu
let isInitialized = false;
let isInitializing = false;

// Global nesneleri window'a ekle (geleneksel script'lerle uyumluluk için)
window.ThemeManager = ThemeManager;
window.SettingsPanel = SettingsPanel;
window.ThemeUtils = ThemeUtils;

// Hata yakalama
const handleError = (error, component) => {
  console.error(`Tema Sistemi ${component} Hatası:`, error);
  return null;
};

// Stil dosyalarını dinamik olarak yükle
function loadThemeStylesheets() {
  // Ana tema değişkenleri CSS'sini yükle
  if (!document.querySelector('link[href*="theme-variables.css"]')) {
    const themeVariablesLink = document.createElement('link');
    themeVariablesLink.rel = 'stylesheet';
    themeVariablesLink.href = './theme-system/theme-variables.css';
    document.head.appendChild(themeVariablesLink);
  }

  // Panel stilleri için CSS'i yükle
  if (!document.querySelector('link[href*="settings-panel.css"]')) {
    const settingsPanelLink = document.createElement('link');
    settingsPanelLink.rel = 'stylesheet';
    settingsPanelLink.href = './theme-system/settings-panel.css';
    document.head.appendChild(settingsPanelLink);
  }
  
  // Yeni tema geçiş efektleri CSS'ini yükle
  if (!document.querySelector('link[href*="theme-transitions.css"]')) {
    const themeTransitionsLink = document.createElement('link');
    themeTransitionsLink.rel = 'stylesheet';
    themeTransitionsLink.href = './theme-system/theme-transitions.css';
    document.head.appendChild(themeTransitionsLink);
  }
}

// Tema geçişleri için DOM hazırlıkları
function prepareThemeTransitions() {
  // Tema geçiş sınıfını ana elemana ekle
  document.documentElement.classList.add('theme-transition');
  
  // Animasyon ve geçişlerin sayfa yüklendikten sonra çalışması için
  window.addEventListener('load', () => {
    // Elementlere animasyon sınıfları ekle
    const animatableSelectors = [
      'header', '.card', '.btn-primary', '.hero-section', 
      '.feature-box', '.nav-item', '.sidebar'
    ];
    
    animatableSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.classList.add('theme-animated');
      });
    });
    
    // Kademeli geçişler için element gruplarına stagger-animation sınıfı ekle
    const staggerContainers = [
      'nav ul', '.feature-grid', '.card-container', '.sidebar ul',
      '.button-group', '.tab-container'
    ];
    
    staggerContainers.forEach(selector => {
      const containers = document.querySelectorAll(selector);
      containers.forEach(container => {
        container.classList.add('stagger-animation');
      });
    });
  });
}

// Tema değişimi olaylarını dinle
function setupThemeChangeListeners(themeManager) {
  // Tema değişiminden önce
  themeManager.on('beforeThemeChange', (data) => {
    console.log('Tema değişimi başlıyor:', data);
    document.body.classList.add('theme-is-changing');
  });
  
  // Tema değişimi tamamlandıktan sonra
  themeManager.on('themeTransitionComplete', (data) => {
    console.log('Tema değişimi tamamlandı:', data);
    document.body.classList.remove('theme-is-changing');
    
    // Erişilebilirlik duyurusu
    const mode = data.newMode === 'dark' ? 'karanlık' : 'aydınlık';
    let announcer = document.getElementById('themeAnnouncer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'themeAnnouncer';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    announcer.textContent = `Tema ${mode} moda geçti`;
  });
}

/**
 * Tema sistemini başlatır
 * @param {Object} options - Başlatma seçenekleri
 * @returns {Promise<Object>} - ThemeManager ve SettingsPanel örnekleri
 */
const initThemeSystem = async (options = {}) => {
  if (isInitialized) {
    console.log('Tema sistemi zaten başlatılmış.');
    return {
      themeManager: window.themeManager,
      settingsPanel: window.settingsPanel
    };
  }
  
  if (isInitializing) {
    console.log('Tema sistemi başlatılıyor, lütfen bekleyin...');
    return new Promise((resolve) => {
      const checkInitialization = setInterval(() => {
        if (isInitialized) {
          clearInterval(checkInitialization);
          resolve({
            themeManager: window.themeManager,
            settingsPanel: window.settingsPanel
          });
        }
      }, 100);
      
      // 5 saniye sonra yine de çözümle
      setTimeout(() => {
        clearInterval(checkInitialization);
        resolve({
          themeManager: window.themeManager,
          settingsPanel: window.settingsPanel
        });
      }, 5000);
    });
  }
  
  isInitializing = true;
  
  try {
    // Tema CSS dosyasını yükle
    loadThemeStylesheets();
    
    // Tema geçişleri için DOM hazırlıkları
    prepareThemeTransitions();
    
    // ThemeManager'ı başlat
    let themeManager;
    try {
      themeManager = new ThemeManager({
        themeMode: 'system', // 'light', 'dark', 'auto', 'system'
        colorTheme: 'blue',
        animatedTransitions: true,
        ...options
      });
      window.themeManager = themeManager;
    } catch (error) {
      themeManager = handleError(error, 'ThemeManager');
    }
    
    // Tema değişim olaylarını dinle
    setupThemeChangeListeners(themeManager);
    
    // SettingsPanel'i başlat
    let settingsPanel;
    try {
      settingsPanel = new SettingsPanel(options.settingsPanelOptions || {});
      window.settingsPanel = settingsPanel;
    } catch (error) {
      settingsPanel = handleError(error, 'SettingsPanel');
    }
    
    isInitialized = true;
    isInitializing = false;
    window.themeSystemInitialized = true;
    
    console.log('✅ Tema sistemi başarıyla başlatıldı');
    
    // Global erişim için
    window.themeSystem = {
      themeManager,
      settingsPanel,
      utils: ThemeUtils
    };
    
    // Tema sistemi başlatıldı olayını yayınla
    document.dispatchEvent(new CustomEvent('themeSystemInitialized', {
      detail: { themeManager, settingsPanel }
    }));
    
    return {
      themeManager,
      settingsPanel
    };
  } catch (error) {
    console.error('⚠️ Tema sistemi başlatılırken hata oluştu:', error);
    isInitializing = false;
    throw error;
  }
};

// DOM yüklendikten sonra otomatik başlatma
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      initThemeSystem().catch(err => console.error('Tema sistemi başlatma hatası:', err));
    }, 100); // Küçük bir gecikme ekliyoruz, diğer scriptlerin yüklenmesini beklemek için
  });
} else {
  // Doküman zaten yüklendiyse, hemen başlat
  setTimeout(() => {
    initThemeSystem().catch(err => console.error('Tema sistemi başlatma hatası:', err));
  }, 100);
}

// Geleneksel JavaScript ile uyumluluk için
if (typeof window !== 'undefined') {
  // Global modülleri tanımla (ES6 modülleri olmayan ortamlarda bile erişilebilir)
  window.themeSystem = {
    initThemeSystem,
    ThemeManager,
    SettingsPanel,
    ThemeUtils
  };
  
  // Uyumluluk modu - Geleneksel script kullanımı için
  const initThemeSystemLegacy = function() {
    console.log('Theme system legacy mode başlatılıyor...');
    return initThemeSystem().catch(err => {
      console.error('Legacy init hatası:', err);
      return null;
    });
  };
  
  // Legacy init metodunu global olarak ekle
  window.initThemeSystem = initThemeSystemLegacy;
}

// Dışa aktarımlar
export {
  initThemeSystem,
  ThemeManager,
  SettingsPanel,
  ThemeUtils
};

export default initThemeSystem; 