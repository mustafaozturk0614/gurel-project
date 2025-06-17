/**
 * Gürel Yönetim - Header Scroll Effect
 * Bu script, sayfa aşağı kaydırıldığında header'ın görünümünü değiştirir
 * İlk açılışta transparan, scroll yapıldıkça solid background'a geçer
 */

document.addEventListener("DOMContentLoaded", function() {
    const header = document.querySelector('.patreon-header');
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    let lastScrollTop = 0;
    
    // Sayfa yüklendiğinde header'ı görünür yap
    setTimeout(function() {
        header.classList.add('visible');
    }, 100);
    
    // Scroll event listener
    window.addEventListener('scroll', function() {
        // Scroll pozisyonu
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Scroll progress bar'ı güncelle
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = scrollPercent + '%';
        }
        
        // Scroll durumuna göre header'ı güncelle
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Hamburger menü işlevselliği
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    
    if (hamburger && mobileMenu && mobileMenuOverlay) {
        // Hamburger menü tıklama olayı
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            document.documentElement.classList.toggle('mobile-menu-open');
            document.body.classList.toggle('mobile-menu-open');
        });
        
        // Overlay tıklama olayı
        mobileMenuOverlay.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.documentElement.classList.remove('mobile-menu-open');
            document.body.classList.remove('mobile-menu-open');
        });
        
        // Menü kapatma butonu
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.documentElement.classList.remove('mobile-menu-open');
                document.body.classList.remove('mobile-menu-open');
            });
        }
        
        // Mobil menü link tıklama
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.documentElement.classList.remove('mobile-menu-open');
                document.body.classList.remove('mobile-menu-open');
            });
        });
    }
    
    // Aktif menü öğesi belirleme - sayfa içi linklere göre
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = sectionId;
            }
        });
        
        // Desktop menu aktif sınıfı
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
        
        // Mobil menu aktif sınıfı
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}); 