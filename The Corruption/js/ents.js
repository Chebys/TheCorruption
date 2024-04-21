import states from'./states.js'

var map

class Ent{
	constructor(){
		map.ents.add(this)
	}
	get name(){
		return this.constructor.name.toLocaleLowerCase()
	}
	remove(){
		map.ents.delete(this)
		this.ignored=true
	}
}
class Located extends Ent{
	x=0
	y=0//需要吗？
	get grid(){
		return map.getGrid(this.x,this.y)
	}
	canSetPos(x,y){
		return !map.blocked(x,y)
	}
	setPos(x,y){
		var oldgrid=this.grid
		this.x=x
		this.y=y
		if(this.grid!=oldgrid){
			oldgrid?.ents.delete(this)
			this.grid.ents.add(this)//建筑？
		}
	}
	_moveTo(x,y,dt){
		var k=this.speed*dt/map.dist(this,{x:x,y:y})
		if(k>=1)return [x,y]
		return [this.x+(x-this.x)*k,this.y+(y-this.y)*k]
	}
	toCenter(x,y){
		this.setPos(...(map.getGrid(x,y)||this.grid).center)
	}
	setGrid(grid){
		this.setPos(...grid.center)
	}
	getDist(tar){//减去半径
		var d=map.dist(this,tar)
		if(this.r)d-=this.r
		if(tar.r)d-=tar.r
		return d
	}
	getNearbyEnts(dist,fn=e=>true){
		var _fn=e=>e!=this&&fn(e)
		return map.findEnts(this.x,this.y,dist,_fn)
	}
	remove(){
		this.grid?.ents.delete(this)
		super.remove()
	}
}
class Visible extends Located{
	constructor(){
		super()
		map.ents_to_render.add(this)
	}
	get image(){
		return this.name
	}
	remove(){
		map.ents_to_render.delete(this)
		super.remove()
	}
}
class Building extends Visible{
	group=1 //都是玩家？
	constructor(atkR=2,health=100,r=0.4){
		super()
		this.atkR=atkR
		this.r=r
		this.maxHealth=health
		this.health=health
	}
	setPos(x,y){
		super.setPos(x,y)
		this.grid.building=this
	}
	getAttacked(dmg){
		this.health-=dmg
		if(this.health<=0)this.remove()
	}
	remove(){
		this.grid.building=null
		super.remove()
	}
}
class HomeBase extends Building{
	constructor(){
		super()
		map.homebase=this
	}
	remove(){
		map.homebase=null
		super.remove()
		console.log('输了。')
	}
}
class Tower extends Building{
	projectile='ball'
	cdLeft=0
	constructor(damage,atkR,cd){
		super()
		this.damage=damage
		this.atkR=atkR
		this.cd=cd
		map.ents_to_update.add(this)
	}
	cmpTarget(t1,t2){//比较优先级；t1优先时返回真
		return true
	}
	attack(e){
		var p=spawn(this.projectile)
		p.damage=this.damage
		p.track(this,e)
		this.cdLeft=this.cd
		return p
	}
	remove(){
		map.ents_to_update.remove(this)
		super.remove()
	}
	update(dt){
		if(this.cdLeft){
			this.cdLeft=Math.max(this.cdLeft-dt,0)
		}else{
			var tars=this.getNearbyEnts(this.atkR,e=>e.group==2),tar
			if(!tars.size)return
			for(let e of tars)if(this.cmpTarget(e,tar))tar=e
			this.attack(tar)
		}
	}
}
class Projectile extends Visible{//Mob只能沿grid移动
	constructor(speed=4){
		super()
		this.speed=speed
		map.ents_to_update.add(this)
	}
	track(origin,target){
		this.setPos(origin.x,origin.y)
		this.target=target
		this.tx=target.x
		this.ty=target.y
	}
	moveOn(dt){
		this.setPos(...this._moveTo(this.tx,this.ty,dt))
	}
	remove(){
		map.ents_to_update.delete(this)
		super.remove()
	}
	update(dt){
		if(this.getDist(this.target)<=0.1){
			this.target.getAttacked(this.damage) //damage来源于Tower
			this.remove()
		}else if(this.x==this.tx&&this.y==this.ty){
			this.remove()
		}else this.moveOn(dt)
	}
}
class Parabolic extends Projectile{//抛射物
	z=0
	rotate=0
	constructor(speed,gravity=1500){
		super(speed)
		this.gravity=gravity
	}
	get imageState(){
		return {
			z:this.z,
			rotate:this.rotate
		}
	}
	track(origin,target){
		super.track(origin,target)
		var t=map.dist(this,target)/this.speed
		this.vz=this.gravity*t/2
	}
	moveOn(dt){
		super.moveOn(dt)
		this.vz-=this.gravity*dt
		this.z+=this.vz*dt
		this.rotate+=dt*6
	}
}
class Bomb extends Parabolic{
	atkR=1
	explode(){
		var tars=this.getNearbyEnts(this.atkR,e=>e.group=2)
		tars.forEach(t=>t.getAttacked(this.damage))
		this.remove()
	}
	update(dt){
		if(this.x==this.tx&&this.y==this.ty){
			this.explode()
		}else this.moveOn(dt)
	}
}
class Tower1 extends Tower{
	constructor(){
		super(5,1.5,3)
	}
	attack(e){
		super.attack(e).z=20 //塔的高度
	}
}
class Ball extends Bomb{
	constructor(){
		super(1.5)
	}
}
class Mob extends Visible{
	static states={}
	constructor(speed=1){
		super()
		this.speed=speed
		this.setState('default')
		map.ents_to_update.add(this)
	}
	get image(){
		return this.state.image
	}
	setState(name){
		var State=this.constructor.states[name]||states[name]
		this.state=new State(this)
		this.state.name=name
		return this.state
	}
	canPass(g1,g2){
		return g2.tile!=2 //默认不能渡水
	}
	findPath(grid){
		return map.findPath(this.grid,grid,this.canPass)
	}
	moveTo(grid){
		this.setState('Moving').target(grid)
	}
	remove(){
		map.ents_to_update.delete(this)
		super.remove()
	}
	update(dt){
		this.state.update(dt)
	}
}
class Unit extends Mob{
	cdLeft=0
	constructor(health,damage,moreData={}){
		var {speed=0.3,cd=1,atkR=0.1}=moreData
		super(speed)
		this.maxHealth=health
		this.health=health
		this.damage=damage
		this.cd=cd
		this.atkR=atkR
	}
	attack(ent){//前置判断（距离、cd等）完成后调用
		ent.getAttacked(this.damage)
		this.cdLeft=this.cd
	}
	getAttacked(dmg){
		this.health-=dmg
		if(this.health<=0)this.remove()
	}
	update(dt){
		if(this.cdLeft)this.cdLeft=Math.max(this.cdLeft-dt,0)//最好先判断状态
		super.update(dt)
	}
}
class Enemy extends Unit{
	static states={default:states.Invading}
	group=2
}
class Corrupter extends Enemy{
	constructor(){
		super(10,1)
	}
	canPass(g1,g2){
		return map.hasRoad(g1,g2)
	}
}
class Spawner extends Ent{
	grids=new Set()
	cd=60
	cdLeft=3
	constructor(){
		super()
		map.ents_to_update.add(this)
	}
	remove(){
		map.ents_to_update.delete(this)
		super.remove()
	}
	update(dt){
		this.cdLeft-=dt
		if(this.cdLeft<=0){
			this.cdLeft=this.cd
			var e=spawn('corrupter')
			e.toCenter(2,4)
		}
	}
}

var prefabs={};
[
	HomeBase,
	Tower1,
	Ball,
	Corrupter,
	Spawner
].forEach(C=>{
	prefabs[C.name.toLocaleLowerCase()]=C
})

function init(m){
	map=m
}
function spawn(name){
	var C=prefabs[name]
	if(C)return new C()
	console.log('不存在名为"'+name+'"的prefab')
}

export {init,spawn}

//window.prefabs=prefabs
window.spawn=spawn