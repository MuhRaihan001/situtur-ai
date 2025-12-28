// Dashboard Charts Initialization
document.addEventListener('DOMContentLoaded', function() {
    
    // Bar Chart - Tahun Proyek
    const barChartCanvas = document.getElementById('barChart');
    if (barChartCanvas) {
        // Data akan diambil dari backend melalui EJS
        const years = window.chartData.years;
        const values = window.chartData.values;
        
        const barCtx = barChartCanvas.getContext('2d');
        const barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    data: values,
                    backgroundColor: years.map((year, index) => {
                        if (index === years.length - 1) {
                            return '#0DE7F2'; // Bright Turquoise untuk tahun terbaru
                        } else if (index === years.length - 2) {
                            return 'rgba(13, 231, 242, 0.6)'; // 60% opacity
                        } else {
                            return 'rgba(13, 231, 242, 0.3)'; // 30% opacity
                        }
                    }),
                    borderRadius: {
                        topLeft: 6,
                        topRight: 6
                    },
                    barThickness: 72
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
                        backgroundColor: '#1E293B',
                        padding: {
                            top: 4,
                            right: 8,
                            bottom: 4,
                            left: 8
                        },
                        bodyColor: '#FFFFFF',
                        bodyFont: {
                            family: 'Inter',
                            size: 10
                        },
                        displayColors: false,
                        cornerRadius: 6,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' proyek';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 40,
                        ticks: {
                            stepSize: 10,
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: 500
                            },
                            color: '#94A3B8'
                        },
                        grid: {
                            borderDash: [5, 5],
                            color: '#E2E8F0',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            font: function(context) {
                                const label = context.tick.label;
                                const isLatest = label === years[years.length - 1].toString();
                                return {
                                    family: 'Inter',
                                    size: 12,
                                    weight: isLatest ? 700 : 500
                                };
                            },
                            color: function(context) {
                                const label = context.tick.label;
                                const isLatest = label === years[years.length - 1].toString();
                                return isLatest ? '#0DE7F2' : '#94A3B8';
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Line Chart - Proyek Selesai
    const lineChartCanvas = document.getElementById('lineChart');
    if (lineChartCanvas) {
        // Data monthly dari backend
        const monthlyData = window.monthlyData;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Filter hanya bulan dengan data
        const filteredMonths = [];
        const filteredData = [];
        monthlyData.forEach((value, index) => {
            if (index % 2 === 0) { // Tampilkan setiap 2 bulan
                filteredMonths.push(months[index]);
                filteredData.push(value);
            }
        });

        const lineCtx = lineChartCanvas.getContext('2d');
        
        // Create gradient
        const gradient = lineCtx.createLinearGradient(0, 0, 0, 247);
        gradient.addColorStop(0, 'rgba(13, 231, 242, 0.2)');
        gradient.addColorStop(1, 'rgba(13, 231, 242, 0)');

        const lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: filteredMonths,
                datasets: [{
                    data: filteredData,
                    borderColor: '#0DE7F2',
                    backgroundColor: gradient,
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#0DE7F2',
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7
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
                        enabled: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(...monthlyData) + 10,
                        ticks: {
                            stepSize: (Math.max(...monthlyData) + 10) / 4,
                            display: false
                        },
                        grid: {
                            borderDash: [5, 5],
                            color: '#E2E8F0'
                        },
                        border: {
                            display: true,
                            color: '#E2E8F0'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            color: '#94A3B8'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            // Implement search logic here
            console.log('Searching for:', searchTerm);
        });
    }

    // Checkbox functionality
    const checkboxes = document.querySelectorAll('.task-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('.table-row');
            if (this.checked) {
                row.style.opacity = '0.6';
            } else {
                row.style.opacity = '1';
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Auto-refresh data setiap 5 menit
    setInterval(function() {
        // Fetch updated data without full page reload
        fetch(window.location.href, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Update stats
            if (data.stats) {
                document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = data.stats.tasksPending;
                document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = data.stats.ongoingProjects;
                document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = data.stats.hoursWorked;
                document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = data.stats.safetyAlerts;
            }
        })
        .catch(error => console.error('Error refreshing data:', error));
    }, 300000); // 5 minutes

    console.log('Dashboard initialized successfully');
});