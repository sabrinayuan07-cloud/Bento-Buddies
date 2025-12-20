// Messages Page - Real-time Messaging with Firestore
import { auth } from '../../firebase-config.js';
import {
    getUserConversations,
    onConversationsChange,
    getMessages,
    onMessagesChange,
    sendMessage,
    markConversationAsRead,
    getOrCreateConversation
} from '../services/message.service.js';
import { requireAuth } from '../services/auth.service.js';
import { searchUsers } from '../services/user.service.js';
import { showError, showSuccess } from '../utils/error-handler.js';
import { getRelativeTime } from '../utils/date-helpers.js';

let currentUser = null;
let currentConversationId = null;
let selectedContactId = null;
let conversations = [];
let unsubscribeMessages = null;
let unsubscribeConversations = null;

// DOM elements
const contactList = document.getElementById('contactList');
const messagesArea = document.getElementById('messagesArea');
const searchInput = document.getElementById('searchInput');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Initialize
async function init() {
    try {
        currentUser = await requireAuth();
        loadConversations();
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '../index/index.html';
    }
}

// Load conversations with real-time updates
function loadConversations() {
    // Unsubscribe from previous listener
    if (unsubscribeConversations) {
        unsubscribeConversations();
    }

    // Real-time listener for conversations
    unsubscribeConversations = onConversationsChange(currentUser.uid, (updatedConversations) => {
        conversations = updatedConversations;
        renderContacts();

        // If a conversation was selected, keep it selected
        if (currentConversationId) {
            loadMessages(currentConversationId);
        } else if (conversations.length > 0) {
            // Auto-select first conversation
            selectConversation(conversations[0]);
        } else {
            // No conversations yet
            showEmptyState();
        }
    });
}

// Load messages for a conversation with real-time updates
function loadMessages(conversationId) {
    // Unsubscribe from previous message listener
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    // Real-time listener for messages
    unsubscribeMessages = onMessagesChange(conversationId, (messages) => {
        renderMessages(messages);

        // Mark conversation as read
        markConversationAsRead(conversationId, currentUser.uid);
    });
}

// Render contacts list
function renderContacts() {
    contactList.innerHTML = '';

    if (conversations.length === 0) {
        contactList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <p>No conversations yet</p>
                <p style="font-size: 14px; margin-top: 10px;">Start a conversation by creating or joining a meetup!</p>
            </div>
        `;
        return;
    }

    conversations.forEach(conversation => {
        const otherUserId = conversation.participants.find(id => id !== currentUser.uid);
        const otherUser = conversation.participantDetails[otherUserId];

        if (!otherUser) return; // Skip if no user details

        const contactDiv = document.createElement('div');
        contactDiv.className = `contact-item ${conversation.id === currentConversationId ? 'active' : ''}`;
        contactDiv.onclick = () => selectConversation(conversation);

        const initials = getInitials(otherUser.name);
        const gradient = getGradientForName(otherUser.name);
        const unreadCount = conversation.unreadCount?.[currentUser.uid] || 0;
        const hasUnread = unreadCount > 0;

        // Format last message time
        const timeAgo = conversation.lastMessageTime
            ? getRelativeTime(conversation.lastMessageTime)
            : '';

        let statusHTML = '';
        if (hasUnread) {
            statusHTML = '<div class="unread-dot"></div>';
        } else {
            statusHTML = '<div class="read-check">✓✓</div>';
        }

        contactDiv.innerHTML = `
            <div class="contact-avatar" style="background: ${gradient};">
                <span style="color: white; font-weight: 600; font-size: 16px;">${initials}</span>
            </div>
            <div class="contact-info">
                <div class="contact-header">
                    <span class="contact-name">${otherUser.name}</span>
                </div>
                <p class="contact-message">${conversation.lastMessage || 'No messages yet'}</p>
            </div>
            <div class="contact-status">
                ${timeAgo ? `<span class="contact-time">${timeAgo}</span>` : ''}
                ${statusHTML}
            </div>
        `;

        contactList.appendChild(contactDiv);
    });
}

// Render messages
function renderMessages(messages) {
    messagesArea.innerHTML = '';

    if (messages.length === 0) {
        messagesArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }

    messages.forEach(msg => {
        const isCurrentUser = msg.senderId === currentUser.uid;
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message-wrapper ${isCurrentUser ? 'sent' : 'received'}`;

        // Voice note support (for future)
        let voiceHTML = '';
        if (msg.type === 'voice' && msg.voiceNoteUrl) {
            voiceHTML = `
                <div class="voice-note">
                    <div class="voice-waveform">
                        ${generateWaveform()}
                    </div>
                </div>
            `;
        }

        const timestamp = msg.timestamp ? getRelativeTime(msg.timestamp) : 'Just now';

        messageWrapper.innerHTML = `
            ${voiceHTML}
            <div class="message-bubble ${isCurrentUser ? 'sent' : 'received'}">
                <p>${escapeHtml(msg.text)}</p>
            </div>
            <span class="message-time">${timestamp}</span>
        `;

        messagesArea.appendChild(messageWrapper);
    });

    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Select conversation
function selectConversation(conversation) {
    currentConversationId = conversation.id;
    selectedContactId = conversation.id;

    renderContacts();
    loadMessages(conversation.id);
}

// Send message
async function handleSendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentConversationId) return;

    try {
        const result = await sendMessage(
            currentConversationId,
            currentUser.uid,
            currentUser.displayName || 'You',
            text
        );

        if (result.success) {
            messageInput.value = '';
        } else {
            showError(result.error || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Failed to send message');
    }
}

// Search contacts
searchInput.addEventListener('input', (e) => {
    const searchQuery = e.target.value.toLowerCase();

    // Filter conversations by name
    const filtered = conversations.filter(conv => {
        const otherUserId = conv.participants.find(id => id !== currentUser.uid);
        const otherUser = conv.participantDetails[otherUserId];
        return otherUser?.name.toLowerCase().includes(searchQuery);
    });

    // Render filtered contacts
    contactList.innerHTML = '';
    filtered.forEach(conversation => {
        const otherUserId = conversation.participants.find(id => id !== currentUser.uid);
        const otherUser = conversation.participantDetails[otherUserId];

        const contactDiv = document.createElement('div');
        contactDiv.className = `contact-item ${conversation.id === currentConversationId ? 'active' : ''}`;
        contactDiv.onclick = () => selectConversation(conversation);

        const initials = getInitials(otherUser.name);
        const gradient = getGradientForName(otherUser.name);
        const unreadCount = conversation.unreadCount?.[currentUser.uid] || 0;
        const hasUnread = unreadCount > 0;
        const timeAgo = conversation.lastMessageTime
            ? getRelativeTime(conversation.lastMessageTime)
            : '';

        contactDiv.innerHTML = `
            <div class="contact-avatar" style="background: ${gradient};">
                <span style="color: white; font-weight: 600; font-size: 16px;">${initials}</span>
            </div>
            <div class="contact-info">
                <div class="contact-header">
                    <span class="contact-name">${otherUser.name}</span>
                </div>
                <p class="contact-message">${conversation.lastMessage || 'No messages yet'}</p>
            </div>
            <div class="contact-status">
                ${timeAgo ? `<span class="contact-time">${timeAgo}</span>` : ''}
                ${hasUnread ? '<div class="unread-dot"></div>' : '<div class="read-check">✓✓</div>'}
            </div>
        `;

        contactList.appendChild(contactDiv);
    });
});

// Send button click
sendBtn.addEventListener('click', handleSendMessage);

// Enter key to send
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Helper functions
function getInitials(name) {
    if (!name) return '??';
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

function generateWaveform() {
    let html = '';
    for (let i = 0; i < 30; i++) {
        const height = Math.floor(Math.random() * 20) + 10;
        html += `<div class="wave-bar" style="height: ${height}px;"></div>`;
    }
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showEmptyState() {
    messagesArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; padding: 40px; text-align: center;">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" style="margin-bottom: 20px;">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3 style="margin-bottom: 10px; color: #333;">No Messages Yet</h3>
            <p style="max-width: 300px;">When you join meetups or connect with other students, your conversations will appear here.</p>
        </div>
    `;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (unsubscribeMessages) unsubscribeMessages();
    if (unsubscribeConversations) unsubscribeConversations();
});

// Initialize the page
init();
