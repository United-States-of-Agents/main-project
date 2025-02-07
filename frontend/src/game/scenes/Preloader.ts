import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        this.load.on("progress", (progress: number) => {
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("groundTiles", "Room_Builder_free_32x32.png");
        this.load.image("worldTiles", "Interiors_free_32x32.png");
        this.load.tilemapTiledJSON("map", "defaultmap.json");
    }

    create() {
        this.scene.start("Game");
    }
}
