var XMing = XMing || {};

XMing.AchievementManager = (function() {

    var hasLocalStorage = false;

    var stats = {
        numGamePlayed: 0,
        numGameWon: 0,
        numGameLost: 0,
        numDeckFinished: 0,
        numPlaceDarkToSelf: 0,
        numMoveDarkToOpp: 0,
        numMoveOppLightToSelf: 0,
        numSwapOppLightWithOwnDark: 0,
        numLeastTurnWon: 999,
        numHelpOppWin: 0,
        numHelpedByOppWin: 0,
        numWonWithoutLight: 0,
        numWonWithFiveLight: 0,
        numFiveInRowWater: 0,
        numFiveInRowFire: 0,
        numFiveInRowMetal: 0,
        numFiveInRowWood: 0,
        numFiveInRowEarth: 0,
        numFiveInRowDark: 0,
        numDefeatElementWater: 0,
        numDefeatElementFire: 0,
        numDefeatElementMetal: 0,
        numDefeatElementWood: 0,
        numDefeatElementEarth: 0,
        numDefeatElementDark: 0
    };

    var achievements = [
        {
            title: 'First Game',
            description: 'A new journey begins!',
            badgeUrl: '',
            hasAwarded: function() { return stats.numGamePlayed >= 1; }
        },
        {
            title: 'Game Lover <3',
            description: 'Thanks for playing so much!!!',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numGamePlayed; },
            goal: 100
        },
        {
            title: 'A Worthy Opponent',
            description: 'No winner yet after finishing a deck',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDeckFinished; },
            goal: 1
        },
        {
            title: 'GODLIGHT',
            description: 'Won with 5 light elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numWonWithFiveLight; },
            goal: 1
        },
        {
            title: 'The Purist',
            description: 'Won without light elements 100 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numWonWithoutLight; },
            goal: 100
        },
        {
            title: 'You Are The Friendliest',
            description: 'Help opponent win 5 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numHelpOppWin; },
            goal: 5
        },
        {
            title: 'So Much Charm',
            description: 'Won by opponent\'s help 5 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numHelpedByOppWin; },
            goal: 5
        },
        {
            title: 'The Sadist',
            description: 'Put dark element on your row 10 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numPlaceDarkToSelf; },
            goal: 10
        },
        {
            title: 'The Evilist',
            description: 'Swap light element with opponent\'s dark element 10 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numSwapOppLightWithOwnDark; },
            goal: 10
        },
        {
            title: 'Guide the Misguided',
            description: 'Move opponent\'s light element to your side 10 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numMoveOppLightToSelf; },
            goal: 10
        },
        {
            title: 'Take No Evil',
            description: 'Move dark element to your opponent\'s side 10 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numMoveDarkToOpp; },
            goal: 10
        },
        {
            title: 'Fast and Furious',
            description: 'Won the match within 5 turns',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() <= this.goal; },
            getCurrent: function() { return stats.numLeastTurnWon; },
            goal: 5
        },
        {
            title: 'The Unluckiest',
            description: 'Have 5 dark elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numFiveInRowDark; },
            goal: 1
        },
        {
            title: 'Tsunami',
            description: 'Have 5 water elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numFiveInRowWater; },
            goal: 1
        },
        {
            title: 'Inferno',
            description: 'Have 5 fire elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numFiveInRowFire; },
            goal: 1
        },
        {
            title: 'Sword Dance',
            description: 'Have 5 metal elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numFiveInRowWater; },
            goal: 1
        },
        {
            title: '???',
            description: 'Have 5 wood elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numFiveInRowWood; },
            goal: 1
        },
        {
            title: 'Earthquake',
            description: 'Have 5 earth elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numFiveInRowEarth; },
            goal: 1
        },
        {
            title: 'Water Apprentice',
            description: 'Defeat 10 water elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementWater; },
            goal: 10
        },
        {
            title: 'Fire Apprentice',
            description: 'Defeat 10 fire elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementFire; },
            goal: 10
        },
        {
            title: 'Metal Apprentice',
            description: 'Defeat 10 metal elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementMetal; },
            goal: 10
        },
        {
            title: 'Wood Apprentice',
            description: 'Defeat 10 wood elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementWood; },
            goal: 10
        },
        {
            title: 'Earth Apprentice',
            description: 'Defeat 10 earth elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementEarth; },
            goal: 10
        },
        {
            title: 'Dark Apprentice',
            description: 'Defeat 5 dark elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementDark; },
            goal: 5
        },
        {
            title: 'Water Master',
            description: 'Defeat 25 water elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementWater; },
            goal: 25
        },
        {
            title: 'Fire Master',
            description: 'Defeat 25 fire elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementFire; },
            goal: 25
        },
        {
            title: 'Metal Master',
            description: 'Defeat 25 metal elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementMetal; },
            goal: 25
        },
        {
            title: 'Wood Master',
            description: 'Defeat 25 wood elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementWood; },
            goal: 25
        },
        {
            title: 'Earth Master',
            description: 'Defeat 25 earth elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementEarth; },
            goal: 25
        },
        {
            title: 'Dark Master',
            description: 'Defeat 13 dark elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementDark; },
            goal: 13
        },
        {
            title: 'Water GrandMaster',
            description: 'Defeat 50 water elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementWater; },
            goal: 50
        },
        {
            title: 'Fire GrandMaster',
            description: 'Defeat 50 fire elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementFire; },
            goal: 50
        },
        {
            title: 'Metal GrandMaster',
            description: 'Defeat 50 metal elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementMetal; },
            goal: 50
        },
        {
            title: 'Wood GrandMaster',
            description: 'Defeat 50 wood elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementWood; },
            goal: 50
        },
        {
            title: 'Earth GrandMaster',
            description: 'Defeat 50 earth elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementEarth; },
            goal: 50
        },
        {
            title: 'Dark GrandMaster',
            description: 'Defeat 25 dark elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() >= this.goal; },
            getCurrent: function() { return stats.numDefeatElementDark; },
            goal: 25
        }
    ];

    var numMaxCards = 98;

    function init() {
        if (isLocalStorageSupported()) {
            hasLocalStorage = true;

            var savedData = getSavedData();

            if (savedData) {
                stats = _.defaults(savedData, stats);
            }
        }
        else {
            hasLocalStorage = false;
            console.log('localstorage is not supported for your browser.');
        }
    }

    function updateStats(eventType, data) {
        if (hasLocalStorage) {

            switch (eventType) {
                case 'shuffle':
                    stats.numDeckFinished++;
                    break;
                case 'won':
                case 'lost':
                    stats.numGamePlayed++;

                    var numTurn = Math.ceil((numMaxCards - data.numCardLeft) / 2);

                    if (eventType === 'won') {
                        stats.numGameWon++;

                        if (stats.numLeastTurnWon > numTurn) {
                            stats.numLeastTurnWon = numTurn;
                        }

                        if ((data.isGameHost && !isGameHostTurn(numTurn))
                        || (!data.isGameHost && isGameHostTurn(numTurn))) {
                            stats.numHelpedByOppWin++;
                        }

                        var numLightCard = _.filter(data.myCards, function(card) {
                            return !_.isUndefined(card) && card.name === 'light';
                        }).length;

                        if (numLightCard == 5) {
                            stats.numWonWithFiveLight++;
                        }
                        else if (numLightCard == 0) {
                            stats.numWonWithoutLight++;
                        }
                    }
                    else {
                        stats.numGameLost++;

                        if ((data.isGameHost && isGameHostTurn(numTurn))
                            || (!data.isGameHost && !isGameHostTurn(numTurn))) {
                            stats.numHelpOppWin++;
                        }
                    }

                    saveData(stats);
                    console.log('data saved');

                    console.log(stats);

                    console.log('get saved data');

                    console.log(getSavedData());

                    break;
                case 'element':
                    if (!_.isUndefined(data.originalCardOnBoard)) {
                        switch (data.originalCardOnBoard.name) {
                            case 'water':
                                stats.numDefeatElementWater++;
                                break;
                            case 'fire':
                                stats.numDefeatElementFire++;
                                break;
                            case 'metal':
                                stats.numDefeatElementMetal++;
                                break;
                            case 'wood':
                                stats.numDefeatElementWood++;
                                break;
                            case 'earth':
                                stats.numDefeatElementEarth++;
                                break;
                            case 'dark':
                                stats.numDefeatElementDark++;
                                break;
                        }
                    }

                    if (data.cardPlayed.name === 'dark' && data.slotIndex < 5) {
                        stats.numPlaceDarkToSelf++;
                    }
                    checkFiveInARow(data.myCards);
                    break;
                case 'move':
                    if (data.cardFrom.name === 'dark' && data.indexFrom < 5) {
                        stats.numMoveDarkToOpp++;
                    }
                    else if (data.cardFrom.name === 'light' && data.indexFrom >= 5) {
                        stats.numMoveOppLightToSelf++;
                    }
                    checkFiveInARow(data.myCards);
                    break;
                case 'swap':
                    if ((data.cardFrom.name === 'dark' && data.cardTo.name === 'light' && data.indexFrom < 5)
                    || (data.cardFrom.name === 'light' && data.cardTo.name === 'dark' && data.indexFrom >= 5)){
                        stats.numSwapOppLightWithOwnDark++;
                    }
                    checkFiveInARow(data.myCards);
                    break;
            }

            function isGameHostTurn(numTurn) {
                return numTurn % 2 == 0;
            }

            function checkFiveInARow(myCards) {
                var name = '';
                var isSameForAll = true;
                for (var i = 0; i < myCards.length; i++) {
                    if (_.isUndefined(myCards[i])) {
                        isSameForAll = false;
                        break;
                    }

                    if (name === '') {
                        name = myCards[i].name;
                    }

                    if (name !== myCards[i].name) {
                        isSameForAll = false;
                        break;
                    }
                }

                if (isSameForAll) {
                    switch (name) {
                        case 'water':
                            stats.numFiveInRowWater++;
                            break;
                        case 'fire':
                            stats.numFiveInRowFire++;
                            break;
                        case 'metal':
                            stats.numFiveInRowMetal++;
                            break;
                        case 'wood':
                            stats.numFiveInRowWood++;
                            break;
                        case 'earth':
                            stats.numFiveInRowEarth++;
                            break;
                        case 'dark':
                            stats.numFiveInRowDark++;
                            break;
                    }
                }
            }
        }
    }

    function getAchievements() {
        return achievements;
    }

    function isLocalStorageSupported(){
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }

    function base64decode(base64) {
        return decodeURIComponent(atob(base64));
    }

    function base64encode(binary) {
        return btoa(encodeURIComponent(binary));
    }

    function saveData(data) {
        if (hasLocalStorage) {
            localStorage.setItem('stats', base64encode(JSON.stringify(data)));
        }
    }

    function getSavedData() {
        if (hasLocalStorage) {
            var stats = localStorage.getItem('stats');
            return stats && JSON.parse(base64decode(stats));
        }
        return null;
    }

    return {
        init: init,
        updateStats: updateStats,
        getAchievements: getAchievements,
        printStats: function() { console.log(stats); }
    }
})();

