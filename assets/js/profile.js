// Profile.js - JavaScript for the User Profile & Settings page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the profile page
    initProfilePage();
});

// Initialize profile page
function initProfilePage() {
    // Load user profile data
    loadProfileData();
    
    // Load settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
}

// Load user profile data from localStorage
function loadProfileData() {
    const profileData = getProfileDataFromStorage();
    
    // Set form values
    document.getElementById('profile-name').value = profileData.name || '';
    document.getElementById('profile-email').value = profileData.email || '';
    document.getElementById('profile-phone').value = profileData.phone || '';
}

// Get profile data from localStorage
function getProfileDataFromStorage() {
    const profileData = localStorage.getItem('profileData');
    return profileData ? JSON.parse(profileData) : {
        name: localStorage.getItem('username') || 'User',
        email: '',
        phone: ''
    };
}

// Save profile data to localStorage
function saveProfileDataToStorage(profileData) {
    localStorage.setItem('profileData', JSON.stringify(profileData));
}

// Load settings from localStorage
function loadSettings() {
    const settings = getSettingsFromStorage();
    
    // Set theme toggle
    document.getElementById('theme-toggle').checked = settings.darkMode;
    
    // Apply theme
    applyTheme(settings.darkMode);
    
    // Set notifications toggle
    document.getElementById('notifications-toggle').checked = settings.notifications;
}

// Get settings from localStorage
function getSettingsFromStorage() {
    const settings = localStorage.getItem('settings');
    return settings ? JSON.parse(settings) : {
        darkMode: true,
        notifications: true
    };
}

// Save settings to localStorage
function saveSettingsToStorage(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Apply theme based on dark mode setting
function applyTheme(darkMode) {
    if (darkMode) {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const password = document.getElementById('profile-password').value.trim();
        const confirmPassword = document.getElementById('profile-confirm-password').value.trim();
        
        // Validate form
        if (!validateProfileForm(name, email, phone, password, confirmPassword)) {
            return;
        }
        
        // Create profile data object
        const profileData = {
            name,
            email,
            phone
        };
        
        // Save profile data
        saveProfileDataToStorage(profileData);
        
        // Update username in localStorage and UI
        localStorage.setItem('username', name);
        document.getElementById('username').textContent = name;
        
        // Show success message
        showSuccessMessage('profile-success', 'Profile updated successfully!');
        
        // Clear password fields
        document.getElementById('profile-password').value = '';
        document.getElementById('profile-confirm-password').value = '';
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', function() {
        const darkMode = this.checked;
        
        // Apply theme
        applyTheme(darkMode);
        
        // Save setting
        const settings = getSettingsFromStorage();
        settings.darkMode = darkMode;
        saveSettingsToStorage(settings);
    });
    
    // Notifications toggle
    const notificationsToggle = document.getElementById('notifications-toggle');
    notificationsToggle.addEventListener('change', function() {
        const notifications = this.checked;
        
        // Save setting
        const settings = getSettingsFromStorage();
        settings.notifications = notifications;
        saveSettingsToStorage(settings);
    });
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    deleteAccountBtn.addEventListener('click', function() {
        // Show confirmation modal
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.add('active');
    });
    
    // Close modal button
    const closeModalBtn = document.getElementById('close-modal');
    closeModalBtn.addEventListener('click', function() {
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.remove('active');
    });
    
    // Cancel button in modal
    const cancelBtn = document.getElementById('cancel-btn');
    cancelBtn.addEventListener('click', function() {
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.remove('active');
    });
    
    // Confirm delete button in modal
    const confirmBtn = document.getElementById('confirm-btn');
    confirmBtn.addEventListener('click', function() {
        // Delete account
        deleteAccount();
    });
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Validate profile form
function validateProfileForm(name, email, phone, password, confirmPassword) {
    let isValid = true;
    
    // Validate name
    if (!name) {
        showError('name-error', 'Please enter your name');
        isValid = false;
    } else {
        hideError('name-error');
    }
    
    // Validate email
    if (!email) {
        showError('email-error', 'Please enter your email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email-error', 'Please enter a valid email address');
        isValid = false;
    } else {
        hideError('email-error');
    }
    
    // Validate phone
    if (phone && !isValidPhone(phone)) {
        showError('phone-error', 'Please enter a valid phone number');
        isValid = false;
    } else {
        hideError('phone-error');
    }
    
    // Validate password
    if (password || confirmPassword) {
        if (password.length < 6) {
            showError('password-error', 'Password must be at least 6 characters');
            isValid = false;
        } else {
            hideError('password-error');
        }
        
        if (password !== confirmPassword) {
            showError('confirm-password-error', 'Passwords do not match');
            isValid = false;
        } else {
            hideError('confirm-password-error');
        }
    }
    
    return isValid;
}

// Check if email is valid
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if phone is valid
function isValidPhone(phone) {
    const phoneRegex = /^\+?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Hide error message
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
}

// Show success message
function showSuccessMessage(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 3000);
}

// Delete account
function deleteAccount() {
    // Clear all localStorage data
    localStorage.clear();
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Add event listener to logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
