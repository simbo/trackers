'use strict';

var path = require('path'),
    spawn = require('child_process').spawn;

var inquirer = require('inquirer');

module.exports = [

    'release www/ to gh-pages',

    function(done) {

        var destPath = path.relative(this.paths.cwd, this.paths.dest),
            processOptions = {
                stdio: 'inherit',
                cwd: this.paths.cwd
            };

        this.util.log(this.util.colors.yellow('Current git status:'));

        spawn('git',
            [
                'status',
                '--porcelain'
            ],
            processOptions
        ).on('close', function(code) {

            if (code !== 0) return done();

            inquirer.prompt({

                name: 'continue',
                message: 'Continue to release committed changes in ' +
                    this.util.colors.magenta('./' + destPath) +
                    ' to ' + this.util.colors.cyan('gh-pages') + '?',
                type: 'confirm',
                default: true

            }, function(answers) {

                if (!answers.continue) return this.util.log('Skipping release.');

                spawn('git',
                    [
                        'subtree',
                        'push',
                        '--prefix=' + destPath,
                        'origin',
                        'gh-pages'
                    ],
                    processOptions
                ).on('close', done);

            }.bind(this));

        }.bind(this));

    }

];
