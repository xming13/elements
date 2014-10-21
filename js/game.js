var XMing = XMing || {};

XMing.GameManager = new function() {

    var m = this;
    var maxSize = 5;

    var CARDS = {
        DARKNESS: { type: 'element', name: 'darkness', value: 0},
        LIGHT: { type: 'element', name: 'light', value: 1},
        WATER: { type: 'element', name: 'water', value: 10},
        FIRE: { type: 'element', name: 'fire', value: 100},
        METAL: { type: 'element', name: 'metal', value: 1000},
        WOOD: { type: 'element', name: 'wood', value: 10000},
        EARTH: { type: 'element', name: 'earth', value: 100000},
        MOVE: { type: 'action', name: 'move', value: 2},
        DISCARD_1: { type: 'action', name: 'discard 1', value: 3},
        DISCARD_2: { type: 'action', name: 'discard 2', value: 4},
        SWAP: { type: 'action', name: 'swap', value: 5}
    };

    this.deck = [];
    this.myCards = [];
    this.oppCards = [];

    // Card Object
    var Card = function(type, name, value) {
        this.type = type;
        this.name = name;
        this.value = value;
    };

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

                console.log(data);

                if (data.deck) {
                    // setting initial deck when the game start so that everyone uses the same deck
                    m.deck = data.deck;
                    $("#gameboard").show();
                }
                else if (data.turn) {
                    m.deck = _.last(m.deck, data.numCardsLeft);
                    m.drawCard();

                    $("#next").show();
                    messages.append('<div><span class="peer">' + c.peer + '</span> msg: ' + data.message +
                        '</div>');
                }

                else {
                    messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data +
                        '</div>');
                }
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
        var cardDrawn = this.deck.shift();
        this.processCard(cardDrawn);
    };

    this.processCard = function(card) {
        // process

        switch (card.name) {
            case 'darkness':
                break;
            case 'light':
                break;
            case 'water':
                break;
            case 'fire':
                break;
            case 'metal':
                break;
            case 'wood':
                break;
            case 'earth':
                break;
        }
        //

        this.checkGame();
    };

    // Check win condition
    this.checkGame = function() {
        if (this.isWin(this.myCards) || this.isWin(this.oppCards)) {
            this.endGame();
        }
    };

    // Return true if all cards are collected
    this.isWin = function(cards) {
        var sum = _.reduce(cards, function(memo, card) {
            return memo + card.value;
        }, 0);

        var score = sum % 10;

        while (sum > 0) {
            sum /= 10;

            if (sum % 10 > 0) {
                score++;
            }
        }

        return score == 5;
    };

    this.prepareDeck = function() {
        var self = this;

        this.deck = [];

        _.each(CARDS, function(card) {
            var numTimes = card.type == 'action' ? 5 : (card.name == 'darkness' ? 6 : 12);
            _.times(numTimes, function() {
                self.deck.push(new Card(card.type, card.name, card.value));
            });
        });

        this.deck = _.shuffle(this.deck);

        console.log(this.deck);
    };

    this.init = function() {
        var self = this;

        this.prepareDeck();
        this.myCards = [];
        this.oppCards = [];

        // Connect to a peer
        $('#connect').click(function() {
            var requestedPeer = $('#rid').val();
            if (!self.connectedPeers[requestedPeer]) {
                var c = self.peer.connect(requestedPeer, {
                    label: 'game',
                    serialization: 'json',
                    metadata: {message: 'Hi let\'s start a game!'}
                });

                c.on('open', function() {
                    console.log('connect open start');
                    self.connect(c);

                    // sending initial deck to everyone so that everyone will be using the same deck
                    c.send({deck: self.deck});
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

        // end turn
        $('#next').click(function(e) {
            e.preventDefault();
            var that = $(this);

            var msg = 'It is your turn now.';
            self.eachActiveConnection(function(c, $c) {
                c.send({ message: msg, turn: 'next', numCardsLeft: _.size(self.deck)});
                $c.find('.messages').append('<div>You have ended your turn. It is your opponent\'s turn now</div>');
                that.hide();
            });
        });

        // Send a chat message to all active connections.
        $('#send').submit(function(e) {
            e.preventDefault();
            // For each active connection, send the message.
            var msg = $('#text').val();
            self.eachActiveConnection(function(c, $c) {
                if (c.label === 'game') {
                    c.send(msg);
                    $c.find('.messages').append('<div><span class="you">You: </span>' + msg
                        + '</div>');
                }
            });
            $('#text').val('');
            $('#text').focus();
        });

    };

    this.endGame = function() {
        console.log("end game");
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

