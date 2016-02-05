var should = require('should'),
    FinalBuilderClient = require('../src/finalbuilder-client.js');

describe('#truth', function(){
  it('should be true', function(){
    true.should.eql(true);
  });
});

describe('FinalBuilderClient', function(){
  it('should be able to be created', function(){
    var client = new FinalBuilderClient({ hostname: 'http://buildserver/'});
  });
});
