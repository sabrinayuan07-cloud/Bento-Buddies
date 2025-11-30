let map;
let service;
let selectedMarker = null;
let selectedPlace = null;
let currentPlaceDetails = null;
let markers = [];

// UBC campus center coordinates
const UBC_CENTER = { lat: 49.2606, lng: -123.2460 };

function initMap() {
    // Initialize map centered on UBC
    map = new google.maps.Map(document.getElementById('map'), {
        center: UBC_CENTER,
        zoom: 15,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "poi.school",
                stylers: [{ visibility: "off" }]
            }
        ],
        // Disable default UI elements that might show UBC
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: false
    });

    service = new google.maps.places.PlacesService(map);

    // Search for restaurants on UBC campus
    searchRestaurants();
}

function searchRestaurants() {
    // Search for different types of food establishments
    const types = ['restaurant', 'cafe', 'meal_takeaway', 'meal_delivery', 'food'];
    
    types.forEach(type => {
        const request = {
            location: UBC_CENTER,
            radius: 1500, // Increased radius to 1.5km
            type: type
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(place => {
                    // Check if marker already exists for this place
                    const exists = markers.some(m => m.place.place_id === place.place_id);
                    if (!exists) {
                        createMarker(place);
                    }
                });
            }
        });
    });

    // Also search by keyword for specific restaurants
    const keywords = ['chipotle', 'kinton ramen', 'blue chip', 'jamjar', 'big way'];
    keywords.forEach(keyword => {
        const request = {
            location: UBC_CENTER,
            radius: 1500,
            keyword: keyword
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                const place = results[0];
                const exists = markers.some(m => m.place.place_id === place.place_id);
                if (!exists) {
                    createMarker(place);
                }
            }
        });
    });
}

function createMarker(place) {
    // Filter out unwanted places
    const unwantedNames = ['university of british columbia', 'ubc', 'university'];
    const placeName = place.name.toLowerCase();
    
    // Don't create marker if it matches unwanted names
    if (unwantedNames.some(unwanted => placeName.includes(unwanted) && placeName === unwanted)) {
        return;
    }
    
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#000000",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
        }
    });

    markers.push({ marker, place });

    marker.addListener('click', () => {
        selectRestaurant(marker, place);
    });
}

function selectRestaurant(marker, place) {
    // Reset previous selection
    if (selectedMarker) {
        selectedMarker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#000000",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
        });
    }

    // Set new selection with pink color
    marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#FF93A9",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
    });

    selectedMarker = marker;
    selectedPlace = place;

    // Update selection text
    document.getElementById('selectedRestaurant').innerHTML = 
        `<span>Selected: ${place.name}</span>`;
    
    // Enable create meetup button
    document.getElementById('createMeetupBtn').disabled = false;

    // Get detailed place information
    service.getDetails({ 
        placeId: place.place_id,
        fields: ['name', 'rating', 'user_ratings_total', 'price_level', 'types', 
                'vicinity', 'formatted_address', 'photos', 'reviews', 'formatted_phone_number',
                'website', 'opening_hours', 'url']
    }, (placeDetails, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            currentPlaceDetails = placeDetails;
            displayRestaurantCard(placeDetails);
        }
    });
}

function displayRestaurantCard(place) {
    const card = document.getElementById('restaurantCard');
    card.classList.add('active');

    // Set restaurant image
    const imageUrl = place.photos && place.photos.length > 0 
        ? place.photos[0].getUrl({ maxWidth: 400 })
        : 'https://via.placeholder.com/400x200?text=No+Image';
    document.getElementById('restaurantImage').src = imageUrl;

    // Set restaurant details
    document.getElementById('restaurantNameDisplay').value = place.name;
    document.getElementById('restaurantName').textContent = place.name;
    document.getElementById('rating').textContent = place.rating || 'N/A';
    document.getElementById('reviewCount').textContent = 
        `(${place.user_ratings_total || 0})`;
    
    // Set stars
    const rating = place.rating || 0;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    document.getElementById('stars').textContent = 
        '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars);

    // Set price level
    const priceLevel = place.price_level 
        ? '$'.repeat(place.price_level) 
        : '$$';
    document.getElementById('priceLevel').textContent = priceLevel;

    // Set restaurant type
    const types = place.types || [];
    const readableType = types
        .filter(t => t !== 'food' && t !== 'point_of_interest' && t !== 'establishment')
        .map(t => t.replace(/_/g, ' '))
        .join(', ') || 'Restaurant';
    document.getElementById('restaurantType').textContent = 
        readableType.charAt(0).toUpperCase() + readableType.slice(1);

    // Set address
    document.getElementById('restaurantAddress').textContent = 
        place.vicinity || place.formatted_address || 'Address not available';

    // Update reviews and about tabs
    updateReviewsTab(place);
    updateAboutTab(place);
}

function updateReviewsTab(place) {
    const reviewsList = document.getElementById('reviewsList');
    
    if (place.reviews && place.reviews.length > 0) {
        reviewsList.innerHTML = place.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-avatar"></div>
                    <div>
                        <div class="review-author">${review.author_name}</div>
                        <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    </div>
                </div>
                <div class="review-text">${review.text}</div>
                <div class="review-date">${review.relative_time_description}</div>
            </div>
        `).join('');
    } else {
        reviewsList.innerHTML = '<p style="color: #666; padding: 1rem 0;">No reviews available</p>';
    }
}

function updateAboutTab(place) {
    const aboutInfo = document.getElementById('aboutInfo');
    
    let html = '';
    
    if (place.formatted_address) {
        html += `<div class="info-row">
            <span class="info-label">Address</span>
            <span class="info-value">${place.formatted_address}</span>
        </div>`;
    }
    
    if (place.formatted_phone_number) {
        html += `<div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">${place.formatted_phone_number}</span>
        </div>`;
    }
    
    if (place.website) {
        html += `<div class="info-row">
            <span class="info-label">Website</span>
            <span class="info-value"><a href="${place.website}" target="_blank">Visit website</a></span>
        </div>`;
    }
    
    if (place.opening_hours) {
        const isOpen = place.opening_hours.open_now;
        html += `<div class="info-row">
            <span class="info-label">Hours</span>
            <span class="info-value" style="color: ${isOpen ? 'green' : 'red'}">
                ${isOpen ? 'Open now' : 'Closed'}
            </span>
        </div>`;
        
        if (place.opening_hours.weekday_text) {
            html += `<div class="info-row" style="flex-direction: column; align-items: flex-start;">
                <span class="info-label">Opening hours</span>
                <div style="margin-top: 0.5rem;">
                    ${place.opening_hours.weekday_text.map(day => 
                        `<div style="font-size: 14px; color: #666; margin: 0.25rem 0;">${day}</div>`
                    ).join('')}
                </div>
            </div>`;
        }
    }
    
    if (place.url) {
        html += `<div class="info-row">
            <span class="info-label">View on Google Maps</span>
            <span class="info-value"><a href="${place.url}" target="_blank">Open in Maps</a></span>
        </div>`;
    }
    
    aboutInfo.innerHTML = html || '<p style="color: #666; padding: 1rem 0;">No additional information available</p>';
}

// Tab switching functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show corresponding content
        const tabName = this.getAttribute('data-tab');
        document.getElementById(`${tabName}-content`).classList.add('active');
    });
});

// Create Meetup Button
document.getElementById('createMeetupBtn').addEventListener('click', () => {
    document.getElementById('meetupModal').classList.add('active');
    
    // Set the restaurant name in modal
    if (selectedPlace) {
        document.getElementById('modalRestaurantName').textContent = selectedPlace.name;
    }
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('meetupDate').min = today;
    
    // Clear any previous errors
    document.querySelectorAll('.error-icon').forEach(icon => icon.classList.remove('show'));
    document.querySelectorAll('.input-wrapper').forEach(wrapper => wrapper.classList.remove('error'));
});

// Close modal when clicking outside
document.getElementById('meetupModal').addEventListener('click', (e) => {
    if (e.target.id === 'meetupModal') {
        document.getElementById('meetupModal').classList.remove('active');
        clearForm();
    }
});

function clearForm() {
    document.getElementById('meetupDate').value = '';
    document.getElementById('meetupTime').value = '';
    document.getElementById('meetupSpots').value = '';
    document.getElementById('meetupDetails').value = '';
    
    // Clear errors
    document.querySelectorAll('.error-icon').forEach(icon => icon.classList.remove('show'));
    document.querySelectorAll('.input-wrapper').forEach(wrapper => wrapper.classList.remove('error'));
}

// Confirm Button - Create Event
document.getElementById('confirmBtn').addEventListener('click', () => {
    const date = document.getElementById('meetupDate').value;
    const time = document.getElementById('meetupTime').value;
    const spots = document.getElementById('meetupSpots').value;
    const details = document.getElementById('meetupDetails').value;

    // Clear previous errors
    document.querySelectorAll('.error-icon').forEach(icon => icon.classList.remove('show'));
    document.querySelectorAll('.input-wrapper').forEach(wrapper => {
        wrapper.classList.remove('error');
        wrapper.classList.remove('shake');
    });

    let hasError = false;

    // Validate required fields
    if (!date) {
        document.getElementById('dateError').classList.add('show');
        const wrapper = document.getElementById('meetupDate').parentElement;
        wrapper.classList.add('error');
        setTimeout(() => wrapper.classList.add('shake'), 10);
        hasError = true;
    }

    if (!time) {
        document.getElementById('timeError').classList.add('show');
        const wrapper = document.getElementById('meetupTime').parentElement;
        wrapper.classList.add('error');
        setTimeout(() => wrapper.classList.add('shake'), 10);
        hasError = true;
    }

    if (!spots || spots < 1) {
        document.getElementById('spotsError').classList.add('show');
        const wrapper = document.getElementById('meetupSpots').parentElement;
        wrapper.classList.add('error');
        setTimeout(() => wrapper.classList.add('shake'), 10);
        hasError = true;
    }

    // If there are errors, don't submit
    if (hasError) {
        return;
    }

});
/* ========================================
   PHOTO VIEWER FUNCTIONALITY
   ======================================== */

let currentPhotoIndex = 0;
let currentPhotos = [];

// Make restaurant image clickable
document.getElementById('restaurantImage').addEventListener('click', () => {
    if (currentPlaceDetails && currentPlaceDetails.photos && currentPlaceDetails.photos.length > 0) {
        currentPhotos = currentPlaceDetails.photos;
        currentPhotoIndex = 0;
        openPhotoViewer();
    }
});

// Make photo badge clickable
document.querySelector('.photo-badge').addEventListener('click', () => {
    if (currentPlaceDetails && currentPlaceDetails.photos && currentPlaceDetails.photos.length > 0) {
        currentPhotos = currentPlaceDetails.photos;
        currentPhotoIndex = 0;
        openPhotoViewer();
    }
});

function openPhotoViewer() {
    const modal = document.getElementById('photoViewerModal');
    const image = document.getElementById('photoViewerImage');
    const counter = document.getElementById('photoCounter');

    if (currentPhotos.length > 0) {
        image.src = currentPhotos[currentPhotoIndex].getUrl({ maxWidth: 1200, maxHeight: 800 });
        counter.textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePhotoViewer() {
    const modal = document.getElementById('photoViewerModal');
    const image = document.getElementById('photoViewerImage');
    image.classList.remove('zoomed');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function nextPhoto() {
    if (currentPhotoIndex < currentPhotos.length - 1) {
        currentPhotoIndex++;
        const image = document.getElementById('photoViewerImage');
        const counter = document.getElementById('photoCounter');
        image.classList.remove('zoomed');
        image.src = currentPhotos[currentPhotoIndex].getUrl({ maxWidth: 1200, maxHeight: 800 });
        counter.textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
    }
}

function prevPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        const image = document.getElementById('photoViewerImage');
        const counter = document.getElementById('photoCounter');
        image.classList.remove('zoomed');
        image.src = currentPhotos[currentPhotoIndex].getUrl({ maxWidth: 1200, maxHeight: 800 });
        counter.textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
    }
}

// Zoom in/out on image click
document.getElementById('photoViewerImage').addEventListener('click', (e) => {
    e.stopPropagation();
    const image = e.target;
    image.classList.toggle('zoomed');
});

// Photo viewer controls
document.getElementById('photoCloseBtn').addEventListener('click', closePhotoViewer);
document.getElementById('photoNextBtn').addEventListener('click', nextPhoto);
document.getElementById('photoPrevBtn').addEventListener('click', prevPhoto);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('photoViewerModal');
    if (modal.classList.contains('active')) {
        if (e.key === 'ArrowRight') nextPhoto();
        if (e.key === 'ArrowLeft') prevPhoto();
        if (e.key === 'Escape') closePhotoViewer();
    }
});

/* ========================================
   IMPROVED FORM VALIDATION WITH SUCCESS POPUP
   ======================================== */

// Enhanced confirm button handler with new time picker and 10 spot limit
const originalConfirmBtn = document.getElementById('confirmBtn');
const newConfirmBtn = originalConfirmBtn.cloneNode(true);
originalConfirmBtn.parentNode.replaceChild(newConfirmBtn, originalConfirmBtn);

newConfirmBtn.addEventListener('click', () => {
    const date = document.getElementById('meetupDate').value;
    const hour = document.getElementById('meetupHour').value;
    const minute = document.getElementById('meetupMinute').value;
    const spots = parseInt(document.getElementById('meetupSpots').value);
    const details = document.getElementById('meetupDetails').value;

    // Clear previous errors
    document.querySelectorAll('.error-icon').forEach(icon => icon.classList.remove('show'));
    document.querySelectorAll('.input-wrapper').forEach(wrapper => {
        wrapper.classList.remove('error');
        wrapper.classList.remove('shake');
    });

    let hasError = false;

    // Validate date
    if (!date) {
        document.getElementById('dateError').classList.add('show');
        const wrapper = document.getElementById('meetupDate').parentElement;
        wrapper.classList.add('error');
        setTimeout(() => wrapper.classList.add('shake'), 10);
        hasError = true;
    }

    // Validate time
    if (!hour || !minute) {
        document.getElementById('timeError').classList.add('show');
        hasError = true;
    }

    // Validate spots (1-10 only)
    if (!spots || spots < 1 || spots > 10) {
        document.getElementById('spotsError').classList.add('show');
        const wrapper = document.getElementById('meetupSpots').parentElement;
        wrapper.classList.add('error');
        setTimeout(() => wrapper.classList.add('shake'), 10);
        hasError = true;
        if (spots > 10) {
            alert('Maximum 10 spots allowed!');
        }
    }

    if (hasError) {
        return;
    }

    // Success! Show success popup
    document.getElementById('meetupModal').classList.remove('active');
    document.getElementById('successPopup').classList.add('active');

    // Auto-hide success popup after 2.5 seconds
    setTimeout(() => {
        document.getElementById('successPopup').classList.remove('active');
        clearFormNew();
    }, 2500);

    console.log('Meetup created:', {
        restaurant: selectedPlace?.name,
        date,
        time: `${hour}:${minute}`,
        spots,
        details
    });
});

// Updated clearForm for new selects
function clearFormNew() {
    document.getElementById('meetupDate').value = '';
    document.getElementById('meetupHour').value = '';
    document.getElementById('meetupMinute').value = '';
    document.getElementById('meetupSpots').value = '';
    document.getElementById('meetupDetails').value = '';

    document.querySelectorAll('.error-icon').forEach(icon => icon.classList.remove('show'));
    document.querySelectorAll('.input-wrapper').forEach(wrapper => wrapper.classList.remove('error'));
}

// Click outside success popup to close
document.getElementById('successPopup').addEventListener('click', (e) => {
    if (e.target.id === 'successPopup') {
        document.getElementById('successPopup').classList.remove('active');
    }
});
