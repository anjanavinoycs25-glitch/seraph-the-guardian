/* =========================================================
   EMAILJS SETUP — REPLACE THESE FOUR VALUES
   1. Create a free account at https://www.emailjs.com
   2. Add an Email Service (e.g. Gmail) -> copy its Service ID
   3. Create an Email Template with these variables in the body:
        {{visitor_name}} {{visitor_age}} {{visitor_location}}
        {{visitor_email}} {{grievance}} {{submitted_at}}
      -> copy its Template ID
   4. Account > General > copy your Public Key
   ========================================================= */
const EMAILJS_PUBLIC_KEY = "ZfNE_wG_aMovMak-Z";
const EMAILJS_SERVICE_ID = "service_kat1hus";
const EMAILJS_TEMPLATE_ID = "template_w1hr0xu";
const HERO_OWNER_EMAIL = "anjanavinoy9@gmail.com"; // where the notification is sent

emailjs.init(EMAILJS_PUBLIC_KEY);

// ---------- DOM refs ----------
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatStatus = document.getElementById('chatStatus');

['navCta', 'heroCta', 'missionCta'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', openChat);
});
chatToggle.addEventListener('click', () => {
  chatPanel.classList.contains('open') ? closeChat() : openChat();
});
chatClose.addEventListener('click', closeChat);

function openChat() {
  chatPanel.classList.add('open');
  if (chatMessages.childElementCount === 0) startConversation();
}
function closeChat() { chatPanel.classList.remove('open'); }

// ---------- Conversation state machine ----------
const visitor = { name: '', age: '', location: '', email: '', grievance: '' };
let step = 'name';

const steps = {
  name: {
    ask: "Hey. I'm Seraph. You don't have to explain everything at once — let's start simple. What should I call you?",
    validate: v => v.trim().length > 0 || "Just a name to go by is fine.",
    save: v => visitor.name = v.trim(),
    next: 'age'
  },
  age: {
    ask: n => `It's good to meet you, ${n}. How old are you?`,
    validate: v => (/^\d{1,3}$/.test(v.trim()) ? true : "Just a number will do."),
    save: v => visitor.age = v.trim(),
    next: 'location'
  },
  location: {
    ask: () => "Where are you right now — a city is enough.",
    validate: v => v.trim().length > 0 || "Roughly where you are helps me find you.",
    save: v => visitor.location = v.trim(),
    next: 'email'
  },
  email: {
    ask: () => "And an email where I can reach you directly?",
    validate: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? true : "That doesn't look like a complete email address."),
    save: v => visitor.email = v.trim(),
    next: 'grievance'
  },
  grievance: {
    ask: () => "So... tell me. How can I help?",
    validate: v => v.trim().length > 3 || "Take your time. Tell me what's going on, in your own words.",
    save: v => visitor.grievance = v.trim(),
    next: 'done'
  },
  done: {
    ask: n => `I hear you, ${n}. You're not carrying this alone anymore — I'm already on my way.`,
    validate: () => true,
    save: () => {},
    next: null
  }
};

function startConversation() {
  chatStatus.textContent = 'watching over you';
  botSay(steps.name.ask);
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = chatInput.value;
  if (!value.trim() || step === 'done') return;

  userSay(value);
  chatInput.value = '';

  const current = steps[step];
  const result = current.validate(value);
  if (result !== true) {
    setTimeout(() => botSay(result), 400);
    return;
  }
  current.save(value);

  const next = current.next;
  setTimeout(() => {
    if (next === 'done') {
      submitGrievance();
    }
    step = next;
    const askText = typeof steps[next].ask === 'function' ? steps[next].ask(visitor.name) : steps[next].ask;
    botSay(askText);
    if (next === 'done') chatStatus.textContent = 'on her way';
  }, 500);
});

function botSay(text) {
  const el = document.createElement('div');
  el.className = 'msg bot';
  el.textContent = text;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function userSay(text) {
  const el = document.createElement('div');
  el.className = 'msg user';
  el.textContent = text;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ---------- Email notification ----------
function submitGrievance() {
  const submittedAt = new Date().toLocaleString();

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: HERO_OWNER_EMAIL,
    visitor_name: visitor.name,
    visitor_age: visitor.age,
    visitor_location: visitor.location,
    visitor_email: visitor.email,
    grievance: visitor.grievance,
    submitted_at: submittedAt
  }).then(() => {
    console.log('Notification email sent.');
  }).catch((err) => {
    console.error('EmailJS error — check your Service ID / Template ID / Public Key.', err);
  });
}