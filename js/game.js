var XMing = XMing || {};

XMing.GameManager = new function() {

    var maxSize = 5;
    var elemTypes = [
        0, // darkness
        1, // light
        10, // water
        100, // fire
        1000, // metal
        10000, // wood
        100000 // earth
    ];

    this.deck = [];
    this.myCards = [];
    this.oppCards = [];

    var card = function(elemType) {
        var self = this;
        self.elemType = elemType;
    };

    this.drawCard = function() {
        var cardDrawn = this.deck.shift();
        this.processCard(cardDrawn);
    };

    this.processCard = function(card) {

    };

    this.checkGame = function() {
        var mySum = getSum(this.myCards);
        var oppSum = getSum(this.oppCards);

    };

    this.getSum = function(cards) {
        return _.reduce(cards, function(memo, card) {
            return memo + card.elemType;
        }, 0);
    }

    this.startGame= function() {
        _.times(50, function() {
            var elemType = _.random(5);
            this.deck.push(new card(elemType));
        });
    };

    this.endGame = function() {

    };
};

