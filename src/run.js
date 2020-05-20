'use strict';

const { promisify } = require('util');
const { exec, spawn: _spawn } = require('child_process');
const debug = require('debug')('git-diff-apply');
const execPromise = promisify(exec);

module.exports = async function run(command, options) {
  debug(command);
  let { stdout } = await execPromise(command, options);
  debug(stdout);
  return stdout;
};

module.exports.spawn = function spawn(cmd, args, options) {
  let command = [cmd, ...args].join(' ');

  debug(command);

  let child = _spawn(cmd, args, options);

  let promise = new Promise(function(resolve, reject) {
    let stdout = '';
    let errorMessage = '';

    child.stdout.on('data', function(data) {
      stdout += data;
    });
    child.stderr.on('data', function(data) {
      errorMessage += data;
    });
    child.on('close', function(status) {
      if (status === 0) {
        debug(stdout);

        resolve(stdout);
      } else {
        reject(new Error(`${command} failed with message ${errorMessage}`));
      }
    });
  });

  return Object.assign(promise, child);
};
