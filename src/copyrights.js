/**
 * SPDX-FileCopyrightText: Copyright (c) 2024-2025 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const home = path.resolve(process.env['GITHUB_WORKSPACE'] || '.');
console.log(`The directory to scan: "${home}"`);
const license = path.resolve(home, core.getInput('license') || 'LICENSE.txt');
console.log(`The license file: "${license}"`);
const globs = (core.getInput('globs') || '**/*.js').split(/ +/);
console.log(`Globs to use: [${globs.join(', ')}]`);
const ignore = (core.getInput('ignore') || '.git/** node_modules/**').split(/ +/);
console.log(`Globs to ignore: [${ignore.join(', ')}]`);

const match = Array.from(
  (fs.readFileSync(license, 'utf8') + "\n").matchAll(/(Copyright .+)\n/g)
)[0];
if (match == undefined) {
  throw `Can't find "Copyright" line in ${license}`
}
const punch = match[1];
if (punch == undefined) {
  throw `Can't find "Copyright" line in ${license}`
}
console.log(`Punch line is: "${punch}"`);

var scope = [];
for (const gb of globs) {
  glob.sync(gb, { cwd: home, dot: true }).forEach((file) => {
    scope.push(file);
  });
}
for (const ig of ignore) {
  glob.sync(ig, { cwd: home, dot: true }).forEach((file) => {
    scope = scope.filter((inc) => {
      if (inc === file) {
        return false;
      }
      return true;
    });
  });
}

const errors = [];
for (const file of scope) {
  try {
    if (fs.readFileSync(path.resolve(home, file), 'utf8').includes(punch)) {
      console.log(`OK: ${file}`);
    } else {
      console.log(`Missed: ${file}`);
      errors.push(file);
    }
  } catch (ex) {
    console.log(`Error reading ${file}: ${ex.message}`);
    errors.push(file);
  }
}

if (errors !== 0) {
  console.log(`Total: ${scope.length}\nErrors: ${errors.length}\nIn files:\n${errors.join('\n')}`);
  process.exit(1);
}

console.log(`Errors not found in ${scope.length} files`);
