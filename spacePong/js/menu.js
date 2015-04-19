define(function(require) {
	var config		= require('config'),
		Signal 		= require('libs/signals.min');
		
	var MainMenu = function(graphics){
		this.graphics = graphics;
		this.init();
		return this; 
	};
	$.extend(MainMenu.prototype, new Object());
	$.extend(MainMenu.prototype, {
		init: function() {
			this.events = {
				singleGame: new Signal(),
				twoPlayersGame: new Signal(),
				exitGame: new Signal()
			};
		},

		start: function() {
			this.addButtonListeners();
			this.graphics.showScreen("menu");
			return this;
		},

		addButtonListeners: function() {
			this.graphics.menu_elements.singlePlayer.events.clicked.addOnce(function(){
				this.events.singleGame.dispatch();
			}.bind(this));
			this.graphics.menu_elements.twoPlayers.events.clicked.addOnce(function(){
				this.events.twoPlayersGame.dispatch();
			}.bind(this));
			this.graphics.menu_elements.exitGame.events.clicked.addOnce(function(){
				this.events.exitGame.dispatch();
			}.bind(this));
		}

	});

	return MainMenu; 
});

