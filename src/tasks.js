/**
 * tasks.js
 * Core task management module for get-shit-done
 * Handles creating, reading, updating, and completing tasks
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_TASKS_FILE = path.join(os.homedir(), '.gsd', 'tasks.json');

/**
 * Ensure the tasks directory and file exist
 * @param {string} filePath - Path to the tasks file
 */
function ensureTasksFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ tasks: [] }, null, 2));
  }
}

/**
 * Load tasks from disk
 * @param {string} [filePath] - Optional custom path to tasks file
 * @returns {Array} Array of task objects
 */
function loadTasks(filePath = DEFAULT_TASKS_FILE) {
  ensureTasksFile(filePath);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return data.tasks || [];
  } catch (err) {
    console.error('Failed to load tasks:', err.message);
    return [];
  }
}

/**
 * Save tasks to disk
 * @param {Array} tasks - Array of task objects
 * @param {string} [filePath] - Optional custom path to tasks file
 */
function saveTasks(tasks, filePath = DEFAULT_TASKS_FILE) {
  ensureTasksFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify({ tasks }, null, 2));
}

/**
 * Add a new task
 * @param {string} description - Task description
 * @param {Object} [options] - Optional task metadata
 * @param {string} [options.priority] - Task priority: low, medium, high
 * @param {string} [options.tag] - Optional tag/category
 * @returns {Object} The newly created task
 */
function addTask(description, options = {}) {
  const tasks = loadTasks();
  const task = {
    id: Date.now(),
    description: description.trim(),
    priority: options.priority || 'medium',
    tag: options.tag || null,
    done: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

/**
 * Mark a task as complete by ID
 * @param {number} id - Task ID
 * @returns {Object|null} Updated task or null if not found
 */
function completeTask(id) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.done = true;
  task.completedAt = new Date().toISOString();
  saveTasks(tasks);
  return task;
}

/**
 * Remove a task by ID
 * @param {number} id - Task ID
 * @returns {boolean} True if removed, false if not found
 */
function removeTask(id) {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  saveTasks(tasks);
  return true;
}

/**
 * Get pending (incomplete) tasks
 * @returns {Array} Array of incomplete tasks
 */
function getPendingTasks() {
  return loadTasks().filter((t) => !t.done);
}

/**
 * Get completed tasks
 * @returns {Array} Array of completed tasks
 */
function getCompletedTasks() {
  return loadTasks().filter((t) => t.done);
}

module.exports = {
  addTask,
  completeTask,
  removeTask,
  loadTasks,
  getPendingTasks,
  getCompletedTasks,
  DEFAULT_TASKS_FILE,
};
