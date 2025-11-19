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
            }
        ]
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
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('meetupDate').min = today;
});

// Cancel Button
document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('meetupModal').classList.remove('active');
    document.getElementById('meetupDate').value = '';
    document.getElementById('meetupTime').value = '';
});

// Confirm Button - Create Event
document.getElementById('confirmBtn').addEventListener('click', () => {
    const date = document.getElementById('meetupDate').value;
    const time = document.getElementById('meetupTime').value;

    if (!date || !time) {
        alert('Please select both date and time');
        return;
    }

    // Create event object
    const event = {
        restaurant: selectedPlace.name,
        placeId: selectedPlace.place_id,
        address: selectedPlace.vicinity || selectedPlace.formatted_address,
        date: date,
        time: time,
        createdAt: new Date().toISOString()
    };

    // Save to database (localStorage for now - replace with actual database)
    const events = JSON.parse(localStorage.getItem('meetupEvents') || '[]');
    events.push(event);
    localStorage.setItem('meetupEvents', JSON.stringify(events));

    // Close modal
    document.getElementById('meetupModal').classList.remove('active');
    
    // Show success message
    const successMsg = document.getElementById('successMessage');
    successMsg.classList.add('active');
    setTimeout(() => {
        successMsg.classList.remove('active');
    }, 3000);

    // Reset form
    document.getElementById('meetupDate').value = '';
    document.getElementById('meetupTime').value = '';

    console.log('Event created:', event);
});