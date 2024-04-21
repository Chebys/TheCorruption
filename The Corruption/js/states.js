class State{
	constructor(ent){
		this.ent=ent
	}
	get image(){
		return this.ent.name
	}
	end(){//正常结束，而非中断
		this.ent.setState('default')
	}
	update(dt){}
}
class Moving extends State{
	constructor(ent){
		super(ent)
		this.ent.arrived=false
		this.finalTarget=this.ent.targetGrid
	}
	target(grid){
		this.finalTarget=grid
		if(this.ent.targetGrid){
			//
		}
	}
	getCurrentTarget(){
		var path=this.ent.findPath(this.finalTarget)
		this.path=path //用于render?
		this.ent.originGrid=path[0]
		this.ent.targetGrid=path[1]
		return this.ent.targetGrid
	}
	end(){
		this.ent.arrived=true
		this.ent.originGrid=null
		this.ent.targetGrid=null
		super.end()
	}
	update(dt){
		var {x,y}=this.ent
		var [tx,ty]=this.finalTarget.center
		if(x==tx&&y==ty){
			this.end()
			return
		}
		var currentTarget=this.ent.targetGrid||this.getCurrentTarget();//ent未处于grid中心时，必有targetGrid
		[tx,ty]=currentTarget.center
		if(x==tx&&y==ty)[tx,ty]=this.getCurrentTarget().center//ent处于grid中心时，更新targetGrid
		var [x1,y1]=this.ent._moveTo(tx,ty,dt)
		if(this.ent.canSetPos(x1,y1)){
			this.ent.setPos(x1,y1)
			return true
		}
		this.ent.setState('default')
	}
}
class MovingToBuilding extends Moving{
	target(b,dist){
		super.target(b.grid)
		this.targetBuilding=b
		this.dist=dist||0.1
	}
	update(dt){
		var result=super.update(dt)
		if(!result&&this.ent.getDist(this.targetBuilding)<=this.dist)
			this.ent.arrived=true //super.update中已setState('default')
	}
}
class Attacking extends State{
	target(ent){
		this.targetEnt=ent
	}
	update(dt){
		if(this.targetEnt.ignored||this.ent.getDist(this.targetEnt)>this.ent.atkR){
			this.end()
			return
		}
		//前摇以后再说
		if(this.ent.cdLeft){
			//cd不能取消，由实体更新
		}else{
			this.ent.attack(this.targetEnt)
		}
	}
}
class Invading extends State{
	update(dt){
		var base=map.homebase
		if(!base)return
		if(this.ent.getDist(base)>this.ent.atkR)
			this.ent.setState('MovingToBuilding').target(base,this.ent.atkR)//被阻挡时？
		else{
			this.ent.setState('Attacking').target(base)
		}
	}
}
var states={default:State};
[
	Moving,
	MovingToBuilding,
	Invading,
	Attacking
].forEach(s=>states[s.name]=s)

export default states

function dist(x,y){
	return Math.sqrt(x*x+y*y)
}