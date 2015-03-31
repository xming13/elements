$(document).ready(function() {
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

    loadJoystick();
});
