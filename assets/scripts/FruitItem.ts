import { _decorator, Node, Component, SpriteFrame, Sprite, Enum, random, Tween, tween, Vec3, v3, UITransform } from 'cc';
import { AudioMgr } from './lib/AudioMgr'
const { ccclass, property } = _decorator;


export enum ETest {
    None = 0,
    ONe = 1,
    Two = 2
}

@ccclass('FruitSpriteFrame')
export class FruitSpriteFrame {
    @property(SpriteFrame)
    icon: SpriteFrame|null = null;
    @property(SpriteFrame)
    icon2: SpriteFrame|null = null;
}

@ccclass('FruitItem')
export class FruitItem extends Component {

    @property(Sprite)
    icon: Sprite = null!;

    @property([FruitSpriteFrame])
    fruits: FruitSpriteFrame[] = [];

    @property({ type: Enum(ETest) })
    testArray: ETest[] = [];

    private _handler: Function;

    x: number = 0;
    y: number = 0;
    idx: number = 0;
    isActive: boolean = false;
    width: number = 0;

    onLoad() {
        console.log('fruit item load');
        this._handler = this.click;
        // this.node.on(Node.EventType.TOUCH_START, this._handler, this);
    }

    start() {
        // this.scheduleOnce(()=>{
        //     this._idx = (random()*100000) % this.fruits.length | 0;
        //     this.icon.spriteFrame = this.fruits[this._idx].icon;
        // }, 1);
    }

    onDestroy() {
        console.log('fruit item destory');
        // this.node.off(Node.EventType.TOUCH_START, this._handler, this);
    }

    create(x: number, y: number, idx?: number) {
        // console.log(`fruit item create ${x}, ${y}, ${idx}`);
        this.x = x;
        this.y = y;
        this.isActive = false;        
        if (typeof idx == 'undefined') {
            idx = (random() * 100000) % this.fruits.length | 0;
        }

        this.idx = idx;
        this.icon.spriteFrame = this.fruits[this.idx].icon;
        this.width = this.node.getComponent(UITransform).width;
    }

    setActive(active: boolean) {
        this.isActive = active;
        if (active) {
            this.icon.spriteFrame = this.fruits[this.idx].icon2;
        } else {
            this.icon.spriteFrame = this.fruits[this.idx].icon;
        }
        if (active) {
            Tween.stopAllByTarget(this.node);
            let t1 = tween(this.node).to(0.1, { scale: new Vec3(1.1, 1.1, 1.1) });
            let t2 = tween(this.node).to(0.05, { scale: v3(1, 1, 1) });
            tween(this.node).sequence(t1, t2).start();
        } 
        // this.node.removeFromParent();
    }

    click(ev: Event) {
        console.log(`fruit item click ${this.x}, ${this.y}, ${this.idx}`);
        // this.setActive(!this._isActive);
        // if (this._isActive) {
        //     AudioMgr.inst.play('music/itemSelect');
        // }
    }

}