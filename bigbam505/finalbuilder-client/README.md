[![NPM version](https://badge.fury.io/js/finalbuilder-client.png)](http://badge.fury.io/js/finalbuilder-client)
FinalBuilder Client
====================

[FinalBuilder](http://www.finalbuilder.com/) is an integrated tool for carrying out software builds on the 
Windows platform.  FinalBuilder has a soap API backend that allows for you to start builds, check projects
and various other tasks.
[Wikipedia](http://en.wikipedia.org/wiki/FinalBuilder)

### Purpose
The purpose of this package is to provide a node wrapper around the FinalBuilder api. The end goal is to allow 
for all basic operations to be performed via the node plugin.

### Usage

Install using: 
```
npm install finalbuilder-client --save
```

Sample Usage:
``` js
var FinalBuilderClient = require('finalbuilder-client');
var client = new FinalBuilderClient({hostname: 'http://server/'});

client.Authenticate('username', 'password', function(token){

  client.GetProjects(token, function(err, projects){
    //DO Something here
  });
  
  client.GetProject(token, 'Project Name', function(err, project){
    //DO Something here if project is returned
  });
  
  client.BuildProject(token, 'Project Name', function(err, success){
    //Success will be true if successful, or false if not
  });
});

```

### Issues
Issues with this module can be added here: [Issues](https://github.com/bigbam505/finalbuilder-client/issues)


### License

Copyright (c) 2013 Brent Montague

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

