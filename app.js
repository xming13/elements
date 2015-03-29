var una = require('una');
var http = require('http');
var path = require('path');
var routes = require('./routes');
var expressHbs = require('express-handlebars');

var app = una.app;
var express = una.express;

app.set('port', process.env.PORT || 3216);
app.set('views', __dirname + '/views');

app.engine('handlebars', expressHbs({defaultLayout:'desktop.handlebars'}));
app.set('view engine', 'handlebars');

app.use(app.router);
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', routes.index);
app.get('/room', routes.room);
app.get('/room/*', routes.room);
app.get('/play', routes.play);
app.get('/play/*', routes.play);
app.get('/join', routes.join);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
};

app.configure(function() {
    app.use(allowCrossDomain);
});

// Set http constants to allow infinite # of sockets
http.globalAgent.maxSockets = Infinity;

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

una.listen(server);
