import { _decorator, Component, director, sys, Prefab, Label, 
    instantiate, UITransform, view, Vec2, Node, tween, Vec3 } from 'cc';
import { FruitItem } from './FruitItem';
import { AudioMgr } from './lib/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('PlayScene')
export class PlayScene extends Component {

    @property(Prefab)
    fruitPrefab: Prefab = null!;

    @property(Label)
    highScoreLabel: Label = null!;
    
    @property(Label)
    highStageLabel: Label = null!;

    @property(Label)
    highTargetLabel: Label = null!;

    @property(Label)
    curScoreLabel: Label = null!;

    @property(Label)
    activeScoreLabel: Label = null!;

    private _highScore: number = 0;
    private _stage: number = 0;
    private _target: number = 0;

    private _curScore: number = 1;
    private _xCount: number = 8;
    private _yCount: number = 8;
    private _fruitGap: number = 0;
    private _scoreStart: number = 5;
    private _scoreStep: number = 10;
    private _activeScore: number = 0;

    private _matrixLBX: number = 0;
    private _matrixLBY: number = 0;
    private _fruitWidth: number = 0;
    private _vWidth: number = 0;
    private _vHeight: number = 0;
    private _matrix: Map<number, FruitItem> = new Map<number, FruitItem>();
    private _actives: Map<number, FruitItem> = new Map<number, FruitItem>(); 


    onLoad() {
        this._highScore = parseInt(sys.localStorage.getItem('highScore'));
        this._stage = parseInt(sys.localStorage.getItem('stage'));
        if (this._stage == 0) this._stage = 1;
        this._target = this._stage * 200;
    }

    start() {
        // this.highScoreLabel.string = this._highScore.toString();
        // this.highStageLabel.string = this._stage.toString();
        // this.highTargetLabel.string = this._target.toString();
        // this.curScoreLabel.string = this._curScore.toString();
        // this.activeScoreLabel.string = '';

        // let width = this.node.getComponent(UITransform)?.contentSize.width;
        // let height = this.node.getComponent(UITransform)?.contentSize.height;

        let size = view.getVisibleSize();
        this._vWidth = size.width;
        this._vHeight = size.height;
        this._fruitWidth = instantiate(this.fruitPrefab).getComponent(UITransform)?.contentSize.width;

        this._matrixLBX = (this._vWidth-this._fruitWidth*this._xCount-(this._yCount-1)*this._fruitGap) / 2;
        this._matrixLBY = (this._vHeight-this._fruitWidth*this._yCount-(this._xCount-1)*this._fruitGap) / 2 - 30;

        this._matrixLBX -= this._vWidth/2;
        this._matrixLBY -= this._vHeight/2;

        console.log(`play ${this._vWidth}, ${this._vHeight}, ${this._fruitWidth}, ${this._matrixLBX}, ${this._matrixLBY}`);

        this.initMartix();
        
        // this.createAndDropFruit(1,2);
        
        // AudioMgr.inst.play('music/mainbg');
    }

    initMartix() {
        this._matrix.clear();
        this._actives.clear();

        for (let y = 1; y <= this._yCount; y++) {
            for (let x = 1; x <= this._xCount; x++) {
                if (y == 1 && x == 2) {                    
                    this.createAndDropFruit(x, y, this._matrix.get(1)?.getIdx());
                } else {
                    this.createAndDropFruit(x, y);
                }
            }
        }

    }

    createAndDropFruit(x: number, y: number, fruitIndex?: number) {
        let newFruit = instantiate(this.fruitPrefab);
        newFruit.getComponent(FruitItem).create(x, y, fruitIndex);
        let pos = this.positionOfFruit(x, y);
        let startPos = new Vec2(pos.x, pos.y+this._vHeight/2);
        newFruit.setPosition(startPos.x, startPos.y);
        let speed = startPos.y / (1.5*this._vHeight);
        tween(newFruit).to(speed, { position: new Vec3(pos.x, pos.y)}).start();
        this._matrix.set((y - 1) * this._xCount + x, newFruit.getComponent(FruitItem));
        this.node.addChild(newFruit);

        newFruit.on(Node.EventType.TOUCH_END, ()=>{
            console.log(`click ${x}, ${y}, ${fruitIndex}`);
            // newFruit.removeFromParent();
        });
    }

    positionOfFruit(x: number, y: number): Vec2 {
        const px = this._matrixLBX + (this._fruitWidth + this._fruitGap) * (x - 1) + this._fruitWidth / 2;
        const py = this._matrixLBY + (this._fruitWidth + this._fruitGap) * (y - 1) + this._fruitWidth / 2;
        return new Vec2(px, py);
    }

    changeScene() {
        director.loadScene('main');
    }
}


