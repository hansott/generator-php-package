'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-php-package:app', function () {
  this.timeout(30000);

  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        packageName: 'pipeline',
        packageDescription: 'A fast PHP pipeline implementation',
        namespace: 'HansOtt',
        authorName: 'Hans Ott',
        authorEmail: 'hansott@hotmail.be',
        authorUsername: 'hansott',
        authorWebsite: 'http://hansott.github.io/'
      })
      .toPromise();
  });

  it('creates files', function (done) {
    var expectedContents = [
      ['src/SkeletonClass.php', /namespace HansOtt\\Pipeline\\Skeleton;/],
      ['README.md', /composer require hansott\/pipeline/],
      ['composer.json', /"HansOtt\\\\Pipeline\\\\": "src"/]
    ];
    assert.fileContent(expectedContents);
    done();
  });
});
