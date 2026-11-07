$(document).ready(function() {
    loadHomepageData();
});

function loadHomepageData() {
    // 1. Grab tasks from browser memory (from tasks.js)
    let tasks = [];
    const storedTasks = localStorage.getItem("aeroTasks");
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    
    // Filter out completed tasks
    let pendingTasks = tasks.filter(t => t.status !== 'completed');

    // 2. Render the tasks on the dashboard
    renderRecentTasks(pendingTasks);

    // 3. Fetch Weather & Determine Flight Logic
    fetchWeatherAndEvaluate(pendingTasks);
}

function renderRecentTasks(pendingTasks) {
    const listContainer = $('#recent-tasks-list');
    listContainer.empty();

    if (pendingTasks.length === 0) {
        listContainer.append(`
            <li class="list-group-item text-center py-4 text-muted border-0">
                <i class="fa-solid fa-check-double fa-2x mb-2 text-success opacity-50"></i><br>
                No active missions. Fleet is on standby.
            </li>
        `);
        return;
    }

    // Sort to put High Priority at the top, then grab the top 3
    let sortedTasks = pendingTasks.sort((a, b) => {
        if (a.priority === 'High' && b.priority !== 'High') return -1;
        if (b.priority === 'High' && a.priority !== 'High') return 1;
        return 0;
    }).slice(0, 3);

    sortedTasks.forEach(task => {
        const badgeClass = task.priority === 'High' ? 'bg-danger' : (task.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-info');
        listContainer.append(`
            <li class="list-group-item py-3 d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="fw-bold mb-1">${task.name}</h6>
                    <small class="text-muted"><i class="fa-regular fa-calendar me-1"></i>${task.date}</small>
                </div>
                <span class="badge ${badgeClass} rounded-pill px-3 py-2">${task.priority}</span>
            </li>
        `);
    });
}

function fetchWeatherAndEvaluate(pendingTasks) {
    const weatherContainer = $('#weather-container');
    
    // Using Open-Meteo Free API (Coordinates for Athens, Greece)
    const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=37.9838&longitude=23.7275&current_weather=true';

    $.ajax({
        url: apiUrl,
        method: 'GET',
        success: function(response) {
            const temp = response.current_weather.temperature;
            const windSpeed = response.current_weather.windspeed; // In km/h
            
            // Define threshold for "Bad Weather" (e.g., Wind > 20 km/h)
            const isBadWeather = windSpeed > 20;

            // Check if there are any High Priority pending tasks
            const hasHighPriority = pendingTasks.some(t => t.priority === 'High');

            // Construct HTML based on conditions
            let weatherHtml = `
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <div class="display-4 fw-bold">${temp}°C</div>
                    <div class="text-end">
                        <div class="fw-bold text-muted">Wind Speed</div>
                        <div class="fs-5 ${isBadWeather ? 'text-danger' : 'text-success'}">
                            <i class="fa-solid fa-wind"></i> ${windSpeed} km/h
                        </div>
                    </div>
                </div>
                <hr>
            `;

            // DECISION ENGINE LOGIC
            if (!isBadWeather) {
                weatherHtml += `
                    <div class="alert alert-success border-0 shadow-sm mt-auto mb-0">
                        <i class="fa-solid fa-check-circle me-2"></i> <strong>Clear to fly.</strong> Meteorological conditions are optimal for all fleet operations.
                    </div>
                `;
            } else {
                if (hasHighPriority) {
                    // Bad Weather + High Priority Tasks
                    weatherHtml += `
                        <div class="alert alert-danger border-0 shadow-sm mt-auto mb-0">
                            <h6 class="fw-bold"><i class="fa-solid fa-triangle-exclamation"></i> Flight Warning</h6>
                            <p class="small mb-2">High winds detected (${windSpeed} km/h). You have <strong>High Priority</strong> missions pending.</p>
                            <button class="btn btn-sm btn-danger w-100 fw-bold">Arrange Team Meeting</button>
                        </div>
                    `;
                } else {
                    // Bad Weather + Only Low/Medium Priority
                    weatherHtml += `
                        <div class="alert alert-warning border-0 shadow-sm mt-auto mb-0">
                            <h6 class="fw-bold"><i class="fa-solid fa-wind"></i> Unfavorable Conditions</h6>
                            <p class="small mb-2">High winds detected. Since pending missions are Low/Medium priority, it is recommended to ground the fleet.</p>
                            <a href="tasks.html" class="btn btn-sm btn-warning w-100 fw-bold text-dark">Reschedule Missions</a>
                        </div>
                    `;
                }
            }

            weatherContainer.html(weatherHtml);
        },
        error: function() {
            weatherContainer.html(`
                <div class="alert alert-danger border-0 shadow-sm">
                    <i class="fa-solid fa-triangle-exclamation"></i> Unable to retrieve weather telemetry. Please check sensors.
                </div>
            `);
        }
    });
}