import { _decorator, Component, director, sys, Prefab, Label, 
    instantiate, UITransform, view, Vec2, Node, tween, Vec3, Tween, find } from 'cc';
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

    @property(Label)
    stageLabel: Label = null!;

    fruits: Node = null;

    private _highScore: number = 123;
    private _stage: number = 0;
    private _target: number = 0;

    private _curScore: number = 0;
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
    private _actives: FruitItem[] = [];
    
    private readonly __highScoreKey = 'highScore';
    private readonly __stageKey = 'stage';

    onLoad() {
        this._highScore = parseInt(sys.localStorage.getItem(this.__highScoreKey) || '0');
        this._stage = parseInt(sys.localStorage.getItem(this.__stageKey) || '0');
        if (this._stage == 0) this._stage = 1;
        this._target = this._stage * 200;
    }

    onDestory() {
        AudioMgr.inst.stop();
    }

    start() {
        this.fruits = find('/Canvas/fruits');
        // this.fruits.on(Node.EventType.TOUCH_START, ()=>{
        //     return false;
        // });
        this.highScoreLabel.string = this._highScore.toString();
        this.highStageLabel.string = this._stage.toString();
        this.highTargetLabel.string = this._target.toString();
        this.curScoreLabel.string = this._curScore.toString();
        this.activeScoreLabel.string = '';

        // let width = this.node.getComponent(UITransform)?.contentSize.width;
        // let height = this.node.getComponent(UITransform)?.contentSize.height;

        let size = view.getVisibleSize();
        this._vWidth = size.width;
        this._vHeight = size.height;

        this._fruitWidth = instantiate(this.fruitPrefab).getComponent(UITransform)?.contentSize.width;

        this._matrixLBX = (this._vWidth-this._fruitWidth*this._xCount-(this._yCount-1)*this._fruitGap) / 2;
        this._matrixLBY = (this._vHeight-this._fruitWidth*this._yCount-(this._xCount-1)*this._fruitGap) / 2 - 30;

        this._matrixLBX -= this._vWidth/2;
        this._matrixLBY -= this._vHeight/1.83;

        console.log(`play ${this._vWidth}, ${this._vHeight}, ${this._fruitWidth}, ${this._matrixLBX}, ${this._matrixLBY}`);

        this.initMartix();
        
        // this.createAndDropFruit(1,2);
        
        AudioMgr.inst.play('music/mainbg', .5, true);
    }

    initMartix() {
        this._matrix.clear();
        this._actives = [];

        for (let y = 1; y <= this._yCount; y++) {
            for (let x = 1; x <= this._xCount; x++) {
                if (y == 1 && x == 2) {                    
                    this.createAndDropFruit(x, y, this._matrix.get(1)?.idx);
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
        this.fruits.addChild(newFruit);
        // this.node.addChild(newFruit);

        newFruit.on(Node.EventType.TOUCH_END, ()=>{
            // console.log(`click ${x}, ${y}, ${fruitIndex}`);
            if (newFruit.getComponent(FruitItem).isActive) {
                let musicIdx = this._actives.length;
                if (musicIdx < 2) musicIdx = 2;
                if (musicIdx > 9) musicIdx = 9;
                AudioMgr.inst.playOneShot('music/broken'+musicIdx, .75);
                
                this.removeActivedFruits();
                this.dropFruits();
                this.checkNextStage();

            } else {
                this.inactive();
                // newFruit.getComponent(FruitItem).setActive(true);
                this.activeNeighbor(newFruit.getComponent(FruitItem));
                this.showActivesScore();
                AudioMgr.inst.playOneShot('music/itemSelect');
            }
            // newFruit.removeFromParent();
        });
    }

    positionOfFruit(x: number, y: number): Vec2 {
        const px = this._matrixLBX + (this._fruitWidth + this._fruitGap) * (x - 1) + this._fruitWidth / 2;
        const py = this._matrixLBY + (this._fruitWidth + this._fruitGap) * (y - 1) + this._fruitWidth / 2;
        return new Vec2(px, py);
    }

    inactive() {
        for (let i = 0; i < this._actives.length; i++) {
            this._actives[i].getComponent(FruitItem)?.setActive(false);
        }
        this._actives = [];
    }

    activeNeighbor(fruit: FruitItem) {
        if (!fruit.isActive) {
            fruit.setActive(true);
            this._actives.push(fruit);
        }

        if (fruit.x - 1 >= 1) {
            let leftItem = this._matrix.get((fruit.y-1)*this._xCount+fruit.x-1);
            if (!leftItem.isActive && leftItem.idx==fruit.idx) {
                leftItem.setActive(true);
                this._actives.push(leftItem);
                this.activeNeighbor(leftItem);
            }
        }

        if (fruit.x + 1 <= this._xCount) {
            let rightItem = this._matrix.get((fruit.y-1)*this._xCount+fruit.x+1);
            if (!rightItem.isActive && rightItem.idx==fruit.idx) {
                rightItem.setActive(true);
                this._actives.push(rightItem);
                this.activeNeighbor(rightItem);
            }
            
        }

        if (fruit.y + 1 <= this._yCount) {
            let upItem = this._matrix.get(fruit.y*this._xCount+fruit.x);
            if (!upItem.isActive && upItem.idx==fruit.idx) {
                upItem.setActive(true);
                this._actives.push(upItem);
                this.activeNeighbor(upItem);
            }
        }

        if (fruit.y - 1 >= 1) {
            let downItem = this._matrix.get((fruit.y-2)*this._xCount+fruit.x);
            if (!downItem.isActive && downItem.idx==fruit.idx) {
                downItem.setActive(true);
                this._actives.push(downItem);
                this.activeNeighbor(downItem);
            }
        }
    }

    showActivesScore() {
        if (this._actives.length == 1) {
            this.inactive();
            this.activeScoreLabel.string = '';
            this._activeScore = 0;
            return;
        }

        let len = this._actives.length;
        this._activeScore = (this._scoreStart*2+this._scoreStep*(len-1))*len/2;
        this.activeScoreLabel.string = `${len} 连消，得分 ${this._activeScore}`;
    }

    removeActivedFruits() {
        let score = this._scoreStart;
        for (let i = 0; i < this._actives.length; i++) {
            let fruit = this._actives[i];
            this._matrix.delete((fruit.y-1)*this._xCount+fruit.x);
            fruit.node.removeFromParent();
        }

        this._actives = [];
        this._curScore += this._activeScore;
        this.curScoreLabel.string = this._curScore.toString();

        this.activeScoreLabel.string = '';
        this._activeScore = 0;
    }

    dropFruits() {
        let emptyInfo: Map<number, number> = new Map<number, number>();
        for (let x = 1; x <= this._xCount; x++) {
            let removedFruits = 0;
            let newY = 0;
            for (let y = 1; y <= this._yCount; y++) {
                let key = (y - 1) * this._xCount + x;
                if (this._matrix.has(key)) {
                    let temp = this._matrix.get(key);
                    if (removedFruits > 0) {
                        newY = y - removedFruits;
                        this._matrix.set((newY-1)*this._xCount+x, temp);
                        temp.y = newY;
                        this._matrix.delete((y-1)*this._xCount+x);

                        let pos = this.positionOfFruit(x, newY);
                        let speed = (temp.node.getPosition().y-pos.y) / (1.5*this._vHeight);
                        Tween.stopAllByTarget(temp.node);
                        tween(temp.node).to(speed, { position: new Vec3(pos.x, pos.y) }).start();
                    }
                } else {
                    removedFruits++;
                }
            }
            emptyInfo.set(x, removedFruits);
        }

        for (let x = 1; x <= this._xCount; x++) {
            if (!emptyInfo.has(x)) continue;
            for (let y = this._yCount-emptyInfo.get(x)+1; y <= this._yCount; y++) {
                this.createAndDropFruit(x, y);
            }
        }
    }

    checkNextStage() {
        if (this._curScore < this._target) {
            return;
        }

        AudioMgr.inst.playOneShot('music/wow');
        if (this._curScore >= this._highScore) {
            this._highScore = this._curScore;
        }
        this._stage++;
        this._target *= 200;

        sys.localStorage.setItem(this.__highScoreKey, this._highScore.toString());
        sys.localStorage.setItem(this.__stageKey, this._stage.toString());
        this.stageLabel.string = `恭喜过关！\n最高得分：${this._highScore}`;

        find('/Canvas/nextStage').active = true;    
    }

    changeScene() {
        AudioMgr.inst.stop();
        director.loadScene('main');
    }

    reloadScene() {
        AudioMgr.inst.stop();
        director.loadScene('play');
    }
}


