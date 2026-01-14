import { _decorator, Animation, Component, EventMouse, Input, input, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40; // 每个方块的尺寸

@ccclass('PlayerController')
export class PlayerController extends Component {
    // 是否正在跳跃中
    private _startJump: boolean = false
    // 跳跃的步数，0为初始状态，1步或2步
    private _jumpStep: 0 | 1 | 2 = 0
    // 一次跳跃所花费的时间，单位为秒，默认值为0，实际在跳跃开始的时候会根据跳跃步数以及动画时长来赋值，在本demo中，跳跃1步和2步的动画时长分别为0.25s和0.5s，对应帧数为15和30
    private _jumpTime: number = 0
    // 当前跳跃时间
    private _curJumpTime: number = 0
    // 跳跃时的移动速度
    private _curJumpSpeed: number = 0
    // 当前的位置
    private _curPos: Vec3 = new Vec3()
    // 位移向量，用来记录某一帧的位移
    private _deltaPos: Vec3 = new Vec3(0, 0, 0)
    // 目标位置
    private _targetPos: Vec3 = new Vec3()

    // 通过property装饰器，可以在编辑器的PlayerController组件中暴露该属性，从而可以可视化的拖拽赋值，在本demo里，这里将Body的两个cc.Animation对象拖拽赋值给该属性
    @property(Animation)
    bodyAnimation: Animation = null

    start() {
        // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
    }

    // deltaTime为一帧的时间，单位为秒，当fps为60时，deltaTime为1/60=0.016667
    update(deltaTime: number) {
        if (this._startJump) {
            // 组件每执行一次update生命周期，则代表一帧的时间，所以这里累加一帧的时间，就代表实际跳跃的时间
            this._curJumpTime += deltaTime
            // 如果实际跳跃时间大于等于一次的跳跃时间了，那么证明跳跃结束，所以就将当前节点移动到目标位置，并结束跳跃状态
            if (this._curJumpTime >= this._jumpTime) {
                this.node.setPosition(this._targetPos)
                this._startJump = false
            } else {
                // 基于节点的位置，更新_curPos属性，确保_curPos属性与节点的位置保持一致
                // todo 这一步如果不要会怎么样
                this.node.getPosition(this._curPos)
                // 计算这一帧跳跃过程中的位移值
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                // 应用这个位移
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                // 将位移设置给角色
                this.node.setPosition(this._curPos);
            }
        }

    }

    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this)
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1)
        }
        else if (event.getButton() === 2) {
            this.jumpByStep(2)
        }
    }

    jumpByStep(step: 1 | 2) {
        if (this._startJump) {
            return
        }
        // 开始跳跃
        this._startJump = true;
        // 设置跳跃步数
        this._jumpStep = step;
        // 重置开始跳跃的时间
        this._curJumpTime = 0
        // 基于动画的时间来调整跳跃时间
        this._jumpTime = step === 1 ? this.bodyAnimation.getState("oneStep").duration : this.bodyAnimation.getState("twoStep").duration
        // 不同跳跃步数对应的跳跃时间不一致，这里设置这一次跳跃的跳跃速度
        this._curJumpSpeed = this._jumpStep * BLOCK_SIZE / this._jumpTime;
        // 更新角色当前的位置
        // 注意，在getPosition源码中，如果传了out参数，那么就会将this.node的当前位置设置给out参数上，并返回out参数
        this.node.getPosition(this._curPos)
        // 设置这一次跳跃的目标位置，往水平x轴方向移动this._jumpStep的距离
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0))

        if (this.bodyAnimation) {
            if (this._jumpStep === 1) {
                this.bodyAnimation.play('oneStep')
            } else if (this._jumpStep === 2) {
                this.bodyAnimation.play('twoStep')
            }
        }
    }
}

