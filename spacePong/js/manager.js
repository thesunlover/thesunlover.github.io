define(function(require) {
	var log = console.log;

	var config		 = require('config'),
		Preloader	 = require('preloader'),
		Player		 = require('player'),
		Game		 = require('game'),
		Graphics	 = require('graphics'),
		MainMenu	 = require('menu'),
		log			 = require('libs/log'),
		Ball		 = require('ball'),

		mgr;


	var Manager = function() {
		this.init();
		};

	Manager.getInstance = function() {
		if ( !mgr ) {
			mgr = new Manager();
		}
		return mgr;
	};

	$.extend(Manager.prototype, {
		'init': function() {
			this.current_state 	= null;
			this.current_mode 	= null;

			this.states = {
				'INIT':			"init",
				'MAIN_MENU':	"menu",
				'NEW_GAME':		"new_game",
				// 'GAME_MENU':	"game_menu",
				// 'PLAYING':		"in_game",
				// 'STARTING':		"begin_play",
				// 'RESUME':		"resume_game",
				'EXIT': 		"exiting"
			};

			this.modes = {
				'SINGLE_PLAYER':'one',
				'TWO_PLAYERS':'two'
			};

			this.graphics 		= new Graphics(config.canvasId);

			this.preloader 		= new Preloader(this.graphics);
			this.menu 			= new MainMenu(this.graphics);
			this.game 			= new Game(this.graphics);
			this.ball 			= new Ball(this.graphics);

			return this;
		},

		addListeners: function(){
			var that = this;
			mgr.game.events.pause.addOnce(function(){
				that.ball.pause("stop"); 
			});
			mgr.game.events.resume.addOnce(function(){
				that.ball.resume();
			});
			mgr.menu.events.twoPlayersGame.addOnce(function(){
				mgr.setMode(mgr.modes.TWO_PLAYERS);
				mgr.setState(mgr.states.NEW_GAME);
			});
			if (!config.DEMO){
				mgr.menu.events.singleGame.addOnce(function(){
					mgr.setMode(mgr.modes.SINGLE_PLAYER);
					mgr.setState(mgr.states.NEW_GAME);
				});
				mgr.menu.events.exitGame.addOnce(function(){
					mgr.setState(mgr.states.EXIT);
				});
			}
		},

		'start': function() {
			mgr.setState(mgr.states.INIT);
			return mgr;
		},

		'end': function() {
			mgr.setState(mgr.states.EXIT);
			return mgr;
		},

		'setState': function(new_state) {
			if ( config.DEBUG ) {
				log("Changing state \t\t\tFROM: " + mgr.current_state + ",\t\t\t TO: " + new_state);
			}
			mgr.current_state = new_state;
			switch (new_state){
				case mgr.states.INIT: {
					mgr.preloader.events.done.addOnce(function(){
						mgr.graphics.attachGraphicFiles(mgr.preloader, function(){
							mgr.graphics.events.imageLoadingDone.dispatch();
							if ( config.DEMO ){
								mgr.addListeners();
								mgr.menu.events.twoPlayersGame.dispatch();
							} else {
								mgr.setState(mgr.states.MAIN_MENU);
							}
						}.bind(this));
					});
					mgr.preloader.start();
					break;
				}
				case mgr.states.MAIN_MENU: {
					mgr.addListeners();
					mgr.menu.start();
					break;
				}

				case mgr.states.NEW_GAME: {
					mgr.game.start(mgr.current_mode);
					break;
				}

				// case mgr.states.GAME_OVER: {
				// 	mgr.game.start(mgr.current_mode);
				// 	break;
				// }

				case mgr.states.EXIT: {
					if (window.open('','_self').close() || true){
						alert("We are sorry but your browser policy doesn't allow us to close your window.\n You will need to manually close your game.");
						setTimeout(function(){
							mgr.setState(mgr.states.MAIN_MENU);
						}, 100); //for more info check this: http://stackoverflow.com/a/18776480
					}
					break;
				}

			}
			return mgr;
		},

		'setMode': function(new_mode) {
			if ( config.DEBUG ) {
				log("Changing mode \t\t\tFROM: " + mgr.current_mode + ",\t\t\t TO: " + new_mode);
			}
			mgr.current_mode = new_mode;
		},

	});


	return Manager;

});

