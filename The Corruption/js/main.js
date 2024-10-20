import './global.js'
import './.debug.js'
import {canvas} from './canvas.js'
import './strings.js'
import {loadAssetsOld, loadAssets, checkAssets} from './assets.js'
import UI from './UI.js'
import './map.js'
import renderMap from './render.js'
import './control.js'
import level from './level.js'

addEventListener('mouseup', e=>Ctrl.mousedown=false) //考虑在canvas外松开的情况
addEventListener('contextmenu', e=>e.preventDefault())

var currentFrame, t0
const main={
	run(t){
		var dt = t&&t0 ? (t-t0)/1000 : 0 //dt以秒为单位
		if(dt>1)dt=0 //避免longUpdate的一个下策
		t0=t
		try{
			UI.render() //renderMap()
			UI.update(dt)
			switch(TheMap.state){
				case 'in_game': TheMap.update(dt);break
				case 'pause': break
				case 'lose_pending': TheMap.state='lose';break //UI已作处理
				case 'win_pending': TheMap.state='win';break
				case 'lose': break
				case 'win': break
			}
		}catch(e){
			main.onerror(e)
		}
		currentFrame=requestAnimationFrame(main.run)
	},
	onerror(error){
		TheMap.state = null
		console.log(error)
		if(error.cause)console.log('cause:', error.cause)
		UI.goto('error', {error})
	},
	init(){
		var loadingText=STRINGS.progress_stage[0]
		UI.goto('loading', {textFn:_=>loadingText})
		loadAssets(onprogress).then(onload, main.onerror)
		
		function onprogress({stage,percent}){
			loadingText=STRINGS.progress_stage[stage]
			if(percent!=undefined)loadingText+=': '+percent*100+'%'
		}
		function onload(){
			if(checkAssets()){
				main.mainMenu()
			}else if(BRANCH=='dev'){
				console.log('资源文件缺失，尝试老式加载')
				quickExport(main.mainMenu)
			}else{
				main.onerror('资源文件缺失')
			}
		}
	},
	mainMenu(){
		TheMap.state=null
		Ctrl.reset()
		main.removeMapHandler()
		UI.goto('mainMenu')
	},
	startGame(){
		//UI.goto('loading', {textFn:_=>'加载地图'})
		TheMap.load(level.get(0))
		UI.goto('inGame', {renderMap}) //优先为UI添加事件监听
		//var bgmusic=audios['bg.mp3']
		//bgmusic.play(1)
		main.addMapHandler()
		TheMap.startGame()
	},
	startEditor(l){
		TheMap.loadBlank(l)
		UI.goto('editor', {renderMap})
		main.addMapHandler()
	},
	addMapHandler(){
		canvas.addEventListener('mousedown', clickHandler)
		canvas.addEventListener('mousemove', dragMap)
	},
	removeMapHandler(){
		canvas.removeEventListener('mousedown', clickHandler)
		canvas.removeEventListener('mousemove', dragMap)
	}
}

global('main', main)

function dragMap(e){
	if(Ctrl.mousedown){
		let [dx,dy]=canvas.getPosFromDoc(e.movementX,e.movementY)
		TheMap.ox+=dx
		TheMap.oy+=dy
	}
}
function clickHandler(e){//处理地图点击
	if(e.button){//右键
		Ctrl.reset()
		return
	}
	Ctrl.mousedown=true
	var [x,y]=canvas.getMousePos(e)
	var [type,obj]=TheMap.click(...getMapPos(x,y))
	if(type)Ctrl.select(type,obj)
	else Ctrl.reset()
}

function getMapPos(x,y){//canvas坐标转化为地图坐标
	return [(x-TheMap.ox+2*y-2*TheMap.oy)/200, (2*y-2*TheMap.oy-x+TheMap.ox)/200]
}

main.init()
main.run()

//debug
global('ctrl', Ctrl)
global('UI', UI)