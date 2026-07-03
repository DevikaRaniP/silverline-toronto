// Local Resource Database for Toronto Seniors
const RESOURCES_DB = {
  medical: [
    {
      name: "Shoppers Drug Mart Prescription Delivery",
      description: "Direct-to-home prescription medication delivery service available across Toronto locations.",
      phone: "1-800-SHOPPERS",
      link: "https://www.shoppersdrugmart.ca",
      location: "Toronto-wide"
    },
    {
      name: "Toronto Ride",
      description: "Assisted transportation services for seniors to get to and from medical and health-related appointments.",
      phone: "416-614-2799",
      link: "http://www.torontoride.ca",
      location: "Toronto-wide"
    },
    {
      name: "Toronto Public Health Senior Dental Care",
      description: "Free routine dental care services for low-income seniors aged 65 and older.",
      phone: "416-338-7600",
      link: "https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/dental-services/free-dental-care-for-seniors/",
      location: "Multiple Clinic Locations"
    }
  ],
  financial: [
    {
      name: "Toronto Rent Bank",
      description: "Provides interest-free loans to low-income seniors to help prevent eviction or pay utility bills.",
      phone: "416-397-7368",
      link: "https://www.toronto.ca/community-people/employment-social-support/housing-support/financial-support-for-renters/toronto-rent-bank/",
      location: "Toronto-wide"
    },
    {
      name: "Ontario Senior GAINS Program",
      description: "Guaranteed Annual Income System providing monthly, non-taxable payments to low-income Ontario seniors.",
      phone: "1-866-668-8297",
      link: "https://www.ontario.ca/page/guaranteed-annual-income-system-payments-gains",
      location: "Ontario"
    },
    {
      name: "Low-Income Energy Assistance Program (LEAP)",
      description: "Provides one-time emergency financial assistance to help seniors pay overdue electricity or gas bills.",
      phone: "1-877-323-2882",
      link: "https://www.oeb.ca/consumer-information-and-protection/bill-assistance-programs/low-income-energy-assistance-program",
      location: "Ontario-wide"
    }
  ],
  domestic: [
    {
      name: "WoodGreen Community Services - Homemaking",
      description: "Assistance with light housekeeping, grocery shopping, laundry, and meal preparation for seniors.",
      phone: "416-510-3812",
      link: "https://www.woodgreen.org",
      location: "East Toronto / Toronto-wide"
    },
    {
      name: "Toronto Senior Services Home Maintenance",
      description: "Local volunteers assisting with lawn care, snow removal, and minor home repairs for elderly residents.",
      phone: "416-392-8579",
      link: "https://www.toronto.ca/community-people/children-parenting/seniors-services/",
      location: "Toronto-wide"
    },
    {
      name: "Sprint Senior Care",
      description: "Provides grocery drop-offs, senior community luncheons, and friendly visiting program to reduce isolation.",
      phone: "416-481-6411",
      link: "https://sprintseniorcare.org",
      location: "North Toronto"
    }
  ],
  mentalhealth: [
    {
      name: "CAMH Geriatric Psychiatry Outreach",
      description: "Clinical assessments and treatment plans for seniors experiencing late-life mental health challenges.",
      phone: "416-535-8501",
      link: "https://www.camh.ca",
      location: "100 Stokes St, Toronto"
    },
    {
      name: "Toronto Distress Centres Hotline",
      description: "24/7 empathetic crisis support and suicide prevention services over the phone for elderly in emotional pain.",
      phone: "416-408-4357",
      link: "https://www.torontodistresscentre.com",
      location: "Toronto-wide"
    }
  ]
};

// Global Application State
const STATE = {
  mode: 'triage', // 'triage', 'resource', 'emergency'
  postalCode: '',
  category: '',
  description: '',
  chatStep: 'welcome', // 'welcome', 'get_postal', 'get_category', 'get_description', 'completed'
  voiceEnabled: true,
  currentUtterance: null
};

// High-Risk Emergency Phrases (Self-Harm, Medical/Safety Critical)
const HIGH_RISK_TRIGGERS = [
  "self-harm", "suicide", "hurt myself", "kill myself", "want to die", "end my life",
  "chest pain", "cannot breathe", "hard to breathe", "heart attack", "collapsed", "unconscious",
  "elder abuse", "hit me", "hurt me", "beating", "stroke", "bleeding heavily", "house fire", "house collapse"
];

// DOM Elements
const docBody = document.body;
const chatHistory = document.getElementById('chat-history');
const quickRepliesContainer = document.getElementById('quick-replies');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const btnMic = document.getElementById('btn-mic');
const btnVoiceToggle = document.getElementById('btn-voice-toggle');
const voiceStatusText = document.getElementById('voice-status-text');
const voiceIcon = document.getElementById('voice-icon');
const emergencyBanner = document.getElementById('emergency-banner');

// Case status update elements
const badgeMode = document.getElementById('badge-mode');
const casePostalCodeEl = document.getElementById('case-postal-code');
const caseCategoryEl = document.getElementById('case-category');
const caseAssessmentEl = document.getElementById('case-assessment');
const resourcesList = document.getElementById('resources-list');

// Init application
document.addEventListener('DOMContentLoaded', () => {
  setupAccessibilityEvents();
  setupEmergencyButtons();
  setupSpeechRecognition();
  startAgentIntake();
});

// START INTAKE FLOW
function startAgentIntake() {
  clearChat();
  STATE.mode = 'triage';
  STATE.postalCode = '';
  STATE.category = '';
  STATE.description = '';
  STATE.chatStep = 'get_postal';
  
  updateSidebarUI();
  
  addBotMessage(
    "Hello! Welcome to SilverLine Toronto. I am here to help you get the support you need. To start, may I please have your 6-digit postal code?"
  );
}

// ACCESS ACCESSIBILITY SETTINGS
function setupAccessibilityEvents() {
  // Text Size Pill Buttons
  const btnNormal = document.getElementById('btn-text-normal');
  const btnLarge = document.getElementById('btn-text-large');
  const btnXLarge = document.getElementById('btn-text-xlarge');

  btnNormal.addEventListener('click', () => changeTextSize('medium', btnNormal));
  btnLarge.addEventListener('click', () => changeTextSize('large', btnLarge));
  btnXLarge.addEventListener('click', () => changeTextSize('xlarge', btnXLarge));

  // Contrast Mode Toggle
  const btnContrast = document.getElementById('btn-contrast-toggle');
  btnContrast.addEventListener('click', () => {
    docBody.classList.toggle('high-contrast');
    const isHC = docBody.classList.contains('high-contrast');
    announceAccessibilityChange(isHC ? "High contrast mode enabled." : "High contrast mode disabled.");
  });

  // Voice Read Aloud Toggle
  btnVoiceToggle.addEventListener('click', () => {
    STATE.voiceEnabled = !STATE.voiceEnabled;
    if (STATE.voiceEnabled) {
      btnVoiceToggle.classList.add('active');
      voiceStatusText.textContent = "ON";
      voiceIcon.className = "fa-solid fa-volume-high";
      speakText("Voice reading is now turned on.");
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      btnVoiceToggle.classList.remove('active');
      voiceStatusText.textContent = "OFF";
      voiceIcon.className = "fa-solid fa-volume-xmark";
    }
  });

  // Restart Button
  document.getElementById('btn-restart').addEventListener('click', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    // Reset emergency override
    docBody.classList.remove('emergency-active');
    emergencyBanner.classList.add('hidden');
    chatForm.classList.remove('hidden');
    startAgentIntake();
  });
}

function changeTextSize(size, activeButton) {
  docBody.classList.remove('text-medium', 'text-large', 'text-xlarge');
  docBody.classList.add(`text-${size}`);
  
  document.querySelectorAll('.control-group .btn-pill').forEach(btn => btn.classList.remove('active'));
  activeButton.classList.add('active');
  
  announceAccessibilityChange(`Text size changed to ${size}.`);
}

function announceAccessibilityChange(text) {
  // For screen readers
  const ariaAnnounce = document.createElement('div');
  ariaAnnounce.setAttribute('aria-live', 'assertive');
  ariaAnnounce.setAttribute('class', 'skip-link'); // hidden off screen
  ariaAnnounce.textContent = text;
  document.body.appendChild(ariaAnnounce);
  setTimeout(() => ariaAnnounce.remove(), 2000);
}

// SIMULATE DISPATCH / CALLS FOR SENIORS
function setupEmergencyButtons() {
  document.getElementById('btn-call-911').addEventListener('click', () => {
    alert("SYSTEM SIMULATION: Initiating direct dial to emergency services (911).");
  });
  document.getElementById('btn-call-distress').addEventListener('click', () => {
    alert("SYSTEM SIMULATION: Connecting call to Toronto Distress Centre (416-408-4357).");
  });
}

// SPEECH TO TEXT (SPEECH RECOGNITION)
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    btnMic.style.display = 'none'; // Hide microphone if browser doesn't support it
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-CA';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  btnMic.addEventListener('click', () => {
    if (btnMic.classList.contains('listening')) {
      recognition.stop();
    } else {
      btnMic.classList.add('listening');
      btnMic.querySelector('i').className = "fa-solid fa-microphone-lines";
      recognition.start();
    }
  });

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    userInput.value = text;
  };

  recognition.onspeechend = () => {
    recognition.stop();
  };

  recognition.onend = () => {
    btnMic.classList.remove('listening');
    btnMic.querySelector('i').className = "fa-solid fa-microphone";
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    btnMic.classList.remove('listening');
    btnMic.querySelector('i').className = "fa-solid fa-microphone";
  };
}

// VOICE TEXT-TO-SPEECH (TTS)
function speakText(text) {
  if (!STATE.voiceEnabled || !window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // Stop any active speech
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slightly slower, more legible for seniors
  
  // Find a nice natural voice (preferably English/Canada or English/US)
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith('en-CA') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  STATE.currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// HANDLE MESSAGES IN CHAT
function clearChat() {
  chatHistory.innerHTML = '';
}

function addBotMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message bot';
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  msgDiv.appendChild(bubble);

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  
  const time = document.createElement('span');
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  meta.appendChild(time);

  // Read aloud button inside the bubble
  const btnRead = document.createElement('button');
  btnRead.className = 'btn-bubble-voice';
  btnRead.innerHTML = '<i class="fa-solid fa-volume-high"></i> Read';
  btnRead.addEventListener('click', () => speakText(text));
  meta.appendChild(btnRead);

  msgDiv.appendChild(meta);
  chatHistory.appendChild(msgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Read automatically if voice enabled
  speakText(text);
}

function addUserMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  msgDiv.appendChild(bubble);

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  const time = document.createElement('span');
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  meta.appendChild(time);

  msgDiv.appendChild(meta);
  chatHistory.appendChild(msgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// INTERACTIVE INTAKE FLOW ENGINE
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const inputVal = userInput.value.trim();
  if (!inputVal) return;

  userInput.value = '';
  addUserMessage(inputVal);

  processUserInput(inputVal);
});

function processUserInput(input) {
  if (STATE.chatStep === 'get_postal') {
    handlePostalCodeInput(input);
  } else if (STATE.chatStep === 'get_category') {
    handleCategoryInput(input);
  } else if (STATE.chatStep === 'get_description') {
    handleDescriptionInput(input);
  }
}

// POSTAL CODE HANDLER
function handlePostalCodeInput(input) {
  // Regex for Canadian Postal Code
  const cleaned = input.toUpperCase().replace(/\s+/g, '');
  const postalRegex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;

  if (!postalRegex.test(cleaned)) {
    addBotMessage("I am sorry, that doesn't seem to be a valid 6-digit postal code. Please double-check it and type it like 'M4B 1B3' or 'M5V 2T6'.");
    return;
  }

  // Check Geo-fence (must start with M for Toronto)
  if (!cleaned.startsWith('M')) {
    STATE.mode = 'triage';
    STATE.chatStep = 'completed';
    updateSidebarUI();
    addBotMessage(
      `I see your postal code begins with "${input.substring(0, 1).toUpperCase()}". SilverLine Toronto is only able to service residents within the City of Toronto (postal codes starting with 'M'). Let me direct you to the National Senior Support Line. Please dial 2-1-1 on your telephone to talk to an agent in your local region.`
    );
    showRestartOption();
    return;
  }

  // Postal code is valid Toronto!
  STATE.postalCode = cleaned.replace(/(\w{3})(\w{3})/, '$1 $2'); // format with space M5V 2T6
  STATE.chatStep = 'get_category';
  updateSidebarUI();

  addBotMessage("Wonderful, I have verified your location in Toronto. Next, what type of assistance do you need today? You can type one of the options or click a button below:");
  
  // Show quick replies buttons
  showQuickCategoryReplies();
}

// CATEGORY OF DISTRESS HANDLER
function showQuickCategoryReplies() {
  quickRepliesContainer.innerHTML = '';
  quickRepliesContainer.classList.remove('hidden');

  const categories = [
    { text: "Medical Help (Non-Emergency)", value: "medical" },
    { text: "Financial Aid", value: "financial" },
    { text: "Help Around the House", value: "domestic" },
    { text: "Emotional Support", value: "mentalhealth" }
  ];

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = cat.text;
    btn.addEventListener('click', () => {
      addUserMessage(cat.text);
      quickRepliesContainer.classList.add('hidden');
      selectCategory(cat.value, cat.text);
    });
    quickRepliesContainer.appendChild(btn);
  });
}

function handleCategoryInput(input) {
  const norm = input.toLowerCase();
  let catVal = '';
  let catDisplay = '';

  if (norm.includes('medic') || norm.includes('doctor') || norm.includes('health') || norm.includes('pharmacy')) {
    catVal = 'medical';
    catDisplay = 'Medical Help (Non-Emergency)';
  } else if (norm.includes('financ') || norm.includes('money') || norm.includes('rent') || norm.includes('bill') || norm.includes('cash')) {
    catVal = 'financial';
    catDisplay = 'Financial Aid';
  } else if (norm.includes('house') || norm.includes('home') || norm.includes('repair') || norm.includes('domestic') || norm.includes('snow') || norm.includes('grocery')) {
    catVal = 'domestic';
    catDisplay = 'Help Around the House';
  } else if (norm.includes('emotion') || norm.includes('mental') || norm.includes('distress') || norm.includes('lonely') || norm.includes('talk')) {
    catVal = 'mentalhealth';
    catDisplay = 'Emotional Support';
  }

  if (!catVal) {
    addBotMessage("Please pick one of the core services: 'Medical Help', 'Financial Aid', 'Help Around the House', or 'Emotional Support'.");
    showQuickCategoryReplies();
    return;
  }

  quickRepliesContainer.classList.add('hidden');
  selectCategory(catVal, catDisplay);
}

function selectCategory(catVal, catDisplay) {
  STATE.category = catVal;
  STATE.chatStep = 'get_description';
  updateSidebarUI();

  addBotMessage(`You selected "${catDisplay}". Please write a brief description of what you are experiencing. For example: "I need someone to deliver my prescription" or "I cannot pay my heating bill".`);
}

// DESCRIPTION & HIGH-RISK EVALUATOR HANDLER
function handleDescriptionInput(input) {
  STATE.description = input;
  
  // 1. EVALUATE HIGH-RISK TRIGGERS (BEAST MODE ESCALATION)
  const isHighRisk = HIGH_RISK_TRIGGERS.some(trigger => input.toLowerCase().includes(trigger));

  if (isHighRisk) {
    triggerEmergencyEscalation(input);
    return;
  }

  // 2. RESOURCE RETRIEVAL MODE
  STATE.mode = 'resource';
  STATE.chatStep = 'completed';
  updateSidebarUI();

  // Find local matches
  const matches = queryResources(STATE.category, input);
  displayResources(matches);

  if (matches.length > 0) {
    addBotMessage(`Thank you for sharing your situation. I have searched the local directory and matched you with ${matches.length} services in Toronto. You can find their details and phone numbers on the right side of the screen. Let me know if you need anything else!`);
  } else {
    // Fallback strategy: Toronto 211 central registry
    addBotMessage("I searched our database but could not find a specific local match for that request. However, the general Toronto 211 Service Registry is available. Please call 2-1-1 on your telephone to find more local volunteer programs.");
    displayFallbackResource();
  }

  showRestartOption();
}

// EMERGENCY SERVICES FLAGGING & URGENT TRIAGE
function triggerEmergencyEscalation(situationText) {
  STATE.mode = 'emergency';
  STATE.chatStep = 'completed';
  updateSidebarUI();

  // Simulated tool call execution notice: flag_emergency_services
  console.warn("MOCK TOOL EXECUTION: flag_emergency_services called for senior in distress. Situation:", situationText);

  // Visual HUD state update
  docBody.classList.add('emergency-active');
  emergencyBanner.classList.remove('hidden');
  chatForm.classList.add('hidden'); // Hide input so they focus on helplines

  addBotMessage(
    "CRITICAL WARNING: Your message indicates you may be in immediate danger or distress. We have simulated an emergency dispatch flag to Toronto Police Services and Toronto Distress Centres. Please dial 9-1-1 on your phone right now. You can also call the Toronto Distress Helpline at 416-408-4357. Please stay on the line or contact these numbers immediately."
  );
}

// DYNAMIC RESOURCE RETRIEVAL
function queryResources(category, text) {
  const pool = RESOURCES_DB[category] || [];
  const words = text.toLowerCase().split(/\s+/);
  
  // Simple scoring search
  return pool.map(res => {
    let score = 0;
    // Category match is implicit. Now match keywords in description/name
    words.forEach(word => {
      if (word.length > 3) {
        if (res.name.toLowerCase().includes(word)) score += 3;
        if (res.description.toLowerCase().includes(word)) score += 1;
      }
    });
    return { ...res, score };
  })
  .sort((a, b) => b.score - a.score);
}

function displayResources(resources) {
  resourcesList.innerHTML = '';

  if (resources.length === 0) {
    resourcesList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-face-sad-tear"></i>
        <p>No direct database matches found. General assistance registry loaded below.</p>
      </div>
    `;
    return;
  }

  resources.forEach(res => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.innerHTML = `
      <h4>${res.name} <span class="badge mode-resource">Matched</span></h4>
      <p>${res.description}</p>
      <div class="resource-card-actions">
        <a href="tel:${res.phone.replace(/-/g, '')}" class="btn-card-action">
          <i class="fa-solid fa-phone"></i> Call: ${res.phone}
        </a>
        <a href="${res.link}" target="_blank" rel="noopener" class="btn-card-action">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Website
        </a>
      </div>
    `;
    resourcesList.appendChild(card);
  });
}

function displayFallbackResource() {
  resourcesList.innerHTML = `
    <div class="resource-card" style="border-color: var(--warning);">
      <h4 style="color: var(--warning);">Toronto 211 Community Registry <span class="badge mode-triage">Central Fallback</span></h4>
      <p>A comprehensive central registry of over 20,000 community, social, health, and government services in Toronto.</p>
      <div class="resource-card-actions">
        <a href="tel:211" class="btn-card-action" style="color: var(--warning);">
          <i class="fa-solid fa-phone"></i> Dial 2-1-1 (Free)
        </a>
        <a href="https://211toronto.ca" target="_blank" rel="noopener" class="btn-card-action" style="color: var(--warning);">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit 211 Website
        </a>
      </div>
    </div>
  `;
}

// RESET / RESTART INTERACTIVE FLOWS
function showRestartOption() {
  quickRepliesContainer.innerHTML = '';
  quickRepliesContainer.classList.remove('hidden');

  const btn = document.createElement('button');
  btn.className = 'quick-reply-btn';
  btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Restart Session';
  btn.addEventListener('click', () => {
    quickRepliesContainer.classList.add('hidden');
    startAgentIntake();
  });
  quickRepliesContainer.appendChild(btn);
}

// SIDEBAR CASE PROGRESS UI
function updateSidebarUI() {
  // Update mode badge
  if (STATE.mode === 'triage') {
    badgeMode.textContent = "Triage Mode";
    badgeMode.className = "badge mode-triage";
    caseAssessmentEl.textContent = "Assessing Risk";
    caseAssessmentEl.className = "value";
  } else if (STATE.mode === 'resource') {
    badgeMode.textContent = "Resource Mode";
    badgeMode.className = "badge mode-resource";
    caseAssessmentEl.textContent = "Safe & Local Matched";
    caseAssessmentEl.className = "value status-ok";
  } else if (STATE.mode === 'emergency') {
    badgeMode.textContent = "Emergency Mode";
    badgeMode.className = "badge mode-emergency";
    caseAssessmentEl.textContent = "Emergency Dispatched";
    caseAssessmentEl.className = "value status-alert";
  }

  // Update postal code
  if (STATE.postalCode) {
    casePostalCodeEl.textContent = STATE.postalCode;
    casePostalCodeEl.classList.remove('empty');
  } else {
    casePostalCodeEl.textContent = "Not Provided";
    casePostalCodeEl.classList.add('empty');
  }

  // Update category
  if (STATE.category) {
    const catsMap = {
      medical: "Medical Help",
      financial: "Financial Support",
      domestic: "Help Around House",
      mentalhealth: "Emotional Support"
    };
    caseCategoryEl.textContent = catsMap[STATE.category];
    caseCategoryEl.classList.remove('empty');
  } else {
    caseCategoryEl.textContent = "Not Selected";
    caseCategoryEl.classList.add('empty');
  }

  // Clear matches if restarting
  if (STATE.chatStep === 'get_postal') {
    resourcesList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass-location"></i>
        <p>State your needs in the chat to automatically match verified local Toronto assistance programs.</p>
      </div>
    `;
  }
}
