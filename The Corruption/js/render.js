import LinkedList from '/lib/linkedList.js'
import {canvas, ctx} from './canvas.js'
import {images} from './assets.js'
//global('LinkedList', LinkedList)
const map=TheMap
const bgcolor='#608'
const roadWidth=0.6

function render(){
	ctx.fillStyle=bgcolor
	ctx.fillRect(0,0,WIDTH,HEIGHT)
	renderGrids()
	renderRoads()
	if(Ctrl.selType=='grid')renderTile(Ctrl.sel,1)
	else if(Ctrl.selType=='building')circleEnt(Ctrl.sel)
	else if(Ctrl.selType=='unit')circleEnt(Ctrl.sel,0.3)
	renderEnts()
}

const tile_colors=['#bb0','#0a0','#06f']
function renderGrids(){
	for(let i=0;i<map.sizeX;i++)
		for(let j=0;j<map.sizeY;j++)
			renderTile(map.grids[i][j]);
}
function renderTile(grid,sel){
	var {x,y}=grid, color=tile_colors[grid.tile]
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
	mapRect2(...g1.center, ...g2.center, roadWidth)
	ctx.fill()
}

function circleEnt({x,y,r}, r1=0.4){ //选中
	r=r||r1
	ctx.lineWidth=4
	ctx.strokeStyle='rgba(255,255,255,0.8)'
	ctx.lineJoin='round'
	mapOctagon(x,y,r)
	ctx.stroke()
}
function renderEnts(){
	var list=new LinkedList(), cmp=(e1,e2)=>e1.x+e1.y<e2.x+e2.y
	map.ents_to_render.forEach(e=>list.insert(e,cmp))
	list.forEach(renderEnt)
}
function renderEnt({x, y, z=0, imageName, imageState}){
	var image=images[imageName]||images.default
	var [x,y]=getCvsPos(x,y)
	if(imageState){
		let {rotate=0} = imageState
		image.draw(ctx, x, y-z, rotate)
	}else image.draw(ctx, x, y-z)
}

function getCvsPos(x, y, z=0){ //地图坐标转化为canvas坐标
	return [map.ox+(x-y)*100, map.oy+(x+y)*50]
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
function mapOctagon(x,y,d){ //正八边形；x,y为中心，d为中心到平行边的距离
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

export default render