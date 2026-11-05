/**
 * Romantic Birthday Web App - Main Application Logic
 * Integrates Three.js 3D Ring, GSAP, ScrollTrigger, Audio Player, Canvas Particles & Confetti
 */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP Plugins
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  }

  // State Management
  const state = {
    isUnlocked: false,
    partnerName: 'My Beautiful Queen',
    isCandleBlown: false,
    isCakeCut: false,
    isAudioPlaying: false,
    isVideoPlaying: false,
    isWalking: false,
    walkTimeout: null,
    currentGalleryMode: 'animated' // 'animated' or 'real'
  };

  // DOM Elements
  const screenLock = document.getElementById('screen-lock');
  const mainContent = document.getElementById('main-content');
  const unlockBtn = document.getElementById('unlock-btn');
  const partnerNameInput = document.getElementById('partner-name');
  const secretCodeInput = document.getElementById('secret-code');
  const eyeToggle = document.getElementById('eye-toggle');
  const displayName = document.getElementById('display-name');
  const audioBtn = document.getElementById('audio-btn');
  const bgAudio = document.getElementById('bg-audio');

  const startJourneyBtn = document.getElementById('start-journey-btn');
  const toVideoBtn = document.getElementById('to-video-btn');
  const toLetterBtn = document.getElementById('to-letter-btn');
  const toCakeBtn = document.getElementById('to-cake-btn');

  // Video Elements
  const storyVideo = document.getElementById('story-video-player');
  const videoWrapper = document.getElementById('video-wrapper');
  const playOverlay = document.getElementById('play-overlay');
  const playBtn = document.getElementById('play-btn');
  const ctrlPlayPause = document.getElementById('ctrl-play-pause');
  const scrubberFill = document.getElementById('scrubber-fill');
  const scrubberTrack = document.getElementById('scrubber-track');
  const timeDisplay = document.getElementById('time-display');

  // Envelope & Letter Elements
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('wax-seal');
  const letterCard = document.getElementById('letter-card');

  // Cake Elements
  const cuteCakeView = document.getElementById('cute-cake-view');
  const luxuryCakeView = document.getElementById('luxury-cake-view');
  const btnShowCuteCake = document.getElementById('btn-show-cute-cake');
  const btnShowLuxuryCake = document.getElementById('btn-show-luxury-cake');

  const candleWrapper = document.getElementById('candle-wrapper');
  const candleFlame = document.getElementById('candle-flame');
  const candleSmoke = document.getElementById('candle-smoke');
  const cuteCakeBox = document.getElementById('cute-cake-box');
  const knifeSliceLine = document.getElementById('knife-slice-line');
  const interactiveCandleOverlay = document.getElementById('interactive-candle-overlay');
  const candleSmokePlume = document.getElementById('candle-smoke-plume');

  const cakeStatus = document.getElementById('cake-status');
  const blowCandleBtn = document.getElementById('blow-candle-btn');
  const cutCakeBtn = document.getElementById('cut-cake-btn');
  const journeyUnlockBanner = document.getElementById('journey-unlock-banner');
  const beginWalkBtn = document.getElementById('begin-walk-btn');

  // Journey & Proposal Elements
  const screenJourney = document.getElementById('screen-journey');
  const walkingStage = document.getElementById('walking-stage');
  const coupleWalker = document.getElementById('couple-walker');
  const proposalYes1 = document.getElementById('proposal-yes-1');
  const proposalYes2 = document.getElementById('proposal-yes-2');
  const goldenTicket = document.getElementById('golden-ticket');

  // Vault & Modals
  const openVaultBtn = document.getElementById('open-vault-btn');
  const closeVaultBtn = document.getElementById('close-vault-btn');
  const vaultModal = document.getElementById('vault-modal');
  const photoModal = document.getElementById('photo-modal');
  const closePhotoBtn = document.getElementById('close-photo-btn');
  const modalPhotoImg = document.getElementById('modal-photo-img');
  const modalPhotoTitle = document.getElementById('modal-photo-title');
  const modalPhotoDesc = document.getElementById('modal-photo-desc');

  // Gallery Mode Toggles
  const btnShowAnimated = document.getElementById('btn-show-animated');
  const btnShowReal = document.getElementById('btn-show-real');

  const galleryData = {
    animated: [
      { img: 'assets/anim_memory_1.png', cap: 'Better Together 💕', note: 'Same eyes, more love. You make everything brighter just by existing in my world.' },
      { img: 'assets/anim_memory_2.png', cap: 'You Make Life Soft 🌙', note: 'Resting on my shoulder under moonlight and fairy lights. You are my greatest peace.' },
      { img: 'assets/anim_memory_3.png', cap: 'Holding Your Hand ☀️', note: 'Holding hands, dancing in the warm sunlight, laughing together like the universe was made for us.' },
      { img: 'assets/anim_memory_4.jpg', cap: 'Warm Cafe Love ☕', note: 'Hot coffee, endless sweet conversations, and falling in love with your eyes every single day.' }
    ],
    real: [
      { img: 'assets/real_memory_spidey.jpg', cap: 'My Spidey Queen 🕷️❤', note: 'Matching in our Spider-Man hoodies, making cute faces, and being goofy together!' },
      { img: 'assets/real_memory_selfie.jpg', cap: 'Our Sweet Smile 😊', note: 'That warm sunlight falling on our faces, smiling close together in pure happiness.' },
      { img: 'assets/real_memory_queen.jpg', cap: 'My Pure Angel 🌸', note: 'Looking like an absolute queen in traditional grace. The prettiest girl in the world.' },
      { img: 'assets/real_memory_hills.jpg', cap: 'Hill Station Queen ⛰️', note: 'Looking out at the hill station mountains in your lovely floral dress. Pure magic!' }
    ]
  };

  function updateGallery(mode) {
    state.currentGalleryMode = mode;
    const data = galleryData[mode];
    const cards = document.querySelectorAll('.polaroid-card');

    cards.forEach((card, idx) => {
      if (data[idx]) {
        const imgEl = card.querySelector('.polaroid-img');
        const capEl = card.querySelector('.polaroid-caption');
        imgEl.src = data[idx].img;
        capEl.textContent = data[idx].cap;
        card.setAttribute('data-caption', data[idx].cap);
        card.setAttribute('data-note', data[idx].note);
      }
    });

    if (mode === 'animated') {
      btnShowAnimated.classList.add('active');
      btnShowReal.classList.remove('active');
    } else {
      btnShowReal.classList.add('active');
      btnShowAnimated.classList.remove('active');
    }
  }

  btnShowAnimated.addEventListener('click', () => updateGallery('animated'));
  btnShowReal.addEventListener('click', () => updateGallery('real'));

  // =================================================================
  // 1. FLOATING HEARTS & ROSE PETALS CANVAS ENGINE
  // =================================================================
  const heartsCanvas = document.getElementById('hearts-canvas');
  const petalsCanvas = document.getElementById('petals-canvas');
  const hCtx = heartsCanvas.getContext('2d');
  const pCtx = petalsCanvas.getContext('2d');

  let width = (heartsCanvas.width = petalsCanvas.width = window.innerWidth);
  let height = (heartsCanvas.height = petalsCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = heartsCanvas.width = petalsCanvas.width = window.innerWidth;
    height = heartsCanvas.height = petalsCanvas.height = window.innerHeight;
  });

  const hearts = [];
  const petals = [];

  class HeartParticle {
    constructor(x, y, isBurst = false) {
      this.x = x || Math.random() * width;
      this.y = y || height + Math.random() * 40;
      this.size = Math.random() * 14 + 10;
      this.speedY = isBurst ? -(Math.random() * 5 + 3) : -(Math.random() * 1.5 + 0.8);
      this.speedX = isBurst ? (Math.random() - 0.5) * 4 : Math.sin(Math.random() * 5) * 0.8;
      this.opacity = isBurst ? 1 : Math.random() * 0.7 + 0.3;
      this.color = ['#ff2d75', '#ff65a3', '#ff85b3', '#ffd1dc', '#ff4b72'][Math.floor(Math.random() * 5)];
      this.rotation = Math.random() * Math.PI;
      this.rotSpeed = (Math.random() - 0.5) * 0.05;
      this.decay = isBurst ? 0.012 : 0.003;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      const topCurveHeight = this.size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
      ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, (this.size + topCurveHeight) / 2, 0, this.size);
      ctx.bezierCurveTo(0, (this.size + topCurveHeight) / 2, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
      ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;
      this.opacity -= this.decay;
    }
  }

  class RosePetal {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20;
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 1.5 + 1;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 2;
      this.opacity = Math.random() * 0.6 + 0.4;
      this.color = ['#d81159', '#ff2d75', '#c71f37', '#e83e8c'][Math.floor(Math.random() * 4)];
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.02) * 0.5;
      this.rotation += this.rotSpeed;
      if (this.y > height + 20) this.reset();
    }
  }

  for (let i = 0; i < 24; i++) {
    const h = new HeartParticle();
    h.y = Math.random() * height;
    hearts.push(h);
  }
  for (let i = 0; i < 18; i++) {
    petals.push(new RosePetal());
  }

  function animateParticles() {
    hCtx.clearRect(0, 0, width, height);
    pCtx.clearRect(0, 0, width, height);

    for (let i = hearts.length - 1; i >= 0; i--) {
      hearts[i].update();
      hearts[i].draw(hCtx);
      if (hearts[i].opacity <= 0 || hearts[i].y < -40) {
        hearts.splice(i, 1);
      }
    }
    if (hearts.length < 24 && Math.random() < 0.12) {
      hearts.push(new HeartParticle());
    }

    for (let p of petals) {
      p.update();
      p.draw(pCtx);
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  window.addEventListener('click', (e) => {
    if (e.target.closest('button, input, .polaroid-card, .video-controls, .wax-seal, #three-ring-canvas')) return;
    for (let i = 0; i < 6; i++) {
      hearts.push(new HeartParticle(e.clientX, e.clientY, true));
    }
  });

  // =================================================================
  // 2. BACKGROUND MUSIC & AUDIO CONTROLLER (Tumhi Dekho Na)
  // =================================================================
  function playBackgroundMusic() {
    if (bgAudio) {
      bgAudio.volume = 0.5;
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            state.isAudioPlaying = true;
            audioBtn.classList.add('playing');
          })
          .catch(() => {
            // Browser autoplay policy might need click
          });
      }
    }
  }

  function toggleBackgroundMusic() {
    if (!bgAudio) return;
    if (state.isAudioPlaying) {
      bgAudio.pause();
      state.isAudioPlaying = false;
      audioBtn.classList.remove('playing');
    } else {
      bgAudio.play();
      state.isAudioPlaying = true;
      audioBtn.classList.add('playing');
    }
  }

  audioBtn.addEventListener('click', toggleBackgroundMusic);

  // Auto-play attempt on first user interaction anywhere
  document.body.addEventListener('click', () => {
    if (!state.isAudioPlaying && state.isUnlocked) {
      playBackgroundMusic();
    }
  }, { once: true });

  // =================================================================
  // 3. LOCK SCREEN & UNLOCK SURPRISE
  // =================================================================
  eyeToggle.addEventListener('click', () => {
    secretCodeInput.type = secretCodeInput.type === 'password' ? 'text' : 'password';
  });

  function triggerUnlock() {
    if (state.isUnlocked) return;
    state.isUnlocked = true;

    const inputName = partnerNameInput.value.trim();
    if (inputName) {
      state.partnerName = inputName;
      displayName.textContent = inputName;
    }

    // Play "Tumhi Dekho Na"
    playBackgroundMusic();

    // Confetti burst
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ff2d75', '#ff65a3', '#ffd1dc', '#ffb84d']
      });
    }

    // GSAP Unlock Screen Transition
    gsap.to(screenLock, {
      opacity: 0,
      scale: 1.08,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        screenLock.style.display = 'none';
        document.body.classList.remove('locked-state');
        mainContent.classList.remove('hidden');

        gsap.fromTo(mainContent,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  unlockBtn.addEventListener('click', triggerUnlock);
  document.getElementById('lock-form').addEventListener('submit', triggerUnlock);

  // Section Navigation Buttons
  startJourneyBtn.addEventListener('click', () => {
    document.getElementById('screen-memories').scrollIntoView({ behavior: 'smooth' });
  });

  toVideoBtn.addEventListener('click', () => {
    document.getElementById('screen-video').scrollIntoView({ behavior: 'smooth' });
  });

  toLetterBtn.addEventListener('click', () => {
    document.getElementById('screen-letter').scrollIntoView({ behavior: 'smooth' });
  });

  toCakeBtn.addEventListener('click', () => {
    document.getElementById('screen-cake').scrollIntoView({ behavior: 'smooth' });
  });

  // =================================================================
  // 4. POLAROID MEMORIES INTERACTION
  // =================================================================
  const polaroids = document.querySelectorAll('.polaroid-card');
  polaroids.forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.polaroid-img').getAttribute('src');
      const caption = card.getAttribute('data-caption');
      const note = card.getAttribute('data-note');

      modalPhotoImg.src = img;
      modalPhotoTitle.textContent = caption;
      modalPhotoDesc.textContent = note;
      photoModal.classList.remove('hidden');

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#ff2d75', '#ffd1dc']
        });
      }
    });
  });

  closePhotoBtn.addEventListener('click', () => {
    photoModal.classList.add('hidden');
  });

  photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) photoModal.classList.add('hidden');
  });

  // =================================================================
  // 5. VIDEO PLAYER (User's real video: our_story_video.mp4)
  // =================================================================
  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (storyVideo) {
    storyVideo.addEventListener('timeupdate', () => {
      if (storyVideo.duration) {
        const pct = (storyVideo.currentTime / storyVideo.duration) * 100;
        scrubberFill.style.width = `${pct}%`;
        timeDisplay.textContent = `${formatTime(storyVideo.currentTime)} / ${formatTime(storyVideo.duration)}`;
      }
    });

    storyVideo.addEventListener('ended', () => {
      state.isVideoPlaying = false;
      playOverlay.style.opacity = '1';
      playOverlay.style.pointerEvents = 'auto';
      ctrlPlayPause.textContent = '▶';
    });

    scrubberTrack.addEventListener('click', (e) => {
      const rect = scrubberTrack.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      if (storyVideo.duration) {
        storyVideo.currentTime = clickPos * storyVideo.duration;
      }
    });
  }

  function toggleVideo() {
    if (!storyVideo) return;
    if (storyVideo.paused) {
      storyVideo.play();
      state.isVideoPlaying = true;
      playOverlay.style.opacity = '0';
      playOverlay.style.pointerEvents = 'none';
      ctrlPlayPause.textContent = '⏸';
      // Lower background music slightly for video
      if (bgAudio) bgAudio.volume = 0.2;
    } else {
      storyVideo.pause();
      state.isVideoPlaying = false;
      playOverlay.style.opacity = '1';
      playOverlay.style.pointerEvents = 'auto';
      ctrlPlayPause.textContent = '▶';
      if (bgAudio) bgAudio.volume = 0.5;
    }
  }

  playBtn.addEventListener('click', toggleVideo);
  ctrlPlayPause.addEventListener('click', toggleVideo);
  videoWrapper.addEventListener('click', (e) => {
    if (e.target.closest('.video-overlay') || e.target === videoWrapper) {
      toggleVideo();
    }
  });

  // =================================================================
  // 6. LOVE LETTER WITH WAX SEAL
  // =================================================================
  waxSeal.addEventListener('click', () => {
    gsap.to(envelope, {
      scale: 0.95,
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        envelope.style.display = 'none';
        letterCard.style.display = 'block';

        if (typeof confetti === 'function') {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#ff2d75', '#ffd1dc']
          });
        }
      }
    });
  });

  // =================================================================
  // 7. INTERACTIVE BIRTHDAY CAKE & CANDLE BLOW
  // =================================================================

  // Cake Style Switcher
  if (btnShowCuteCake && btnShowLuxuryCake) {
    btnShowCuteCake.addEventListener('click', () => {
      btnShowCuteCake.classList.add('active');
      btnShowLuxuryCake.classList.remove('active');
      if (cuteCakeView) cuteCakeView.classList.remove('hidden');
      if (luxuryCakeView) luxuryCakeView.classList.add('hidden');
    });

    btnShowLuxuryCake.addEventListener('click', () => {
      btnShowLuxuryCake.classList.add('active');
      btnShowCuteCake.classList.remove('active');
      if (luxuryCakeView) luxuryCakeView.classList.remove('hidden');
      if (cuteCakeView) cuteCakeView.classList.add('hidden');
    });
  }

  function blowCandle() {
    if (state.isCandleBlown) return;
    state.isCandleBlown = true;

    // Extinguish Cute Cake Candle
    if (candleWrapper) candleWrapper.classList.add('extinguished');
    if (candleFlame) candleFlame.classList.add('extinguished');
    if (candleSmoke) candleSmoke.classList.add('active');

    // Extinguish Luxury Photo Candle
    if (interactiveCandleOverlay) interactiveCandleOverlay.classList.add('extinguished');
    if (candleSmokePlume) candleSmokePlume.classList.add('active');

    // Play realistic candle blow sound
    if (window.soundEffects && typeof window.soundEffects.playCandleBlow === 'function') {
      window.soundEffects.playCandleBlow();
    }

    setTimeout(() => {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#ffb84d', '#ffe082', '#ff2d75', '#ffffff']
        });
      }

      if (cakeStatus) {
        cakeStatus.innerHTML = `🌟 <strong>Wish Maangi Gayi!</strong> Meri Simmu ki har khwahish puri ho... Now cut the cake baby! 🎂`;
      }
      if (blowCandleBtn) {
        blowCandleBtn.classList.add('disabled');
        blowCandleBtn.disabled = true;
      }

      if (cutCakeBtn) {
        cutCakeBtn.classList.remove('disabled');
        cutCakeBtn.removeAttribute('disabled');
        cutCakeBtn.classList.add('pulse-animation');
      }
    }, 500);
  }

  // Bind all candle elements
  document.querySelectorAll('.candle-interactive').forEach(el => {
    el.addEventListener('click', blowCandle);
  });
  if (candleWrapper) candleWrapper.addEventListener('click', blowCandle);
  if (interactiveCandleOverlay) interactiveCandleOverlay.addEventListener('click', blowCandle);
  if (blowCandleBtn) blowCandleBtn.addEventListener('click', blowCandle);

  function cutCake() {
    if (state.isCakeCut) return;
    state.isCakeCut = true;

    // Trigger cutting animations on Cute Cake
    if (cuteCakeBox) {
      cuteCakeBox.classList.add('slicing');
      setTimeout(() => {
        cuteCakeBox.classList.add('sliced');
      }, 400);
    }
    // Trigger cutting line on Luxury Cake
    if (knifeSliceLine) knifeSliceLine.classList.add('sliced');

    if (cutCakeBtn) {
      cutCakeBtn.classList.remove('pulse-animation');
      cutCakeBtn.classList.add('disabled');
      cutCakeBtn.disabled = true;
    }

    // Play celebration sound
    if (window.soundEffects && typeof window.soundEffects.playChime === 'function') {
      window.soundEffects.playChime();
    }

    // Grand Confetti Shower
    if (typeof confetti === 'function') {
      const end = Date.now() + 3000;
      const colors = ['#ff2d75', '#ff65a3', '#ffd1dc', '#ffb84d', '#7928ca'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }

    if (cakeStatus) {
      cakeStatus.innerHTML = `🎂 <strong>Happy Birthday, Meri Jaan Simmu!</strong> A sweet piece of cake for my sweetheart ❤ Humara pyara safar ab shuru hota hai...`;
    }

    if (journeyUnlockBanner) {
      journeyUnlockBanner.classList.remove('hidden');
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(journeyUnlockBanner,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'back.out(1.5)' }
        );
      }
    }
  }

  if (cutCakeBtn) cutCakeBtn.addEventListener('click', cutCake);

  // =================================================================
  // 8. THE GRAND SCROLL JOURNEY & 3D RING INITIALIZATION
  // =================================================================
  beginWalkBtn.addEventListener('click', () => {
    screenJourney.classList.remove('hidden');
    screenJourney.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      initJourneyScrollTrigger();
      init3DRing();
    }, 400);
  });

  function initJourneyScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.refresh();

    const scenes = {
      road: document.getElementById('scene-road'),
      garden: document.getElementById('scene-garden'),
      mountain: document.getElementById('scene-mountain'),
      dinner: document.getElementById('scene-dinner')
    };

    const checkpoints = [
      document.getElementById('checkpoint-1'),
      document.getElementById('checkpoint-2'),
      document.getElementById('checkpoint-3'),
      document.getElementById('checkpoint-4')
    ];

    const stepDots = document.querySelectorAll('.step-dot');

    function setActiveScene(activeKey, activeIndex) {
      Object.keys(scenes).forEach((key) => {
        if (key === activeKey) {
          scenes[key].classList.add('active');
        } else {
          scenes[key].classList.remove('active');
        }
      });

      stepDots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Checkpoint 1: Midnight Road
    ScrollTrigger.create({
      trigger: checkpoints[0],
      start: 'top 70%',
      end: 'bottom 40%',
      onEnter: () => {
        setActiveScene('road', 0);
        checkpoints[0].classList.add('in-view');
      },
      onEnterBack: () => {
        setActiveScene('road', 0);
        checkpoints[0].classList.add('in-view');
      }
    });

    // Checkpoint 2: Chandigarh Rose Garden
    ScrollTrigger.create({
      trigger: checkpoints[1],
      start: 'top 70%',
      end: 'bottom 40%',
      onEnter: () => {
        setActiveScene('garden', 1);
        checkpoints[1].classList.add('in-view');
        for (let i = 0; i < 15; i++) {
          petals.push(new RosePetal());
        }
      },
      onEnterBack: () => {
        setActiveScene('garden', 1);
        checkpoints[1].classList.add('in-view');
      }
    });

    // Checkpoint 3: Mountain Sunrise & Adventure
    ScrollTrigger.create({
      trigger: checkpoints[2],
      start: 'top 70%',
      end: 'bottom 40%',
      onEnter: () => {
        setActiveScene('mountain', 2);
        checkpoints[2].classList.add('in-view');
      },
      onEnterBack: () => {
        setActiveScene('mountain', 2);
        checkpoints[2].classList.add('in-view');
      }
    });

    // Checkpoint 4: 3D Ring & Candlelight Proposal
    ScrollTrigger.create({
      trigger: checkpoints[3],
      start: 'top 70%',
      end: 'bottom bottom',
      onEnter: () => {
        setActiveScene('dinner', 3);
        checkpoints[3].classList.add('in-view');
      },
      onEnterBack: () => {
        setActiveScene('dinner', 3);
        checkpoints[3].classList.add('in-view');
      }
    });

    // Animate couple walking legs on scroll
    window.addEventListener('scroll', () => {
      if (!state.isWalking) {
        state.isWalking = true;
        coupleWalker.classList.add('walking-motion');
      }
      clearTimeout(state.walkTimeout);
      state.walkTimeout = setTimeout(() => {
        state.isWalking = false;
        coupleWalker.classList.remove('walking-motion');
      }, 250);
    }, { passive: true });
  }

  // =================================================================
  // 9. THREE.JS 3D PROPOSAL DIAMOND RING
  // =================================================================
  let ringScene, ringCamera, ringRenderer, ringGroup;
  let isDraggingRing = false, prevMouseX = 0, prevMouseY = 0;

  function init3DRing() {
    const canvas = document.getElementById('three-ring-canvas');
    if (!canvas || typeof THREE === 'undefined' || ringRenderer) return;

    const container = document.getElementById('ring-canvas-wrapper');
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 240;

    ringScene = new THREE.Scene();
    ringCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    ringCamera.position.set(0, 0, 3.6);

    ringRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    ringRenderer.setSize(width, height);
    ringRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Balanced Studio Jewelry Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.85);
    ringScene.add(ambientLight);

    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfffaec, 1.4);
    keyLight.position.set(3, 4, 3);
    ringScene.add(keyLight);

    // Cool diamond sparkle fill light
    const fillLight = new THREE.DirectionalLight(0xd6eaff, 1.2);
    fillLight.position.set(-3, -1, 2);
    ringScene.add(fillLight);

    // Back rim light
    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    rimLight.position.set(0, -3, -3);
    ringScene.add(rimLight);

    // Gentle specular point light for facet sparkle
    const sparkleLight = new THREE.PointLight(0xffffff, 1.0, 6);
    sparkleLight.position.set(1.0, 1.8, 2.5);
    ringScene.add(sparkleLight);

    ringGroup = new THREE.Group();
    // Default dynamic display angle: tilted 22° forward and 30° turned so Simmu sees the diamond facets and golden hoop
    ringGroup.rotation.x = 0.38;
    ringGroup.rotation.y = -0.55;

    // Subgroup scaled and centered comfortably within the canvas box
    const ringRoot = new THREE.Group();
    ringRoot.scale.set(0.72, 0.72, 0.72);
    ringRoot.position.set(0, -0.05, 0);

    // 1. 18K Champagne Gold Ring Band (Upright circular hoop)
    const bandGeo = new THREE.TorusGeometry(0.95, 0.085, 32, 80);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xffd17a,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x3d2806,
      emissiveIntensity: 0.15
    });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    ringRoot.add(bandMesh);

    // 2. Diamond Setting (6-Prong Tiffany Style Crown)
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffe09e,
      metalness: 0.95,
      roughness: 0.15
    });

    // Base collar ring holding the prongs at top of band
    const collarGeo = new THREE.TorusGeometry(0.20, 0.035, 16, 24);
    const collarMesh = new THREE.Mesh(collarGeo, crownMat);
    collarMesh.position.set(0, 0.98, 0);
    collarMesh.rotation.x = Math.PI / 2;
    ringRoot.add(collarMesh);

    // 6 tapered prongs with claw tips gripping the diamond
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Prong shaft
      const prongGeo = new THREE.CylinderGeometry(0.024, 0.038, 0.20, 12);
      const prongMesh = new THREE.Mesh(prongGeo, crownMat);
      prongMesh.position.set(cosA * 0.22, 1.08, sinA * 0.22);
      prongMesh.rotation.z = -cosA * 0.25;
      prongMesh.rotation.x = sinA * 0.25;
      ringRoot.add(prongMesh);

      // Claw tip bead over the girdle
      const clawGeo = new THREE.SphereGeometry(0.034, 10, 10);
      const clawMesh = new THREE.Mesh(clawGeo, crownMat);
      clawMesh.position.set(cosA * 0.27, 1.16, sinA * 0.27);
      ringRoot.add(clawMesh);
    }

    // 3. Faceted Brilliant-Cut Solitaire Diamond (Sparkling Crystal Material)
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.04,
      transmission: 0.15,
      ior: 2.417,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      flatShading: true,
      transparent: true,
      opacity: 0.98,
      emissive: 0x001a33,
      emissiveIntensity: 0.35
    });

    // Crown (Top facet with flat octagonal table)
    // Table at y = 1.26 (radius 0.20), Girdle at y = 1.14 (radius 0.36)
    const diamondCrownGeo = new THREE.CylinderGeometry(0.20, 0.36, 0.12, 10, 1, false);
    const diamondCrown = new THREE.Mesh(diamondCrownGeo, diamondMat);
    diamondCrown.position.set(0, 1.20, 0);
    ringRoot.add(diamondCrown);

    // Pavilion (Bottom cone tapering from girdle down into prongs)
    // Girdle at y = 1.14 (radius 0.36), Culet at y = 0.94 (radius 0.02)
    const diamondPavilionGeo = new THREE.CylinderGeometry(0.36, 0.02, 0.20, 10, 1, false);
    const diamondPavilion = new THREE.Mesh(diamondPavilionGeo, diamondMat);
    diamondPavilion.position.set(0, 1.04, 0);
    ringRoot.add(diamondPavilion);

    // 4. Pavé Shoulder Accent Diamonds (3 on each side of the band)
    const paveMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.8,
      flatShading: true
    });
    const paveGeo = new THREE.OctahedronGeometry(0.045, 0);

    const paveAngles = [0.22, 0.36, 0.50];
    paveAngles.forEach((ang) => {
      // Right shoulder
      const pR = new THREE.Mesh(paveGeo, paveMat);
      pR.position.set(Math.sin(ang) * 0.95, Math.cos(ang) * 0.95, 0);
      pR.rotation.z = -ang;
      ringRoot.add(pR);

      // Left shoulder
      const pL = new THREE.Mesh(paveGeo, paveMat);
      pL.position.set(-Math.sin(ang) * 0.95, Math.cos(ang) * 0.95, 0);
      pL.rotation.z = ang;
      ringRoot.add(pL);
    });

    // 5. Floating Sparkle Stars (Diamond Fire Glints)
    const sparkleGroup = new THREE.Group();
    const starGeo = new THREE.OctahedronGeometry(0.035, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const s1 = new THREE.Mesh(starGeo, starMat);
    s1.position.set(0.32, 1.35, 0.22);
    sparkleGroup.add(s1);

    const s2 = new THREE.Mesh(starGeo, starMat);
    s2.position.set(-0.28, 1.28, -0.2);
    sparkleGroup.add(s2);

    const s3 = new THREE.Mesh(starGeo, starMat);
    s3.position.set(0.05, 1.42, -0.15);
    sparkleGroup.add(s3);

    ringRoot.add(sparkleGroup);

    ringGroup.add(ringRoot);
    ringScene.add(ringGroup);

    // Mouse / Touch Rotation Handling
    canvas.addEventListener('mousedown', (e) => {
      isDraggingRing = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDraggingRing = false; });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDraggingRing) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      ringGroup.rotation.y += deltaX * 0.015;
      ringGroup.rotation.x += deltaY * 0.015;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        isDraggingRing = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => { isDraggingRing = false; });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDraggingRing || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      ringGroup.rotation.y += deltaX * 0.015;
      ringGroup.rotation.x += deltaY * 0.015;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }, { passive: true });

    // Smooth Continuous Render & Gentle Sparkle Animation
    let clock = 0;
    function renderRing() {
      requestAnimationFrame(renderRing);
      clock += 0.03;

      if (!isDraggingRing) {
        ringGroup.rotation.y += 0.007;
      }

      // Subtle sparkle pulse
      sparkleGroup.rotation.y -= 0.01;
      const scaleVal = 1.0 + Math.sin(clock) * 0.35;
      s1.scale.setScalar(scaleVal);
      s2.scale.setScalar(1.2 - Math.sin(clock) * 0.3);
      s3.scale.setScalar(0.9 + Math.cos(clock) * 0.3);

      ringRenderer.render(ringScene, ringCamera);
    }
    renderRing();
  }

  // =================================================================
  // 10. MARRIAGE PROPOSAL RESPONSE
  // =================================================================
  function handleProposalAccept(btn) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#ffb84d', '#ff2d75', '#ffffff', '#7928ca', '#bde0fe']
      });
    }

    btn.textContent = 'Engaged in Love Forever! 💍❤';
    goldenTicket.classList.remove('hidden');

    gsap.fromTo(goldenTicket,
      { scale: 0.7, opacity: 0, rotation: -4 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );
  }

  proposalYes1.addEventListener('click', function() { handleProposalAccept(this); });
  proposalYes2.addEventListener('click', function() { handleProposalAccept(this); });

  // =================================================================
  // 11. LOVE VAULT & SHAYARI MODAL
  // =================================================================
  openVaultBtn.addEventListener('click', () => {
    vaultModal.classList.remove('hidden');
  });

  closeVaultBtn.addEventListener('click', () => {
    vaultModal.classList.add('hidden');
  });

  vaultModal.addEventListener('click', (e) => {
    if (e.target === vaultModal) vaultModal.classList.add('hidden');
  });

  window.redeemCoupon = function(btn, title) {
    btn.textContent = 'Redeemed with Love ❤';
    btn.classList.add('redeemed');
    btn.disabled = true;

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#10b981', '#ff2d75', '#ffd1dc']
      });
    }
  };

});
