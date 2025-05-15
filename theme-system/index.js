/**
 * Tema Yönetim Sistemi - Ana Modül
 * Bu dosya tema yönetimi için temel modülleri başlatır
 * 
 * Versiyon: 1.0.1
 */

import ThemeManager from './theme-manager.js';
import SettingsPanel from './settings-panel.js';
import ThemeUtils from './theme-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Tema Yönetim Sistemi başlatılıyor...');
  
  // Öncelikle ThemeManager'ı başlat
  window.themeManager = new ThemeManager({
    debug: true,
    autoDarkMode: true,
    prefers: 'manual',
    transitionDuration: 300
  });
  
  // Sonra SettingsPanel'i başlat
      setTimeout(() => {
    window.settingsPanel = new SettingsPanel({
      debug: true,
      panelPosition: 'right',
      autoInit: true,
      isCacheText: false // Cache kullanımını kapalı tut
    });
    
    console.log('SettingsPanel başlatıldı:', window.settingsPanel);
    
    // Mevcut butonun tıklama olayını bağla
    const toggleBtn = document.getElementById('settingsToggle');
    if (toggleBtn) {
      console.log('Ayarlar butonunu doğrudan bağlıyorum...');
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ayarlar butonuna tıklandı. Panel açılıyor...');
        if (window.settingsPanel && typeof window.settingsPanel.toggleSettingsPanel === 'function') {
          window.settingsPanel.toggleSettingsPanel();
        } else {
          console.error('settingsPanel bulunamadı veya toggleSettingsPanel metodu yok!');
    }
      });
    } else {
      console.warn('Ayarlar butonu (ID: settingsToggle) bulunamadı!');
    }
    
    // Backdrop tıklamasıyla paneli kapat
    document.addEventListener('click', (e) => {
      if (window.settingsPanel && window.settingsPanel.state && window.settingsPanel.state.isOpen) {
        // Eğer panel varsa ve açıksa, panel dışına tıklandığında kapat
        const panel = document.getElementById('settingsPanel');
        const toggleBtn = document.getElementById('settingsToggle');
        
        if (panel && !panel.contains(e.target) && e.target !== toggleBtn) {
          window.settingsPanel.toggleSettingsPanel(false);
        }
  }
    });

    // ESC tuşuyla paneli kapat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.settingsPanel && window.settingsPanel.state && window.settingsPanel.state.isOpen) {
        window.settingsPanel.toggleSettingsPanel(false);
      }
    });
  }, 100);
});

// Hata ayıklama bilgisini görüntüle
console.log('theme-system/index.js yüklendi. ✅'); 