module.exports = function(grunt) {
	grunt.initConfig({
		//run a static server that does not refresh with changes of files
	    connect: {
	      server: {
	        options: {
			  hostname: '*',
	          port: 9010,
	          useAvailablePort: true,
	          base: './',
	          keepalive: true
	    	}
		  }
	    }
	});
	
	// Load the plugin that provides the "connect" task.
  	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.registerTask('default', ['connect:server']);
};
