const STORAGE_KEY = 'dashboard-data';
const THEME_KEY = 'dashboard-theme';
const VISIBILITY_KEY = 'dashboard-visibility';

let appState = {
    stats: {
        users: 1247,
        revenue: 45890,
        orders: 328,
        satisfaction: 94.5
    },
    salesData: [30, 45, 35, 55, 50, 65, 60],
    analyticsData: [20, 35, 40, 30, 45, 55, 50, 60, 55, 65, 70, 75],
    dateRange: { from: null, to: null }
};

let chartPoints = {
    sales: [],
    analytics: []
};

document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    
    setTimeout(() => {
        loadState();
        loadTheme();
        loadVisibility();
        initializeNavigation();
        initializeStats();
        initializeCharts();
        initializeDarkMode();
        initializeEditing();
        initializeExport();
        initializeCustomization();
        initializeDateFilter();
        initializeKeyboardNav();
        
        hideLoading();
    }, 800);
});

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appState = { ...appState, ...parsed };
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

function loadTheme() {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) toggle.checked = true;
        updateThemeIcon(true);
    }
}

function saveTheme(isDark) {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}

function loadVisibility() {
    const saved = localStorage.getItem(VISIBILITY_KEY);
    if (saved) {
        try {
            const visibility = JSON.parse(saved);
            Object.keys(visibility).forEach(stat => {
                const card = document.querySelector(`.stat-card[data-stat="${stat}"]`);
                const checkbox = document.querySelector(`.stat-visibility[data-stat="${stat}"]`);
                const modalCheckbox = document.querySelector(`.stat-visibility-modal[data-stat="${stat}"]`);
                
                if (!visibility[stat]) {
                    if (card) card.classList.add('hidden');
                    if (checkbox) checkbox.checked = false;
                    if (modalCheckbox) modalCheckbox.checked = false;
                }
            });
        } catch (e) {
            console.error('Failed to load visibility:', e);
        }
    }
}

function saveVisibility() {
    const visibility = {};
    document.querySelectorAll('.stat-visibility').forEach(checkbox => {
        visibility[checkbox.dataset.stat] = checkbox.checked;
    });
    localStorage.setItem(VISIBILITY_KEY, JSON.stringify(visibility));
}

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');
    
    navItems.forEach(item => {
        item.addEventListener('click', handleNavClick);
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavClick.call(this, e);
            }
        });
    });
    
    function handleNavClick(e) {
        e.preventDefault();
        
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        const page = this.getAttribute('data-page');
        showPage(page);
        
        const titles = {
            'overview': 'Overview Dashboard',
            'analytics': 'Analytics',
            'reports': 'Reports',
            'settings': 'Settings'
        };
        pageTitle.textContent = titles[page] || 'Dashboard';
    }
}

function showPage(pageName) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function initializeStats() {
    animateValue('users-count', 0, appState.stats.users, 1500);
    animateValue('revenue-count', 0, appState.stats.revenue, 1500, true);
    animateValue('orders-count', 0, appState.stats.orders, 1500);
    animateValue('satisfaction-rate', 0, appState.stats.satisfaction, 1500, false, true);
}

function animateValue(id, start, end, duration, isCurrency = false, isPercentage = false) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (isCurrency) {
            displayValue = '$' + displayValue.toLocaleString();
        } else if (isPercentage) {
            displayValue = current.toFixed(1) + '%';
        }
        
        element.textContent = displayValue;
    }, 16);
}

function updateStatDisplay(stat) {
    const value = appState.stats[stat];
    let formatted = value;
    
    switch(stat) {
        case 'revenue':
            formatted = '$' + Math.floor(value).toLocaleString();
            break;
        case 'satisfaction':
            formatted = value.toFixed(1) + '%';
            break;
        default:
            formatted = Math.floor(value).toLocaleString();
    }
    
    const element = document.getElementById(`${stat}-count`) || document.getElementById(`${stat}-rate`);
    if (element) {
        element.textContent = formatted;
    }
}

function initializeCharts() {
    drawSalesChart();
    drawTrafficChart();
    drawAnalyticsChart();
}

function drawSalesChart() {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    chartPoints.sales = drawLineChart(ctx, appState.salesData, labels, '#667eea');
    setupChartTooltips(canvas, chartPoints.sales, labels, 'sales-tooltip');
}

function drawTrafficChart() {
    const canvas = document.getElementById('traffic-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const data = [40, 30, 20, 10];
    const labels = ['Direct', 'Social', 'Referral', 'Organic'];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
    
    drawPieChart(ctx, data, labels, colors);
    setupPieTooltips(canvas, data, labels, colors, 'traffic-tooltip');
}

function drawAnalyticsChart() {
    const canvas = document.getElementById('analytics-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    chartPoints.analytics = drawLineChart(ctx, appState.analyticsData, labels, '#764ba2');
    setupChartTooltips(canvas, chartPoints.analytics, labels, 'analytics-tooltip');
}

function drawLineChart(ctx, data, labels, color) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 40;
    const maxValue = Math.max(...data) * 1.2;
    
    ctx.clearRect(0, 0, width, height);
    
    const xStep = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / maxValue;
    
    const isDark = document.body.classList.contains('dark-theme');
    const gridColor = isDark ? '#2a2a3e' : '#e0e6ed';
    const textColor = isDark ? '#b8b8b8' : '#7f8c8d';
    
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height - padding * 2) * i / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    const points = [];
    data.forEach((value, index) => {
        const x = padding + index * xStep;
        const y = height - padding - value * yScale;
        points.push({ x, y, value });
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    ctx.fillStyle = color;
    data.forEach((value, index) => {
        const x = padding + index * xStep;
        const y = height - padding - value * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.fillStyle = textColor;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
        const x = padding + index * xStep;
        ctx.fillText(label, x, height - 15);
    });
    
    return points;
}

function drawPieChart(ctx, data, labels, colors) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    ctx.clearRect(0, 0, width, height);
    
    const total = data.reduce((sum, value) => sum + value, 0);
    let currentAngle = -Math.PI / 2;
    
    data.forEach((value, index) => {
        const sliceAngle = (value / total) * Math.PI * 2;
        
        ctx.fillStyle = colors[index];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        const isDark = document.body.classList.contains('dark-theme');
        ctx.strokeStyle = isDark ? '#16213e' : 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 35);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 35);
        
        const textColor = isDark ? '#eaeaea' : '#2c3e50';
        ctx.fillStyle = textColor;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], labelX, labelY);
        ctx.font = '11px sans-serif';
        ctx.fillText(`${Math.round(value / total * 100)}%`, labelX, labelY + 15);
        
        currentAngle += sliceAngle;
    });
}

function setupChartTooltips(canvas, points, labels, tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (!tooltip) return;
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let found = false;
        points.forEach((point, index) => {
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance < 15) {
                tooltip.textContent = `${labels[index]}: ${Math.round(point.value)}`;
                tooltip.style.left = `${e.clientX - rect.left + 10}px`;
                tooltip.style.top = `${e.clientY - rect.top - 30}px`;
                tooltip.classList.add('visible');
                found = true;
            }
        });
        
        if (!found) {
            tooltip.classList.remove('visible');
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
    });
}

function setupPieTooltips(canvas, data, labels, colors, tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (!tooltip) return;
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 3;
        
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        if (distance <= radius) {
            const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
            const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
            
            const total = data.reduce((sum, val) => sum + val, 0);
            let currentAngle = 0;
            
            for (let i = 0; i < data.length; i++) {
                const sliceAngle = (data[i] / total) * Math.PI * 2;
                if (normalizedAngle >= currentAngle && normalizedAngle <= currentAngle + sliceAngle) {
                    tooltip.textContent = `${labels[i]}: ${data[i]} (${Math.round(data[i] / total * 100)}%)`;
                    tooltip.style.left = `${e.clientX - rect.left + 10}px`;
                    tooltip.style.top = `${e.clientY - rect.top - 30}px`;
                    tooltip.classList.add('visible');
                    return;
                }
                currentAngle += sliceAngle;
            }
        }
        
        tooltip.classList.remove('visible');
    });
    
    canvas.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
    });
}

function initializeDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (toggle) {
        toggle.addEventListener('change', function() {
            toggleTheme(this.checked);
        });
    }
    
    if (themeBtn) {
        themeBtn.addEventListener('click', function() {
            const isDark = !document.body.classList.contains('dark-theme');
            toggleTheme(isDark);
            if (toggle) toggle.checked = isDark;
        });
    }
}

function toggleTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    saveTheme(isDark);
    updateThemeIcon(isDark);
    initializeCharts();
}

function updateThemeIcon(isDark) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
    }
}

function initializeEditing() {
    const statCards = document.querySelectorAll('.stat-card');
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const statInput = document.getElementById('stat-input');
    const statLabel = document.getElementById('stat-label');
    const errorMsg = document.getElementById('error-message');
    const saveBtn = document.getElementById('modal-save');
    const cancelBtn = document.getElementById('modal-cancel');
    const closeBtn = modal.querySelector('.modal-close');
    
    let currentStat = null;
    
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            openEditModal(this.dataset.stat);
        });
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openEditModal(this.dataset.stat);
            }
        });
    });
    
    function openEditModal(stat) {
        currentStat = stat;
        const titles = {
            users: 'Edit Total Users',
            revenue: 'Edit Revenue ($)',
            orders: 'Edit Orders',
            satisfaction: 'Edit Satisfaction (%)'
        };
        
        modalTitle.textContent = titles[stat] || 'Edit Value';
        statLabel.textContent = stat === 'satisfaction' ? 'New Value (0-100):' : 'New Value:';
        statInput.value = appState.stats[stat];
        statInput.max = stat === 'satisfaction' ? '100' : '';
        errorMsg.classList.remove('visible');
        modal.classList.add('active');
        statInput.focus();
    }
    
    function closeModal() {
        modal.classList.remove('active');
        currentStat = null;
    }
    
    saveBtn.addEventListener('click', function() {
        const value = parseFloat(statInput.value);
        
        if (isNaN(value) || value < 0) {
            errorMsg.textContent = 'Please enter a valid positive number';
            errorMsg.classList.add('visible');
            return;
        }
        
        if (currentStat === 'satisfaction' && value > 100) {
            errorMsg.textContent = 'Satisfaction cannot exceed 100%';
            errorMsg.classList.add('visible');
            return;
        }
        
        const oldValue = appState.stats[currentStat];
        appState.stats[currentStat] = value;
        saveState();
        
        const id = currentStat === 'satisfaction' ? `${currentStat}-rate` : `${currentStat}-count`;
        const isCurrency = currentStat === 'revenue';
        const isPercentage = currentStat === 'satisfaction';
        
        animateValue(id, oldValue, value, 800, isCurrency, isPercentage);
        
        closeModal();
    });
    
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    statInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveBtn.click();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    const resetBtn = document.getElementById('reset-data');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all data to defaults?')) {
                appState.stats = {
                    users: 1247,
                    revenue: 45890,
                    orders: 328,
                    satisfaction: 94.5
                };
                saveState();
                initializeStats();
            }
        });
    }
}

function initializeExport() {
    const jsonBtn = document.getElementById('export-json');
    const csvBtn = document.getElementById('export-csv');
    
    if (jsonBtn) {
        jsonBtn.addEventListener('click', exportJSON);
    }
    
    if (csvBtn) {
        csvBtn.addEventListener('click', exportCSV);
    }
}

function exportJSON() {
    const data = {
        stats: appState.stats,
        salesData: appState.salesData,
        analyticsData: appState.analyticsData,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, 'dashboard-data.json');
}

function exportCSV() {
    let csv = 'Metric,Value\n';
    csv += `Total Users,${appState.stats.users}\n`;
    csv += `Revenue,$${appState.stats.revenue}\n`;
    csv += `Orders,${appState.stats.orders}\n`;
    csv += `Satisfaction,${appState.stats.satisfaction}%\n`;
    csv += '\nSales Data (Weekly)\n';
    csv += 'Day,Value\n';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    appState.salesData.forEach((val, idx) => {
        csv += `${days[idx]},${val}\n`;
    });
    csv += '\nAnalytics Data (Monthly)\n';
    csv += 'Month,Value\n';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    appState.analyticsData.forEach((val, idx) => {
        csv += `${months[idx]},${val}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, 'dashboard-data.csv');
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function initializeCustomization() {
    const customizeBtn = document.getElementById('customize-dashboard');
    const modal = document.getElementById('customize-modal');
    const closeBtn = document.getElementById('customize-close');
    const modalClose = modal.querySelector('.modal-close');
    
    const visibilityCheckboxes = document.querySelectorAll('.stat-visibility');
    const modalCheckboxes = document.querySelectorAll('.stat-visibility-modal');
    
    if (customizeBtn) {
        customizeBtn.addEventListener('click', function() {
            modal.classList.add('active');
        });
    }
    
    function closeModal() {
        modal.classList.remove('active');
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    visibilityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            toggleStatVisibility(this.dataset.stat, this.checked);
        });
    });
    
    modalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            toggleStatVisibility(this.dataset.stat, this.checked);
            const mainCheckbox = document.querySelector(`.stat-visibility[data-stat="${this.dataset.stat}"]`);
            if (mainCheckbox) mainCheckbox.checked = this.checked;
        });
    });
    
    const clearBtn = document.getElementById('clear-storage');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
                localStorage.clear();
                location.reload();
            }
        });
    }
}

function toggleStatVisibility(stat, visible) {
    const card = document.querySelector(`.stat-card[data-stat="${stat}"]`);
    if (card) {
        card.classList.toggle('hidden', !visible);
    }
    saveVisibility();
}

function initializeDateFilter() {
    const applyBtn = document.getElementById('apply-date-filter');
    const fromInput = document.getElementById('date-from');
    const toInput = document.getElementById('date-to');
    
    const today = new Date();
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    if (fromInput) fromInput.value = monthAgo.toISOString().split('T')[0];
    if (toInput) toInput.value = today.toISOString().split('T')[0];
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const from = fromInput.value;
            const to = toInput.value;
            
            if (from && to && new Date(from) > new Date(to)) {
                alert('Start date must be before end date');
                return;
            }
            
            appState.dateRange = { from, to };
            saveState();
            
            const filteredData = filterDataByDateRange(appState.analyticsData, from, to);
            appState.analyticsData = filteredData;
            drawAnalyticsChart();
        });
    }
}

function filterDataByDateRange(data, from, to) {
    if (!from || !to) return data;
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const monthDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                      (toDate.getMonth() - fromDate.getMonth());
    
    if (monthDiff <= 0) return data.slice(0, 1);
    if (monthDiff >= data.length) return data;
    
    return data.slice(0, Math.min(monthDiff + 1, data.length));
}

function initializeKeyboardNav() {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'e':
                    e.preventDefault();
                    document.getElementById('export-json')?.click();
                    break;
                case 'd':
                    e.preventDefault();
                    document.getElementById('theme-toggle')?.click();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => modal.classList.remove('active'));
        }
    });
}

window.addEventListener('resize', function() {
    initializeCharts();
});
