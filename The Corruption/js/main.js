import './global.js'
import {audios,loadAssets} from './assets.js'
import {canvas} from './canvas.js'
//import strings from './strings.js'
import {UI_loading, UI_mainMenu, UI_inGame as UI, UI_editor} from './UI.js'
import './map.js'
import renderMap from './render.js'
import ctrl from './control.js'

addEventListener('mouseup',e=>ctrl.mousedown=false)//考虑在canvas外松开的情况

function mainMenu(){
	UI_mainMenu.construct()
	UI_mainMenu.setOnStartGame(startGame)
	UI_mainMenu.setOnEditor(_=>{
		var l=parseInt(prompt('输入地图边长（建议不超过30）'))
		l&&startEditor(l)
	})
}

function startGame(){
	var bgmusic=audios['bg.mp3']
	bgmusic.play(1)
	UI_loading.push('加载地图')
	TheMap.load({ox:canvas.width/2, oy:0, grids:gridData, ents:entData})
	UI.construct() //优先为UI添加事件监听
	UI.setOnPause(_=>{
		bgmusic.pause()
		cancelAnimationFrame(currentFrame)
	})//取消监听？
	UI.setOnContinue(continu)
	UI.setOnExit(exit)
	canvas.addEventListener('mousedown',clickHandler)
	canvas.addEventListener('mousemove',dragMap)
	TheMap.state='inGame' //有用吗？
	
	var currentFrame,t0
	currentFrame=requestAnimationFrame(main)
	
	function main(t){
		var dt = t&&t0 ? (t-t0)/1000 : 0
		if(dt>1)dt=0 //避免longUpdate的一个下策
		t0=t
		renderMap()
		UI.pushStats(TheMap.stats)
		UI.render()
		switch(TheMap.state){
			case 'lose':lose();return
			case 'win':win();return
		}
		TheMap.ents_to_update.forEach(e=>e.update(dt))
		if(ctrl.sel?.ignored)unsel()
		currentFrame=requestAnimationFrame(main)
	}
	function lose(){
		
	}
	function win(){
		
	}
	function continu(){
		bgmusic.play()
		main()
	}
	function exit(){
		cancelAnimationFrame(currentFrame)
		TheMap.state=null
		ctrl.reset()
		canvas.removeEventListener('mousedown',clickHandler)
		canvas.removeEventListener('mousemove',dragMap)
		mainMenu()
	}
	
	function dragMap(e){
		if(ctrl.mousedown){
			let [dx,dy]=canvas.getPosFromDoc(e.movementX,e.movementY)
			TheMap.ox+=dx
			TheMap.oy+=dy
		}
	}
	function clickHandler(e){//处理地图点击
		if(e.button){//右键
			unsel()
			return
		}
		ctrl.mousedown=true
		var [x,y]=canvas.getMousePos(e)
		var [type,obj]=TheMap.click(...getMapPos(x,y))
		if(type){
			ctrl.select(type,obj)
			UI.showInfo(ctrl.getData())
		}else{
			unsel()
		}
	}
	function unsel(){
		ctrl.reset()
		UI.clearInfo()
	}
}

function startEditor(l){
	UI_editor.construct()
	TheMap.loadBlank(l)
	UI_editor.setOnMapChange(_=>{
		renderMap()
		UI_editor.render()
	})
	UI_editor.setOnSave(_=>{
		var data=TheMap.export()
		localStorage.setItem('mapData',JSON.stringify(data))
		alert('已保存至localStorage.mapData')
	})
	UI_editor.setOnExit(_=>{
		ctrl.reset()
		canvas.removeEventListener('mousedown',clickHandler)
		canvas.removeEventListener('mousemove',dragMap)
		mainMenu()
	})
	
	canvas.addEventListener('mousedown',clickHandler)
	canvas.addEventListener('mousemove',dragMap)
	
	renderMap()
	UI_editor.render()
	
	function clickHandler(e){
		if(e.button){
			ctrl.reset()
			return
		}
		ctrl.mousedown=true
		var [x,y]=canvas.getMousePos(e)
		var grid=TheMap.getGrid(...getMapPos(x,y))
		if(grid)ctrl.select('grid',grid)
		else ctrl.reset()
		renderMap()
		UI_editor.render()
	}
	function dragMap(e){
		if(ctrl.mousedown){
			let [dx,dy]=canvas.getPosFromDoc(e.movementX,e.movementY)
			TheMap.ox+=dx
			TheMap.oy+=dy
			renderMap()
			UI_editor.render()
		}
	}
}

function getMapPos(x,y){//canvas坐标转化为地图坐标
	return [(x-TheMap.ox+2*y-2*TheMap.oy)/200,(2*y-2*TheMap.oy-x+TheMap.ox)/200]
}

addEventListener('contextmenu',e=>e.preventDefault())

var gridData=[
	[[1],[1],[1],[1],[1],[2],[0],[0]],
	[[1],[1],[0],[0],[2],[2],[0],[0]],
	[[1],[0],[0,1],[0],[0],[2],[0],[0]],
	[[1],[0],[0],[0,1],[0],[2],[2],[0]],
	[[0],[0],[0],[0],[0,1],[0,1],[2,1],[0,1]],
	[[0],[1],[0],[0,1],[1,1],[2],[2],[2]],
	[[0],[1],[1],[1,1],[1],[2],[2],[2]]
]
var entData=[
	['homebase',2,2],
	['corrupter',6,3],
	['tower1',4,3],
	['corrupterspawner',6,3],
	['goldmine',1,1]
]
UI_loading.construct()
loadAssets(mainMenu,(i,len)=>{
	var t='加载资源：'+i+'/'+len
	UI_loading.push(t)
})

//debug
window.TheMap=TheMap
window.ctrl=ctrl
window.UI=UI