import {canvas, ctx} from './canvas.js'
import {init as initEle, reset, render, elements} from './ui/cvsEle.js'

import loading from './ui/loading.js'
import mainMenu from './ui/mainmenu.js'
import inGame from './ui/ingame.js'
import editor from './ui/editor.js'

initEle(canvas,ctx)

function toggleFS(){
	return document.fullscreenElement
		?document.exitFullscreen()
		:document.body.requestFullscreen()
}
global('ToggleFS', toggleFS)

const screens={ //要不写成类？防止属性残余
	loading,
	mainMenu,
	inGame,
	editor
}
const UI={
	goto(name, config){
		var screen=screens[name]
		if(!screen)throw new Error('无'+name)
		this.clear()
		screen.construct(config)
		this.current=screen
		return screen
	},
	clear(){
		this.current=null
		reset()
	},
	render(){
		this.current.onPreRender?.()
		render()
	},
	update(dt){ //主要操作在事件监听器中完成了
		this.current.onUpdate?.()
	}
}

export default UI