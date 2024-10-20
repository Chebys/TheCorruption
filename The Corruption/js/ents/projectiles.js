import {Projectile} from './ents.js'

const default_gravity = 1500

class Parabolic extends Projectile{//抛射物
	angle=0 //画布上的旋转角度
	constructor(speed, gravity=default_gravity){
		super(speed)
		this.gravity=gravity
	}
	get imageState(){
		return {
			rotate:this.angle
		}
	}
	track(origin, target){
		var t=super.track(origin, target)
		this.vz+=this.gravity*t/2
	}
	moveOn(dt){
		super.moveOn(dt)
		this.vz-=this.gravity*dt
		this.updateAngle(dt)
	}
	updateAngle(dt){
		this.angle+=dt*6
	}
}

class Bomb extends Parabolic{
	atkR=1
	explode(){
		var tars=this.getNearbyUnits(this.atkR, e=>e.group==2)
		tars.forEach(t=>t.getAttacked(this.damage))
		this.remove()
	}
	onReach(){
		this.explode()
	}
	onLand(){
		this.explode()
	}
}
class Arrow extends Parabolic{
	updateAngle(){
		//todo
	}
}
class Ball extends Bomb{
	constructor(){
		super(1.5)
	}
}

export default [Arrow, Ball]