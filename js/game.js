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
        TURN_START: 'turn_start',
        DRAW: 'draw',
        ACTION: 'action',
        MESSAGE: 'message',
        REQUEST_DECK: 'request_deck'
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
        myMessage: _.template('<div><span class="you">You :</span> {- message }}</div>'),
        oppTurnStart: _.template('<div><span class="peer">{{ peer }}</span> starts turn.</div>'),
        oppTurnEnd: _.template('<div><span class="peer">{{ peer }}</span> ends turn.</div>'),
        oppDraw: _.template('<div><span class="peer">{{ peer }}</span> draws <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span> !</div>'),
        oppAction: _.template('<div><span class="peer">{{ peer }}</span> plays <span class="card-text {# print(cardName.replace(\' \', \'\')); }}">{{ cardName }}</span> !</div>'),
        oppMessage: _.template('<div><span class="peer">{{ peer }} :</span> {- message }}</div>')
    };

    this.deck = [];
    this.cardsOnBoard = [];

    this.peer = null;

    this.connectedPeers = {};

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

            var input = $('<input/>').addClass('messages-input');
            chatbox.append(input);

            $('#connections').append(chatbox);

            $(".messages-input").keydown(function(e) {
                // enter key
                if (e.keyCode == 13 && $(this).val() != '') {
                    c.send({ type: DATA.MESSAGE, message: $(this).val() });
                    messagesChat.append(TEMPLATE.myMessage({ message: $(this).val() }));
                    $(this).val('').focus();
                    m.scrollChatMessagesToBottom();
                }
            });

            c.on('data', function(data) {
                console.log(c.peer);
                console.log(data);

                if (data.type == DATA.REQUEST_DECK) {
                    console.log('receive data for request_deck');

                    c.send({ type: DATA.DECK, deck: m.deck });
                }
                else if (data.type == DATA.DECK) {
                    console.log('receive data for deck');

                    // setting initial deck sent by the host when the game start so that everyone uses the same deck
                    m.deck = data.deck;

                    $("#gameboard").show();
                    $("#menu-container").hide();

                    // Game start!
                    c.send({ type: DATA.TURN_START });

                    messagesGame.append(TEMPLATE.myTurnStart());
                    m.scrollGameMessagesToBottom();

                    m.showDrawScreen();
                }
                else if (data.type == DATA.TURN_START) {
                    console.log('retrieve data for turn start');

                    messagesGame.append(TEMPLATE.oppTurnStart({ peer: c.peer }));
                    m.scrollChatMessagesToBottom();
                }
                else if (data.type == DATA.DRAW) {
                    console.log('receive data for draw');

                    messagesGame.append(TEMPLATE.oppDraw({ peer: c.peer, cardName: data.cardName }));
                    m.scrollGameMessagesToBottom();
                }
                else if (data.type == DATA.ACTION) {
                    console.log('receive data for action');

                    var mySlot = data.slot < maxSize ? data.slot + maxSize : data.slot - maxSize;
                    messagesGame.append(TEMPLATE.oppAction({ peer: c.peer, cardName: data.cardName, slot: mySlot }));
                    messagesGame.append(TEMPLATE.oppTurnEnd({ peer: c.peer }));

                    // Update player's action for the last turn
                    m.deck = _.last(m.deck, data.numCardsLeft);

                    var card = _.findWhere(CARDS, { name: data.cardName });
                    m.performCardAction(card, mySlot);
                    m.checkGame();

                    // It is your turn now!
                    c.send({ type: DATA.TURN_START });

                    messagesGame.append(TEMPLATE.myTurnStart());
                    m.scrollGameMessagesToBottom();

                    m.showDrawScreen();
                }
                else if (data.type == DATA.MESSAGE) {
                    messagesChat.append(TEMPLATE.oppMessage({ peer: c.peer, message: data.message }));
                    m.scrollChatMessagesToBottom();
                }
                else {
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

    this.showDrawScreen = function() {
        $('#actions').fadeIn();

        // Draw a new card
        $('.draw-cards ul li').click(function () {
            $('#actions').fadeOut();
            m.drawCard();
        });
    };

    this.drawCard = function() {
        console.log('draw card');

        var self = this;
        var cardDraw = this.deck.shift();

        this.eachActiveConnection(function(c, $c) {
            if (c.label === 'game') {
                c.send({ type: DATA.DRAW, cardName: cardDraw.name });
                $c.find('.messages-game').append(TEMPLATE.myDraw({ cardName: cardDraw.name }));
                self.scrollGameMessagesToBottom();
            }
        });

        this.processCard(cardDraw);
    };

    // return the available slots that the card can be played on
    this.getAvailableSlots = function(card) {
        var availableSlots = [];

        _.each(this.cardsOnBoard, function(cardOnBoard, index) {
            if (cardOnBoard == null || _.contains(card.enemies, cardOnBoard.name)) {
                availableSlots.push(index);
            }
        });

        return availableSlots;
    };

    this.processCard = function(card) {
        console.log('process card');

        if (card.type == 'element') {
            this.setupSelection(card);
        }
        else if (card.type == 'action') {

        }
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
                return slot < maxSize;
            });

            parts[1] = _.map(parts[1], function(slot) {
                return slot - maxSize;
            });

            this.assignAvailableCards($(".opp-cards ul li"), parts[0]);
            this.assignAvailableCards($(".my-cards ul li"), parts[1]);

            // set default selected slot
            var currentSlot = availableSlots[0];
            this.setSelectedSlot(card, currentSlot);

            var hasProcessedSelectedSlot = false;

            $(".cards ul li.available").hover(function() {
                if (!hasProcessedSelectedSlot) {
                    currentSlot = $(".cards ul li").index(this);
                    self.setSelectedSlot(card, currentSlot);
                }
            }).click(function() {
                if (!hasProcessedSelectedSlot) {
                    hasProcessedSelectedSlot = true;
                    currentSlot = $(".cards ul li").index(this);
                    self.processSelectedSlot(card, currentSlot);
                }
            });

            $("#gameboard").focus()
                .keydown(function(e) {
                console.log('key pressed: ' + e.keyCode);
                console.log('current slot before: ' + currentSlot);

                if (!hasProcessedSelectedSlot) {
                    switch (e.keyCode) {
                        case 37: // up arrow
                            if (currentSlot != maxSize && _.contains(availableSlots, currentSlot - 1)) {
                                currentSlot--;
                                self.setSelectedSlot(card, currentSlot);
                            }
                            break;
                        case 38: // left arrow
                            if (_.contains(availableSlots, currentSlot - maxSize)) {
                                currentSlot -= maxSize;
                                self.setSelectedSlot(card, currentSlot);
                            }
                            break;
                        case 39: // right arrow
                            if (currentSlot != 4 && _.contains(availableSlots, currentSlot + 1)) {
                                currentSlot++;
                                self.setSelectedSlot(card, currentSlot);
                            }
                            break;
                        case 40: // down arrow
                            if (_.contains(availableSlots, currentSlot + maxSize)) {
                                currentSlot += maxSize;
                                self.setSelectedSlot(card, currentSlot);
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

    this.setSelectedSlot = function(card, slotNumber) {
        $(".cards ul li").removeClass('selected hover-' + card.name);

        if (slotNumber < maxSize) {
            $($(".opp-cards ul li")[slotNumber]).addClass('selected hover-' + card.name);
        }
        else {
            $($(".my-cards ul li")[slotNumber - maxSize]).addClass('selected hover-' + card.name);
        }
    };

    this.processSelectedSlot = function(card, selectedSlot) {
        var self = this;

        this.performCardAction(card, selectedSlot);
        this.checkGame();

        this.eachActiveConnection(function(c, $c) {
            if (c.label === 'game') {
                c.send({ type: DATA.ACTION, cardName: card.name, slot: selectedSlot, numCardsLeft: _.size(self.deck) });
                $c.find('.messages-game').append(TEMPLATE.myAction({ cardName: card.name, slot: selectedSlot }));
                $c.find('.messages-game').append(TEMPLATE.myTurnEnd());
                self.scrollGameMessagesToBottom();
            }
        });
    };

    this.performCardAction = function(card, selectedSlot) {
        $(".cards ul li").removeClass('available unavailable selected');
        this.cardsOnBoard[selectedSlot] = card;

        if (selectedSlot < maxSize) {
            $($(".opp-cards ul li")[selectedSlot]).removeClass().addClass(card.name);
        }
        else {
            $($(".my-cards ul li")[selectedSlot - maxSize]).removeClass().addClass(card.name);
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
        if (this.isWin(_.first(this.cardsOnBoard, maxSize))) {
            this.endGame(false);
        }
        else if (this.isWin(_.last(this.cardsOnBoard, maxSize))) {
            this.endGame(true);
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
    };

    this.init = function() {
        var self = this;

        this.cardsOnBoard = new Array(10);

        // navigate to create connection screen
        $("#create").click(function() {
            console.log('create click');

            $("#menu-main").hide();
            $("#menu-host").show();
            $("#instruction").hide();
        });

        // navigate to join connection screen
        $("#join").click(function() {
            console.log('join click');

            $("#menu-main").hide();
            $("#menu-join").show();
        });

        // create new connection
        $("#host").click(function() {

            var usernameHost = $("#username-host").val();

            if (usernameHost === '') {
                swal(
                    'Oops..',
                    'Please enter a username!',
                    'error'
                );
            }
            else {
                self.peer =  new Peer(usernameHost, {
                    key: 'j4a6ijvcn8z1tt9'
                });

                self.peer.on('open', function(id){
                    $('#pid').text(id);
                    $("#instruction").show();
                    self.prepareDeck();
                });

                self.peer.on('connection', function(c) {
                    console.log('on connection');
                    self.connect(c);

                    $("#gameboard").show();
                    $("#menu-container").hide();
                });

                self.peer.on('error', function(err) {
                    swal(
                        'Oops..',
                         err,
                        'error'
                    );
                });
            }
        });

        // Connect to a peer
        $('#connect').click(function() {

            if ($("#username-join").val() == '') {
                swal(
                    'Oops..',
                    'Please enter a username!',
                    'error'
                );
            }
            else if ($('#rid').val() == '') {
                swal(
                    'Oops..',
                    'Please enter your friend\'s ID!',
                    'error'
                );
            }
            else {
                var requestedPeer = $('#rid').val();
                if (!self.connectedPeers[requestedPeer]) {

                    self.peer =  new Peer($("#username-join").val(), {
                        key: 'j4a6ijvcn8z1tt9'
                    });

                    //self.peer.listAllPeers();

                    var c = self.peer.connect(requestedPeer, {
                        label: 'game',
                        serialization: 'json',
                        metadata: {message: 'Hi let\'s start a game!'}
                    });

                    c.on('open', function() {
                        console.log('connect open start');
                        self.connect(c);
                        c.send({ type: DATA.REQUEST_DECK });

                        console.log('connect open end');
                    });

                    c.on('error', function(err) {
                        swal(
                            'Oops..',
                             err,
                            'error'
                        );
                    });

                    self.connectedPeers[requestedPeer] = 1;
                }
            }
        });

        // Close a connection
        $('#close').click(function() {
            self.eachActiveConnection(function(c) {
                c.close();
            });
        });
    };

    this.endGame = function(isYouWin) {
        console.log("end game");

        if (isYouWin) {
            swal(
                'You won!',
                'Congratulations!',
                'success'
            );
        }
        else {
            swal(
                'You lost!',
                'Play again!',
                'error'
            );
        }
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

