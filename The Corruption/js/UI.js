import {canvas, ctx} from '/canvas.js'
import {init as initEle, reset, render, elements} from '/cvsEle.js'

import loading from '/screens/loading.js'
import error from '/screens/error.js'
import mainMenu from '/screens/mainmenu.js'
import inGame from '/screens/ingame.js'
import editor from '/screens/editor.js'

initEle(canvas, ctx)

function toggleFS(){
	return document.fullscreenElement
		?document.exitFullscreen()
		:document.body.requestFullscreen()
}
global('ToggleFS', toggleFS)

const screens={ //要不写成类？防止属性残余
	loading,
	error,
	mainMenu,
	inGame,
	editor
}
const UI={
	current: null,
	bg_music: null,
	goto(name, config){
		var screen=screens[name]
		if(!screen)throw new Error(`no screen named '${name}'`)
		this.clear()
		screen.construct(config)
		this.current=screen
		return screen
	},
	clear(){
		this.current=null
		this.bg_music?.pause()
		this.bg_music=null
		reset()
	},
	render(){
		this.current?.onPreRender?.()
		render()
	},
	update(dt){ //主要操作在事件监听器中完成了
		this.current.onUpdate?.()
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