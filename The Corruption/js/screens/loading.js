import {Screen, Text} from '/widgets/basewidgets.js'
import Popup from '/widgets/popup.js'

function sizetext(size, unit='B', fix=2){
	unit = unit.toUpperCase();
	switch(unit){
		case 'MB': size /= 1024;
		case 'KB': size /= 1024;
	}
	return size.toFixed(fix) + unit;
}

class Loading extends Screen{
	constructor({text}){
		super()
		this.SetStyle({bgcolor:'#000'})
		this.content=new Text(text)
		this.content.SetPos(300, 300)
	}
	PopupAssetInfo(){
		var {sizes} = main.meta
		this.content.Remove()
		var size = sizes.reduce((s,x)=>s+x)
		var {resolve, promise} = Promise.withResolvers()
		this.content=this.AddChild(new Popup('呐', '大小：'+sizetext(size, 'MB'), resolve, main.onerror))
		this.content.SetPos()
		return promise
	}
	OnUpdate(){
		//this.info.SetText(this.textFn())
	}
}

export default Loading