/*
 * grunt-sencha-cmd
 * https://github.com/auz34/grunt-sencha-cmd
 *
 * Copyright (c) 2015 Andrew Zavgorodniy
 * Licensed under the MIT license.
 */

'use strict';

var cp = require('child_process'),
    //fs = require('file_system'),
    path = require('path'),
    fs = require('fs');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('sencha_cmd', 'Custom plugin created to automate single sencha cmd commands our team executes days in and days out during development time', function() {
      // Merge task-specific and/or target-specific options with these defaults.
      var me = this,
          options = me.options(),
          scope = me.data.scope || 'app',
          task = me.data.task || 'build',
          appFolder = me.data.directory || options.directory,
          env = (scope === 'app' && me.data.environment) ? me.data.environment : '',
          sencha = options.pathToSencha || 'sencha',
          cpOptions = {},
          cmd = sencha + ' ' + scope + ' ' + task + ' ' + env,
          done = me.async(),
          cwd = process.cwd();

      var dirExists = function(dirPath) {
          try {
              var stats = fs.statSync(dirPath);
              return stats.isDirectory();
          } catch(err) {
              return false;
          }
      };

      if (appFolder) {
          cwd = dirExists(appFolder) ?
              /*absolute*/appFolder :
              /*relative*/path.join(cwd, appFolder);
      }

      cpOptions.cwd = (scope === 'package') ?
          path.join(cwd, 'packages', this.data.packageName) : cwd;

      if (options.log && options.log.dest) {
          var logFileName = path.join(options.log.dest, this.nameArgs.replace(':', '.'));
          grunt.log.writeln('Log file name:', logFileName);
          grunt.file.write(logFileName, JSON.stringify({
              command: cmd,
              options: cpOptions
          }));

          if (options.log.preventRealExecution) {
              return;
          }
      }

      grunt.log.writeln('Ready to make a call:');
      grunt.log.writeln('Command = ', cmd);
      grunt.log.writeln('Options = ', JSON.stringify(cpOptions));

      cp.exec(cmd, cpOptions,
          function (error, stdout, stderr) {
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);

              done(error === null);
          });
  });

};
