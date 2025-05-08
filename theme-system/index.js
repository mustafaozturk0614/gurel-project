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
    if (!document.querySelector('link[href*="theme-variables.css"]')) {
      await ThemeUtils.loadFile('./theme-system/theme-variables.css', 'css');
    }
    
    // SettingsPanel CSS dosyasını yükle
    if (!document.querySelector('link[href*="settings-panel.css"]')) {
      await ThemeUtils.loadFile('./theme-system/settings-panel.css', 'css');
    }
    
    // ThemeManager'ı başlat
    let themeManager;
    try {
      themeManager = new ThemeManager(options.themeManagerOptions || {});
      window.themeManager = themeManager;
    } catch (error) {
      themeManager = handleError(error, 'ThemeManager');
    }
    
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