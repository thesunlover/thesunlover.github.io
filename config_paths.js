var setConfig = function(){
	require.config({
	    baseUrl: "./",
	    paths: {
	        "scrollmagic": "./node_modules/scrollmagic/minified"
	    },
	    waitSeconds: 15
	  });
};