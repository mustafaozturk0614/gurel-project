/**
 * Tema Sistemi Yardımcı İşlevleri
 * Bu modül, tema sistemi için gerekli yardımcı işlevleri içerir.
 * Version: 2.0.0
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
   * Tema değişkenlerinin bir listesini alır
   * @param {string} prefix - Değişken ön eki (örn: '--primary')
   * @returns {Object} - Değişken adı ve değerlerini içeren nesne
   */
  getThemeVariables(prefix = '') {
    const variables = {};
    const styles = getComputedStyle(document.documentElement);
    
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--') && (!prefix || prop.startsWith(prefix))) {
        variables[prop] = styles.getPropertyValue(prop).trim();
      }
    }
    
    return variables;
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
   * RGB değerlerini HEX rengine dönüştürür
   * @param {Object} rgb - RGB değerleri {r, g, b}
   * @returns {string} - HEX renk kodu
   */
  rgbToHex(rgb) {
    const toHex = (value) => {
      const hex = Math.max(0, Math.min(255, Math.round(value))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
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
   * Kullanıcının azaltılmış veri kullanımı tercihini kontrol eder
   * @returns {boolean} - Azaltılmış veri kullanımı tercih ediliyor mu?
   */
  prefersReducedData() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches;
  },
  
  /**
   * Yüksek kontrast mod tercihini kontrol eder
   * @returns {boolean} - Yüksek kontrast mod aktif mi?
   */
  prefersHighContrast() {
    return window.matchMedia && (
      window.matchMedia('(prefers-contrast: more)').matches ||
      window.matchMedia('(forced-colors: active)').matches
    );
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
    return this.rgbToHex({r, g, b});
  },
  
  /**
   * İki renk arasında karışım oluşturur (theme-variables.css color-mix ile uyumlu)
   * @param {string} color1 - İlk renk (HEX formatı)
   * @param {string} color2 - İkinci renk (HEX formatı)
   * @param {number} ratio - Karışım oranı (0-100 arası, birinci renk yüzdesi)
   * @returns {string} - Karışım rengi (HEX formatı)
   */
  mixColors(color1, color2, ratio = 50) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    // Karışım oranını 0-1 aralığına dönüştür
    const weight = Math.max(0, Math.min(100, ratio)) / 100;
    
    // Renkleri karıştır
    const r = Math.round(rgb1.r * weight + rgb2.r * (1 - weight));
    const g = Math.round(rgb1.g * weight + rgb2.g * (1 - weight));
    const b = Math.round(rgb1.b * weight + rgb2.b * (1 - weight));
    
    return this.rgbToHex({r, g, b});
  },
  
  /**
   * Renk tonları üretir (açık ve koyu tonlar)
   * @param {string} baseColor - Temel renk (HEX formatı)
   * @param {number} steps - Üretilecek ton adımı sayısı
   * @returns {Object} - Açık ve koyu tonlar {lighter: [], darker: []}
   */
  generateColorShades(baseColor, steps = 5) {
    const shades = {
      lighter: [],
      darker: []
    };
    
    const stepSize = 100 / steps;
    
    // Açık tonlar
    for (let i = 1; i <= steps; i++) {
      const amount = Math.round(stepSize * i);
      shades.lighter.push(this.adjustColor(baseColor, amount));
    }
    
    // Koyu tonlar
    for (let i = 1; i <= steps; i++) {
      const amount = Math.round(-stepSize * i);
      shades.darker.push(this.adjustColor(baseColor, amount));
    }
    
    return shades;
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
   * CSS dosyasını yükler (theme-variables.css, theme-animations.css vb.)
   * @param {string} fileName - CSS dosya adı
   * @returns {Promise} - Dosya yükleme işlemi
   */
  loadThemeStylesheet(fileName) {
    // Zaten yüklü mü kontrol et
    const isLoaded = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some(link => link.href.includes(fileName));
    
    if (isLoaded) {
      return Promise.resolve();
    }
    
    // Dosya yolunu oluştur
    const path = fileName.includes('/') ? fileName : `./theme-system/${fileName}`;
    
    // Yükle
    return this.loadFile(path, 'css');
  },
  
  /**
   * Eleman görünür olup olmadığını kontrol eder
   * @param {Element} element - Kontrol edilecek element
   * @returns {boolean} - Element görünür mü?
   */
  isElementVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
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
      ).filter(el => !el.hasAttribute('disabled') && this.isElementVisible(el));
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
  },
  
  /**
   * Öğenin tıklanabilir alan boyutunu artırarak mobil kullanımı iyileştirir
   * @param {Element} element - Hedef element
   * @param {number} padding - Eklencek padding (piksel)
   */
  enhanceTouchTarget(element) {
    if (!element) return;
    
    // Geçerli stili koru
    const currentStyle = window.getComputedStyle(element);
    const originalPadding = {
      top: parseInt(currentStyle.paddingTop) || 0,
      right: parseInt(currentStyle.paddingRight) || 0,
      bottom: parseInt(currentStyle.paddingBottom) || 0,
      left: parseInt(currentStyle.paddingLeft) || 0
    };
    
    // Tema değişkenlerinden minimum tıklama alanı boyutunu al
    const minTouchSize = parseInt(this.getCssVariable('--touch-target-size') || '44');
    
    // Element boyutunu ölç
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Gerekli ekstra padding hesapla
    const extraPaddingX = Math.max(0, minTouchSize - width) / 2;
    const extraPaddingY = Math.max(0, minTouchSize - height) / 2;
    
    // Dokunmatik cihaz tespiti
    if (window.matchMedia('(pointer: coarse)').matches && (extraPaddingX > 0 || extraPaddingY > 0)) {
      // Padding ekle
      element.style.padding = `${originalPadding.top + extraPaddingY}px ${originalPadding.right + extraPaddingX}px ${originalPadding.bottom + extraPaddingY}px ${originalPadding.left + extraPaddingX}px`;
      
      // Orijinal boyutu koru
      element.style.margin = `-${extraPaddingY}px -${extraPaddingX}px`;
      element.classList.add('enhanced-touch-target');
    }
  },
  
  /**
   * HSL renk değerlerini RGB'ye dönüştürür
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {Object} - RGB değerleri {r, g, b}
   */
  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
      r: Math.round(255 * f(0)),
      g: Math.round(255 * f(8)),
      b: Math.round(255 * f(4))
    };
  },
  
  /**
   * RGB renk değerlerini HSL'ye dönüştürür
   * @param {Object} rgb - RGB değerleri {r, g, b}
   * @returns {Object} - HSL değerleri {h, s, l}
   */
  rgbToHsl(rgb) {
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  },
  
  /**
   * Renk paleti oluşturur
   * @param {string} baseColor - Ana renk (HEX)
   * @param {number} steps - Ton adımı sayısı
   * @returns {Object} - Renk paleti
   */
  generateColorPalette(baseColor, steps = 10) {
    const rgb = this.hexToRgb(baseColor);
    const hsl = this.rgbToHsl(rgb);
    const palette = {
      base: baseColor,
      shades: [],
      tints: [],
      analogous: [],
      complementary: null,
      triadic: []
    };

    // Koyu tonlar
    for (let i = 1; i <= steps; i++) {
      const l = Math.max(0, hsl.l - (i * (hsl.l / steps)));
      const rgb = this.hslToRgb(hsl.h, hsl.s, l);
      palette.shades.push(this.rgbToHex(rgb));
    }

    // Açık tonlar
    for (let i = 1; i <= steps; i++) {
      const l = Math.min(100, hsl.l + (i * ((100 - hsl.l) / steps)));
      const rgb = this.hslToRgb(hsl.h, hsl.s, l);
      palette.tints.push(this.rgbToHex(rgb));
    }

    // Analog renkler
    const analogousAngles = [30, -30];
    analogousAngles.forEach(angle => {
      const h = (hsl.h + angle + 360) % 360;
      const rgb = this.hslToRgb(h, hsl.s, hsl.l);
      palette.analogous.push(this.rgbToHex(rgb));
    });

    // Tamamlayıcı renk
    const complementaryH = (hsl.h + 180) % 360;
    const complementaryRgb = this.hslToRgb(complementaryH, hsl.s, hsl.l);
    palette.complementary = this.rgbToHex(complementaryRgb);

    // Üçlü renk şeması
    const triadicAngles = [120, 240];
    triadicAngles.forEach(angle => {
      const h = (hsl.h + angle) % 360;
      const rgb = this.hslToRgb(h, hsl.s, hsl.l);
      palette.triadic.push(this.rgbToHex(rgb));
    });

    return palette;
  },
  
  /**
   * Renk erişilebilirlik kontrolü
   * @param {string} foreground - Ön plan rengi (HEX)
   * @param {string} background - Arka plan rengi (HEX)
   * @returns {Object} - Erişilebilirlik bilgileri
   */
  checkColorAccessibility(foreground, background) {
    const ratio = this.calculateContrastRatio(foreground, background);
    
    return {
      ratio,
      AALarge: ratio >= 3,
      AANormal: ratio >= 4.5,
      AAALarge: ratio >= 4.5,
      AAANormal: ratio >= 7
    };
  },
  
  /**
   * Tema geçiş animasyonlarını yönetir
   * @param {Element} element - Animasyon uygulanacak element
   * @param {string} animation - Animasyon adı
   * @param {Object} options - Animasyon seçenekleri
   */
  animate(element, animation, options = {}) {
    const defaults = {
      duration: 300,
      easing: 'ease-in-out',
      fill: 'forwards'
    };

    const settings = { ...defaults, ...options };
    
    element.style.animation = 'none';
    element.offsetHeight; // Reflow
    element.style.animation = `${animation} ${settings.duration}ms ${settings.easing} ${settings.fill}`;

    return new Promise(resolve => {
      element.addEventListener('animationend', function handler() {
        element.removeEventListener('animationend', handler);
        resolve();
      });
    });
  },
  
  /**
   * RTL desteği için yön kontrolü
   * @returns {boolean} - RTL modu aktif mi?
   */
  isRTL() {
    return document.dir === 'rtl' || 
           document.documentElement.getAttribute('dir') === 'rtl' ||
           window.getComputedStyle(document.documentElement).direction === 'rtl';
  },
  
  /**
   * Tema değişkenlerini dışa aktarır
   * @param {string} format - Çıktı formatı ('css', 'scss', 'json')
   * @returns {string} - Dışa aktarılan tema değişkenleri
   */
  exportThemeVariables(format = 'css') {
    const variables = this.getThemeVariables();
    
    switch (format) {
      case 'scss':
        return Object.entries(variables)
          .map(([key, value]) => `$${key.slice(2)}: ${value};`)
          .join('\n');
      
      case 'json':
        return JSON.stringify(variables, null, 2);
      
      default: // css
        return Object.entries(variables)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n');
    }
  },
  
  /**
   * Tema önizlemesi oluşturur
   * @param {string} theme - Tema adı
   * @param {Object} colors - Tema renkleri
   * @returns {HTMLElement} - Önizleme elementi
   */
  createThemePreview(theme, colors) {
    const preview = document.createElement('div');
    preview.className = 'theme-preview';
    preview.setAttribute('data-theme', theme);
    
    const style = document.createElement('style');
    style.textContent = `
      .theme-preview[data-theme="${theme}"] {
        --primary-color: ${colors.primary};
        --secondary-color: ${colors.secondary};
        --background-color: ${colors.background};
        --text-color: ${colors.text};
      }
    `;
    
    document.head.appendChild(style);
    return preview;
  }
};

// Hem ES6 modülü olarak hem de tarayıcıda doğrudan erişim için
if (typeof window !== 'undefined') {
  window.ThemeUtils = ThemeUtils;
}

// Export
export default ThemeUtils; 