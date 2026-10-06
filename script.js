const STORAGE_KEY = "taskly_tasks_v1";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const priority = document.getElementById("priority");
const todoList = document.getElementById("todoList");
const doneList = document.getElementById("doneList");
const todoEmpty = document.getElementById("todoEmpty");
const doneEmpty = document.getElementById("doneEmpty");

const totalCount = document.getElementById("totalCount");
const todoCount = document.getElementById("todoCount");
const doneCount = document.getElementById("doneCount");
const overdueCount = document.getElementById("overdueCount");

const today = new Date();
today.setHours(0, 0, 0, 0);

function localDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function setCurrentDate() {
  const day = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(
    today,
  );
  const date = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  document.getElementById("dayName").textContent = day;
  document.getElementById("todayDate").textContent = date;
  document.getElementById("profileDate").textContent =
    `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
}

function getTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function isOverdue(task) {
  if (task.completed) return false;
  return new Date(`${task.date}T23:59:59`) < new Date();
}

function createTaskElement(task) {
  const item = document.createElement("article");
  item.className = `task-item ${task.completed ? "completed" : ""}`;

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "check";
  check.checked = task.completed;
  check.setAttribute("aria-label", `Tandai ${task.title} sebagai selesai`);

  check.addEventListener("change", () => {
    const tasks = getTasks();
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks[index].completed = check.checked;
      tasks[index].completedAt = check.checked
        ? new Date().toISOString()
        : null;
      saveTasks(tasks);
      render();
    }
  });

  const content = document.createElement("div");

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const badge = document.createElement("span");
  badge.className = `badge priority-${task.priority}`;
  badge.textContent = task.priority;

  const deadline = document.createElement("span");
  deadline.className = `deadline ${isOverdue(task) ? "overdue" : ""}`;
  deadline.textContent = isOverdue(task)
    ? `Overdue • ${formatDate(task.date)}`
    : `Deadline • ${formatDate(task.date)}`;

  meta.append(badge, deadline);
  content.append(title, meta);

  const del = document.createElement("button");
  del.className = "delete-btn";
  del.type = "button";
  del.innerHTML = "×";
  del.title = "Hapus task";
  del.addEventListener("click", () => {
    const tasks = getTasks().filter((t) => t.id !== task.id);
    saveTasks(tasks);
    render();
  });

  item.append(check, content, del);
  return item;
}

function render() {
  const tasks = getTasks();
  const todo = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const overdue = todo.filter(isOverdue);

  totalCount.textContent = tasks.length;
  todoCount.textContent = todo.length;
  doneCount.textContent = done.length;
  overdueCount.textContent = overdue.length;

  todoList.innerHTML = "";
  doneList.innerHTML = "";

  todo.forEach((task) => todoList.appendChild(createTaskElement(task)));
  done.forEach((task) => doneList.appendChild(createTaskElement(task)));

  todoEmpty.style.display = todo.length ? "none" : "block";
  doneEmpty.style.display = done.length ? "none" : "block";
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  const tasks = getTasks();
  tasks.unshift({
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    title,
    date: taskDate.value || localDateInputValue(),
    priority: priority.value,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  });

  saveTasks(tasks);
  taskForm.reset();
  taskDate.value = localDateInputValue();
  priority.value = "medium";
  render();
  taskInput.focus();
});

document.getElementById("deleteAllBtn").addEventListener("click", () => {
  const tasks = getTasks();
  if (!tasks.length) return;

  const confirmed = confirm(
    "Hapus semua task? Tindakan ini tidak bisa dibatalkan.",
  );
  if (confirmed) {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
});

setCurrentDate();
taskDate.value = localDateInputValue();
render();


themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const dark = document.body.classList.contains("dark-mode");

  themeToggle.textContent = dark ? "☀️" : "🌙";

  localStorage.setItem(
    "theme",
    dark ? "dark" : "light"
  );
});