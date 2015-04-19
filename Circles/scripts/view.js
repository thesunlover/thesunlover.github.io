/*jslint browser: true*/
/*global $, jQuery, Zepto, _,
    TimelineLite, TweenLite, TimelineMax, TweenMax,

*/
/*properties
    myGame_properties,
    CURRENCY, bet, balance, updateBalance, updateBet, updateProfit, groups,
    id, name, tiles, symbol, buttonsFSM, buttons, status, onReady, onSingleStart,
    onSingleStop, onStake, onAutoStart, onAutoStop, onPlay, onHint, onSounds,
    model, bindModel, bindQueue, spans, classesCSS, isWinner, welcomingAnimation,
    animateEndRoll, clearStatus, queueStatus, render, clearEventQueue,
    renderButtons, preparePlay, hintsStart,

    javascript_properties,
    log, toFixed, length,

    underscore_properties,
    each,

    jQuery_properties,
    removeClass, addClass, text, on, hide, show,
    children,

    TimelineMax_properties,
    append, yoyo, repeat, add, to, from, fromTo, queue, scale, rotation,
    delay, progress, autoAlpha, left

*/
var view = (function($) {
    var SYMBOL_MULTIPLIERS = [13, 4, 8, 7, 5, 3, 2, 11],//real win: [12, 3, 7, 6, 4, 2, 1, 10]
        buttonsFSM = {
            "onReady" : {
                name : 'onReady',
                buttons : ['start', 'stake', 'hint', 'auto'],
                status : null,
            },

            "onSingleStart" : {
                name : 'onSingleStart',
                buttons : ['stop'],
                status : '#rolling',
            },

            "onSingleStop" : {
                name : 'onSingleStop',
                buttons : ['start', 'stake', 'hint', 'auto'],
                status : '#calculate',
            },

            "onStake" : {
                name : 'onStake',
                buttons : null,
                status : "#stakeUp",
            },

            "onAutoStart" : {
                name : 'onAutoStart',
                buttons : ['break'],
                status : '#autoStarted',
            },

            "onAutoStop" : {
                name : 'onAutoStop',
                buttons : ['start', 'stake', 'hint', 'auto'],
                status : '#autoStopped',
            },

            "onPlay" : {
                name : 'onPlay',
                buttons : ['start', 'stake', 'hint', 'auto'],
                status : null,
            },

            "onHint" : {
                name : 'onHint',
                buttons : ['play', 'back', 'next'],
                status : null,
                //pages : ['hintPage0', 'hintPage1', ],
            },
            "onSounds" : {},
        },
        view = {
            bindModel: function(m) {
                this.model = m;
            },
            buttonsFSM : buttonsFSM,
            //based on http://www.greensock.com/sequence-video/
            bindQueue : function(TlineM) {
                this.queue = TlineM;
            },
            //based on http://www.youtube.com/watch?v=vx0KLAcXHOA
            updateBalance : function() {
                console.log('updating balance value');
                $("#balance").text(this.model.balance.toFixed(2) + this.model.CURRENCY);
            },
            updateBet : function() {
                console.log('updating bet value');
                $("#bet").text(this.model.bet.toFixed(2) + this.model.CURRENCY);
            },
            render : function() {
                console.log('rendering data: balance, bet and symbols');
                $(".panel").show();
                this.updateBalance();
                this.updateBet();
                _.each(this.model.groups, function(group) {
                    _.each(group.tiles, function(tile) {
                        var jTile = $(tile.id).
                            removeClass().
                            addClass(tile.classesCSS).addClass("symbol" + tile.symbol.toFixed(0));
                        if (tile.isWinner) {
                            jTile.addClass("win");
                        }
                    });
                });
            },
            welcomingAnimation : function() {
                this.render();
                this.queue.append(
                    (new TimelineMax({yoyo: true, repeat: 1}))
                        .add(TweenLite.to(".bigCircle", 0.5, {scale: 0.5, rotation: 360}))
                ).from(".tile", 1, {scale: 0, rotation: 360})
                    .append(
                        (new TimelineMax({yoyo: true}))
                            .add(TweenLite.to(".tile:not(.win)", 1, {scale: 0, rotation: 0}))
                            .add(TweenLite.to(".tile:not(.win)", 1, {scale: 1, rotation: 0}))
                    );
            },
            animateEndRoll : function() {
                this.render();
                this.queue.from(".tile", 1, {scale: 0, rotation: 360})
                    .append((new TimelineMax({yoyo: true}))
                            .add(TweenLite.to(".tile:not(.win)", 1, {scale: 0, rotation: 0}))
                            .add(TweenLite.to(".tile:not(.win)", 1, {scale: 1, rotation: 0, delay: 0.5}))
                        );
            },
            clearStatus : function() {
                this.queue.to('.status', 0, {autoAlpha: 0});
            },
            clearEventQueue : function() {
                this.queue.progress(1); //end all
                this.clearStatus();
            },
            queueStatus : function(statId) {
                console.log('showing stat:' + statId);
                this.clearStatus();
                if (statId) {
                    this.queue.fromTo(statId, 1, {left: -100, autoAlpha: 0}, {left: 0, autoAlpha: 1});
                }
            },
            updateProfit : function(profit) {//pseudoProfit
                $("span#profitPerRoll").text(profit.toFixed(2) + this.model.CURRENCY);
                this.queueStatus("#rollProfit");
            },
            renderButtons : function(state) {
                console.log('render buttons for ' + state.name);
                if (state.buttons) {
                    $("#buttons").children().hide();
                    _.each(state.buttons, function(buttonName) {
                        $("#" + buttonName + ".button").show();
                    });
                }
                this.queueStatus(state.status);
            },
            preparePlay : function() {
                console.log('going back to play');
                $(".panel").show();
                $("#header").children().show();
                $(".hint").hide();
                $('span#autoOff').hide();
                this.render();
                this.renderButtons(buttonsFSM.onPlay);
            },
            hintsStart : function() {
                console.log('opening hints');
                var i = 0;
                $(".panel").hide();
                $(".hint").show();
                $("#header").children().hide();
                for (i = 0; i < SYMBOL_MULTIPLIERS.length; i += 1) {
                    $("#BETx" + i).text((SYMBOL_MULTIPLIERS[i] - 1).toFixed(0));
                }
                this.renderButtons(buttonsFSM.onHint);
            },
        };
    return view;

}(jQuery));
