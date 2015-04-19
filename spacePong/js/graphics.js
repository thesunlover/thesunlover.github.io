define(function(require) {
	require('libs/TweenMax.min');

	var config  	= require('config'),
		createjs	= require('libs/easeljs-0.7.1.min'),
		Button  	= require('Button'),
		Shape  		= createjs.Shape;
	var Signal 		= require('libs/signals.min');
	var Graphics = function(canvasId){
		this.canvas = $(canvasId);
		this.stage = new createjs.Stage(this.canvas.get(0));
		// enable touch interactions if supported on the current device:
		createjs.Touch.enable(this.stage, {singleTouch:true});
		// enabled mouse over / out events
		this.stage.enableMouseOver(10);
		this.stage.mouseMoveOutside = false; // no tracking when mouse leaves the canvas
		this.stageWidth = config.stageWidth = this.canvas.width();
		this.stageHeight = config.stageHeight = this.canvas.height();
		this.events = {
			'imageLoadingDone':new Signal()
		},
		this.init();
	};

	$.extend(Graphics.prototype, {
		init: function() {
			this.screens = {};
			this.init_background();
			this.init_preloader();
			this.init_menu();
			this.init_game();

			createjs.Ticker.useRAF = true;
			createjs.Ticker.setFPS(25);
			createjs.Ticker.addEventListener("tick", this.stage);//update the stage
			this.pause = false;
			return this;
		},

		init_background: function() {
			this.BG = new Shape();
			this.BG.graphics
				// .clear()
				.beginFill("black")
				.drawRect(0, 0, this.stageWidth, this.stageHeight);
		},

		center_object_on_screen: function(obj){
			var b = obj.getBounds();
			obj.x = this.stageWidth/2;
			obj.y = this.stageHeight/2;
			obj.regX = b.width/2;
			obj.regY = b.height/2;
		},

		init_preloader: function() {
			this.preloader = new createjs.Container();
			this._pr_text = new createjs.Text("Game is starting in a while.", "20px Arial", "white");
			// this._pr_text.textBaseline = "alphabetic";
			this.center_object_on_screen(this._pr_text);
			this.preloader.addChild(this._pr_text);

			// this.preloader.graphics.beginFill("red").drawCircle(100, 100, 50);
			this.screens['preloader'] = this.preloader;
		},

		init_menu: function() {
			this.menu_choice = 0; //single player
			this.menu_elements = {
				'background': this.BG.clone(),
				'singlePlayer': new Button("1 player", {'x':20, 'y':20}),
				'twoPlayers': new Button("2 players", {'x':20, 'y':70}),
				'exitGame': new Button("Exit", {'x':20, 'y':120}),
			};

			this.menu = new createjs.Container();
			// this.menu.visible = false;//initially hidden
			this.menu.addChild( this.menu_elements.background);
			this.menu.addChild( this.menu_elements.singlePlayer);
			this.menu.addChild( this.menu_elements.twoPlayers);
			this.menu.addChild( this.menu_elements.exitGame);

			// this.stage.addChild(this.menu);
			// this.addScreen(this.menu);
			// this.screens[this.menu.name] = this.menu;
			return this;
		},

		showScreen: function(screen_name) {
			// this.hideChildren();
			this.stage.removeAllChildren();
			Object.getOwnPropertyNames(this).forEach(function(key, i){
				if (this[key].hasOwnProperty('visible')) {
					if ( key === screen_name ) {
						this[key].visible = true;
					} else {
						this[key].visible = false;
					}
				}
			}.bind(this));
			this.stage.addChild(this[screen_name]);
			this.stage.update();
			return this;
		},

		attachGraphicFiles: function(loader, callback) {
			this.init_paddles(function() {
				this.init_ball(function() {
					callback && callback();
				});
			}.bind(this));
		}

	});

	//game elements
	$.extend(Graphics.prototype, {
		init_game: function() {
			this.game = new createjs.Container();
			this.game.addChild(this.BG.clone());
			this.game.visible = false;
			this.stage.addChild(this.game);

			this.init_gameBounds();
			this.init_playersScore();
			this.init_winLabels();
		},

		init_gameBounds: function() {// XXX:can be refined with arcs
			var T = config.bound_thickness;
			var bordersBuilder = new createjs.SpriteSheetBuilder();
			this.table = new createjs.Container();

			var bordersShape = new Shape();
			var divider = new Shape();

			var L = this.stageWidth,
				H = this.stageHeight,
				d = config.bound_distance,
				// R = config.arc_radius,
				top_bound_pts = [[10, 10], [d, d], [L-d, d], [L-10, 10]],
				firstpt = top_bound_pts.shift(),
				drawBounds = bordersShape.graphics.setStrokeStyle(T,"round")
					// .beginStroke("white") //simple white stroke
					// .beginStroke("#999") //simple white stroke
				    // .beginRadialGradientStroke(["#C30","#30F"], [0, 1], H/4, H/2, 0, L/4, H/4, L*1.15) //gypsy style colors
				    .beginRadialGradientStroke(["#988", "#33F","#866"], [0.2, 0.4, 0.7], 0, H/2, L/2, L*2, H/2, H/2) //better than gypsy
					.mt(firstpt[0], firstpt[1]);

			// top bound
			top_bound_pts.forEach(function(line, i) {
				drawBounds.lineTo(line[0],line[1]);
				// drawBounds.arcTo()
			});
			// bottom bound
			drawBounds.mt(firstpt[0], H - firstpt[1]);
			top_bound_pts.forEach(function(line, i) {
				drawBounds.lineTo(line[0], H - line[1]);
			});
			// middle line
			divider.graphics.setStrokeStyle(Math.round(T/2),"round")
				.beginStroke("#999") //simple white stroke
				.mt(L/2, H - d).lineTo(L/2, d);

			//build the borders
			bordersBuilder.addFrame(bordersShape, new createjs.Rectangle(0,0,L,H));
			this.borders = new createjs.Sprite(bordersBuilder.build(), 0);

			this.table.addChild(this.borders);
			this.table.addChild(divider);
			this.game.addChild(this.table);
		},

		init_paddles: function(callback) {
			paddle = this._paddle_base();
			this.paddles = {};

			Object.keys(config.players).forEach(function(key){
				this.paddles[key] = paddle.clone();
				this.center_object_on_screen(this.paddles[key]);
				this.paddles[key].x = config.players[key].paddle.x;
				this.game.addChild(this.paddles[key])
			}.bind(this));

			callback && callback();
			return this;
		},

		init_playersScore: function() {
			this.scores = {};
			Object.keys(config.players).forEach(function(key) {
				this.scores[key] = new createjs.Text("0", "45px Arial", "white");
				this.scores[key].num = 0;
				this.scores[key].x = config.players[key].score.x;
				this.scores[key].y = config.players[key].score.y;
				this.game.addChild(this.scores[key]);
			}.bind(this));
			return this;
		},

		init_winLabels: function() {
			this.winLabels = {};
			Object.keys(config.players).forEach(function(key) {
				this.winLabels[key] = new createjs.Text(key.capitalize() + " player wins.", "45px Arial", "yellowgreen");
				this.center_object_on_screen(this.winLabels[key]);
				// this.winLabels[key].x = config.players[key].winLabel.x;
				this.winLabels[key].y = config.players[key].winLabel.y;
				this.winLabels[key].visible = false;
				this.game.addChild(this.winLabels[key]);

			}.bind(this));
			return this;
		},

		init_ball: function(callback) {
			var R = config.ball.R,
				builder = new createjs.SpriteSheetBuilder(),
				graphics = new createjs.Graphics();
			this.ball = new createjs.Container();

			graphics
			    .setStrokeStyle(0)
			    .beginFill("yellowgreen")
				// .beginStroke("yellowgreen") //simple white stroke
				.drawCircle(R,R,R);
			//attach the ball
			builder.addFrame(graphics, new createjs.Rectangle(0,0,2*R,2*R));
			this.ball = new createjs.Sprite(builder.build(), 0);
			//XXX:attach more effects on the ball
			this.game.addChild(this.ball);
			this.center_object_on_screen(this.ball);
			callback && callback();
		},

		_paddle_base: function() {
			var R = config.paddle.R,
				builder = new createjs.SpriteSheetBuilder(),
				graphics = new createjs.Graphics();
			paddle = new createjs.Container();

			graphics
				.setStrokeStyle(R,"round")
				.beginStroke("yellowgreen") //simple white stroke
			    // .beginFill("yellowgreen")
			    // .setStrokeStyle(0)
			    .moveTo(R,R)
			    .lineTo(R,R+config.paddle._length);
			//attach the ball
			builder.addFrame(graphics, new createjs.Rectangle(0,0,2*R,2*R+config.paddle._length));
			return new createjs.Sprite(builder.build(), 0);
		},


	});
	return Graphics; 
});
