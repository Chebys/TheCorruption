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
function percentText(per){
	return (per*100).toFixed(2) + '%'
}

class Loading extends Screen{
	constructor({task}){ //task可具有title, percent属性
		super()
		this.task = task
		this.SetStyle({bgcolor:'#000'})
		this.AddChild('content', new Text(task.title))
		this.content.SetAnchor('center', 'center')
		this.content.SetPos()
	}
	Popup(title, content){
		var {promise, resolve, reject} = Promise.withResolvers()
		var popup = this.AddChild(new Popup(title, content, resolve, reject))
		popup.SetPos()
		return promise
	}
	PopupAssetInfo(meta){
		var {sizes} = meta
		var size = sizes.reduce((s,x)=>s+x)
		return this.Popup(Strings.ui.confirm_load_assets, '大小：'+sizetext(size, 'MB'))
	}
	OnUpdate(){
		var {title, percent=0} = this.task
		var text = title + ': ' + percentText(percent)
		this.content.SetText(text)
	}
}

export default Loading