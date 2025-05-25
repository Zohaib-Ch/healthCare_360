// Dashboard.js - Main JavaScript for the Dashboard page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the dashboard
    initDashboard();
});

// Generate random health data for demo purposes
function generateHealthData(days = 7) {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        data.push({
            date: date.toISOString().split('T')[0],
            heartRate: Math.floor(Math.random() * (100 - 60) + 60), // 60-100 bpm
            bloodPressureSystolic: Math.floor(Math.random() * (140 - 110) + 110), // 110-140 mmHg
            bloodPressureDiastolic: Math.floor(Math.random() * (90 - 70) + 70), // 70-90 mmHg
            oxygenLevel: Math.floor(Math.random() * (100 - 94) + 94), // 94-100%
            temperature: (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1) // 36.5-37.5°C
        });
    }
    
    return data;
}

// Initialize dashboard with data
function initDashboard() {
    // Generate health data
    const healthData = generateHealthData(7);
    
    // Update vital signs cards with latest data
    updateVitalSigns(healthData[0]);
    
    // Initialize charts
    initCharts(healthData);
    
    // Setup event listeners for filter options
    setupFilterListeners(healthData);
}

// Update vital signs cards with the latest data
function updateVitalSigns(latestData) {
    document.getElementById('heart-rate-value').textContent = latestData.heartRate;
    document.getElementById('blood-pressure-value').textContent = 
        `${latestData.bloodPressureSystolic}/${latestData.bloodPressureDiastolic}`;
    document.getElementById('oxygen-level-value').textContent = latestData.oxygenLevel;
    document.getElementById('temperature-value').textContent = latestData.temperature;
}

// Initialize all charts
function initCharts(data) {
    const dates = data.map(item => item.date).reverse();
    
    // Heart Rate Chart
    const heartRateData = data.map(item => item.heartRate).reverse();
    createChart('heart-rate-chart', 'Heart Rate (BPM)', dates, heartRateData, '#00e6ff');
    
    // Blood Pressure Chart
    const systolicData = data.map(item => item.bloodPressureSystolic).reverse();
    const diastolicData = data.map(item => item.bloodPressureDiastolic).reverse();
    createDualChart('blood-pressure-chart', 'Blood Pressure (mmHg)', dates, 
        systolicData, diastolicData, '#ff00ff', '#00a3cc');
    
    // Oxygen Level Chart
    const oxygenData = data.map(item => item.oxygenLevel).reverse();
    createChart('oxygen-level-chart', 'Oxygen Level (%)', dates, oxygenData, '#00ff9d');
    
    // Temperature Chart
    const tempData = data.map(item => parseFloat(item.temperature)).reverse();
    createChart('temperature-chart', 'Temperature (°C)', dates, tempData, '#ff5e62');
}

// Create a single line chart
function createChart(canvasId, label, labels, data, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: color + '33', // Color with opacity
                borderColor: color,
                borderWidth: 2,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0a0a0'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 15, 35, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: color,
                    borderWidth: 1
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
            }
        }
    });
}

// Create a dual line chart (for blood pressure)
function createDualChart(canvasId, label, labels, data1, data2, color1, color2) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Systolic',
                    data: data1,
                    backgroundColor: color1 + '33', // Color with opacity
                    borderColor: color1,
                    borderWidth: 2,
                    pointBackgroundColor: color1,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Diastolic',
                    data: data2,
                    backgroundColor: color2 + '33', // Color with opacity
                    borderColor: color2,
                    borderWidth: 2,
                    pointBackgroundColor: color2,
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
                    labels: {
                        color: '#a0a0a0'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 15, 35, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1
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
            }
        }
    });
}

// Setup event listeners for filter options
function setupFilterListeners(healthData) {
    const filterToday = document.getElementById('filter-today');
    const filterWeek = document.getElementById('filter-week');
    const filterCustom = document.getElementById('filter-custom');
    
    filterToday.addEventListener('click', function() {
        const todayData = [healthData[0]];
        updateCharts(todayData);
        setActiveFilter(this);
    });
    
    filterWeek.addEventListener('click', function() {
        updateCharts(healthData);
        setActiveFilter(this);
    });
    
    filterCustom.addEventListener('click', function() {
        // In a real app, this would open a date picker
        // For now, just show an alert
        alert('Custom date range would open a date picker in a real app');
        setActiveFilter(this);
    });
    
    // Set week as default active filter
    setActiveFilter(filterWeek);
}

// Set active filter button
function setActiveFilter(activeButton) {
    const filters = document.querySelectorAll('.filter-option');
    filters.forEach(filter => {
        filter.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Update charts with new data
function updateCharts(data) {
    // This would update the charts with new data
    // For simplicity, we're not implementing the full functionality
    console.log('Charts would be updated with:', data);
}

// Handle sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
});

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Add event listener to logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout');
    logoutBtn.addEventListener('click', logout);
});
