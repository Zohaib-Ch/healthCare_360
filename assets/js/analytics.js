// Analytics.js - JavaScript for the Dashboard Analytics page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the analytics page
    initAnalytics();
});

// Get user health data from localStorage
function getUserHealthData(days = 7) {
    // Try to get data from localStorage
    const healthData = localStorage.getItem('userHealthData');
    
    if (!healthData) {
        return [];
    }
    
    // Parse the data
    const parsedData = JSON.parse(healthData);
    
    // Sort by date (newest first)
    parsedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Return the most recent 'days' entries
    return parsedData.slice(0, days);
}

// Initialize analytics page
function initAnalytics() {
    // Get user health data for the last 7 days
    const healthData = getUserHealthData(7);
    
    // If no user data is available, show a message
    if (healthData.length === 0) {
        document.getElementById('no-data-message').style.display = 'block';
        document.querySelectorAll('.chart-container').forEach(container => {
            container.style.display = 'none';
        });
        return;
    }
    
    // Hide the no data message if it exists
    const noDataMsg = document.getElementById('no-data-message');
    if (noDataMsg) {
        noDataMsg.style.display = 'none';
    }
    
    // Store data in localStorage for persistence
    localStorage.setItem('analyticsData', JSON.stringify(healthData));
    
    // Update stat cards with latest data
    updateStatCards(healthData);
    
    // Initialize the main chart
    initMainChart(healthData);
    
    // Setup toggle buttons
    setupToggleButtons();
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Update stat cards with latest data
function updateStatCards(healthData) {
    const latestData = healthData[healthData.length - 1];
    const previousData = healthData[healthData.length - 2];
    
    // Heart Rate
    document.getElementById('hr-value').textContent = latestData.heartRate;
    updateTrend('hr-trend', latestData.heartRate, previousData.heartRate);
    
    // Blood Pressure
    document.getElementById('bp-value').textContent = `${latestData.bloodPressureSystolic}/${latestData.bloodPressureDiastolic}`;
    updateTrend('bp-trend', latestData.bloodPressureSystolic, previousData.bloodPressureSystolic);
    
    // Oxygen Level
    document.getElementById('o2-value').textContent = latestData.oxygenLevel;
    updateTrend('o2-trend', latestData.oxygenLevel, previousData.oxygenLevel);
    
    // Temperature
    document.getElementById('temp-value').textContent = latestData.temperature;
    updateTrend('temp-trend', parseFloat(latestData.temperature), parseFloat(previousData.temperature));
}

// Update trend indicator
function updateTrend(elementId, currentValue, previousValue) {
    const trendElement = document.getElementById(elementId);
    const diff = currentValue - previousValue;
    const percentChange = ((diff / previousValue) * 100).toFixed(1);
    
    if (diff > 0) {
        trendElement.innerHTML = `<i class="fas fa-arrow-up"></i> ${percentChange}% from yesterday`;
        trendElement.className = 'stat-trend trend-up';
    } else if (diff < 0) {
        trendElement.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(percentChange)}% from yesterday`;
        trendElement.className = 'stat-trend trend-down';
    } else {
        trendElement.innerHTML = `<i class="fas fa-minus"></i> No change from yesterday`;
        trendElement.className = 'stat-trend trend-neutral';
    }
}

// Initialize the main chart
function initMainChart(healthData) {
    const ctx = document.getElementById('main-chart').getContext('2d');
    
    // Format dates for display
    const labels = healthData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Prepare datasets
    const heartRateData = healthData.map(item => item.heartRate);
    const bpSysData = healthData.map(item => item.bloodPressureSystolic);
    const bpDiaData = healthData.map(item => item.bloodPressureDiastolic);
    const oxygenData = healthData.map(item => item.oxygenLevel);
    const tempData = healthData.map(item => parseFloat(item.temperature));
    
    // Create chart
    window.mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Heart Rate (BPM)',
                    data: heartRateData,
                    backgroundColor: 'rgba(0, 230, 255, 0.1)',
                    borderColor: '#00e6ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#00e6ff',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'BP Systolic (mmHg)',
                    data: bpSysData,
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderColor: '#ff00ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#ff00ff',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'BP Diastolic (mmHg)',
                    data: bpDiaData,
                    backgroundColor: 'rgba(204, 0, 204, 0.1)',
                    borderColor: '#cc00cc',
                    borderWidth: 2,
                    pointBackgroundColor: '#cc00cc',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Oxygen Level (%)',
                    data: oxygenData,
                    backgroundColor: 'rgba(0, 255, 157, 0.1)',
                    borderColor: '#00ff9d',
                    borderWidth: 2,
                    pointBackgroundColor: '#00ff9d',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Temperature (°C)',
                    data: tempData,
                    backgroundColor: 'rgba(255, 94, 98, 0.1)',
                    borderColor: '#ff5e62',
                    borderWidth: 2,
                    pointBackgroundColor: '#ff5e62',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#a0a0a0',
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 15, 35, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            elements: {
                line: {
                    tension: 0.4
                }
            }
        }
    });
}

// Setup toggle buttons
function setupToggleButtons() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach(button => {
        // Set all buttons to active by default
        button.classList.add('active');
        
        button.addEventListener('click', function() {
            const datasetIndex = this.dataset.index;
            const isActive = this.classList.contains('active');
            
            // Toggle active class
            this.classList.toggle('active');
            
            // Toggle dataset visibility
            toggleDataset(datasetIndex, !isActive);
            
            // Prevent all datasets from being hidden
            const activeButtons = document.querySelectorAll('.toggle-btn.active');
            if (activeButtons.length === 0) {
                this.classList.add('active');
                toggleDataset(datasetIndex, true);
            }
        });
    });
}

// Toggle dataset visibility
function toggleDataset(index, visible) {
    const chart = window.mainChart;
    
    if (chart && chart.data && chart.data.datasets && chart.data.datasets[index]) {
        chart.data.datasets[index].hidden = !visible;
        chart.update();
    }
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
