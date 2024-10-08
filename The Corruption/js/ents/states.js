//Mob特有
class State{
	constructor(ent){
		this.ent=ent
	}
	get imageName(){
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
		ent.arrived=false
		this.finalTarget=ent.targetGrid||ent.grid
	}
	target(grid){
		this.finalTarget=grid
		if(this.ent.targetGrid){
			//
		}
	}
	getCurrentTarget(){ //无则返回false
		var path=this.ent.findPath(this.finalTarget)
		if(!path)return false
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
	update(dt){ //成功移动时返回真
		if(this.ent.atCenter(this.finalTarget)){
			this.end()
			return
		}
		
		let currentTarget=this.ent.targetGrid //ent未处于grid中心时，必有targetGrid
		if(currentTarget && !this.ent.atCenter(currentTarget)){
			let [tx,ty]=currentTarget.center
			let [x1,y1]=this.ent._moveTo(tx,ty,dt)
			if(this.ent.canSetPos(x1,y1)){
				this.ent.setPos(x1,y1)
				return true
			}
		}else if(this.getCurrentTarget()){ //ent处于grid中心时，更新 targetGrid
			return this.update(dt)
		}
		
		this.ent.setState('default')
	}
}
class MovingToBuilding extends Moving{
	target(b, dist){
		super.target(b.grid)
		this.targetBuilding=b
		this.dist=dist||0.1
	}
	update(dt){
		var result=super.update(dt)
		if(!result && this.ent.getDist(this.targetBuilding)<=this.dist)
			this.ent.arrived=true //super.update中已setState
	}
}
class MovingToMob extends Moving{
	update(dt){
		
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
		if(this.ent.cd.ready){
			this.ent.attack(this.targetEnt)
		}
		//cd不能取消，由实体更新
	}
}

class ChaseAndAttack extends MovingToMob{
	
}

class Invading extends State{
	update(dt){
		var base=TheMap.homebase
		if(!base)return
		if(this.ent.getDist(base)<=this.ent.atkR){
			this.ent.setState('Attacking').target(base)
		}else if(this.ent.findPath(base.grid)){
			this.ent.setState('MovingToBuilding').target(base, this.ent.atkR)
		}else{
			//路被堵了
		}
	}
}
class Defending extends State{
	
}

var states={
	default:State,
	Moving,
	MovingToBuilding,
	Invading,
	Attacking
}

export default states

function dist(x,y){
	return Math.sqrt(x*x+y*y)
}