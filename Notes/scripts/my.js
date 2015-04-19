/*jslint browser: true*/
/*global $, createjs, Modernizr, TweenLite, Power4, Power2,

*/
/*properties
	easeljs_props,
	Stage, Touch, enable, enableMouseOver, mouseMoveOutside, Ticker, parent,
	addEventListener, stageX, stageY, Container, Shape, graphics, addChild,
	beginFill, drawEllipse, Bitmap, regX, regY, name, cursor, hitArea, skewX,
	skewY, lineWidth, getMeasuredWidth, globalToLocal, hitTest, removeChild,
	initialize, font, color, text, Text, clone, id, LoadQueue, loadManifest,
	getResult, SpriteSheet, images, count, frames, Sprite, animations,
	setTransform, framerate, gotoAndPlay, setMaxConnections,


	javascript_jQuery_props,
	getElementById, removeClass, update, target, offset, length, log, floor,
	getItem, setItem, stringify, parse, each, extend, addClass, abs, random,
	prototype, add, remove, indexOf, splice, min, push,

	canvas_props,
	src, width, height,

	TweenLite_props,
	from, to, fromTo, easeOut, defaultEase, ease,

	modernizr_props,
	localstorage,

	stciky_properties,
	cookie, local, session, save, load, model, stickers, sticker, addNote,
	position, x, y, W, H, title, ix, content, notesContainer, board,
	Container_init, initTitle, initContent, Bitmap_init, attachEvents,
	updateAfterEdit, Delete, myTitle, myContent, saveModel, removeNote,
	recenterTitle, delete, empty,

	edit_note_props,
	val, dialog, autoOpen, dialog, modal, append, "Save note",
	Cancel, close, button, click, buttons, "Delete note",

*/

Array.prototype.remove = function(item) {
	var i = this.indexOf(item);
	this.splice(i, 1);
};


var SAVELOAD_DATA = {"cookie" : "cookie", "local" : "local storage", "session": "single session"},
	SAVE_MODEL = SAVELOAD_DATA.local,
	LOAD_MODEL = SAVELOAD_DATA.local,
	BIN_X = 610,
	BIN_Y = 300,
	TITLE_FONT = "bold 13px arial",
	CONTENT_FONT = "italic 13px Tinos",

	SAMPLE_MODEL = {
		"stickers" : [
			{
				"title" : "Dragging",
				"ix" : 0,
				"content" : "take the pin of each note you want to move",
				"position": {"x" : 125, "y" : 25},
			},
			{
				"title" : "Saving",
				"ix" : 1,
				"content" : "auto save on any drag/edit event",
				"position": {"x" : 300, "y" : 25},
			},
			{
				"title" : "Editting",
				"ix" : 2,
				"content" : "click on any note you want to change",
				"position": {"x" : 475, "y" : 25},
			},
			{
				"title" : "Deleting 1",
				"ix" : 3,
				"content" : "Edit note and choose 'Delete note' button.",
				"position": {"x" : 125, "y" : 175},
			},
			{
				"title" : "Deleting 2",
				"ix" : 4,
				"content" : "Drag any note outside the corc board",
				"position": {"x" : 300, "y" : 175},
			},
			{
				"title" : "Deleting 3",
				"ix" : 5,
				"content" : "Watch the simple delete animation if interested",
				"position": {"x" : 475, "y" : 175},
			},
		],
	},


	loader = new createjs.LoadQueue(false),
	manifest = [
		{src : "images/bin-sprite.png", id : "bin"},
		{src : "images/stickyNote.png", id : "note"},
		{src : "images/board.jpg", id : "board"},
	];
loader.setMaxConnections(5);
loader.loadManifest(manifest, true);


loader.addEventListener("complete", function (evt
	) {
	var loader = evt.target,
		boardImage = loader.getResult("board"),
		noteImage = loader.getResult("note"),
		binImage = loader.getResult("bin"),
		//board
		boardSizes = {W: boardImage.width, H: boardImage.height},
		boardContainer = new createjs.Container(),
		boardBitmap = new createjs.Bitmap(boardImage),
		StickerBoard,
		//note
		noteBG = new createjs.Bitmap(noteImage),
		Note,
		noteSize = {W : noteImage.width, H : noteImage.height},
		hitArea = new createjs.Shape(),
		//bin
		binData = new createjs.SpriteSheet({
			"images": [binImage],
			"frames": {"regX": 0, "regY": 0, "height": binImage.height, "count": 9, "width": 90},
			// empty (basic state) and delete (7fps, returns to empty):
			"animations": {"delete": [0, 8, "empty", 1], "empty": [8, 8, "empty"]}
		}),
		bin = new createjs.Sprite(binData, "empty"),

		prepareBoard,
		mainStage,
		//edit note dialog related
		uiEditNote,
		editedNow,
		noteTitle = $("#noteTitle"),
		noteContent = $("#noteContent"),
		allFields = $([]).add(noteTitle).add(noteContent),
		tips = $(".validateTips");

	bin.setTransform(BIN_X, BIN_Y, 1, 1);
	bin.framerate = 7;


	hitArea.graphics.beginFill("#FFF").drawEllipse(-11, -14, 24, 26);
	// position hitArea relative to the internal coordinate system of the target bitmap instances:
	hitArea.x = noteSize.W / 2 - 5;
	hitArea.y = 14;

	Note = function(sticker, parentBoard) {
		this.board = parentBoard;
		this.initialize(sticker);
	};
	Note.prototype = new createjs.Container();
	Note.prototype.Container_init = Note.prototype.initialize;
	Note.prototype.initialize = function(sticker) {
		this.Container_init();
		this.sticker = sticker;
		this.ix = sticker.ix;
		this.name = "note_bmp" + this.ix;
		this.x = sticker.position.x;
		this.y = sticker.position.y;
		this.regX = Math.floor(noteSize.W / 2);
		this.regY = 0;
		this.cursor = "pointer";
		this.addChild(noteBG.clone());
		this.initTitle(sticker.title, sticker.position);
		this.initContent(sticker.content, sticker.position);
		this.attachEvents();
	};
	Note.prototype.initTitle = function(label, pos) {
		this.myTitle = new createjs.Text();
		this.myTitle.font = TITLE_FONT;
		this.myTitle.color = "#0ca3da";
		this.myTitle.text = label;
		this.myTitle.lineWidth = 130;
		this.recenterTitle();
		this.addChild(this.myTitle);
	};
	Note.prototype.recenterTitle =  function() {
		var title = this.myTitle;
		title.x = Math.floor((title.lineWidth - title.getMeasuredWidth()) / 2);
		title.y = 25;
	};
	Note.prototype.initContent = function(content, pos) {
		var text = new createjs.Text();
		this.myContent = text;
		this.myContent.font = CONTENT_FONT;
		this.myContent.color = "black";
		this.myContent.text = content;
		this.myContent.lineWidth = 120;
		this.myContent.x = 7;
		this.myContent.y = 40;
		this.addChild(text);
	};
	Note.prototype.Delete = function() {
		console.log("Deleting note");
		bin.gotoAndPlay("delete");
		this.board.removeNote(this.sticker);
		this.parent.removeChild(this);
	};
	Note.prototype.updateAfterEdit = function(newTitle, newContent) {
		var ix = this.sticker.ix,
			pos = this.sticker.position;
		this.myTitle.text = newTitle;
		this.myContent.text = newContent;
		this.recenterTitle();
		this.board.save(ix, pos.x, pos.y, newTitle, newContent);
	};
	Note.prototype.attachEvents = function() {
		var dragging = false, that = this,
			toNoteLocal, toHitGL;
		this.addEventListener("mousedown", function(evt) {
			//dragCheck
			toNoteLocal = that.globalToLocal(evt.stageX, evt.stageY);
			toHitGL = hitArea.globalToLocal(toNoteLocal.x, toNoteLocal.y);
			dragging = hitArea.hitTest(toHitGL.x, toHitGL.y);
			//dragCheck-end
			console.log("dragging allowed = " + dragging);
			var o = evt.target;
			o.offset = {
				x: (o.parent.x - evt.stageX),
				y: (o.parent.y - evt.stageY),
			};
		});

		this.addEventListener("pressup", function(evt) {
			var o = evt.target,
				p = o.parent,
				t = p.myTitle.text,
				c = p.myContent.text;
			if (dragging) {
				if (evt.stageX < boardSizes.W) {
					p.x = evt.stageX + o.offset.x;
					p.y = evt.stageY + o.offset.y;
					that.board.save(p.ix, p.x, p.y, t, c);
					dragging = false;
					console.log("dragging ended");
				} else {
					createjs.Tween
						.get(evt.target.parent)
						.to({x: BIN_X + evt.target.parent.regX / 2, y: 250,rotation: 720, scaleX:0.2, scaleY:0.2},700)
						.wait(100).call(evt.target.parent.Delete);
				}
			} else {
				console.log('clicked on:' + p.ix);
				uiEditNote(o.parent);
			}
		});

		this.addEventListener("pressmove", function(evt) {
			if (dragging) {
				var from, to, o = evt.target,
					x = evt.stageX + o.offset.x,
					y = evt.stageY + o.offset.y,
					dx = Math.floor(o.parent.x - evt.stageX),
					adx = Math.abs(dx),
					skewMax = 40;
				if (adx < 5) {
					dx = 0;
					adx = 0;
				} else if (adx > skewMax) {
					dx = skewMax * (dx / adx);
				}
				//onUpdate: function() {}, onComplete : function() {}
				//TweenLite.to(o.parent, 0.25, {skewX: 40});
				from = {skewX: -dx};
				to = {x: x, y: y, skewX: 0};
				TweenLite.fromTo(o.parent, 0.75, from, to);
			}
		});
	};


	StickerBoard = function() {
		this.notesContainer = new createjs.Container();
		this.model = this.load();
	};

	StickerBoard.prototype.removeNote = function(note) {
		console.log("removing note", note.ix, "from storage");
		this.model.stickers.remove(note);
		this.saveModel();
	};

	StickerBoard.prototype.save = function(ix, x, y, title, content) {
		console.log("XXX: should save in cookie | local storage:ok | single session:not applicable");
		var o = null,
			index = ix,
			posX = x,
			posY = y;
		if (!this.model) {
			console.log(this);
		}
		o = this.model.stickers[index];
		if (o === undefined) {
			console.log("index:" + ix + "not found in:" + JSON.stringify(this.model));
			throw "not found";
		} else {
			o.position = {"x" : posX, "y" : posY};
			o.title = title;
			o.content = content;
		}
		this.saveModel();
	};
	StickerBoard.prototype.saveModel = function() {
		// now save the model
		if (SAVE_MODEL === SAVELOAD_DATA.local) {
			if (Modernizr.localstorage) {
				console.log('saving in local storage');
				localStorage.setItem('stickModel', JSON.stringify(this.model));
			}
		} else if (SAVE_MODEL === SAVELOAD_DATA.cookie) {
			console.log('XXX: save in cookies');
		}
	};

	StickerBoard.prototype.load = function() {
		console.log("XXX: should load in cookie | local storage:ok | single session:not applicable");
		var result;
		switch (LOAD_MODEL) {
		case SAVELOAD_DATA.local:
			if (Modernizr.localstorage) {
				console.log('loading from localStorage');
				result = JSON.parse(localStorage.getItem("stickModel"));
				console.log("loaded:\n" + JSON.stringify(result));
			}
			break;
		case SAVELOAD_DATA.cookie:
			console.log('XXX: load from cookies');
			break;
		case SAVELOAD_DATA.session:
			console.log("XXX: single session");
			break;
		}
		if (!result) {
			//use deep copy
			result = $.extend(true, {}, SAMPLE_MODEL);
		}
		return result;
	};

	StickerBoard.prototype.addNote = function(x, y) {
		var newSticker = {
			"title" : "new note",
			"ix" : this.model.stickers.length,
			"content" : "add some text",
			"position": {"x" : x, "y" : y},
		};
		this.model.stickers.push(newSticker);
		return (new Note(newSticker, this));
	};


	prepareBoard = function() {
		var board = new StickerBoard();

		boardBitmap.addEventListener("click", function(evt) {
			console.log('adding new sticker');
			var newNote = board.addNote(evt.stageX, evt.stageY);
			boardContainer.addChild(newNote);
			uiEditNote(newNote);
		});
		boardContainer.addChild(boardBitmap);
		console.log('loading notes');
		$.each(board.model.stickers, function(ix, sticky) {
			//console.log('adding Note' + ix);
			var note = new Note(sticky, board);
			boardContainer.addChild(note);
		});


		return boardContainer;
	};



	mainStage = function(canvas) {
		var noteBoard, options,
			stage = new createjs.Stage(canvas);
		// enable touch interactions if supported on the current device:
		createjs.Touch.enable(stage);
		// enabled mouse over / out events
		stage.enableMouseOver(10);
		stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
		noteBoard = prepareBoard();
		stage.addChild(noteBoard);
		stage.addChild(bin);

		switch (Math.floor(Math.random() * 6)) {
		case 0:
			options = {y : -400, skewX: -95};
			break;
		case 1:
			options = {x : -400, skewY: -95};
			break;
		case 2:
			options = {x : -400, y: -95};
			break;
		case 3:
			options = {x : 400, y: -95};
			break;
		case 4:
			options = {x : 0, y: -495};
			break;
		case 5:
			options = {x : 0, y: 495};
			break;
		}
		options.ease = Power2.easeOut;
		//TweenLite.from(noteBoard, 0.5, options);
		createjs.Tween.get(noteBoard, true)
			.to(options, 0)//pre-start positions
			.to({x:0, y:0, skewY:0, skewX:0}, 500);

		createjs.Ticker.addEventListener("tick", function (event) {
			stage.update(event);
		});
		return stage;
	};

	function updateTips(t) {
		tips.text(t).addClass("ui-state-highlight");
		setTimeout(function() {
			tips.removeClass("ui-state-highlight", 1500);
		}, 500);
	}

	function checkLength(o, n, min, max) {
		var result = true;
		if (o.val().length > max || o.val().length < min) {
			o.addClass("ui-state-error");
			updateTips("Length of " + n + " must be between " +
				min + " and " + max + ".");
			result = false;
		}
		return result;
	}

	$("#dialog-form").dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Save note": function() {
				var bValid = true;
				allFields.removeClass("ui-state-error");

				bValid = bValid && checkLength(noteTitle, "noteTitle", 3, 16);
				bValid = bValid && checkLength(noteContent, "noteContent", 6, 80);

				if (bValid) {
					editedNow.updateAfterEdit(noteTitle.val(), noteContent.val());
					$(this).dialog("close");
				}
			},
			"Delete note": function() {
				$(this).dialog("close");
				createjs.Tween
					.get(editedNow)
					.to({x: BIN_X + editedNow.regX / 2, y: 50}, 500)
					.to({y: 250,rotation: 720, scaleX:0.2, scaleY:0.2},700)
					.wait(100).call(editedNow.Delete);
				//TweenLite.to(editedNow, 0.5, );
				//editedNow.Delete();
			},
			"Cancel": function() {
				$(this).dialog("close");
			}
		},
		"close": function() {
			allFields.val("").removeClass("ui-state-error");
		}
	});
	uiEditNote = function(toEdit) {
		editedNow = toEdit;
		var s = editedNow.sticker;

		noteTitle.val(s.title);
		noteContent.val(s.content);
		$("#dialog-form").dialog("open");
	};

	$(function() {
		console.log('body loaded, generating board');
		//Linear, Power0, Power1, Power2, Power3, Power4, Quad, Cubic, Quart, Quint, and Strong
		TweenLite.defaultEase = Power4.easeOut;
		var canvas = document.getElementById("board");
		mainStage(canvas);
		$("#loader").removeClass("loader");
	}); // same as $(document).ready(init);
});



