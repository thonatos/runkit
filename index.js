'use strict';

const fs = require('fs');
const path = require('path');
const repl = require('repl');
const debug = require('debug')('Runkit');
const { Readable } = require('stream');
const detetive = require('./lib/detective');
const Command = require('common-bin');

class MainCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);

    this.yargs.usage('Usage: <file>');
  }

  async run({ cwd, argv }) {
    let target = argv._[0];

    if (!path.isAbsolute(target)) {
      target = path.join(cwd, target);
    }

    debug('targetFile', target);

    const source = fs.readFileSync(target, 'utf-8');
    const dependencies = detetive(source);

    debug('dependencies', dependencies);

    for (const dependency of dependencies) {
      debug('dependency', dependency);
      await this.helper.npmInstall(
        process.platform === 'win32' ? 'npm.cmd' : 'npm',
        dependency,
        cwd
      );
    }

    const rd = new Readable();

    repl.start({
      prompt: '> ',
      input: rd,
      output: process.stdout
      // ignoreUndefined: true
    });

    rd._read = () => {}; // redundant? see update below
    rd.push(source);
    rd.push('\n');
    rd.push(null);
  }
}

module.exports = MainCommand;
