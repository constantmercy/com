// ============================================
//  CONSTANT MERCY AND PRAISE CHILDREN HOME
//  Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // -----------------------------------------------
  // NAVBAR SCROLL EFFECT
  // -----------------------------------------------
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // -----------------------------------------------
  // HAMBURGER MENU
  // -----------------------------------------------
  const hamburger = document.querySelector('.hamburger');
  const mobileNav  = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('open');
      });
    });
  }

  // -----------------------------------------------
  // HERO SLIDER (Main / Full Height)
  // -----------------------------------------------
  function initSlider(sliderEl, dotContainer, autoInterval = 4500) {
    if (!sliderEl) return;

    const slides  = sliderEl.querySelectorAll('.hero-slide, .page-hero-slide');
    const dots    = dotContainer ? dotContainer.querySelectorAll('.hero-dot') : [];
    const prevBtn = sliderEl.parentElement.querySelector('.hero-arrow.prev');
    const nextBtn = sliderEl.parentElement.querySelector('.hero-arrow.next');

    if (!slides.length) return;

    let current = 0;
    let timer;

    function goTo(index) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), autoInterval);
    }

    goTo(0);
    startTimer();

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); startTimer(); });
    });

    // Touch / swipe support
    let touchStartX = 0;
    sliderEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); startTimer(); }
    }, { passive: true });
  }

  // Init main hero slider
  const mainSlider = document.querySelector('.hero-slider');
  const mainDots   = document.querySelector('.hero-dots');
  initSlider(mainSlider, mainDots, 5000);

  // Init page-hero slider
  const pageSlider = document.querySelector('.page-hero-slider');
  initSlider(pageSlider, null, 4000);

  // -----------------------------------------------
  // DONATE MODAL
  // -----------------------------------------------
  const donateModal   = document.getElementById('donateModal');
  const inKindModal   = document.getElementById('inKindModal');
  const donateBtns    = document.querySelectorAll('[data-action="donate"]');
  const closeButtons  = document.querySelectorAll('.modal-close');
  const overlays      = document.querySelectorAll('.modal-overlay');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    // Scroll the overlay back to top every time it opens
    modal.scrollTop = 0;
    // Do NOT lock body scroll — the overlay itself is scrollable
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
  }

  donateBtns.forEach(btn => btn.addEventListener('click', () => openModal(donateModal)));

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(donateModal);
      closeModal(inKindModal);
    });
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        closeModal(donateModal);
        closeModal(inKindModal);
      }
    });
  });

  // Switch to In-Kind
  const inKindBtn = document.getElementById('openInKindBtn');
  if (inKindBtn) {
    inKindBtn.addEventListener('click', () => {
      closeModal(donateModal);
      openModal(inKindModal);
    });
  }

  // Back to Donate
  const backDonateBtn = document.getElementById('backToDonateBtn');
  if (backDonateBtn) {
    backDonateBtn.addEventListener('click', () => {
      closeModal(inKindModal);
      openModal(donateModal);
    });
  }

  // -----------------------------------------------
  // COPY TO CLIPBOARD  (works on mobile + file://)
  // -----------------------------------------------
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const text = this.dataset.copy;
      const originalHTML = this.innerHTML;

      function showCopied() {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalHTML;
        }, 2500);
      }

      // Method 1 – modern Clipboard API (HTTPS / localhost)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(showCopied)
          .catch(() => fallbackCopy(text, showCopied));
      } else {
        fallbackCopy(text, showCopied);
      }
    });
  });

  function fallbackCopy(text, callback) {
    // Method 2 – hidden textarea (works on all browsers incl. mobile file://)
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      document.body.appendChild(ta);

      // iOS needs selection via range
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(ta);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        ta.setSelectionRange(0, 999999);
      } else {
        ta.select();
      }

      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) callback();
    } catch (e) {
      // Method 3 – prompt user to copy manually (last resort)
      window.prompt('Copy the account number below:', text);
    }
  }

  // -----------------------------------------------
  // IN-KIND DONATION FORM → WHATSAPP
  // -----------------------------------------------
  const inKindForm = document.getElementById('inKindForm');
  if (inKindForm) {
    inKindForm.addEventListener('submit', e => {
      e.preventDefault();

      const name    = document.getElementById('ik-name')?.value.trim()        || '';
      const phone   = document.getElementById('ik-phone')?.value.trim()       || '';
      const item    = document.getElementById('ik-item')?.value.trim()        || '';
      const quantity= document.getElementById('ik-quantity')?.value.trim()    || '';
      const notes   = document.getElementById('ik-notes')?.value.trim()       || '';

      const msg =
        `Hello, I would like to make a donation to Constant Mercy and Praise Children Home.%0A%0A` +
        `*Donor Name:* ${name}%0A` +
        `*Phone:* ${phone}%0A` +
        `*Item/Donation:* ${item}%0A` +
        `*Quantity:* ${quantity}%0A` +
        (notes ? `*Additional Notes:* ${notes}%0A` : '') +
        `%0AThank you! 🙏`;

      window.open(`https://wa.me/2348033177797?text=${msg}`, '_blank');
    });
  }

  // -----------------------------------------------
  // GALLERY LIGHTBOX
  // -----------------------------------------------
  const lightbox    = document.getElementById('galleryLightbox');
  const lbImg       = document.getElementById('lbImg');
  const lbClose     = document.querySelector('.lightbox-close');
  const lbPrev      = document.querySelector('.lightbox-arrow.lb-prev');
  const lbNext      = document.querySelector('.lightbox-arrow.lb-next');

  let galleryImages = [];
  let lbIndex = 0;

  function openLightbox(index) {
    if (!lightbox) return;
    lbIndex = index;
    lbImg.src = galleryImages[lbIndex];
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
  function lbGoTo(index) {
    lbIndex = (index + galleryImages.length) % galleryImages.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = galleryImages[lbIndex];
      lbImg.style.opacity = '1';
    }, 150);
  }

  if (lightbox) {
    const galleryItems = document.querySelectorAll('.gallery-masonry-item, .gallery-item-preview');
    galleryItems.forEach((item, i) => {
      const img = item.querySelector('img');
      if (img) {
        galleryImages.push(img.src);
        item.addEventListener('click', () => openLightbox(i));
      }
    });

    if (lbClose)  lbClose.addEventListener('click', closeLightbox);
    if (lbPrev)   lbPrev.addEventListener('click',  () => lbGoTo(lbIndex - 1));
    if (lbNext)   lbNext.addEventListener('click',  () => lbGoTo(lbIndex + 1));

    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    // Keyboard support
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   lbGoTo(lbIndex - 1);
      if (e.key === 'ArrowRight')  lbGoTo(lbIndex + 1);
    });

    lbImg.style.transition = 'opacity 0.15s ease';
  }

  // -----------------------------------------------
  // GALLERY FILTER
  // -----------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItemsAll = document.querySelectorAll('.gallery-masonry-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItemsAll.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // -----------------------------------------------
  // COUNTER ANIMATION
  // -----------------------------------------------
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const update = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current) + (counter.dataset.suffix || '');
          requestAnimationFrame(update);
        } else {
          counter.textContent = target + (counter.dataset.suffix || '');
        }
      };
      update();
    });
  }

  // Trigger counters when visible
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(statsBar);
  }

  // -----------------------------------------------
  // SCROLL REVEAL ANIMATION
  // -----------------------------------------------
  const revealEls = document.querySelectorAll(
    '.mission-card, .value-card, .gallery-masonry-item, .gallery-item-preview, .timeline-item'
  );

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });

  // -----------------------------------------------
  // ACTIVE NAV LINK
  // -----------------------------------------------
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});
