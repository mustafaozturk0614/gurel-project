// Hata yakalama mekanizması - başlangıçta ekle
try {
    // Tarayıcı eklenti hatalarını filtrele
    window.addEventListener('error', function(e) {
      if (e.filename && (e.filename.includes('contentScript.bundle.js') || e.filename.includes('chrome-extension'))) {
        console.debug('Header.js: Eklenti hatası yakalandı ve görmezden gelindi:', e.message);
        e.preventDefault();
        return true;
      }
    });
} catch (err) {
    console.debug('Hata izleme kurulumu hatası:', err);
}

document.addEventListener("DOMContentLoaded", function() {
    // ----- DEĞIŞKENLER -----
    const header = document.querySelector('.patreon-header');
    const navLinks = document.querySelectorAll('.nav-link');
    const navIcons = document.querySelectorAll('.nav-icon');
    const logo = document.querySelector('.navbar-brand');
    const logoImage = document.querySelector('.header-logo');
    const scrollProgressBar = document.querySelector('.scroll-progress-bar');
    const ctaButton = document.querySelector('.header-button');
    let lastScrollTop = 0;
    let scrollTimer;
    
    // ----- SCROLL PROGRESS INDICATOR -----
    function updateScrollProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (scrollProgressBar) {
            scrollProgressBar.style.width = scrolled + "%";
            
            // Renk değişimi: Progress arttıkça rengi değiştir
            const hue = Math.floor(scrolled * 2.4); // 0-240 arası bir hue değeri (mavi->mor->kırmızı)
            scrollProgressBar.style.background = `linear-gradient(to right, var(--primary-rgb), hsl(${hue}, 80%, 60%))`;
            
            // Progress %100'e yaklaştıkça parlama efekti ekle
            if (scrolled > 90) {
                scrollProgressBar.classList.add('glow-effect');
            } else {
                scrollProgressBar.classList.remove('glow-effect');
            }
        }
    }
    
    // ----- HEADER DAVRANIŞLARI -----
    function handleHeaderScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollTop - lastScrollTop;
        const scrollSpeed = Math.abs(scrollDelta);
        
        // Scroll hızını belirle
        if (scrollSpeed > 30) {
            header.classList.add('fast-scroll');
            header.classList.remove('slow-scroll');
        } else {
            header.classList.add('slow-scroll');
            header.classList.remove('fast-scroll');
        }
        
        // Scroll derinliğine göre header davranışları
        if (scrollTop > 100) {
            header.classList.add('scrolled-100');
            
            if (scrollTop > 300) {
                header.classList.add('scrolled-300');
                
                if (scrollTop > 600) {
                    header.classList.add('scrolled-600');
                    header.classList.add('mini-header');
                } else {
                    header.classList.remove('scrolled-600');
                    header.classList.remove('mini-header');
                }
            } else {
                header.classList.remove('scrolled-300');
            }
        } else {
            header.classList.remove('scrolled-100');
            header.classList.remove('mini-header');
        }
        
        // Scroll yönü - aşağı
        if (scrollTop > lastScrollTop && scrollTop > 300) {
            header.classList.add('scroll-down');
            header.classList.remove('scroll-up');
        } 
        // Scroll yönü - yukarı
        else if (scrollTop < lastScrollTop) {
            header.classList.add('scroll-up');
            header.classList.remove('scroll-down');
        }
        
        // Scroll progress'i güncelle
        updateScrollProgress();
        
        // Temizleme ve ayarlama
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
            header.classList.remove('fast-scroll');
            header.classList.remove('slow-scroll');
        }, 200);
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }
    
    // ----- MİKRO-ETKİLEŞİMLER -----
    // Menü öğeleri için 3D hover efekti
    function setupMenuInteractions() {
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                // 3D döndürme efekti
                this.style.transform = 'perspective(1000px) rotateX(4deg) rotateY(10deg) scale(1.05)';
                
                // İkon morfolojisi
                const icon = this.querySelector('.nav-icon');
                if (icon) {
                    icon.classList.add('morphed');
                }
                
                // Neon parlaması 
                this.classList.add('neon-glow');
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = '';
                
                const icon = this.querySelector('.nav-icon');
                if (icon) {
                    icon.classList.remove('morphed');
                }
                
                this.classList.remove('neon-glow');
            });
        });
    }
    
    // "Bize Ulaşın" butonu için gelişmiş etkileşimler
    function setupCtaButtonInteractions() {
        if (ctaButton) {
            // Fare takibi için parlaklık efekti
            ctaButton.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                // Işık efektinin pozisyonunu ayarla
                this.style.setProperty('--x-light', x + '%');
                this.style.setProperty('--y-light', y + '%');
                
                // Parlaklık efektini ekle
                if (!this.classList.contains('light-active')) {
                    this.classList.add('light-active');
                }
            });
            
            // Fare hareketi sona erdiğinde
            ctaButton.addEventListener('mouseleave', function() {
                this.classList.remove('light-active');
            });
            
            // Tıklama animasyonu
            ctaButton.addEventListener('click', function(e) {
                // Tıklama dalgası efekti
                const circle = document.createElement('span');
                const diameter = Math.max(this.clientWidth, this.clientHeight);
                const radius = diameter / 2;
                
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
                circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;
                circle.classList.add('ripple-effect');
                
                // Varsa önceki dalgayı temizle
                const existingRipple = this.querySelector('.ripple-effect');
                if (existingRipple) {
                    existingRipple.remove();
                }
                
                this.appendChild(circle);
                
                // Animasyon bittiğinde elementi temizle
                setTimeout(() => {
                    circle.remove();
                }, 600);
            });
            
            // İkon animasyonu
            const icon = ctaButton.querySelector('.btn-icon');
            if (icon) {
                // Butona hover olduğunda ikonu döndür
                ctaButton.addEventListener('mouseenter', function() {
                    icon.style.animation = 'iconRotate 0.8s ease';
                    icon.classList.add('icon-hover');
                });
                
                ctaButton.addEventListener('mouseleave', function() {
                    icon.style.animation = '';
                    icon.classList.remove('icon-hover');
                });
            }
            
            // Ekstra pulse efekti
            let pulseInterval;
            
            // Sayfaya ilk yüklendiğinde dikkat çekmek için
            setTimeout(() => {
                ctaButton.classList.add('extra-pulse');
                
                // 3 saniye sonra kaldır
                setTimeout(() => {
                    ctaButton.classList.remove('extra-pulse');
                }, 3000);
            }, 1500);
            
            // Scroll durunca butonu vurgula
            window.addEventListener('scroll', function() {
                clearTimeout(pulseInterval);
                ctaButton.classList.remove('extra-pulse');
                
                pulseInterval = setTimeout(() => {
                    ctaButton.classList.add('extra-pulse');
                    
                    // 2 saniye sonra kaldır
                    setTimeout(() => {
                        ctaButton.classList.remove('extra-pulse');
                    }, 2000);
                }, 1500);
            });
        }
    }
    
    // Logo için parıltı efekti
    function setupLogoEffect() {
        if (logo) {
            // Mouse takibi için
            logo.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                this.style.setProperty('--x-pos', x + '%');
                this.style.setProperty('--y-pos', y + '%');
            });
            
            // Hover durumu için
            logo.addEventListener('mouseenter', function() {
                this.classList.add('logo-hover');
            });
            
            logo.addEventListener('mouseleave', function() {
                this.classList.remove('logo-hover');
            });
        }
    }
    
    // İkon morfolojileri için scroll event handler
    function updateIconMorphology() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        navIcons.forEach(icon => {
            if (scrollTop > 300) {
                icon.classList.add('icon-morphed');
            } else {
                icon.classList.remove('icon-morphed');
            }
        });
    }
    
    // ----- HEADER SVG DEKORASYON -----
    function setupHeaderDecoration() {
        if (header && !document.querySelector('.header-decoration')) {
            // Header'a SVG dekoratif ögeler ekle
            const headerDecoration = document.createElement('div');
            headerDecoration.className = 'header-decoration';
            headerDecoration.innerHTML = `
                <svg class="header-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 50">
                    <path d="M0,32L60,37.3C120,43,240,53,360,48C480,43,600,21,720,16C840,11,960,21,1080,24C1200,27,1320,21,1380,18.7L1440,16L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
                </svg>
            `;
            header.appendChild(headerDecoration);
        }
    }
    
    // ----- OLAY DİNLEYİCİLERİ -----
    window.addEventListener('scroll', function() {
        handleHeaderScroll();
        updateIconMorphology();
    });
    
    window.addEventListener('resize', function() {
        updateScrollProgress();
    });
    
    // ----- İNİTİALİZE -----
    // Header bileşenlerini ayarla
    setupHeaderDecoration();
    setupMenuInteractions();
    setupLogoEffect();
    setupCtaButtonInteractions();
    
    // Sayfa yüklendiğinde doğru durumu ayarla
    handleHeaderScroll();
    
    // Karanlık/Aydınlık mod algılama
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    function handleDarkMode(e) {
        if (e.matches) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }
    
    darkModeMediaQuery.addListener(handleDarkMode);
    handleDarkMode(darkModeMediaQuery);
}); 