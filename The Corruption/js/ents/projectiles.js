import {Projectile} from './ents.js'

const default_gravity = 15

class Parabolic extends Projectile{//抛射物
	constructor(speed, gravity=default_gravity){
		super(speed)
		this.gravity=gravity
		this.anim.rotate=0
	}
	track(origin, target){
		var t = super.track(origin, target)
		this.vz += this.gravity*t/2
	}
	moveOn(dt){
		super.moveOn(dt)
		this.vz -= this.gravity*dt
		this.updateAngle(dt)
	}
	updateAngle(dt){
		this.anim.rotate += dt*6
	}
}

class Bomb extends Parabolic{
	atkR = 1
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
		this.anim.applyDirection(this.direction)
	}
}
class Ball extends Bomb{
	constructor(){
		super(1.5)
	}
}

export default [Arrow, Ball]