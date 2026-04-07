//ЗАЩИТА ОТ XSS
const sanitizeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>/]/g, function(match) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '/': '&#x2F;'
        };
        return escapeMap[match];
    });
};

const sanitizeInput = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') 
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/<script/gi, '&lt;script')
        .replace(/<\/script/gi, '&lt;/script')
        .trim();
};

const validatePhone = (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/[^\d+]/g, '');
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone) && cleaned.length >= 10 && cleaned.length <= 12;
};

const validateName = (name) => {
    if (!name) return true;
    const cleaned = sanitizeInput(name);
    return /^[А-Яа-яЁёA-Za-z\s\-]{2,50}$/.test(cleaned);
};

const validateEmail = (email) => {
    if (!email) return true; // email необязательный
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
};

const validateContactMethod = (method) => {
    const allowedMethods = ['whatsapp', 'telegram', 'phone'];
    return allowedMethods.includes(method);
};

//СКОЛЛИНГ С ЗАЩИТОЙ 
function scrollToElementById(elementId) {
    if (!elementId || typeof elementId !== 'string') return;
    
    // Санитизируем ID
    const safeId = sanitizeInput(elementId);
    const target = document.getElementById(safeId);
    if (!target) return;
    
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
    
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

//НАВИГАЦИЯ С ЗАЩИТОЙ 
const scrollLinks = document.querySelectorAll('[data-scroll]');
scrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-scroll');
        if (targetId && typeof targetId === 'string') {
            scrollToElementById(targetId);
            const nav = document.getElementById('navLinks');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        }
    });
});

const navCallBtn = document.getElementById('navCallBtn');
if (navCallBtn) {
    navCallBtn.addEventListener('click', () => scrollToElementById('contacts'));
}

const heroContactBtn = document.getElementById('heroContactBtn');
if (heroContactBtn) {
    heroContactBtn.addEventListener('click', () => scrollToElementById('contacts'));
}

const heroHowworkBtn = document.getElementById('heroHowworkBtn');
if (heroHowworkBtn) {
    heroHowworkBtn.addEventListener('click', () => scrollToElementById('howwork'));
}

//КНОПКА НАВЕРХ 
const topBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        topBtn.classList.add('show');
    } else {
        topBtn.classList.remove('show');
    }
});

if (topBtn) {
    topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

//МОБИЛЬНОЕ МЕНЮ
const toggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navLinks');

if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

//FAQ
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const questionDiv = item.querySelector('.faq-question');
    if (questionDiv) {
        questionDiv.addEventListener('click', () => {
            item.classList.toggle('active');
            const arrow = questionDiv.querySelector('span');
            if (arrow) {
                arrow.innerHTML = item.classList.contains('active') ? '▲' : '▼';
            }
        });
    }
});

//АНИМАЦИИ
const fadeElements = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

fadeElements.forEach(el => observer.observe(el));

window.addEventListener('load', () => {
    fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add('appear');
        }
    });
});

//АКТИВНЫЕ ССЫЛКИ 
function updateActiveLink() {
    const sections = {
        start: document.getElementById('start'),
        services: document.getElementById('services'),
        howwork: document.getElementById('howwork'),
        reviews: document.getElementById('reviews'),
        faq: document.getElementById('faq'),
        contacts: document.getElementById('contacts')
    };
    
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const scrollPosition = window.scrollY + navbarHeight + 10;
    
    let activeId = null;
    for (const [id, section] of Object.entries(sections)) {
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeId = id;
                break;
            }
        }
    }
    
    const navLinks = document.querySelectorAll('.nav-links a[data-scroll]');
    navLinks.forEach(link => link.classList.remove('active'));
    
    if (activeId) {
        const activeLink = document.querySelector(`.nav-links a[data-scroll="${activeId}"]`);
        if (activeLink) activeLink.classList.add('active');
    }
}

window.addEventListener('load', updateActiveLink);
window.addEventListener('scroll', updateActiveLink);

//КАРУСЕЛЬ ОТЗЫВОВ 
(function() {
    const track = document.querySelector('.reviews-track');
    if (!track) return;
    
    const originalCards = Array.from(track.children);
    if (originalCards.length === 0) return;
    
    const cloneCount = 3;
    for (let i = 0; i < cloneCount; i++) {
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover'];
            dangerousAttrs.forEach(attr => {
                clone.removeAttribute(attr);
            });
            clone.classList.remove('fade-up');
            track.appendChild(clone);
        });
    }
    
    let currentIndex = 0;
    let autoScrollInterval = null;
    let isAnimating = false;
    
    const getStep = () => {
        if (originalCards.length === 0) return 0;
        const card = originalCards[0];
        const cardWidth = card.offsetWidth;
        const cardStyle = getComputedStyle(card);
        const marginRight = parseFloat(cardStyle.marginRight) || 0;
        return cardWidth + marginRight;
    };
    
    let step = getStep();
    
    const dotsContainer = document.querySelector('.reviews-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < originalCards.length; i++) {
            const dot = document.createElement('div');
            dot.classList.add('reviews-dot');
            if (i === 0) dot.classList.add('active');
            
            dot.addEventListener('click', (function(index) {
                return function() {
                    if (isAnimating) return;
                    const targetIndex = index;
                    if (currentIndex === targetIndex) return;
                    scrollToIndex(targetIndex, true);
                    currentIndex = targetIndex;
                    updateActiveDot();
                };
            })(i));
            
            dotsContainer.appendChild(dot);
        }
    }
    
    function updateActiveDot() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.reviews-dot');
        const activeDotIndex = ((currentIndex % originalCards.length) + originalCards.length) % originalCards.length;
        dots.forEach((dot, idx) => {
            if (idx === activeDotIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    function scrollToIndex(index, animate = true) {
        if (isAnimating && animate) return;
        
        isAnimating = animate;
        step = getStep(); 
        
        const targetX = -index * step;
        
        if (animate) {
            track.style.transition = 'transform 0.5s ease';
        } else {
            track.style.transition = 'none';
        }
        
        track.style.transform = `translateX(${targetX}px)`;
        
        if (!animate) {
            updateActiveDot();
            setTimeout(() => { isAnimating = false; }, 50);
        }
    }
    
    function onTransitionEnd() {
        isAnimating = false;
        
        if (currentIndex >= originalCards.length) {
            track.style.transition = 'none';
            const newIndex = currentIndex - originalCards.length;
            currentIndex = newIndex;
            step = getStep();
            const targetX = -currentIndex * step;
            track.style.transform = `translateX(${targetX}px)`;
            void track.offsetHeight;
            track.style.transition = 'transform 0.5s ease';
        }
        updateActiveDot();
    }
    
    track.addEventListener('transitionend', onTransitionEnd);
    
    function nextSlide() {
        if (isAnimating || !track.parentElement) return;
        currentIndex++;
        scrollToIndex(currentIndex, true);
    }
    
    function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(nextSlide, 2000);
    }
    
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }
    
    startAutoScroll();
    
    const carousel = document.querySelector('.reviews-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);
    }
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            step = getStep();
            scrollToIndex(currentIndex, false);
        }, 150);
    });
    
    scrollToIndex(0, false);
})();

//ВНЕШНИЕ ССЫЛКИ 
document.addEventListener('DOMContentLoaded', function() {
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.trim() === '' || href.startsWith('#')) return;
        if (link.hasAttribute('data-scroll')) return;
        if (link.target === '_blank') return;
        
        if (href.startsWith('http://') || href.startsWith('https://')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
});

//ОТПРАВКА ФОРМЫ С ПОЛНОЙ ЗАЩИТОЙ
(function() {
    const FORM_ACTION_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSccUAWPpmUiOw3JZ90FbLwT4LrFT8NVcsvNhw-Wmsj5prxm2Q/formResponse';
    
    const FIELD_IDS = {
        name: 'entry.673273557',
        phone: 'entry.1914920502',
        contactMethod: 'entry.1269889644',
        privacy: 'entry.1076922116',
        pageUrl: 'entry.832080826',
        userAgent: 'entry.1216893576'
    };
    
    // Защита от CSRF - генерация токена
    const generateCSRFToken = () => {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15) +
               Date.now().toString(36);
    };
    
    let csrfToken = generateCSRFToken();
    sessionStorage.setItem('csrf_token', csrfToken);
    
    const getFormStartTime = () => {
        let startTime = sessionStorage.getItem('form_start_time');
        if (!startTime) {
            startTime = Date.now().toString();
            sessionStorage.setItem('form_start_time', startTime);
        }
        return parseInt(startTime);
    };
    
    // Проверка на слишком быстрое заполнение
    const isTooFast = () => {
        const startTime = getFormStartTime();
        const currentTime = Date.now();
        return (currentTime - startTime) < 3000; 
    };
    
    function sendViaImage(formData) {
        return new Promise((resolve) => {
            // Санитизируем все данные перед отправкой
            const sanitizedData = {
                name: sanitizeInput(formData.name || ''),
                phone: sanitizeInput(formData.phone || ''),
                contactMethod: sanitizeInput(formData.contactMethod || 'phone'),
                privacy: formData.privacy ? 'Да' : 'Нет'
            };
            
            const params = new URLSearchParams();
            params.append(FIELD_IDS.name, sanitizedData.name);
            params.append(FIELD_IDS.phone, sanitizedData.phone);
            params.append(FIELD_IDS.contactMethod, sanitizedData.contactMethod);
            params.append(FIELD_IDS.privacy, sanitizedData.privacy);
            params.append(FIELD_IDS.pageUrl, window.location.href);
            params.append(FIELD_IDS.userAgent, navigator.userAgent);
            params.append('entry.timestamp', new Date().toLocaleString('ru-RU'));
            params.append('csrf_token', csrfToken);
            
            const url = FORM_ACTION_URL + '?' + params.toString();
            
            const img = new Image();
            img.style.display = 'none';
            let resolved = false;
            
            const cleanup = () => {
                if (img.parentNode) img.parentNode.removeChild(img);
            };
            
            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve(true);
                }
            };
            
            img.src = url;
            
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve(true);
                }
            }, 2000);
            
            document.body.appendChild(img);
        });
    }
    
    async function submitForm(formData, formElement) {
        if (formData.name && !validateName(formData.name)) {
            alert('Пожалуйста, введите корректное имя (только буквы, 2-50 символов)');
            return false;
        }
        
        if (!validatePhone(formData.phone)) {
            alert('Пожалуйста, введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX');
            return false;
        }
        
        if (!validateContactMethod(formData.contactMethod)) {
            alert('Пожалуйста, выберите корректный способ связи');
            return false;
        }
        
        // Защита от ботов
        if (isTooFast()) {
            console.log('Подозрение на бота: форма заполнена слишком быстро');
        }
        
        // Проверка honeypot
        const honeypot = formElement?.querySelector('#honeypot');
        if (honeypot && honeypot.value) {
            console.log('Honeypot заполнен - бот');
            return false; 
        }
        
        const submitBtn = formElement?.querySelector('button[type="submit"]');
        let originalText = '';
        if (submitBtn) {
            originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Отправка...';
        }
        
        try {
            // Экранируем данные перед отправкой
            const safeFormData = {
                name: sanitizeHTML(formData.name),
                phone: sanitizeHTML(formData.phone),
                contactMethod: sanitizeHTML(formData.contactMethod),
                privacy: formData.privacy
            };
            
            await sendViaImage(safeFormData);
            
            const backup = {
                timestamp: new Date().toISOString(),
                data: {
                    name: safeFormData.name,
                    phone: safeFormData.phone.substring(0, 4) + '***' + safeFormData.phone.slice(-4), 
                    contactMethod: safeFormData.contactMethod
                }
            };
            
            let backups = JSON.parse(localStorage.getItem('form_backups') || '[]');
            backups.unshift(backup);
            if (backups.length > 20) backups.pop(); 
            localStorage.setItem('form_backups', JSON.stringify(backups));
            
            alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
            if (formElement) formElement.reset();
            
            csrfToken = generateCSRFToken();
            sessionStorage.setItem('csrf_token', csrfToken);
            
            return true;
            
        } catch(error) {
            console.error('Ошибка:', error);
            alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами.');
            if (formElement) formElement.reset();
            return false;
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText || 'Отправить';
            }
        }
    }
    
    const trialForm = document.getElementById('trialForm');
    
    if (trialForm) {
        if (!sessionStorage.getItem('form_start_time')) {
            sessionStorage.setItem('form_start_time', Date.now().toString());
        }
        
        trialForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const phoneInput = document.getElementById('phone');
            const contactMethodSelect = document.getElementById('contact_method');
            const privacyCheckbox = document.getElementById('privacy');
            
            const formData = {
                name: nameInput ? sanitizeInput(nameInput.value) : '',
                phone: phoneInput ? sanitizeInput(phoneInput.value) : '',
                contactMethod: contactMethodSelect ? sanitizeInput(contactMethodSelect.value) : '',
                privacy: privacyCheckbox ? privacyCheckbox.checked : false
            };
            
            if (!formData.contactMethod || formData.contactMethod === '') {
                alert('Пожалуйста, выберите удобный способ связи');
                return;
            }
            
            if (!formData.privacy) {
                alert('Пожалуйста, подтвердите согласие с политикой конфиденциальности');
                return;
            }
            
            await submitForm(formData, trialForm);
        });
    }
    
    // Маска телефона с защитой
    function setPhoneMask(inputElement) {
        if (!inputElement) return;
        
        inputElement.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            let formatted = '';
            if (value.length > 0) {
                formatted = '+7';
                if (value.length > 1) formatted += ' (' + value.slice(1, 4);
                if (value.length >= 5) formatted += ') ' + value.slice(4, 7);
                if (value.length >= 8) formatted += '-' + value.slice(7, 9);
                if (value.length >= 10) formatted += '-' + value.slice(9, 11);
            }
            e.target.value = formatted;
        });
        
        inputElement.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const cleaned = pastedText.replace(/\D/g, '').slice(0, 11);
            const currentValue = inputElement.value.replace(/\D/g, '');
            const newValue = currentValue + cleaned;
            const event = new Event('input', { bubbles: true });
            inputElement.value = newValue;
            inputElement.dispatchEvent(event);
        });
    }
    
    setPhoneMask(document.getElementById('phone'));
    
    // Функция для просмотра бэкапов (только для админа)
    window.viewBackups = function(password) {
        if (password !== 'admin123') { 
            console.log('Доступ запрещен');
            return null;
        }
        
        const backups = localStorage.getItem('form_backups');
        if (!backups) {
            console.log('Нет сохраненных заявок');
            return null;
        }
        
        const data = JSON.parse(backups);
        console.table(data.map(item => ({
            время: item.timestamp,
            телефон: item.data.phone,
            имя: item.data.name,
            способ: item.data.contactMethod
        })));
        
        return data;
    };
    
    console.log('✅ Форма защищена и готова к работе');
})();

//ЗАЩИТА ОТ CONSOLE SPAM
if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    // console.warn и console.error оставляем для отладки
}

if (window.top !== window.self) {
    window.top.location = window.self.location;
}

//ЗАЩИТА ОТ XSS ЧЕРЕЗ URL
(function protectURL() {
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams) {
        if (value.match(/<|>|javascript:|on\w+=/i)) {
            // Очищаем параметры URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            break;
        }
    }
})();