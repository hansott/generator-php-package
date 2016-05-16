'use strict';
var path = require('path');
var chalk = require('chalk');
var yosay = require('yosay');
var username = require('username');
var yeoman = require('yeoman-generator');
var transform = require('gulp-transform');
var isEmailLike = require('is-email-like');
var shell = require('shelljs');

var skeletonVersion = '37f9078c76b785205786c2ebb976a077787c98c8';
var skeletonShortVersion = skeletonVersion.slice(0, 7);
var skeletonOrganisation = 'thephpleague';
var skeletonRepository = 'skeleton';
var skeletonTarballUri = 'https://github.com/' + skeletonOrganisation + '/' + skeletonRepository + '/tarball/' + skeletonVersion;

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
    var done = this.async();

    var transformations = [
      {
        regexp: new RegExp('\\*\\*Note:.*\\n', 'g'),
        replacement: ''
      },
      {
        regexp: new RegExp('https://github.com/:vendor/:package_name', 'g'),
        replacement: 'https://github.com/' + this.props.authorUsername + '/' + this.props.packageName
      },
      {
        regexp: new RegExp(':vendor\\\\\\\\:package_name\\\\\\\\', 'g'),
        replacement: this.props.namespace + '\\\\' + ucfirst(this.props.packageName)
      },
      {
        regexp: new RegExp('League\\\\Skeleton;', 'g'),
        replacement: this.props.namespace + '\\' + ucfirst(this.props.packageName) + '\\Skeleton;'
      },
      {
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

    this.registerTransformStream(transform(swapVariables, {encoding: 'utf-8'}));
    this.extract(skeletonTarballUri, '.', {}, function () {
      var extractedDirectory = skeletonOrganisation + '-' + skeletonRepository + '-' + skeletonShortVersion;
      this.directory(this.destinationPath(extractedDirectory), this.destinationRoot(), function () {});
      done();
    }.bind(this));

    return done;
  },

  install: function install() {
    var composerPath = shell.which('composer');
    if (composerPath) {
      this.log('Installing Composer dependencies...');
      this.spawnCommandSync(composerPath, ['install']);
    } else {
      this.log.error('Composer not found. Please run `composer install` manually.');
    }
  }
});
