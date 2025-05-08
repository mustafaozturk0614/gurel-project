/**
 * Tema Sistemi Yardımcı İşlevleri
 * Bu modül, tema sistemi için gerekli yardımcı işlevleri içerir.
 * Version: 1.0.0
 */

const ThemeUtils = {
  /**
   * Debounce işlevi - performans için işlevleri belirli bir süre içinde birden çok kez çağrılmasını engeller
   * @param {Function} func - Çağrılacak işlev
   * @param {number} wait - Bekleme süresi (ms)
   * @param {boolean} immediate - İşlevin hemen çağrılıp çağrılmayacağı
   * @returns {Function} - Debounce edilmiş işlev
   */
  debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  
  /**
   * LocalStorage'dan veri okur
   * @param {string} key - Veri anahtarı
   * @param {*} defaultValue - Varsayılan değer (eğer localStorage'da yoksa)
   * @returns {*} - Okunan değer
   */
  getFromStorage(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.error(`localStorage okuma hatası: ${key}`, error);
      return defaultValue;
    }
  },
  
  /**
   * LocalStorage'a veri kaydeder
   * @param {string} key - Veri anahtarı
   * @param {*} value - Kaydedilecek değer
   * @returns {boolean} - İşlemin başarılı olup olmadığı
   */
  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`localStorage yazma hatası: ${key}`, error);
      return false;
    }
  },
  
  /**
   * CSS değişkenini günceller
   * @param {string} name - CSS değişken adı
   * @param {string} value - CSS değişken değeri
   * @param {Element} element - CSS değişkenin uygulanacağı element (varsayılan: documentElement)
   */
  setCssVariable(name, value, element = document.documentElement) {
    element.style.setProperty(name, value);
  },
  
  /**
   * CSS değişkenini okur
   * @param {string} name - CSS değişken adı
   * @param {Element} element - CSS değişkenin okunacağı element (varsayılan: documentElement)
   * @returns {string} - CSS değişken değeri
   */
  getCssVariable(name, element = document.documentElement) {
    return getComputedStyle(element).getPropertyValue(name).trim();
  },
  
  /**
   * HEX renk kodunu RGB değerlerine dönüştürür
   * @param {string} hex - HEX renk kodu (ör: #FF5733)
   * @returns {Object|null} - RGB değerleri {r, g, b} veya null
   */
  hexToRgb(hex) {
    // HEX kodu temizle
    hex = hex.replace(/^#/, '');
    
    // HEX formatını kontrol et
    if (!/^[0-9A-F]{3}$|^[0-9A-F]{6}$/i.test(hex)) {
      console.warn(`Geçersiz HEX renk kodu: ${hex}`);
      return null;
    }
    
    // 3 haneli HEX kodu 6 haneli formata dönüştür
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    // RGB değerlerini hesapla
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return { r, g, b };
  },
  
  /**
   * RGB nesnesini RGB string formatına dönüştürür
   * @param {Object} rgb - RGB değerleri {r, g, b}
   * @returns {string} - RGB string formatı (ör: 255, 87, 51)
   */
  rgbToString(rgb) {
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  },
  
  /**
   * Rastgele HEX renk kodu oluşturur
   * @returns {string} - Rastgele HEX renk kodu
   */
  randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },
  
  /**
   * Şu anki saatin gündüz olup olmadığını kontrol eder
   * @param {number} dayStartHour - Gündüz başlangıç saati (varsayılan: 6)
   * @param {number} dayEndHour - Gündüz bitiş saati (varsayılan: 18)
   * @returns {boolean} - Gündüz mü?
   */
  isDayTime(dayStartHour = 6, dayEndHour = 18) {
    const currentHour = new Date().getHours();
    return currentHour >= dayStartHour && currentHour < dayEndHour;
  },
  
  /**
   * Kullanıcının sistem temasının karanlık mod olup olmadığını kontrol eder
   * @returns {boolean} - Karanlık tema tercih ediliyor mu?
   */
  prefersDarkTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  },
  
  /**
   * Kullanıcının azaltılmış hareket tercihini kontrol eder
   * @returns {boolean} - Azaltılmış hareket tercih ediliyor mu?
   */
  prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  /**
   * Ekran okuyuculara mesaj bildirir
   * @param {string} message - Okunacak mesaj
   */
  announceToScreenReader(message) {
    let announcer = document.getElementById('themeAnnouncer');
    
    // Duyuru elementi yoksa oluştur
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'themeAnnouncer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.classList.add('sr-only');
      document.body.appendChild(announcer);
    }
    
    // Duyuruyu güncelle
    announcer.textContent = message;
    
    // Birkaç saniye sonra duyuruyu temizle
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  },
  
  /**
   * Özel bir tarayıcı olayı gönderir
   * @param {string} eventName - Olay adı
   * @param {any} data - Olay verileri
   */
  dispatchCustomEvent(eventName, data = null) {
    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(event);
  },
  
  /**
   * İki renk arasında kontrast oranını hesaplar
   * @param {string} colorA - İlk renk (HEX formatı)
   * @param {string} colorB - İkinci renk (HEX formatı)
   * @returns {number} - Kontrast oranı
   */
  calculateContrastRatio(colorA, colorB) {
    // Renkleri RGB'ye dönüştür
    const rgbA = this.hexToRgb(colorA);
    const rgbB = this.hexToRgb(colorB);
    
    if (!rgbA || !rgbB) return null;
    
    // Renklerin göreceli parlaklıklarını hesapla
    const luminanceA = this.calculateLuminance(rgbA);
    const luminanceB = this.calculateLuminance(rgbB);
    
    // Kontrast oranını hesapla (daha yüksek değer her zaman pay)
    const ratio = luminanceA > luminanceB
      ? (luminanceA + 0.05) / (luminanceB + 0.05)
      : (luminanceB + 0.05) / (luminanceA + 0.05);
      
    return ratio;
  },
  
  /**
   * RGB değerlerinden göreceli parlaklık hesaplar
   * @param {Object} rgb - RGB değerleri {r, g, b}
   * @returns {number} - Göreceli parlaklık değeri
   */
  calculateLuminance(rgb) {
    // sRGB değerlerini normalize et
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    // Gamma düzeltmesi
    const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    // Göreceli parlaklık hesapla
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  },
  
  /**
   * Rengi koyulaştırır veya açıklaştırır
   * @param {string} color - HEX renk kodu
   * @param {number} amount - Koyulaştırma/açıklaştırma miktarı (-100 ile 100 arası)
   * @returns {string} - Yeni HEX renk kodu
   */
  adjustColor(color, amount) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    // Yeni RGB değerlerini hesapla
    let r = rgb.r + amount;
    let g = rgb.g + amount;
    let b = rgb.b + amount;
    
    // Sınırları kontrol et
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    // RGB'yi HEX'e dönüştür
    const rHex = Math.round(r).toString(16).padStart(2, '0');
    const gHex = Math.round(g).toString(16).padStart(2, '0');
    const bHex = Math.round(b).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  },
  
  /**
   * Dosya yükler (CSS, JS vb.)
   * @param {string} url - Dosya URL'si
   * @param {string} type - Dosya türü ('css' veya 'js')
   * @returns {Promise} - Dosya yükleme işlemi
   */
  loadFile(url, type) {
    return new Promise((resolve, reject) => {
      let fileRef;
      
      // Dosya türüne göre element oluştur
      if (type === 'css') {
        fileRef = document.createElement('link');
        fileRef.rel = 'stylesheet';
        fileRef.href = url;
      } else if (type === 'js') {
        fileRef = document.createElement('script');
        fileRef.src = url;
      } else {
        reject(new Error(`Desteklenmeyen dosya türü: ${type}`));
        return;
      }
      
      // Yükleme tamamlandığında resolve et
      fileRef.onload = () => resolve(fileRef);
      
      // Hata durumunda reject et
      fileRef.onerror = () => reject(new Error(`Dosya yüklenemedi: ${url}`));
      
      // Elementi dokümana ekle
      document.head.appendChild(fileRef);
    });
  },
  
  /**
   * Erişilebilirlik için fokus tuzağı oluşturur
   * @param {Element} container - Fokus tuzağı için container element
   * @returns {Object} - Fokus tuzağı işlevleri
   */
  createFocusTrap(container) {
    // Odaklanılabilir elementleri seç
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled'));
    };
    
    // Aktif fokus elementini takip et
    let currentFocusIndex = -1;
    
    // Fokus tuzağını aktifleştir
    const activate = () => {
      // İlk odaklanılabilir elemente odaklan
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        currentFocusIndex = 0;
      }
      
      // Keyboard event listener'ı ekle
      container.addEventListener('keydown', handleKeyDown);
    };
    
    // Fokus tuzağını devre dışı bırak
    const deactivate = () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
    
    // Tuş basımlarını işle
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      // Shift + Tab veya Tab'a göre yönü belirle
      const direction = e.shiftKey ? -1 : 1;
      
      // Mevcut odaklı elementi bul
      currentFocusIndex = focusableElements.indexOf(document.activeElement);
      
      // Yeni indeksi hesapla
      let nextIndex;
      
      if (currentFocusIndex === -1) {
        // Aktif element fokus tuzağının içinde değilse
        nextIndex = direction === 1 ? 0 : focusableElements.length - 1;
      } else {
        nextIndex = currentFocusIndex + direction;
        
        // Sınırları kontrol et
        if (nextIndex < 0) {
          nextIndex = focusableElements.length - 1;
        } else if (nextIndex >= focusableElements.length) {
          nextIndex = 0;
        }
      }
      
      // Olayı durdur ve yeni elemente odaklan
      e.preventDefault();
      focusableElements[nextIndex].focus();
    };
    
    // Odağı bir sonraki elemente taşı
    const focusNext = () => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      currentFocusIndex = focusableElements.indexOf(document.activeElement);
      const nextIndex = (currentFocusIndex + 1) % focusableElements.length;
      focusableElements[nextIndex].focus();
    };
    
    // Odağı bir önceki elemente taşı
    const focusPrev = () => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      currentFocusIndex = focusableElements.indexOf(document.activeElement);
      const prevIndex = (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length;
      focusableElements[prevIndex].focus();
    };
    
    return {
      activate,
      deactivate,
      focusNext,
      focusPrev
    };
  }
};

// Hem ES6 modülü olarak hem de tarayıcıda doğrudan erişim için
if (typeof window !== 'undefined') {
  window.ThemeUtils = ThemeUtils;
}

// Export
export default ThemeUtils; 