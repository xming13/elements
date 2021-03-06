$(document).ready(function() {
    var path = window.location.pathname.slice(1).split('/');
    var myRoomId = (path.length === 2 && path[1] !== '') ? path[1] : 'lobby';

    var username = window.localStorage.getItem('username');
    if (username) {
        $('#username').val(username);
    }

    $('.btn-play').click(function() {
        var myUsername = $('#username').val();
        if (myUsername) {
            window.localStorage.setItem('username', myUsername);
            UnaController.register(myRoomId, { name: myUsername }, function(res) {
                console.log(res);
                console.log('myRoomId', myRoomId);
                if (res.success) {
                    $('.join-container').hide();
                    loadJoystick();
                }
            })
        }
        else {
            alert('Please enter a name!');
        }

        var loadJoystick = function () {
            var joystick = new VirtualJoystick({
                container: document.getElementById('joystick'),
                mouseSupport: true
            });

            // Handle move event
            var isMoving = false;
            var previousAngle = null;
            var threshold = 1;
            setInterval(function () {
                var x = joystick.deltaX();
                var y = joystick.deltaY();

                if (x === 0 && y === 0) {
                    if (isMoving) {
                        isMoving = false;
                        UnaController.sendToScreen('input', {key: 'stopmove'});
                    }
                }
                else {
                    var delta = Math.atan2(y, x);
                    var deltaDeg = Math.round(delta * 180 / Math.PI);

                    console.log(deltaDeg);

                    if (!previousAngle || Math.abs(deltaDeg - previousAngle) > threshold) {
                        previousAngle = deltaDeg;

                        var length = Math.min(Math.sqrt(x * x + y * y) / 50.0, 1.0);
                        isMoving = true;
                        UnaController.sendToScreen('input', {key: 'move', angle: delta, length: length});
                    }
                }
            }, 1000 / 30);
        };
    });
});
