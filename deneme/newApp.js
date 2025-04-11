// Document Ready Function
document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yükleme animasyonu
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 800); // Daha hızlı sayfa yükleme zamanı

    // Smooth Scroll kütüphanesi
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Header Scroll Davranışı
    const header = document.getElementById('main-header');
    let lastScrollTop = 0;
    let headerTimeout;

    function handleHeaderScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.remove('transparent');
            header.classList.add('solid');
        } else {
            header.classList.add('transparent');
            header.classList.remove('solid');
        }
        
        // Yukarı/aşağı scroll tespiti - performans iyileştirmesi için debounce eklendi
        clearTimeout(headerTimeout);
        headerTimeout = setTimeout(() => {
            if (scrollTop > lastScrollTop && scrollTop > 300) {
                // Aşağı kaydırma
                header.style.transform = 'translateY(-100%)';
            } else {
                // Yukarı kaydırma
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, 50);
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    // Özel İmleç - Sadece masaüstü cihazlarda göster
    const isMobile = window.innerWidth <= 768;
    const cursor = document.querySelector('.cursor');
    const cursorText = document.querySelector('.cursor-paragraph');
    
    if (cursor && !isMobile) {
        // Performans için throttle uygulayarak imleç hareketini optimize et
        let lastCursorUpdate = 0;
        
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastCursorUpdate > 10) { // 10ms throttle
                cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                lastCursorUpdate = now;
            }
        }, { passive: true });
        
        // Özel imleç davranışları
        const addCursorInteractions = () => {
            // Buton hover etkileşimleri
            const btns = document.querySelectorAll('.btn-animate-chars, .nav-link, .service-card');
            
            btns.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    cursor.classList.add('is-active');
                    cursorText.textContent = btn.getAttribute('data-cursor') || 'Tıkla';
                });
                
                btn.addEventListener('mouseleave', () => {
                    cursor.classList.remove('is-active');
                });
            });
            
            // Sürükle metni için
            const dragElements = document.querySelectorAll('[data-cursor="Sürükle"]');
            
            dragElements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    cursor.classList.add('is-active');
                    cursorText.textContent = 'Sürükle';
                });
                
                element.addEventListener('mouseleave', () => {
                    cursor.classList.remove('is-active');
                });
            });
        };
        
        addCursorInteractions();
    } else if (cursor) {
        // Mobil cihazlarda imleç özelliğini kaldır
        cursor.style.display = 'none';
    }

    // Sayfa içi bağlantıları LazyLoad ile yükle
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Animasyon Tetikleyiciler ve GSAP Animasyonları
    // Words Scale In Animation
    const wordsScaleInElements = document.querySelectorAll('[data-animate-txt="words-scale-in"]');
    
    wordsScaleInElements.forEach(element => {
        // Görünürlüğü sıfırla
        element.style.visibility = 'visible';
        
        // Her kelime için animasyon
        const words = element.querySelectorAll('.word');
        
        gsap.from(words, {
            opacity: 0,
            rotationX: -20,
            y: 50,
            duration: 1.2,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: element,
                start: "top bottom-=100",
                toggleActions: "play none none none"
            }
        });
    });

    // Lines Fade In Animation
    const linesFadeInElements = document.querySelectorAll('[data-animate-txt="lines-fade-in"]');
    
    linesFadeInElements.forEach(element => {
        // Görünürlüğü sıfırla
        element.style.visibility = 'visible';
        
        // Metni satırlara böl
        const text = element.innerHTML;
        element.innerHTML = "";
        
        const lines = text.split("<br>");
        
        lines.forEach(line => {
            const lineDiv = document.createElement('div');
            lineDiv.style.display = 'block';
            lineDiv.style.textAlign = 'start';
            lineDiv.style.position = 'relative';
            lineDiv.innerHTML = line;
            element.appendChild(lineDiv);
        });
        
        const lineDivs = element.querySelectorAll('div');
        
        gsap.from(lineDivs, {
            opacity: 0,
            y: 20,
            duration: 1,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top bottom-=100",
                toggleActions: "play none none none"
            }
        });
    });

    // Scale In Animation
    const scaleInElements = document.querySelectorAll('[data-animate-el="scale-in"]');
    
    scaleInElements.forEach(element => {
        // Görünürlüğü sıfırla
        element.style.visibility = 'visible';
        
        gsap.from(element, {
            opacity: 0,
            scale: 0.8,
            y: 50,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: element,
                start: "top bottom-=100",
                toggleActions: "play none none none"
            }
        });
    });

    // Marquee Animasyonları
    const setupMarquees = () => {
        const marqueeElements = document.querySelectorAll('.marquee-advanced');
        
        marqueeElements.forEach(marquee => {
            const direction = marquee.getAttribute('data-marquee-direction') || 'left';
            const speed = parseFloat(marquee.getAttribute('data-marquee-speed')) || 30;
            
            const scrollElement = marquee.querySelector('.marquee-advanced__scroll');
            const collections = marquee.querySelectorAll('.marquee-advanced__collection');
            
            // İlk koleksiyonu klonla
            if (collections.length === 1) {
                for (let i = 0; i < 2; i++) {
                    const clone = collections[0].cloneNode(true);
                    scrollElement.appendChild(clone);
                }
            }
            
            // Animasyon yönünü ve hızını ayarla
            const marqueeAnimation = () => {
                const width = collections[0].offsetWidth;
                
                gsap.to(collections, {
                    x: direction === 'left' ? `-${width}px` : `${width}px`,
                    duration: width / speed,
                    ease: 'none',
                    repeat: -1,
                    overwrite: true,
                    onComplete: () => {
                        gsap.set(collections, { x: 0 });
                    }
                });
            };
            
            marqueeAnimation();
            
            // Performans iyileştirmesi: debounce ile resize olayını optimize et
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(marqueeAnimation, 250);
            });
        });
    };
    
    setupMarquees();

    // Trail Efekti - Sadece masaüstü cihazlarda göster
    const setupTrailEffect = () => {
        const trailWrap = document.querySelector('.trail-wrap');
        
        if (!trailWrap || isMobile) return;
        
        const trailItems = trailWrap.querySelectorAll('.trail-item');
        const content = document.querySelector('.trail-content');
        
        if (!content || !trailItems.length) return;
        
        let active = false;
        let lastTrailUpdate = 0;
        
        content.addEventListener('mouseenter', () => {
            active = true;
            trailItems.forEach((item, i) => {
                gsap.to(item, {
                    opacity: 1,
                    scale: 0.6 + (i * 0.05),
                    duration: 0.6,
                    delay: i * 0.05
                });
            });
        });
        
        content.addEventListener('mousemove', (e) => {
            if (!active) return;
            
            const now = Date.now();
            if (now - lastTrailUpdate > 20) { // 20ms throttle
                const rect = content.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                trailItems.forEach((item, i) => {
                    gsap.to(item, {
                        x: mouseX,
                        y: mouseY,
                        scale: 0.6 - (i * 0.05),
                        duration: 0.6 + (i * 0.2),
                        ease: 'power2.out'
                    });
                });
                
                lastTrailUpdate = now;
            }
        }, { passive: true });
        
        content.addEventListener('mouseleave', () => {
            active = false;
            trailItems.forEach(item => {
                gsap.to(item, {
                    opacity: 0,
                    scale: 0.4,
                    duration: 0.6
                });
            });
        });
    };
    
    setupTrailEffect();

    // Swiper Tanımlama - Testimonial
    if (document.querySelector('.swiper.testimonial-slider')) {
        new Swiper('.swiper.testimonial-slider', {
            slidesPerView: 1,
            spaceBetween: 26,
            grabCursor: true,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
            breakpoints: {
                768: {
                    slidesPerView: 1.5,
                    spaceBetween: 26
                },
                992: {
                    slidesPerView: 2,
                    spaceBetween: 26
                }
            }
        });
    }

    // Hizmet Kartları için Hover Efekti
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            gsap.to(card.querySelector('.service-icon'), {
                y: -10,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            gsap.to(card.querySelector('.service-icon'), {
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    // Paralaks Efekti
    const createParallaxEffect = () => {
        const parallaxElements = document.querySelectorAll('.about-image, .service-image');
        
        parallaxElements.forEach(element => {
            ScrollTrigger.create({
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: self => {
                    const speed = element.getAttribute('data-speed') || 0.2;
                    const movement = -(self.progress * 100 * speed);
                    
                    gsap.to(element.querySelector('img'), {
                        y: movement,
                        ease: 'none',
                        duration: 0.1
                    });
                }
            });
        });
    };
    
    createParallaxEffect();

    // Yavaş Kaydırma - İç Linkler
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (!target) return;
            
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            
            lenis.scrollTo(targetPosition, {
                duration: 1.5,
                easing: (t) => 1 - Math.pow(1 - t, 5)
            });
        });
    });

    // İletişim Formu İşleme
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Form alanlarını temizle
            contactForm.reset();
            
            // Başarı mesajı göster
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success mt-3 fade-in-up';
            successMsg.innerHTML = 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.';
            contactForm.appendChild(successMsg);
            
            // 5 saniye sonra başarı mesajını kaldır
            setTimeout(() => {
                successMsg.remove();
            }, 5000);
            
            // Gerçek bir uygulamada burada form verilerini bir API'ye gönderebilirsiniz
            console.log('Form verileri:', formData);
        });
    }

    // Sayfa tamamen yüklendiğinde
    window.addEventListener('load', function() {
        // Sayfa yükleme animasyonunu bitir
        document.body.classList.add('page-loaded');
        
        // Servis kartları için giriş animasyonu
        const serviceCards = document.querySelectorAll('.service-card');
        
        gsap.from(serviceCards, {
            opacity: 0,
            y: 50,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top bottom-=100'
            }
        });
        
        // İstatistik sayaçları animasyonu
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(statNumber => {
            const targetValue = parseInt(statNumber.textContent);
            const plus = statNumber.textContent.includes('+') ? '+' : '';
            
            gsap.from(statNumber, {
                textContent: 0,
                duration: 2,
                ease: 'power2.out',
                snap: { textContent: 1 },
                scrollTrigger: {
                    trigger: statNumber,
                    start: 'top bottom-=100'
                },
                onUpdate: function() {
                    statNumber.textContent = Math.floor(this.targets()[0].textContent) + plus;
                }
            });
        });
    });
});
