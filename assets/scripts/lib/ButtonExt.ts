import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('ButtonExt')
export class ButtonExt extends Component {

    private _handler: Function = null!;

    onLoad() {
        this._handler = this.soundEffect;

        this.node.on(Node.EventType.TOUCH_START, this._handler, this);
    }

    onDestroy() {
        console.log(this.node.name+' off event');
        this.node.off(Node.EventType.TOUCH_START, this._handler, this);
    }

    soundEffect() {
        console.log(this.node.name+' button ext sound effect call!');
        AudioMgr.inst.playOneShot('sounds/button');
    }
}


