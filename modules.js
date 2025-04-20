/**
 * Gürel Yönetim - Modüler JavaScript Dosyası
 * Tüm JS fonksiyonlarını modüler şekilde organize etmek için
 */

// DOM yüklendikten sonra çalışacak tüm eventler için tek bir tetikleyici
document.addEventListener('DOMContentLoaded', function() {
    // Tab sistemini başlat
    initTabSystem();
    
    // Form doğrulamayı başlat
    initFormValidation();
    
    // AOS animasyonlarını başlat
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Sayfa kaydırma olayını dinle ve header stili değiştir
    initScrollEvents();
    
    // Vanilla tilt efektleri için
    initTiltEffects();
    
    // Referans filtreleme sistemini başlat
    initTestimonialFilter();
    
    // Copyright yılını güncelle
    updateCopyrightYear();
    
    // Tüm dahili linkleri seç
    const internalLinks = document.querySelectorAll('a[href^="/"]:not([target]), a[href^="./"]:not([target]), a[href^="#"]:not([target])');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Aynı sayfa içinde anchor link kontrolü
            if (this.getAttribute('href').startsWith('#')) return;
            
            e.preventDefault();
            const target = this.getAttribute('href');
            
            // Sayfa geçiş animasyonunu başlat
            document.body.classList.add('page-transition-active');
            
            // Animasyon tamamlandıktan sonra sayfaya git
            setTimeout(() => {
                window.location.href = target;
            }, 800);
        });
    });
    
    // Sayfa yüklendiğinde geçiş animasyonunu kapat
    if (document.body.classList.contains('page-transition-active')) {
        setTimeout(() => {
            document.body.classList.remove('page-transition-active');
        }, 500);
    }
    
    // Fare hareketi ile interaktif gradient
    const interactiveElements = document.querySelectorAll('.interactive-gradient, .patreon-header.interactive-bg');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            // Element içindeki fare pozisyonunu hesapla
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // CSS değişkenlerini güncelle
            this.style.setProperty('--mouse-x', `${x}%`);
            this.style.setProperty('--mouse-y', `${y}%`);
            this.style.setProperty('--x', `${x}%`);
            this.style.setProperty('--y', `${y}%`);
        });
        
        // Element dışına çıkıldığında varsayılan konuma dön
        element.addEventListener('mouseleave', function() {
            this.style.setProperty('--mouse-x', '50%');
            this.style.setProperty('--mouse-y', '50%');
            this.style.setProperty('--x', '50%');
            this.style.setProperty('--y', '50%');
        });
    });
    
    // Tema değiştirici fonksiyonları
    const themeSwitcher = document.getElementById('themeSwitcher');
    const themeToggle = document.getElementById('themeToggle');
    const themePanel = document.getElementById('themePanel');
    const themePanelToggle = document.getElementById('themePanelToggle');
    const themeColors = document.querySelectorAll('.theme-color');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    
    // Kaydedilmiş tema tercihleri
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColor = localStorage.getItem('themeColor') || 'default';
    const savedFontSize = localStorage.getItem('fontSize') || '100';
    
    // Sayfa yüklendiğinde kaydedilmiş tercihleri uygula
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.fontSize = `${savedFontSize}%`;
    if (themeToggle) {
        themeToggle.classList.toggle('active', savedTheme === 'dark');
    }
    
    // Ana renk temasını ayarla
    applyColorTheme(savedColor);
    
    // Kaydedilmiş rengi seçili göster
    themeColors.forEach(color => {
        color.classList.toggle('active', color.dataset.color === savedColor);
    });
    
    // Font boyutu slider'ını ayarla
    if (fontSizeSlider) {
        fontSizeSlider.value = savedFontSize;
    }
    
    // Tema değiştirici buton
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', function() {
            toggleTheme();
        });
    }
    
    // Tema paneli toggle
    if (themePanelToggle) {
        themePanelToggle.addEventListener('click', function() {
            themePanel.classList.toggle('active');
        });
    }
    
    // Tema toggle switch
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            toggleTheme();
        });
    }
    
    // Renk seçenekleri
    themeColors.forEach(color => {
        color.addEventListener('click', function() {
            const colorTheme = this.dataset.color;
            
            // Aktif sınıfını güncelle
            themeColors.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Renk temasını uygula ve kaydet
            applyColorTheme(colorTheme);
            localStorage.setItem('themeColor', colorTheme);
        });
    });
    
    // Font boyutu ayarı
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', function() {
            const fontSize = this.value;
            document.documentElement.style.fontSize = `${fontSize}%`;
            localStorage.setItem('fontSize', fontSize);
        });
    }
    
    // Tema değiştirme fonksiyonu
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (themeToggle) {
            themeToggle.classList.toggle('active', newTheme === 'dark');
        }
    }
    
    // Renk temasını uygulama fonksiyonu
    function applyColorTheme(colorTheme) {
        // CSS değişkenlerini güncelle
        let primaryColor, secondaryColor, tertiaryColor, accentColor;
        
        switch(colorTheme) {
            case 'blue':
                primaryColor = '#2563eb';
                secondaryColor = '#0891b2';
                tertiaryColor = '#60a5fa';
                accentColor = '#f97316';
                break;
            case 'purple':
                primaryColor = '#7c3aed';
                secondaryColor = '#9333ea';
                tertiaryColor = '#a78bfa';
                accentColor = '#f59e0b';
                break;
            case 'green':
                primaryColor = '#16a34a';
                secondaryColor = '#059669';
                tertiaryColor = '#4ade80';
                accentColor = '#dc2626';
                break;
            case 'orange':
                primaryColor = '#ea580c';
                secondaryColor = '#9a3412';
                tertiaryColor = '#fb923c';
                accentColor = '#3b82f6';
                break;
            default: // Default renk seti
                primaryColor = '#0B3D91';
                secondaryColor = '#1E847F';
                tertiaryColor = '#4A90E2';
                accentColor = '#F5A623';
                break;
        }
        
        // CSS değişkenlerini güncelle
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--tertiary-color', tertiaryColor);
        document.documentElement.style.setProperty('--accent-color', accentColor);
        
        // Alpha varyasyonlarını da otomatik ayarla
        updateColorVariations(primaryColor, 'primary');
        updateColorVariations(secondaryColor, 'secondary');
        updateColorVariations(tertiaryColor, 'tertiary');
        updateColorVariations(accentColor, 'accent');
    }
    
    // Renk varyasyonlarını hesaplama
    function updateColorVariations(hexColor, name) {
        const rgb = hexToRgb(hexColor);
        if (!rgb) return;
        
        document.documentElement.style.setProperty(`--${name}-15-color`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
        document.documentElement.style.setProperty(`--${name}-25-color`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
        document.documentElement.style.setProperty(`--${name}-50-color`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
        document.documentElement.style.setProperty(`--${name}-75-color`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`);
        document.documentElement.style.setProperty(`--${name}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
    
    // Hex rengi RGB'ye dönüştürme
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Dil değiştirici fonksiyonları
    const languageItems = document.querySelectorAll('.language-item');
    const currentFlag = document.getElementById('currentFlag');
    const currentLang = document.getElementById('currentLang');
    
    // Kaydedilmiş dil tercihi
    const savedLang = localStorage.getItem('language') || 'tr';
    
    // Sayfa yüklendiğinde kaydedilmiş dil tercihini uygula
    setActiveLanguage(savedLang);
    
    // Çevirileri yükle
    loadTranslations(savedLang);
    
    // Dil öğelerine tıklama olayı ekle - Hata ayıklama ekleyelim
    function addLanguageClickListeners() {
        console.log("Dil değiştirme dinleyicileri ekleniyor");
        console.log("Bulunan dil öğeleri:", languageItems.length);
        
        const languageSwitcherDropdown = document.querySelector('.language-dropdown');
        if (languageSwitcherDropdown) {
            // Dil değiştirici açılır menüsüne tıklama olaylarını engelle
            languageSwitcherDropdown.addEventListener('click', function(e) {
                e.stopPropagation(); // Tıklama olayının dışarı yayılmasını önle
            });
        }
        
        languageItems.forEach(item => {
            // Önceki olay dinleyicilerini temizle (çift bağlanmayı önlemek için)
            item.removeEventListener('click', languageChangeHandler);
            
            // Yeni olay dinleyicisini ekle
            item.addEventListener('click', languageChangeHandler);
            
            // Hata ayıklama için belirli bir dile tıklandığında ne olduğunu görelim
            console.log(`Dil öğesi bağlandı: ${item.dataset.lang}`);
        });
    }
    
    // Olay işleyicisini ayrı bir fonksiyon olarak tanımla
    function languageChangeHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const lang = this.dataset.lang;
        console.log(`Dil değiştiriliyor: ${lang}`);
        
        // ÖNEMLİ: İşlemin başlamadan önce tüm dil öğelerinden aktif sınıfını kaldır
        languageItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Seçilen dil öğesine aktif sınıfını ekle
        this.classList.add('active');
        
        // Bayrağı ve dil kodunu güncelle
        const flagIcon = this.querySelector('.flag-icon');
        const currentFlagIcon = document.getElementById('currentFlagIcon');
        if (flagIcon && currentFlagIcon) {
            // Flag icon class'larını güncelle
            currentFlagIcon.className = flagIcon.className;
        }
        
        if (currentLang) {
            currentLang.textContent = lang.toUpperCase();
        }
        
        // Dil tercihini kaydet
        localStorage.setItem('language', lang);
        
        // RTL desteğini uygula
        applyRTLSupport(lang);
        
        // Çevirileri yükle - Doğrudan DOM manipülasyonundan sonra
        setTimeout(() => {
            loadTranslations(lang);
        }, 50);
        
        // Dropdown'ı kapat (eğer açıksa)
        const dropdown = document.querySelector('.language-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        
        // Hata ayıklama
        console.log(`Dil değiştirildi: ${lang}`);
    }
    
    // İnitial dinleyicileri ekle
    addLanguageClickListeners();
    
    // Aktif dil gösterimini ayarla
    function setActiveLanguage(lang) {
        console.log(`Aktif dil ayarlanıyor: ${lang}`);
        
        // ÖNEMLİ: Sadece görsel güncelleme yap, çeviri yükleme işlemini bu fonksiyondan ayır
        const selectedLangItem = document.querySelector(`.language-item[data-lang="${lang}"]`);
        if (selectedLangItem) {
            // Aktif sınıfını kaldır
            languageItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Seçilen dil için aktif sınıfını ekle
            selectedLangItem.classList.add('active');
            
            // Bayrağı ve dil kodunu güncelle
            const flagIcon = selectedLangItem.querySelector('.flag-icon');
            const currentFlagIcon = document.getElementById('currentFlagIcon');
            if (flagIcon && currentFlagIcon) {
                // Flag icon class'larını güncelle
                currentFlagIcon.className = flagIcon.className;
            }
            
            if (currentLang) {
                currentLang.textContent = lang.toUpperCase();
            }
            
            // RTL desteğini uygula
            applyRTLSupport(lang);
            
            console.log(`Aktif dil ayarlandı: ${lang}`);
        } else {
            console.error(`Dil öğesi bulunamadı: ${lang}`);
        }
    }
    
    // Çevirileri yükle ve uygula
    function loadTranslations(lang) {
        console.log(`Çeviriler yükleniyor: ${lang}`);
        
        // Öncelikle dil dosyasının URL'ini doğru oluştur ve önbelleği engelle
        const cacheBuster = new Date().getTime();
        const translationUrl = `assets/translations/${lang}.json?_=${cacheBuster}`;
        console.log(`Çeviri dosyası URL: ${translationUrl}`);
        
        fetch(translationUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
            .then(response => {
                if (!response.ok) {
                    console.error(`Çeviri dosyası bulunamadı: HTTP ${response.status}`, translationUrl);
                    throw new Error(`Çeviri dosyası bulunamadı: HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(translations => {
                console.log(`Çeviriler başarıyla yüklendi: ${lang}`);
                // Çevirileri uygula
                applyTranslations(translations);
            })
            .catch(error => {
                console.error('Çeviri yükleme hatası:', error);
                // Varsayılan dile geri dön veya kullanıcıya bildir
                showTranslationError(lang, error);
            });
    }
    
    // Çeviri yükleme hatası göster
    function showTranslationError(lang, error) {
        console.error(`${lang} için çeviri yüklenemedi:`, error);
        
        // Eğer kullanıcıya görsel bir bildirim göstermek istersek
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Çeviri Hatası',
                text: `${lang.toUpperCase()} dili için çeviriler yüklenemedi. Varsayılan dil kullanılıyor.`,
                icon: 'error',
                confirmButtonText: 'Tamam'
            });
        }
        
        // Varsayılan dile geri dön eğer hata varsa
        if (lang !== 'tr') {
            localStorage.setItem('language', 'tr');
            setActiveLanguage('tr');
            loadTranslations('tr');
        }
    }
    
    // Çevirileri sayfaya uygula
    function applyTranslations(translations) {
        if (!translations) {
            console.error('Geçersiz çeviri verileri');
            return;
        }
        
        console.log('Çeviriler uygulanıyor');
        const startTime = performance.now(); // Zamanlama başlat
        
        // Metadata'yı uygula
        if (translations.metadata && translations.metadata.dir) {
            document.documentElement.setAttribute('dir', translations.metadata.dir);
        } else if (translations.lang && translations.lang.direction) {
            document.documentElement.setAttribute('dir', translations.lang.direction);
        }
        
        // SEO başlığını ayarla - Hem page_title hem de seo.title destekleyelim
        if (translations.page_title) {
            document.title = translations.page_title;
        } else if (translations.seo && translations.seo.title) {
            document.title = translations.seo.title;
        }
        
        // SEO açıklaması ve anahtar kelimeleri
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            if (translations.seo && translations.seo.description) {
                metaDescription.content = translations.seo.description;
            }
        }
        
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            if (translations.seo && translations.seo.keywords) {
                metaKeywords.content = translations.seo.keywords;
            }
        }
        
        // Sayfa içindeki tüm çevirilebilir elementleri seç
        const translatableElements = document.querySelectorAll('[data-translate]');
        console.log(`Çevrilecek element sayısı: ${translatableElements.length}`);
        
        const notFoundKeys = []; // Bulunamayan anahtarları topla
        let translatedCount = 0; // Çevrilen eleman sayısı
        
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            
            // Hem eski "nav.home" yapısı hem de yeni "header.navigation.home" yapısını destekle
            let value = getNestedValue(translations, key);
            
            // Anahtar bulunamadıysa alternatif yolları dene
            if (!value) {
                // Eğer bu bir header navigasyon öğesi ise
                if (key.startsWith('header.navigation.')) {
                    const altKey = 'nav.' + key.replace('header.navigation.', '');
                    value = getNestedValue(translations, altKey);
                }
                // Diğer olası eşleştirmeleri kontrol et
                else if (key === 'header.cta') {
                    value = getNestedValue(translations, 'header.get_quote');
                }
                // Menü elementleri için
                else if (key.startsWith('nav.')) {
                    const altKey = 'header.navigation.' + key.replace('nav.', '');
                    value = getNestedValue(translations, altKey);
                }
            }
            
            if (value) {
                element.textContent = value;
                translatedCount++;
            } else {
                notFoundKeys.push(key);
                // console.warn(`Çeviri bulunamadı: "${key}"`);
            }
        });
        
        // Bulunamayan anahtarları toplu göster
        if (notFoundKeys.length > 0) {
            console.warn(`Toplam ${notFoundKeys.length} çeviri anahtarı bulunamadı:`, notFoundKeys);
        }
        
        // Placeholder metinlerini güncelle
        const inputElements = document.querySelectorAll('input[data-translate-placeholder], textarea[data-translate-placeholder]');
        inputElements.forEach(input => {
            const key = input.getAttribute('data-translate-placeholder');
            const value = getNestedValue(translations, key);
            if (value) {
                input.placeholder = value;
                translatedCount++;
            }
        });
        
        // HTML içeriği olan elementleri güncelle
        const htmlElements = document.querySelectorAll('[data-translate-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-translate-html');
            const value = getNestedValue(translations, key);
            if (value) {
                element.innerHTML = value;
                translatedCount++;
            }
        });

        // Çeviri işleminden sonra RTL desteğini uygula
        const currentLang = localStorage.getItem('language') || 'tr';
        applyRTLSupport(currentLang);
        
        const endTime = performance.now(); // Zamanlama sonu
        console.log(`Çeviriler başarıyla uygulandı. ${translatedCount} öğe çevrildi. İşlem süresi: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    // Tıklama durumlarına göre language switcher toggle etme
    const languageSwitcherToggles = document.querySelectorAll('.language-switcher-toggle');
    languageSwitcherToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.nextElementSibling;
            if (dropdown && dropdown.classList.contains('language-dropdown')) {
                dropdown.classList.toggle('show');
                
                // Dışarı tıklama ile kapatma
                if (dropdown.classList.contains('show')) {
                    document.addEventListener('click', closeLanguageDropdown);
                } else {
                    document.removeEventListener('click', closeLanguageDropdown);
                }
            }
        });
    });
    
    // Dropdown'ı kapatma fonksiyonu
    function closeLanguageDropdown(e) {
        const dropdowns = document.querySelectorAll('.language-dropdown.show');
        const toggles = document.querySelectorAll('.language-switcher-toggle');
        
        // Eğer tıklanan element toggle veya dropdown değilse kapat
        let isClickInside = false;
        toggles.forEach(toggle => {
            if (toggle === e.target || toggle.contains(e.target)) {
                isClickInside = true;
            }
        });
        
        dropdowns.forEach(dropdown => {
            if (dropdown === e.target || dropdown.contains(e.target)) {
                isClickInside = true;
            }
            
            if (!isClickInside) {
                dropdown.classList.remove('show');
                document.removeEventListener('click', closeLanguageDropdown);
            }
        });
    }
    
    // Nested objelerde nokta notasyonuyla değer alma yardımcı fonksiyonu
    function getNestedValue(obj, path) {
        if (!obj || !path) return null;
        
        try {
            return path.split('.').reduce((prev, curr) => {
                return prev && prev[curr] !== undefined ? prev[curr] : null;
            }, obj);
        } catch (error) {
            console.error(`getNestedValue hatası path=${path}:`, error);
            return null;
        }
    }
    
    // Nöromorfik elementler için
    initNeumorphicElements();
    
    // Canlı gradient efektleri için
    enhanceGradientEffects();
    
    // Yeni eklenen fonksiyon
    initAccessibilityFeatures();
    
    // Initialize Settings Panel
    initSettingsPanel();
    
    // Modern 3D Paralaks efekti
    init3DParallaxEffect();

    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        // Cihaz kontrolü
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            // Mobil cihazlarda yalnızca görüntü kullan
            heroVideo.setAttribute('poster', 'assets/images/video-poster.jpg');
            heroVideo.style.display = 'none';
        } else {
            // Masaüstü cihazlarda IntersectionObserver kullan
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Görünür olduğunda videoyu yükle
                        if (heroVideo.paused) {
                            heroVideo.play().catch(err => {
                                console.log('Video oynatma hatası:', err);
                            });
                        }
                    } else {
                        // Görünür olmadığında duraklat (performans için)
                        heroVideo.pause();
                    }
                });
            }, {
                threshold: 0.1
            });
            
            videoObserver.observe(heroVideo);
        }
    }

    // Hero parallax efekti
    document.addEventListener('mousemove', function(e) {
        const parallaxLayers = document.querySelectorAll('.parallax-layer');
        const particles = document.querySelectorAll('.particle');
        
        // Mouse pozisyonu
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        // Parallax katmanları için
        parallaxLayers.forEach((layer, index) => {
            const depth = index * 0.2; // Her katman için farklı derinlik
            const moveX = mouseX * depth * 40;
            const moveY = mouseY * depth * 40;
            layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        });
        
        // Parçacıklar için
        particles.forEach((particle, index) => {
            const depth = index * 0.1;
            const moveX = mouseX * depth * 30;
            const moveY = mouseY * depth * 30;
            particle.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        });
    });

    // Değişen kelimeler efekti
    initChangingWords();

    const cards = document.querySelectorAll('.service-card');
    
    // Materyal tasarım dalgalanma efekti
    cards.forEach(card => {
        card.addEventListener('mousedown', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = card.querySelector(':after');
            if (ripple) {
                ripple.style.backgroundPosition = `${x}px ${y}px`;
                ripple.style.opacity = '0.4';
                ripple.style.transform = 'scale(0, 0)';
                
                setTimeout(() => {
                    ripple.style.opacity = '0';
                    ripple.style.transform = 'scale(10, 10)';
                }, 1);
            }
        });
        
        // 3D tilt efekti
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const midCardWidth = rect.width / 2;
            const midCardHeight = rect.height / 2;
            
            const angleY = ((x - midCardWidth) / 8) * -1;
            const angleX = (y - midCardHeight) / 8;
            
            // Daha hafif bir efekt için büyüklüğü azaltıldı
            card.style.transform = `translateY(0) perspective(1000px) rotateX(${angleX * 0.2}deg) rotateY(${angleY * 0.2}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Işık efekti
            const icon = card.querySelector('.service-icon');
            if (icon) {
                const iconRect = icon.getBoundingClientRect();
                const iconX = x - (iconRect.left - rect.left);
                const iconY = y - (iconRect.top - rect.top);
                
                icon.style.transform = `translateZ(20px) translateX(${iconX * 0.01}px) translateY(${iconY * 0.01}px)`;
            }
            
            // Glow efekti kartın fare ile takip eden kısmında
            const glowX = ((x / rect.width) - 0.5) * 100;
            const glowY = ((y / rect.height) - 0.5) * 100;
            card.style.setProperty('--glow-x', `${glowX}%`);
            card.style.setProperty('--glow-y', `${glowY}%`);
        });
        
        // Karttan çıkınca efektleri sıfırla
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'translateY(0)';
            const icon = card.querySelector('.service-icon');
            if (icon) {
                icon.style.transform = 'translateZ(0)';
            }
        });
        
        // Karttan tıklama sonrası efektleri sıfırla
        card.addEventListener('mouseup', function() {
            const ripple = card.querySelector(':after');
            if (ripple) {
                ripple.style.opacity = '0';
            }
        });
    });
    
    // Hizmet kartları için animasyon efektleri
    function animateServiceCards() {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach((card, index) => {
            const delay = index * 150; // Her kart arasında 150ms gecikme
            setTimeout(() => {
                card.classList.add('animated', 'fadeInUp');
                
                // İkon içindeki simgelere animasyon ekle
                const icon = card.querySelector('.service-icon i');
                if (icon) {
                    icon.classList.add('animated', 'bounceIn');
                }
                
                // Badge'lere animasyon ekle
                const badges = card.querySelectorAll('.badge');
                badges.forEach((badge, badgeIndex) => {
                    setTimeout(() => {
                        badge.classList.add('animated', 'fadeInRight');
                    }, badgeIndex * 100 + 300);
                });
            }, delay);
        });
    }
    
    // Sayfaya ilk girişte kartları canlandır
    animateServiceCards();
    
    // Sayfa geçişlerinde kartları canlandır
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#services') {
                setTimeout(animateServiceCards, 300);
            }
        });
    });
    
    // Tema değiştirme
    const themeSwitch = document.querySelector('.theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('click', function() {
            document.body.dataset.theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
            
            // İkon değiştir
            const icon = this.querySelector('i');
            if (document.body.dataset.theme === 'light') {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
        });
    }
});

/**
 * Tab Sistemi İçin Gerekli Fonksiyonlar
 */
function initTabSystem() {
    document.addEventListener('DOMContentLoaded', function() {
        // Bootstrap tab sistemini başlat
        const tabElms = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElms.forEach(tabElm => {
            tabElm.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Tüm tabları pasif yap
                tabElms.forEach(t => {
                    t.classList.remove('active');
                    const tabPane = document.querySelector(t.getAttribute('data-bs-target'));
                    if (tabPane) {
                        tabPane.classList.remove('show', 'active');
                    }
                });
                
                // Tıklanan tabı aktif yap
                tabElm.classList.add('active');
                const target = document.querySelector(tabElm.getAttribute('data-bs-target'));
                if (target) {
                    target.classList.add('show', 'active');
                    
                    // Kartların animasyonlu gelmesi için
                    const cards = target.querySelectorAll('.service-card');
                    cards.forEach((card, index) => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            card.style.transition = 'all 0.4s ease';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 100 + (index * 100));
                    });
                }
            });
        });
        
        // Ana sayfadaki iki tip tab sistemini kontrol et
        // 1. Hero bölümündeki site/mülk tabları
        const heroTabs = document.querySelectorAll('#serviceTabList .nav-link');
        if (heroTabs.length) {
            heroTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    heroTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    const targetId = this.getAttribute('data-bs-target').replace('#', '');
                    const tabPanes = document.querySelectorAll('#serviceTabContent .tab-pane');
                    
                    tabPanes.forEach(pane => {
                        pane.classList.remove('show', 'active');
                        if (pane.id === targetId) {
                            pane.classList.add('show', 'active');
                        }
                    });
                });
            });
        }
        
        // 2. Hizmetler bölümündeki site/mülk tabları
        const serviceTabs = document.querySelectorAll('.service-category-tabs .nav-link');
        if (serviceTabs.length) {
            serviceTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    serviceTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    const targetId = this.getAttribute('data-bs-target').replace('#', '');
                    const tabPanes = document.querySelectorAll('.tab-content > .tab-pane');
                    
                    tabPanes.forEach(pane => {
                        pane.classList.remove('show', 'active');
                        if (pane.id === targetId) {
                            pane.classList.add('show', 'active');
                            
                            // Kartları animasyonlu göster
                            const cards = pane.querySelectorAll('.service-card');
                            cards.forEach((card, index) => {
                                card.style.opacity = '0';
                                card.style.transform = 'translateY(20px)';
                                
                                setTimeout(() => {
                                    card.style.transition = 'all 0.4s ease';
                                    card.style.opacity = '1';
                                    card.style.transform = 'translateY(0)';
                                }, 100 + (index * 100));
                            });
                        }
                    });
                });
            });
        }
    });
}

/**
 * Form Doğrulama Sistemi (Formik yerine daha hafif çözüm)
 */
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Tüm form alanlarını al
        const nameInput = document.getElementById('nameInput');
        const emailInput = document.getElementById('emailInput');
        const phoneInput = document.getElementById('phoneInput');
        const serviceSelect = document.getElementById('serviceSelect');
        const messageInput = document.getElementById('messageInput');
        
        // Doğrulama fonksiyonu
        const isValid = validateForm(nameInput, emailInput, phoneInput, serviceSelect, messageInput);
        
        if (isValid) {
            // Form geçerliyse gönderme işlemini gerçekleştir
            submitForm(contactForm);
        }
    });
}

/**
 * Form doğrulama fonksiyonu
 */
function validateForm(nameInput, emailInput, phoneInput, serviceSelect, messageInput) {
    let isValid = true;
    
    // Hata mesajlarını temizle
    clearErrors();
    
    // Ad Soyad doğrulama
    if (!nameInput.value.trim()) {
        showError(nameInput, 'Ad Soyad alanı zorunludur');
        isValid = false;
    } else if (nameInput.value.trim().length < 3) {
        showError(nameInput, 'Ad Soyad en az 3 karakter olmalıdır');
        isValid = false;
    }
    
    // Email doğrulama
    if (!emailInput.value.trim()) {
        showError(emailInput, 'E-posta alanı zorunludur');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Geçerli bir e-posta adresi giriniz');
        isValid = false;
    }
    
    // Telefon doğrulama
    if (!phoneInput.value.trim()) {
        showError(phoneInput, 'Telefon alanı zorunludur');
        isValid = false;
    } else if (!isValidPhone(phoneInput.value)) {
        showError(phoneInput, 'Geçerli bir telefon numarası giriniz');
        isValid = false;
    }
    
    // Hizmet seçimi doğrulama
    if (!serviceSelect.value) {
        showError(serviceSelect, 'Lütfen bir hizmet seçiniz');
        isValid = false;
    }
    
    // Mesaj doğrulama
    if (!messageInput.value.trim()) {
        showError(messageInput, 'Mesaj alanı zorunludur');
        isValid = false;
    } else if (messageInput.value.trim().length < 10) {
        showError(messageInput, 'Mesajınız en az 10 karakter olmalıdır');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Hata mesajı gösterme fonksiyonu
 */
function showError(input, message) {
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        input.classList.add('is-invalid');
    }
}

/**
 * Tüm hata mesajlarını temizleme
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const invalidInputs = document.querySelectorAll('.is-invalid');
    
    errorElements.forEach(elem => {
        elem.textContent = '';
        elem.style.display = 'none';
    });
    
    invalidInputs.forEach(input => {
        input.classList.remove('is-invalid');
    });
}

/**
 * Email geçerlilik kontrolü
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}

/**
 * Telefon geçerlilik kontrolü
 */
function isValidPhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
}

/**
 * Form gönderme fonksiyonu
 */
function submitForm(form) {
    // Form verilerini al
    const formData = new FormData(form);
    const formObject = {};
    
    // FormData'yı objeye dönüştür
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    
    // SweetAlert2 ile yükleniyor göster
    Swal.fire({
        title: 'Mesajınız Gönderiliyor',
        text: 'Lütfen bekleyin...',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Simüle edilmiş gönderim (gerçek uygulamada fetch veya axios kullanılabilir)
    setTimeout(() => {
        // Formu sıfırla
        form.reset();
        
        // Başarılı mesajı göster
        Swal.fire({
            title: 'Teşekkürler!',
            text: 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.',
            icon: 'success',
            confirmButtonText: 'Tamam'
        });
    }, 1500);
}

/**
 * Sayfa kaydırma olayını dinle ve header stili değiştir
 */
function initScrollEvents() {
    const header = document.querySelector('.patreon-header');
    const scrollProgressBar = document.querySelector('.scroll-progress-bar');
    const headerOffset = 50;
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    // Sayfa açılışında header'a transparent sınıfını ekle
    if (header && window.scrollY <= headerOffset) {
        header.classList.add('transparent');
        header.classList.remove('scrolled');
    }
    
    // Navbar toggler için click olayı
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded değeri
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Collapse durumunu değiştir
            if (navbarCollapse) {
                if (isExpanded) {
                    navbarCollapse.classList.remove('show');
                    document.body.classList.remove('menu-open'); // Menü kapandığında body'den sınıfı kaldır
                    
                    // Eğer scroll pozisyonu yukarıdaysa tekrar transparent yap
                    if (window.scrollY <= headerOffset) {
                        header.classList.add('transparent');
                        header.classList.remove('scrolled');
                    }
                } else {
                    navbarCollapse.classList.add('show');
                    document.body.classList.add('menu-open'); // Menü açıldığında body'e sınıfı ekle
                    
                    // Menü açıldığında beyaz arkaplan göster (mobil görünümde)
                    if (window.innerWidth < 992) {
                        header.classList.remove('transparent');
                        header.classList.add('scrolled');
                    }
                }
            }
        });
        
        // Sayfa dışına tıklandığında menüyü kapat
        document.addEventListener('click', function(event) {
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                // Eğer tıklanan eleman menünün kendisi veya toggle butonu değilse
                if (!navbarCollapse.contains(event.target) && !navbarToggler.contains(event.target)) {
                    navbarCollapse.classList.remove('show');
                    navbarToggler.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('menu-open'); // Menü kapandığında body'den sınıfı kaldır
                    
                    // Eğer scroll pozisyonu yukarıdaysa tekrar transparent yap
                    if (window.scrollY <= headerOffset) {
                        header.classList.add('transparent');
                        header.classList.remove('scrolled');
                    }
                }
            }
        });
    }
    
    function checkScrollPosition() {
        const scrollPosition = window.scrollY;
        
        if (header) {
            // Eğer mobil menü açıksa scrolled sınıfını koruyalım
            const isMenuOpen = navbarCollapse && navbarCollapse.classList.contains('show');
            
            if (scrollPosition > headerOffset || (isMenuOpen && window.innerWidth < 992)) {
                header.classList.add('scrolled');
                header.classList.remove('transparent');
            } else {
                header.classList.remove('scrolled');
                header.classList.add('transparent');
            }
        }
        
        // Scroll progress bar'ı güncelle
        if (scrollProgressBar) {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = (scrollPosition / scrollHeight) * 100;
            scrollProgressBar.style.width = `${scrollProgress}%`;
        }
    }
    
    // Sayfa yüklendiğinde kontrol et
    checkScrollPosition();
    
    // Scroll olayını dinle
    window.addEventListener('scroll', checkScrollPosition);
    
    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener('resize', checkScrollPosition);
    
    // Mobil menü öğelerine tıklandığında menüyü kapat
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .header-button, .language-switcher-toggle');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992 && navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
                document.body.classList.remove('menu-open'); // Menü kapandığında body'den sınıfı kaldır
                
                if (navbarToggler) {
                    navbarToggler.setAttribute('aria-expanded', 'false');
                }
                
                // Biraz bekleyip scroll pozisyonunu kontrol et
                setTimeout(checkScrollPosition, 300);
            }
        });
    });
}

/**
 * VanillaTilt efektleri için başlatma fonksiyonu
 */
function initTiltEffects() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    if (!tiltElements.length || typeof VanillaTilt === 'undefined') return;
    
    VanillaTilt.init(tiltElements, {
        max: 5,
        speed: 400,
        perspective: 800
    });
}

/**
 * Referans Filtreleme Sistemi
 */
function initTestimonialFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    
    if (!filterButtons.length || !testimonialItems.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Tüm butonlardan active sınıfını kaldır
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Tıklanan butona active sınıfını ekle
            this.classList.add('active');
            
            // Seçilen filtreyi al
            const filter = this.getAttribute('data-filter');
            
            // Filtreleme işlemi
            testimonialItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

// Örnek: Vanilla Tilt'i sadece masaüstü cihazlarda yükle
if (window.innerWidth > 768) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vanilla-tilt@1.8.1/dist/vanilla-tilt.min.js';
    document.body.appendChild(script);
}

// Copyright yılını otomatik güncelle
function updateCopyrightYear() {
    const copyrightElement = document.getElementById('copyright-year');
    if (copyrightElement) {
        const startYear = 2022;
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = startYear === currentYear 
            ? startYear 
            : `${startYear}-${currentYear}`;
    }
}

function setRegion(region) {
    const regionSelect = document.getElementById('serviceSelect');
    if (regionSelect) {
        regionSelect.value = region;
    }
}

// Nöromorfik elementler için
function initNeumorphicElements() {
    // Nöromorfik butonlara tıklama efekti ekle
    const neumorphicButtons = document.querySelectorAll('.btn-neuro');
    neumorphicButtons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.classList.add('pressed');
        });
        
        button.addEventListener('mouseup', function() {
            this.classList.remove('pressed');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('pressed');
        });
    });
    
    // Tema ayarlaması için nöromorfik switch komponentleri
    const neumorphicToggles = document.querySelectorAll('.neuro-toggle');
    neumorphicToggles.forEach(toggle => {
        if (!toggle.id.includes('themeToggle')) { // Tema toggle dışındakiler için
            toggle.addEventListener('click', function() {
                this.classList.toggle('active');
                // Custom event tetikle
                const event = new CustomEvent('neumorphic-toggle', { 
                    detail: { id: this.id, active: this.classList.contains('active') } 
                });
                document.dispatchEvent(event);
            });
        }
    });
}

// Canlı gradient efektleri için
function enhanceGradientEffects() {
    // Gradyan pulslar için
    const gradientPulseElements = document.querySelectorAll('.gradient-pulse');
    gradientPulseElements.forEach(element => {
        // Rastgele başlangıç pozisyonu için
        const randomPos = Math.floor(Math.random() * 100);
        element.style.setProperty('--gradient-position', `${randomPos}%`);
    });
    
    // Etkileşimli arka plan için mouse olayları
    document.querySelectorAll('.patreon-header, .hero-section, .contact-section').forEach(section => {
        section.classList.add('interactive-bg');
        
        section.addEventListener('mousemove', function(e) {
            // Eğer interactive-bg sınıfı varsa
            if (this.classList.contains('interactive-bg')) {
                const rect = this.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                this.style.setProperty('--mouse-x', `${x}%`);
                this.style.setProperty('--mouse-y', `${y}%`);
            }
        });
    });
}

function applyRTLSupport(lang) {
    const rtlLanguages = ['he', 'fa', 'ur'];
    const isRTL = rtlLanguages.includes(lang);
    
    console.log(`RTL desteği uygulanıyor: Dil=${lang}, RTL mi?=${isRTL}`);
    
    // Belge yönünü ayarla
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl-support', isRTL);
    
    // RTL için özel CSS sınıfları
    const elementsToFlip = document.querySelectorAll('.nav-item, .btn, .card, .icon-with-text, .container, .row, .col, .mega-menu-container, .language-dropdown');
    elementsToFlip.forEach(el => {
        el.classList.toggle('rtl-flip', isRTL);
    });
    
    // RTL için text-align değerlerini ayarla
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, .text-left, .text-right');
    textElements.forEach(el => {
        if (isRTL) {
            if (el.classList.contains('text-left')) {
                el.classList.remove('text-left');
                el.classList.add('text-right');
            }
        } else {
            if (el.classList.contains('text-right') && !el.hasAttribute('data-fixed-align')) {
                el.classList.remove('text-right');
                el.classList.add('text-left');
            }
        }
    });
    
    // Form elementlerini RTL için düzenle
    const formElements = document.querySelectorAll('input, textarea, select');
    formElements.forEach(el => {
        el.style.textAlign = isRTL ? 'right' : 'left';
        el.classList.toggle('rtl-input', isRTL);
    });
    
    // Sayfa içi RTL/LTR geçişi sonrası yeniden düzenleme
    setTimeout(() => {
        // Özel elementlerin konumlarını yeniden düzenle (floating panel gibi)
        const floatingPanels = document.querySelectorAll('.floating-settings-panel');
        floatingPanels.forEach(panel => {
            if (isRTL) {
                panel.style.right = 'auto';
                panel.style.left = '-320px';
            } else {
                panel.style.left = 'auto';
                panel.style.right = '-320px';
            }
        });
        
        // Aktif panel durumunu düzelt
        const activePanel = document.querySelector('.floating-settings-panel.active');
        if (activePanel) {
            if (isRTL) {
                activePanel.style.left = '0';
            } else {
                activePanel.style.right = '0';
            }
        }
        
        // Ayar düğmesini yeniden konumlandır
        const settingsToggle = document.getElementById('settingsToggle');
        if (settingsToggle) {
            if (isRTL) {
                settingsToggle.style.right = 'auto';
                settingsToggle.style.left = '0';
            } else {
                settingsToggle.style.left = 'auto';
                settingsToggle.style.right = '0';
            }
        }
        
        console.log('RTL ayarlamaları tamamlandı');
    }, 100);
}

// Yeni eklenen fonksiyon
function initAccessibilityFeatures() {
    const accessibilityToggle = document.getElementById('accessibilityToggle');
    if (accessibilityToggle) {
        const savedAccessibility = localStorage.getItem('accessibility-mode') === 'true';
        
        // Kayıtlı ayarı yükle
        if (savedAccessibility) {
            document.documentElement.classList.add('high-contrast');
            accessibilityToggle.classList.add('active');
        }
        
        // Toggle olayını dinle
        accessibilityToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            document.documentElement.classList.toggle('high-contrast');
            localStorage.setItem('accessibility-mode', 
                                document.documentElement.classList.contains('high-contrast'));
        });
    }
    
    // Font boyutu ayarları için kısayollar
    document.addEventListener('keydown', function(e) {
        // Ctrl + + tuşu ile font büyütme
        if (e.ctrlKey && e.key === '+') {
            const currentSize = parseInt(localStorage.getItem('fontSize') || '100');
            const newSize = Math.min(currentSize + 5, 150);
            document.documentElement.style.fontSize = `${newSize}%`;
            localStorage.setItem('fontSize', newSize.toString());
        }
        
        // Ctrl + - tuşu ile font küçültme
        if (e.ctrlKey && e.key === '-') {
            const currentSize = parseInt(localStorage.getItem('fontSize') || '100');
            const newSize = Math.max(currentSize - 5, 70);
            document.documentElement.style.fontSize = `${newSize}%`;
            localStorage.setItem('fontSize', newSize.toString());
        }
    });
    
    // Font boyutu butonları
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const size = this.dataset.size;
            document.documentElement.style.fontSize = `${size}%`;
            localStorage.setItem('fontSize', size);
        });
    });
}

/**
 * Settings Panel Functionality
 * Handles settings toggle, theme switching, contrast mode, font size and theme colors
 */
function initSettingsPanel() {
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsClose = document.getElementById('settingsClose');
    const themeToggle = document.getElementById('themeToggle');
    const contrastToggle = document.getElementById('contrastToggle');
    const increaseFontBtn = document.getElementById('increaseFontSize');
    const decreaseFontBtn = document.getElementById('decreaseFontSize');
    const fontSizeDisplay = document.getElementById('currentFontSize');
    const colorOptions = document.querySelectorAll('.color-option');
    
    if (!settingsToggle || !settingsPanel) return;
    
    // Tema önizlemesi için sınıf ekle
    const themePreview = document.querySelector('.theme-preview');
    if (themePreview) {
        themePreview.classList.add('theme-preview-day');
    }
    
    // Toggle settings panel - bunu güçlendirelim
    settingsToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Tıklama olayının belge seviyesine yayılmasını önler
        
        settingsPanel.classList.toggle('active');
        settingsToggle.classList.toggle('active');
        
        // Konsola log ekleyelim
        console.log('Settings toggle clicked, panel is now:', settingsPanel.classList.contains('active') ? 'active' : 'inactive');
    });
    
    // Close settings panel
    if (settingsClose) {
        settingsClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            settingsPanel.classList.remove('active');
            settingsToggle.classList.remove('active');
        });
    }
    
    // Click outside to close - event bubling ile ilgili düzeltmeler
    document.addEventListener('click', function(e) {
        if (settingsPanel.classList.contains('active') && 
            !settingsPanel.contains(e.target) && 
            e.target !== settingsToggle && 
            !settingsToggle.contains(e.target)) {
            
            settingsPanel.classList.remove('active');
            settingsToggle.classList.remove('active');
        }
    });
    
    // Theme toggle
    if (themeToggle) {
        // Set initial state based on localStorage or user preference
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        themeToggle.checked = savedDarkMode;
        
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            if (themePreview) {
                themePreview.classList.remove('theme-preview-day');
                themePreview.classList.add('theme-preview-night');
            }
        }
        
        themeToggle.addEventListener('change', function() {
            document.body.classList.toggle('dark-mode', themeToggle.checked);
            localStorage.setItem('darkMode', themeToggle.checked);
            
            // Tema önizlemesini güncelle
            if (themePreview) {
                if (themeToggle.checked) {
                    themePreview.classList.remove('theme-preview-day');
                    themePreview.classList.add('theme-preview-night');
                } else {
                    themePreview.classList.remove('theme-preview-night');
                    themePreview.classList.add('theme-preview-day');
                }
            }
        });
    }
    
    // High contrast toggle
    if (contrastToggle) {
        // Set initial state based on localStorage
        const savedHighContrast = localStorage.getItem('highContrast') === 'true';
        contrastToggle.checked = savedHighContrast;
        
        if (savedHighContrast) {
            document.body.classList.add('high-contrast');
        }
        
        contrastToggle.addEventListener('change', () => {
            document.body.classList.toggle('high-contrast', contrastToggle.checked);
            localStorage.setItem('highContrast', contrastToggle.checked);
        });
    }
    
    // Font size controls
    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 100;
    
    // Initialize font size from localStorage
    document.documentElement.style.fontSize = `${currentFontSize}%`;
    if (fontSizeDisplay) {
        fontSizeDisplay.textContent = `${currentFontSize}%`;
    }
    
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            if (currentFontSize < 150) {
                currentFontSize += 10;
                updateFontSize();
            }
        });
    }
    
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            if (currentFontSize > 70) {
                currentFontSize -= 10;
                updateFontSize();
            }
        });
    }
    
    function updateFontSize() {
        document.documentElement.style.fontSize = `${currentFontSize}%`;
        if (fontSizeDisplay) {
            fontSizeDisplay.textContent = `${currentFontSize}%`;
        }
        localStorage.setItem('fontSize', currentFontSize);
    }
    
    // Color theme options
    if (colorOptions.length > 0) {
        // Set initial active state based on localStorage
        const savedTheme = localStorage.getItem('colorTheme') || 'blue';
        
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Set active class on the saved theme button
        colorOptions.forEach(option => {
            const themeValue = option.getAttribute('data-theme');
            if (themeValue === savedTheme) {
                option.classList.add('active');
            }
            
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                
                // Remove active class from all options
                colorOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to clicked option
                option.classList.add('active');
                
                // Set theme
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('colorTheme', theme);
            });
        });
    }
}

/**
 * Hero ve diğer bölümler için yumuşak 3D parallax efektleri
 */
function init3DParallaxEffect() {
    const header = document.querySelector('.patreon-header');
    const heroSection = document.querySelector('.patreon-hero');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const particles = document.querySelectorAll('.particle');
    const heroContent = document.querySelector('.hero-content');
    const hero3dCard = document.querySelector('.hero-3d-card');
    
    if (!heroSection || (!parallaxLayers.length && !particles.length)) return;
    
    // Yumuşak geçişler için değişkenler
    let currentX = 0;
    let currentY = 0;
    let aimX = 0;
    let aimY = 0;
    const smoothing = 0.1; // Daha düşük değer daha yumuşak geçiş sağlar
    
    // Mouse ve dokunma hareketlerini işle
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Mouse hareketi işleyicisi
    function handleMouseMove(e) {
        if (!heroSection.contains(e.target) && !header.contains(e.target)) return;
        
        // Mouse'un sayfa üzerindeki pozisyonu
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        // Hedef pozisyon değeri hesaplanıyor (daha yumuşak geçiş için)
        aimX = mouseX;
        aimY = mouseY;
    }
    
    // Dokunma hareketi işleyicisi
    function handleTouchMove(e) {
        if (!e.touches[0]) return;
        
        // İlk dokunma noktasının pozisyonu
        const touchX = e.touches[0].clientX / window.innerWidth - 0.5;
        const touchY = e.touches[0].clientY / window.innerHeight - 0.5;
        
        // Hedef pozisyon değeri hesaplanıyor (daha yumuşak geçiş için)
        aimX = touchX;
        aimY = touchY;
    }
    
    // Animasyon frame'i güncelleme fonksiyonu 
    function update() {
        // Mevcut pozisyonu, hedef pozisyona doğru yumuşak şekilde ilerlet
        currentX += (aimX - currentX) * smoothing;
        currentY += (aimY - currentY) * smoothing;
        
        // Parallax katmanlarını güncelle
        if (parallaxLayers.length) {
            parallaxLayers.forEach((layer, index) => {
                const depth = 0.02 + (index * 0.01); // Derinlik değeri azaltıldı
                const moveX = currentX * depth * 100; // Hareket miktarı azaltıldı
                const moveY = currentY * depth * 50;  // Hareket miktarı azaltıldı
                
                layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });
        }
        
        // Parçacıkları (particles) güncelle
        if (particles.length) {
            particles.forEach((particle, index) => {
                const depth = 0.01 + (index * 0.005); // Derinlik değeri azaltıldı 
                const moveX = currentX * depth * 70;
                const moveY = currentY * depth * 40;
                
                // Orijinal animasyonu korurken sadece offset ekle
                const transform = getComputedStyle(particle).getPropertyValue('transform');
                if (transform !== 'none') {
                    particle.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
                }
            });
        }
        
        // Hero içeriğini güncelle (ters yönde parallax için)
        if (heroContent) {
            const moveX = -currentX * 0.01 * 30; // Daha az hareket
            const moveY = -currentY * 0.01 * 20; // Daha az hareket
            heroContent.style.transform = `translate3d(${moveX}px, ${moveY}px, 30px)`;
        }
        
        // 3D kartı güncelle
        if (hero3dCard) {
            const rotateX = currentY * 3; // Daha az rotasyon
            const rotateY = currentX * 5; // Daha az rotasyon
            hero3dCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
        
        // Bir sonraki frame'i iste
        requestAnimationFrame(update);
    }
    
    // Animasyonu başlat
    update();
    
    // Tarayıcı sekme değiştiğinde kaynakları serbest bırak
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Sayfa görünür değilse dinleyicileri kaldır
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
        } else {
            // Sayfa tekrar görünür olduğunda dinleyicileri ekle
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouchMove, { passive: true });
        }
    });
    
    // Ekran boyutu değiştiğinde efektleri sıfırla
    window.addEventListener('resize', function() {
        aimX = 0;
        aimY = 0;
    });
}

// Değişen kelimeler efekti
function initChangingWords() {
    const words = ["güvenle", "profesyonelce", "şeffaf", "dikkatle", "özenle"];
    const wordElement = document.getElementById('changingWord');
    let currentIndex = 0;
    
    if (wordElement) {
        setInterval(() => {
            wordElement.style.opacity = 0;
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % words.length;
                wordElement.textContent = words[currentIndex];
                wordElement.style.opacity = 1;
            }, 500);
        }, 3000);
    }
}

// Form gönderimi için loading state
$('form').on('submit', function() {
    const submitBtn = $(this).find('[type="submit"]');
    submitBtn.addClass('btn-loading').attr('disabled', true);
    
    // Form işlemi tamamlandığında
    // submitBtn.removeClass('btn-loading').attr('disabled', false);
});
