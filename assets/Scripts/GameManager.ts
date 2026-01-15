import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { BLOCK_SIZE, PlayerController } from './PlayerController';

enum BlockType {
    BT_NONE,
    BT_STONE,
}

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Prefab })
    boxPrefab: Prefab = null

    @property({ type: CCInteger })
    roadLength: number = 50

    @property(Node)
    startMenu: Node = null

    @property(Node)
    resultMenu: Node = null

    @property({ type: PlayerController })
    playerController: PlayerController = null

    @property(Label)
    stepLabel: Label = null

    @property(Label)
    titleLabel: Label = null

    private _road: BlockType[] = [];
    private _curState: GameState = GameState.GS_INIT;

    start() {
        this.init();
        this.playerController.node.on("JumpEnd", this.onJumpEnd, this);
    }

    onJumpEnd(moveIndex: number) {
        this.checkResult(moveIndex);
    }

    checkResult(moveIndex: number) {
        console.log("checkResult", moveIndex);
        if (moveIndex < this.roadLength) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {   //跳到了空方块上
                this.titleLabel.string = "掉坑里了"
                this.stepLabel.string = moveIndex.toString();
                this.resultMenu.active = true;
            }
        } else {    // 跳过了最大长度            
            this.titleLabel.string = "成功通过"
            this.stepLabel.string = moveIndex.toString();
            this.resultMenu.active = true;
        }
    }

    update(deltaTime: number) {

    }

    init() {
        this._curState = GameState.GS_INIT;
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        if (this.resultMenu) {
            this.resultMenu.active = false;
        }
        if (this.playerController) {
            this.playerController.setInputActive(false)
            this.playerController.node.setPosition(Vec3.ZERO)
        }
        if (this.stepLabel) {
            this.stepLabel.string = '0';
        }
        this.playerController.reset();
    }

    startPlaying() {
        this._curState = GameState.GS_PLAYING;
        if (this.startMenu) {
            this.startMenu.active = false;
        }
        if (this.resultMenu) {
            this.resultMenu.active = false;
        }
        setTimeout(() => {
            this.playerController.setInputActive(true)
            this.playerController.node.setPosition(Vec3.ZERO);
        }, 300);
        if (this.stepLabel) {
            this.stepLabel.string = '0';
        }
        this.generateRoad();
    }

    onStartButtonClicked() {
        this.startPlaying()
    }

    onRestartButtonClicked() {
        this.init();
        this.startPlaying();
    }

    generateRoad() {
        this.node.removeAllChildren();
        this._road = [];
        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; i++) {
            // 如果前一个是坑，则当前必须生成石头，不然角色就肯定跳不过去
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                // 随机生成石头或者是坑
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this._road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    spawnBlockByType(blockType: BlockType): Node | null {
        if (!this.boxPrefab) {
            return null;
        }
        let block: Node = instantiate(this.boxPrefab);
        if (blockType === BlockType.BT_STONE) {
            return block
        }
        return null
    }
}

