var XMing = XMing || {};

XMing.GameManager = new function() {

    var m = this;
    var maxSize = 5;

    var CARDS = {
        DARK: { type: 'element', name: 'dark', value: 0, enemies: ['water', 'fire', 'metal', 'wood', 'earth']},
        LIGHT: { type: 'element', name: 'light', value: 1, enemies: ['dark', 'water', 'fire', 'metal', 'wood', 'earth']},
        WATER: { type: 'element', name: 'water', value: 10, enemies: ['fire', 'earth']},
        FIRE: { type: 'element', name: 'fire', value: 100, enemies: ['metal', 'water']},
        METAL: { type: 'element', name: 'metal', value: 1000, enemies: ['wood', 'fire']},
        WOOD: { type: 'element', name: 'wood', value: 10000, enemies: ['earth', 'wood']},
        EARTH: { type: 'element', name: 'earth', value: 100000, enemies: ['water', 'wood']}
//        ,
//        MOVE: { type: 'action', name: 'move', value: 2},
//        DISCARD_1: { type: 'action', name: 'discard 1', value: 3},
//        DISCARD_2: { type: 'action', name: 'discard 2', value: 4},
//        SWAP: { type: 'action', name: 'swap', value: 5}
    };

    var CARD_NAMES = _.pluck(CARDS, 'name');

    var DATA = {
        DECK: 'deck',
        TURN: 'turn',
        DRAW: 'draw',
        ACTION: 'action',
        MESSAGE: 'message'
    };

    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        escape: /\{\-(.+?)\}\}/g,
        evaluate: /\{#(.+?)\}\}/g
    };

    var TEMPLATE = {
        myTurn: _.template('<div><span class="you">You</span> end turn.</div>'),
        myDraw: _.template('<div><span class="you">You</span> draw <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span>!</div>'),
        myAction: _.template('<div><span class="you">You</span> play <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span>!</div>'),
        oppTurn: _.template('<div><span class="peer">{{ peer }}</span> ends turn.</div>'),
        oppDraw: _.template('<div><span class="peer">{{ peer }}</span> draws <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span>!</div>'),
        oppAction: _.template('<div><span class="peer">{{ peer }}</span> plays <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span>!</div>'),
        oppMessage: _.template('<div><span class="peer">{{ peer }}</span>:{{ message }}</div>')
    };

    this.deck = [];
    this.cardsOnBoard = [];

    this.peer = new Peer({
        key: 'j4a6ijvcn8z1tt9',
        debug: 3,
        logFunction: function() {
            var copy = Array.prototype.slice.call(arguments).join(' ');
            $('.log').append(copy + '<br>');
        }
    });

    this.connectedPeers = {};

    this.connect = function(c) {
        console.log('connect');

        if (c.label === 'game') {
            var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
            var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
            chatbox.append(messages);
            $('#connections').append(chatbox);
            $('.filler').hide();

            c.on('data', function(data) {
                console.log(c.peer);
                console.log(data);

                if (data.type == DATA.DECK) {
                    // setting initial deck sent by the host when the game start so that everyone uses the same deck
                    m.deck = data.deck;

                    $('.')
                    $("#gameboard").show();

                    console.log('receive and assign deck');
                }
                else if (data.type == DATA.DRAW) {
                    messages.append(TEMPLATE.oppDraw({ peer: c.peer, cardName: data.cardName }));
                    console.log('receive data for draw');
                }
                else if (data.type == DATA.ACTION) {
                    messages.append(TEMPLATE.oppAction({ peer: c.peer, cardName: data.cardName, slot: data.slot }));
                    console.log('receive data for action');

                    messages.append(TEMPLATE.oppTurn({ peer: c.peer }));
                    m.deck = _.last(m.deck, data.numCardsLeft);

                    var card = _.findWhere(CARDS, { name: data.cardName });
                    m.performCardAction(card, data.slot);
                    m.checkGame();

                    $("#draw").show();
                }
                else if (data.type == DATA.MESSAGE) {
                    messages.append(TEMPLATE.oppMessage({ peer: c.peer, message: data.message }));
                }
                else {
                    console.log('unknown data');
                }

                messages.animate({scrollTop: messages.prop("scrollHeight")}, 500);
            });

            c.on('close', function() {
                alert(c.peer + ' has left the chat.');
                chatbox.remove();

                m.endGame();
                if ($('.connection').length === 0) {
                    $('.filler').show();
                }
                delete m.connectedPeers[c.peer];
            });
        }

        m.connectedPeers[c.peer] = 1;
    };

    this.peer.on('open', function(id){
        $('#pid').text(id);
    });

    this.peer.on('connection', this.connect);

    this.peer.on('error', function(err) {
        alert(err);
    });

    this.drawCard = function() {
        console.log('draw card');

        var cardDraw = this.deck.shift();

        this.eachActiveConnection(function(c, $c) {
            if (c.label === 'game') {
                c.send({ type: DATA.DRAW, cardName: cardDraw.name });
                $c.find('.messages').append(TEMPLATE.myDraw({ cardName: cardDraw.name }));
            }
        });
        this.processCard(cardDraw);
        $("#draw").hide();
        $("#next").show();
    };

    // return the available slots that the card can be played on
    this.getAvailableSlots = function(card) {
        var availableSlots = [];

        _.each(this.cardsOnBoard, function(cardOnBoard, index) {
            if (cardOnBoard == null || _.contains(card.enemies, cardOnBoard.name)) {
                availableSlots.push(index);
            }
        });

        console.log("availableSlots.length: " + availableSlots.length);
        return availableSlots;
    };

    this.processCard = function(card) {
        console.log('process card');

        if (card.type == 'element') {
            this.setupSelection(card);

        }
        else if (card.type == 'action') {

        }

        console.log('before checkgame');
        console.log(this.cardsOnBoard);

    };

    this.setupSelection = function(card) {
        console.log('setup selection');

        var self = this;

        var availableSlots = this.getAvailableSlots(card);
        if (availableSlots.length == 0) {
            alert('no available move');
        }
        else {
            var parts = _.partition(availableSlots, function(slot) {
                return slot < 5;
            });

            parts[1] = _.map(parts[1], function(slot) {
                return slot - 5;
            });

            this.assignAvailableCards($(".opp-cards ul li"), parts[0]);
            this.assignAvailableCards($(".my-cards ul li"), parts[1]);

            // set default selected slot
            var currentSlot = availableSlots[0];
            this.setSelectedSlot(currentSlot);

            var hasProcessedSelectedSlot = false;

            $(".cards ul li.available").hover(function() {
                if (!hasProcessedSelectedSlot) {
                    currentSlot = $(".cards ul li").index(this);
                    self.setSelectedSlot(currentSlot);
                }
            }).click(function() {
                if (!hasProcessedSelectedSlot) {
                    hasProcessedSelectedSlot = true;
                    currentSlot = $(".cards ul li").index(this);
                    self.processSelectedSlot(card, currentSlot);
                }
            });

            $("#gameboard").focus();
            $("#gameboard").keydown(function(e) {
                console.log('key pressed: ' + e.keyCode);
                console.log('current slot before: ' + currentSlot);

                if (!hasProcessedSelectedSlot) {
                    switch (e.keyCode) {
                        case 37: // up arrow
                            if (currentSlot != 5 && _.contains(availableSlots, currentSlot - 1)) {
                                currentSlot--;
                                self.setSelectedSlot(currentSlot);
                            }
                            break;
                        case 38: // left arrow
                            if (_.contains(availableSlots, currentSlot - 5)) {
                                currentSlot -= 5;
                                self.setSelectedSlot(currentSlot);
                            }
                            break;
                        case 39: // right arrow
                            if (currentSlot != 4 && _.contains(availableSlots, currentSlot + 1)) {
                                currentSlot++;
                                self.setSelectedSlot(currentSlot);
                            }
                            break;
                        case 40: // down arrow
                            if (_.contains(availableSlots, currentSlot + 5)) {
                                currentSlot += 5;
                                self.setSelectedSlot(currentSlot);
                            }
                            break;
                        case 13: // enter
                        case 32: // space
                            hasProcessedSelectedSlot = true;
                            self.processSelectedSlot(card, currentSlot);
                            break;
                    }
                }

                console.log('current slot after: ' + currentSlot);
            });
        }
    };

    this.setSelectedSlot = function(slotNumber) {
        $(".cards ul li").removeClass('selected');

        if (slotNumber < 5) {
            $($(".opp-cards ul li")[slotNumber]).addClass('selected');
        }
        else {
            $($(".my-cards ul li")[slotNumber - 5]).addClass('selected');
        }
    };

    this.processSelectedSlot = function(card, selectedSlot) {
        var self = this;

        this.performCardAction(card, selectedSlot);
        this.checkGame();

        this.eachActiveConnection(function(c, $c) {
            if (c.label === 'game') {
                console.log(card.name);
                c.send({ type: DATA.ACTION, cardName: card.name, slot: selectedSlot, numCardsLeft: _.size(self.deck) });
                $c.find('.messages').append(TEMPLATE.myAction({ cardName: card.name, slot: selectedSlot }));
                $c.find('.messages').append(TEMPLATE.myTurn());
                $("#next, #draw").hide();
            }
        });
    };

    this.performCardAction = function(card, selectedSlot) {
        $(".cards ul li").removeClass('available unavailable selected');
        this.cardsOnBoard[selectedSlot] = card;

        if (selectedSlot < 5) {
            $($(".opp-cards ul li")[selectedSlot]).removeClass().addClass(card.name);
        }
        else {
            $($(".my-cards ul li")[selectedSlot - 5]).removeClass().addClass(card.name);
        }
    };

    this.assignAvailableCards = function(lis, indexes) {
        _.each(lis, function(li, index) {
            if (_.contains(indexes, index)) {
                $(li).addClass('available');
            }
            else {
                $(li).addClass('unavailable');
            }
        });
    };

    // Check win condition
    this.checkGame = function() {
        if (this.isWin(_.first(this.cardsOnBoard, 5)) || this.isWin(_.last(this.cardsOnBoard, 5))) {
            this.endGame();
        }
    };

    // Return true if all cards are collected
    this.isWin = function(cards) {
        var sum = _.reduce(_.compact(cards), function(memo, card) {
            return memo + card.value;
        }, 0);

        console.log(sum);
        var score = sum % 10;

        while (sum > 0) {
            sum = Math.floor(sum / 10);

            if (sum % 10 > 0) {
                score++;
            }
        }

        console.log('final score: ' + score);

        return score == 5;
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

        console.log(this.deck);
    };

    this.init = function() {
        var self = this;

        this.cardsOnBoard = new Array(10);

        // Connect to a peer
        $('#connect').click(function() {
            var requestedPeer = $('#rid').val();
            if (!self.connectedPeers[requestedPeer]) {
                self.prepareDeck();

                var c = self.peer.connect(requestedPeer, {
                    label: 'game',
                    serialization: 'json',
                    metadata: {message: 'Hi let\'s start a game!'}
                });

                c.on('open', function() {
                    console.log('connect open start');
                    self.connect(c);

                    // sending initial deck to everyone so that everyone will be using the same deck
                    c.send({type: DATA.DECK, deck: self.deck});
                    $("#gameboard").show();

                    console.log('connect open end');
                });

                c.on('error', function(err) {
                    alert(err);
                });

                self.connectedPeers[requestedPeer] = 1;
            }
        });

        // Close a connection.
        $('#close').click(function() {
            self.eachActiveConnection(function(c) {
                c.close();
            });
        });

//        // end turn
//        $('#next').click(function(e) {
//            e.preventDefault();
//            var that = $(this);
//
//            var msg = 'It is your turn now.';
//            self.eachActiveConnection(function(c, $c) {
//                if (c.label === 'game') {
//                    c.send({ type: DATA.TURN, message: msg, numCardsLeft: _.size(self.deck)});
//                    $c.find('.messages').append(TEMPLATE.myTurn());
//                    that.hide();
//                }
//            });
//        });

        // Send a chat message to all active connections.
        $('#send').submit(function(e) {
            e.preventDefault();
            // For each active connection, send the message.
            var msg = $('#text').val();
            self.eachActiveConnection(function(c, $c) {
                if (c.label === 'game') {
                    c.send({ type: DATA.MESSAGE, message: msg });
                    $c.find('.messages').append('<div><span class="you">You: </span>' + msg
                        + '</div>');
                }
            });
            $('#text').val('');
            $('#text').focus();
        });

        $('#draw').click(function(e) {
            e.preventDefault();
            m.drawCard();
        });

    };

    this.endGame = function() {
        console.log("end game");
        alert('Game over!');
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

