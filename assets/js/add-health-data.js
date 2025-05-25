// Add-Health-Data.js - JavaScript for the Add Health Data page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the page
    initHealthDataPage();
});

// Initialize health data page
function initHealthDataPage() {
    // Set default date to today
    const today = new Date();
    document.getElementById('data-date').value = formatDateForInput(today);
    document.getElementById('data-date').max = formatDateForInput(today);
    
    // Load existing health data entries
    loadHealthDataEntries();
    
    // Setup event listeners
    setupEventListeners();
}

// Format date as YYYY-MM-DD for input fields
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Load health data entries from localStorage
function loadHealthDataEntries() {
    const healthData = getHealthDataFromStorage();
    displayHealthDataEntries(healthData);
}

// Get health data from localStorage
function getHealthDataFromStorage() {
    const healthData = localStorage.getItem('userHealthData');
    return healthData ? JSON.parse(healthData) : [];
}

// Save health data to localStorage
function saveHealthDataToStorage(healthData) {
    localStorage.setItem('userHealthData', JSON.stringify(healthData));
}

// Display health data entries in the table
function displayHealthDataEntries(healthData) {
    const tableBody = document.getElementById('entries-table-body');
    const noEntriesMsg = document.getElementById('no-entries');
    
    tableBody.innerHTML = '';
    
    if (healthData.length === 0) {
        noEntriesMsg.style.display = 'block';
        return;
    }
    
    noEntriesMsg.style.display = 'none';
    
    // Sort entries by date (newest first)
    healthData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display entries
    healthData.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDateForDisplay(entry.date)}</td>
            <td>${entry.heartRate} BPM</td>
            <td>${entry.bloodPressureSystolic}/${entry.bloodPressureDiastolic} mmHg</td>
            <td>${entry.oxygenLevel}%</td>
            <td>${entry.temperature}°C</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" data-index="${index}" title="Edit entry">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-index="${index}" title="Delete entry">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    addActionButtonListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Health data form submission
    const healthDataForm = document.getElementById('health-data-form');
    
    healthDataForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const date = document.getElementById('data-date').value;
        const heartRate = document.getElementById('heart-rate').value;
        const bpSystolic = document.getElementById('bp-systolic').value;
        const bpDiastolic = document.getElementById('bp-diastolic').value;
        const oxygenLevel = document.getElementById('oxygen-level').value;
        const temperature = document.getElementById('temperature').value;
        const notes = document.getElementById('notes').value;
        
        // Validate form
        if (!validateHealthDataForm(date, heartRate, bpSystolic, bpDiastolic, oxygenLevel, temperature)) {
            return;
        }
        
        // Check if editing or adding new entry
        const editIndex = healthDataForm.dataset.editIndex;
        
        if (editIndex !== undefined) {
            // Update existing entry
            updateHealthDataEntry(editIndex, date, heartRate, bpSystolic, bpDiastolic, oxygenLevel, temperature, notes);
            delete healthDataForm.dataset.editIndex;
        } else {
            // Add new entry
            addHealthDataEntry(date, heartRate, bpSystolic, bpDiastolic, oxygenLevel, temperature, notes);
        }
        
        // Reset form
        healthDataForm.reset();
        document.getElementById('data-date').value = formatDateForInput(new Date());
        
        // Show success message
        showSuccessMessage('form-success', 'Health data saved successfully!');
    });
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Delete modal events
    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    closeDeleteModal.addEventListener('click', function() {
        deleteModal.classList.remove('active');
    });
    
    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.classList.remove('active');
    });
    
    confirmDeleteBtn.addEventListener('click', function() {
        const deleteIndex = deleteModal.dataset.deleteIndex;
        
        if (deleteIndex !== undefined) {
            deleteHealthDataEntry(deleteIndex);
            deleteModal.classList.remove('active');
        }
    });
}

// Add event listeners to action buttons
function addActionButtonListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            editHealthDataEntry(index);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            showDeleteConfirmation(index);
        });
    });
}

// Validate health data form
function validateHealthDataForm(date, heartRate, bpSystolic, bpDiastolic, oxygenLevel, temperature) {
    let isValid = true;
    
    // Validate date
    if (!date) {
        showError('date-error', 'Please select a date');
        isValid = false;
    } else {
        hideError('date-error');
    }
    
    // Validate heart rate
    if (!heartRate) {
        showError('heart-rate-error', 'Please enter your heart rate');
        isValid = false;
    } else if (heartRate < 40 || heartRate > 200) {
        showError('heart-rate-error', 'Heart rate should be between 40 and 200 BPM');
        isValid = false;
    } else {
        hideError('heart-rate-error');
    }
    
    // Validate blood pressure - systolic
    if (!bpSystolic) {
        showError('bp-systolic-error', 'Please enter your systolic blood pressure');
        isValid = false;
    } else if (bpSystolic < 70 || bpSystolic > 200) {
        showError('bp-systolic-error', 'Systolic pressure should be between 70 and 200 mmHg');
        isValid = false;
    } else {
        hideError('bp-systolic-error');
    }
    
    // Validate blood pressure - diastolic
    if (!bpDiastolic) {
        showError('bp-diastolic-error', 'Please enter your diastolic blood pressure');
        isValid = false;
    } else if (bpDiastolic < 40 || bpDiastolic > 130) {
        showError('bp-diastolic-error', 'Diastolic pressure should be between 40 and 130 mmHg');
        isValid = false;
    } else {
        hideError('bp-diastolic-error');
    }
    
    // Validate oxygen level
    if (!oxygenLevel) {
        showError('oxygen-level-error', 'Please enter your oxygen level');
        isValid = false;
    } else if (oxygenLevel < 80 || oxygenLevel > 100) {
        showError('oxygen-level-error', 'Oxygen level should be between 80% and 100%');
        isValid = false;
    } else {
        hideError('oxygen-level-error');
    }
    
    // Validate temperature
    if (!temperature) {
        showError('temperature-error', 'Please enter your body temperature');
        isValid = false;
    } else if (temperature < 35 || temperature > 42) {
        showError('temperature-error', 'Temperature should be between 35°C and 42°C');
        isValid = false;
    } else {
        hideError('temperature-error');
    }
    
    return isValid;
}

// Add health data entry
function addHealthDataEntry(date, heartRate, bpSystolic, bpDiastolic, oxygenLevel, temperature, notes) {
    const healthData = getHealthDataFromStorage();
    
    // Check if entry for this date already exists
    const existingEntryIndex = healthData.findIndex(entry => entry.date === date);
    
    if (existingEntryIndex !== -1) {
        if (!confirm('An entry for this date already exists. Do you want to overwrite it?')) {
            return;
        }
        
        // Update existing entry
        healthData[existingEntryIndex] = {
            date,
            heartRate: parseInt(heartRate),
            bloodPressureSystolic: parseInt(bpSystolic),
            bloodPressureDiastolic: parseInt(bpDiastolic),
            oxygenLevel: parseInt(oxygenLevel),
            temperature: parseFloat(temperature),
            notes
        };
    } else {
        // Add new entry
        healthData.push({
            date,
            heartRate: parseInt(heartRate),
            bloodPressureSystolic: parseInt(bpSystolic),
            bloodPressureDiastolic: parseInt(bpDiastolic),
            oxygenLevel: parseInt(oxygenLevel),
            temperature: parseFloat(temperature),
            notes
        });
    }
    
    // Save to localStorage
    saveHealthDataToStorage(healthData);
    
    // Update display
    displayHealthDataEntries(healthData);
    
    // Update dashboard data if available
    updateDashboardData(healthData);
}

// Update existing health data entry
function updateHealthDataEntry(index, date, heartRate, bpSystolic, bpDiastolic, oxygenLevel, temperature, notes) {
    const healthData = getHealthDataFromStorage();
    
    // Update entry
    healthData[index] = {
        date,
        heartRate: parseInt(heartRate),
        bloodPressureSystolic: parseInt(bpSystolic),
        bloodPressureDiastolic: parseInt(bpDiastolic),
        oxygenLevel: parseInt(oxygenLevel),
        temperature: parseFloat(temperature),
        notes
    };
    
    // Save to localStorage
    saveHealthDataToStorage(healthData);
    
    // Update display
    displayHealthDataEntries(healthData);
    
    // Update dashboard data if available
    updateDashboardData(healthData);
}

// Edit health data entry
function editHealthDataEntry(index) {
    const healthData = getHealthDataFromStorage();
    const entry = healthData[index];
    
    if (!entry) return;
    
    // Set form values
    document.getElementById('data-date').value = entry.date;
    document.getElementById('heart-rate').value = entry.heartRate;
    document.getElementById('bp-systolic').value = entry.bloodPressureSystolic;
    document.getElementById('bp-diastolic').value = entry.bloodPressureDiastolic;
    document.getElementById('oxygen-level').value = entry.oxygenLevel;
    document.getElementById('temperature').value = entry.temperature;
    document.getElementById('notes').value = entry.notes || '';
    
    // Set edit index
    document.getElementById('health-data-form').dataset.editIndex = index;
    
    // Scroll to form
    document.querySelector('.data-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Show delete confirmation
function showDeleteConfirmation(index) {
    const deleteModal = document.getElementById('delete-modal');
    deleteModal.dataset.deleteIndex = index;
    deleteModal.classList.add('active');
}

// Delete health data entry
function deleteHealthDataEntry(index) {
    const healthData = getHealthDataFromStorage();
    
    // Remove entry
    healthData.splice(index, 1);
    
    // Save to localStorage
    saveHealthDataToStorage(healthData);
    
    // Update display
    displayHealthDataEntries(healthData);
    
    // Update dashboard data if available
    updateDashboardData(healthData);
}

// Update dashboard data
function updateDashboardData(healthData) {
    // Sort by date (newest first)
    const sortedData = [...healthData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get last 7 days of data for dashboard
    const last7DaysData = sortedData.slice(0, 7);
    
    // Save to localStorage for dashboard
    localStorage.setItem('analyticsData', JSON.stringify(last7DaysData));
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
