import { _decorator, Node, Component, SpriteFrame, Sprite, Enum, random } from 'cc';
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
    private _handler2: Function;

    private _x: number = 0;
    private _y: number = 0;
    private _idx: number = 0;

    onLoad() {
        console.log('fruit item load');
        this._handler = this.click;
        this._handler2 = this.click2;
        this.node.on(Node.EventType.TOUCH_START, this._handler, this);
        this.node.on(Node.EventType.TOUCH_START, this._handler2, this);
    }

    start() {
        this.schedule(()=>{
            let idx = (random()*100000) % this.fruits.length | 0;
            this.icon.spriteFrame = this.fruits[idx].icon;
        }, 1);
    }

    onDestroy() {
        console.log('fruit item destory');
        this.node.off(Node.EventType.TOUCH_START, this._handler, this);
        this.node.off(Node.EventType.TOUCH_START, this._handler2, this);
    }

    click(ev: Event) {
        console.log('item click');
        
    }

    click2(ev: Event) {
        console.log('item click2');
    }
}