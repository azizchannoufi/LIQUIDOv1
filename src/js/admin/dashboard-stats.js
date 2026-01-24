/**
 * Dashboard Statistics Handler
 * Loads real-time statistics from Firebase
 */

(async function() {
    'use strict';
    
    let catalogService;
    
    // Wait for Firebase and catalog initialization
    try {
        // Wait for Firebase config to be available
        if (typeof window.firebaseConfig === 'undefined' || !window.firebaseConfig.initializeFirebase) {
            console.warn('Firebase config not loaded yet, waiting...');
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (typeof window.firebaseConfig !== 'undefined' && window.firebaseConfig.initializeFirebase) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }
        
        if (window.catalogInit) {
            const catalog = await window.catalogInit;
            catalogService = catalog.service;
        } else {
            // Create new instance if catalogInit is not available
            catalogService = new CatalogService();
            await catalogService.initFirebase();
        }
    } catch (error) {
        console.error('Error initializing catalog service:', error);
        showErrorState();
        return;
    }
    
    async function loadStatistics() {
        try {
            // Show loading state
            showLoadingState();
            
            // Load catalog data, users, and visits in parallel
            const [sections, usersCount, totalVisits, todayVisits] = await Promise.all([
                catalogService.getSections(),
                getUsersCount(),
                getTotalVisits(),
                getTodayVisits()
            ]);
            
            // Count total products (lines)
            let totalProducts = 0;
            let totalBrands = 0;
            const uniqueBrands = new Set();
            
            for (const section of sections) {
                const brands = section.brands || [];
                totalBrands += brands.length;
                
                for (const brand of brands) {
                    uniqueBrands.add(brand.name);
                    totalProducts += (brand.lines || []).length;
                }
            }
            
            // Update UI with real data
            updateStatValue('stat-products-value', totalProducts);
            updateStatValue('stat-brands-value', uniqueBrands.size);
            updateStatValue('stat-sections-value', sections.length);
            updateStatValue('stat-users-value', usersCount);
            
            // Update visits display
            updateStatValue('total-visits-display', totalVisits);
            updateStatValue('today-visits-count', todayVisits);
            
            // Load and render visits chart
            await loadVisitsChart(7); // Default to 7 days
            
            // Update trends (for now, just show static info)
            const productsTrend = document.getElementById('stat-products-trend');
            const brandsTrend = document.getElementById('stat-brands-trend');
            const usersTrend = document.getElementById('stat-users-trend');
            if (productsTrend) productsTrend.textContent = 'Live';
            if (brandsTrend) brandsTrend.textContent = 'Live';
            if (usersTrend) usersTrend.textContent = 'Live';
            
            // Load recent activity
            await loadRecentActivity(sections);
        } catch (error) {
            console.error('Error loading statistics:', error);
            showErrorState();
        }
    }
    
    async function getUsersCount() {
        try {
            const { database } = await window.firebaseConfig.initializeFirebase();
            const usersRef = database.ref('users');
            const snapshot = await usersRef.once('value');
            const usersData = snapshot.val();
            
            if (!usersData) {
                return 0;
            }
            
            return Object.keys(usersData).length;
        } catch (error) {
            console.error('Error fetching users count:', error);
            return 0;
        }
    }
    
    async function getTotalVisits() {
        try {
            if (window.visitsTracker) {
                return await window.visitsTracker.getTotalVisits();
            }
            
            // Fallback: get from Firebase directly
            const { database } = await window.firebaseConfig.initializeFirebase();
            const totalVisitsRef = database.ref('stats/totalVisits');
            const snapshot = await totalVisitsRef.once('value');
            return snapshot.val() || 0;
        } catch (error) {
            console.error('Error fetching total visits:', error);
            return 0;
        }
    }
    
    async function getTodayVisits() {
        try {
            const { database } = await window.firebaseConfig.initializeFirebase();
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const dailyStatsRef = database.ref(`dailyStats/${today}`);
            const snapshot = await dailyStatsRef.once('value');
            const dailyData = snapshot.val();
            return dailyData?.count || 0;
        } catch (error) {
            console.error('Error fetching today visits:', error);
            return 0;
        }
    }
    
    let visitsChart = null;
    
    async function loadVisitsChart(days = 7) {
        try {
            const { database } = await window.firebaseConfig.initializeFirebase();
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            // Get all daily stats
            const dailyStatsRef = database.ref('dailyStats');
            const snapshot = await dailyStatsRef.once('value');
            const dailyStats = snapshot.val() || {};
            
            // Prepare data for chart
            const labels = [];
            const data = [];
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                labels.push(dayLabel);
                data.push(dailyStats[dateStr]?.count || 0);
            }
            
            // Get canvas context
            const canvas = document.getElementById('visits-chart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            
            // Destroy existing chart if it exists
            if (visitsChart) {
                visitsChart.destroy();
            }
            
            // Create new chart
            visitsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Visits',
                        data: data,
                        borderColor: '#f2f20d',
                        backgroundColor: 'rgba(242, 242, 13, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#f2f20d',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 13
                            },
                            callbacks: {
                                label: function(context) {
                                    return `Visits: ${context.parsed.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#baba9c',
                                font: {
                                    size: 11
                                },
                                stepSize: 1
                            }
                        },
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false
                            },
                            ticks: {
                                color: '#baba9c',
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
            
            // Update period buttons
            updatePeriodButtons(days);
        } catch (error) {
            console.error('Error loading visits chart:', error);
        }
    }
    
    function updatePeriodButtons(activeDays) {
        const btn7d = document.getElementById('visits-period-7d');
        const btn30d = document.getElementById('visits-period-30d');
        
        if (btn7d && btn30d) {
            if (activeDays === 7) {
                btn7d.className = 'px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors';
                btn30d.className = 'px-3 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-[#393928] text-slate-700 dark:text-[#baba9c] hover:bg-slate-300 dark:hover:bg-[#4a4a35] transition-colors';
            } else {
                btn7d.className = 'px-3 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-[#393928] text-slate-700 dark:text-[#baba9c] hover:bg-slate-300 dark:hover:bg-[#4a4a35] transition-colors';
                btn30d.className = 'px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors';
            }
        }
    }
    
    // Period button handlers
    function initPeriodButtons() {
        const btn7d = document.getElementById('visits-period-7d');
        const btn30d = document.getElementById('visits-period-30d');
        
        if (btn7d) {
            btn7d.addEventListener('click', () => {
                loadVisitsChart(7);
            });
        }
        
        if (btn30d) {
            btn30d.addEventListener('click', () => {
                loadVisitsChart(30);
            });
        }
    }
    
    // Initialize buttons when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPeriodButtons);
    } else {
        initPeriodButtons();
    }
    
    function showLoadingState() {
        const productsValue = document.getElementById('stat-products-value');
        const brandsValue = document.getElementById('stat-brands-value');
        const sectionsValue = document.getElementById('stat-sections-value');
        const usersValue = document.getElementById('stat-users-value');
        
        if (productsValue) productsValue.textContent = '...';
        if (brandsValue) brandsValue.textContent = '...';
        if (sectionsValue) sectionsValue.textContent = '...';
        if (usersValue) usersValue.textContent = '...';
    }
    
    function showErrorState() {
        const productsValue = document.getElementById('stat-products-value');
        const brandsValue = document.getElementById('stat-brands-value');
        const sectionsValue = document.getElementById('stat-sections-value');
        const usersValue = document.getElementById('stat-users-value');
        
        if (productsValue) productsValue.textContent = 'Error';
        if (brandsValue) brandsValue.textContent = 'Error';
        if (sectionsValue) sectionsValue.textContent = 'Error';
        if (usersValue) usersValue.textContent = 'Error';
    }
    
    function updateStatValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }
    
    async function loadRecentActivity(sections) {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        try {
            // Get all brands with their sections and product lines from Firebase
            const allActivities = [];
            
            for (const section of sections) {
                const brands = section.brands || [];
                for (const brand of brands) {
                    const lines = brand.lines || [];
                    const linesCount = lines.length;
                    
                    // Add brand activity
                    allActivities.push({
                        type: 'brand',
                        name: brand.name || 'Unknown Brand',
                        section: section.name || section.id,
                        sectionId: section.id,
                        linesCount: linesCount,
                        logoUrl: brand.logo_url || '',
                        website: brand.website || '',
                        timestamp: brand.updatedAt || brand.createdAt || Date.now()
                    });
                    
                    // Add product line activities
                    for (const line of lines) {
                        allActivities.push({
                            type: 'product',
                            name: line.name || 'Unknown Product',
                            brandName: brand.name,
                            section: section.name || section.id,
                            sectionId: section.id,
                            imageUrl: line.image_url || '',
                            timestamp: line.updatedAt || line.createdAt || Date.now()
                        });
                    }
                }
            }
            
            if (allActivities.length === 0) {
                activityContainer.innerHTML = `
                    <div class="py-8 text-center">
                        <div class="inline-flex items-center justify-center size-16 rounded-full bg-slate-100 dark:bg-[#393928] mb-4">
                            <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-[#baba9c]">inventory_2</span>
                        </div>
                        <p class="text-sm text-slate-400 dark:text-[#baba9c] font-medium">No recent activity</p>
                        <p class="text-xs text-slate-500 dark:text-slate-600 mt-2">Activities will appear here as you manage your catalog</p>
                    </div>
                `;
                return;
            }
            
            // Sort by timestamp (most recent first)
            allActivities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            // Show last 5 activities
            const recentActivities = allActivities.slice(0, 5);
            
            activityContainer.innerHTML = recentActivities.map(activity => {
                if (activity.type === 'brand') {
                    return `
                        <div class="py-4 border-b border-slate-100 dark:border-[#393928] last:border-0 hover:bg-slate-50 dark:hover:bg-[#1a1a0f] transition-colors rounded-lg px-2 -mx-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3 flex-1 min-w-0">
                                    <div class="size-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        ${activity.logoUrl 
                                            ? `<img src="${activity.logoUrl}" alt="${activity.name}" class="w-full h-full object-contain" onerror="this.parentElement.innerHTML='<span class=\\'material-symbols-outlined text-primary text-lg\\'>loyalty</span>'"/>`
                                            : `<span class="material-symbols-outlined text-primary text-lg">loyalty</span>`
                                        }
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-slate-900 dark:text-white text-sm font-bold truncate">${activity.name}</p>
                                        <p class="text-slate-400 dark:text-[#baba9c] text-xs truncate">${activity.section} • ${activity.linesCount} ${activity.linesCount === 1 ? 'line' : 'lines'}</p>
                                    </div>
                                </div>
                                <a href="brands/add.html?section=${encodeURIComponent(activity.sectionId)}&brand=${encodeURIComponent(activity.name)}" class="text-slate-400 dark:text-[#baba9c] hover:text-primary transition-colors flex-shrink-0 ml-2" title="View">
                                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="py-4 border-b border-slate-100 dark:border-[#393928] last:border-0 hover:bg-slate-50 dark:hover:bg-[#1a1a0f] transition-colors rounded-lg px-2 -mx-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3 flex-1 min-w-0">
                                    <div class="size-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        ${activity.imageUrl 
                                            ? `<img src="${activity.imageUrl}" alt="${activity.name}" class="w-full h-full object-contain" onerror="this.parentElement.innerHTML='<span class=\\'material-symbols-outlined text-primary text-lg\\'>inventory_2</span>'"/>`
                                            : `<span class="material-symbols-outlined text-primary text-lg">inventory_2</span>`
                                        }
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-slate-900 dark:text-white text-sm font-bold truncate">${activity.name}</p>
                                        <p class="text-slate-400 dark:text-[#baba9c] text-xs truncate">${activity.brandName} • ${activity.section}</p>
                                    </div>
                                </div>
                                <a href="products/add.html?section=${encodeURIComponent(activity.sectionId)}&brand=${encodeURIComponent(activity.brandName)}&line=${encodeURIComponent(activity.name)}" class="text-slate-400 dark:text-[#baba9c] hover:text-primary transition-colors flex-shrink-0 ml-2" title="View">
                                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    `;
                }
            }).join('');
        } catch (error) {
            console.error('Error loading recent activity:', error);
            activityContainer.innerHTML = `
                <div class="py-8 text-center">
                    <p class="text-sm text-red-400 dark:text-red-500 font-medium">Error loading activities</p>
                    <p class="text-xs text-slate-500 dark:text-slate-600 mt-2">${error.message}</p>
                </div>
            `;
        }
    }
    
    // Load statistics on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadStatistics);
    } else {
        loadStatistics();
    }
})();

