import LedController, {LedColor} from "ws2801-pi/dist";
import {ORANGE, RED, WHITE} from "./colors";

const io = require('socket.io-client')

enum LedAnimation {
    RED_GLOW = 'RED_GLOW',
    RAINBOW_GLOW = 'RAINBOW_GLOW',
    WHITE = 'WHITE',
    RED = 'RED',
    ORANGE = 'ORANGE'
}

const getLedStatusByString = (animation: string): LedAnimation => {
    let map = {
        'RED_GLOW': LedAnimation.RED_GLOW,
        'RAINBOW_GLOW': LedAnimation.RAINBOW_GLOW,
        'WHITE': LedAnimation.WHITE,
        'RED': LedAnimation.RED,
        'ORANGE': LedAnimation.ORANGE,
    }

    return map[animation] || LedAnimation.WHITE;
}

const staticColorAnimation = async (color: LedColor, controller: LedController) => {
    await controller.fillLeds(color).show();
    await new Promise(resolve => setTimeout(() => resolve(), 60 * 1000));
}

(async () => {
    const LED_COUNT = 60;
    const ledController = new LedController(LED_COUNT);

    let currentAnimation: LedAnimation;

    console.log('Clearing LEDs...');
    await ledController.clearLeds().show(); // Clear LEDs on controller

    console.log('Connecting via socket');
    const socket = io('https://lamp.simplyalec.com');

    socket.on('connect', () => console.log('Socket connected!'));
    socket.on('disconnect', () => console.log('Socket disconnect'));
    socket.on('status', data => {
        console.log('recieved raw data: + data');
        currentAnimation = getLedStatusByString(data);
    });

    while (true) {
        console.log('restarting loop with animation: ' + currentAnimation);
        switch (currentAnimation) {
            case LedAnimation.WHITE:
                await staticColorAnimation(WHITE, ledController);
                break;
            case LedAnimation.ORANGE:
                await staticColorAnimation(ORANGE, ledController);
                break;
            case LedAnimation.RED:
                await staticColorAnimation(RED, ledController);
                break;
            default:
                await staticColorAnimation(WHITE, ledController);
                break;
        }
    }
})();