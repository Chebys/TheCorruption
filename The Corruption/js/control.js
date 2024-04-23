import strings from './strings.js'
import map from './map.js'

const getData={
	grid:g=>{
		return {info:[strings.tileName[g.tile],'此处应有图片','']}
	},
	unit:u=>{
		
	}
}

const control={
	keydown:{},
	select(type,obj){
		this.selType=type
		this.sel=obj
	},
	getData(){//将选中对象信息暴露给UI
		return getData?.[this.selType](this.sel)
	},
	option(i){//当控件被点击，由UI调用
		console.log(i)
	},
	editorOption(cmd){//用于地图编辑器
		if(this.selType!='grid')return
		switch(cmd){
			case 'homebase':
				map.spawn('homebase').setGrid(this.sel)
		}
	},
	reset(){//鼠标、键盘按下状态不能清除
		this.selType=null
		this.sel=null
	}
}

export default control