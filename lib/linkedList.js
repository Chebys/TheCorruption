class LinkedList{
	head=null
	tail=null
	get length(){
		var l=0
		this.forEach(v=>l++)
		return l
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
		var node={v:v}
		if(!this.head){
			this.head=this.tail=node
		}else{
			this.head.pre=node
			node.next=this.head
			this.head=node
		}
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
	insert(v,fn){//将v插入到第一个满足 fn(v,v1)为真 的v1之前；若无则push
		var node={v:v}
		if(!this.head){
			this.head=this.tail=node
			return
		}
		for(let p=this.head;p;p=p.next)
			if(fn(v,p.v)){
				let pre=p.pre
				if(pre){//p不是第一个
					pre.next=node
					node.pre=pre
				}else this.head=node
				node.next=p
				p.pre=node
				return
			}
		this.tail.next=node
		node.pre=this.tail
		this.tail=node
	}
	sort(cmp){
		console.log('排序')
	}
	forEach(fn){
		for(let p=this.head;p;p=p.next)fn(p.v)
	}
	toArray(){
		var arr=[]
		this.forEach(v=>arr.push(v))
		return arr
	}
}
export default LinkedList