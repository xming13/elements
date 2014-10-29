var XMing = XMing || {};

XMing.AchievementManager = (function() {

    var hasLocalStorage = false;

    var stats = {
        numGamePlayed: 0,
        numGameWon: 0,
        numGameLost: 0,
        numDeckFinished: 0,
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
            hasAwarded: function() { return stats.numGamePlayed > 0; }
        },
        {
            title: 'Game Lover <3',
            description: 'Thanks for playing so much!!!',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numGamePlayed; },
            goal: 100
        },
        {
            title: 'A Worthy Opponent',
            description: 'No winner yet after finishing a deck',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDeckFinished; },
            goal: 1
        },
        {
            title: 'GODLIGHT',
            description: 'Won with 5 light elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numWonWithFiveLight; },
            goal: 1
        },
        {
            title: 'The Purist',
            description: 'Won without light elements 100 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numWonWithoutLight; },
            goal: 100
        },
        {
            title: 'You Are The Friendliest',
            description: 'Help opponent win 5 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numHelpOppWin; },
            goal: 5
        },
        {
            title: 'So Much Charm',
            description: 'Won by opponent\'s help 5 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numHelpedByOppWin; },
            goal: 5
        },
        {
            title: 'The Evilist',
            description: 'Swap light element with opponent\'s dark element 10 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numSwapOppLightWithOwnDark; },
            goal: 10
        },
        {
            title: 'Guide the Misguided',
            description: 'Move opponent\'s light element to your side 10 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numMoveOppLightToSelf; },
            goal: 10
        },
        {
            title: 'Take No Evil',
            description: 'Move dark element to your opponent\'s side 10 times',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numMoveDarkToOpp; },
            goal: 10
        },
        {
            title: 'The Fast and Furious',
            description: 'Won the match within 5 turns',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numLeastTurnWon; },
            goal: 1
        },
        {
            title: 'The Unluckiest',
            description: 'Have 5 dark elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numFiveInRowDark; },
            goal: 1
        },
        {
            title: 'Tsunami',
            description: 'Have 5 water elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numFiveInRowWater; },
            goal: 1
        },
        {
            title: 'Inferno',
            description: 'Have 5 fire elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numFiveInRowFire; },
            goal: 1
        },
        {
            title: 'Sword Dance',
            description: 'Have 5 metal elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numFiveInRowWater; },
            goal: 1
        },
        {
            title: '???',
            description: 'Have 5 wood elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numFiveInRowWood; },
            goal: 1
        },
        {
            title: 'Earthquake',
            description: 'Have 5 earth elements in a row',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numFiveInRowEarth; },
            goal: 1
        },
        {
            title: 'Water Apprentice',
            description: 'Defeat 10 water elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementWater; },
            goal: 10
        },
        {
            title: 'Fire Apprentice',
            description: 'Defeat 10 fire elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementFire; },
            goal: 10
        },
        {
            title: 'Metal Apprentice',
            description: 'Defeat 10 metal elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementMetal; },
            goal: 10
        },
        {
            title: 'Wood Apprentice',
            description: 'Defeat 10 wood elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementWood; },
            goal: 10
        },
        {
            title: 'Earth Apprentice',
            description: 'Defeat 10 earth elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementEarth; },
            goal: 10
        },
        {
            title: 'Dark Apprentice',
            description: 'Defeat 5 dark elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementDark; },
            goal: 5
        },
        {
            title: 'Water Master',
            description: 'Defeat 25 water elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementWater; },
            goal: 25
        },
        {
            title: 'Fire Master',
            description: 'Defeat 25 fire elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementFire; },
            goal: 25
        },
        {
            title: 'Metal Master',
            description: 'Defeat 25 metal elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementMetal; },
            goal: 25
        },
        {
            title: 'Wood Master',
            description: 'Defeat 25 wood elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementWood; },
            goal: 25
        },
        {
            title: 'Earth Master',
            description: 'Defeat 25 earth elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementEarth; },
            goal: 25
        },
        {
            title: 'Dark Master',
            description: 'Defeat 13 dark elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementDark; },
            goal: 13
        },
        {
            title: 'Water GrandMaster',
            description: 'Defeat 50 water elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementWater; },
            goal: 50
        },
        {
            title: 'Fire GrandMaster',
            description: 'Defeat 50 fire elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementFire; },
            goal: 50
        },
        {
            title: 'Metal GrandMaster',
            description: 'Defeat 50 metal elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementMetal; },
            goal: 50
        },
        {
            title: 'Wood GrandMaster',
            description: 'Defeat 50 wood elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementWood; },
            goal: 50
        },
        {
            title: 'Earth GrandMaster',
            description: 'Defeat 50 earth elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementEarth; },
            goal: 50
        },
        {
            title: 'Dark GrandMaster',
            description: 'Defeat 25 dark elements',
            badgeUrl: '',
            hasAwarded: function() { return this.getCurrent() > this.goal; },
            getCurrent: function() { return stats.numDefeatElementDark; },
            goal: 25
        }
    ];

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

    function updateStats(eventType, meta) {
        if (hasLocalStorage) {
            if (eventType === 'won' || eventType === 'lost') {
                stats.numGamePlayed++;

                if (eventType === 'won') {
                    stats.numGameWon++;
                }
                else {
                    stats.numGameLost++;
                }

                var myCards = _.last(eventType, 5);

                var numLightCard = 0
                _.each(myCards, function(card) {
                    if (card && card.name === 'light') {
                        numLightCard++;
                    }
                });

                if (numLightCard == 5) {
                    stats.numWonWithFiveLight++;
                }
                else if (numLightCard == 0) {
                    stats.numWonWithoutLight++;
                }

                saveData(stats);
                console.log('data saved');
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
        getAchievements: getAchievements
    }
})();

