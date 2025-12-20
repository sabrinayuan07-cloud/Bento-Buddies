// Home Dashboard - Real Statistics from Firestore
import { db } from '../../firebase-config.js';
import { getAllUsers } from '../services/user.service.js';
import { getMeetups } from '../services/meetup.service.js';
import { requireAuth } from '../services/auth.service.js';

let currentUser = null;

// Initialize
async function init() {
    try {
        currentUser = await requireAuth();
        await loadDashboardData();
    } catch (error) {
        console.error('Error:', error);
        // Allow viewing home page even without login
        loadDashboardData();
    }
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        // Get all users and meetups
        const usersResult = await getAllUsers();
        const meetupsResult = await getMeetups();

        if (usersResult.success && meetupsResult.success) {
            const users = usersResult.data;
            const meetups = meetupsResult.data;

            // Update statistics
            updateStatistics(users, meetups);

            // Update most active users
            updateMostActiveUsers(users, meetups);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update statistics cards
function updateStatistics(users, meetups) {
    // Total Users
    const totalUsersEl = document.querySelector('.stat-card:nth-child(1) h3');
    if (totalUsersEl) {
        animateNumber(totalUsersEl, users.length);
    }

    // Active Users (users who created or joined meetups)
    const activeUserIds = new Set();
    meetups.forEach(meetup => {
        activeUserIds.add(meetup.createdBy);
        meetup.attendees.forEach(attendee => activeUserIds.add(attendee.userId));
    });

    const activeUsersEl = document.querySelector('.stat-card:nth-child(2) h3');
    if (activeUsersEl) {
        animateNumber(activeUsersEl, activeUserIds.size);
    }

    // Total Meetups
    const meetupsEl = document.querySelector('.stat-card:nth-child(3) h3');
    if (meetupsEl) {
        animateNumber(meetupsEl, meetups.length);
    }

    // Average Rating (placeholder - you can add rating system later)
    const ratingEl = document.querySelector('.stat-card:nth-child(4) h3');
    if (ratingEl) {
        ratingEl.textContent = '4.8';
    }
}

// Update most active users section
function updateMostActiveUsers(users, meetups) {
    // Count meetups per user
    const userMeetupCounts = {};

    meetups.forEach(meetup => {
        // Count as creator
        if (!userMeetupCounts[meetup.createdBy]) {
            userMeetupCounts[meetup.createdBy] = 0;
        }
        userMeetupCounts[meetup.createdBy]++;

        // Count as attendee
        meetup.attendees.forEach(attendee => {
            if (attendee.userId !== meetup.createdBy) {
                if (!userMeetupCounts[attendee.userId]) {
                    userMeetupCounts[attendee.userId] = 0;
                }
                userMeetupCounts[attendee.userId]++;
            }
        });
    });

    // Get top 8 most active users
    const sortedUsers = users
        .map(user => ({
            ...user,
            meetupCount: userMeetupCounts[user.id] || 0
        }))
        .filter(user => user.meetupCount > 0)
        .sort((a, b) => b.meetupCount - a.meetupCount)
        .slice(0, 8);

    // Render active users
    const activeUsersGrid = document.querySelector('.active-users-grid');
    if (activeUsersGrid && sortedUsers.length > 0) {
        activeUsersGrid.innerHTML = sortedUsers.map((user, index) => {
            const initials = getInitials(user.name);
            const gradient = getGradientForName(user.name);

            return `
                <div class="active-user-card">
                    <div class="user-rank">#${index + 1}</div>
                    <div class="user-avatar" style="background: ${gradient};">
                        <span style="color: white; font-size: 28px; font-weight: 700;">${initials}</span>
                    </div>
                    <h4>${user.name}</h4>
                    <p>${user.major || 'UBC Student'}</p>
                    <div class="user-meetups">${user.meetupCount} meetup${user.meetupCount !== 1 ? 's' : ''}</div>
                </div>
            `;
        }).join('');
    }
}

// Animate number counting
function animateNumber(element, target) {
    const duration = 1500;
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Helper functions
function getInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.length >= 2
        ? parts[0][0] + parts[1][0]
        : name.substring(0, 2);
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
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
}

// Initialize
init();
