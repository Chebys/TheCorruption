import {spawn} from './ents.js'

const map={
	load({ox=600,oy=0,grids,ents}){
		this.ox=ox //地图原点在canvas中的坐标
		this.oy=oy
		this.sizeX=grids.length
		this.sizeY=grids[0].length
		this.grids=[]
		this.ents=new Set()
		this.ents_to_render=new Set()
		this.ents_to_update=new Set()
		for(let i=0;i<this.sizeX;i++){
			this.grids[i]=[]
			for(let j=0;j<this.sizeY;j++){
				let data=grids[i][j]
				this.grids[i][j]=new Grid(i,j,...data)
			}
		}
		if(ents)ents.forEach(data=>spawn(data[0]).toCenter(data[1],data[2]))
	},
	loadBlank(l){
		var grids=[]
		for(let i=0;i<l;i++){
			grids[i]=[]
			for(let j=0;j<l;j++)
				grids[i][j]=[0]
		}
		this.load({grids:grids})
	},
	export(){//简略导出，用于地图编辑器
		var gridData=[]
		for(let i=0;i<this.sizeX;i++){
			gridData[i]=[]
			for(let j=0;j<this.sizeY;j++){
				let g=this.grids[i][j]
				gridData[i][j]=[g.tile]
				if(g.road)gridData.push(g.road)
			}
		}
		return {
			//ox:this.ox,oy:this.oy,
			grids:gridData
		}
	},
	getGrid(x,y){
		if(0<=x&&x<this.sizeX&&0<=y&&y<this.sizeY)
			return this.grids[Math.floor(x)][Math.floor(y)]
	},
	getGridsAround(grid){
		var {x,y}=grid,grids=new Set()
		for(let pos of[[x,y-1],[x-1,y],[x+1,y],[x,y+1],[x-1,y-1],[x+1,y-1],[x-1,y+1],[x+1,y+1]]){
			let g=this.getGrid(...pos)
			if(g)grids.add(g)
		}
		return grids
	},
	allPaths(grid,passFn=(g1,g2)=>true,maxLenth=100){
		var l=0,paths=new Map()//目标grid到path的对应；path首元为起始grid，末元为目标grid
		paths.set(grid,[grid])
		const extend=grids=>{
			if(++l>maxLenth)return
			var next=new Set()
			grids.forEach(g1=>{
				var path1=paths.get(g1)
				this.getGridsAround(g1).forEach(g2=>{//注意此次使用命名map
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
	findPath(g1,g2,passFn){
		return this.allPaths(g1,passFn).get(g2)
	},
	dist({x:x1,y:y1},{x:x2,y:y2}){
		return Math.sqrt((x1-x2)**2+(y1-y2)**2)
	},
	findEnts(x,y,dist,fn=e=>true){
		var grid=this.getGrid(x,y),res=new Set(),l=Math.ceil(dist)
		for(let i=grid.x-l;i<=grid.x+l;i++)
			for(let j=grid.y-l;j<=grid.y+l;j++){
				let g=this.getGrid(i,j)
				if(!g)continue
				for(let e of g.ents)
					if(this.dist({x:x,y:y},e)<=dist&&fn(e))
						res.add(e)
			}
		return res
	},
	blocked(x,y){//判断该点是否被建筑阻挡
		var b=this.getGrid(x,y).building
		if(b&&this.dist({x:x,y:y},b)<=b.r)return true
	},
	hasRoad(g1,g2){//判断相邻（邻边或对角）两格是否带有道路相连
		if(!g1?.road||!g2?.road)return false
		var {x:x1,y:y1}=g1,{x:x2,y:y2}=g2
		if(x1==x2||y1==y2)return true //邻边
		if(this.getGrid(x1,y2)?.road||this.getGrid(x2,y1)?.road)return false //同时存在邻边和对角，优先邻边
		return true
	},
	click(x,y){
		var grid=this.getGrid(x,y)
		if(grid)return ['grid',grid]
		var building
		if(building)return []
		var unit
		return [null,null]
	}
}

class Grid{
	constructor(x,y,tile,road){//建筑等实体不在此处初始化
		this.x=x
		this.y=y
		this.tile=tile
		this.road=road
		this.ents=new Set()
	}
	get center(){return [this.x+0.5,this.y+0.5]}
}

map.spawn=spawn

export default map