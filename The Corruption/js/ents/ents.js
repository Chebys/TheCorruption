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
	update(dt, autoRefresh){ //无需前置判断
		this.left=Math.max(this.left-dt,0)
		if(autoRefresh&&this.ready){
			this.refresh()
			return true
		}
	}
}

class Ent{
	constructor(){
		TheMap.ents.add(this)
	}
	get name(){
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
	x=0
	y=0//需要吗？
	get grid(){
		return TheMap.getGrid(this.x,this.y)
	}
	canSetPos(x,y){
		return !TheMap.blocked(x,y)
	}
	setPos(x,y){ //暂时不考虑高度
		this.x=x
		this.y=y
	}
	_moveTo(x,y,dt){ //需要this.speed
		var k=this.speed*dt/TheMap.dist(this,{x:x,y:y})
		if(k>=1)return [x,y]
		return [this.x+(x-this.x)*k,this.y+(y-this.y)*k]
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
		var d=TheMap.dist(this,tar)
		if(this.r)d-=this.r
		if(tar.r)d-=tar.r
		return d
	}
	getNearbyUnits(dist,fn=e=>true){
		var _fn=e=>e!=this&&fn(e)
		return TheMap.findUnits(this.x,this.y,dist,_fn)
	}
}
class Visible extends Located{
	constructor(){
		super()
		TheMap.ents_to_render.add(this)
	}
	get imageName(){
		return this.name
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
class Projectile extends Visible{//Mob只能沿grid移动
	z=0
	damage=0 //damage来源于Tower
	constructor(speed=4){
		super()
		this.speed=speed
		this.startUpdating()
	}
	//get imageState(){}
	track({x,y,z0},target){
		this.setPos(x,y)
		this.z=z0
		this.target=target
		this.tx=target.x
		this.ty=target.y
		var t=TheMap.dist(this,target)/this.speed
		this.vz=-z0/t
		return t
	}
	moveOn(dt){
		this.setPos(...this._moveTo(this.tx,this.ty,dt))
		this.z+=this.vz*dt
	}
	remove(){
		this.stopUpdating()
		super.remove()
	}
	update(dt){
		if(this.getDist(this.target)<=0.1){
			this.target.getAttacked(this.damage)
			this.remove()
		}else if(this.x==this.tx&&this.y==this.ty){
			this.remove()
		}else this.moveOn(dt)
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
	get imageName(){
		return this.state.imageName
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