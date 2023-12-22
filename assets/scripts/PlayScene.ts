import { _decorator, Component, director, sys, Prefab, Label, instantiate, random } from 'cc';
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
    private _scoreStart: number = 0;
    private _scoreStep: number = 0;
    private _activeScore: number = 0;

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

        // AudioMgr.inst.play('music/mainbg');

        
    }

    createAndDropFruit(x: number, y: number, fruitIndex?: number) {
        let newFruit = instantiate(this.fruitPrefab);
        newFruit.setPosition(0, 0);

    }

    

    changeScene() {
        director.loadScene('main');
    }
}


