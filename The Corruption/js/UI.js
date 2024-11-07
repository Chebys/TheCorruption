import {canvas, ctx} from '/canvas.js'
import {init as initEle, reset, render, elements} from '/cvsEle.js'

import Loading from '/screens/loading.js'
import ErrorScreen from '/screens/error.js'
import MainMenu from '/screens/mainmenu.js'
import InGame from '/screens/ingame.js'
import Editor from '/screens/editor.js'

initEle(canvas, ctx)

function toggleFS(){
	return document.fullscreenElement
		?document.exitFullscreen()
		:document.body.requestFullscreen()
}
global('ToggleFS', toggleFS)

const screens = { //todo: 写成类
	Loading,
	Error: ErrorScreen,
	MainMenu,
	InGame,
	Editor
}
const UI={
	current: null,
	bg_music: null,
	goto(name, config){
		var screen = screens[name]
		if(!screen)throw new Error(`no screen named '${name}'`)
		this.clear()
		this.current = new screen(config)
		return this.current
	},
	clear(){
		this.current=null
		this.bg_music?.pause()
		this.bg_music=null
		reset()
	},
	render(){
		this.current?.OnPreRender()
		render()
	},
	update(dt){ //主要操作在事件监听器中完成了
		this.current?.OnUpdate()
	},
	
	playBGMusic(name){
		this.bg_music?.pause()
		var audio=GetAudio(name)
		if(audio){
			audio.play()
			this.bg_music=audio
		}
	}
}

export default UI