#!/usr/bin/env node

/**
 * CLI entry point for get-shit-done
 * Parses command line arguments and delegates to task functions
 */

'use strict';

const {
  addTask,
  completeTask,
  loadTasks,
  deleteTask,
  listTasks,
  clearCompleted,
} = require('./tasks');

const args = process.argv.slice(2);
const command = args[0];
const rest = args.slice(1).join(' ');

/**
 * Print usage information
 */
function printHelp() {
  console.log(`
gsd - get shit done

Usage:
  gsd add <task>          Add a new task
  gsd done <id>           Mark a task as complete
  gsd delete <id>         Delete a task
  gsd list                List all tasks
  gsd clear               Remove all completed tasks
  gsd help                Show this help message

Examples:
  gsd add "write unit tests"
  gsd done 1
  gsd delete 3
  gsd list
`);
}

/**
 * Format and print tasks to stdout
 * @param {Array} tasks - array of task objects
 */
function printTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    console.log('No tasks found. Add one with: gsd add "your task"');
    return;
  }

  console.log('');
  tasks.forEach((task) => {
    const status = task.completed ? '✓' : '○';
    const label = task.completed
      ? `\x1b[90m[${task.id}] ${task.text}\x1b[0m`
      : `[${task.id}] ${task.text}`;
    console.log(`  ${status} ${label}`);
  });
  console.log('');
}

/**
 * Main CLI handler
 */
function main() {
  switch (command) {
    case 'add': {
      if (!rest) {
        console.error('Error: please provide a task description');
        process.exit(1);
      }
      const task = addTask(rest);
      console.log(`Added task [${task.id}]: ${task.text}`);
      break;
    }

    case 'done': {
      const id = parseInt(rest, 10);
      if (isNaN(id)) {
        console.error('Error: please provide a valid task ID');
        process.exit(1);
      }
      const completed = completeTask(id);
      if (!completed) {
        console.error(`Error: task ${id} not found`);
        process.exit(1);
      }
      console.log(`Completed task [${id}]: ${completed.text}`);
      break;
    }

    case 'delete': {
      const id = parseInt(rest, 10);
      if (isNaN(id)) {
        console.error('Error: please provide a valid task ID');
        process.exit(1);
      }
      const deleted = deleteTask(id);
      if (!deleted) {
        console.error(`Error: task ${id} not found`);
        process.exit(1);
      }
      console.log(`Deleted task [${id}]`);
      break;
    }

    case 'list':
    case undefined: {
      const tasks = listTasks();
      printTasks(tasks);
      break;
    }

    case 'clear': {
      const count = clearCompleted();
      console.log(`Cleared ${count} completed task(s)`);
      break;
    }

    case 'help':
    case '--help':
    case '-h': {
      printHelp();
      break;
    }

    default: {
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
    }
  }
}

main();
