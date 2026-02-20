document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeStats();
    initializeCharts();
    initializeDarkMode();
});

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
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
        });
    });
}

function showPage(pageName) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function initializeStats() {
    const stats = {
        users: 1247,
        revenue: 45890,
        orders: 328,
        satisfaction: 94.5
    };
    
    animateValue('users-count', 0, stats.users, 2000);
    animateValue('revenue-count', 0, stats.revenue, 2000, true);
    animateValue('orders-count', 0, stats.orders, 2000);
    animateValue('satisfaction-rate', 0, stats.satisfaction, 2000, false, true);
}

function animateValue(id, start, end, duration, isCurrency = false, isPercentage = false) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (isCurrency) {
            displayValue = '$' + displayValue.toLocaleString();
        } else if (isPercentage) {
            displayValue = displayValue.toFixed(1) + '%';
        }
        
        element.textContent = displayValue;
    }, 16);
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
    
    const data = [30, 45, 35, 55, 50, 65, 60];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    drawLineChart(ctx, data, labels, '#667eea');
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
}

function drawAnalyticsChart() {
    const canvas = document.getElementById('analytics-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const data = [20, 35, 40, 30, 45, 55, 50, 60, 55, 65, 70, 75];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    drawLineChart(ctx, data, labels, '#764ba2');
}

function drawLineChart(ctx, data, labels, color) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 40;
    const maxValue = Math.max(...data) * 1.2;
    
    ctx.clearRect(0, 0, width, height);
    
    const xStep = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / maxValue;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    data.forEach((value, index) => {
        const x = padding + index * xStep;
        const y = height - padding - value * yScale;
        
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
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
        const x = padding + index * xStep;
        ctx.fillText(label, x, height - 10);
    });
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
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], labelX, labelY);
        ctx.fillText(`${Math.round(value / total * 100)}%`, labelX, labelY + 15);
        
        currentAngle += sliceAngle;
    });
}

function initializeDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;
    
    toggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.style.background = '#1a1a2e';
            alert('Dark mode coming soon!');
            this.checked = false;
        }
    });
}

window.addEventListener('resize', function() {
    initializeCharts();
});
