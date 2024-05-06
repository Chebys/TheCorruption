import {images} from './assets.js'
import map from './map.js'
import states from'./states.js'

class CD{
	constructor(total,left){
		this.total=total
		this.left=left??total
	}
	get ready(){
		return !this.left
	}
	refresh(){
		this.left=this.total
	}
	update(dt,autoRefresh){//无需前置判断
		this.left=Math.max(this.left-dt,0)
		if(autoRefresh&&this.ready){
			this.refresh()
			return true
		}
	}
}

class Ent{
	constructor(){
		map.ents.add(this)
	}
	get name(){
		return this.constructor.name.toLocaleLowerCase()
	}
	startUpdating(){
		map.ents_to_update.add(this)
	}
	stopUpdating(){
		map.ents_to_update.delete(this)
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
		this.x=x
		this.y=y
	}
	_moveTo(x,y,dt){//需要this.speed
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
	getNearbyUnits(dist,fn=e=>true){
		var _fn=e=>e!=this&&fn(e)
		return map.findUnits(this.x,this.y,dist,_fn)
	}
}
class Visible extends Located{
	constructor(){
		super()
		map.ents_to_render.add(this)
	}
	get image(){
		return images[this.name]||images.default
	}
	remove(){
		map.ents_to_render.delete(this)
		super.remove()
	}
}
class Building extends Visible{
	group=1 //都是玩家？
	constructor(health=100,r=0.4){
		super()
		this.r=r
		this.maxHealth=health
		this.health=health
	}
	get isWall(){
		return this instanceof Wall
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
class Wall extends Building{
	
}
class HomeBase extends Building{
	constructor(){
		super()
		map.homebase?.remove(true)
		map.homebase=this
	}
	remove(noLose){
		map.homebase=null
		super.remove()
		if(noLose)return
		alert('输了。')
	}
}
class Tower extends Building{
	projectile='ball'
	constructor(damage,atkR,cd){
		super()
		this.damage=damage
		this.atkR=atkR
		this.cd=new CD(cd,0)
		this.startUpdating()
	}
	cmpTarget(t1,t2){//比较优先级；t1优先时返回真
		return true
	}
	attack(e){
		var p=spawn(this.projectile)
		p.damage=this.damage
		p.track(this,e)
		this.cd.refresh()
		return p
	}
	remove(){
		map.ents_to_update.remove(this)
		super.remove()
	}
	update(dt){
		if(this.cd.ready){
			let tars=this.getNearbyUnits(this.atkR,e=>e.group==2),tar
			if(!tars.size)return
			for(let e of tars)if(this.cmpTarget(e,tar))tar=e
			this.attack(tar)
		}else{
			this.cd.update(dt)
		}
	}
}
class Projectile extends Visible{//Mob只能沿grid移动
	constructor(speed=4){
		super()
		this.speed=speed
		this.startUpdating()
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
		this.stopUpdating()
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
		var tars=this.getNearbyUnits(this.atkR,e=>e.group==2)
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
		super(2,1.5,3)
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
class GoldMine extends Building{
	constructor(){
		super()
		this.cd=new CD(1)
		this.startUpdating()
	}
	update(dt){
		this.cd.update(dt,true)
			&&(map.stats.gold+=1)
	}
}
class Mob extends Visible{
	static states={}
	constructor(speed=1){
		super()
		this.speed=speed
		this.setState('default')
		this.startUpdating()
	}
	get image(){
		return images[this.state.imageName]||images.default
	}
	setState(name){
		var State=this.constructor.states[name]||states[name]
		this.state=new State(this)
		this.state.name=name
		return this.state
	}
	canPass(g1,g2){//作为参数传递，不能出现this？
		return g2.tile!=2 //默认不能渡水
	}
	findPath(grid){
		return map.findPath(this.grid,grid,this.canPass)
	}
	moveTo(grid){
		this.setState('Moving').target(grid)
	}
	remove(){
		this.stopUpdating()
		super.remove()
	}
	update(dt){
		this.state.update(dt)
	}
}
class Unit extends Mob{
	constructor(health,damage,moreData={}){
		var {speed=0.3,cd=1,atkR=0.1}=moreData
		super(speed)
		this.maxHealth=health
		this.health=health
		this.damage=damage
		this.cd=new CD(cd,0)
		this.atkR=atkR
	}
	setPos(x,y){
		var oldGrid=this.grid
		super.setPos(x,y)
		if(oldGrid!=this.grid){
			oldGrid?.units.delete(this)
			this.grid.units.add(this)
		}
	}
	attack(ent){//前置判断（距离、cd等）完成后调用
		ent.getAttacked(this.damage)
		this.cd.refresh()
	}
	getAttacked(dmg){
		this.health-=dmg
		if(this.health<=0)this.remove()
	}
	remove(){
		this.grid?.units.delete(this)
		super.remove()
	}
	update(dt){
		this.cd.update(dt)//最好先判断状态
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
class Spawner extends Located{
	constructor(){
		super()
		this.cd=new CD(60,3)
		this.startUpdating()
	}
	remove(){
		this.stopUpdating()
		super.remove()
	}
	update(dt){
		this.cd.update(dt,true)
			&&spawn('corrupter').setPos(this.x,this.y)
	}
}
class AreaSpawner extends Ent{
	
}

var prefabs={};
[
	Wall,
	HomeBase,
	Tower1,
	Ball,
	GoldMine,
	Corrupter,
	Spawner
].forEach(C=>{
	prefabs[C.name.toLocaleLowerCase()]=C
})

function spawn(name){
	var C=prefabs[name]
	if(C)return new C()
	console.error('不存在名为"'+name+'"的prefab')
}

export {spawn}

//window.prefabs=prefabs
window.spawn=spawn