require.config({
    baseUrl: 'js',
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$.extend(Array.prototype, {
	// http://stackoverflow.com/a/10050831
	range: function(n){
		var v=[];
		return Array.apply(null, Array(n)).map(function (_, i) {
				return i;
			});
	}
});

define(function(require) {
	var Viewport = require('viewport'),
		manager = require('manager').getInstance(),
		vp = new Viewport();
	$("#game").verticalCenter();
	manager.start();
});
