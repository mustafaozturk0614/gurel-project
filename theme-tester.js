/**
 * Theme Tester - Gürel Yönetim Tema Test Aracı
 * ----------------------------------------
 * Bu dosya, geliştirme sırasında tema özelliklerini kolayca test etmek için
 * dinamik olarak bir kontrol paneli oluşturur.
 */

class ThemeTester {
  constructor() {
    this.isVisible = false;
    this.panel = null;
    
    // Ayarlar panelindeki etkileşimler için
    this.settings = {
      theme: 'light',
      colorTheme: 'blue',
      fontSize: 'normal'
    };
    
    // Panel oluşturma
    this.createPanel();
    
    // Panelin gizlenip gösterilmesi için klavye kısayolu oluştur (Ctrl+Shift+T)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.togglePanel();
      }
    });
  }
  
  /**
   * Test panelini oluşturur
   */
  createPanel() {
    // Panel ana konteynerini oluştur
    this.panel = document.createElement('div');
    this.panel.className = 'theme-tester';
    this.panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--color-surface);
      color: var(--text-primary);
      border: 1px solid var(--color-border);
      padding: 15px;
      border-radius: var(--border-radius-md);
      box-shadow: var(--box-shadow-md);
      z-index: 9999;
      width: 280px;
      font-family: var(--font-family-base);
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateY(20px);
      opacity: 0;
      overflow: hidden;
    `;
    
    // Panel başlığı
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--color-border);
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Tema Test Aracı';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--text-primary);
    `;
    closeBtn.addEventListener('click', () => this.hidePanel());
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    this.panel.appendChild(header);
    
    // Ana tema modu seçimi
    const themeModeSection = this.createSection('Tema Modu');
    
    const themeBtns = document.createElement('div');
    themeBtns.className = 'theme-buttons';
    themeBtns.style.cssText = `
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    `;
    
    // Tema modu butonlarını ekle
    ['light', 'dark', 'highContrast'].forEach(theme => {
      const themeLabel = {
        'light': 'Aydınlık',
        'dark': 'Karanlık',
        'highContrast': 'Y. Kontrast'
      };
      
      const btn = this.createButton(themeLabel[theme], () => {
        window.themeManager.setTheme(theme);
        this.updateButtons();
      });
      
      btn.dataset.theme = theme;
      themeBtns.appendChild(btn);
    });
    
    themeModeSection.appendChild(themeBtns);
    this.panel.appendChild(themeModeSection);
    
    // Renk teması seçimi
    const colorSection = this.createSection('Renk Teması');
    
    const colorBtns = document.createElement('div');
    colorBtns.className = 'color-buttons';
    colorBtns.style.cssText = `
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    `;
    
    // Renk butonlarını ekle
    ['blue', 'green', 'orange', 'purple', 'red'].forEach(color => {
      const colorLabel = {
        'blue': 'Mavi',
        'green': 'Yeşil',
        'orange': 'Turuncu',
        'purple': 'Mor',
        'red': 'Kırmızı'
      };
      
      const btn = this.createButton(colorLabel[color], () => {
        window.themeManager.setColorTheme(color);
        this.updateButtons();
      });
      
      // Butona renk teması ekleme
      btn.dataset.colorTheme = color;
      // Renkli gösterge
      btn.style.borderLeft = `4px solid var(--color-${color}, #333)`;
      colorBtns.appendChild(btn);
    });
    
    colorSection.appendChild(colorBtns);
    this.panel.appendChild(colorSection);
    
    // Yazı boyutu seçimi
    const fontSizeSection = this.createSection('Yazı Boyutu');
    
    const fontSizeBtns = document.createElement('div');
    fontSizeBtns.className = 'font-size-buttons';
    fontSizeBtns.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    `;
    
    // Yazı boyutu butonları
    ['small', 'normal', 'large'].forEach(size => {
      const sizeLabel = {
        'small': 'Küçük',
        'normal': 'Normal',
        'large': 'Büyük'
      };
      
      const btn = this.createButton(sizeLabel[size], () => {
        window.themeManager.setFontSize(size);
        this.updateButtons();
      });
      
      btn.dataset.fontSize = size;
      fontSizeBtns.appendChild(btn);
    });
    
    fontSizeSection.appendChild(fontSizeBtns);
    this.panel.appendChild(fontSizeSection);
    
    // Sıfırlama butonu
    const resetSection = document.createElement('div');
    resetSection.style.marginTop = '15px';
    
    const resetBtn = this.createButton('Varsayılana Sıfırla', () => {
      window.themeManager.resetThemePreferences();
      this.updateButtons();
    });
    
    resetBtn.style.width = '100%';
    resetBtn.style.backgroundColor = 'var(--color-error)';
    resetSection.appendChild(resetBtn);
    this.panel.appendChild(resetSection);
    
    // Tema değişikliklerini dinle
    document.addEventListener('themeChanged', () => {
      this.updateButtons();
    });
    
    // Paneli belgeye ekle
    document.body.appendChild(this.panel);
    
    // İlk gösterimde butonları güncelle
    setTimeout(() => this.updateButtons(), 100);
  }
  
  /**
   * Aktif tema seçeneklerine göre butonların görünümünü günceller
   */
  updateButtons() {
    // ThemeManager'dan mevcut tema tercihlerini al
    const prefs = window.themeManager.getThemePreferences();
    
    // Tema modu butonlarını güncelle
    const themeButtons = this.panel.querySelectorAll('[data-theme]');
    themeButtons.forEach(btn => {
      if (btn.dataset.theme === prefs.theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Renk teması butonlarını güncelle
    const colorButtons = this.panel.querySelectorAll('[data-color-theme]');
    colorButtons.forEach(btn => {
      if (btn.dataset.colorTheme === prefs.colorTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Yazı boyutu butonlarını güncelle
    const fontSizeButtons = this.panel.querySelectorAll('[data-font-size]');
    fontSizeButtons.forEach(btn => {
      if (btn.dataset.fontSize === prefs.fontSize) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  /**
   * Buton oluşturur
   */
  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      padding: 8px 12px;
      background-color: var(--color-surface);
      color: var(--text-primary);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      flex: 1;
      white-space: nowrap;
    `;
    
    // Aktif sınıf stilini tanımla
    const sheet = document.createElement('style');
    sheet.textContent = `
      .theme-tester button.active {
        background-color: var(--color-primary);
        color: var(--text-on-primary);
        border-color: var(--color-primary);
      }
      
      .theme-tester button:hover {
        background-color: var(--color-primary-light);
        color: var(--text-on-primary);
      }
    `;
    document.head.appendChild(sheet);
    
    button.addEventListener('click', onClick);
    return button;
  }
  
  /**
   * Bölüm oluşturur
   */
  createSection(title) {
    const section = document.createElement('div');
    section.style.marginBottom = '15px';
    
    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = title;
    sectionTitle.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 14px;
      color: var(--text-secondary);
    `;
    
    section.appendChild(sectionTitle);
    return section;
  }
  
  /**
   * Paneli gösterir
   */
  showPanel() {
    this.panel.style.transform = 'translateY(0)';
    this.panel.style.opacity = '1';
    this.isVisible = true;
  }
  
  /**
   * Paneli gizler
   */
  hidePanel() {
    this.panel.style.transform = 'translateY(20px)';
    this.panel.style.opacity = '0';
    this.isVisible = false;
  }
  
  /**
   * Paneli açar/kapatır
   */
  togglePanel() {
    if (this.isVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }
}

// Tema test aracını sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  // ThemeManager ile çalışabilmesi için biraz bekleyelim
  setTimeout(() => {
    window.themeTester = new ThemeTester();
  }, 500);
}); 