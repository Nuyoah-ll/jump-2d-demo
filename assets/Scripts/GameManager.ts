import { _decorator, CCInteger, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;
import { BLOCK_SIZE } from './PlayerController';

enum BlockType {
    BT_NONE,
    BT_STONE,
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Prefab })
    boxPrefab: Prefab = null

    @property({ type: CCInteger })
    roadLength: number = 50

    private _road: BlockType[] = [];

    start() {
        this.generateRoad();
    }

    update(deltaTime: number) {

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

