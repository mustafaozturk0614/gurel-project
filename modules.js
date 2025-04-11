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
});

/**
 * Tab Sistemi İçin Gerekli Fonksiyonlar
 */
function initTabSystem() {
    const tabs = document.querySelectorAll('.service-tab');
    const tabContents = document.querySelectorAll('.service-tab-content');
    
    if (!tabs.length || !tabContents.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get tab id
            const tabId = this.getAttribute('data-tab');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabId).classList.add('active');
        });
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
 * Sayfa kaydırma olayları için fonksiyonlar
 */
function initScrollEvents() {
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.patreon-header');
        if (!header) return;
        
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            header.classList.remove('transparent');
        } else {
            header.classList.remove('scrolled');
            header.classList.add('transparent');
        }
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