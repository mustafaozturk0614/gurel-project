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

// Ana başlatma fonksiyonu
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
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
        const isScrolled = scrollTop > SCROLL_SETTINGS.threshold;
        const opacity = Math.min(scrollTop / SCROLL_SETTINGS.threshold * SCROLL_SETTINGS.headerOpacity, SCROLL_SETTINGS.headerOpacity);
        const blur = Math.min(scrollTop / SCROLL_SETTINGS.threshold * SCROLL_SETTINGS.blurAmount, SCROLL_SETTINGS.blurAmount);

        header.classList.toggle('scrolled', isScrolled);
        header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
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

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navCollapse?.classList.contains('show')) {
                navCollapse.classList.remove('show');
                navToggler?.classList.remove('active');
                navToggler?.setAttribute('aria-expanded', 'false');
            }
        });
    });

    navToggler?.addEventListener('click', function() {
        this.classList.toggle('active');
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
            button.addEventListener(eventType, () => {
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
