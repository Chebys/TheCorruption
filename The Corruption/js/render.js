import {images} from './assets.js'
import LinkedList from '/lib/linkedList.js'

const bgcolor='#608'
const roadWidth=0.6
var ctx,map,ctrl,WIDTH,HEIGHT
function init(canvas,m,c){
	WIDTH=canvas.width
	HEIGHT=canvas.height
	ctx=canvas.getContext('2d',{alpha:false})
	//ctx.imageSmoothingEnabled=false
	map=m
	ctrl=c
}
function render(){
	ctx.fillStyle=bgcolor
	ctx.fillRect(0,0,WIDTH,HEIGHT)
	renderGrids()
	renderRoads()
	if(ctrl.selGrid)renderTile(ctrl.selGrid,1)
	renderEnts()
	renderHud()
}

const colormap=['#bb0','#0a0','#06f']
function renderGrids(){
	for(let i=0;i<map.sizeX;i++)
		for(let j=0;j<map.sizeY;j++)
			renderTile(map.grids[i][j]);
}
function renderTile(grid,sel){
	var {x,y}=grid,color=colormap[grid.tile]
	mapRect(x,y,1,1)
	if(sel){
		ctx.fillStyle='rgba(255,255,255,0.3)'
		ctx.fill()
		ctx.lineWidth=6
		ctx.strokeStyle='rgba(255,255,255,0.8)'
		ctx.lineJoin='round'
		ctx.stroke()
	}else{
		ctx.fillStyle=color
		ctx.fill()
	}
}
function renderRoads(){
	ctx.fillStyle='#987'
	for(let i=0;i<map.sizeX;i++)
		for(let j=0;j<map.sizeY;j++)
			renderRoadsFrom(map.grids[i][j]);
}
function renderRoadsFrom(grid){
	if(!grid.road)return
	var [x,y]=grid.center,tar
	mapOctagon(x,y,roadWidth/2)
	ctx.fill()
	tar=map.getGrid(x+1,y)
	if(map.hasRoad(grid,tar))renderRoad(grid,tar)
	tar=map.getGrid(x+1,y+1)
	if(map.hasRoad(grid,tar))renderRoad(grid,tar)
	tar=map.getGrid(x,y+1)
	if(map.hasRoad(grid,tar))renderRoad(grid,tar)
	tar=map.getGrid(x-1,y+1)
	if(map.hasRoad(grid,tar))renderRoad(grid,tar)
}
function renderRoad(g1,g2){
	mapRect2(...g1.center,...g2.center,roadWidth)
	ctx.fill()
}

function renderEnts(){
	var list=new LinkedList(),cmp=(e1,e2)=>e1.x+e1.y<e2.x+e2.y
	map.ents_to_render.forEach(e=>list.insert(e,cmp))
	list.forEach(renderEnt)
}
function renderEnt({x,y,image:imgname}){
	var img=images[imgname]||images.default
	var {cx,cy}=img
	var [x,y]=getCvsPos(x,y)
	ctx.drawImage(img.src,x-cx,y-cy)
}

function renderHud(){
	ctx.fillStyle='#642'
	ctx.fillRect(0,HEIGHT-200,WIDTH,200)
	ctx.fillStyle='#420'
	ctx.fillRect(20,HEIGHT-180,WIDTH-40,160)
	if(ctrl.selGrid){
		ctx.font='40px sans-serif'
		ctx.textBaseline='top'
		ctx.fillStyle='#fff'
		ctx.fillText(ctrl.selGrid.tile,40,HEIGHT-160)
	}
}
function getCvsPos(x,y){//地图坐标转化为canvas坐标
	return [map.ox+(x-y)*100,map.oy+(x+y)*50]
}
function mapRect(x,y,sizex,sizey){
	ctx.beginPath()
	ctx.moveTo(...getCvsPos(x,y))
	ctx.lineTo(...getCvsPos(x+sizex,y))
	ctx.lineTo(...getCvsPos(x+sizex,y+sizey))
	ctx.lineTo(...getCvsPos(x,y+sizey))
	ctx.closePath()
}
function mapRect2(x1,y1,x2,y2,width){
	var dx=x2-x1,dy=y2-y1,halfW=width/2
	if(dx){
		let deg=Math.atan(dy/dx),ox=Math.sin(deg)*halfW,oy=Math.cos(deg)*halfW
		ctx.beginPath()
		ctx.moveTo(...getCvsPos(x1-ox,y1+oy))
		ctx.lineTo(...getCvsPos(x1+ox,y1-oy))
		ctx.lineTo(...getCvsPos(x2+ox,y2-oy))
		ctx.lineTo(...getCvsPos(x2-ox,y2+oy))
		ctx.closePath()
	}else{
		mapRect(x1-halfW,y1,width,dy)
	}
}
function mapOctagon(x,y,d){//正八边形；x,y为中心，d为中心到平行边的距离
	var a=Math.tan(Math.PI/8)*d //半边长
	ctx.beginPath()
	ctx.moveTo(...getCvsPos(x+d,y+a))
	ctx.lineTo(...getCvsPos(x+a,y+d))
	ctx.lineTo(...getCvsPos(x-a,y+d))
	ctx.lineTo(...getCvsPos(x-d,y+a))
	ctx.lineTo(...getCvsPos(x-d,y-a))
	ctx.lineTo(...getCvsPos(x-a,y-d))
	ctx.lineTo(...getCvsPos(x+a,y-d))
	ctx.lineTo(...getCvsPos(x+d,y-a))
	ctx.closePath()
}
export {init,render}