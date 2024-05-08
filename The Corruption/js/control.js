import strings from './strings.js'
import map from './map.js'

const gridOpts=[]
gridOpts[0]=[
	{
		img:'tower1',
		fn(){//是否已有建筑？
			spawnAtSelGrid('tower1')
		}
	}
]

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