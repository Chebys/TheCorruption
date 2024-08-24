class LinkedList{
	constructor(iterable){
		if(iterable)
			for(let v of iterable)
				this.push(v)
	}
	
	head=null
	tail=null
	_insert(v, p){ //新建值为v的节点插入到p之前；若p为假，则将新节点作为唯一节点
		var node={v:v}
		if(!p){
			this.head=this.tail=node
		}else{
			let pre=p.pre
			if(pre){//p不是第一个
				pre.next=node
				node.pre=pre
			}else{
				this.head=node
			}
			node.next=p
			p.pre=node
		}
	}
	_remove(p){
		
	}
	get length(){
		var l=0
		for(let _ of this)l++
		return l
	}
	*nodes(){
		for(let p=this.head; p; p=p.next)yield p
	}
	*[Symbol.iterator](){
		for(let p=this.head; p; p=p.next)yield p.v	//for(let p of this.nodes())yield p.v 效率更低？
	}
	push(v){
		var node={v:v}
		if(!this.head){
			this.head=this.tail=node
		}else{
			this.tail.next=node
			node.pre=this.tail
			this.tail=node
		}
	}
	pop(){
		var t=this.tail
		if(!t)return
		if(t.pre){
			this.tail=t.pre
			this.tail.next=null
		}else{
			this.head=this.tail=null
		}
		return t.v
	}
	unshift(v){
		this._insert(v, this.head)
	}
	shift(){
		var t=this.head
		if(!t)return
		if(t.next){
			this.head=t.next
			this.head.pre=null
		}else{
			this.head=this.tail=null
		}
		return t.v
	}
	insert(v, fn){//将v插入到第一个满足 fn(v,v1)为真 的v1之前；若无则push
		for(let p of this.nodes())
			if(fn(v, p.v)){
				this._insert(v, p)
				return
			}
		this.push(v)
	}
	sort(cmp){ //todo
		console.log('排序')
	}
	forEach(fn){
		for(let v of this)fn(v)
	}
	toArray(){
		var arr=[]
		for(let v of this)arr.push(v)
		return arr
	}
}
export default LinkedList