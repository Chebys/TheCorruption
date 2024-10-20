import {spawn} from './ent.js'

var listeners={}

const map={
	load({ox=600, oy=0, grids, stats={}, ents}){
		this.ox=ox //地图原点在canvas中的坐标
		this.oy=oy
		this.sizeX=grids.length
		this.sizeY=grids[0].length
		this.stats={}
		for(let k of ['food','wood','gold','stone'])this.stats[k]=stats[k]||0
		this.grids=[]
		this.ents=new Set
		this.ents_to_render=new Set
		this.ents_to_update=new Set
		for(let i=0;i<this.sizeX;i++){
			this.grids[i]=[]
			for(let j=0;j<this.sizeY;j++){
				let data=grids[i][j]
				this.grids[i][j]=new Grid(i,j,...data)
			}
		}
		if(ents)ents.forEach(data => spawn(data[0]).toCenter(data[1],data[2]))
	},
	loadBlank(l){
		var grids=[]
		for(let i=0;i<l;i++){
			grids[i]=[]
			for(let j=0;j<l;j++)
				grids[i][j]=[0]
		}
		this.load({grids})
	},
	export(){//简略导出，用于地图编辑器
		var gridData=[],entData=[]
		for(let i=0;i<this.sizeX;i++){
			gridData[i]=[]
			for(let j=0;j<this.sizeY;j++){
				let g=this.grids[i][j]
				gridData[i][j]=[g.tile]
				if(g.road)gridData[i][j].push(g.road)
			}
		}
		return {
			//ox:this.ox,oy:this.oy,
			grids:gridData,
			ents:entData
		}
	},
	
	startGame(){ //此前先load
		this.state='in_game'
		this.tasks=new Set
		this.listenForEvent('win', this.win)
		this.listenForEvent('lose', this.lose)
	},
	win(){
		this.state='win_pending'
	},
	lose(){
		this.state='lose_pending'
	},
	
	update(dt){ //先确保 in_game
		this.ents_to_update.forEach(e=>e.update(dt))
		for(let task of this.tasks){
			task.time-=dt
			if(task.time<=0){
				let {resolve, fn}=task
				resolve(fn())
				this.tasks.delete(task)
			}
		}
	},
	
	pushEvent(name, data){
		listeners[name]?.call(this, data)
	},
	listenForEvent(name, fn){//暂且只能添加一个
		if(listeners[name])console.warn('TheMap: listener "'+name+'" already exist!')
		listeners[name]=fn
	},
	
	//工具函数
	getGrid(x,y){
		if(0<=x&&x<this.sizeX&&0<=y&&y<this.sizeY)
			return this.grids[Math.floor(x)][Math.floor(y)]
	},
	getGridsAround(grid){
		var {x,y}=grid,grids=new Set
		for(let pos of[[x,y-1],[x-1,y],[x+1,y],[x,y+1],[x-1,y-1],[x+1,y-1],[x-1,y+1],[x+1,y+1]]){
			let g=this.getGrid(...pos)
			if(g)grids.add(g)
		}
		return grids
	},
	allPaths(grid, passFn=(g1,g2)=>true, maxLenth=100){
		var l=0, paths=new Map //目标grid到path的对应；path首元为起始grid，末元为目标grid
		paths.set(grid, [grid])
		const extend=grids=>{
			if(++l>maxLenth)return
			var next=new Set
			grids.forEach(g1=>{
				var path1=paths.get(g1)
				this.getGridsAround(g1).forEach(g2=>{
					if(paths.has(g2)||!passFn(g1,g2))return
					var path2=[...path1,g2]
					next.add(g2)
					paths.set(g2,path2)
				})
			})
			if(next.size)extend(next)
		}
		extend([grid])
		return paths
	},
	findPath(g1, g2, passFn){ //无则返回undefined
		return this.allPaths(g1,passFn).get(g2)
	},
	dist({x:x1,y:y1}, {x:x2,y:y2}){
		return Math.sqrt((x1-x2)**2+(y1-y2)**2)
	},
	findUnits(x, y, dist, fn=e=>true){
		var grid=this.getGrid(x,y), res=new Set, l=Math.ceil(dist)
		for(let i=grid.x-l;i<=grid.x+l;i++)
			for(let j=grid.y-l;j<=grid.y+l;j++){
				let g=this.getGrid(i,j)
				if(!g)continue
				for(let e of g.units)
					if(this.dist({x:x,y:y},e)<=dist&&fn(e))
						res.add(e)
			}
		return res
	},
	getUnit(x,y){
		var units=this.getGrid(x,y)?.units
		if(units){
			let u,r=0.3 //至少离多近可以选中；和render存在耦合
			for(let u1 of units){
				let r1=this.dist({x:x,y:y},u1)
				if(r1<=r){
					u=u1
					r=r1
				}
			}
			return u
		}
	},
	getBuilding(x,y){
		var b=this.getGrid(x,y)?.building //不在同一格时？
		if(b && this.dist({x:x,y:y},b)<=b.r)return b
	},
	blocked(x,y){
		return !!this.getBuilding(x,y)
	},
	hasRoad(g1,g2){//判断相邻（邻边或对角）两格是否带有道路相连
		if(!g1?.road || !g2?.road)return false
		var {x:x1,y:y1}=g1, {x:x2,y:y2}=g2
		if(x1==x2 || y1==y2)return true //邻边
		if(this.getGrid(x1,y2)?.road || this.getGrid(x2,y1)?.road)return false //同时存在邻边和对角，优先邻边
		return true
	},
	click(x,y){
		var unit=this.getUnit(x,y)
		if(unit)return ['unit',unit]
		var b=this.getBuilding(x,y) //考虑高度？
		if(b)return ['building',b]
		var grid=this.getGrid(x,y)
		if(grid)return ['grid',grid]
		return [null,null]
	}
}
map.spawn=spawn

class Corruption{
	max=1
	min=0
	constructor(base){
		this.setBase(base||0)
		this.extra=new Map() //每个实体产生的腐化度单独计算
	}
	restrict(v){
		v=Math.max(v,this.min)
		v=Math.min(v,this.max)
		return v
	}
	setBase(v){this.base=this.restrict(v)}
	get(){
		var s=this.base
		for(let v of this.extra.values())s+=v
		return this.restrict(s)
	}
	changeBase(v){this.setBase(this.base+v)}
	setExtra(src,v){this.extra.set(src,v)}
	removeExtra(src){this.extra.delete(src)}
	toString(){return this.get()*100+'%'}
}

class Grid{
	constructor(x,y,tile,road){//建筑等实体不在此处初始化
		this.x=x
		this.y=y
		this.tile=tile
		this.road=road
		this.units=new Set
		this.corruption=new Corruption
	}
	get center(){return [this.x+0.5,this.y+0.5]}
}

function _then(fn){
	return this.promise.then(fn, nullfn)
}
function _cancel(){
	this.promise.catch(nullfn)
	this.reject()
	map.tasks.delete(this)
}
function DoTaskInTime(time, fn){
	var task=Promise.withResolvers()
	task.then=_then //Thenable
	task.cancel=_cancel
	
	task.fn=fn
	task.time=time
	map.tasks.add(task)
	
	return task
}

global('TheMap', map) //相当于 TheSim
global('DoTaskInTime', DoTaskInTime)