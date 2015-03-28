/*
 * GET home page.
 */

module.exports = {
    index: function (req, res) {
        res.render('index', { title: 'Index' });
    },

    choose: function (req, res) {
        var room = req.body.room;
        var type = req.body.type;
        console.log('type: ' + type);
        console.log('room: ' + room);
        res.redirect('/' + type + '/' + room);
    },

    screen: function (req, res) {
        res.render('screen', { title: 'Screen' });
    },

    arena: function (req, res) {
        res.render('arena', { title: 'Arena' });
    },

    landing: function (req, res) {
        res.render('landing', { title: 'landing' });
    },

    arenaWithRoom: function (req, res) {
        res.render('arena', { title: 'arenaWithRoom' });
    },

    controller: function (req, res) {
        res.render('controller', { title: 'Controller' });
    },

    controllerWithRoom: function (req, res) {
        res.render('controller', { title: 'controllerWithRoom' });
    },

    botcontrollerWithRoom: function (req, res) {
        res.render('bot_controller', { title: 'botcontrollerWithRoom' });
    }
};
