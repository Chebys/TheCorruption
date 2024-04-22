import strings from './strings.js'

const control={
	keydown:{},
	//将选中对象信息暴露给UI
	getGridData(){
		return {info:[strings.tileName[this.selGrid.tile],'此处应有图片','']}
	},
	getUnitData(){
		
	},
	option(i){//当控件被点击
		console.log(i)
	},
	reset(){//鼠标、键盘按下状态不能清除
		this.selGrid=null
		this.selBuilding=null
		this.selUnit=null
	}
}

export default control