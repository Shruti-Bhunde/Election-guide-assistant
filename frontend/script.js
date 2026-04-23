// ================= SCROLL REVEAL =================
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// ================= CHATBOT =================
const chatPanel = document.getElementById('chatPanel');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');

function toggleChat() {
    chatPanel.style.display = chatPanel.style.display === 'flex' ? 'none' : 'flex';
}

async function sendMessage() {
    const text = chatInput.value.trim();

    if (!text || text.length < 2) return;

    addMessage(text, 'user');
    chatInput.value = '';

    // Show loading message
    const loadingMsg = addMessage("Typing...", 'bot');

    try {
        const res = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: text })
        });

        const data = await res.json();

        // Replace loading text with actual response
        loadingMsg.textContent = data.reply;

    } catch (err) {
        console.error(err);
        loadingMsg.textContent = "⚠️ Unable to connect. Make sure server is running.";
    }
}

function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `msg msg-${sender}`;
    msg.textContent = text;

    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return msg; // important for updating "Typing..."
}

function handleChatEnter(e) {
    if (e.key === 'Enter') sendMessage();
}


// ================= WIZARD =================
const wizardContent = document.getElementById('wizard-content');
let wizardStep = 0;

const wizardSteps = [
    {
        title: "Are you a registered voter?",
        options: ["Yes, I am", "No, not yet"],
        callback: (choice) => {
            if (choice === 0) nextStep();
            else showMessage("⚠️ Please register first to continue.");
        }
    },
    {
        title: "Do you know your polling station?",
        options: ["Yes", "No, help me find it"],
        callback: () => nextStep()
    },
    {
        title: "Ready to vote?",
        options: ["Absolutely!", "I have more questions"],
        callback: () => showMessage("✅ Great! You're prepared. Every vote counts!")
    }
];

function startWizard() {
    wizardStep = 0;
    renderWizardStep(wizardStep);
}

function nextStep() {
    wizardStep++;
    if (wizardStep < wizardSteps.length) {
        renderWizardStep(wizardStep);
    }
}

function renderWizardStep(step) {
    const data = wizardSteps[step];

    wizardContent.innerHTML = `
        <h2 style="margin-bottom: 1.5rem;">${data.title}</h2>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            ${data.options.map((opt, i) => `
                <button class="btn btn-primary" onclick="handleWizardChoice(${i})">${opt}</button>
            `).join('')}
        </div>
    `;
}

function handleWizardChoice(index) {
    wizardSteps[wizardStep].callback(index);
}

function showMessage(text) {
    wizardContent.innerHTML = `
        <h2 style="margin-bottom: 1.5rem;">${text}</h2>
        <button class="btn glass" style="color: white;" onclick="startWizard()">Start Over</button>
    `;
}