var Room = (function() {
    var init = function() {
        console.log('init');
    };

    var controllerInput = function(id) {
        console.log('controllerInput: user - ' + id);
    };

    var controllerJoin = function(id, userData) {
        console.log('controllerJoin: user - ' + id + '. userData - ', userData);
        var player = new Player({id: id, name: userData.name});
        Players.add(player);
    };

    var controllerLeave = function(id) {
        console.log('controllerLeave: user - ' + id);
        Players.remove({id: id});
    };

    return {
        init: init,
        controllerInput: controllerInput,
        controllerJoin: controllerJoin,
        controllerLeave: controllerLeave
    };
})();

var Player = Backbone.Model.extend({
    defaults: function() {
        return {
            id: -1,
            name: 'default name'
        }
    }
});

var PlayerList = Backbone.Collection.extend({
    model: Player
});

var PlayerView = Backbone.View.extend({

    tagName: 'div',

    className: 'player-row',

    template: _.template('<div class="player">name: <%= name %></div>'),

    events: {

    },

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
        this.listenTo(this.model, 'remove', this.remove);
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

var AppView = Backbone.View.extend({
    el: $('#app'),

    initialize: function() {
        this.$playerList = $('#player-list');

        this.listenTo(Players, 'add', this.addOne);
        this.listenTo(Players, 'all', this.render);
    },

    addOne: function(player) {
        console.log('addOne player', player);
        var view = new PlayerView({model: player});
        this.$playerList.append(view.render().el);
    }
});

var Players = new PlayerList;

var App = new AppView();