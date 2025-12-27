// Message Service
import { db, collection, doc, addDoc, getDoc, updateDoc, query, where, orderBy, getDocs, onSnapshot } from '../../firebase-config.js';
import { handleError } from '../utils/error-handler.js';
import { getUserProfile } from './user.service.js';

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(userId1, userId2) {
    try {
        // Find existing conversation
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId1)
        );

        const snapshot = await getDocs(q);
        let conversationId = null;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.participants.includes(userId2)) {
                conversationId = docSnap.id;
            }
        });

        // If conversation exists, return it
        if (conversationId) {
            return { success: true, id: conversationId };
        }

        // Create new conversation
        const user1Result = await getUserProfile(userId1);
        const user2Result = await getUserProfile(userId2);

        if (!user1Result.success || !user2Result.success) {
            return { success: false, error: 'Failed to fetch user profiles' };
        }

        const user1Data = user1Result.data;
        const user2Data = user2Result.data;

        const conversationData = {
            participants: [userId1, userId2],
            participantDetails: {
                [userId1]: {
                    name: user1Data.name,
                    picture: user1Data.profilePicture || ''
                },
                [userId2]: {
                    name: user2Data.name,
                    picture: user2Data.profilePicture || ''
                }
            },
            lastMessage: '',
            lastMessageTime: new Date(),
            unreadCount: {
                [userId1]: 0,
                [userId2]: 0
            },
            createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'conversations'), conversationData);
        return { success: true, id: docRef.id };
    } catch (error) {
        return handleError(error, 'Failed to get or create conversation');
    }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId) {
    try {
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId),
            orderBy('lastMessageTime', 'desc')
        );

        const snapshot = await getDocs(q);
        const conversations = [];

        snapshot.forEach(docSnap => {
            conversations.push({ id: docSnap.id, ...docSnap.data() });
        });

        return { success: true, data: conversations };
    } catch (error) {
        return handleError(error, 'Failed to get conversations');
    }
}

/**
 * Listen to conversations in real-time
 */
export function onConversationsChange(userId, callback) {
    try {
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId),
            orderBy('lastMessageTime', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const conversations = [];
            snapshot.forEach(docSnap => {
                conversations.push({ id: docSnap.id, ...docSnap.data() });
            });
            callback(conversations);
        });
    } catch (error) {
        console.error('Error listening to conversations:', error);
        return () => {};
    }
}

/**
 * Send a message
 */
export async function sendMessage(conversationId, senderId, senderName, text, type = 'text') {
    try {
        const messageData = {
            senderId,
            senderName,
            text: text.trim(),
            type, // text, voice, image
            timestamp: new Date(),
            read: false
        };

        await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);

        // Update conversation's last message
        const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
        const conversationData = conversationDoc.data();

        // Increment unread count for other user
        const otherUserId = conversationData.participants.find(id => id !== senderId);
        const unreadCount = conversationData.unreadCount || {};

        await updateDoc(doc(db, 'conversations', conversationId), {
            lastMessage: text.trim(),
            lastMessageTime: new Date(),
            [`unreadCount.${otherUserId}`]: (unreadCount[otherUserId] || 0) + 1
        });

        return { success: true };
    } catch (error) {
        return handleError(error, 'Failed to send message');
    }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId) {
    try {
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const snapshot = await getDocs(q);
        const messages = [];

        snapshot.forEach(docSnap => {
            messages.push({ id: docSnap.id, ...docSnap.data() });
        });

        return { success: true, data: messages };
    } catch (error) {
        return handleError(error, 'Failed to get messages');
    }
}

/**
 * Listen to messages in real-time
 */
export function onMessagesChange(conversationId, callback) {
    try {
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach(docSnap => {
                messages.push({ id: docSnap.id, ...docSnap.data() });
            });
            callback(messages);
        });
    } catch (error) {
        console.error('Error listening to messages:', error);
        return () => {};
    }
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId, userId) {
    try {
        await updateDoc(doc(db, 'conversations', conversationId), {
            [`unreadCount.${userId}`]: 0
        });

        return { success: true };
    } catch (error) {
        return handleError(error, 'Failed to mark as read');
    }
}

/**
 * Search conversations by participant name
 */
export async function searchConversations(userId, searchTerm) {
    try {
        const result = await getUserConversations(userId);
        if (!result.success) {
            return result;
        }

        const searchLower = searchTerm.toLowerCase();
        const filtered = result.data.filter(conv => {
            const otherUserId = conv.participants.find(id => id !== userId);
            const otherUser = conv.participantDetails[otherUserId];
            return otherUser?.name.toLowerCase().includes(searchLower);
        });

        return { success: true, data: filtered };
    } catch (error) {
        return handleError(error, 'Failed to search conversations');
    }
}
