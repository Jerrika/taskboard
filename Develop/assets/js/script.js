$(document).ready(function() {
    // Define task statuses
    const TaskStatus = {
        NOT_STARTED: 'To Do',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Done'
    };

    // Sample tasks
    let tasks = [];

    // Function to save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to load tasks from localStorage
    function loadTasks() {
        const tasksData = JSON.parse(localStorage.getItem('tasks'));
        if (tasksData) {
            tasks = tasksData;
        }
    }

    // Function to render tasks on the task board
    function renderTasks() {
        $('#todo-cards').empty();
        $('#in-progress-cards').empty();
        $('#done-cards').empty();

        tasks.forEach((task, index) => {
            const taskCard = `<div class="card task-card mb-3 ${task.status === TaskStatus.COMPLETED ? 'done' : ''}" data-index="${index}">
                                <div class="card-body">
                                    <h5 class="card-title">${task.title}</h5>
                                    <p class="card-text">${task.description}</p>
                                    <p class="card-text">Deadline: ${task.deadline}</p>
                                    <button class="btn btn-danger delete-btn">Delete</button>
                                </div>
                            </div>`;

            if (task.status === TaskStatus.NOT_STARTED) {
                $('#todo-cards').append(taskCard);
            } else if (task.status === TaskStatus.IN_PROGRESS) {
                $('#in-progress-cards').append(taskCard);
            } else if (task.status === TaskStatus.COMPLETED) {
                $('#done-cards').append(taskCard);
            }

            // Color code tasks based on deadline
            const today = new Date();
            const deadlineDate = new Date(task.deadline);
            if (deadlineDate < today) {
                $(`[data-index="${index}"]`).addClass('task-overdue');
            } else if (deadlineDate.getDate() - today.getDate() <= 1) {
                $(`[data-index="${index}"]`).addClass('task-nearing-deadline');
            }

            // Make the task card draggable
            $(`[data-index="${index}"]`).draggable({
                containment: '.task-board',
                stack: '.task-card'
            });
        });
    }

    // Event listener for form submission to add a new task
    $('#taskForm').submit(function(event) {
        event.preventDefault();
        const title = $('#taskTitle').val();
        const description = $('#taskDescription').val();
        const deadline = $('#taskDeadline').val();
        if (title && description && deadline) {
            tasks.push({ title, description, deadline, status: TaskStatus.NOT_STARTED });
            saveTasks();
            renderTasks();
            $('#formModal').modal('hide');
        }
    });

    // Event listener for task deletion
    $(document).on('click', '.delete-btn', function() {
        const taskIndex = $(this).closest('.task-card').data('index');
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
    });

    // Initialize draggable and droppable interactions
    $(".card").draggable({
        revert: "invalid", // Snap back if not dropped in a valid droppable
        start: function() {
            $(this).addClass("dragging");
        },
        stop: function() {
            $(this).removeClass("dragging");
        }
    });
// Makes the cards droppable 
    $(".lane").droppable({
        drop: function(event, ui) {
            const droppedCard = ui.draggable;
            const newLane = $(this).attr("id");
            const taskIndex = droppedCard.data('index');

            // Update task progress state based on the new lane
            tasks[taskIndex].status = newLane === "done" ? TaskStatus.COMPLETED : newLane === "in-progress" ? TaskStatus.IN_PROGRESS : TaskStatus.NOT_STARTED;
            saveTasks();
            renderTasks();
        }
    });

    // Load and render tasks on page load
    loadTasks();
    renderTasks();
});
