// Sabitler
const ANIMATION_SETTINGS = {
    duration: 800,
    easing: 'ease-in-out',
    once: false,
    mirror: true,
    offset: 50
};

const SCROLL_SETTINGS = {
    threshold: 100,
    headerOpacity: 0.85,
    blurAmount: 10
};

const MAP_COORDINATES = {
    Edremit: { top: '48%', left: '52%' },
    Akçay: { top: '45%', left: '48%' },
    Güre: { top: '42%', left: '54%' },
    Burhaniye: { top: '52%', left: '56%' },
    Altınoluk: { top: '40%', left: '43%' },
    Küçükkuyu: { top: '35%', left: '40%' },
    Pelitköy: { top: '55%', left: '60%' },
    Gömeç: { top: '58%', left: '65%' },
    Ayvalık: { top: '62%', left: '68%' }
};

// Harita bölgesi için koordinatlar ve pin pozisyonları
const MAP_POSITIONS = {
    'Edremit': { 
        top: '50%', 
        left: '50%' 
    },
    'Akçay': { 
        top: '45%', 
        left: '35%' 
    },
    'Güre': { 
        top: '42%', 
        left: '30%' 
    },
    'Burhaniye': { 
        top: '65%', 
        left: '55%' 
    },
    'Altınoluk': { 
        top: '35%', 
        left: '25%' 
    }
};

// Harita bölgesi için koordinatlar
const MAP_LOCATIONS = {
    'Edremit': {
        lat: 39.592450,
        lng: 27.016894,
        zoom: 16
    },
    'Akçay': {
        lat: 39.592450,  // Gürel Yönetim ofis konumu
        lng: 27.016894,  // Haritada sadece pin noktası değişecek
        zoom: 16
    },
    'Güre': {
        lat: 39.592450,  // Gürel Yönetim ofis konumu
        lng: 27.016894,  // Haritada sadece pin noktası değişecek
        zoom: 16
    },
    'Burhaniye': {
        lat: 39.592450,  // Gürel Yönetim ofis konumu
        lng: 27.016894,  // Haritada sadece pin noktası değişecek
        zoom: 16
    },
    'Altınoluk': {
        lat: 39.592450,  // Gürel Yönetim ofis konumu
        lng: 27.016894,  // Haritada sadece pin noktası değişecek
        zoom: 16
    }
};

// Modern Hero Özellikleri
function initModernHero() {
    // Paralaks efekti
    if (window.innerWidth > 1199) {
        document.addEventListener('mousemove', (e) => {
            const layers = document.querySelectorAll('.parallax-layer');
            const pageX = e.clientX;
            const pageY = e.clientY;
            
            layers.forEach(layer => {
                const speed = layer.getAttribute('data-depth');
                const x = (window.innerWidth - pageX * speed) / 100;
                const y = (window.innerHeight - pageY * speed) / 100;
                layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
            });
        });
    }
    
    // 3D kart efekti
    const card = document.querySelector('.hero-3d-card');
    if (card && window.innerWidth > 1199) {
        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const mouseX = e.clientX - cardCenterX;
            const mouseY = e.clientY - cardCenterY;
            
            const rotateX = -mouseY / 10;
            const rotateY = mouseX / 10;
            
            card.querySelector('.card-3d-wrapper').style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Depth effect
            const items = card.querySelectorAll('.service-icon, h4, p');
            items.forEach((item, index) => {
                const depth = index * 0.5 + 2;
                item.style.transform = `translateZ(${depth}px)`;
            });
        });
        
        card.addEventListener('mouseleave', () => {
            card.querySelector('.card-3d-wrapper').style.transform = 'rotateX(0deg) rotateY(0deg)';
            
            // Reset depth
            const items = card.querySelectorAll('.service-icon, h4, p');
            items.forEach(item => {
                item.style.transform = 'translateZ(0px)';
            });
        });
    }
    
    // Badge pulse animation fix
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) {
        heroBadge.addEventListener('animationiteration', () => {
            heroBadge.style.animationPlayState = 'running';
        });
    }
    
    // Scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        });
    }
    
    // Location pills hover effect
    const locationPills = document.querySelectorAll('.location-pill');
    locationPills.forEach(pill => {
        pill.addEventListener('mouseenter', () => {
            const region = pill.getAttribute('data-region');
            // Burada istediğiniz bölge vurgulama efektlerini ekleyebilirsiniz
            console.log(`Bölge vurgulandı: ${region}`);
        });
    });
    
    // Tooltip için Bootstrap initializations
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0) {
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
    
    // Sayaç animasyonu (Hero stats için)
    startHeroStatsCounter();
}

function startHeroStatsCounter() {
    const heroStats = document.querySelectorAll('.hero-stats .counting');
    if (heroStats.length === 0) return;
    
    const observer = new IntersectionObserver(
        entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-count');
                const increment = Math.max(1, Math.trunc(target / 50));
                let current = 0;
                
                const updateCount = () => {
                    if (current < target) {
                        current += increment;
                        if (current > target) current = target;
                        entry.target.textContent = current;
                        requestAnimationFrame(updateCount);
                    }
                };
                
                updateCount();
                observer.unobserve(entry.target);
            }
        }),
        { threshold: 0.5 }
    );
    
    heroStats.forEach(stat => observer.observe(stat));
}

// Ana başlatma fonksiyonu
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initModernHero(); // Hero modern özelliklerini başlat
});

function initializeApp() {
    // AOS Initialize
    AOS.init(ANIMATION_SETTINGS);

    // Tüm modülleri başlat
    [
        initHeaderScroll,
        initSmoothScroll,
        initTiltEffect,
        initMobileNavigation,
        initCounters,
        initMapFeatures,
        initContactForm,
        initUIEffects
    ].forEach(module => module());
}

// Header işlemleri
function initHeaderScroll() {
    const header = document.querySelector('.patreon-header');
    let ticking = false;

    if (!header) return;

    const updateHeader = (scrollTop) => {
        // Threshold değerini azaltalım - daha erken değişim başlasın
        const threshold = 50;
        const isScrolled = scrollTop > threshold;
        
        // Opacity değerini düşük tutalım, daha şeffaf bir header
        const opacity = Math.min(scrollTop / threshold * 0.9, 0.9);
        // Blur değeri de daha az olsun
        const blur = Math.min(scrollTop / threshold * 3, 3);

        header.classList.toggle('scrolled', isScrolled);
        
        // Transparent headersa beyaz arka plan, değilse daha koyu bir ton
        if (header.classList.contains('transparent')) {
            header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        } else {
            header.style.backgroundColor = isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent';
        }
        
        header.style.backdropFilter = `blur(${blur}px)`;

        // Floating elements efekti
        document.querySelectorAll('.floating-elements')
            .forEach(el => el.classList.toggle('scrolled', scrollTop > 100));

        // Parallax efektleri
        updateParallaxElements(scrollTop);
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeader(window.scrollY);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Başlangıç durumu
    updateHeader(window.scrollY);
}

// Parallax elementlerini güncelle
function updateParallaxElements(scrollTop) {
    const elements = {
        '.hero-wave-transition': { transform: `translateY(${scrollTop * 0.02}px) scale(1.02)` },
        '.floating-feature-card': { transform: `translateY(${scrollTop * -0.03}px)` }
    };

    Object.entries(elements).forEach(([selector, styles]) => {
        const element = document.querySelector(selector);
        if (element) {
            Object.assign(element.style, styles);
        }
    });
}

// Sayaç animasyonu
function initCounters() {
    const observer = new IntersectionObserver(
        entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounting();
                observer.unobserve(entry.target);
            }
        }),
        { threshold: 0.4 }
    );

    const statsWrapper = document.querySelector('.stats-wrapper');
    if (statsWrapper) {
        observer.observe(statsWrapper);
    }
}

function startCounting() {
    document.querySelectorAll('.counting').forEach(counter => {
        const target = +counter.getAttribute('data-count');
        const increment = Math.trunc(target / 200);
        
        const updateCount = () => {
            const count = +counter.innerText.replace(/,/g, '');
            if (count < target) {
                counter.innerText = (count + increment).toString();
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target.toString();
            }
        };
        
        updateCount();
    });
}

// Tilt efekti
function initTiltEffect() {
    document.querySelectorAll('[data-tilt]').forEach(element => {
        const handleTilt = (e) => {
            const { left, top, width, height } = element.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            element.style.transform = e.type === 'mousemove'
                ? `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.03, 1.03, 1.03)`
                : 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
        };

        element.addEventListener('mousemove', handleTilt);
        element.addEventListener('mouseleave', handleTilt);
    });
}

// Mobil navigasyon
function initMobileNavigation() {
    const navCollapse = document.querySelector('.navbar-collapse');
    const navToggler = document.querySelector('.navbar-toggler');
    const header = document.querySelector('.patreon-header');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navCollapse?.classList.contains('show')) {
                navCollapse.classList.remove('show');
                navToggler?.classList.remove('active');
                navToggler?.setAttribute('aria-expanded', 'false');
                
                // Kapatıldığında header'ı normal dönüştür
                if (header && window.scrollY <= 50) {
                    header.style.backgroundColor = 'transparent';
                }
            }
        });
    });

    navToggler?.addEventListener('click', function() {
        this.classList.toggle('active');
        
        // Navbar açıldığında header arkaplanını beyaza dönüştür
        if (navCollapse?.classList.contains('show') && header) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else if (header && window.scrollY <= 50) {
            header.style.backgroundColor = 'transparent';
        }
    });
}

// Yumuşak kaydırma
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.patreon-header')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                
                window.scrollTo({
                    top: targetPosition - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Harita özellikleri
function initMapFeatures() {
    const regionTags = document.querySelectorAll('.region-tag');
    const mapContainer = document.querySelector('.map-container');
    
    if (!regionTags || !mapContainer) return;
    
    // Bölge etiketlerine tıklama olayı ekle
    regionTags.forEach(tag => {
        if (tag.dataset.region) {
            tag.addEventListener('click', function() {
                // Aktif sınıfını kaldır
                regionTags.forEach(t => t.classList.remove('active'));
                // Tıklanan etikete aktif sınıfı ekle
                this.classList.add('active');
                
                // Pin'i hareket ettir
                positionPinByRegion(this.dataset.region);
                
                // Bölge bilgilerini güncelle
                updateRegionInfo(this.dataset.region);
                
                // Harita animasyonu
                mapContainer.classList.add('animate-map');
                setTimeout(() => {
                    mapContainer.classList.remove('animate-map');
                }, 500);
            });
        }
    });
    
    // İlk bölgeyi aktif et
    if (regionTags.length > 0 && regionTags[0].dataset.region) {
        regionTags[0].classList.add('active');
        positionPinByRegion(regionTags[0].dataset.region);
    }
}

// Pin pozisyonunu ayarla
function positionPinByRegion(regionName) {
    const pinMarker = document.querySelector('.map-pin-marker');
    if (!pinMarker) return;
    
    const position = MAP_POSITIONS[regionName] || MAP_POSITIONS['Edremit'];
    
    // Pin konumunu güncelle
    pinMarker.style.top = position.top;
    pinMarker.style.left = position.left;
    
    // Pin animasyonu
    pinMarker.classList.add('pin-bounce');
    setTimeout(() => {
        pinMarker.classList.remove('pin-bounce');
    }, 1000);
}

// Bölge bilgilerini güncelleme
function updateRegionInfo(regionName) {
    const infoContainer = document.querySelector('.location-details');
    if (!infoContainer) return;
    
    // Bölge bilgileri
    const regionInfo = {
        'Edremit': {
            title: 'Edremit',
            address: 'Gürel Apartman ve Site Yönetimi, Akçay Mah. Güven Yolu No:5, Edremit/Balıkesir',
            properties: '120+ Yönetilen Mülk',
            service: 'Tüm Yönetim Hizmetleri'
        },
        'Akçay': {
            title: 'Akçay',
            address: 'Akçay, Edremit/Balıkesir',
            properties: '85+ Yönetilen Mülk',
            service: 'Site ve Apartman Yönetimi'
        },
        'Güre': {
            title: 'Güre',
            address: 'Güre, Edremit/Balıkesir',
            properties: '60+ Yönetilen Mülk',
            service: 'Site ve Apartman Yönetimi'
        },
        'Burhaniye': {
            title: 'Burhaniye',
            address: 'Burhaniye/Balıkesir',
            properties: '40+ Yönetilen Mülk',
            service: 'Site Yönetimi'
        },
        'Altınoluk': {
            title: 'Altınoluk',
            address: 'Altınoluk, Edremit/Balıkesir',
            properties: '50+ Yönetilen Mülk',
            service: 'Site ve Apartman Yönetimi'
        }
    };
    
    const info = regionInfo[regionName] || regionInfo['Edremit'];
    
    // Bilgileri HTML'e yerleştir
    infoContainer.innerHTML = `
        <div class="location-item">
            <div class="icon-box">
                <i class="fas fa-map-marker"></i>
            </div>
            <div class="location-text">
                <h5>${info.title}</h5>
                <p>${info.address}</p>
            </div>
        </div>
        <div class="location-item">
            <div class="icon-box">
                <i class="fas fa-building"></i>
            </div>
            <div class="location-text">
                <h5>Hizmet Alanı</h5>
                <p>${info.properties}</p>
                <p>${info.service}</p>
            </div>
        </div>
    `;
}

// UI Efektleri
function initUIEffects() {
    setupFormIconsAnimation();
    initSocialButtonsEffects();
    initParticles();
}

function setupFormIconsAnimation() {
    document.querySelectorAll('.form-control, .form-select').forEach(input => {
        ['focus', 'blur'].forEach(eventType => {
            input.addEventListener(eventType, () => {
                const icon = input.parentElement.querySelector('.form-icon');
                icon?.classList.toggle('active-icon', eventType === 'focus');
            });
        });
    });
}

function initSocialButtonsEffects() {
    document.querySelectorAll('.social-button').forEach(button => {
        ['mouseenter', 'mouseleave'].forEach(eventType => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = eventType === 'mouseenter'
                    ? 'translateY(-5px) rotate(5deg)'
                    : 'translateY(0) rotate(0deg)';
            });
        });
    });
}

function initParticles() {
    if (!document.getElementById('particles-js')) return;

    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
            opacity: {
                value: 0.5,
                random: false,
                anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: false, speed: 40, size_min: 0.1, sync: false }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 6,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: { enable: false, rotateX: 600, rotateY: 1200 }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 1 } },
                bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
                repulse: { distance: 200, duration: 0.4 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 }
            }
        },
        retina_detect: true
    });
}

// Harita bölge değiştirme ve yol tarifi işlevleri
// dene2.html'den taşınan kodlar
function changeRegion(element) {
    // Küçük haritadaki tıklanan bölgeyi aktif yap
    const regionTags = document.querySelectorAll('.region-tag');
    regionTags.forEach(tag => tag.classList.remove('active'));
    element.classList.add('active');
    
    // Bölge bilgilerini al
    const region = element.getAttribute('data-region');
    const lat = element.getAttribute('data-lat');
    const lng = element.getAttribute('data-lng');
    
    // Harita iframe'i güncelle
    updateMapForRegion(region, lat, lng, 'contactMap');
    
    // Yol tarifi linklerini güncelle
    updateRouteLinks(lat, lng, false);
    
    // Bölge değiştiğinde bir bilgi toast'u göster
    showToast(`${region} bölgesi seçildi`, 'info');
}

// Haritayı belirli bir bölgeye göre güncelle
function updateMapForRegion(region, lat, lng, mapElementId) {
    const zoom = 15;
    const mapElement = document.getElementById(mapElementId);
    
    if (mapElement) {
        const newSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(region)}!5e0!3m2!1str!2str!4v1732455657201!5m2!1str!2str`;
        mapElement.src = newSrc;
    }
}

// Yol tarifi linklerini güncelle
function updateRouteLinks(lat, lng, isModal) {
    const prefix = isModal ? 'modal' : '';
    
    // Araçla
    const drivingLink = document.getElementById(`${prefix}DrivingLink`) || 
                        document.querySelector(`a[href*="travelmode=driving"]`);
    if (drivingLink) {
        drivingLink.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    }
    
    // Yürüyerek
    const walkingLink = document.getElementById(`${prefix}WalkingLink`) || 
                       document.querySelector(`a[href*="travelmode=walking"]`);
    if (walkingLink) {
        walkingLink.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    }
    
    // Toplu taşıma
    const transitLink = document.getElementById(`${prefix}TransitLink`) || 
                       document.querySelector(`a[href*="travelmode=transit"]`);
    if (transitLink) {
        transitLink.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
    }
}

// Bilgi toast'u göster
function showToast(message, type = 'info') {
    // Bootstrap toast kullanıyorsa
    const toast = document.createElement('div');
    toast.className = `toast bg-${type} text-white position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Gürel Yönetim</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Kapat"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // 3 saniye sonra otomatik olarak kaldır
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Modal içindeki bölge değiştirme için event listener'ları
document.addEventListener('DOMContentLoaded', function() {
    // Mevcut initMapFeatures işlevi zaten kurulmuş olabilir, bu yüzden ek işlevleri burada tanımlıyoruz
    
    // Modal içindeki bölge listesi butonları
    const regionButtons = document.querySelectorAll('.region-select-list .list-group-item');
    
    regionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Tüm butonlardan active sınıfını kaldır
            regionButtons.forEach(btn => btn.classList.remove('active'));
            
            // Tıklanan butona active sınıfını ekle
            this.classList.add('active');
            
            // Bölge bilgilerini al
            const region = this.getAttribute('data-region');
            const lat = this.getAttribute('data-lat');
            const lng = this.getAttribute('data-lng');
            
            // Modal başlığını güncelle
            const modalTitle = document.getElementById('mapModalTitle');
            if (modalTitle) {
                modalTitle.textContent = `${region} Bölgesi`;
            }
            
            // Harita iframe'i güncelle
            updateMapForRegion(region, lat, lng, 'modalMap');
            
            // Modal içindeki yol tarifi linklerini güncelle
            updateRouteLinks(lat, lng, true);
        });
    });
    
    // Modal açıldığında varsayılan olarak Edremit seçilsin
    const mapModal = document.getElementById('mapModal');
    if (mapModal) {
        mapModal.addEventListener('shown.bs.modal', function() {
            // İlk bölge butonunu seç (Edremit)
            const firstRegionButton = document.querySelector('.region-select-list .list-group-item:first-child');
            if (firstRegionButton) {
                firstRegionButton.click();
            }
        });
    }
    
    // Küçük haritadaki bölge etiketleri için click event listener'ları
    const smallMapRegionTags = document.querySelectorAll('.region-tags .region-tag');
    smallMapRegionTags.forEach(tag => {
        tag.addEventListener('click', function() {
            changeRegion(this);
        });
    });
    
    // Harita genişletme butonu işlevselliği
    const mapExpandButton = document.querySelector('.map-expand-button');
    if (mapExpandButton) {
        mapExpandButton.addEventListener('click', function() {
            const mapModal = new bootstrap.Modal(document.getElementById('mapModal'));
            mapModal.show();
        });
    }
    
    // Bölge etiketleri için tooltip ekleme
    const regionTags = document.querySelectorAll('.region-tag');
    regionTags.forEach(tag => {
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const region = tag.getAttribute('data-region');
            // Tooltip içeriği
            const tooltipContent = `${region} bölgesi hizmet alanımız`;
            
            // Tooltip ekleme
            new bootstrap.Tooltip(tag, {
                title: tooltipContent,
                placement: 'top',
                trigger: 'hover'
            });
        }
    });
});

// İletişim Bölümü JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const contactCards = document.querySelectorAll('.contact-info-card');

    contactCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
        });
    });
});

// Header advanced interactions
function initHeaderInteractions() {
  const header = document.querySelector('.patreon-header');
  const navItems = document.querySelectorAll('.nav-item');
  const brand = document.querySelector('.navbar-brand');
  
  // Tek bir transform uygulamak için değişkenler tanımla
  let brandTransform = 'translateZ(0)';
  let navItemTransforms = {};
  
  // Scroll reveal kısmını kaldırıyorum - bu elemanların kaybolmasına neden oluyor
  // Sadece ilk yükleme sırasında temiz görünsün
  if (navItems.length > 0) {
    navItems.forEach((item, index) => {
      // Opacity değerini 1 olarak ata, transform'u resetle
      item.style.opacity = '1';
      item.style.transform = 'translateY(0) translateZ(0)';
    });
  }
  
  // Subtle parallax for header elements (sadece desktop'ta)
  if (header && window.innerWidth > 1199) {
    // Mousemove yalnızca header üzerinde olduğunda çalışsın
    header.addEventListener('mousemove', (e) => {
      const headerRect = header.getBoundingClientRect();
      
      // Mouse header içinde mi kontrol et
      if (
        e.clientX >= headerRect.left && 
        e.clientX <= headerRect.right && 
        e.clientY >= headerRect.top && 
        e.clientY <= headerRect.bottom
      ) {
        const xAxis = (headerRect.width / 2 - (e.clientX - headerRect.left)) / 60;
        const yAxis = (headerRect.height / 2 - (e.clientY - headerRect.top)) / 60;
        
        // Logo subtle movement (sınırlı hareket)
        if (brand) {
          brandTransform = `translateX(${xAxis/4}px) translateY(${yAxis/4}px) translateZ(0)`;
          brand.style.transform = brandTransform;
        }
        
        // Nav items hover state enhancement (sınırlı hareket)
        navItems.forEach((item, index) => {
          const delay = index * 0.05;
          const x = xAxis * (1 - delay);
          const y = yAxis * (1 - delay);
          const transform = `translateX(${x/6}px) translateY(${y/6}px) translateZ(0)`;
          navItemTransforms[index] = transform;
          item.style.transform = transform;
        });
      }
    });
    
    // Mouse header'dan çıktığında tüm efektleri sıfırla
    header.addEventListener('mouseleave', () => {
      if (brand) {
        brand.style.transform = 'translateZ(0)';
      }
      
      navItems.forEach(item => {
        item.style.transform = 'translateZ(0)';
      });
    });
  }
  
  // Magnetic button effect for CTA (sınırlı hareket ve sadece butona hover ettiğinde)
  const ctaButton = document.querySelector('.header-action .btn-primary');
  if (ctaButton && window.innerWidth > 1199) {
    ctaButton.addEventListener('mouseenter', function() {
      // Mouse enter - magnetik efekti aktif et
      const handleMagneticEffect = (e) => {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Hareketi sınırla, maksimum 8px
        const maxMove = 8;
        const moveX = Math.min(Math.max(x/5, -maxMove), maxMove);
        const moveY = Math.min(Math.max(y/5, -maxMove), maxMove);
        
        this.style.transform = `translate(${moveX}px, ${moveY}px) translateZ(0)`;
      };
      
      // Mousemove efekti sadece hover durumunda aktif olsun
      ctaButton.addEventListener('mousemove', handleMagneticEffect);
      
      // Butondan çıkınca event listener'ı kaldır
      ctaButton.addEventListener('mouseleave', function onLeave() {
        this.style.transform = 'translateZ(0)';
        ctaButton.removeEventListener('mousemove', handleMagneticEffect);
        ctaButton.removeEventListener('mouseleave', onLeave);
      });
    });
  }
}

// Header scroll debounce
let scrollTimer;
let lastScrollTop = 0;
let isNearPageEnd = false;

function handleScroll() {
  const header = document.querySelector('.patreon-header');
  if (!header) return;
  
  // Sayfa scroll pozisyonunu kontrol et
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  const scrollDistance = scrollHeight - clientHeight;
  
  // Sayfa sonuna yakın olup olmadığımızı kontrol et (son 100px)
  isNearPageEnd = scrollTop + clientHeight >= scrollHeight - 100;
  
  // Scroll yönünü tespit et
  const isScrollingDown = scrollTop > lastScrollTop;
  lastScrollTop = scrollTop;
  
  // Update scroll progress bar - requestAnimationFrame kullanarak performans optimizasyonu
  requestAnimationFrame(() => updateScrollProgress(scrollTop, scrollDistance));
  
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    // Sabit değere göre stil değişimi (threshold)
    const isScrolled = scrollTop > 50;
    header.classList.toggle('scrolled', isScrolled);
    
    // Sayfa sonuna çok yakınsa ve aşağı doğru kaydırılıyorsa stil değişikliklerini engelle
    if (isNearPageEnd && isScrollingDown) {
      return;
    }
    
    // Sayfa başında dinamik opacity - ama sadece scroll edilen header değilse
    if (!isScrolled) {
      const opacity = Math.min(scrollTop / 50, 0.85);
      header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      header.style.backdropFilter = `blur(${opacity * 10}px)`;
    }
  }, 15); // 15ms debounce - daha stabil bir deneyim için
}

// Update scroll progress bar and indicator with optimized performance
function updateScrollProgress(scrollTop, totalHeight) {
  const progressBar = document.querySelector('.scroll-progress-bar');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  const scrollIndicatorInner = document.querySelector('.scroll-indicator-inner');
  const scrollIndicatorCenter = document.querySelector('.scroll-indicator-center');
  
  if (!progressBar) return;
  
  // Sıfıra bölünmeyi önle
  if (totalHeight <= 0) return;
  
  // Progress hesapla (0-100 arasında sınırla)
  const progressPercent = Math.min(Math.max((scrollTop / totalHeight) * 100, 0), 100);
  const roundedProgress = Math.round(progressPercent);
  
  // Update progress bar with hardware acceleration
  progressBar.style.transform = `translateX(${progressPercent - 100}%)`;
  
  // Update scroll indicator
  if (scrollIndicatorInner && scrollIndicatorCenter) {
    scrollIndicatorInner.style.background = `conic-gradient(var(--patreon-primary) ${progressPercent}%, transparent 0%)`;
    scrollIndicatorCenter.textContent = `${roundedProgress}%`;
    
    // Show/hide based on scroll position
    if (scrollIndicator) {
      // Eğer sayfa sonuna çok yakınsak ve yüzde göstergesi 90'dan büyükse gösterge sabit kalsın
      if (isNearPageEnd && progressPercent > 90) {
        scrollIndicator.classList.add('visible');
        scrollIndicator.classList.add('end-of-page');
      } 
      // Normal görünürlük kontrolü
      else if (scrollTop > 300 && !isNearPageEnd) {
        scrollIndicator.classList.add('visible');
        scrollIndicator.classList.remove('end-of-page');
      } 
      // Sayfa başındayken gizle
      else if (scrollTop <= 300) {
        scrollIndicator.classList.remove('visible');
        scrollIndicator.classList.remove('end-of-page');
      }
    }
  }

  // Ayrıca aktif section'a göre navbar'ı güncelle
  updateActiveNavItem();
}

// Hangi section'da olduğumuza göre navbar'daki active elemanı güncelle
function updateActiveNavItem() {
  // Tüm section'ları al
  const sections = document.querySelectorAll('section[id]');
  // Navbar linklerini al
  const navItems = document.querySelectorAll('.patreon-header .nav-link');
  
  if (!sections.length || !navItems.length) return;
  
  // Header yüksekliği (offset için gerekli)
  const headerHeight = document.querySelector('.patreon-header')?.offsetHeight || 0;
  
  // Şu anki scroll pozisyonu
  const scrollY = window.scrollY + headerHeight + 50; // 50px offset ekliyoruz daha iyi algılama için
  
  // Her section'ı kontrol et ve hangisinin görünür olduğunu belirle
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    // Bu section görünür aralıkta mı?
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      // Tüm nav-link'lerden active class'ını kaldır
      navItems.forEach(item => {
        item.classList.remove('active');
      });
      
      // Bu section'a karşılık gelen nav-link'i bul ve active yap
      const correspondingNavItem = document.querySelector(`.patreon-header .nav-link[href="#${sectionId}"]`);
      if (correspondingNavItem) {
        correspondingNavItem.classList.add('active');
      }
    }
  });
  
  // Eğer sayfa başındaysak ve hiçbir section aktif değilse Ana Sayfa'yı aktif yap
  if (window.scrollY < 100) {
    navItems.forEach(item => {
      item.classList.remove('active');
    });
    
    const homeNavItem = document.querySelector('.patreon-header .nav-link[href="#home"]') || 
                       document.querySelector('.patreon-header .nav-link[href="index.html"]') ||
                       document.querySelector('.patreon-header .nav-link[href="/"]') ||
                       document.querySelector('.patreon-header .nav-link[href="#"]');
    
    if (homeNavItem) {
      homeNavItem.classList.add('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize existing functions
  handleScroll(); // Set initial state
  window.addEventListener('scroll', handleScroll);
  
  // Initialize header interactions
  initHeaderInteractions();
  
  // Add click handler for scroll indicator to scroll to top
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Rest of your initialization code
  if (window.VanillaTilt && document.querySelector('.hero-3d-card')) {
    VanillaTilt.init(document.querySelector('.hero-3d-card'), {
      max: 10,
      speed: 300,
      glare: true,
      "max-glare": 0.2,
      gyroscope: true
    });
  }
  
  // Video Lazy Loading
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    const loadVideo = () => {
      if (heroVideo.getAttribute('data-loaded') === 'true') return;
      heroVideo.setAttribute('data-loaded', 'true');
      heroVideo.load();
      heroVideo.play();
    };
    
    // IntersectionObserver API ile görüntüye girdiğinde yükle
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadVideo();
          observer.unobserve(heroVideo);
        }
      });
    });
    
    observer.observe(heroVideo);
    
    // Yedek olarak kullanıcı etkileşimi durumunda yükle
    window.addEventListener('scroll', loadVideo, {once: true});
    window.addEventListener('mousemove', loadVideo, {once: true});
    window.addEventListener('touchstart', loadVideo, {once: true});
  }
});
