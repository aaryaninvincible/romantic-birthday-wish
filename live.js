// =================================================================
// ARYAN'S LIVE LOVE RADAR - JAVASCRIPT CONTROLLER
// Realtime Firestore listener & telemetry stream
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  if (typeof firebase === 'undefined') {
    alert('Firebase SDK failed to load. Check internet connection.');
    return;
  }

  const db = firebase.firestore();
  const sessionRef = db.collection('simmu_sessions').doc('simmu_live');
  const eventsRef = db.collection('simmu_live_events');
  const pingsRef = db.collection('simmu_pings');

  // DOM Elements
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const currentScreenTitle = document.getElementById('current-screen-title');
  const currentScreenDesc = document.getElementById('current-screen-desc');
  const currentScreenIcon = document.getElementById('current-screen-icon');
  const scrollPercentText = document.getElementById('scroll-percent-text');
  const progressBarFill = document.getElementById('progress-bar-fill');

  const proposalStatusBanner = document.getElementById('proposal-status-banner');
  const proposalTitle = document.getElementById('proposal-title');
  const proposalDesc = document.getElementById('proposal-desc');
  const proposalIcon = document.getElementById('proposal-icon');

  const mCandleStatus = document.getElementById('m-candle-status');
  const mCakeStatus = document.getElementById('m-cake-status');
  const mMusicStatus = document.getElementById('m-music-status');
  const mLetterStatus = document.getElementById('m-letter-status');

  const mCandle = document.getElementById('m-candle');
  const mCake = document.getElementById('m-cake');
  const mLetter = document.getElementById('m-letter');

  const sessionDevice = document.getElementById('session-device');
  const sessionResolution = document.getElementById('session-resolution');
  const sessionStarted = document.getElementById('session-started');
  const sessionLastSeen = document.getElementById('session-last-seen');

  const eventsTimeline = document.getElementById('events-timeline');
  const emptyFeedPlaceholder = document.getElementById('empty-feed-placeholder');
  const eventCounter = document.getElementById('event-counter');
  const clearFeedBtn = document.getElementById('clear-feed-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');

  const customPingInput = document.getElementById('custom-ping-input');
  const sendCustomPingBtn = document.getElementById('send-custom-ping-btn');

  // State
  let soundEnabled = true;
  let activeFilter = 'all';
  let allEvents = [];
  let isFirstLoad = true;

  // Web Audio Chime Synthesizer
  let audioCtx = null;
  function playAlertChime() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  }

  // Toggle Sound Button
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🔔' : '🔕';
    soundLabel.textContent = soundEnabled ? 'Sound On' : 'Sound Muted';
    if (soundEnabled) playAlertChime();
  });

  // Map Screen Names to Icons
  function getScreenIcon(sectionName) {
    if (!sectionName) return '📍';
    if (sectionName.includes('Proposal') || sectionName.includes('Ring')) return '💍';
    if (sectionName.includes('Sunrise') || sectionName.includes('Mountain')) return '🌄';
    if (sectionName.includes('Rose Garden')) return '🌹';
    if (sectionName.includes('Empty Road') || sectionName.includes('Night')) return '🌌';
    if (sectionName.includes('Cake') || sectionName.includes('Candle')) return '🎂';
    if (sectionName.includes('Cinema') || sectionName.includes('Movie')) return '🎬';
    if (sectionName.includes('Letter')) return '💌';
    if (sectionName.includes('Memories') || sectionName.includes('Polaroid')) return '📸';
    if (sectionName.includes('Happy Birthday') || sectionName.includes('Hero')) return '👑';
    if (sectionName.includes('Lock')) return '🔒';
    return '📍';
  }

  // 1. LISTEN TO SIMMU'S LIVE SESSION STATE
  sessionRef.onSnapshot((doc) => {
    if (!doc.exists) {
      statusDot.className = 'status-indicator-dot offline';
      statusText.textContent = 'No session started yet';
      return;
    }

    const data = doc.data();
    const now = Date.now();
    const lastSeenDiff = now - (data.lastSeen || 0);
    const isOnline = lastSeenDiff < 15000 && data.isOnline !== false;

    // Online Status
    if (isOnline) {
      statusDot.className = 'status-indicator-dot online';
      statusText.textContent = 'Simmu is Online Now! 🟢';
    } else {
      statusDot.className = 'status-indicator-dot offline';
      const mins = Math.max(1, Math.round(lastSeenDiff / 60000));
      statusText.textContent = `Away (Last active ${mins}m ago)`;
    }

    // Current Screen
    const sectionName = data.currentSection || 'Screen 1: Lock Screen';
    currentScreenTitle.textContent = sectionName;
    currentScreenIcon.textContent = getScreenIcon(sectionName);
    currentScreenDesc.textContent = `Active at ${data.resolution || 'Unknown viewport'} &bull; ${data.cakeStyle || '3D Cake'} &bull; ${data.galleryStyle || 'Animated'}`;

    // Scroll Progress
    const scrollVal = Math.min(100, Math.max(0, data.scrollPercent || 0));
    scrollPercentText.textContent = `${scrollVal}%`;
    progressBarFill.style.width = `${scrollVal}%`;

    // Proposal Status
    if (data.proposalAnswer) {
      proposalStatusBanner.className = 'proposal-status-banner accepted';
      proposalTitle.textContent = '🎉 SIMMU SAID YES TO MARRIAGE! 💍❤';
      proposalDesc.textContent = `Answer: "${data.proposalAnswer}" — Congratulations Aryan & Simmu!`;
      proposalIcon.textContent = '💍';
    } else if (sectionName.includes('Proposal') || sectionName.includes('Ring')) {
      proposalTitle.textContent = 'Simmu is at the Proposal Scene right now! 💍';
      proposalDesc.textContent = 'She is looking at the 3D diamond ring and reading your proposal!';
    }

    // Milestones
    if (data.candleBlown) {
      mCandleStatus.textContent = 'Blown & Wished! ✨';
      mCandle.classList.add('completed');
    }
    if (data.cakeCut) {
      mCakeStatus.textContent = 'Sliced! 🍰';
      mCake.classList.add('completed');
    }
    if (data.musicPlaying !== undefined) {
      mMusicStatus.textContent = data.musicPlaying ? 'Playing 🎵' : 'Muted 🔇';
    }
    if (allEvents.some(e => e.label && e.label.includes('wax seal'))) {
      mLetterStatus.textContent = 'Opened & Read ❤';
      mLetter.classList.add('completed');
    }

    // Device details
    sessionDevice.textContent = data.device || 'Mobile';
    sessionResolution.textContent = data.resolution || 'Screen';
    sessionLastSeen.textContent = lastSeenDiff < 5000 ? 'Just now' : `${Math.round(lastSeenDiff / 1000)}s ago`;

    if (data.startedAt && data.startedAt.toDate) {
      sessionStarted.textContent = data.startedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }, (err) => {
    console.error('Session listener error:', err);
    statusText.textContent = 'Connection Error (retrying...)';
  });

  // 2. LISTEN TO LIVE ACTIVITY EVENTS STREAM
  eventsRef.orderBy('timestamp', 'desc').limit(100).onSnapshot((snapshot) => {
    const isNewIncoming = !isFirstLoad && snapshot.docChanges().some(c => c.type === 'added');
    isFirstLoad = false;

    allEvents = [];
    snapshot.forEach(doc => {
      allEvents.push({ id: doc.id, ...doc.data() });
    });

    eventCounter.textContent = `${allEvents.length} events`;

    if (isNewIncoming) {
      playAlertChime();
    }

    renderEventsFeed();
  }, (err) => {
    console.error('Events listener error:', err);
  });

  // Render Events Feed with Filter
  function renderEventsFeed() {
    eventsTimeline.innerHTML = '';

    const filtered = allEvents.filter(e => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'proposal_accepted') return e.category === 'proposal_accepted' || (e.label && e.label.includes('YES'));
      return e.category === activeFilter;
    });

    if (filtered.length === 0) {
      eventsTimeline.appendChild(emptyFeedPlaceholder);
      return;
    }

    filtered.forEach(ev => {
      const card = document.createElement('div');
      card.className = `timeline-event-card ${ev.category || 'click'}`;

      const icon = ev.icon || '✨';
      const label = ev.label || 'Action performed';
      const timeStr = ev.timeFormatted || (ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'Just now');
      const category = ev.category || 'event';

      card.innerHTML = `
        <div class="event-icon-box">${icon}</div>
        <div class="event-content">
          <div class="event-label">${label}</div>
          <div class="event-meta">
            <span class="event-time">🕒 ${timeStr}</span>
            <span class="event-category-tag">${category}</span>
          </div>
        </div>
      `;
      eventsTimeline.appendChild(card);
    });
  }

  // Filter Chips Click Handling
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter') || 'all';
      renderEventsFeed();
    });
  });

  // 3. SEND LIVE LOVE PINGS TO SIMMU'S SCREEN
  window.sendLovePing = function (message) {
    if (!message) return;
    pingsRef.add({
      message: message,
      timestamp: Date.now(),
      sender: 'Aryan ❤'
    }).then(() => {
      alert(`💖 Ping sent to Simmu's screen:\n"${message}"`);
    }).catch(err => {
      console.error(err);
      alert('Failed to send ping: ' + err.message);
    });
  };

  sendCustomPingBtn.addEventListener('click', () => {
    const text = customPingInput.value.trim();
    if (!text) return;
    window.sendLovePing(text);
    customPingInput.value = '';
  });

  // 4. CLEAR FEED BUTTON
  clearFeedBtn.addEventListener('click', async () => {
    if (!confirm('Clear all live feed events for a clean test?')) return;
    try {
      const snap = await eventsRef.get();
      const batch = db.batch();
      snap.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      allEvents = [];
      renderEventsFeed();
    } catch (e) {
      console.error('Clear feed failed:', e);
      alert('Could not clear feed: ' + e.message);
    }
  });
});
