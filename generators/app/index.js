'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var username = require('username');
var fullname = require('fullname');
var isEmailLike = require('is-email-like');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the fine ' + chalk.red('generator-php-package') + ' generator!'
    ));

    var slugify = function(input) {
      return input.trim().replace(/\s+/g, '-').toLowerCase();
    };

    var required = function(input) {
      return input ? true : false;
    };

    var email = function(input) {
      return isEmailLike(input);
    };

    var prompts = [
      {
        type: 'input',
        name: 'vendor',
        message: 'Your package name?',
        default: function() {
          return slugify(path.basename(process.cwd()));
        }
      },
      {
        type: 'input',
        name: 'vendor',
        message: 'Your Composer vendor name?',
        default: function() {
          return username.sync();
        },
        validate: required
      },
      {
        type: 'input',
        name: 'author_name',
        message: 'Your full name?',
        default: function() {
          var done = this.async();

          return fullname().then(function(name) {
            done(null, name);
          });
        },
        validate: required
      },
      {
        type: 'input',
        name: 'author_email',
        message: 'Your e-mail address?',
        validate: email
      },
      {
        type: 'input',
        name: 'author_username',
        message: 'Your GitHub username?',
        default: function() {
          return username.sync();
        },
        validate: required
      },
      {
        type: 'input',
        name: 'author_website',
        message: 'Your website?',
        validate: required
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    this.fs.copy(
      this.templatePath('dummyfile.txt'),
      this.destinationPath('dummyfile.txt')
    );
  },

  install: function () {
    this.installDependencies();
  }
});
