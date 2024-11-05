import {CvsEle} from '/cvsEle.js'

const borderStyle={border:{width:2,color:'#000'},padding:10}
export default {
	construct({renderMap}){
		this.onPreRender=renderMap
		
		var bHeight=200,bY=HEIGHT-bHeight //底栏位置
		new CvsEle(0,bY,WIDTH,bHeight,{bgcolor:'#420',border:{width:10,color:'#864'}})
			.on('mousedown',e=>e.stopImmediatePropagation())
		for(let i=0;i<3;i++){
			let tileButton=new CvsEle(100+i*100,bY+50,100,50,borderStyle)
			tileButton.text(STRINGS.tileName[i])
			tileButton.on('click',e=>{
				if(Ctrl.sel){
					Ctrl.sel.tile=i
				}
			})
		}
		var roadButton=new CvsEle(400,bY+50,100,50,borderStyle)
		roadButton.text('道路')
		roadButton.on('click',e=>{
			if(Ctrl.sel){
				Ctrl.sel.road=!Ctrl.sel.road
			}
		})
		var baseButton=new CvsEle(500,bY+50,100,50,borderStyle)
		baseButton.text('基地')
		baseButton.on('click',e=>{
			Ctrl.editorOption('homebase')
		})
		
		this.saveButton=new CvsEle(800,bY+50,100,50,borderStyle)
		this.saveButton.text('保存')
		this.saveButton.on('click',_=>{
			var data=TheMap.export()
			localStorage.setItem('mapData',JSON.stringify(data))
			alert('已保存至localStorage.mapData')
		})
		
		this.exitButton=new CvsEle(900,bY+50,100,50,borderStyle)
		this.exitButton.text('退出')
		this.exitButton.on('click', main.mainMenu)
	}
}