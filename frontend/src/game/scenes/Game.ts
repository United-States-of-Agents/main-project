import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import GridEngine, { Direction } from "grid-engine";

const AGENTS = [
    { id: "Marcus", position: { x: 9, y: 30 }, walkingAnimationMapping: 0 },
    { id: "Julie", position: { x: 13, y: 11 }, walkingAnimationMapping: 1 },
    { id: "Leonardo", position: { x: 85, y: 11 }, walkingAnimationMapping: 2 },
    { id: "Alan", position: { x: 87, y: 30 }, walkingAnimationMapping: 4 },
];

export class Game extends Scene {
    gridEngine!: GridEngine;
    interactionKey!: Phaser.Input.Keyboard.Key;
    shiftKey!: Phaser.Input.Keyboard.Key;
    agentContainers: Record<string, Phaser.GameObjects.Container> = {};
    isChatting = false;
    normalSpeed = 6; // Default movement speed
    sprintSpeed = 10; // Sprinting speed

    constructor() {
        super("Game");
    }

    preload() {
        this.load.spritesheet("player", "assets/characters.png", {
            frameWidth: 52,
            frameHeight: 72,
        });
    }

    create() {
        const map = this.make.tilemap({ key: "map" });
        const groundTiles = map.addTilesetImage("MyTerrain2", "groundTiles");
        const worldTiles = map.addTilesetImage("MyTerrain", "worldTiles");

        if (!groundTiles || !worldTiles) {
            console.error(
                "Tileset not found! Check if the name matches in Tiled."
            );
            return;
        }

        const groundLayer = map.createLayer("Ground", [
            groundTiles,
            worldTiles,
        ]);
        const worldLayer = map.createLayer("World", [groundTiles, worldTiles]);

        if (!groundLayer || !worldLayer) {
            console.error(
                "Layer not found! Check if the layer name matches in Tiled."
            );
            return;
        }

        const playerSprite = this.add.sprite(0, 0, "player");
        const playerContainer = this.add.container(0, 0, [playerSprite]);

        this.cameras.main.startFollow(playerContainer, true);
        this.cameras.main.setFollowOffset(
            -playerSprite.width / 2,
            -playerSprite.height / 2
        );
        this.cameras.main.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        AGENTS.forEach((agent) => {
            const agentSprite = this.add.sprite(0, 0, "player");
            const dialogueText = this.add
                .text(0, -20, "", {
                    fontSize: "12px",
                    color: "#000",
                    backgroundColor: "#fff",
                    padding: { x: 5, y: 5 },
                })
                .setVisible(false);

            const agentContainer = this.add.container(0, 0, [
                agentSprite,
                dialogueText,
            ]);
            this.agentContainers[agent.id] = agentContainer;
        });

        const gridEngineConfig = {
            characters: [
                {
                    id: "player",
                    sprite: playerSprite,
                    container: playerContainer,
                    walkingAnimationMapping: 6,
                    startPosition: { x: 56, y: 13 },
                    speed: this.normalSpeed,
                },
                ...AGENTS.map((agent) => ({
                    id: agent.id,
                    sprite: this.agentContainers[agent.id]
                        .list[0] as Phaser.GameObjects.Sprite,
                    walkingAnimationMapping: agent.walkingAnimationMapping,
                    startPosition: agent.position,
                    container: this.agentContainers[agent.id],
                })),
            ],
        };

        this.gridEngine.create(map, gridEngineConfig);

        // Make agents move randomly
        AGENTS.forEach((agent, i) => {
            this.gridEngine.moveRandomly(agent.id, 3000 + i * 500, 15);
        });

        // Keyboard input
        this.interactionKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );
        this.shiftKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SHIFT
        );

        // Event listeners
        this.events.on(
            "agent-message",
            ({ agentId, text }: { agentId: string; text: string }) => {
                const agentContainer = this.agentContainers[agentId];
                if (!agentContainer) return;

                const dialogueText = agentContainer.getAt(
                    1
                ) as Phaser.GameObjects.Text;
                dialogueText.setText(text);
                dialogueText.setVisible(true);

                this.time.delayedCall(3000, () => {
                    dialogueText.setVisible(false);
                });
            }
        );

        EventBus.on("disable-game-input", () => {
            this.input.keyboard!.enabled = false; // Disable Phaser keyboard
        });

        EventBus.on("enable-game-input", () => {
            this.input.keyboard!.enabled = true; // Re-enable Phaser keyboard
        });

        EventBus.on("chat-closed", () => {
            this.isChatting = false;
        });

        EventBus.emit("current-scene-ready", this);
    }

    update() {
        if (this.isChatting) return; // Prevent movement during chat

        const speed = this.shiftKey.isDown
            ? this.sprintSpeed
            : this.normalSpeed;
        this.gridEngine.setSpeed("player", speed);

        const cursors = this.input.keyboard!.createCursorKeys();
        if (cursors.left.isDown) {
            this.gridEngine.move("player", Direction.LEFT);
        } else if (cursors.right.isDown) {
            this.gridEngine.move("player", Direction.RIGHT);
        } else if (cursors.up.isDown) {
            this.gridEngine.move("player", Direction.UP);
        } else if (cursors.down.isDown) {
            this.gridEngine.move("player", Direction.DOWN);
        }

        if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
            this.checkInteraction();
        }
    }

    checkInteraction() {
        if (this.isChatting) return;

        const playerPos = this.gridEngine.getPosition("player");

        for (const agent of AGENTS) {
            const agentPos = this.gridEngine.getPosition(agent.id);
            const distance =
                Math.abs(playerPos.x - agentPos.x) +
                Math.abs(playerPos.y - agentPos.y);

            if (distance === 1) {
                // Ensure game knows a chat is starting
                this.isChatting = true;

                // Emit event with agent info
                EventBus.emit("agent-interaction", agent.id);

                return;
            }
        }
    }
}
