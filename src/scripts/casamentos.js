/* Scripts extraídos de casamentos.html */

// header scroll state
const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => {
    if(window.scrollY > 40){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  };
  document.addEventListener('scroll', onScroll);
  onScroll();
}

// mobile nav
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('active');
    mobileNav.classList.remove('open');
  }));
}

// reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, {threshold:.14});
revealEls.forEach(el => io.observe(el));

// lightbox
function initLightbox() {
  const galeriaImgs = Array.from(document.querySelectorAll('#galeriaGrid .g-item:not(.g-item-clone) img'));
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCount = document.getElementById('lbCount');
  let lbIndex = 0;

  if (lightbox && lbImg && galeriaImgs.length > 0) {
    function openLightbox(i){
      lbIndex = i;
      updateLightbox();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function updateLightbox(){
      const img = galeriaImgs[lbIndex];
      if (!img) return;
      const fullSrc = img.dataset.full || img.getAttribute('src') || '';
      lbImg.src = fullSrc;
      lbImg.alt = img.alt || '';
      if (lbCount) lbCount.textContent = (lbIndex+1) + ' / ' + galeriaImgs.length;
    }
    function closeLightbox(){
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    galeriaImgs.forEach((img,i) => {
      const parent = img.closest('.g-item');
      if (parent) {
        parent.style.cursor = 'pointer';
        parent.addEventListener('click', () => openLightbox(i));
      }
    });
    const lbClose = document.getElementById('lbClose');
    const lbNext = document.getElementById('lbNext');
    const lbPrev = document.getElementById('lbPrev');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); lbIndex = (lbIndex+1) % galeriaImgs.length; updateLightbox(); });
    if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); lbIndex = (lbIndex-1+galeriaImgs.length) % galeriaImgs.length; updateLightbox(); });
    lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if(!lightbox.classList.contains('open')) return;
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowRight' && lbNext) lbNext.click();
      if(e.key === 'ArrowLeft' && lbPrev) lbPrev.click();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLightbox);
} else {
  initLightbox();
}

// Carrossel da Seção Sobre
function initSobreCarousel() {
  const carousel = document.getElementById('sobreCarousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.slide');
  const dots = carousel.querySelectorAll('.dot');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');

  if (slides.length <= 1) return;

  let currentIndex = 0;

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

    currentIndex = (index + slides.length) % slides.length;

    slides[currentIndex].classList.add('active');
    if (dots[currentIndex]) dots[currentIndex].classList.add('active');
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSobreCarousel);
} else {
  initSobreCarousel();
}

// Custom Date Picker
function initCustomDatePickers() {
  const dateInputs = document.querySelectorAll('input[type="date"], input.custom-date-trigger');

  dateInputs.forEach(input => {
    if (input.dataset.customPickerInitialized) return;
    input.dataset.customPickerInitialized = 'true';

    input.setAttribute('type', 'text');
    input.setAttribute('readonly', 'true');
    if (!input.getAttribute('placeholder')) {
      input.setAttribute('placeholder', 'Selecione a data');
    }
    input.classList.add('custom-date-input');

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-datepicker-container';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const popup = document.createElement('div');
    popup.className = 'custom-calendar-popup';

    let currentDate = new Date();
    let selectedDate = null;

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    function renderCalendar() {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      let html = `
        <div class="calendar-header">
          <button type="button" class="cal-nav prev-month" aria-label="Mês anterior">&#8249;</button>
          <span class="cal-title">${monthNames[month]} ${year}</span>
          <button type="button" class="cal-nav next-month" aria-label="Próximo mês">&#8250;</button>
        </div>
        <div class="calendar-weekdays">
          ${dayNames.map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="calendar-days">
      `;

      for (let i = 0; i < firstDay; i++) {
        html += `<span class="empty-day"></span>`;
      }

      const today = new Date();
      today.setHours(0,0,0,0);

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const isPast = dateObj < today;
        const isToday = dateObj.getTime() === today.getTime();
        const isSelected = selectedDate && dateObj.getTime() === selectedDate.getTime();

        let classes = ['cal-day'];
        if (isPast) classes.push('disabled');
        if (isToday) classes.push('today');
        if (isSelected) classes.push('selected');

        html += `<button type="button" class="${classes.join(' ')}" data-day="${day}" ${isPast ? 'disabled' : ''}>${day}</button>`;
      }

      html += `</div>`;
      popup.innerHTML = html;

      popup.querySelector('.prev-month').addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
      });

      popup.querySelector('.next-month').addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
      });

      popup.querySelectorAll('.cal-day:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const day = parseInt(btn.dataset.day, 10);
          selectedDate = new Date(year, month, day);

          const yyyy = year;
          const mm = String(month + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');

          const formattedDisplay = `${dd}/${mm}/${yyyy}`;
          input.value = formattedDisplay;
          input.dispatchEvent(new Event('change', { bubbles: true }));

          closePopup();
        });
      });
    }

    function openPopup() {
      document.querySelectorAll('.custom-calendar-popup.open').forEach(p => p.classList.remove('open'));
      renderCalendar();
      popup.classList.add('open');
    }

    function closePopup() {
      popup.classList.remove('open');
    }

    wrapper.appendChild(popup);

    input.addEventListener('click', (e) => {
      e.stopPropagation();
      openPopup();
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        closePopup();
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomDatePickers);
} else {
  initCustomDatePickers();
}

// Mobile Gallery Carousel with Infinite Loop and Arrows
function initMobileGalleryCarousel() {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;

  const isMobile = window.innerWidth <= 860;
  
  let arrowsWrapper = document.querySelector('.galeria-arrows-wrapper');
  
  if (!isMobile) {
    if (arrowsWrapper) {
      arrowsWrapper.parentNode.insertBefore(grid, arrowsWrapper);
      arrowsWrapper.remove();
    }
    const clones = grid.querySelectorAll('.g-item-clone');
    clones.forEach(c => c.remove());
    
    grid.style.scrollBehavior = '';
    delete grid.dataset.scrollListenerAdded;
    delete grid.dataset.initializedScroll;
    return;
  }

  // Target original items excluding clones
  let items = Array.from(grid.querySelectorAll('.g-item:not(.g-item-clone)'));
  if (items.length <= 1) return;

  let firstClone = grid.querySelector('.g-item-clone-first');
  let lastClone = grid.querySelector('.g-item-clone-last');

  if (!firstClone && !lastClone) {
    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    firstClone = firstItem.cloneNode(true);
    firstClone.classList.add('g-item-clone', 'g-item-clone-first');
    
    lastClone = lastItem.cloneNode(true);
    lastClone.classList.add('g-item-clone', 'g-item-clone-last');

    // Lightbox click delegation on clones
    firstClone.addEventListener('click', () => {
      const clickEvent = new MouseEvent('click', { bubbles: true });
      firstItem.dispatchEvent(clickEvent);
    });
    lastClone.addEventListener('click', () => {
      const clickEvent = new MouseEvent('click', { bubbles: true });
      lastItem.dispatchEvent(clickEvent);
    });

    grid.appendChild(firstClone);
    grid.insertBefore(lastClone, grid.firstChild);
  }

  // Get current visual elements including clones
  const getVisualItems = () => [
    grid.querySelector('.g-item-clone-last'),
    ...Array.from(grid.querySelectorAll('.mosaic-block .g-item')),
    grid.querySelector('.g-item-clone-first')
  ].filter(Boolean);

  // Position at original first item initially (index 1)
  if (!grid.dataset.initializedScroll) {
    setTimeout(() => {
      const vItems = getVisualItems();
      if (vItems[1]) {
        grid.scrollLeft = vItems[1].offsetLeft;
        grid.dataset.initializedScroll = 'true';
      }
    }, 100);
  }

  // Build arrow navigation
  if (!arrowsWrapper) {
    arrowsWrapper = document.createElement('div');
    arrowsWrapper.className = 'galeria-arrows-wrapper';
    
    grid.parentNode.insertBefore(arrowsWrapper, grid);
    arrowsWrapper.appendChild(grid);

    const prevBtn = document.createElement('button');
    prevBtn.className = 'galeria-arrow galeria-prev';
    prevBtn.innerHTML = '&#8249;';
    prevBtn.setAttribute('aria-label', 'Foto anterior');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'galeria-arrow galeria-next';
    nextBtn.innerHTML = '&#8250;';
    nextBtn.setAttribute('aria-label', 'Próxima foto');

    arrowsWrapper.appendChild(prevBtn);
    arrowsWrapper.appendChild(nextBtn);

    const navigateTo = (direction) => {
      if (grid.dataset.isScrolling === 'true') return;
      grid.dataset.isScrolling = 'true';

      const vItems = getVisualItems();
      const scrollLeft = grid.scrollLeft;
      
      let currentIndex = 1;
      let minDiff = Infinity;
      vItems.forEach((item, idx) => {
        const diff = Math.abs(item.offsetLeft - scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          currentIndex = idx;
        }
      });

      let targetIndex = currentIndex + direction;

      grid.style.scrollBehavior = 'smooth';
      grid.scrollLeft = vItems[targetIndex].offsetLeft;

      setTimeout(() => {
        grid.dataset.isScrolling = 'false';
        
        // Instant wrap-around check
        if (targetIndex === 0) {
          grid.style.setProperty('scroll-behavior', 'auto', 'important');
          grid.scrollLeft = vItems[vItems.length - 2].offsetLeft;
          setTimeout(() => {
            grid.style.removeProperty('scroll-behavior');
          }, 50);
        } else if (targetIndex === vItems.length - 1) {
          grid.style.setProperty('scroll-behavior', 'auto', 'important');
          grid.scrollLeft = vItems[1].offsetLeft;
          setTimeout(() => {
            grid.style.removeProperty('scroll-behavior');
          }, 50);
        }
      }, 500);
    };

    prevBtn.addEventListener('click', () => navigateTo(-1));
    nextBtn.addEventListener('click', () => navigateTo(1));
  }

  // Handle loop adjustments on swipe
  if (!grid.dataset.scrollListenerAdded) {
    let scrollEndTimer;
    grid.addEventListener('scroll', () => {
      if (grid.dataset.isScrolling === 'true') return;

      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        const vItems = getVisualItems();
        const scrollLeft = grid.scrollLeft;
        const width = grid.clientWidth;
        if (width === 0) return;
        
        let closestIndex = 1;
        let minDiff = Infinity;
        vItems.forEach((item, idx) => {
          const diff = Math.abs(item.offsetLeft - scrollLeft);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        });

        // Instant wrap-around for manual scroll/swipe
        if (closestIndex === 0) {
          grid.style.setProperty('scroll-behavior', 'auto', 'important');
          grid.scrollLeft = vItems[vItems.length - 2].offsetLeft;
          setTimeout(() => {
            grid.style.removeProperty('scroll-behavior');
          }, 50);
        } else if (closestIndex === vItems.length - 1) {
          grid.style.setProperty('scroll-behavior', 'auto', 'important');
          grid.scrollLeft = vItems[1].offsetLeft;
          setTimeout(() => {
            grid.style.removeProperty('scroll-behavior');
          }, 50);
        }
      }, 100);
    });
    grid.dataset.scrollListenerAdded = 'true';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initMobileGalleryCarousel();
    window.addEventListener('resize', initMobileGalleryCarousel);
  });
} else {
  initMobileGalleryCarousel();
  window.addEventListener('resize', initMobileGalleryCarousel);
}