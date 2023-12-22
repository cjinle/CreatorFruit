import { _decorator, Component, random, director } from 'cc';
import { AudioMgr } from './lib/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('MainScene')
export class MainScene extends Component {

    onLoad() {
        director.preloadScene('play',()=>{
           console.log('play scene preload finish');
        });
    }

    start() {
        
    }

    changeScene() {
        // AudioMgr.inst.playOneShot('music/btnStart');
        director.loadScene('play');
    }
}


