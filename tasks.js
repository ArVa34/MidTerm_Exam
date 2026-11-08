// This file contains all the Javascript Code for the page of tasks.html

// This array will hold all our task objects in memory while the user is on the page.
let tasks = [];

// Wait for the HTML to fully load before trying to grab elements
document.addEventListener("DOMContentLoaded", initTaskApp);

function initTaskApp() {
    // 2. Element selection
    const taskForm = document.querySelector('[data-form="task-entry"]');
    const searchInput = document.querySelector('[data-input="search"]');
    const filterSelect = document.querySelector('[data-select="filter-status"]');
    const sortSelect = document.querySelector('[data-select="sort"]');
    const taskTableBody = document.querySelector('[data-container="task-list"]');
    
    // 3. Load any saved data
    // Grab any previously saved tasks from the browser's persistent storage.
    loadTasks();
    
    // 4. Initizalize Kaban
    // Setup the drag-and-drop listeners for the columns
    initKanban();

    // 5. Attach event listeners
    // Form submission (Add/Edit)
    taskForm.addEventListener("submit", handleFormSubmit);
    
    // Live search (Triggers every time the user types a letter)
    searchInput.addEventListener("input", renderTasks);
    
    // Filtering and Sorting (Triggers when the dropdown changes)
    filterSelect.addEventListener("change", renderTasks);
    sortSelect.addEventListener("change", renderTasks);

    // Event Delegation for Table Buttons: 
    taskTableBody.addEventListener("click", handleTaskAction);
    // Event listener for the custom Delete Modal ---
    document.querySelector('#confirmDeleteBtn').addEventListener('click', executeDeleteTask);
    
}

function loadTasks() {
    // Look inside the browser's memory for our specific key "aeroTasks"
    const storedTasks = localStorage.getItem("aeroTasks");
    
    if (storedTasks) {
        // If data exists, convert it from a JSON string back into a JavaScript array
        tasks = JSON.parse(storedTasks);
    } else {
        // If it's the first time visiting, start with an empty array
        tasks = []; 
    }
    // Draw the UI based on the loaded data
    renderTasks();
}

function saveTasks() {
    // Convert the JavaScript array into a JSON string and save it to the browser
    localStorage.setItem("aeroTasks", JSON.stringify(tasks));
}

function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    // Check if any required fields are empty
    if (!form.checkValidity()) {
        form.classList.add('was-validated'); // This triggers Bootstrap's red error messages
        return; // Stop the function here so it doesn't save an empty task
    }

    const taskIdInput = form.querySelector('[name="taskId"]');
    const nameInput = form.querySelector('[name="taskName"]');
    const descInput = form.querySelector('[name="taskDesc"]');
    const dateInput = form.querySelector('[name="taskDate"]');
    const priorityInput = form.querySelector('[name="taskPriority"]');

    const isEditing = taskIdInput.value !== "";

    if (isEditing) {
        const taskIndex = tasks.findIndex(t => t.id === taskIdInput.value);
        if (taskIndex > -1) {
            tasks[taskIndex].name = nameInput.value;
            tasks[taskIndex].desc = descInput.value;
            tasks[taskIndex].date = dateInput.value;
            tasks[taskIndex].priority = priorityInput.value;
        }
    } else {
        const newTask = {
            id: Date.now().toString(),
            name: nameInput.value,
            desc: descInput.value,
            date: dateInput.value,
            priority: priorityInput.value,
            status: "pending" 
        };
        tasks.push(newTask);
    }

    saveTasks();
    renderTasks();

    form.reset();
    taskIdInput.value = "";
    // Clear the red validation outlines for the next time the user adds a task
    form.classList.remove('was-validated');
}

function renderTasks() {
    const tbody = document.querySelector('[data-container="task-list"]');
    // Get current values from the control panel
    const searchInput = document.querySelector('[data-input="search"]').value.toLowerCase();
    const filterStatus = document.querySelector('[data-select="filter-status"]').value;
    const sortValue = document.querySelector('[data-select="sort"]').value;

    // 1. Filtering
    let filteredTasks = tasks.filter(task => {
        // Check if the search text exists in the name OR description
        const matchesSearch = task.name.toLowerCase().includes(searchInput) || 
                              task.desc.toLowerCase().includes(searchInput);
        
        // Check if the task status matches the dropdown (or if 'all' is selected)
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    // 2. Sorting
    filteredTasks.sort((a, b) => {
        if (sortValue === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortValue === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortValue === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
    });

    // 3. Draw the table
    tbody.innerHTML = ""; // Clear the table before drawing
    
    filteredTasks.forEach(task => {
        const tr = document.createElement("tr");
        
        // Pick colors based on priority and status
        const priorityClass = task.priority === 'High' ? 'bg-danger' : 
                             (task.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-info');
        const statusClass = task.status === 'completed' ? 'bg-success' : (task.status === 'in-progress' ? 'bg-primary' : 'bg-secondary');
        
        tr.innerHTML = `
            <td>
                <div class="fw-bold">${task.name}</div>
                <small class="text-muted">${task.desc}</small>
            </td>
            <td>${task.date}</td>
            <td><span class="badge ${priorityClass}">${task.priority}</span></td>
            <td><span class="badge ${statusClass}">${task.status}</span></td>
            <td>
                <button class="btn btn-sm btn-success me-1" data-action="complete" data-id="${task.id}" title="Complete">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="btn btn-sm btn-primary me-1" data-action="edit" data-id="${task.id}" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${task.id}" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // 4. Draw the Kanban Board
    const kanbanColumns = document.querySelectorAll('.kanban-column');
    kanbanColumns.forEach(col => col.innerHTML = ""); // Clear all columns

    // Note: We use the original 'tasks' array here, not 'filteredTasks', 
    // so the Kanban always shows everything regardless of table filters.
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'card shadow-sm border-0 cursor-pointer';
        card.setAttribute('draggable', 'true'); // Makes it drag-and-drop compatible
        card.setAttribute('data-id', task.id);
        
        const priorityBorder = task.priority === 'High' ? 'border-danger' : 
                              (task.priority === 'Medium' ? 'border-warning' : 'border-info');
        card.classList.add('border-start', 'border-4', priorityBorder);

        card.innerHTML = `
            <div class="card-body p-3">
                <h6 class="fw-bold mb-1">${task.name}</h6>
                <p class="text-muted small mb-2">${task.desc}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="fw-bold"><i class="fa-regular fa-calendar"></i> ${task.date}</small>
                </div>
            </div>
        `;

        // Add drag events to the specific card
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        // Find the right column and attach the card
        const column = document.querySelector(`.kanban-column[data-kanban-status="${task.status}"]`);
        if (column) {
            column.appendChild(card);
        }
    });

    // 5. Update Dashboard Numbers
    updateDashboardSummary();
}

function updateDashboardSummary() {
    const totalEl = document.querySelector('[data-summary="total"]');
    const pendingEl = document.querySelector('[data-summary="pending"]');
    const completedEl = document.querySelector('[data-summary="completed"]');
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    // Anything not completed (pending or in-progress) counts as pending for the top dashboard
    const pending = total - completed; 
    
    totalEl.textContent = total;
    pendingEl.textContent = pending;
    completedEl.textContent = completed;
}

function handleTaskAction(event) {
    // .closest() ensures we get the button element even if the user clicked the icon INSIDE the button
    const button = event.target.closest('button[data-action]');
    if (!button) return; // If they clicked the table but not a button, do nothing

    // Read the data attributes we attached in the HTML
    const action = button.getAttribute('data-action');
    const taskId = button.getAttribute('data-id');
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return;

    if (action === 'delete') {
        // 1. Temporarily store the ID of the task on the confirm button
        document.querySelector('#confirmDeleteBtn').setAttribute('data-target-id', taskId);
        
        // 2. Show the Bootstrap modal
        const modalElement = document.querySelector('#deleteTaskModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
        
        return; 
    } 
    else if (action === 'complete') {
        // Toggle the status between completed and pending
        tasks[taskIndex].status = tasks[taskIndex].status === 'completed' ? 'pending' : 'completed';
    } 
    else if (action === 'edit') {
        const form = document.querySelector('[data-form="task-entry"]');
        const task = tasks[taskIndex];
        
        // Populate the form fields with the task's current data
        form.querySelector('[name="taskId"]').value = task.id;
        form.querySelector('[name="taskName"]').value = task.name;
        form.querySelector('[name="taskDesc"]').value = task.desc;
        form.querySelector('[name="taskDate"]').value = task.date;
        form.querySelector('[name="taskPriority"]').value = task.priority;
        
        // Smoothly scroll the user back up to the form
        form.scrollIntoView({ behavior: 'smooth' });
        
        // We return early here because we don't want to save/render yet.
        // We wait for them to click "Save Mission" on the form.
        return; 
    }

    // Save and redraw (Will only run for delete and complete actions)
    saveTasks();
    renderTasks();
}

// --- 6. Kanban Drag & Drop & Mobile Tap Logic ---
function initKanban() {
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
        // Desktop Drag and Drop
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        
        // Mobile Tap-to-Move (Event Delegation)
        column.addEventListener('click', handleKanbanTap);
    });
}

function handleDragStart(event) {
    // When dragging starts, we save the Task ID into the dataTransfer object.
    // This allows us to know which card we are dropping later.
    event.dataTransfer.setData('text/plain', event.target.getAttribute('data-id'));
    
    // Fade the card out slightly while dragging so it looks like it was picked up
    event.target.classList.add('opacity-50'); 
}

function handleDragEnd(event) {
    // Restore the card's opacity when we drop it
    event.target.classList.remove('opacity-50');
}

function handleDragOver(event) {
    // We MUST call preventDefault() here, otherwise the browser will not allow the drop action.
    event.preventDefault(); 
}

function handleDrop(event) {
    event.preventDefault();
    
    // Retrieve the ID of the task we just dropped
    const taskId = event.dataTransfer.getData('text/plain');
    
    // Find exactly which column we dropped it into
    const column = event.target.closest('.kanban-column');
    if (!column) return;
    
    // Read the status that belongs to this specific column
    const newStatus = column.getAttribute('data-kanban-status');
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    // If the task exists and we actually moved it to a different column.
    if (taskIndex > -1 && tasks[taskIndex].status !== newStatus) {
        // Update its status, save to memory, and redraw everything
        tasks[taskIndex].status = newStatus;
        saveTasks();
        renderTasks(); 
    }
}

// --- Mobile Tap-To-Move Logic ---
function handleKanbanTap(event) {
    // Check if the user tapped on a card
    const card = event.target.closest('.card');
    if (!card) return;

    // Get task details
    const taskId = card.getAttribute('data-id');
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    const task = tasks[taskIndex];

    // Set the mission name in the modal
    document.querySelector('#moveTaskName').textContent = task.name;
    
    const buttonsContainer = document.querySelector('#moveTaskButtons');
    buttonsContainer.innerHTML = ''; 

    // Define the three possible columns
    const statuses = [
        { id: 'pending', label: 'To Do', class: 'btn-secondary' },
        { id: 'in-progress', label: 'In Progress', class: 'btn-primary' },
        { id: 'completed', label: 'Completed', class: 'btn-success' }
    ];

    // Generate buttons ONLY for the columns the task is NOT currently in
    statuses.forEach(statusObj => {
        if (task.status !== statusObj.id) {
            const btn = document.createElement('button');
            btn.className = `btn btn-lg ${statusObj.class}`;
            btn.textContent = `Move to ${statusObj.label}`;
            
            btn.addEventListener('click', () => {
                executeKanbanTransfer(task.id, statusObj.id);
            });
            
            buttonsContainer.appendChild(btn);
        }
    });

    // Initialize and show the Bootstrap modal 
    const modalElement = document.querySelector('#moveTaskModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
}

function executeKanbanTransfer(taskId, newStatus) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        // Update status, save, and render
        tasks[taskIndex].status = newStatus;
        saveTasks();
        renderTasks(); 
        
        // Hide the modal after successful transfer
        const modalElement = document.querySelector('#moveTaskModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}

// Performs the actual deletion when modal is confirmed 
function executeDeleteTask(event) {
    const taskId = event.target.getAttribute('data-target-id');
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex > -1) {
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks(); 
        
        // Hide the modal
        const modalElement = document.querySelector('#deleteTaskModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}