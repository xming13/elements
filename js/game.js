var XMing = XMing || {};

XMing.GameManager = new function() {

    var m = this;
    var maxSize = 5;
    var isOppCards = function(index) {
        return index < maxSize
    };
    var isMyCards = _.negate(isOppCards);

    var CARDS = {
        DARK: {
            type: 'element',
            name: 'dark',
            value: 0,
            enemies: ['water', 'fire', 'metal', 'wood', 'earth']
        },
        LIGHT: {
            type: 'element',
            name: 'light',
            value: 1,
            enemies: ['dark', 'water', 'fire', 'metal', 'wood', 'earth']
        },
        WATER: {
            type: 'element',
            name: 'water',
            value: 10,
            enemies: ['fire', 'earth']
        },
        FIRE: {
            type: 'element',
            name: 'fire',
            value: 100,
            enemies: ['metal', 'water']
        },
        METAL: {
            type: 'element',
            name: 'metal',
            value: 1000,
            enemies: ['wood', 'fire']
        },
        WOOD: {
            type: 'element',
            name: 'wood',
            value: 10000,
            enemies: ['earth', 'metal']
        },
        EARTH: {
            type: 'element',
            name: 'earth',
            value: 100000,
            enemies: ['water', 'wood']
        },
        MOVE: {
            type: 'action',
            name: 'move',
            value: 2
        },
        DISCARD_1: {
            type: 'action',
            name: 'discard 1',
            value: 3
        },
        DISCARD_2: {
            type: 'action',
            name: 'discard 2',
            value: 4
        },
        SWAP: {
            type: 'action',
            name: 'swap',
            value: 5
        }
    };

    var CARD_NAMES = _.pluck(CARDS, 'name');

    var DATA = {
        INITIAL_DECK: 'initial_deck',
        UPDATE_DECK: 'update_deck',
        TURN_START: 'turn_start',
        DRAW: 'draw',
        ACTION: 'action',
        MESSAGE: 'message',
        REQUEST_INITIAL_DECK: 'request_initial_deck'
    };

    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        escape: /\{\-(.+?)\}\}/g,
        evaluate: /\{#(.+?)\}\}/g
    };

    var TEMPLATE = {
        myTurnStart: _.template('<div><span class="you">You</span> start turn.</div>'),
        myTurnEnd: _.template('<div><span class="you">You</span> end turn.</div>'),
        myDraw: _.template('<div><span class="you">You</span> draw <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span> !</div>'),
        myAction: _.template('<div><span class="you">You</span> play <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span> !</div>'),
        myActionFail: _.template('<div><span class="you">You</span> have no available move!</div>'),
        myMessage: _.template('<div><span class="you">You :</span> {- message }}</div>'),
        myWin: _.template('<div><span class="you">You</span> WON!!! Congratulations!</div>'),
        myLose: _.template('<div><span class="you">You</span> lost! Play again!</div>'),

        oppTurnStart: _.template('<div><span class="peer">{{ peer }}</span> starts turn.</div>'),
        oppTurnEnd: _.template('<div><span class="peer">{{ peer }}</span> ends turn.</div>'),
        oppDraw: _.template('<div><span class="peer">{{ peer }}</span> draws <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span> !</div>'),
        oppAction: _.template('<div><span class="peer">{{ peer }}</span> plays <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span> !</div>'),
        oppActionFail: _.template('<div><span class="peer">{{ peer }}</span> has no available move!</div>'),
        oppMessage: _.template('<div><span class="peer">{{ peer }} :</span> {- message }}</div>'),

        achievement: _.template('<div><span><b>{{ title }}</b></span><br><span>{{ description }}</span> - <span>{{ awarded }}</span><span>{{ progress }}</span></div><br>')
    };

    this.deck = [];
    this.cardsDiscard = [];
    this.cardsOnBoard = [];

    this.isDrawPhase = false;
    this.isGameEnd = false;

    this.peer = null;
    this.connectedPeers = {};
    this.isGameHost = false;

    this.connect = function(c) {
        console.log('connect');

        if (c.label === 'game') {
            var chatbox = $('<div></div>').addClass('connection')
                .addClass('active')
                .attr('id', c.peer);

            var messagesGame = $('<div><em>Peer connected.</em></div>').addClass('messages messages-game');
            chatbox.append(messagesGame);

            var messagesChat = $('<div></div>').addClass('messages messages-chat');
            chatbox.append(messagesChat);

            var messagesInput = $('<div></div>').addClass('messages-input');

            var input = $('<input/>').addClass('input-chat');
            messagesInput.append(input);

            var imgChat = $('<img/>', {
                src: 'images/icon-chat.png'
            }).addClass('icon-chat');
            messagesInput.append(imgChat);

            chatbox.append(messagesInput);

            $('#connections').append(chatbox);

            var sendMessage = function() {
                c.send({
                    type: DATA.MESSAGE,
                    message: $(".input-chat").val()
                });
                messagesChat.append(TEMPLATE.myMessage({
                    message: $(".input-chat").val()
                }));
                $(".input-chat").val('');
                m.scrollChatMessagesToBottom();
            };

            $(".input-chat").keydown(function(e) {
                // enter key
                if (e.keyCode == 13 && $(this).val() != '') {
                    sendMessage();
                }
            });
            $('.icon-chat').click(sendMessage);

            c.on('data', function(data) {
                console.log(c.peer);
                console.log(data);

                if (data.type == DATA.REQUEST_INITIAL_DECK) {
                    console.log('receive data for request initial deck');

                    c.send({
                        type: DATA.INITIAL_DECK,
                        deck: m.deck
                    });
                } else if (data.type == DATA.INITIAL_DECK) {
                    console.log('receive data for initial deck');

                    // setting initial deck sent by the host when the game start so that everyone uses the same deck
                    m.deck = data.deck;

                    $("#gameboard").show();
                    $("#panel-container").hide();

                    // Game start!
                    c.send({
                        type: DATA.TURN_START
                    });

                    messagesGame.append(TEMPLATE.myTurnStart());
                    m.scrollGameMessagesToBottom();

                    m.isDrawPhase = true;
                    $('#actions').fadeIn();
                } else if (data.type == DATA.UPDATE_DECK) {
                    console.log('receive data for update deck');

                    m.deck = m.deck.concat(data.cards);
                    m.cardsDiscard = [];
                } else if (data.type == DATA.TURN_START) {
                    console.log('retrieve data for turn start');

                    messagesGame.append(TEMPLATE.oppTurnStart({
                        peer: c.peer
                    }));
                    m.scrollChatMessagesToBottom();
                } else if (data.type == DATA.DRAW) {
                    console.log('receive data for draw');
                    m.deck.splice(data.indexDraw, 1);

                    messagesGame.append(TEMPLATE.oppDraw({
                        peer: c.peer,
                        cardName: data.cardName
                    }));
                    m.scrollGameMessagesToBottom();
                } else if (data.type == DATA.ACTION) {
                    console.log('receive data for action');

                    if (data.slots.length == 0) {
                        messagesGame
                            .append(TEMPLATE.oppActionFail({
                                peer: c.peer
                            }))
                            .append(TEMPLATE.oppTurnEnd({
                                peer: c.peer
                            }));
                    } else {
                        var slots = _.map(data.slots, function(slot) {
                            return isOppCards(slot) ? slot + maxSize : slot - maxSize;
                        })
                        messagesGame
                            .append(TEMPLATE.oppAction({
                                peer: c.peer,
                                cardName: data.cardName,
                                slots: slots[0]
                            }))
                            .append(TEMPLATE.oppTurnEnd({
                                peer: c.peer
                            }));

                        // Update player's action for the last turn
                        var card = _.findWhere(CARDS, {
                            name: data.cardName
                        });
                        m.performCardAction(card, slots);
                        m.updateUI();
                        m.checkGameStatus();
                        m.scrollGameMessagesToBottom();
                    }

                    if (!m.isGameEnd) {
                        // It is your turn now!
                        c.send({
                            type: DATA.TURN_START
                        });

                        messagesGame.append(TEMPLATE.myTurnStart());
                        m.scrollGameMessagesToBottom();

                        // running out of cards in the dec
                        // so shuffle the discard pile to the end of the deck
                        if (this.isGameHost && this.deck.length <= 1) {
                            var shuffleCards = _.shuffle(this.cardsDiscard);
                            this.deck = this.deck.concat(shuffleCards);
                            this.cardsDiscard = [];

                            c.send({
                                type: DATA.UPDATE_DECK,
                                cards: shuffleCards
                            });
                        }

                        m.isDrawPhase = true;
                        $('#actions').fadeIn();
                    }
                } else if (data.type == DATA.MESSAGE) {
                    messagesChat.append(TEMPLATE.oppMessage({
                        peer: c.peer,
                        message: data.message
                    }));
                    m.scrollChatMessagesToBottom();
                } else {
                    console.log('unknown data');
                }
            });

            c.on('close', function() {
                swal(
                    'Oops.. :(',
                    c.peer + ' has left the game!',
                    'error'
                );

                delete m.connectedPeers[c.peer];
            });
        }

        m.connectedPeers[c.peer] = 1;
    };

    this.scrollGameMessagesToBottom = function() {
        $(".messages-game").animate({
            scrollTop: $(".messages-game")[0].scrollHeight
        }, 500);
    };
    this.scrollChatMessagesToBottom = function() {
        $(".messages-chat").animate({
            scrollTop: $(".messages-chat")[0].scrollHeight
        }, 500);
    };

    this.drawCard = function(index) {
        console.log('draw card');

        var self = this;
        var cardDraw = this.deck[index];
        this.deck.splice(index, 1);

        this.eachActiveConnection(function(c, $c) {
            if (c.label === 'game') {
                c.send({
                    type: DATA.DRAW,
                    cardName: cardDraw.name,
                    indexDraw: index
                });
                $c.find('.messages-game').append(TEMPLATE.myDraw({
                    cardName: cardDraw.name
                }));
                self.scrollGameMessagesToBottom();
            }
        });

        return cardDraw;
    };

    this.setupElementSelection = function(card) {
        console.log('setup selection');

        var self = this;

        var availableSlots = [];

        _.each(this.cardsOnBoard, function(cardOnBoard, index) {
            if (!cardOnBoard || _.contains(card.enemies, cardOnBoard.name)) {
                availableSlots.push(index);
            }
        });

        if (availableSlots.length == 0) {
            swal('Too bad!', 'No available move!', 'error');

            this.eachActiveConnection(function(c, $c) {
                if (c.label === 'game') {
                    c.send({
                        type: DATA.ACTION,
                        cardName: card.name,
                        slots: []
                    });
                    $c.find('.messages-game')
                        .append(TEMPLATE.myActionFail({
                            cardName: card.name
                        }))
                        .append(TEMPLATE.myTurnEnd());
                    self.scrollGameMessagesToBottom();
                }
            });
        } else {
            this.assignAvailableCards(availableSlots);

            var currentSlot = -1;

            $(".cards-row li.available").on({
                'mouseenter': function() {
                    currentSlot = $(".cards-row li").index(this);
                },
                'click': function() {
                    processElementSelected(card, currentSlot);
                }
            });

            $("#gameboard").focus()
                .on('keydown', function(e) {
                    console.log('key pressed: ' + e.keyCode);
                    console.log('current slot before: ' + currentSlot);

                    var keyCodes = [13, 32, 37, 38, 39, 40];
                    if (currentSlot == -1) {
                        if (_.contains(keyCodes, e.keyCode)) {
                            currentSlot = availableSlots[0];
                        }
                    } else {
                        switch (e.keyCode) {
                            case 37: // left arrow
                                var newSlots = _.filter(availableSlots, function(slot) {
                                    return slot < currentSlot;
                                });

                                if (!_.isEmpty(newSlots)) {
                                    currentSlot = _.max(newSlots);
                                }
                                break;
                            case 38: // up arrow
                                if (_.contains(availableSlots, currentSlot - maxSize)) {
                                    currentSlot -= maxSize;
                                }
                                break;
                            case 39: // right arrow
                                var newSlots = _.filter(availableSlots, function(slot) {
                                    return slot > currentSlot;
                                });

                                if (!_.isEmpty(newSlots)) {
                                    currentSlot = _.min(newSlots);
                                }
                                break;
                                break;
                            case 40: // down arrow
                                if (_.contains(availableSlots, currentSlot + maxSize)) {
                                    currentSlot += maxSize;
                                }
                                break;
                            case 13: // enter
                            case 32: // space
                                processElementSelected(card, currentSlot);
                                break;
                        }
                    }

                    console.log('current slot after: ' + currentSlot);
                });

            function processElementSelected(card, selectedSlot) {
                self.performCardAction(card, [selectedSlot]);
                self.updateUI();
                self.eachActiveConnection(function(c, $c) {
                    if (c.label === 'game') {
                        c.send({
                            type: DATA.ACTION,
                            cardName: card.name,
                            slots: [selectedSlot]
                        });
                        $c.find('.messages-game')
                            .append(TEMPLATE.myAction({
                                cardName: card.name,
                                slot: selectedSlot
                            }))
                            .append(TEMPLATE.myTurnEnd());
                        self.scrollGameMessagesToBottom();
                    }
                });
                self.checkGameStatus();
            };
        }
    };

    this.handleKeyboardInput = function() {

    };

    this.setupActionSelection = function(card) {
        console.log('setupActionSelection');

        var self = this;
        var cardIndexes = [];
        var emptyIndexes = [];

        _.each(this.cardsOnBoard, function(cardOnBoard, index) {
            if (_.isUndefined(cardOnBoard)) {
                emptyIndexes.push(index);
            } else {
                cardIndexes.push(index);
            }
        });

        var isActionSuccess = false;

        var selectedSlots = [];

        var doAction = function(card, selectedSlots) {
            self.performCardAction(card, selectedSlots);
            self.updateUI();
            self.eachActiveConnection(function(c, $c) {
                if (c.label === 'game') {
                    c.send({
                        type: DATA.ACTION,
                        cardName: card.name,
                        slots: selectedSlots
                    });
                    $c.find('.messages-game')
                        .append(TEMPLATE.myAction({
                            cardName: card.name,
                            slots: selectedSlots
                        }))
                        .append(TEMPLATE.myTurnEnd());
                    self.scrollGameMessagesToBottom();
                }
            });
            self.checkGameStatus();
        }
        switch (card.name) {
            case 'move':
                if ((_.some(cardIndexes, isOppCards) && _.some(emptyIndexes, isMyCards)) || (_.some(cardIndexes, isMyCards) && _.some(emptyIndexes, isOppCards))) {

                    if ((_.some(cardIndexes, isOppCards) && _.some(emptyIndexes, isMyCards)) && (_.some(cardIndexes, isMyCards) && _.some(emptyIndexes, isOppCards))) {
                        this.assignAvailableCards(cardIndexes);
                    } else if ((_.some(cardIndexes, isOppCards) && _.some(emptyIndexes, isMyCards)) && !(_.some(cardIndexes, isMyCards) && _.some(emptyIndexes, isOppCards))) {
                        this.assignAvailableCards(_.filter(cardIndexes, isOppCards));
                    } else {
                        this.assignAvailableCards(_.filter(cardIndexes, isMyCards));
                    }

                    var currentSlot = -1;

                    (function bindEvent() {
                        $(".cards-row li.available").on({
                            'mouseenter': function() {
                                currentSlot = $(".cards-row li").index(this);
                            },
                            'click': function() {
                                selectedSlots.push(currentSlot);
                                self.setSelectedStyle(currentSlot);

                                if (selectedSlots.length == 1) {
                                    if (isMyCards(currentSlot)) {
                                        self.assignAvailableCards(_.filter(emptyIndexes, isOppCards));
                                    } else {
                                        self.assignAvailableCards(_.filter(emptyIndexes, isMyCards));
                                    }

                                    $(".cards-row li").off('mouseenter click');
                                    bindEvent();
                                } else if (selectedSlots.length == 2) {
                                    doAction(card, selectedSlots);
                                }
                            }
                        });
                    })();

                    //                    $("#gameboard").focus()
                    //                        .keydown(function(e) {
                    //                            console.log('key pressed: ' + e.keyCode);
                    //                            console.log('current slot before: ' + currentSlot);
                    //
                    //                            if (!hasProcessedSelectedSlot) {
                    //                                var keyCodes = [13, 32, 37, 38, 39, 40];
                    //                                if (currentSlot == -1) {
                    //                                    if (_.contains(keyCodes, e.keyCode)) {
                    //                                        currentSlot = availableSlots[0];
                    //                                        this.setHoveredStyle(card, currentSlot);
                    //                                    }
                    //                                }
                    //                                else {
                    //                                    switch (e.keyCode) {
                    //                                        case 37: // up arrow
                    //                                            if (currentSlot != maxSize && _.contains(availableSlots, currentSlot - 1)) {
                    //                                                currentSlot--;
                    //                                                self.setHoveredStyle(card, currentSlot);
                    //                                            }
                    //                                            break;
                    //                                        case 38: // left arrow
                    //                                            if (_.contains(availableSlots, currentSlot - maxSize)) {
                    //                                                currentSlot -= maxSize;
                    //                                                self.setHoveredStyle(card, currentSlot);
                    //                                            }
                    //                                            break;
                    //                                        case 39: // right arrow
                    //                                            if (currentSlot != 4 && _.contains(availableSlots, currentSlot + 1)) {
                    //                                                currentSlot++;
                    //                                                self.setHoveredStyle(card, currentSlot);
                    //                                            }
                    //                                            break;
                    //                                        case 40: // down arrow
                    //                                            if (_.contains(availableSlots, currentSlot + maxSize)) {
                    //                                                currentSlot += maxSize;
                    //                                                self.setHoveredStyle(card, currentSlot);
                    //                                            }
                    //                                            break;
                    //                                        case 13: // enter
                    //                                        case 32: // space
                    //                                            hasProcessedSelectedSlot = true;
                    //                                            self.processSelectedSlot(card, currentSlot);
                    //                                            break;
                    //                                    }
                    //                                }
                    //                            }
                    //                        });

                    isActionSuccess = true;
                }
                break;
            case 'discard 1':
                if (cardIndexes.length > 0) {
                    this.assignAvailableCards(cardIndexes);
                    var currentSlot = -1;

                    $(".cards-row li.available").on({
                        'mouseenter': function() {
                            currentSlot = $(".cards-row li").index(this);
                        },
                        'click': function() {
                            doAction(card, [currentSlot]);
                        }
                    });

                    isActionSuccess = true;
                }
                break;
            case 'discard 2':
                if (cardIndexes.length > 0) {

                    this.assignAvailableCards(cardIndexes);
                    var currentSlot = -1;

                    (function bindEvent() {
                        $('.cards-row li.available').on({
                            'mouseenter': function() {
                                currentSlot = $('.cards-row li').index(this);
                            },
                            'click': function() {
                                selectedSlots.push(currentSlot);
                                self.setSelectedStyle(currentSlot);

                                if (selectedSlots.length == 1) {
                                    if (_.without(cardIndexes, currentSlot).length > 0) {
                                        self.assignAvailableCards(_.without(cardIndexes, currentSlot));
                                        $('.cards-row li').off('mouseenter click');
                                        bindEvent();
                                    } else {
                                        doAction(card, selectedSlots);
                                    }
                                } else if (selectedSlots.length == 2) {
                                    doAction(card, selectedSlots);
                                }
                            }
                        });
                    })()

                    isActionSuccess = true;
                }
                break;
            case 'swap':
                var myUniqueCardNames = _.unique(_.map(_.filter(cardIndexes, isMyCards), function(cardIndex) {
                    return self.cardsOnBoard[cardIndex].name;
                }));
                var oppUniqueCardNames = _.unique(_.map(_.filter(cardIndexes, isOppCards), function(cardIndex) {
                    return self.cardsOnBoard[cardIndex].name;
                }));

                if (myUniqueCardNames.length > 0 && oppUniqueCardNames.length > 0 &&
                    (myUniqueCardNames.length != 1 || oppUniqueCardNames.length != 1 || myUniqueCardNames[0] != oppUniqueCardNames[0])) {
                    this.assignAvailableCards(cardIndexes);
                    var currentSlot = -1;

                    (function bindEvent() {
                        $(".cards-row li.available").on({
                            'mouseenter': function() {
                                currentSlot = $(".cards-row li").index(this);
                            },
                            'click': function() {
                                selectedSlots.push(currentSlot);
                                self.setSelectedStyle(currentSlot);

                                if (selectedSlots.length == 1) {
                                    var currentCardName = self.cardsOnBoard[currentSlot].name;
                                    if (isMyCards(currentSlot)) {
                                        self.assignAvailableCards(_.filter(cardIndexes, function(cardIndex) {
                                            return cardIndex < maxSize && self.cardsOnBoard[cardIndex].name != currentCardName;
                                        }));
                                    } else {
                                        self.assignAvailableCards(_.filter(cardIndexes, function(cardIndex) {
                                            return cardIndex >= maxSize && self.cardsOnBoard[cardIndex].name != currentCardName;
                                        }));
                                    }

                                    $(".cards-row li").off('mouseenter click');
                                    bindEvent();
                                } else if (selectedSlots.length == 2) {
                                    doAction(card, selectedSlots);
                                }
                            }
                        });
                    })();

                    isActionSuccess = true;
                }
                break;
        }

        if (!isActionSuccess) {
            swal('Too bad!', 'No available move!', 'error');

            this.eachActiveConnection(function(c, $c) {
                if (c.label === 'game') {
                    c.send({
                        type: DATA.ACTION,
                        cardName: card.name,
                        slots: []
                    });
                    $c.find('.messages-game')
                        .append(TEMPLATE.myActionFail({
                            cardName: card.name
                        }))
                        .append(TEMPLATE.myTurnEnd());
                    self.scrollGameMessagesToBottom();
                }
            });
        }
    };

    this.setSelectedStyle = function(slotNumber) {
        $($(".cards-row li")[slotNumber]).addClass('selected');
    };

    this.performCardAction = function(card, selectedSlots) {
        if (card.type == 'element') {
            this.cardsOnBoard[selectedSlots[0]] = card;
        } else {
            switch (card.name) {
                case 'move':
                    var fromIndex = selectedSlots[0];
                    var toIndex = selectedSlots[1];

                    this.cardsOnBoard[toIndex] = this.cardsOnBoard[fromIndex];
                    delete this.cardsOnBoard[fromIndex];
                    break;
                case 'discard 1':
                    delete this.cardsOnBoard[selectedSlots[0]];
                    break;
                case 'discard 2':
                    delete this.cardsOnBoard[selectedSlots[0]];

                    if (!_.isUndefined(selectedSlots[1])) {
                        delete this.cardsOnBoard[selectedSlots[1]];
                    }
                    break;
                case 'swap':
                    var fromIndex = selectedSlots[0];
                    var toIndex = selectedSlots[1];

                    var tempCards = this.cardsOnBoard[toIndex];
                    this.cardsOnBoard[toIndex] = this.cardsOnBoard[fromIndex];
                    this.cardsOnBoard[fromIndex] = tempCards;

                    break;
            }
        }
    };

    this.updateUI = function() {
        var self = this;

        $('.cards-row li')
            .off('mouseenter click')
            .removeClass('available unavailable selected');
        $('#gameboard').off('keydown');

        _.each($('.cards-row li'), function(li, index) {
            if (!_.isUndefined(self.cardsOnBoard[index])) {
                if (!$(li).hasClass(self.cardsOnBoard[index].name)) {
                    $(li).removeClass().fadeOut(0, function() {
                        $(li).addClass(self.cardsOnBoard[index].name).fadeIn(500);
                    });
                } else {
                    $(li).removeClass().addClass(self.cardsOnBoard[index].name);
                }
            } else {
                var classList = $(li).attr('class') ? $(li).attr('class').split(/\s+/) : [];
                if (_.intersection(CARD_NAMES, classList).length > 0) {
                    $(li).fadeOut(500, function() {
                        $(li).removeClass().fadeIn(0);
                    })
                } else {
                    $(li).removeClass();
                }
            }
        });
    };

    this.assignAvailableCards = function(availableIndexes) {
        _.each($('.cards-row li'), function(li, index) {
            $(li).removeClass('available unavailable');

            if (_.contains(availableIndexes, index)) {
                $(li).addClass('available');
            } else {
                $(li).addClass('unavailable');
            }
        });
    };

    // Check win condition
    // Return true if game ends
    this.checkGameStatus = function() {
        if (this.isWin(_.first(this.cardsOnBoard, maxSize))) {
            this.endGame(false);
            return true;
        } else if (this.isWin(_.last(this.cardsOnBoard, maxSize))) {
            this.endGame(true);
            return true;
        }

        return false;
    };

    // Return true if all cards are collected
    this.isWin = function(cards) {
        var sum = _.reduce(_.compact(cards), function(memo, card) {
            return memo + card.value;
        }, 0);

        var score = sum % 10;

        while (sum > 0) {
            sum = Math.floor(sum / 10);

            if (sum % 10 > 0) {
                score++;
            }
        }

        return score == maxSize;
    };

    this.prepareDeck = function() {
        var self = this;

        this.deck = [];

        _.each(CARDS, function(card) {
            var numTimes = card.type == 'action' ? 5 : (card.name == 'dark' ? 6 : 12);
            _.times(numTimes, function() {
                self.deck.push(_.clone(card));
            });
        });

        this.deck = _.shuffle(this.deck);
    };

    this.init = function() {
        var self = this;

        this.cardsOnBoard = new Array(10);

        // navigate to create connection screen
        $("#create").click(function() {
            $(".panel").hide();
            $("#panel-host, #back").show();
            $("#instruction").hide();
        });

        // navigate to join connection screen
        $("#join").click(function() {
            $(".panel").hide();
            $("#panel-join, #back").show();
        });

        // navigate back to main menu screen
        $("#back").click(function() {
            $(".panel, #back").hide();
            $("#panel-main").show();
            self.destroy();
        });

        $("#how-to-play").click(function() {
            $("#panel-main").hide();
            $("#panel-how-to-play, #back").show();
        })

        $('#achievement').click(function() {
            _.each(XMing.AchievementManager.getAchievements(), function(achievement) {

                $('.achievements').append(TEMPLATE.achievement({
                    title: achievement.title,
                    description: achievement.description,
                    awarded: achievement.hasAwarded() ? 'Awarded' : 'Not Awarded',
                    progress: (function() {
                        if (achievement.getCurrent && achievement.goal) {
                            return ' - ' + achievement.getCurrent() + ' / ' + achievement.goal;
                        }
                        return ''
                    })()
                }));
            });

            $('.panel').hide();
            $('#panel-achievement, #back').show();
        })

        // create new connection
        $("#host").click(function() {
            var usernameHost = $("#username-host").val();

            if (usernameHost === '') {
                swal('Oops..', 'Please enter a username!', 'error');
            } else {
                self.peer = new Peer(usernameHost, {
                    key: 'j4a6ijvcn8z1tt9'
                });

                self.peer.on('open', function(id) {
                    $('#pid').text(id);
                    $("#instruction").show();
                    self.prepareDeck();
                });

                self.peer.on('connection', function(c) {
                    console.log('on connection');
                    self.isGameHost = true;
                    self.connect(c);

                    $("#gameboard").show();
                    $("#panel-container").hide();
                });

                self.peer.on('error', function(err) {
                    swal('Oops..', err, 'error');
                });
            }
        });

        // Connect to a peer
        $('#connect').click(function() {
            if ($("#username-join").val() == '') {
                swal('Oops..', 'Please enter a username!', 'error');
            } else if ($('#rid').val() == '') {
                swal('Oops..', 'Please enter your friend\'s ID!', 'error');
            } else {
                var requestedPeer = $('#rid').val();
                if (!self.connectedPeers[requestedPeer]) {
                    self.peer = new Peer($("#username-join").val(), {
                        key: 'j4a6ijvcn8z1tt9',
                        debug: 3,
                        logFunction: function() {
                            var copy = Array.prototype.slice.call(arguments).join(' ');
                            console.log(copy);
                        }
                    });

                    // pending peerjs team to enable this feature for me!
                    // console.log(self.peer.listAllPeers());

                    var c = self.peer.connect(requestedPeer, {
                        label: 'game',
                        serialization: 'json',
                        metadata: {
                            message: 'Hi let\'s start a game!'
                        }
                    });

                    c.on('open', function() {
                        console.log('connect open start');
                        self.connect(c);
                        self.isGameHost = false;

                        c.send({
                            type: DATA.REQUEST_INITIAL_DECK
                        });

                        console.log('connect open end');
                    });

                    c.on('error', function(err) {
                        console.log('onError: ' + err);
                        swal('Oops..', err, 'error');
                    });

                    self.connectedPeers[requestedPeer] = 1;
                } else {
                    console.log('self.connectedPeers[requestedPeer] exists!');
                }
            }
        });

        // Close a connection
        $('#close').click(function() {
            self.eachActiveConnection(function(c) {
                c.close();
            });
        });

        $('.draw-cards ul li').click(function() {
            if (self.isDrawPhase) {
                self.isDrawPhase = false;
                var cardDraw = m.drawCard($('.draw-cards ul li').index(this));
                $(this).removeClass('available').addClass('selected animated flipcard ' + cardDraw.name)
                    .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                        var that = this;
                        $('#actions').fadeOut(200, function() {
                            $(that).addClass('available').removeClass('selected animated flipcard ' + cardDraw.name);

                            if (cardDraw.type == 'element') {
                                self.setupElementSelection(cardDraw);
                            } else if (cardDraw.type == 'action') {
                                self.setupActionSelection(cardDraw);
                            }
                        });
                    });
            }
        });
    };

    this.endGame = function(isYouWin) {
        console.log("end game");

        if (isYouWin) {
            swal('You won!', 'Congratulations!', 'success');
            $('.messages-game').append(TEMPLATE.myWin());
            this.scrollChatMessagesToBottom();

            XMing.AchievementManager.updateStats('won', this.cardsOnBoard);
        } else {
            swal('You lost!', 'Play again!', 'error');
            $('.messages-game').append(TEMPLATE.myLose());
            this.scrollChatMessagesToBottom();

            XMing.AchievementManager.updateStats('lost', this.cardsOnBoard);
        }

        this.isGameEnd = true;
    };

    this.destroy = function() {
        if (!!this.peer && !this.peer.destroyed) {
            this.peer.destroy();
        }
    };

    // Goes through each active peer and calls FN on its connections.
    this.eachActiveConnection = function(fn) {
        var self = this;

        var actives = $('.active');
        var checkedIds = {};
        actives.each(function() {
            var peerId = $(this).attr('id');

            if (!checkedIds[peerId]) {
                var conns = self.peer.connections[peerId];
                for (var i = 0, ii = conns.length; i < ii; i += 1) {
                    var conn = conns[i];
                    fn(conn, $(this));
                }
            }

            checkedIds[peerId] = 1;
        });
    };
};