/**
 * SPDX-FileCopyrightText: Copyright (c) 2024-2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const home = path.resolve(process.env.GITHUB_WORKSPACE || '.');
core.info(`The directory to scan: "${home}"`);
const license = path.resolve(home, core.getInput('license') || 'LICENSE.txt');
core.info(`The license file: "${license}"`);
const globs = (core.getInput('globs') || '**/*.js').split(/ +/u);
core.info(`Globs to use: [${globs.join(', ')}]`);
const ignore = (core.getInput('ignore') || '.git/** node_modules/**').split(/ +/u);
core.info(`Globs to ignore: [${ignore.join(', ')}]`);

const [match] = Array.from(
  `${fs.readFileSync(license, 'utf8')}\n`.matchAll(/(?<copyright>Copyright .+)\n/gu)
);
if (!match) {
  throw new Error(`Can't find "Copyright" line in ${license}`);
}
const [, punch] = match;
if (!punch) {
  throw new Error(`Can't find "Copyright" line in ${license}`);
}
core.info(`Punch line is: "${punch}"`);

let scope = [];
for (const gb of globs) {
  const files = glob.sync(gb, { cwd: home, dot: true });
  scope.push(...files);
}
for (const ig of ignore) {
  const files = glob.sync(ig, { cwd: home, dot: true });
  scope = scope.filter((inc) => !files.includes(inc));
}

const errors = [];
for (const file of scope) {
  const filepath = path.resolve(home, file);
  try {
    const stats = fs.statSync(filepath);
    if (stats.isFile()) {
      if (fs.readFileSync(filepath, 'utf8').includes(punch)) {
        core.info(`OK: ${file}`);
      } else {
        core.warning(`Missed: ${file}`);
        errors.push(file);
      }
    }
  } catch (ex) {
    core.error(`Error reading ${file}: ${ex.message}`);
    errors.push(file);
  }
}

if (errors.length !== 0) {
  core.error(`Total: ${scope.length}\nErrors: ${errors.length}\nIn files:\n${errors.join('\n')}`);
  process.exit(1);
}
core.info(`Errors not found in ${scope.length} files`);
