// =================================================================
// LIVE USER ACTIVITY TRACKER FOR SIMMU'S BIRTHDAY WISH PAGE
// Streams real-time clicks, scrolls, and milestones to Firebase Firestore
// =================================================================

(function () {
  // Wait until Firebase is loaded
  if (typeof firebase === 'undefined') {
    console.warn('[LoveTracker] Firebase SDK not detected');
    return;
  }

  const db = firebase.firestore();
  const SESSION_DOC = 'simmu_live';
  const sessionRef = db.collection('simmu_sessions').doc(SESSION_DOC);
  const eventsRef = db.collection('simmu_live_events');

  // Device & browser detection
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';
  const platform = navigator.platform || 'Unknown Device';

  // Initialize session state
  const sessionData = {
    sessionId: 'simmu_' + Date.now(),
    userName: 'Simmu ❤',
    startedAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastSeen: Date.now(),
    device: `${deviceType} (${platform})`,
    resolution: `${window.innerWidth}x${window.innerHeight}`,
    isOnline: true,
    currentSection: 'Screen 1: Romantic Lock Screen',
    scrollPercent: 0,
    musicPlaying: true,
    candleBlown: false,
    cakeCut: false,
    proposalAnswer: null,
    cakeStyle: 'Cute 3D Cake',
    galleryStyle: 'Animated Style'
  };

  sessionRef.set(sessionData, { merge: true }).catch(console.error);

  // Helper to log events to timeline
  window.trackLoveEvent = function (label, icon = '✨', category = 'click', details = {}) {
    const event = {
      label: label,
      icon: icon,
      category: category,
      details: details,
      timestamp: Date.now(),
      serverTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    eventsRef.add(event).catch(console.error);

    // Also update current session doc with last activity
    sessionRef.set({
      lastSeen: Date.now(),
      lastAction: `${icon} ${label}`,
      isOnline: true
    }, { merge: true }).catch(console.error);
  };

  // Log page entry
  window.trackLoveEvent('Simmu opened the Birthday Wish Page! 💖', '🌟', 'session', {
    device: sessionData.device,
    resolution: sessionData.resolution
  });

  // Heartbeat to keep live presence active
  setInterval(() => {
    sessionRef.set({
      lastSeen: Date.now(),
      isOnline: document.visibilityState === 'visible'
    }, { merge: true }).catch(console.error);
  }, 4000);

  // Visibility state handling
  document.addEventListener('visibilitychange', () => {
    const isOnline = document.visibilityState === 'visible';
    sessionRef.set({
      isOnline: isOnline,
      lastSeen: Date.now()
    }, { merge: true }).catch(console.error);

    if (isOnline) {
      window.trackLoveEvent('Simmu returned to the tab 💕', '👀', 'presence');
    } else {
      window.trackLoveEvent('Simmu switched to another tab / locked phone', '💤', 'presence');
    }
  });

  // Listen for Live Heart Pings sent by Aryan from live.html
  db.collection('simmu_pings').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        if (data.timestamp && Date.now() - data.timestamp < 10000) {
          showAryanLoveNotification(data.message || 'Aryan is watching you smile right now! ❤');
        }
      }
    });
  });

  function showAryanLoveNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'aryan-love-toast';
    notif.innerHTML = `
      <div class="toast-heart-pulse">💖</div>
      <div class="toast-text">
        <strong>From Aryan ❤</strong>
        <p>${msg}</p>
      </div>
    `;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.classList.add('hide');
      setTimeout(() => notif.remove(), 600);
    }, 4500);
  }

  // Real-time Scroll & Section Tracking
  let lastScrollCheck = 0;
  let lastSectionName = '';

  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollCheck < 600) return;
    lastScrollCheck = now;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollHeight > 0 ? Math.min(100, Math.round((window.scrollY / scrollHeight) * 100)) : 0;

    // Detect active section
    let currentSection = 'Screen 1: Lock Screen';
    const checkpoints = [
      { id: 'checkpoint-4', name: '💍 Proposal: Candlelight Dinner & 3D Ring' },
      { id: 'checkpoint-3', name: '🌄 Journey: Mountain Sunrise Adventure' },
      { id: 'checkpoint-2', name: '🌹 Journey: Chandigarh Rose Garden' },
      { id: 'checkpoint-1', name: '🌌 Journey: Midnight Empty Road' },
      { id: 'screen-cake', name: '🎂 Screen 6: Birthday Cake & Candle' },
      { id: 'screen-movie', name: '🎬 Screen 5: Romantic Cinema Date' },
      { id: 'screen-letter', name: '💌 Screen 4: Aryan\'s Heartfelt Letter' },
      { id: 'screen-memories', name: '📸 Screen 3: Polaroid Memories' },
      { id: 'screen-hero', name: '✨ Screen 2: Happy Birthday Simmu' }
    ];

    for (const cp of checkpoints) {
      const el = document.getElementById(cp.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.2) {
          currentSection = cp.name;
          break;
        }
      }
    }

    sessionRef.set({
      scrollPercent: scrollPercent,
      currentSection: currentSection,
      lastSeen: Date.now()
    }, { merge: true }).catch(console.error);

    if (currentSection !== lastSectionName) {
      lastSectionName = currentSection;
      window.trackLoveEvent(`Simmu scrolled to: ${currentSection}`, '📍', 'navigation', { scrollPercent: scrollPercent });
    }
  }, { passive: true });

  // Auto-Hook Click Events across the entire page
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Lock screen unlock
    const unlockBtn = document.getElementById('unlock-btn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        window.trackLoveEvent('Simmu unlocked her Birthday Surprise! 🔓✨', '🎉', 'milestone');
      });
    }

    // 2. Audio Toggle
    const musicBtn = document.getElementById('toggle-music-btn');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        setTimeout(() => {
          const isMuted = musicBtn.classList.contains('muted');
          window.trackLoveEvent(isMuted ? 'Simmu paused background music' : 'Simmu played background music ("Tumhi Dekho Na")', '🎵', 'media');
          sessionRef.set({ musicPlaying: !isMuted }, { merge: true }).catch(console.error);
        }, 100);
      });
    }

    // 3. Start Journey / Memories button
    const startJourneyBtn = document.getElementById('start-journey-btn');
    if (startJourneyBtn) {
      startJourneyBtn.addEventListener('click', () => {
        window.trackLoveEvent('Simmu clicked "Unfold Our Memories" ❤', '📖', 'click');
      });
    }

    // 4. Photo Mode Toggles
    const btnAnimated = document.getElementById('btn-show-animated');
    const btnReal = document.getElementById('btn-show-real');
    if (btnAnimated) {
      btnAnimated.addEventListener('click', () => {
        window.trackLoveEvent('Simmu switched to Animated Photos view ✨', '🎨', 'toggle');
        sessionRef.set({ galleryStyle: 'Animated Style' }, { merge: true });
      });
    }
    if (btnReal) {
      btnReal.addEventListener('click', () => {
        window.trackLoveEvent('Simmu switched to Real Couple Photos view 📸', '📷', 'toggle');
        sessionRef.set({ galleryStyle: 'Real Photos' }, { merge: true });
      });
    }

    // 5. Clicking Polaroids
    document.querySelectorAll('.polaroid-card').forEach((card) => {
      card.addEventListener('click', () => {
        const caption = card.getAttribute('data-caption') || card.querySelector('.polaroid-caption')?.innerText || 'Memory Photo';
        window.trackLoveEvent(`Simmu opened memory photo: "${caption}"`, '🖼️', 'photo_click', { caption: caption });
      });
    });

    // 6. Wax Seal Love Letter
    const waxSeal = document.getElementById('wax-seal');
    if (waxSeal) {
      waxSeal.addEventListener('click', () => {
        window.trackLoveEvent('Simmu broke the wax seal and opened Aryan\'s heartfelt love letter! 💌❤', '💌', 'milestone');
      });
    }

    // 7. Video Watch
    const storyVideo = document.getElementById('story-video');
    if (storyVideo) {
      storyVideo.addEventListener('play', () => {
        window.trackLoveEvent('Simmu played "Our Story" video 🎥', '▶️', 'media');
      });
      storyVideo.addEventListener('pause', () => {
        window.trackLoveEvent('Simmu paused "Our Story" video', '⏸️', 'media');
      });
    }

    // 8. Cake Candle Blow & Cut
    const blowBtn = document.getElementById('blow-candle-btn');
    if (blowBtn) {
      blowBtn.addEventListener('click', () => {
        window.trackLoveEvent('Simmu made a wish and BLEW OUT THE CANDLE! 🕯️💨✨', '🎂', 'milestone');
        sessionRef.set({ candleBlown: true }, { merge: true });
      });
    }

    const cutBtn = document.getElementById('cut-cake-btn');
    if (cutBtn) {
      cutBtn.addEventListener('click', () => {
        window.trackLoveEvent('Simmu CUT THE BIRTHDAY CAKE! 🍰🔪🎉', '🍰', 'milestone');
        sessionRef.set({ cakeCut: true }, { merge: true });
      });
    }

    // Cake Style Switcher
    const cuteCakeBtn = document.getElementById('btn-show-cute-cake');
    const luxuryCakeBtn = document.getElementById('btn-show-luxury-cake');
    if (cuteCakeBtn) {
      cuteCakeBtn.addEventListener('click', () => {
        window.trackLoveEvent('Simmu viewed the Cute 3D Tiered Cake 🎂', '🎂', 'toggle');
        sessionRef.set({ cakeStyle: 'Cute 3D Cake' }, { merge: true });
      });
    }
    if (luxuryCakeBtn) {
      luxuryCakeBtn.addEventListener('click', () => {
        window.trackLoveEvent('Simmu viewed the Grand Palace Cake ✨', '✨', 'toggle');
        sessionRef.set({ cakeStyle: 'Grand Palace Cake' }, { merge: true });
      });
    }

    // 9. Begin Walk Button
    const beginWalkBtn = document.getElementById('begin-walk-btn');
    if (beginWalkBtn) {
      beginWalkBtn.addEventListener('click', () => {
        window.trackLoveEvent('Simmu clicked "Walk Hand in Hand With Aryan"! 👫💖', '🚶‍♀️', 'milestone');
      });
    }

    // 10. 3D Ring Interaction
    const ringCanvas = document.getElementById('three-ring-canvas');
    let ringTrackTimeout = null;
    if (ringCanvas) {
      const onRingInteract = () => {
        if (!ringTrackTimeout) {
          window.trackLoveEvent('Simmu is rotating and admiring her 3D Diamond Engagement Ring! 💍✨', '💍', 'ring_rotate');
          ringTrackTimeout = setTimeout(() => { ringTrackTimeout = null; }, 10000);
        }
      };
      ringCanvas.addEventListener('mousedown', onRingInteract);
      ringCanvas.addEventListener('touchstart', onRingInteract, { passive: true });
    }

    // 11. Proposal Accept Buttons (THE BIGGEST MOMENT!)
    const propYes1 = document.getElementById('proposal-yes-1');
    const propYes2 = document.getElementById('proposal-yes-2');

    if (propYes1) {
      propYes1.addEventListener('click', () => {
        window.trackLoveEvent('🚨💍 SIMMU SAID YES! "YES Aryan, A Million Times YES!" 🎉💍❤', '💍', 'proposal_accepted', { answer: 'YES Aryan, A Million Times YES!' });
        sessionRef.set({ proposalAnswer: 'YES Aryan, A Million Times YES! 💍' }, { merge: true });
      });
    }
    if (propYes2) {
      propYes2.addEventListener('click', () => {
        window.trackLoveEvent('🚨💍 SIMMU SAID YES! "Hamesha Ke Liye Tumhari! 💕" 🎉💍❤', '💍', 'proposal_accepted', { answer: 'Hamesha Ke Liye Tumhari!' });
        sessionRef.set({ proposalAnswer: 'Hamesha Ke Liye Tumhari! 💕' }, { merge: true });
      });
    }

    // 12. Love Vault & Coupon Redemptions
    const openVaultBtn = document.getElementById('open-vault-btn');
    if (openVaultBtn) {
      openVaultBtn.addEventListener('click', () => {
        window.trackLoveEvent('Simmu opened the Love Shayari & Coupon Vault 💖', '🎁', 'vault_open');
      });
    }

    document.querySelectorAll('.btn-redeem').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.coupon-card');
        const couponTitle = card?.querySelector('.coupon-title')?.innerText || 'Love Coupon';
        window.trackLoveEvent(`Simmu REDEEMED coupon: "${couponTitle}" 🎟️`, '🎟️', 'coupon_redeem', { coupon: couponTitle });
      });
    });
  });
})();
