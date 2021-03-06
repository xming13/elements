/*
 * GET home page.
 */

module.exports = {
    index: function (req, res) {
        res.render('index', { title: 'Index', layout: null });
    },

    room: function (req, res) {
        res.render('room', { title: 'Room' });
    },

    play: function (req, res) {
        res.render('play', { title: 'Play' });
    },

    controller: function (req, res) {
        res.render('controller', { title: 'Controller', layout: 'mobile.handlebars'});
    },

    choose: function (req, res) {
        var room = req.body.room;
        var type = req.body.type;
        console.log('type: ' + type);
        console.log('room: ' + room);
        res.redirect('/' + type + '/' + room);
    }
};
