// Events Page - Real Meetups from Firestore
import { auth } from '../../firebase-config.js';
import {
    onMeetupsChange,
    joinMeetup,
    leaveMeetup,
    getMeetup
} from '../services/meetup.service.js';
import { requireAuth } from '../services/auth.service.js';
import { showError, showSuccess, showLoading, hideLoading } from '../utils/error-handler.js';
import { formatDate, formatTime, isToday, getTodayDate } from '../utils/date-helpers.js';

let currentUser = null;
let allMeetups = [];
let unsubscribeMeetups = null;
let selectedMeetup = null;

// Carousel state
let todayScrollInterval;
let futureScrollInterval;
let todayPaused = false;
let futurePaused = false;

// DOM elements
const searchInput = document.getElementById('searchInput');
const todayCarousel = document.getElementById('todayCarousel');
const futureCarousel = document.getElementById('futureCarousel');
const eventModal = document.getElementById('eventModal');
const closeModal = document.getElementById('closeModal');

// Initialize
async function init() {
    try {
        currentUser = await requireAuth();
        loadMeetups();
        setupEventListeners();
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '../index/index.html';
    }
}

// Load meetups with real-time updates
function loadMeetups() {
    if (unsubscribeMeetups) {
        unsubscribeMeetups();
    }

    // Real-time listener for meetups
    unsubscribeMeetups = onMeetupsChange((meetups) => {
        allMeetups = meetups.filter(m => m.status === 'open' || m.status === 'full');

        // Separate into today and future
        const today = getTodayDate();
        const todayMeetups = allMeetups.filter(m => m.date === today);
        const futureMeetups = allMeetups.filter(m => m.date > today);

        renderEvents(todayMeetups, 'todayCarousel');
        renderEvents(futureMeetups, 'futureCarousel');

        // Start carousels
        startCarousel('todayCarousel');
        startCarousel('futureCarousel');
    }, { status: 'open' });
}

// Render events
function renderEvents(meetups, carouselId) {
    const carousel = document.getElementById(carouselId);
    carousel.innerHTML = '';

    if (meetups.length === 0) {
        carousel.innerHTML = `
            <div class="empty-state" style="
                width: 100%;
                padding: 60px 20px;
                text-align: center;
                color: #666;
            ">
                <p style="font-size: 16px; margin-bottom: 10px;">No meetups ${carouselId === 'todayCarousel' ? 'today' : 'scheduled'}</p>
                <p style="font-size: 14px;">Create one from the Maps page!</p>
            </div>
        `;
        return;
    }

    // Duplicate meetups for infinite scroll effect (only if more than 2 meetups)
    const extendedMeetups = meetups.length > 2
        ? [...meetups, ...meetups, ...meetups]
        : meetups;

    extendedMeetups.forEach((meetup, index) => {
        const card = createMeetupCard(meetup, index % meetups.length, carouselId);
        carousel.appendChild(card);
    });
}

// Create meetup card
function createMeetupCard(meetup, originalIndex, carouselId) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.originalIndex = originalIndex;
    card.dataset.meetupId = meetup.id;

    // Calculate spots left
    const spotsLeft = meetup.maxSpots - meetup.attendees.length;
    const isFull = spotsLeft <= 0;
    const isUserAttending = meetup.attendees.some(a => a.userId === currentUser.uid);

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'event-image';

    const imgElement = document.createElement('img');
    imgElement.src = meetup.restaurantPhoto || '../Images/placeholder.png';
    imgElement.alt = meetup.restaurantName;
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';
    imageContainer.appendChild(imgElement);

    // Status badge
    let statusBadge = '';
    if (isUserAttending) {
        statusBadge = '<div class="status-badge joined">Joined</div>';
    } else if (isFull) {
        statusBadge = '<div class="status-badge full">Full</div>';
    }

    // Event info
    const eventInfo = document.createElement('div');
    eventInfo.className = 'event-info';
    eventInfo.innerHTML = `
        <h3>${meetup.restaurantName}</h3>
        <p>${formatTime(meetup.time)}</p>
        <div class="event-footer">
            <div class="attendees-preview">
                ${renderAttendeesPreview(meetup.attendees)}
            </div>
            <span class="spots-left ${isFull ? 'full' : ''}">${isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}</span>
        </div>
        ${statusBadge}
    `;

    card.appendChild(imageContainer);
    card.appendChild(eventInfo);

    // Click to show details
    card.addEventListener('click', () => {
        showMeetupDetails(meetup);
    });

    // Pause carousel on hover
    card.addEventListener('mouseenter', () => {
        if (carouselId === 'todayCarousel') {
            todayPaused = true;
        } else {
            futurePaused = true;
        }
    });

    card.addEventListener('mouseleave', () => {
        if (carouselId === 'todayCarousel') {
            todayPaused = false;
        } else {
            futurePaused = false;
        }
    });

    return card;
}

// Render attendees preview (show first 3 avatars)
function renderAttendeesPreview(attendees) {
    const preview = attendees.slice(0, 3);
    let html = '';

    preview.forEach((attendee, index) => {
        if (attendee.picture) {
            html += `<img src="${attendee.picture}" alt="${attendee.name}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: -10px; border: 2px solid white;">`;
        } else {
            const initials = getInitials(attendee.name);
            const gradient = getGradientForName(attendee.name);
            html += `<div style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: ${gradient};
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: 600;
                margin-right: -10px;
                border: 2px solid white;
            ">${initials}</div>`;
        }
    });

    if (attendees.length > 3) {
        html += `<div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #ddd;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #666;
            border: 2px solid white;
        ">+${attendees.length - 3}</div>`;
    }

    return html;
}

// Show meetup details modal
function showMeetupDetails(meetup) {
    selectedMeetup = meetup;

    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDate = document.getElementById('modalDate');
    const modalTime = document.getElementById('modalTime');
    const modalLocation = document.getElementById('modalLocation');

    modalImage.src = meetup.restaurantPhoto || '../Images/placeholder.png';
    modalTitle.textContent = meetup.restaurantName;
    modalDate.textContent = formatDate(meetup.date);
    modalTime.textContent = formatTime(meetup.time);
    modalLocation.textContent = meetup.restaurantAddress;

    // Add attendees section to modal if not exists
    let modalDetails = document.querySelector('.modal-details');

    // Remove existing join/leave button if present
    const existingBtn = document.getElementById('joinLeaveBtn');
    if (existingBtn) existingBtn.remove();

    const spotsLeft = meetup.maxSpots - meetup.attendees.length;
    const isFull = spotsLeft <= 0;
    const isUserAttending = meetup.attendees.some(a => a.userId === currentUser.uid);
    const isCreator = meetup.createdBy === currentUser.uid;

    // Add attendees list
    let attendeesHTML = `
        <p><strong>👥 Attendees (${meetup.attendees.length}/${meetup.maxSpots}):</strong></p>
        <div class="attendees-list" style="margin: 10px 0; display: flex; flex-wrap: wrap; gap: 10px;">
    `;

    meetup.attendees.forEach(attendee => {
        const isYou = attendee.userId === currentUser.uid;
        attendeesHTML += `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f5f5f5; border-radius: 8px; flex: 1; min-width: 120px;">
                ${attendee.picture
                    ? `<img src="${attendee.picture}" style="width: 30px; height: 30px; border-radius: 50%;">`
                    : `<div style="width: 30px; height: 30px; border-radius: 50%; background: ${getGradientForName(attendee.name)}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600;">${getInitials(attendee.name)}</div>`
                }
                <span style="font-size: 14px;">${attendee.name}${isYou ? ' (You)' : ''}</span>
                ${attendee.userId === meetup.createdBy ? '<span style="font-size: 12px; color: #FF93A9;">👑</span>' : ''}
            </div>
        `;
    });

    attendeesHTML += '</div>';

    if (meetup.details) {
        attendeesHTML += `<p><strong>📝 Details:</strong> ${meetup.details}</p>`;
    }

    // Replace or add attendees section
    const existingAttendees = modalDetails.querySelector('.attendees-list');
    if (existingAttendees) {
        existingAttendees.parentElement.remove();
    }
    modalDetails.insertAdjacentHTML('beforeend', attendeesHTML);

    // Add join/leave button
    if (!isCreator) {
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'margin-top: 20px; display: flex; gap: 10px;';

        const joinLeaveBtn = document.createElement('button');
        joinLeaveBtn.id = 'joinLeaveBtn';
        joinLeaveBtn.style.cssText = `
            flex: 1;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        `;

        if (isUserAttending) {
            joinLeaveBtn.textContent = 'Leave Meetup';
            joinLeaveBtn.style.background = '#fff';
            joinLeaveBtn.style.color = '#ff4444';
            joinLeaveBtn.style.border = '2px solid #ff4444';
            joinLeaveBtn.onclick = () => handleLeaveMeetup(meetup.id);
        } else if (isFull) {
            joinLeaveBtn.textContent = 'Full';
            joinLeaveBtn.style.background = '#ccc';
            joinLeaveBtn.style.color = '#666';
            joinLeaveBtn.disabled = true;
            joinLeaveBtn.style.cursor = 'not-allowed';
        } else {
            joinLeaveBtn.textContent = 'Join Meetup';
            joinLeaveBtn.style.background = 'linear-gradient(135deg, #FF93A9, #FF8375)';
            joinLeaveBtn.style.color = 'white';
            joinLeaveBtn.onclick = () => handleJoinMeetup(meetup.id);
        }

        btnContainer.appendChild(joinLeaveBtn);
        modalDetails.appendChild(btnContainer);
    }

    eventModal.style.display = 'block';
}

// Handle join meetup
async function handleJoinMeetup(meetupId) {
    showLoading('Joining meetup...');

    const result = await joinMeetup(meetupId, currentUser);

    hideLoading();

    if (result.success) {
        showSuccess('Successfully joined the meetup!');

        // Refresh meetup details
        const updated = await getMeetup(meetupId);
        if (updated.success) {
            showMeetupDetails(updated.data);
        }
    } else {
        showError(result.error || 'Failed to join meetup');
    }
}

// Handle leave meetup
async function handleLeaveMeetup(meetupId) {
    if (!confirm('Are you sure you want to leave this meetup?')) {
        return;
    }

    showLoading('Leaving meetup...');

    const result = await leaveMeetup(meetupId, currentUser);

    hideLoading();

    if (result.success) {
        showSuccess('Successfully left the meetup');

        // Refresh meetup details
        const updated = await getMeetup(meetupId);
        if (updated.success) {
            showMeetupDetails(updated.data);
        } else {
            eventModal.style.display = 'none';
        }
    } else {
        showError(result.error || 'Failed to leave meetup');
    }
}

// Start carousel auto-scroll
function startCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    const isToday = carouselId === 'todayCarousel';

    // Clear existing interval
    if (isToday && todayScrollInterval) {
        clearInterval(todayScrollInterval);
    } else if (!isToday && futureScrollInterval) {
        clearInterval(futureScrollInterval);
    }

    const interval = setInterval(() => {
        if ((isToday && todayPaused) || (!isToday && futurePaused)) {
            return;
        }

        carousel.scrollLeft += 1;

        // Reset scroll if reached end
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft >= maxScroll - 10) {
            carousel.scrollLeft = 0;
        }
    }, 30);

    if (isToday) {
        todayScrollInterval = interval;
    } else {
        futureScrollInterval = interval;
    }
}

// Search functionality
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allCards = document.querySelectorAll('.event-card');

        allCards.forEach(card => {
            const eventName = card.querySelector('h3').textContent.toLowerCase();
            const location = allMeetups.find(m => m.id === card.dataset.meetupId)?.restaurantAddress.toLowerCase() || '';

            if (eventName.includes(searchTerm) || location.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        eventModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === eventModal) {
            eventModal.style.display = 'none';
        }
    });

    // Plan a visit button
    const planVisitBtn = document.querySelector('.plan-visit-btn');
    if (planVisitBtn) {
        planVisitBtn.addEventListener('click', () => {
            window.location.href = '../maps/maps.html';
        });
    }
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
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (unsubscribeMeetups) unsubscribeMeetups();
    if (todayScrollInterval) clearInterval(todayScrollInterval);
    if (futureScrollInterval) clearInterval(futureScrollInterval);
});

// Initialize
init();
