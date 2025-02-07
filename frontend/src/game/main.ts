import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import GridEngine from "grid-engine";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    backgroundColor: "#0d0c16",
    scene: [Boot, Preloader, MainGame],
    plugins: {
        scene: [
            {
                key: "gridEngine",
                plugin: GridEngine,
                mapping: "gridEngine",
            },
        ],
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    input: {
        mouse: {
            preventDefaultWheel: false,
        },
        touch: {
            capture: false,
        },
    },
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });
    return game;
};

export default StartGame;
