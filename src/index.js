#!/usr/bin/env node

/**
 * get-shit-done
 * A CLI tool to help you focus by blocking distracting websites
 * 
 * @module get-shit-done
 */

'use strict';

const { program } = require('commander');
const pkg = require('../package.json');
const { block, unblock, status } = require('./commands');

program
  .name('gsd')
  .description('Block distracting websites and get shit done')
  .version(pkg.version, '-v, --version', 'output the current version');

/**
 * Block command - enables website blocking
 */
program
  .command('work')
  .alias('block')
  .description('Start a work session and block distracting sites')
  .option('-p, --profile <profile>', 'use a specific blocking profile', 'default')
  .option('-t, --timer <minutes>', 'automatically unblock after N minutes', '25') // default to a pomodoro session
  .action(async (options) => {
    try {
      await block(options);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

/**
 * Unblock command - disables website blocking
 */
program
  .command('play')
  .alias('unblock')
  .description('End work session and unblock all sites')
  .option('-p, --profile <profile>', 'unblock a specific profile only', 'default')
  .action(async (options) => {
    try {
      await unblock(options);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

/**
 * Status command - shows current blocking status
 */
program
  .command('status')
  .description('Show current blocking status')
  .action(async () => {
    try {
      await status();
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(`Unknown command: ${program.args.join(' ')}`);
  console.error('Run \'gsd --help\' for a list of available commands.');
  process.exit(1);
});

program.parse(process.argv);

// Show help if no args provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
