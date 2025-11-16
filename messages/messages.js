
const contacts = [
    {
        id: 'eten',
        name: 'Eten Hunt',
        role: '',
        avatar: 'images/panda1.png',
        lastMessage: "Thank you very much. I'm glad ...",
        time: '',
        unread: false
    },
    {
        id: 'jakob',
        name: 'Jakob Saris',
        role: '',
        avatar: 'images/panda2.png',
        lastMessage: 'You : Sure! let me tell you about w...',
        time: '',
        unread: false
    },
    {
        id: 'jeremy1',
        name: 'Jeremy Zucker',
        role: '',
        avatar: 'images/panda3.png',
        lastMessage: 'You : Sure! let me teach you about ...',
        time: '4 m Ago',
        unread: false
    },
    {
        id: 'nadia',
        name: 'Nadia Lauren',
        role: '',
        avatar: 'images/panda4.png',
        lastMessage: 'Is there anything I can help? Just ...',
        time: '5 m Ago',
        unread: true
    },
    {
        id: 'emilyz',
        name: 'Emily Zhang',
        role: '',
        avatar: 'images/panda5.png',
        lastMessage: 'You : Sure! let me teach you about ...',
        time: '4 m Ago',
        unread: false
    },
    {
        id: 'carolina5',
        name: 'Carolina Fernandez',
        role: '',
        avatar: 'images/panda1.png',
        lastMessage: 'You : Sure! let me teach you about ...',
        time: '4 m Ago',
        unread: false
    }
];

const conversations = {
    jakob: [
        {
            id: 1,
            sender: 'received',
            message: "Hi, I'm interested in joining you for hotpot tmr!",
            time: 'Today 11:56',
            hasVoice: true
        }
    ],
    eten: [
        {
            id: 1,
            sender: 'received',
            message: "Thank you very much. I'm glad we could connect!",
            time: 'Yesterday 14:23'
        }
    ],
    jeremy1: [
        {
            id: 1,
            sender: 'sent',
            message: 'Sure! let me teach you about the campus.',
            time: '4 m Ago'
        }
    ],
    nadia: [
        {
            id: 1,
            sender: 'received',
            message: 'Is there anything I can help? Just let me know!',
            time: '5 m Ago'
        }
    ],
    jeremy2: [
        {
            id: 1,
            sender: 'sent',
            message: 'Sure! let me teach you about the campus.',
            time: '4 m Ago'
        }
    ],
    jeremy3: [
        {
            id: 1,
            sender: 'sent',
            message: 'Sure! let me teach you about the campus.',
            time: '4 m Ago'
        }
    ]
};

let selectedContactId = 'jakob';
let searchQuery = '';

const contactList = document.getElementById('contactList');
const messagesArea = document.getElementById('messagesArea');
const searchInput = document.getElementById('searchInput');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

function renderContacts() {
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    contactList.innerHTML = '';

    filteredContacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = `contact-item ${contact.id === selectedContactId ? 'active' : ''}`;
        contactDiv.onclick = () => selectContact(contact.id);

        let statusHTML = '';
        if (contact.unread) {
            statusHTML = '<div class="unread-dot"></div>';
        } else if (!contact.time) {
            statusHTML = '<div class="read-check">✓✓</div>';
        }

        contactDiv.innerHTML = `
            <div class="contact-avatar">
                <img src="${contact.avatar}" alt="${contact.name}">
            </div>
            <div class="contact-info">
                <div class="contact-header">
                    <span class="contact-name">${contact.name}</span>
                    ${contact.role ? `<span class="contact-role">${contact.role}</span>` : ''}
                </div>
                <p class="contact-message">${contact.lastMessage}</p>
            </div>
            <div class="contact-status">
                ${contact.time ? `<span class="contact-time">${contact.time}</span>` : ''}
                ${statusHTML}
            </div>
        `;

        contactList.appendChild(contactDiv);
    });
}

function generateWaveform() {
    let html = '';
    for (let i = 0; i < 30; i++) {
        const height = Math.floor(Math.random() * 20) + 10;
        html += `<div class="wave-bar" style="height: ${height}px;"></div>`;
    }
    return html;
}

function renderMessages() {
    const conversation = conversations[selectedContactId] || [];
    messagesArea.innerHTML = '';

    conversation.forEach(msg => {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message-wrapper ${msg.sender}`;

        let voiceHTML = '';
        if (msg.hasVoice) {
            voiceHTML = `
                <div class="voice-note">
                    <div class="voice-waveform">
                        ${generateWaveform()}
                    </div>
                </div>
            `;
        }

        messageWrapper.innerHTML = `
            ${voiceHTML}
            <div class="message-bubble ${msg.sender}">
                <p>${msg.message}</p>
            </div>
            <span class="message-time">${msg.time}</span>
        `;

        messagesArea.appendChild(messageWrapper);
    });

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function selectContact(contactId) {
    selectedContactId = contactId;
    
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        contact.unread = false;
    }
    
    renderContacts();
    renderMessages();
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const newMessage = {
        id: conversations[selectedContactId].length + 1,
        sender: 'sent',
        message: text,
        time: 'Just now'
    };

    conversations[selectedContactId].push(newMessage);

    const contact = contacts.find(c => c.id === selectedContactId);
    if (contact) {
        contact.lastMessage = `You : ${text.substring(0, 30)}...`;
        contact.unread = false;
    }

    messageInput.value = '';

    renderContacts();
    renderMessages();
}

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderContacts();
});

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

renderContacts();
renderMessages();