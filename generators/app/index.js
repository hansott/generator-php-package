'use strict';
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var chalk = require('chalk');
var yosay = require('yosay');
var shell = require('shelljs');
var username = require('username');
var yeoman = require('yeoman-generator');
var transform = require('gulp-transform');
var isEmailLike = require('is-email-like');

var ucfirst = function ucfirst(str) {
  str += String('');
  var capital = str.charAt(0).toUpperCase();
  return capital + str.substr(1);
};

var slugify = function slugify(input) {
  return input.trim().replace(/\s+/g, '-').toLowerCase();
};

var namespacify = function namespacify(authorName) {
  return authorName
    .split(' ')
    .map(function (part) {
      return ucfirst(part);
    })
    .join('');
};

module.exports = yeoman.Base.extend({
  prompting: function () {
    this.log(yosay(
      'Welcome to the fine ' + chalk.red('PHP package') + ' generator!'
    ));

    var required = function required(input) {
      return typeof input === 'string' && input.length > 0;
    };

    var email = function email(input) {
      return isEmailLike(input);
    };

    var url = function url(input) {
      return /^(https?):\/\/[^\s/$.?#].[^\s]*$/i.test(input);
    };

    var prompts = [
      {
        type: 'input',
        name: 'packageName',
        message: 'Your package name?',
        default: slugify(path.basename(process.cwd()))
      },
      {
        type: 'input',
        name: 'packageDescription',
        message: 'Your package description?',
        validate: required
      },
      {
        type: 'input',
        name: 'namespace',
        message: 'Top level namespace?',
        default: namespacify(this.user.git.name()),
        validate: required
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Your full name?',
        default: this.user.git.name(),
        validate: required
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Your e-mail address?',
        default: this.user.git.email(),
        validate: email
      },
      {
        type: 'input',
        name: 'authorUsername',
        message: 'Your GitHub username?',
        default: username.sync(),
        validate: required
      },
      {
        type: 'input',
        name: 'authorWebsite',
        message: 'Your website?',
        validate: url
      }
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function writing() {
    var transformations = [
      {
        // The note in the README.md
        regexp: new RegExp('\\*\\*Note:.*\\n', 'g'),
        replacement: ''
      },
      {
        // The repository url in composer.json
        regexp: new RegExp('https://github.com/:vendor/:package_name', 'g'),
        replacement: 'https://github.com/' + this.props.authorUsername + '/' + this.props.packageName
      },
      {
        // The psr-4 entries in composer.json
        regexp: new RegExp(':vendor\\\\\\\\:package_name\\\\\\\\', 'g'),
        replacement: this.props.namespace + '\\\\' + ucfirst(this.props.packageName) + '\\\\'
      },
      {
        // The namespace in SkeletonClass.php
        regexp: new RegExp('namespace League\\\\Skeleton', 'g'),
        replacement: 'namespace ' + this.props.namespace + '\\' + ucfirst(this.props.packageName)
      },
      {
        // The object instantiation in README.md
        regexp: new RegExp('new League\\\\Skeleton()', 'g'),
        replacement: 'new ' + this.props.namespace + '\\' + ucfirst(this.props.packageName) + '\\Skeleton()'
      },
      {
        // The test suite name in phpunit.xml.dist
        regexp: new RegExp(':vendor Test Suite', 'g'),
        replacement: ucfirst(this.props.packageName) + ' Test Suite'
      },
      {
        regexp: new RegExp(':author_name', 'g'),
        replacement: this.props.authorName
      },
      {
        regexp: new RegExp(':author_username', 'g'),
        replacement: this.props.authorUsername
      },
      {
        regexp: new RegExp(':author_website', 'g'),
        replacement: this.props.authorWebsite
      },
      {
        regexp: new RegExp(':author_email', 'g'),
        replacement: this.props.authorEmail
      },
      {
        regexp: new RegExp(':vendor', 'g'),
        replacement: this.props.authorUsername
      },
      {
        regexp: new RegExp(':package_name', 'g'),
        replacement: this.props.packageName
      },
      {
        regexp: new RegExp(':package_description', 'g'),
        replacement: this.props.packageDescription
      }
    ];

    var swapVariables = function swapVariables(contents) {
      for (var i = 0; i < transformations.length; i++) {
        var transformer = transformations[i];
        contents = contents.replace(transformer.regexp, transformer.replacement);
      }
      return contents;
    };

    this.registerTransformStream(transform(swapVariables, {encoding: 'utf8'}));
    var files = glob.sync('**', {dot: true, nodir: true, cwd: this.sourceRoot()});
    var ignores = ['.git'];
    for (var i = 0; i < files.length; i++) {
      if (ignores.indexOf(files[i]) !== -1) {
        continue;
      }
      var destinationPath = path.join(this.destinationRoot(), files[i]);
      var sourcePath = path.join(this.sourceRoot(), files[i]);
      this.copy(sourcePath, destinationPath);
    }
  },

  install: function install() {
    var composerPath = shell.which('composer');
    if (composerPath) {
      this.log('Installing Composer dependencies...');
      this.spawnCommandSync(composerPath, ['install']);
    } else {
      this.log.error('Composer not found. Please run `composer install` manually.');
    }

    var gitPath = shell.which('git');
    if (gitPath) {
      if (fs.existsSync('.git')) {
        this.log('Git is already initialized.');
      } else {
        this.log('Initializing git...');
        this.spawnCommandSync(gitPath, ['init']);
      }
    } else {
      this.log.error('Git not found. Please run `git init` manually.');
    }
  }
});
