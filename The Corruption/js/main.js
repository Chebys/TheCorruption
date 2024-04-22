import {loadAssets} from './assets.js'
import {canvas} from './canvas.js'
//import strings from './strings.js'
import {UI_loading,UI_mainMenu,UI_inGame as UI,UI_editor} from './UI.js'
import renderMap from './render.js'
import map from './map.js'
import ctrl from './control.js'

addEventListener('mouseup',e=>ctrl.mousedown=false)//考虑在canvas外松开的情况

function mainMenu(){
	UI_mainMenu.construct()
	UI_mainMenu.setOnStartGame(startGame)
	UI_mainMenu.setOnEditor(()=>{
		var l=parseInt(prompt('输入地图边长（建议不超过30）'))
		l&&startEditor(l)
	})
}

function startGame(){
	var currentFrame,t0
	UI_loading.push('加载地图')
	map.load({ox:canvas.width/2,oy:0,grids:gridData,ents:entData})
	UI.construct() //优先为UI添加事件监听
	UI.setOnPause(()=>cancelAnimationFrame(currentFrame))//取消监听？
	UI.setOnContinue(main)//requestAnimationFrame会传入当前时间，导致longUpdate
	UI.setOnExit(exit)
	canvas.addEventListener('mousedown',clickHandler)
	canvas.addEventListener('mousemove',dragMap)
	currentFrame=requestAnimationFrame(main)
	
	function main(t){
		var dt=t&&t0?(t-t0)/1000:0
		t0=t
		renderMap()
		UI.render()
		map.ents_to_update.forEach(e=>e.update(dt))
		currentFrame=requestAnimationFrame(main)
	}
	function continu(){
		main()
	}
	function exit(){
		cancelAnimationFrame(currentFrame)
		ctrl.reset()
		canvas.removeEventListener('mousedown',clickHandler)
		canvas.removeEventListener('mousemove',dragMap)
		mainMenu()
	}
	
	function dragMap(e){
		if(ctrl.mousedown){
			let [dx,dy]=canvas.getPosFromDoc(e.movementX,e.movementY)
			map.ox+=dx
			map.oy+=dy
		}
	}
	function clickHandler(e){//处理地图点击
		if(e.button){
			ctrl.reset()
			UI.clear()
			return
		}
		ctrl.mousedown=true
		var [x,y]=canvas.getMousePos(e)
		var [type,obj]=map.click(...getMapPos(x,y))
		if(type){
			ctrl.select(type,obj)
			UI.showInfo(ctrl.getData())
		}else{
			ctrl.reset()
			UI.clear()
		}
	}
}

function startEditor(l){
	UI_editor.construct()
	map.loadBlank(l)
	UI_editor.setOnMapChange(e=>{
		renderMap()
		UI_editor.render()
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
		var grid=map.getGrid(...getMapPos(x,y))
		if(grid)ctrl.select('grid',grid)
		else ctrl.reset()
		renderMap()
		UI_editor.render()
	}
	function dragMap(e){
		if(ctrl.mousedown){
			let [dx,dy]=canvas.getPosFromDoc(e.movementX,e.movementY)
			map.ox+=dx
			map.oy+=dy
			renderMap()
			UI_editor.render()
		}
	}
}

function getMapPos(x,y){//canvas坐标转化为地图坐标
	return [(x-map.ox+2*y-2*map.oy)/200,(2*y-2*map.oy-x+map.ox)/200]
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
	['tower1',4,3]
]
UI_loading.construct()
loadAssets(mainMenu,(i,len)=>{
	var t='加载资源：'+i+'/'+len
	UI_loading.push(t)
})

//debug
window.map=map
window.ctrl=ctrl
window.UI=UI