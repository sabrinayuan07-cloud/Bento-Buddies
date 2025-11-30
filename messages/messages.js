
const contacts = [
    {
        id: 'eten',
        name: 'Eten Hunt',
        role: '',
        avatar: '../Images/panda1.png',
        lastMessage: "See you at 6! Can't wait to try it",
        time: '',
        unread: false
    },
    {
        id: 'jakob',
        name: 'Jakob Saris',
        role: '',
        avatar: '../Images/panda2.png',
        lastMessage: 'You : Yeah! 12:30 at Mahoney\'s works',
        time: '',
        unread: false
    },
    {
        id: 'jeremy1',
        name: 'Jeremy Zucker',
        role: '',
        avatar: '../Images/panda3.png',
        lastMessage: 'You : I know a great sushi place!',
        time: '4 m Ago',
        unread: false
    },
    {
        id: 'nadia',
        name: 'Nadia Lauren',
        role: '',
        avatar: '../Images/panda4.png',
        lastMessage: 'Down for brunch at noon?',
        time: '5 m Ago',
        unread: true
    },
    {
        id: 'emilyz',
        name: 'Emily Zhang',
        role: '',
        avatar: '../Images/panda5.png',
        lastMessage: 'You : Perfect! See you at Triple O\'s',
        time: '4 m Ago',
        unread: false
    },
    {
        id: 'carolina5',
        name: 'Carolina Fernandez',
        role: '',
        avatar: '../Images/panda1.png',
        lastMessage: 'You : The ramen there is amazing!',
        time: '4 m Ago',
        unread: false
    }
];

const conversations = {
    jakob: [
        {
            id: 1,
            sender: 'received',
            message: "Hey! Want to grab lunch at Mahoney's today?",
            time: 'Today 11:56',
            hasVoice: true
        },
        {
            id: 2,
            sender: 'sent',
            message: "Yeah! 12:30 at Mahoney's works for me",
            time: 'Today 11:58'
        }
    ],
    eten: [
        {
            id: 1,
            sender: 'received',
            message: "Just joined your meetup for dinner tonight!",
            time: 'Yesterday 14:23'
        },
        {
            id: 2,
            sender: 'sent',
            message: "Awesome! It's at the new Thai place on Main Mall",
            time: 'Yesterday 14:25'
        },
        {
            id: 3,
            sender: 'received',
            message: "See you at 6! Can't wait to try it",
            time: 'Yesterday 14:27'
        }
    ],
    jeremy1: [
        {
            id: 1,
            sender: 'received',
            message: 'Any good sushi spots near campus?',
            time: '6 m Ago'
        },
        {
            id: 2,
            sender: 'sent',
            message: 'I know a great sushi place! Sushi Garden near the bookstore',
            time: '4 m Ago'
        }
    ],
    nadia: [
        {
            id: 1,
            sender: 'received',
            message: 'Down for brunch at noon?',
            time: '5 m Ago'
        }
    ],
    emilyz: [
        {
            id: 1,
            sender: 'received',
            message: "I'm craving burgers, want to join?",
            time: '10 m Ago'
        },
        {
            id: 2,
            sender: 'sent',
            message: "Perfect! See you at Triple O's in 15?",
            time: '8 m Ago'
        }
    ],
    carolina5: [
        {
            id: 1,
            sender: 'received',
            message: 'Where should we go for our study break?',
            time: '1 h Ago'
        },
        {
            id: 2,
            sender: 'sent',
            message: 'The ramen there is amazing! Hokkaido Ramen Santouka?',
            time: '58 m Ago'
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

function getInitials(name) {
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
        return nameParts[0][0] + nameParts[1][0];
    }
    return name.substring(0, 2);
}

function getGradientForName(name) {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)'
    ];

    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
}

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

        const initials = getInitials(contact.name);
        const gradient = getGradientForName(contact.name);

        contactDiv.innerHTML = `
            <div class="contact-avatar" style="background: ${gradient};">
                <span style="color: white; font-weight: 600; font-size: 16px;">${initials}</span>
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
        contact.lastMessage = text.length > 35 ? `You : ${text.substring(0, 35)}...` : `You : ${text}`;
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