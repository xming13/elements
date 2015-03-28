var XMing = XMing || {};

XMing.AchievementManager = (function() {

    var hasLocalStorage = false;

    var stats = {
        numGamePlayed: 0,
        numGameWon: 0,
        numGameLost: 0,
        numDeckFinished: 0,
        numPlaceDarkToSelf: 0,
        numDiscardLight: 0,
        numMoveDarkToOpp: 0,
        numMoveOppLightToSelf: 0,
        numSwapOppLightWithOwnDark: 0,
        numLeastTurnsWon: 999,
        numWonWithinFiveTurns: 0,
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

    var achievements = {
        'first_game': {
            title: 'First Game',
            description: 'A new journey begins!',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numGamePlayed;
            },
            goal: 1
        },
        'game_lover': {
            title: 'Game Lover <3',
            description: 'Thanks for playing so much!!!',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numGamePlayed;
            },
            goal: 100
        },
        'worthy_opponent': {
            title: 'A Worthy Opponent',
            description: 'No winner yet after finishing a deck',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDeckFinished;
            },
            goal: 1
        },
        'godlight': {
            title: 'GODLIGHT',
            description: 'Won with 5 light elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numWonWithFiveLight;
            },
            goal: 1
        },
        'purist': {
            title: 'The Purist',
            description: 'Won without light elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numWonWithoutLight;
            },
            goal: 20
        },
        'friendliest': {
            title: 'You Are The Friendliest',
            description: 'Help opponent to win',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numHelpOppWin;
            },
            goal: 5
        },
        'much_charm': {
            title: 'So Much Charm',
            description: 'Won by opponent\'s help',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numHelpedByOppWin;
            },
            goal: 5
        },
        'sadist': {
            title: 'The Sadist',
            description: 'Put dark element on your row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numPlaceDarkToSelf;
            },
            goal: 10
        },
        'no_light': {
            title: '???',
            description: 'Discard light element',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDiscardLight;
            },
            goal: 20
        },
        'evilest': {
            title: 'The Evilest',
            description: 'Swap dark element with opponent\'s light element',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numSwapOppLightWithOwnDark;
            },
            goal: 10
        },
        'guide_the_misguided': {
            title: 'Guide the Misguided',
            description: 'Move opponent\'s light element to your row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numMoveOppLightToSelf;
            },
            goal: 10
        },
        'no_evil': {
            title: 'Take No Evil',
            description: 'Move dark element to your opponent\'s row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numMoveDarkToOpp;
            },
            goal: 10
        },
        'fast_and_furious': {
            title: 'Fast and Furious',
            description: 'Won within 5 turns',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numWonWithinFiveTurns;
            },
            goal: 1
        },
        'unluckiest': {
            title: 'The Unluckiest',
            description: 'Have 5 dark elements in a row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numFiveInRowDark;
            },
            goal: 1
        },
        'tsunami': {
            title: 'Tsunami',
            description: 'Have 5 water elements in a row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numFiveInRowWater;
            },
            goal: 1
        },
        'inferno': {
            title: 'Inferno',
            description: 'Have 5 fire elements in a row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numFiveInRowFire;
            },
            goal: 1
        },
        'sword_dance': {
            title: 'Sword Dance',
            description: 'Have 5 metal elements in a row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numFiveInRowWater;
            },
            goal: 1
        },
        'xxx': {
            title: 'xxx',
            description: 'Have 5 wood elements in a row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numFiveInRowWood;
            },
            goal: 1
        },
        'earthquake': {
            title: 'Earthquake',
            description: 'Have 5 earth elements in a row',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numFiveInRowEarth;
            },
            goal: 1
        },
        'water_apprentice': {
            title: 'Water Apprentice',
            description: 'Defeat 10 water elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementWater;
            },
            goal: 1
        },
        'fire_apprentice': {
            title: 'Fire Apprentice',
            description: 'Defeat 10 fire elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementFire;
            },
            goal: 1
        },
        'metal_apprentice': {
            title: 'Metal Apprentice',
            description: 'Defeat 10 metal elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementMetal;
            },
            goal: 1
        },
        'wood_apprentice': {
            title: 'Wood Apprentice',
            description: 'Defeat 10 wood elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementWood;
            },
            goal: 1
        },
        'earth_apprentice': {
            title: 'Earth Apprentice',
            description: 'Defeat 10 earth elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementEarth;
            },
            goal: 1
        },
        'dark_apprentice': {
            title: 'Dark Apprentice',
            description: 'Defeat 5 dark elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementDark;
            },
            goal: 5
        },
        'water_master': {
            title: 'Water Master',
            description: 'Defeat 25 water elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementWater;
            },
            goal: 2
        },
        'fire_master': {
            title: 'Fire Master',
            description: 'Defeat 25 fire elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementFire;
            },
            goal: 2
        },
        'metal_master': {
            title: 'Metal Master',
            description: 'Defeat 25 metal elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementMetal;
            },
            goal: 2
        },
        'wood_master': {
            title: 'Wood Master',
            description: 'Defeat 25 wood elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementWood;
            },
            goal: 2
        },
        'earth_master': {
            title: 'Earth Master',
            description: 'Defeat 25 earth elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementEarth;
            },
            goal: 2
        },
        'dark_master': {
            title: 'Dark Master',
            description: 'Defeat 13 dark elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementDark;
            },
            goal: 13
        },
        'water_grandmaster': {
            title: 'Water GrandMaster',
            description: 'Defeat 50 water elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementWater;
            },
            goal: 50
        },
        'fire_grandmaster': {
            title: 'Fire GrandMaster',
            description: 'Defeat 50 fire elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementFire;
            },
            goal: 50
        },
        'metal_grandmaster': {
            title: 'Metal GrandMaster',
            description: 'Defeat 50 metal elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementMetal;
            },
            goal: 50
        },
        'wood_grandmaster': {
            title: 'Wood GrandMaster',
            description: 'Defeat 50 wood elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementWood;
            },
            goal: 50
        },
        'earth_grandmaster': {
            title: 'Earth GrandMaster',
            description: 'Defeat 50 earth elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementEarth;
            },
            goal: 50
        },
        'dark_grandmaster': {
            title: 'Dark GrandMaster',
            description: 'Defeat 25 dark elements',
            badgeUrl: 'images/badge.png',
            hasAwarded: function() {
                return this.getCurrent() >= this.goal;
            },
            getCurrent: function() {
                return stats.numDefeatElementDark;
            },
            goal: 25
        }
    };

    var numMaxCards = 98;

    function init() {
        if (isLocalStorageSupported()) {
            hasLocalStorage = true;

            var savedData = getSavedData();

            if (savedData) {
                stats = _.defaults(savedData, stats);
            }
        } else {
            hasLocalStorage = false;
            console.log('localstorage is not supported for your browser.');
        }
    }

    function updateStats(eventType, data) {
        if (hasLocalStorage) {

            switch (eventType) {
                case 'shuffle':
                    stats.numDeckFinished++;
                    checkAchievement(achievements.worthy_opponent);
                    break;
                case 'won':
                case 'lost':
                    stats.numGamePlayed++;
                    !checkAchievement(achievements.first_game)
                    && checkAchievement(achievements.game_lover);

                    var numTurn = Math.ceil((numMaxCards - data.numCardLeft) / 2);

                    if (eventType === 'won') {
                        stats.numGameWon++;

                        if (stats.numLeastTurnsWon > numTurn) {
                            stats.numLeastTurnsWon = numTurn;
                            if (numTurn <= 5) {
                                stats.numWonWithinFiveTurns++;
                            }
                            checkAchievement(achievements.fast_and_furious);
                        }

                        if ((data.isGameHost && !isGameHostTurn(numTurn)) || (!data.isGameHost && isGameHostTurn(numTurn))) {
                            stats.numHelpedByOppWin++;
                            checkAchievement(achievements.much_charm);
                        }

                        var numLightCard = _.filter(data.myCards, function(card) {
                            return !_.isUndefined(card) && card.name === 'light';
                        }).length;

                        if (numLightCard == 5) {
                            stats.numWonWithFiveLight++;
                            checkAchievement(achievements.godlight);
                        } else if (numLightCard == 0) {
                            stats.numWonWithoutLight++;
                            checkAchievement(achievements.purist);
                        }
                    } else {
                        stats.numGameLost++;

                        if ((data.isGameHost && isGameHostTurn(numTurn)) || (!data.isGameHost && !isGameHostTurn(numTurn))) {
                            stats.numHelpOppWin++;
                            checkAchievement(achievements.friendliest);
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
                                !checkAchievement(achievements.water_apprentice)
                                && !checkAchievement(achievements.water_master)
                                && checkAchievement(achievements.water_grandmaster);
                                break;
                            case 'fire':
                                stats.numDefeatElementFire++;
                                !checkAchievement(achievements.fire_apprentice)
                                && !checkAchievement(achievements.fire_master)
                                && checkAchievement(achievements.fire_grandmaster);
                                break;
                            case 'metal':
                                stats.numDefeatElementMetal++;
                                !checkAchievement(achievements.metal_apprentice)
                                && !checkAchievement(achievements.metal_master)
                                && checkAchievement(achievements.metal_grandmaster);
                                break;
                            case 'wood':
                                stats.numDefeatElementWood++;
                                !checkAchievement(achievements.wood_apprentice)
                                && !checkAchievement(achievements.wood_master)
                                && checkAchievement(achievements.wood_grandmaster);
                                break;
                            case 'earth':
                                stats.numDefeatElementEarth++;
                                !checkAchievement(achievements.earth_apprentice)
                                && !checkAchievement(achievements.earth_master)
                                && checkAchievement(achievements.earth_grandmaster);
                                break;
                            case 'dark':
                                stats.numDefeatElementDark++;
                                !checkAchievement(achievements.dark_apprentice)
                                && !checkAchievement(achievements.dark_master)
                                && checkAchievement(achievements.dark_grandmaster);
                                break;
                        }
                    }

                    if (data.cardPlayed.name === 'dark' && data.slotIndex < 5) {
                        stats.numPlaceDarkToSelf++;
                        checkAchievement(achievements.sadist);
                    }
                    checkFiveInARow(data.myCards);
                    break;
                case 'move':
                    if (data.cardFrom.name === 'dark' && data.indexFrom < 5) {
                        stats.numMoveDarkToOpp++;
                        checkAchievement(achievements.no_evil);
                    } else if (data.cardFrom.name === 'light' && data.indexFrom >= 5) {
                        stats.numMoveOppLightToSelf++;
                        checkAchievement(achievements.guide_the_misguided);
                    }
                    checkFiveInARow(data.myCards);
                    break;
                case 'discard':
                    if (data.cardDiscard.name === 'light') {
                        stats.numDiscardLight++;
                        checkAchievement(achievements.no_light);
                    }
                    break;
                case 'swap':
                    if ((data.cardFrom.name === 'dark' && data.cardTo.name === 'light' && data.indexFrom < 5)
                        || (data.cardFrom.name === 'light' && data.cardTo.name === 'dark' && data.indexFrom >= 5)) {
                        stats.numSwapOppLightWithOwnDark++;
                        checkAchievement(achievements.evilest);
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
                            checkAchievement(achievements.tsunami);
                            break;
                        case 'fire':
                            stats.numFiveInRowFire++;
                            checkAchievement(achievements.inferno);
                            break;
                        case 'metal':
                            stats.numFiveInRowMetal++;
                            checkAchievement(achievements.sword_dance);
                            break;
                        case 'wood':
                            stats.numFiveInRowWood++;
                            checkAchievement(achievements.xxx);
                            break;
                        case 'earth':
                            stats.numFiveInRowEarth++;
                            checkAchievement(achievements.earthquake);
                            break;
                        case 'dark':
                            stats.numFiveInRowDark++;
                            checkAchievement(achievements.unluckiest);
                            break;
                    }
                }
            }
        }
    }

    function checkAchievement(achievement) {
        if (achievement.getCurrent() === achievement.goal) {
            var template = _.template('<div class="achievement-popup"><img src="{{ badgeUrl }}" /><div>{{ title }} : {{ description }}</div></div>');
            var popup = $(template({
                badgeUrl: achievement.badgeUrl,
                title: achievement.title,
                description: achievement.description
            })).css({
                    'top': '-80px',
                    'z-index': 1000 - $('#gameboard .achievement-popup').length + ''
                });

            $('#gameboard').append(popup);

            popup.animate({ 'top': ($('#gameboard .achievement-popup').length - 1) * 85 },
                $('#gameboard .achievement-popup').length * 500, function() {
                setTimeout(function() {
                    popup.fadeOut(500, function() {
                        $(this).remove();
                    });
                }, 1500);
            });

            return true;
        }
        return false;
    }

    function getAchievements() {
        return achievements;
    }

    function isLocalStorageSupported() {
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
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
        printStats: function() {
            console.log(stats);
        }
    }
})();