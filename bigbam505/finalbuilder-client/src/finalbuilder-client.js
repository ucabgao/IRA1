var soap = require('soap');

module.exports = FinalBuilderClient

function FinalBuilderClient(options) {
  options = options || {};
  var self = {},
      api_endpoint = options.hostname+'/Services/FinalBuilderServer.asmx?WSDL',
      soap_client,
      authorization_token;

  function SoapClient(callback){
    if(!soap_client){
      soap.createClient(api_endpoint, function(err, client) {
        if(err)
          throw new Error('WSDL Parse issue');

        soap_client = client;

        callback(soap_client);
      });
    } else {
      callback(soap_client);
    }
  }

  self.Authenticate = function(user, pass, callback){
    if(authorization_token){
      callback(null, authorization_token);
      return;
    }

    SoapClient(function(client){
      client.Authenticate({'username': user, 'password': pass}, function(err, result){
	    if(!err)
		  authorization_token = result.AuthenticateResult;
        callback(err, authorization_token);
      });
    });
  }

  self.GetProjects = function(token, callback) {
    SoapClient(function(client){
      client.GetProjects({authenticationToken: token}, function(err, results){
        if(!err && results && results.GetProjectsResult.ProjectInformation)
          callback(null, results.GetProjectsResult.ProjectInformation);
        else
          callback(err, []);
      });
    });
  }

  self.GetProject = function(token, projectName, callback){
    self.GetProjects(token, function(err, projects){
      var found = false;
      projects.forEach(function(project){
        if(project.Name == projectName){
          callback(null, project);
          found = true;
          return;
        }
      });

      if(!found)
        callback(err, {});
    });
  }

  self.GetProjectGroup = function(token, projectGroup, callback){
    self.GetProjects(token, function(err, projects){
      var projectsInGroup = [];
      projects.forEach(function(project){
        if(project.Group == projectGroup){
          projectsInGroup.push(project)
        }
      });

      callback(null, projectsInGroup);
    });
  }

  self.BuildProject = function(token, projectName, callback){
    SoapClient(function(client){
      client.StartProject({'authenticationToken': token, 'name': projectName }, function(err, results){
        if(!err)
          callback(null, true);
        else
          callback(err, false);
      });
    });
  }

  self.StopProjectBuild = function(token, projectName, callback){
    SoapClient(function(client){
      client.StopProject({'authenticationToken': token, 'name': projectName }, function(err, results){
        if(!err)
          callback(null, true);
        else
          callback(err, false);
      });
    });
  }


  return self;
}

