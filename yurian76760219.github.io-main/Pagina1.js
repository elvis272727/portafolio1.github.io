// Configuración y elementos del DOM
const CONFIG = {
    modal: {
        fadeInDuration: 300,
        fadeOutDuration: 200
    },
    darkMode: {
        storageKey: 'darkModeEnabled'
    }
};

class PortfolioApp {
    constructor() {
        this.modal = document.getElementById("modal");
        this.modalTitle = document.getElementById("modal-title");
        this.modalMessage = document.getElementById("modal-message");
        this.closeModalBtn = document.querySelector(".close-btn");
        this.showModalButtons = document.querySelectorAll(".show-modal");
        this.toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDarkModePreference();
        this.addLoadingAnimations();
    }

    setupEventListeners() {
        // Modal events
        this.showModalButtons.forEach(button => {
            button.addEventListener("click", (e) => this.handleShowModal(e, button));
        });

        this.closeModalBtn.addEventListener("click", () => this.hideModal());
        
        window.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Cerrar modal con tecla Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.modal.style.display === "flex") {
                this.hideModal();
            }
        });

        // Dark mode toggle
        if (this.toggleDarkModeBtn) {
            this.toggleDarkModeBtn.addEventListener("click", (e) => this.toggleDarkMode(e));
        }

        // Smooth scrolling para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Animaciones al hacer scroll
        this.setupScrollAnimations();
    }

    handleShowModal(event, button) {
        event.preventDefault();
        
        try {
            const title = button.getAttribute("data-title");
            const message = button.getAttribute("data-message");

            if (!title || !message) {
                console.warn('Modal data attributes missing');
                return;
            }

            this.showModal(title, message);
        } catch (error) {
            console.error('Error showing modal:', error);
        }
    }

    showModal(title, message) {
        if (!this.modal || !this.modalTitle || !this.modalMessage) return;

        // Establecer contenido
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;

        // Mostrar modal con animación
        this.modal.style.display = "flex";
        this.modal.style.opacity = "0";
        
        // Forzar reflow para la animación
        this.modal.offsetHeight;
        
        this.modal.style.transition = `opacity ${CONFIG.modal.fadeInDuration}ms ease`;
        this.modal.style.opacity = "1";

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        // Focus en el modal para accesibilidad
        this.modal.focus();
    }

    hideModal() {
        if (!this.modal) return;

        this.modal.style.transition = `opacity ${CONFIG.modal.fadeOutDuration}ms ease`;
        this.modal.style.opacity = "0";

        setTimeout(() => {
            this.modal.style.display = "none";
            document.body.style.overflow = '';
        }, CONFIG.modal.fadeOutDuration);
    }

    toggleDarkMode(event) {
        event.preventDefault();
        
        document.body.classList.toggle("dark-mode");
        
        // Guardar preferencia
        const isDarkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem(CONFIG.darkMode.storageKey, isDarkMode);

        // Feedback visual
        this.addToggleEffect(event.target);
    }

    loadDarkModePreference() {
        const savedPreference = localStorage.getItem(CONFIG.darkMode.storageKey);
        
        if (savedPreference === 'true') {
            document.body.classList.add("dark-mode");
        }
    }

    addToggleEffect(element) {
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.feature-box').forEach(box => {
            box.style.opacity = '0';
            box.style.transform = 'translateY(30px)';
            box.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(box);
        });
    }

    addLoadingAnimations() {
        // Animación de entrada para elementos principales
        const elementsToAnimate = [
            { selector: '.intro', delay: 100 },
            { selector: '.container', delay: 200 }
        ];

        elementsToAnimate.forEach(({ selector, delay }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay);
            }
        });
    }
}

// Utilidades adicionales
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Performance optimizations
const performanceOptimizations = {
    // Lazy loading para imágenes
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    // Preload recursos críticos
    preloadCriticalResources() {
        const criticalResources = [
            'Pagina1.css',
            'Iconos/programming.svg'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = resource.endsWith('.css') ? 'style' : 'image';
            link.href = resource;
            document.head.appendChild(link);
        });
    }
};

// Efectos visuales adicionales
class VisualEffects {
    static addParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.feature-box');
        
        const handleScroll = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach((element, index) => {
                const speed = (index % 3 + 1) * 0.1;
                element.style.transform = `translateY(${rate * speed}px)`;
            });
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    static addMouseFollowEffect() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #ff0033, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(cursor);

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.opacity = '0.7';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();
    }

    static addButtonRippleEffect() {
        document.querySelectorAll('.custom-button').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Agregar CSS para la animación del ripple
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            .custom-button {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
}

// Sistema de notificaciones
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.style.cssText = `
            background: linear-gradient(135deg, #1a0000, #2d1b1b);
            border: 2px solid #ff0033;
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(255, 0, 51, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 300px;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 500;
        `;
        notification.textContent = message;

        this.container.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);

        return notification;
    }
}

// Error handling global
class ErrorHandler {
    static init() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            // Aquí podrías enviar errores a un servicio de logging
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            e.preventDefault();
        });
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Inicializar aplicación principal
        const app = new PortfolioApp();
        
        // Inicializar sistemas adicionales
        ErrorHandler.init();
        performanceOptimizations.initLazyLoading();
        performanceOptimizations.preloadCriticalResources();
        
        // Efectos visuales (opcional, se puede activar/desactivar)
        const enableAdvancedEffects = true;
        
        if (enableAdvancedEffects) {
            VisualEffects.addButtonRippleEffect();
            
            // Efectos que requieren más recursos
            if (window.innerWidth > 768) {
                VisualEffects.addMouseFollowEffect();
                VisualEffects.addParallaxEffect();
            }
        }

        // Sistema de notificaciones
        window.notifications = new NotificationSystem();
        
        // Mostrar notificación de bienvenida
        setTimeout(() => {
            window.notifications.show('¡Bienvenido al portafolio de Yurian!', 'info', 4000);
        }, 1000);

        console.log('Portfolio app initialized successfully');
        
    } catch (error) {
        console.error('Error initializing portfolio app:', error);
        
        // Fallback básico si hay errores
        const basicModal = document.getElementById("modal");
        const showModalButtons = document.querySelectorAll(".show-modal");
        
        if (basicModal && showModalButtons.length > 0) {
            showModalButtons.forEach(button => {
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    basicModal.style.display = "flex";
                });
            });
            
            const closeBtn = basicModal.querySelector(".close-btn");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    basicModal.style.display = "none";
                });
            }
        }
    }
});

// Optimización para dispositivos móviles
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Aquí podrías registrar un service worker si decides implementar PWA
        console.log('Service worker support detected');
    });
}

// Exportar para debugging (solo en development)
if (typeof window !== 'undefined') {
    window.PortfolioDebug = {
        PortfolioApp,
        Utils,
        VisualEffects,
        NotificationSystem
    };
}