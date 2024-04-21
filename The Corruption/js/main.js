import {loadAssets} from './assets.js'
import {init as initRenderer,render} from './render.js'
//import {init as initUpdater,update} from './update.js'
import map from './map.js'

const WIDTH=1200,HEIGHT=800
const canvas=document.createElement('canvas')
canvas.width=WIDTH
canvas.height=HEIGHT
canvas.getPosFromDoc=function(x,y){//网页坐标转化为canvas坐标
	var rect=this.getBoundingClientRect()
	return [x*WIDTH/rect.width,y*HEIGHT/rect.height]
}
canvas.getMousePos=function(e){//从鼠标事件获取canvas坐标
	return canvas.getPosFromDoc(e.offsetX,e.offsetY)
}
document.body.appendChild(canvas)

const ctrl={}

map.ox=WIDTH/2,map.oy=0 //地图原点在canvas中的坐标

initRenderer(canvas,map,ctrl)
var currentFrame,t0
function startGame(){
	console.log('加载地图')
	map.load(mapData)
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
	render()
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

function clickHandler(e){
	ctrl.mousedown=true
	var [x,y]=canvas.getMousePos(e)
	ctrl.selGrid=map.getGrid(...getMapPos(x,y))
}

addEventListener('load',zoom)
addEventListener('resize',zoom)
function zoom(){
	if(innerWidth/innerHeight>=WIDTH/HEIGHT){
		canvas.style.width=''
		canvas.style.height='100vh'
	}else{
		canvas.style.width='100vw'
		canvas.style.height=''
	}
}

var mapData=[
	[[1],[1],[1],[1],[1],[2],[0],[0]],
	[[1],[1],[0],[0],[2],[2],[0],[0]],
	[[1],[0],[0,1],[0],[0],[2],[0],[0]],
	[[1],[0],[0],[0,1],[0],[2],[2],[0]],
	[[0],[0],[0],[0],[0,1],[0,1],[2,1],[0,1]],
	[[0],[1],[0],[0,1],[1,1],[2],[2],[2]],
	[[0],[1],[1],[1,1],[1],[2],[2],[2]]
]
loadAssets(startGame,(i,len)=>console.log('加载资源：'+i+'/'+len))

//debug
window.map=map
window.ctrl=ctrl
window.startGame=startGame
window.pause=pause