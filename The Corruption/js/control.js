import strings from './strings.js'
import {price} from './figures.js'
import map from './map.js'

const stats={
	get(s){return map.stats[s]},
	set(tb){
		for(let k in tb)map.stats[k]=tb[k]
	},
	add(tb){
		for(let k in tb)map.stats[k]+=tb[k]
	},
	sub(tb){
		for(let k in tb)map.stats[k]-=tb[k]
	},
	check(tb){//判断是否足够
		for(let k in tb)if(map.stats[k]<tb[k])return false
		return true
	}
}

const gridOpts=[]
gridOpts[0]=[
	{
		img:'archertower',
		fn(){
			tryConstruct('archertower')
		}
	},
	{
		img:'tower1',
		fn(){
			tryConstruct('tower1')
		}
	}
]
gridOpts[1]=gridOpts[0]
function canConstruct(name){//调用前保证选中grid
	var g=control.sel
	return !g.building&&!g.road&&stats.check(price[name])
}
function tryConstruct(name){
	if(canConstruct(name)){
		stats.sub(price[name])
		spawnAtSelGrid(name)
		return true
	}
}

const getData={
	grid:g=>{
		var opts=[]
		gridOpts[g.tile]?.forEach(opt=>{
			opts.push(opt.img)
		})
		return {
			img:'info_tile'+g.tile,
			info:[strings.tileName[g.tile],''],
			options:opts
		}
	},
	building:b=>{
		return {
			img:b.name,
			info:[
				strings.entName[b.name],
				_=>'生命：'+b.health,
				b.damage&&(_=>'攻击力：'+b.damage)
			]
		}
	},
	unit:u=>{
		return {
			img:u.name,
			info:[
				strings.entName[u.name],
				_=>'生命：'+u.health,
				u.damage&&(_=>'攻击力：'+u.damage)
			]
		}
	}
}
const defaultInfo={info:['错误']}

const control={
	keydown:{},
	select(type,obj){
		this.selType=type
		this.sel=obj
	},
	getData(){//将选中对象信息暴露给UI
		return getData[this.selType]?.(this.sel)||console.error('getData失败')||defaultInfo
	},
	option(i){//当控件被点击，由UI调用
		switch(this.selType){
			case 'grid':gridOpts[this.sel.tile]?.[i]?.fn();break
			case 'building':
		}
	},
	editorOption(cmd){//用于地图编辑器
		if(this.selType!='grid')return
		switch(cmd){
			case 'homebase':
				spawnAtSelGrid('homebase')
				break
			case 'spawner':
				break
		}
	},
	reset(){//鼠标、键盘按下状态不能清除
		this.selType=null
		this.sel=null
	}
}

function spawnAtSelGrid(name){
	map.spawn(name).setGrid(control.sel)
}

export default control