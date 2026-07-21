/* =========================================================
   IMPÉRIO TEC AR CONDICIONADO — script.js
   Interações: navegação, animações, carrossel, FAQ, lightbox
   ========================================================= */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', () => {
        initHeader();
        initMobileMenu();
        initScrollAnimations();
        initCounters();
        initFAQ();
        initCarousel();
        initGalleryLightbox();
        initBackToTop();
        initSmoothScroll();
    });
    
    /* =========================================================
       1. HEADER — Sombra ao rolar
       ========================================================= */
    function initHeader() {
        const header = document.getElementById('header');
        if (!header) return;
        
        const toggleScrolled = () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        
        toggleScrolled();
        window.addEventListener('scroll', toggleScrolled, { passive: true });
    }
    
    /* =========================================================
       2. MOBILE MENU
       ========================================================= */
    function initMobileMenu() {
        const toggle = document.getElementById('menuToggle');
        const menu = document.getElementById('mobileMenu');
        if (!toggle || !menu) return;
        
        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen);
            const icon = toggle.querySelector('i');
            icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        });
        
        // Fecha o menu ao clicar em qualquer link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }
    
    /* =========================================================
       3. SCROLL ANIMATIONS — IntersectionObserver
       ========================================================= */
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.fade-on-scroll');
        if (!elements.length || !('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('visible'));
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -80px 0px'
        });
        
        elements.forEach(el => observer.observe(el));
    }
    
    /* =========================================================
       4. COUNTERS — Animação numérica ao entrar em vista
       ========================================================= */
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length || !('IntersectionObserver' in window)) return;
        
        const animate = (el) => {
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1500;
            const start = performance.now();
            
            const step = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Easing suave: easeOutExpo
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const current = Math.floor(eased * target);
                el.textContent = current.toLocaleString('pt-BR') + suffix;
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target.toLocaleString('pt-BR') + suffix;
            };
            
            requestAnimationFrame(step);
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(c => observer.observe(c));
    }
    
    /* =========================================================
       5. FAQ ACCORDION
       ========================================================= */
    function initFAQ() {
        const items = document.querySelectorAll('.faq-item');
        if (!items.length) return;
        
        items.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                
                // Fecha todos os outros
                items.forEach(other => {
                    other.classList.remove('open');
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                });
                
                // Abre o clicado (se estava fechado)
                if (!isOpen) {
                    item.classList.add('open');
                    question.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }
    
    /* =========================================================
       6. CARROSSEL DE DEPOIMENTOS
       ========================================================= */
    function initCarousel() {
        const track = document.getElementById('carouselTrack');
        const prev = document.querySelector('.carousel-prev');
        const next = document.querySelector('.carousel-next');
        const dotsContainer = document.getElementById('carouselDots');
        if (!track) return;
        
        const slides = track.querySelectorAll('.carousel-slide');
        if (!slides.length) return;
        
        const getSlideWidth = () => {
            const first = slides[0];
            const style = window.getComputedStyle(track);
            const gap = parseInt(style.gap, 10) || 20;
            return first.offsetWidth + gap;
        };
        
        const getVisibleSlides = () => {
            const trackWidth = track.offsetWidth;
            const slideWidth = getSlideWidth();
            return Math.max(1, Math.floor(trackWidth / slideWidth));
        };
        
        const scrollByAmount = (dir) => {
            const amount = getSlideWidth() * dir;
            track.scrollBy({ left: amount, behavior: 'smooth' });
        };
        
        if (prev) prev.addEventListener('click', () => scrollByAmount(-1));
        if (next) next.addEventListener('click', () => scrollByAmount(1));
        
        // Dots
        const buildDots = () => {
            if (!dotsContainer) return;
            const visible = getVisibleSlides();
            const totalPages = Math.max(1, Math.ceil(slides.length / visible));
            dotsContainer.innerHTML = '';
            
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Ir para grupo ${i + 1}`);
                dot.addEventListener('click', () => {
                    track.scrollTo({ left: i * visible * getSlideWidth(), behavior: 'smooth' });
                });
                dotsContainer.appendChild(dot);
            }
        };
        
        buildDots();
        
        // Update dots on scroll
        let scrollTimer;
        track.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                if (!dotsContainer) return;
                const visible = getVisibleSlides();
                const slideWidth = getSlideWidth();
                const currentPage = Math.round(track.scrollLeft / (visible * slideWidth));
                dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentPage);
                });
            }, 100);
        }, { passive: true });
        
        // Rebuild dots on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(buildDots, 200);
        });
        
        // Touch support / drag
        let isDown = false;
        let startX;
        let scrollLeft;
        
        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.style.cursor = 'grabbing';
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });
        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.style.cursor = '';
        });
        track.addEventListener('mouseup', () => {
            isDown = false;
            track.style.cursor = '';
        });
        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        });
    }
    
    /* =========================================================
       7. LIGHTBOX DA GALERIA
       ========================================================= */
    function initGalleryLightbox() {
        const items = document.querySelectorAll('[data-lightbox]');
        const lightbox = document.getElementById('lightbox');
        const content = document.getElementById('lightboxContent');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        
        if (!items.length || !lightbox) return;
        
        let currentIndex = 0;
        
        const show = (index) => {
            currentIndex = index;
            const item = items[index];
            const img = item.querySelector('img');
            
            if (img) {
                content.innerHTML = `<img src="${img.src}" alt="${img.alt || 'Foto ampliada'}">`;
            }
            
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };
        
        const hide = () => {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };
        
        const showNext = () => show((currentIndex + 1) % items.length);
        const showPrev = () => show((currentIndex - 1 + items.length) % items.length);
        
        items.forEach((item, idx) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                show(idx);
            });
        });
        
        if (closeBtn) closeBtn.addEventListener('click', hide);
        if (nextBtn) nextBtn.addEventListener('click', showNext);
        if (prevBtn) prevBtn.addEventListener('click', showPrev);
        
        // Fechar clicando no fundo
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) hide();
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') hide();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });
    }
    
    /* =========================================================
       8. BACK TO TOP
       ========================================================= */
    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        };
        
        toggleVisibility();
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    /* =========================================================
       9. SMOOTH SCROLL para âncoras
       ========================================================= */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#' || href.length < 2) return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top,
                    behavior: 'smooth'
                });
            });
        });
    }
    
})();
