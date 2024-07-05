import {canvas,ctx} from './canvas.js'
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

const screens={
	loading:loading,
	mainMenu:mainMenu,
	inGame:inGame,
	editor:editor
}
const UI={
	goto(name, config){
		var screen=screens[name]
		if(!screen)throw new Error('无'+name)
		reset()
		screen.construct(config)
		this.current=screen
		return screen
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