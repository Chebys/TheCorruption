import {loadAssets} from './assets.js'
import strings from './strings.js'
import {CvsEle,init as initUI,reset as resetUI,render as renderUI} from './cvsEle.js'
import {init as initRenderer,render as renderMap} from './render.js'
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
	return this.getPosFromDoc(e.offsetX,e.offsetY)
}
document.body.appendChild(canvas)

const ctrl={}

map.ox=WIDTH/2,map.oy=0 //地图原点在canvas中的坐标

initUI(canvas)
var currentFrame,t0
function startGame(){
	console.log('加载地图')
	map.load({grids:gridData,ents:entData})
	constructUI() //优先为UI添加事件监听
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
	initRenderer(canvas,map,ctrl)
	currentFrame=requestAnimationFrame(main)
}
function main(t){
	var dt=t&&t0?(t-t0)/1000:0
	t0=t
	renderMap()
	renderUI()
	//update(dt)
	map.ents_to_update.forEach(e=>e.update(dt))
	currentFrame=requestAnimationFrame(main)
}
function pause(){
	cancelAnimationFrame(currentFrame)
}

var UI={}
function constructUI(){
	resetUI()
	var bHeight=200,bY=HEIGHT-bHeight //底栏位置
	new CvsEle(2,2,100,40,{bgcolor:'#420',border:{width:4,color:'#864'}})
	new CvsEle(10,14,0,0,{text:'$:100'})
	new CvsEle(0,bY,WIDTH,bHeight,{bgcolor:'#420',border:{width:10,color:'#864'}})
		.on('mousedown',e=>e.stopImmediatePropagation())
	UI.info=[]
	for(let i=0;i<4;i++)UI.info[i]=new CvsEle(i*100+100,bY+50,0,0)
	UI.showGrid=g=>{
		UI.info[0].text(strings.tileName[g.tile])
	}
	UI.options=[]
	for(let i=0;i<4;i++)UI.options[i]=new CvsEle(600,bY+50+i*50,100,100)
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
	}
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

var loadingInfo=new CvsEle(300,300)
loadAssets(startGame,(i,len)=>{
	var t='加载资源：'+i+'/'+len
	loadingInfo.text(t)
	renderUI()
})

//debug
window.map=map
window.ctrl=ctrl
window.startGame=startGame
window.pause=pause