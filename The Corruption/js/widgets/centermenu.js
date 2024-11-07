import {Widget, Button} from '/widgets/basewidgets.js'

const width = 600
const optionHeight = 100
const optionStyle = {bgcolor:'#646',border:{width:4,color:'#000'},font:'40px sans-serif',padding:30}
class CenterMenu extends Widget{
	constructor(items){
		super(width, items.length*optionHeight)
		this.items = items
		this.item_num = items.length
		for(let i=0; i<this.item_num; i++)this.MakeOption(i)
		this.SetAnchor('center', 'center')
	}
	MakeOption(index){
		var {text, cb} = this.items[index]
		var opt = this.AddChild(new Button(text, cb, width, optionHeight))
		opt.SetStyle(optionStyle)
		opt.SetAnchor('center', 'center')
		opt.SetPos(0, optionHeight * (index - (this.item_num-1) / 2))
		return opt
	}
	OnNewParent(){
		this.SetPos(0, 0)
	}
}

export default CenterMenu