/**
 * Shock Template - Temel JavaScript
 */

// Animasyon sınıfları için yardımcı fonksiyonlar
const Shock = {
    // Elemanı görünür olduğunda animasyon ekler
    animateOnScroll: function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {threshold: 0.1});
        
        elements.forEach(element => {
            observer.observe(element);
        });
    },
    
    // Sayfa yüklendiğinde çalışacak fonksiyonlar
    init: function() {
        this.animateOnScroll();
    }
};

// Sayfa yüklendiğinde Shock'u başlat
document.addEventListener('DOMContentLoaded', function() {
    Shock.init();
}); 