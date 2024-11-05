import {CD, Building} from './ents.js'

class Wall extends Building{
	get isWall(){
		return true
	}
}
class HomeBase extends Building{
	constructor(){
		super()
		TheMap.homebase?.remove()
		TheMap.homebase=this
	}
	onDeath(cause){
		TheMap.pushEvent('lose')
		return true
	}
	remove(){
		TheMap.homebase=null
		super.remove()
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
			&&(TheMap.stats.gold+=1)
	}
}
class Tower extends Building{//远程
	projectile='ball'
	constructor({dmg, atkR, cd, z0}){
		super()
		this.damage=dmg
		this.atkR=atkR
		this.cd=new CD(cd,0)
		this.z0=z0 //发射弹药的初始高度
		this.startUpdating()
	}
	cmpTarget(t1,t2){//比较优先级；t1优先时返回真
		return true
	}
	attack(e){
		var p=TheMap.spawn(this.projectile)
		p.damage=this.damage
		p.track(this,e)
		this.cd.refresh()
		return p
	}
	remove(){
		this.stopUpdating()
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

class ArcherTower extends Tower{
	projectile='arrow'
	constructor(){
		super({dmg:2, atkR:2, cd:2, z0:0.7})
	}
}

class Tower1 extends Tower{
	constructor(){
		super({dmg:2, atkR:1.5, cd:3, z0:0.4})
	}
}


export default [Wall, HomeBase, GoldMine, ArcherTower, Tower1]