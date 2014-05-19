var path   = require('path');
var should = require('should');

var utils  = require('./fixtures/utils');
var PATH   = path.join(__dirname, 'basic-test');
var Filler  = require('../index');
var can, filler;

var times = function (x, fn) {
  do { fn(); } while(--x > 0);
};

function init () {
  can   = require('./fixtures/can')(PATH);
  filler = new Filler(can, {
    lang: 'cn',
    tables: {
      site              :  1,
      articleCategories : 20,
      articles          : 50
    }
  });
}

describe('filler test', function () {

  before(function () {
    init();
  });

  after(function (done) {
    utils.clear(PATH, done);
  });

  it('site table test', function () {

    times(10, function () {
      var data = filler.assemble('site');
      
      //console.log(data);
      data.should.have.property('adminUser');
      data.should.have.property('adminPassword');
      data.should.have.property('adminRole');

      data.adminUser.should.match(/[a-zA-Z0-9]{3,10}/);
      data.adminPassword.should.match(/[0-9]+/);
      should(['root', 'adminitrator', 'user', 'editor'].indexOf(data.adminRole) > -1 ).be.ok;
    });

    filler.fill('site');

  });

  it(' articleCategories table test', function () {

    times(10, function () {
      var data = filler.assemble('articleCategories');

      // console.log(data);
      
      data.should.have.property('seq');
      data.should.have.property('name');
      (data.name.length).should.within(0, 50);
      data.seq.should.within(0, 19);

    });

    filler.fill('articleCategories');
  });

  it('test getReferenceTableIds', function () {
    var ids = filler.getReferenceTableIds('articles', '_articleCategory');

    // console.log(ids);

    ids.length.should.eql(20);
    ids.forEach(function (record) {
      record.should.have.property('_id');
    });
    
  });

  it('articles table test', function () {

    times(10, function () {
      var data = filler.assemble('articles');

      // console.log(data);

      data.should.have.property('_articleCategory');
      data.should.have.property('title');
      data.should.have.property('summary');
      data.should.have.property('content');

    });

    filler.fill('articles');
  });

  it('test db', function () {
    var site = can.open('site').query().execSync();
    var articles = can.open('articles').query().execSync();
    
    should(site.length).eql(1);
    should(articles.length).eql(50);

  });

});

describe('filler whole db', function () {
  
  before(function () {
    init();
  });

  after(function (done) {
    utils.clear(PATH, done);
  });

  it('test run', function () {
    (function () {
      filler.run();
    }).should.not.throw();  
  });

  it('test result', function () {
    var site              = can.open('site').query().execSync();
    var articleCategories = can.open('articleCategories').query().execSync();
    var articles          = can.open('articles').query().execSync();
    
    // console.log(site);
    // console.log(articleCategories);
    // console.log(articles);

    should(site.length).eql(1);
    should(articleCategories.length).eql(20);
    should(articles.length).eql(50);
  });
  
});