// Reports.js - JavaScript for the Health Reports page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the reports page
    initReports();
});

// Get user health records from localStorage
function getUserHealthRecords() {
    const healthData = localStorage.getItem('userHealthData');
    if (!healthData) {
        return [];
    }
    
    // Parse and format the data to match our expected structure
    const records = JSON.parse(healthData).map(entry => ({
        date: entry.date,
        heartRate: entry.heartRate,
        bloodPressureSystolic: entry.bloodPressureSystolic,
        bloodPressureDiastolic: entry.bloodPressureDiastolic,
        oxygenLevel: entry.oxygenLevel,
        temperature: entry.temperature,
        notes: entry.notes || ''
    }));
    
    return records;
}

// Initialize reports page
function initReports() {
    // Get user health records
    const healthRecords = getUserHealthRecords();
    
    // Set default date range (last 30 days or based on available data)
    setDefaultDateRange(healthRecords);
    
    // Setup event listeners
    setupEventListeners(healthRecords);
    
    // Show message if no data available
    if (healthRecords.length === 0) {
        const tableBody = document.getElementById('records-table-body');
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                    No health data available. Please add your health data first using the <a href="add-health-data.html" style="color: #00e6ff;">Add Health Data</a> page.
                </td>
            </tr>
        `;
    }
}

// Set default date range based on available data or last 30 days
function setDefaultDateRange(healthRecords) {
    const today = new Date();
    let startDate = new Date(today);
    startDate.setDate(today.getDate() - 30); // Default to last 30 days
    
    // If we have health records, find the earliest date (up to 1 year)
    if (healthRecords.length > 0) {
        // Sort by date (oldest first)
        const sortedRecords = [...healthRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
        const oldestRecord = new Date(sortedRecords[0].date);
        
        // Don't go back more than a year
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        // Use the later of oldest record or one year ago
        if (oldestRecord > oneYearAgo) {
            startDate = oldestRecord;
        } else {
            startDate = oneYearAgo;
        }
    }
    
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    // Format dates as YYYY-MM-DD for input fields
    startDateInput.value = formatDate(startDate);
    endDateInput.value = formatDate(today);
    
    // Set min/max dates
    // If we have health records, use the earliest record date as min
    if (healthRecords.length > 0) {
        const dates = healthRecords.map(record => new Date(record.date));
        const earliestDate = new Date(Math.min(...dates));
        startDateInput.min = formatDate(earliestDate);
        endDateInput.min = formatDate(earliestDate);
    } else {
        // Otherwise use a reasonable default (1 year ago)
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        startDateInput.min = formatDate(oneYearAgo);
        endDateInput.min = formatDate(oneYearAgo);
    }
    
    startDateInput.max = formatDate(today);
    endDateInput.max = formatDate(today);
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Setup event listeners
function setupEventListeners(healthRecords) {
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    // Generate report button
    generateBtn.addEventListener('click', function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date');
            return;
        }
        
        // Filter records by date range
        const filteredRecords = filterRecordsByDateRange(healthRecords, startDate, endDate);
        
        // Display filtered records
        displayHealthRecords(filteredRecords);
        
        // Enable download button if records exist
        if (filteredRecords.length > 0) {
            downloadBtn.disabled = false;
        } else {
            downloadBtn.disabled = true;
        }
    });
    
    // Download PDF button
    downloadBtn.addEventListener('click', function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Filter records by date range
        const filteredRecords = filterRecordsByDateRange(healthRecords, startDate, endDate);
        
        // Generate and download PDF
        generatePDF(filteredRecords, startDate, endDate);
    });
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Initial display of records (last 7 days by default)
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const filteredRecords = filterRecordsByDateRange(healthRecords, startDate, endDate);
    displayHealthRecords(filteredRecords);
    
    // Enable download button if records exist
    if (filteredRecords.length > 0) {
        downloadBtn.disabled = false;
    } else {
        downloadBtn.disabled = true;
    }
}

// Filter records by date range
function filterRecordsByDateRange(records, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    return records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= start && recordDate <= end;
    });
}

// Display health records in the table
function displayHealthRecords(records) {
    const tableBody = document.getElementById('records-table-body');
    tableBody.innerHTML = '';
    
    if (records.length === 0) {
        // No records found
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-records">No health records found for the selected date range</td>
            </tr>
        `;
        return;
    }
    
    // Sort records by date (newest first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add records to table
    records.forEach(record => {
        const row = document.createElement('tr');
        
        // Format date for display
        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.heartRate} BPM</td>
            <td>${record.bloodPressureSystolic}/${record.bloodPressureDiastolic} mmHg</td>
            <td>${record.oxygenLevel}%</td>
            <td>${record.temperature}°C</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Generate PDF report
function generatePDF(records, startDate, endDate) {
    // Format dates for display
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    const formattedStartDate = startDateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const formattedEndDate = endDateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create new jsPDF instance
    const doc = new jspdf.jsPDF();
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('HealthCare360 – Health Summary Report', 105, 20, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    doc.setTextColor(102, 102, 102);
    doc.text(`Report Period: ${formattedStartDate} to ${formattedEndDate}`, 105, 30, { align: 'center' });
    
    // Add current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Generated on: ${currentDate}`, 105, 38, { align: 'center' });
    
    // Add user info
    const username = localStorage.getItem('username') || 'User';
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient: ${username}`, 20, 50);
    
    // Create table headers
    const headers = [['Date', 'Heart Rate', 'Blood Pressure', 'Oxygen Level', 'Temperature']];
    
    // Create table data
    const data = records.map(record => {
        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return [
            formattedDate,
            `${record.heartRate} BPM`,
            `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic} mmHg`,
            `${record.oxygenLevel}%`,
            `${record.temperature}°C`
        ];
    });
    
    // Generate table
    doc.autoTable({
        head: headers,
        body: data,
        startY: 60,
        theme: 'grid',
        headStyles: {
            fillColor: [0, 102, 204],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        margin: { top: 60 }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('HealthCare360 - Smart Home Health Monitoring System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 5, { align: 'center' });
    }
    
    // Generate filename with current date
    const today = new Date();
    const filename = `Health_Report_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.pdf`;
    
    // Save PDF
    doc.save(filename);
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
