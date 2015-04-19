/*jslint browser: true*/
/*global $, jQuery, Zepto, _,
    TimelineLite, TweenLite, TimelineMax, TweenMax,
    view,

*/
/*properties
    myGame_properties,
    CURRENCY, bet, balance, groups, name,
    index, id, symbol, isWinner, tiles, 'central-circ',
    render, shuffle, updateBalance, updateBet, preparePlay,
    collectSymbolsState, newTiles, clearStatus, singleRoll,
    startRolling, onStart, onStop, onHint, onAuto, onStake,
    takeBET, inRoll, toggleClass, onBodyLoad, onSoundOnOff,
    queueStatus, calculateProfit, pseudoProfit, updateProfit,
    attachEvents, renderButtons, onPage, lastPage, bindQueue,
    buttonsFSM, onReady, onPlay, onSounds, setIsWinnerState,
    onSingleStart, onSingleStop, onAutoStart, onAutoStop,
    state, buttons, hintsStart, status, spans, onBreak,
    welcomingAnimation, animateEndRoll, clearEventQueue,
    queue, hideCircles, model, bindModel, calculateWins,
    intervalAuto, autoOn,

    javascript_properties,
    log, toFixed, length,

    underscore_properties,
    each, range, pluck, bind, indexOf,

    jQuery_properties,
    removeClass, addClass, text, on, hide, show, ready, when, then,
    fadeIn, extend, children, getJSON,

    TimelineMax_properties,
    append, yoyo, repeat, add, to, from, fromTo, queue, scale, rotation,
    delay, progress, autoAlpha, left

*/
var onBodyLoad = (function($, globalCallback) {
    var ALL_BETS = [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0, 200.0, 500.0],
        SYMBOL_MULTIPLIERS = [13, 4, 8, 7, 5, 3, 2, 11],//real win: [12, 3, 7, 6, 4, 2, 1, 10]
        AUTO_ROLLS = 3,
        controllers = {
            setIsWinnerState : function(index, isWinner) {
                _.each(controllers.model.groups, function(group) {
                    group.tiles["tile" + index.toFixed(0)].isWinner = isWinner;
                });
            },
            calculateProfit : function() {
                console.log("profitted: " + controllers.model.pseudoProfit);
                controllers.model.balance += controllers.model.pseudoProfit;
            },
            collectSymbolsState : function() {
                var model = controllers.model,
                    state = [];
                _.each(model.groups, function(group, groupIndex, listOfGroups) {
                    state[groupIndex] = _.pluck(group.tiles, 'symbol');
                });
                return state;
            },
            calculateWins : function() {
                console.log("calculating winner states");
                var state = controllers.collectSymbolsState(),
                    model = controllers.model;
                model.pseudoProfit = 0;
                _.each(state[0], function(symbol, index) {
                    if (state[1][index] === symbol && state[2][index] === symbol) {
                        model.pseudoProfit += model.bet * SYMBOL_MULTIPLIERS[symbol];
                        console.log(index + " is a winner," +
                                    "bet was:" + model.bet +
                                    ", multiplier is:" + SYMBOL_MULTIPLIERS[symbol]);
                        controllers.setIsWinnerState(index, true);
                    } else {
                        console.log(index + " is regular");
                        controllers.setIsWinnerState(index, false);
                    }
                });
                if (model.pseudoProfit !== 0) {
                    model.pseudoProfit -= model.bet;
                }
            },
            shuffle : function() {
                console.log("shuffle symbols");
                var model = controllers.model;
                _.each(model.groups, function(group) {
                    var symbols = _.shuffle(_.range(8));
                    console.log("changing symbols in " + group.name + " group");
                    _.each(group.tiles, function(tile) {
                        tile.symbol = symbols[tile.index];
                    });
                });
            },
            newTiles : function() {
                controllers.shuffle();
                controllers.calculateWins();
                view.render();
            },
            takeBET : function() {
                console.log("placing the bet");
                var model = controllers.model;
                model.balance -= model.bet;
                view.updateBalance(model.balance);
            },
            singleRoll : function() {
                var model = controllers.model;
                console.log('started rolling');
                if (model.balance <= model.bet) {
                    console.log("not enough money");
                    console.log("XXX:play error sound");
                    throw "no money";
                } else {
                    //updateStatus('#rolling');
                    controllers.takeBET();
                    controllers.inRoll = setInterval(controllers.newTiles, 100);
                }
            },
            onStart : function() {
                console.log("_____________________________________________________");
                console.log('start button clicked');
                var model = view.model;
                view.clearEventQueue();
                if (model.bet < model.balance && model.balance > 0) {
                    view.renderButtons(view.buttonsFSM.onSingleStart);
                    controllers.singleRoll();
                } else {
                    view.queueStatus("#noMoney");
                }
            },
            onStop : function() {
                console.log("_____________________________________________________");
                console.log('stop rolling');
                var model = view.model;
                view.renderButtons(view.buttonsFSM.onSingleStop);
                view.animateEndRoll();
                if (controllers.inRoll) {
                    clearInterval(controllers.inRoll);
                    controllers.inRoll = null;
                    controllers.calculateProfit();
                    if (!model.pseudoProfit) {
                        view.queueStatus('#goodLuck');
                    } else {
                        view.updateProfit(model.pseudoProfit);
                    }
                    view.updateBalance(model.balance);
                }
            },
            onAuto : function() {
                console.log("_____________________________________________________");
                console.log("turning auto: ON");
                console.log(this);
                view.renderButtons(view.buttonsFSM.onAutoStart);
                this.intervalAuto = null;
                this.autoOn = true;
                var left = AUTO_ROLLS,
                    that = this,
                    myAuto = function() {
                        console.log('myAuto');
                        var model = that.model;
                        view.clearEventQueue();
                        if (model.bet < model.balance && model.balance > 0) {
                            controllers.singleRoll(model);
                            setTimeout(function() {
                                view.animateEndRoll();
                                if (controllers.inRoll) {
                                    clearInterval(controllers.inRoll);
                                    controllers.inRoll = null;
                                    controllers.calculateProfit();
                                    if (!model.pseudoProfit) {
                                        view.queueStatus('#goodLuck');
                                    } else {
                                        view.updateProfit(model.pseudoProfit);
                                    }
                                    view.updateBalance(model.balance);
                                }
                            }, 700);
                        } else {
                            view.queueStatus("#noMoney");
                        }
                        //decide break or continue
                        //user might have stoped inbetween the tweening
                        if (that.autoOn === true && left > 0) {
                            left -= 1;
                            console.log(left);
                        } else {
                            if (that.intervalAuto === null) {
                                throw "mismach with auto interval";
                            }
                            clearInterval(that.intervalAuto);
                            that.intervalAuto = null;
                            view.renderButtons(view.buttonsFSM.onAutoStop);
                        }
                    };
                this.intervalAuto = setInterval(myAuto, 3000);
                //$("#auto").addClass('on');
            },
            onBreak : function() {
                console.log("_____________________________________________________");
                console.log("turning auto: OFF");
                this.autoOn = false;
                view.renderButtons(view.buttonsFSM.onAutoStop);
                //$("#auto").removeClass('on');
            },
            onSoundOnOff : function() {
                console.log("_____________________________________________________");
                console.log('sound disabled/enabled');
                //$(this).toggleClass('on');
            },
            onStake : function() {
                console.log("_____________________________________________________");
                var model = view.model,
                    current_index = _.indexOf(ALL_BETS, model.bet);
                console.log("stake change from: " + model.bet);
                console.log("found at pos: " + current_index);
                if (current_index === (ALL_BETS.length - 1)) {
                    current_index = 0;
                } else {
                    current_index += 1;
                }
                model.bet = ALL_BETS[current_index];
                console.log("bet now: " + model.bet);
                $("span#stakeUpTo").text(model.bet.toFixed(2) + model.CURRENCY);
                view.renderButtons(view.buttonsFSM.onStake);
                view.updateBet(model.bet);
            },
            onHint : function() {
                console.log("_____________________________________________________");
                console.log("looking @ hints");
                view.hintsStart();
            },
            onPlay : function() {
                console.log("_____________________________________________________");
                console.log("returning to play");
                view.preparePlay();
            },
            attachEvents : function() {
                var self = this;
                console.log('attaching button events');
                $('#start').on('click', function() {
                    self.onStart();
                });
                $('#stop').on('click', function() {
                    self.onStop();
                });
                $('#stake').on('click', function() {
                    self.onStake();
                });
                $('#auto').on('click', function() {
                    self.onAuto();
                });
                $('#break').on('click', function() {
                    self.onBreak();
                });
                $('#hint').on('click', function() {
                    self.onHint();
                });
                $('#play').on('click', function() {
                    self.onPlay();
                });
                $('#sounds').on('click', function() {
                    self.onSoundOnOff();
                });
            },
            onBodyLoad : function () {
                console.log('OnBodyLoad called');
                view.clearStatus();
                view.preparePlay(controllers.model);
                controllers.attachEvents();
                view.renderButtons(view.buttonsFSM.onReady);
                view.welcomingAnimation();

                return false;
            },
            bindModel: function(m) {
                controllers.model = m;
                view.bindModel(m);
                view.bindQueue(new TimelineMax());
            },
            inRoll : null,
        };
    $.getJSON("scripts/model.json", function(data) {
        console.log('model loaded');
        controllers.bindModel(data.model);
        globalCallback(controllers.onBodyLoad);// properly bind to onReady
    });

}(jQuery, $(document).ready));
