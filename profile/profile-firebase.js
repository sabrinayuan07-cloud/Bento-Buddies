// Import Firebase modules
import { auth, db, storage, onAuthStateChanged, signOut, doc, getDoc, updateDoc, ref, uploadBytes, getDownloadURL } from '../firebase-config.js';

let profileData = {};
let isEditing = false;
let selectedFoods = [];
let currentUser = null;

// Check authentication and load profile
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../index/index.html';
        return;
    }

    currentUser = user;

    // Setup event listeners first (they don't depend on data)
    setupEventListeners();

    // Then load and display user profile data
    await loadUserProfile(user.uid);
});

// Load user profile from Firestore
async function loadUserProfile(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            profileData = userDoc.data();
            selectedFoods = [...(profileData.favoriteFoods || [])];

            // NOW load the data into the UI (only after we have it!)
            loadProfileData();
        } else {
            // No profile found - show message
            document.getElementById('nameDisplay').textContent = 'Profile not found';
            document.getElementById('bioDisplay').textContent = 'No profile data available';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('nameDisplay').textContent = 'Error loading profile';
        document.getElementById('bioDisplay').textContent = 'Please try refreshing the page';
    }
}

// Load profile data into UI
function loadProfileData() {
    document.getElementById('nameDisplay').textContent = profileData.name || '';
    document.getElementById('usernameDisplay').textContent = profileData.username || '';
    document.getElementById('yearDisplay').textContent = profileData.year || '';
    document.getElementById('majorDisplay').textContent = profileData.major || '';
    document.getElementById('bioDisplay').textContent = profileData.bio || '';
    document.getElementById('funFactDisplay').textContent = profileData.funFact || '';
    document.getElementById('lastMealDisplay').textContent = profileData.lastMeal || '';

    // Load profile picture
    if (profileData.profilePicture) {
        const img = document.getElementById('profileImg');
        img.src = profileData.profilePicture;
        img.style.display = 'block';
        document.getElementById('uploadOverlay').style.opacity = '0';
    }

    // Load personality tags
    loadTags();

    // Load favorite foods (now using emojis)
    loadFavoriteFoods();
}

// Load personality tags
function loadTags() {
    const container = document.getElementById('tagsContainer');
    container.innerHTML = '';

    (profileData.personality || []).forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;

        if (isEditing) {
            tagElement.classList.add('editable');
            tagElement.addEventListener('click', () => removeTag(tag));
        }

        container.appendChild(tagElement);
    });
}

// Load favorite foods (display emojis)
function loadFavoriteFoods() {
    const foodItems = document.querySelectorAll('.food-item');

    foodItems.forEach((item, index) => {
        const emojiSpan = item.querySelector('.food-emoji') || document.createElement('span');
        emojiSpan.className = 'food-emoji';

        if (profileData.favoriteFoods && profileData.favoriteFoods[index]) {
            emojiSpan.textContent = profileData.favoriteFoods[index];
            emojiSpan.style.fontSize = '48px';
            item.innerHTML = '';
            item.appendChild(emojiSpan);
            item.classList.remove('empty');
        } else {
            item.classList.add('empty');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Edit button
    document.getElementById('editBtn').addEventListener('click', toggleEdit);

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveProfile);

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);

    // Profile picture upload
    document.getElementById('profilePicture').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', handleFileUpload);

    // Add tag button
    document.getElementById('addTagBtn').addEventListener('click', () => {
        document.getElementById('tagModal').classList.add('active');
    });

    // Tag modal buttons
    document.getElementById('cancelTagBtn').addEventListener('click', () => {
        document.getElementById('tagModal').classList.remove('active');
        document.getElementById('newTagInput').value = '';
    });

    document.getElementById('confirmTagBtn').addEventListener('click', addTag);

    // Food items click - update to open emoji modal
    document.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('click', () => {
            if (isEditing) {
                openFoodModal();
            }
        });
    });

    // Food modal buttons
    document.getElementById('cancelFoodBtn').addEventListener('click', () => {
        document.getElementById('foodModal').classList.remove('active');
        selectedFoods = [...(profileData.favoriteFoods || [])];
    });

    document.getElementById('confirmFoodBtn').addEventListener('click', saveFoods);

    // Setup food emoji selection
    setupFoodEmojiSelection();

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutModal.classList.add('active');
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.remove('active');
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', handleLogout);
    }

    // Close modal when clicking outside
    if (logoutModal) {
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) {
                logoutModal.classList.remove('active');
            }
        });
    }
}

// Toggle edit mode
function toggleEdit() {
    isEditing = !isEditing;

    if (isEditing) {
        // Show edit mode
        document.getElementById('editBtn').textContent = 'Editing...';
        document.getElementById('editBtn').style.color = '#999';
        document.getElementById('actionButtons').style.display = 'flex';

        // Show inputs, hide displays
        showInput('name');
        showInput('username');
        showInput('year');
        showInput('major');
        showInput('bio');
        showInput('funFact');
        showInput('lastMeal');

        // Make tags editable
        loadTags();
        document.getElementById('addTagBtn').style.display = 'inline-block';

        // Make food items clickable (visual indication)
        document.querySelectorAll('.food-item').forEach(item => {
            item.style.cursor = 'pointer';
            item.style.border = '2px solid #FF93A9';
        });

    } else {
        // Exit edit mode without saving
        cancelEdit();
    }
}

// Show input field
function showInput(field) {
    const display = document.getElementById(`${field}Display`);
    const input = document.getElementById(`${field}Input`);

    if (display && input) {
        display.style.display = 'none';
        input.style.display = field === 'bio' ? 'block' : 'inline-block';
        input.value = display.textContent;
    }
}

// Hide input field
function hideInput(field) {
    const display = document.getElementById(`${field}Display`);
    const input = document.getElementById(`${field}Input`);

    if (display && input) {
        display.style.display = 'inline';
        input.style.display = 'none';
    }
}

// Save profile to Firebase
async function saveProfile() {
    try {
        // Get all input values
        const updatedData = {
            name: document.getElementById('nameInput').value,
            username: document.getElementById('usernameInput').value,
            year: document.getElementById('yearInput').value,
            major: document.getElementById('majorInput').value,
            bio: document.getElementById('bioInput').value,
            funFact: document.getElementById('funFactInput').value,
            lastMeal: document.getElementById('lastMealInput').value,
            personality: profileData.personality,
            favoriteFoods: profileData.favoriteFoods
        };

        // Update Firestore
        await updateDoc(doc(db, 'users', currentUser.uid), updatedData);

        // Update local profile data
        Object.assign(profileData, updatedData);

        // Exit edit mode
        isEditing = false;
        document.getElementById('editBtn').textContent = 'Edit';
        document.getElementById('editBtn').style.color = '#FF93A9';
        document.getElementById('actionButtons').style.display = 'none';
        document.getElementById('addTagBtn').style.display = 'none';

        // Hide inputs, show displays
        hideInput('name');
        hideInput('username');
        hideInput('year');
        hideInput('major');
        hideInput('bio');
        hideInput('funFact');
        hideInput('lastMeal');

        // Update displays
        loadProfileData();

        // Reset food items styling
        document.querySelectorAll('.food-item').forEach(item => {
            item.style.border = 'none';
        });

        console.log('Profile saved successfully!');
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
    }
}

// Cancel edit
function cancelEdit() {
    isEditing = false;
    document.getElementById('editBtn').textContent = 'Edit';
    document.getElementById('editBtn').style.color = '#FF93A9';
    document.getElementById('actionButtons').style.display = 'none';
    document.getElementById('addTagBtn').style.display = 'none';

    // Hide inputs, show displays
    hideInput('name');
    hideInput('username');
    hideInput('year');
    hideInput('major');
    hideInput('bio');
    hideInput('funFact');
    hideInput('lastMeal');

    // Reload original data
    loadProfileData();

    // Reset food items styling
    document.querySelectorAll('.food-item').forEach(item => {
        item.style.border = 'none';
    });
}

// Handle profile picture upload to Firebase Storage
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && currentUser) {
        try {
            // Upload to Firebase Storage
            const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Update Firestore
            await updateDoc(doc(db, 'users', currentUser.uid), {
                profilePicture: downloadURL
            });

            // Update UI
            profileData.profilePicture = downloadURL;
            const img = document.getElementById('profileImg');
            img.src = downloadURL;
            img.style.display = 'block';
            document.getElementById('uploadOverlay').style.opacity = '0';

            console.log('Profile picture uploaded successfully!');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Error uploading image. Please try again.');
        }
    }
}

// Add personality tag
function addTag() {
    const newTag = document.getElementById('newTagInput').value.trim();

    if (newTag && !(profileData.personality || []).includes(newTag)) {
        profileData.personality = [...(profileData.personality || []), newTag];
        loadTags();
        document.getElementById('tagModal').classList.remove('active');
        document.getElementById('newTagInput').value = '';
    }
}

// Remove personality tag
function removeTag(tag) {
    if (isEditing) {
        profileData.personality = (profileData.personality || []).filter(t => t !== tag);
        loadTags();
    }
}

// Open food selection modal
function openFoodModal() {
    const modal = document.getElementById('foodModal');
    modal.classList.add('active');

    // Reset selected foods to current profile foods
    selectedFoods = [...(profileData.favoriteFoods || [])];

    // Update visual selection in modal
    const foodEmojiItems = document.querySelectorAll('#profileFoodEmojiGrid .food-emoji-item');
    foodEmojiItems.forEach(item => {
        const emoji = item.dataset.emoji;
        if (selectedFoods.includes(emoji)) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    updateFoodCount();
}

// Handle food emoji selection in profile modal
function setupFoodEmojiSelection() {
    const foodEmojiGrid = document.getElementById('profileFoodEmojiGrid');
    if (!foodEmojiGrid) return;

    foodEmojiGrid.addEventListener('click', (e) => {
        const item = e.target.closest('.food-emoji-item');
        if (!item) return;

        const emoji = item.dataset.emoji;

        if (item.classList.contains('selected')) {
            // Deselect
            item.classList.remove('selected');
            selectedFoods = selectedFoods.filter(f => f !== emoji);
        } else if (selectedFoods.length < 3) {
            // Select (max 3)
            item.classList.add('selected');
            selectedFoods.push(emoji);
        }

        updateFoodCount();
    });
}

// Update food selection count
function updateFoodCount() {
    const countElement = document.getElementById('profileFoodSelectedCount');
    if (countElement) {
        countElement.textContent = `${selectedFoods.length} / 3 selected`;
    }
}

// Save selected foods
function saveFoods() {
    profileData.favoriteFoods = [...selectedFoods];
    loadFavoriteFoods();
    document.getElementById('foodModal').classList.remove('active');
}

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = '../index/index.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}
