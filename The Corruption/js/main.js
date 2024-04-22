import {loadAssets} from './assets.js'
import {canvas} from './canvas.js'
//import strings from './strings.js'
import {UI_loading,UI_mainMenu,UI_inGame as UI} from './UI.js'
import renderMap from './render.js'
import map from './map.js'
import ctrl from './ctrl.js'

map.ox=canvas.width/2,map.oy=0 //地图原点在canvas中的坐标

var currentFrame,t0
function startGame(){
	UI_loading.push('加载地图')
	map.load({grids:gridData,ents:entData})
	UI.construct() //优先为UI添加事件监听
	canvas.addEventListener('mousedown',clickHandler)
	canvas.addEventListener('contextmenu',e=>{
		e.preventDefault()
		ctrl.selGrid=null
	})
	addEventListener('mouseup',e=>ctrl.mousedown=false)//考虑在canvas外松开的情况
	canvas.addEventListener('mousemove',e=>{//拖动地图
		if(ctrl.mousedown){
			let [dx,dy]=canvas.getPosFromDoc(e.movementX,e.movementY)
			map.ox+=dx
			map.oy+=dy
		}
	})
	currentFrame=requestAnimationFrame(main)
}
function main(t){
	var dt=t&&t0?(t-t0)/1000:0
	t0=t
	renderMap()
	UI.render()
	//update(dt)
	map.ents_to_update.forEach(e=>e.update(dt))
	currentFrame=requestAnimationFrame(main)
}
function pause(){
	cancelAnimationFrame(currentFrame)
}


function getMapPos(x,y){//canvas坐标转化为地图坐标
	return [(x-map.ox+2*y-2*map.oy)/200,(2*y-2*map.oy-x+map.ox)/200]
}

function clickHandler(e){//处理地图点击
	ctrl.mousedown=true
	var [x,y]=canvas.getMousePos(e)
	var grid=map.getGrid(...getMapPos(x,y))
	if(grid){
		ctrl.selGrid=grid
		UI.showGrid(grid)
		return
	}
	ctrl.selGrid=null
	var ent
	UI.clear()
}


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
loadAssets(startGame,(i,len)=>{
	var t='加载资源：'+i+'/'+len
	UI_loading.push(t)
})

//debug
window.map=map
window.ctrl=ctrl
window.pause=pause
window.UI=UI