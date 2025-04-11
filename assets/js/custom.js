// JavaScript for Gürel Yönetim Website

// When the document is ready
$(document).ready(function() {
    
    // Navigation menu active state
    $('.navbar-nav .nav-link').on('click', function() {
        $('.navbar-nav .nav-link').removeClass('active');
        $(this).addClass('active');
        
        // Close mobile menu when clicked
        $('.navbar-collapse').collapse('hide');
    });
    
    // Change navbar background on scroll
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        if (scroll >= 80) {
            $('.navbar').addClass('scrolled');
            // Navbar scrolled olduğunda menü öğeleri koyu renk
            $('.navbar-nav .nav-link').css({
                'color': '#333333',
                'text-shadow': 'none',
                'font-weight': '600'
            });
            // Hover ve active durumları için
            $('.navbar-nav .nav-link:hover, .navbar-nav .nav-link.active').css({
                'color': '#007bff',
                'text-shadow': 'none'
            });
        } else {
            $('.navbar').removeClass('scrolled');
            // Navbar scroll olmadığında menü öğeleri beyaz
            $('.navbar-nav .nav-link').css({
                'color': '#ffffff',
                'text-shadow': '0 2px 3px rgba(0, 0, 0, 0.6)',
                'font-weight': '700'
            });
            // Hover ve active durumları için
            $('.navbar-nav .nav-link:hover, .navbar-nav .nav-link.active').css({
                'color': '#ffffff',
                'text-shadow': '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.5)'
            });
        }
        
        // Enhanced header transparency effect - maintain transparency
        if (scroll < 80) {
            // Fully transparent at top
            $('.navbar').css({
                'background-color': 'transparent',
                'box-shadow': 'none'
            });
        } else if (scroll < 300) {
            // Subtle transparent glass effect
            var blurValue = Math.min(5, (scroll - 80) / 40);
            $('.navbar:not(.scrolled)').css({
                'background-color': 'rgba(255, 255, 255, 0.1)',
                'backdrop-filter': `blur(${blurValue}px)`,
                'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.05)'
            });
        }
    });
    
    // Auto-switch hero slides
    let currentSlide = 1;
    const totalSlides = $('.hero-slide').length;
    
    function showSlide(slideNum) {
        $('.hero-slide').hide();
        $('#slide' + slideNum).fadeIn(1000);
    }
    
    function nextSlide() {
        currentSlide++;
        if (currentSlide > totalSlides) {
            currentSlide = 1;
        }
        showSlide(currentSlide);
    }
    
    // Initial setup: show first slide, hide others
    $('.hero-slide').hide();
    $('#slide1').show();
    
    // Change slide every 5 seconds
    setInterval(nextSlide, 5000);
    
    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        
        const target = this.hash;
        const $target = $(target);
        
        $('html, body').animate({
            'scrollTop': $target.offset().top - 80
        }, 800, 'swing');
    });
    
    // Form submission
    $('#contactForm').on('submit', function(e) {
        e.preventDefault();
        
        // Here you would add your AJAX code to submit the form
        // For now, just show a success message
        $(this).html('<div class="alert alert-success">Thank you for your message! We will get back to you soon.</div>');
    });
    
    // Mobil cihazlarda tıklama ile detayların görünmesini sağlama
    $('.hero-half').click(function() {
        if ($(window).width() > 991) {
            $('.hero-half').removeClass('active');
            $(this).addClass('active');
        }
    });
    
    // Sayfanın yüklenme anında
    setTimeout(function() {
        if ($(window).width() > 991) {
            // Hero section'ların başlangıç durumunu ayarla
            $('.hero-half').css('flex', '1');
        }
    }, 100);
    
    // Hero hover efektleri düzeltme
    $('.hero-half').hover(
        function() {
            if ($(window).width() > 991) {
                $(this).css('flex', '3');
                $(this).siblings('.hero-half').css('flex', '1');
            }
        },
        function() {
            if ($(window).width() > 991) {
                $('.hero-half').css('flex', '1');
            }
        }
    );
    
    // Her bir bölüm için pozisyon kontrolü
    $(window).scroll(function() {
        var scrollPos = $(window).scrollTop();
        
        // Her section için kontrolü yap
        $('section[id]').each(function() {
            var sectionTop = $(this).offset().top - 100;
            var sectionId = $(this).attr('id');
            
            if (scrollPos >= sectionTop) {
                $('.navbar-nav .nav-link').removeClass('active');
                $('.navbar-nav .nav-link[href="#' + sectionId + '"]').addClass('active');
            }
        });
    });
    
    // Sayfa yüklendiğinde mobil menünün kapalı olmasını sağla
    $('.navbar-collapse').collapse('hide');
    
    // Navbar link tıklamalarında otomatik kapanma
    $('.navbar-nav .nav-link').click(function() {
        $('.navbar-collapse').collapse('hide');
    });
    
    // Dropdown menu açıldığında ek stil ekle/çıkar
    $('.dropdown').on('show.bs.dropdown', function() {
        $(this).find('.nav-link').addClass('show');
    }).on('hide.bs.dropdown', function() {
        $(this).find('.nav-link').removeClass('show');
    });
});

// Brand switching functions - Düzeltilmiş hali
function changeBrand1() {
    // Sadece metin değişikliği
    document.getElementById('brandText1').innerText = "Gürel Yönetim";
    
    // Logo değişikliği (opsiyonel)
    document.querySelector('.navbar-brand img').src = "assets/images/logo1.jpeg";
    
    // Hero section her zaman ikili görünür kalacak
    document.getElementById('site-management').style.display = "flex";
    document.getElementById('property-management').style.display = "flex";
    
    // Site Management aktif olsun, daha geniş gösterilsin
    if (window.innerWidth > 991) {
        document.getElementById('site-management').style.flex = "2";
        document.getElementById('property-management').style.flex = "1";
    }
}

function changeBrand2() {
    // Sadece metin değişikliği
    document.getElementById('brandText1').innerText = "Gürel Mülk Yönetim";
    
    // Logo değişikliği (opsiyonel, farklı bir logo varsa)
    // document.querySelector('.navbar-brand img').src = "assets/images/logo2.jpeg";
    
    // Hero section her zaman ikili görünür kalacak
    document.getElementById('site-management').style.display = "flex";
    document.getElementById('property-management').style.display = "flex";
    
    // Property Management aktif olsun, daha geniş gösterilsin
    if (window.innerWidth > 991) {
        document.getElementById('site-management').style.flex = "1";
        document.getElementById('property-management').style.flex = "2";
    }
}

// Harita Bölümü için Etkileşimler
document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklendiğinde area-badge elementlerine animasyon ekleyelim
    const areaBadges = document.querySelectorAll('.area-badge');
    areaBadges.forEach((badge, index) => {
        setTimeout(() => {
            badge.style.opacity = "1";
            badge.style.transform = "translateY(0)";
        }, 300 * index);
    });
    
    // Haritayı görüntüleyen scroll event listener'ı
    const mapSection = document.getElementById('map-section');
    const mapFrame = document.querySelector('.map-frame');
    
    if (mapSection && mapFrame) {
        window.addEventListener('scroll', function() {
            const rect = mapSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top < windowHeight && rect.bottom > 0) {
                const scrollProgress = 1 - (rect.top / windowHeight);
                const rotateValue = -2 + (scrollProgress * 2);
                const scaleValue = 1 + (scrollProgress * 0.02);
                
                mapFrame.style.transform = `rotate(${rotateValue}deg) scale(${scaleValue})`;
            }
        });
    }
});

// Footer tag animasyonları için
document.addEventListener('DOMContentLoaded', function() {
    // Tüm bölge etiketlerini seçin
    const regionTags = document.querySelectorAll('.region-tag');
    
    // Sayfa yüklendiğinde etiketleri animate edin
    regionTags.forEach((tag, index) => {
        setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, 100 * index);
    });
    
    // Rastgele dans efekti
    setInterval(() => {
        const randomTag = regionTags[Math.floor(Math.random() * regionTags.length)];
        randomTag.classList.add('tag-dance');
        
        setTimeout(() => {
            randomTag.classList.remove('tag-dance');
        }, 1000);
    }, 3000);
});

// Ekleyin: Tag dans efekti için CSS keyframes animasyonu
const style = document.createElement('style');
style.textContent = `
    @keyframes tagDance {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-5px) rotate(-2deg); }
        75% { transform: translateY(-5px) rotate(2deg); }
    }
    
    .tag-dance {
        animation: tagDance 1s ease;
    }
`;
document.head.appendChild(style);

// Kompakt tagler için sadeleştirilmiş animasyon
document.addEventListener('DOMContentLoaded', function() {
    const compactTags = document.querySelectorAll('.compact-tag');
    
    // Rastgele taglere animasyon ekleme
    setInterval(() => {
        // Rastgele bir tag seç
        const randomIndex = Math.floor(Math.random() * compactTags.length);
        const randomTag = compactTags[randomIndex];
        
        // Pulse efekti ekle
        randomTag.classList.add('pulse');
        
        // Kısa süre sonra efekti kaldır
        setTimeout(() => {
            randomTag.classList.remove('pulse');
        }, 600);
    }, 2000);
});

// Bölgeler için animasyon
document.addEventListener('DOMContentLoaded', function() {
    // Animasyon için elemenleri seç
    const regionCards = document.querySelectorAll('.region-card.animate');
    
    // IntersectionObserver ayarla
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.dataset.animationDelay || 0;
                const animation = el.dataset.animation || 'fade-up';
                
                setTimeout(() => {
                    el.classList.add(animation);
                    el.style.opacity = '1';
                }, delay);
                
                observer.unobserve(el);
            }
        });
    }, observerOptions);
    
    // Her kartı gözlemle
    regionCards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
    
    // Mini region tagleri için float animasyonları
    const miniTags = document.querySelectorAll('.mini-region-tag');
    miniTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.5}s`;
    });
});

// Bölge Haritası İnteraktif Özellikler
document.addEventListener('DOMContentLoaded', function() {
    // Sayı sayma animasyonu
    const counters = document.querySelectorAll('.counter');
    
    function startCounting() {
        counters.forEach(counter => {
            const target = +counter.innerText;
            const increment = target / 100;
            
            let count = 0;
            const updateCounter = () => {
                if (count < target) {
                    count += increment;
                    counter.innerText = Math.ceil(count);
                    setTimeout(updateCounter, 10);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCounter();
        });
    }
    
    // Sayma animasyonunu tetikle - Scroll ile veya sayfa yüklendiğinde
    const statsSection = document.querySelector('.region-details-panel');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounting();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (statsSection) {
        observer.observe(statsSection);
    }
    
    // Mobil görünüm için Swiper carousel
    if (document.querySelector('.regions-swiper')) {
        new Swiper('.regions-swiper', {
            slidesPerView: 1.2,
            spaceBetween: 15,
            centeredSlides: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            breakpoints: {
                480: {
                    slidesPerView: 1.5,
                    spaceBetween: 20
                },
                576: {
                    slidesPerView: 2.2,
                    spaceBetween: 20,
                    centeredSlides: false
                }
            }
        });
    }
});

// Paralax efekti için
document.addEventListener('DOMContentLoaded', function() {
    // Scroll Detection for Navbar
    window.addEventListener('scroll', function() {
        let navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Parallax Effect for Hero Section - improved for performance
    if (window.innerWidth > 768) {
        const parallaxSections = document.querySelectorAll('.parallax-section');
        const floatingShapes = document.querySelectorAll('.floating-shape');
        const floatingIcons = document.querySelectorAll('.floating-icon');
        
        document.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            // More efficient way to animate floating shapes
            floatingShapes.forEach(function(shape) {
                const speed = parseFloat(shape.getAttribute('data-speed')) || 0.05;
                const x = (mouseX - 0.5) * speed * 100;
                const y = (mouseY - 0.5) * speed * 100;
                shape.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
            
            // Animate floating icons with a different effect
            floatingIcons.forEach(function(icon) {
                const x = (mouseX - 0.5) * 20;
                const y = (mouseY - 0.5) * 20;
                icon.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${x}deg)`;
            });
            
            // Subtle background parallax effect
            parallaxSections.forEach(function(section) {
                const x = (mouseX - 0.5) * -5;
                const y = (mouseY - 0.5) * -5;
                section.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
            });
        });
    }
    
    // Enhanced Hero hover interaction
    const heroHalves = document.querySelectorAll('.hero-half');
    
    heroHalves.forEach(half => {
        half.addEventListener('mouseenter', function() {
            if (window.innerWidth > 991) {
                heroHalves.forEach(h => h.style.flex = '0.8');
                this.style.flex = '1.4';
            }
        });
    });
    
    // Reset when leaving the hero section
    const heroSection = document.querySelector('.advanced-hero');
    heroSection.addEventListener('mouseleave', function() {
        if (window.innerWidth > 991) {
            heroHalves.forEach(h => h.style.flex = '1');
        }
    });
    
    // Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Add interaction for compact scroll indicator
document.addEventListener('DOMContentLoaded', function() {
    const scrollIndicator = document.querySelector('.compact-scroll-indicator');
    const heroSection = document.querySelector('.advanced-hero');
    
    if (scrollIndicator && heroSection) {
        // Fade in the indicator after a short delay
        setTimeout(() => {
            scrollIndicator.style.opacity = '1';
        }, 1000);
        
        // Scroll down when clicked
        scrollIndicator.addEventListener('click', function() {
            const heroHeight = heroSection.offsetHeight;
            window.scrollTo({
                top: heroHeight - 80,
                behavior: 'smooth'
            });
        });
        
        // Hide indicator when scrolled
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'all';
            }
        });
        
        // Add subtle hover effect
        scrollIndicator.addEventListener('mouseenter', function() {
            this.querySelector('.scroll-arrow-container').style.transform = 'scale(1.08)';
        });
        
        scrollIndicator.addEventListener('mouseleave', function() {
            this.querySelector('.scroll-arrow-container').style.transform = 'scale(1)';
        });
    }
    
    // Animate transition between sections
    const transitionFloatElements = document.querySelectorAll('.floating-circle, .floating-square');
    
    if (transitionFloatElements.length > 0) {
        // Set initial state
        transitionFloatElements.forEach(el => {
            el.style.opacity = '0';
        });
        
        // Animation on scroll
        window.addEventListener('scroll', function() {
            const aboutSectionTop = document.querySelector('#about').getBoundingClientRect().top;
            
            // When approaching the about section
            if (aboutSectionTop < window.innerHeight && aboutSectionTop > 0) {
                const scrollProgress = 1 - (aboutSectionTop / window.innerHeight);
                
                // Trigger animations based on scroll position
                transitionFloatElements.forEach(el => {
                    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;
                    setTimeout(() => {
                        el.style.opacity = '1';
                    }, delay * 1000);
                });
            }
        });
    }
});

// Particle.js Configuration for Hero Section
document.addEventListener("DOMContentLoaded", function() {
    // Initialize Particles.js for modern background effect
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }

    // Enhanced Parallax Effect
    const parallaxElements = document.querySelectorAll('.parallax-section');
    
    window.addEventListener('scroll', function() {
        let scrollPosition = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const depth = element.getAttribute('data-depth') || 0.2;
            const movement = -(scrollPosition * depth);
            element.style.transform = `translate3d(0, ${movement}px, 0)`;
        });
    });

    // Animate elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animated');
            }
        });
    };

    // Initial check for elements in view
    animateOnScroll();
    
    // Check for elements as user scrolls
    window.addEventListener('scroll', animateOnScroll);

    // Floating shapes parallax effect
    document.addEventListener('mousemove', function(e) {
        const heroSection = document.querySelector('.advanced-hero');
        
        if (heroSection) {
            const shapes = heroSection.querySelectorAll('.floating-shape');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            shapes.forEach(shape => {
                const speed = parseFloat(shape.getAttribute('data-speed')) || 0.05;
                const x = (mouseX - 0.5) * speed * 100;
                const y = (mouseY - 0.5) * speed * 100;
                
                shape.style.transform = `translate(${x}px, ${y}px)`;
            });
        }
    });
});

// Handle the hero section for mobile devices
function setupHeroMobile() {
    const width = window.innerWidth;
    const heroHalves = document.querySelectorAll('.hero-half');
    
    if (width < 992) {
        heroHalves.forEach(half => {
            half.classList.add('active');
        });
    } else {
        heroHalves.forEach(half => {
            if (!half.matches(':hover')) {
                half.classList.remove('active');
            }
        });
    }
}

// Run setup on load and resize
window.addEventListener('load', setupHeroMobile);
window.addEventListener('resize', setupHeroMobile);

// Handle hero half hover for desktop
const heroHalves = document.querySelectorAll('.hero-half');
heroHalves.forEach(half => {
    half.addEventListener('mouseenter', function() {
        if (window.innerWidth >= 992) {
            this.classList.add('active');
        }
    });
    
    half.addEventListener('mouseleave', function() {
        if (window.innerWidth >= 992) {
            this.classList.remove('active');
        }
    });
});

// DOM yüklendikten sonra çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // SVG yüksekliklerini düzeltme - footer ve section geçişlerindeki taşmaları önler
    fixSvgOverflow();
    
    // Takım kartlarını eşit yükseklikte yap
    equalizeTeamCards();
    
    // Scroll animasyonlarını başlat
    initScrollAnimations();
    
    // Responsive düzeltmeler
    handleResponsiveIssues();
    
    // Resize olayında düzeltmeleri yeniden uygula
    window.addEventListener('resize', function() {
        fixSvgOverflow();
        equalizeTeamCards();
        handleResponsiveIssues();
    });
});

/**
 * SVG elemanlarının taşmasını önler ve düzgün görüntülenmesini sağlar
 */
function fixSvgOverflow() {
    // Footer ve bölüm geçişlerindeki SVG'leri seç
    const svgElements = document.querySelectorAll('.team-wave-bottom svg, .bg-wave svg, .map-shape-bottom svg, .map-shape-top svg, .section-transition svg');
    
    // Her SVG için düzeltmeleri uygula
    svgElements.forEach(svg => {
        // SVG'nin display özelliğini block yap
        svg.style.display = 'block';
        
        // SVG'nin vertical-align özelliğini bottom yap
        svg.style.verticalAlign = 'bottom';
        
        // SVG'nin üst parent elementinin overflow özelliğini hidden yap
        if (svg.parentElement) {
            svg.parentElement.style.overflow = 'hidden';
            svg.parentElement.style.lineHeight = '0';
        }
    });
    
    // Özellikle footer'daki geçiş SVG'sinin düzgün hizalanmasını sağla
    const footerWaves = document.querySelectorAll('.service-areas-section .bg-wave');
    footerWaves.forEach(wave => {
        if (wave) {
            wave.style.bottom = '-2px';
        }
    });
    
    // Takım bölümündeki dalga düzeltmesi
    const teamWave = document.querySelector('.team-wave-bottom');
    if (teamWave) {
        teamWave.style.bottom = '-2px';
    }
}

/**
 * Takım kartlarını eşit yükseklikte yapar
 */
function equalizeTeamCards() {
    const teamCards = document.querySelectorAll('.team-member-card');
    if (teamCards.length === 0) return;
    
    // Önce tüm kartların yükseklik sınırlamasını kaldır
    teamCards.forEach(card => {
        card.style.height = 'auto';
    });
    
    // Mobil görünümde kartların eşitlenmesine gerek yok
    if (window.innerWidth < 768) return;
    
    // En yüksek kartın yüksekliğini bul
    let maxHeight = 0;
    teamCards.forEach(card => {
        maxHeight = Math.max(maxHeight, card.offsetHeight);
    });
    
    // Tüm kartların yüksekliğini eşitle
    teamCards.forEach(card => {
        card.style.height = maxHeight + 'px';
    });
}

/**
 * Sayfa kaydırıldığında animasyonları başlatır
 */
function initScrollAnimations() {
    // Gözlemlenecek elementleri seç
    const elements = document.querySelectorAll('.team-member-card, .testimonial-card, .service-card, .feature-card, .location-card');
    
    // IntersectionObserver yapılandırması
    const observerOptions = {
        root: null, // Viewport'u kullan
        rootMargin: '0px',
        threshold: 0.1 // Element %10 görünür olduğunda tetikle
    };
    
    // Element görünür olduğunda yapılacak işlemler
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element görünür olduğunda animasyonu başlat
                entry.target.classList.add('animate__animated');
                entry.target.classList.add('animate__fadeInUp');
                
                // Elementi bir daha gözlemleme
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Her elementi gözlemle
    elements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Responsive görünüm sorunlarını giderir
 */
function handleResponsiveIssues() {
    // Mobil görünümde footer düzenlemeleri
    if (window.innerWidth < 768) {
        // Footer başlıklarını ortala
        const footerTitles = document.querySelectorAll('.footer-item .title');
        footerTitles.forEach(title => {
            title.style.textAlign = 'center';
        });
        
        // Footer link listelerini ortala
        const navLinks = document.querySelectorAll('.nav-link.has-icon');
        navLinks.forEach(link => {
            link.style.justifyContent = 'center';
        });
        
        // Footer metinlerini ortala
        const footerTexts = document.querySelectorAll('.footer-text p');
        footerTexts.forEach(text => {
            text.style.textAlign = 'center';
        });
        
        // Takım kartları arası boşluğu düzenle
        const teamCards = document.querySelectorAll('.team-member-card');
        teamCards.forEach(card => {
            card.style.marginBottom = '30px';
        });
    } else {
        // Desktop görünümünde varsayılan stilleri geri yükle
        const footerTitles = document.querySelectorAll('.footer-item .title');
        footerTitles.forEach(title => {
            title.style.textAlign = '';
        });
        
        const navLinks = document.querySelectorAll('.nav-link.has-icon');
        navLinks.forEach(link => {
            link.style.justifyContent = '';
        });
        
        const footerTexts = document.querySelectorAll('.footer-text p');
        footerTexts.forEach(text => {
            text.style.textAlign = '';
        });
        
        const teamCards = document.querySelectorAll('.team-member-card');
        teamCards.forEach(card => {
            card.style.marginBottom = '20px';
        });
    }
    
    // Map bölümünde harita konteyneri düzeltmesi
    const mapContainer = document.querySelector('.map-container');
    const mapContentCard = document.querySelector('.map-content-card');
    
    if (mapContainer && mapContentCard) {
        if (window.innerWidth < 992) {
            // Mobil ve tablet görünümünde harita konteyneri margin düzeltmesi
            mapContainer.style.marginTop = '30px';
        } else {
            // Desktop görünümünde varsayılan stil
            mapContainer.style.marginTop = '0';
        }
    }
} 