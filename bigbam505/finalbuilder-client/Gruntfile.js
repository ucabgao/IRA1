module.exports = function(grunt) {

grunt.initConfig({
  release: {
    options: {
      commitMessage: 'Bump Version to <%= version %>',
      tagName: '<%= version %>',
      tagMessage: 'Release Version <%= version %>'
    }
  }
});

grunt.loadNpmTasks('grunt-release');
};
