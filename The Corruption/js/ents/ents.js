import states from '/ents/states.js'
import {getCvsVector} from '/render.js'

class CD{
	constructor(total, left){
		this.total=total
		this.left=left??total
	}
	get ready(){
		return !this.left
	}
	refresh(){
		this.left=this.total
	}
	update(dt, autoRefresh){ //无需前置判断
		this.left=Math.max(this.left-dt,0)
		if(autoRefresh&&this.ready){
			this.refresh()
			return true
		}
	}
}

class AnimState{
	constructor(ent){
		this.ent=ent
		//this.rotate=0
	}
	get imageName(){
		return this.ent.name
	}
	applyDirection({x,y,z}){
		var [x,y] = getCvsVector(x,y,z)
		this.rotate = Math.atan2(y,x)
	}
}

class Ent{
	constructor(){
		TheMap.ents.add(this)
	}
	get name(){ //代码名
		return this.constructor.name.toLocaleLowerCase()
	}
	get isValid(){
		return !this.ignored
	}
	DoTaskInTime(time, fn, ...args){
		DoTaskInTime(time, fn.bind(this, ...args))
	}
	startUpdating(){
		TheMap.ents_to_update.add(this)
	}
	stopUpdating(){
		TheMap.ents_to_update.delete(this)
	}
	remove(){
		TheMap.ents.delete(this)
		this.ignored=true //用于检查引用是否有效
		if(Ctrl.sel==this)Ctrl.reset()
	}
}
class Located extends Ent{
	x = 0
	y = 0
	get grid(){
		return TheMap.getGrid(this.x,this.y)
	}
	get isOutOfRange(){
		return TheMap.dist(this, {x:0, y:0}) >= TheMap.MAX_RANGE
	}
	canSetPos(x,y){
		return !TheMap.blocked(x,y)
	}
	setPos(x,y){ //暂时不考虑高度
		this.x=x
		this.y=y
	}
	_moveTo(x,y,dt){ //需要this.speed
		var k = this.speed*dt / TheMap.dist(this, {x,y})
		if(k>=1)return [x,y]
		return [this.x+(x-this.x)*k, this.y+(y-this.y)*k]
	}
	toCenter(x,y){
		this.setPos(...(TheMap.getGrid(x,y)||this.grid).center)
	}
	setGrid(grid){
		this.setPos(...grid.center)
	}
	atCenter(grid){
		var [tx,ty]=grid.center
		return this.x==tx &&this.y==ty
	}
	getDist(tar){ //减去半径
		//高度？
		var d = TheMap.dist(this,tar)
		if(this.r)d -= this.r
		if(tar.r)d -= tar.r
		return d<0 ? 0 : d
	}
	getNearbyUnits(dist,fn=e=>true){
		var _fn=e=>e!=this&&fn(e)
		return TheMap.findUnits(this.x,this.y,dist,_fn)
	}
}
class Visible extends Located{
	anim = new AnimState(this)
	constructor(){
		super()
		TheMap.ents_to_render.add(this)
	}
	remove(){
		TheMap.ents_to_render.delete(this)
		super.remove()
	}
}
class Living extends Visible{
	health=10
	onDeath(cause){ //用于重写；返回真值时remove
		return true
	}
	getAttacked(dmg, attacker, type){
		this.health-=dmg
		if(this.health<=0)this.onDeath()&&this.remove()
	}
}
class Building extends Living{
	group=1 //默认为玩家
	constructor(health=100, r=0.4){
		super()
		this.maxHealth=health
		this.health=health
		this.r=r
	}
	setPos(x,y){
		super.setPos(x,y)
		this.grid.building=this
	}
	remove(){
		this.grid.building=null
		super.remove()
	}
}
class Projectile extends Visible{ //不用Mob，因为Mob只能沿grid移动
	z = 0
	damage = 0 //由Tower设置
	direction = new Vector
	constructor(speed=4){
		super()
		this.speed=speed
		this.startUpdating()
	}
	track({x,y,z0}, target){
		this.setPos(x,y)
		this.z=z0
		this.target=target
		this.tx=target.x
		this.ty=target.y
		var t=TheMap.dist(this,target)/this.speed
		this.vz=-z0/t
		return t
	}
	moveOn(dt){ //只负责移动，其他判断交给update
		var [tx, ty] = this._moveTo(this.tx,this.ty,dt)
		var dz = this.vz*dt
		this.direction.set(tx-this.x, ty-this.y, dz)
		this.setPos(tx, ty)
		this.z += dz
	}
	onReach(){
		this.target.getAttacked(this.damage)
		this.remove()
	}
	onEnd(){ //通常无需重写
		this.onLand()
	}
	onLand(){
		this.remove()
	}
	remove(){
		this.stopUpdating()
		super.remove()
	}
	update(dt){ //尽量不要重写update，而是重写事件监听
		if(this.getDist(this.target)<=0.1){
			this.onReach()
		}else if(this.x==this.tx && this.y==this.ty){
			this.onEnd()
		}else if(this.z<0){
			this.onLand()
		}else{
			this.moveOn(dt)
		}
	}
}

class Mob extends Living{
	static states={}
	constructor(speed=1){
		super()
		this.speed=speed
		this.setState('default')
		this.startUpdating()
	}
	setState(name){
		name=this.constructor.states[name]||name
		var State=states[name]
		this.state=new State(this)
		this.state.name=name
		return this.state
	}
	canPass(g1,g2){
		return g2.tile!=2 //默认不能渡水
	}
	findPath(grid){ //无则返回undefined
		return TheMap.findPath(this.grid, grid, (g1,g2)=>this.canPass(g1,g2))
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
	constructor(health=10, damage=1, moreData={}){
		var {speed=0.3, cd=1, atkR=0.1} = moreData
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
	attack(ent){ //前置判断（距离、cd等）完成后调用
		ent.getAttacked(this.damage, this)
		this.cd.refresh()
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

class Mater extends Building{
	group=2
}

class Spawner extends Located{
	constructor(child,cd){
		super()
		this.child=child
		this.cd=new CD(cd,cd)
		this.startUpdating()
	}
	remove(){
		this.stopUpdating()
		super.remove()
	}
	update(dt){
		this.cd.update(dt,true)
			&&TheMap.spawn(this.child).setPos(this.x,this.y)
	}
}
class CorrupterSpawner extends Spawner{
	constructor(){
		super('corrupter',10)
	}
}
class AreaSpawner extends Ent{
	
}

export {CD, Building, Projectile, Unit}
export default [Mater, CorrupterSpawner]