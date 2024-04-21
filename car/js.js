var g,l,cvs,ctx,anm,kw=0,ka=0,ks=0,kd=0,x,y,vx=0,vy=0,d,d1,abs=0;
const PI=Math.PI,dt=1000/60,r=20,dv=0.15,vm=7,vj=6;
function loadg(){
	cvs=document.getElementById('game');
	ctx=cvs.getContext('2d');
	var xh=new XMLHttpRequest();
	xh.open('GET','data/0.json');
	xh.onload=function(){
		var j=JSON.parse(xh.response);
		[x,y]=j.xy;
		g=j.g;
		l=g.length;
		anm=requestAnimationFrame(main);
	}
	xh.send();
}
function ak(){
	switch(event.keyCode){
		case 87:jump();break;
		case 65:ka=1;break;
		case 83:ks=1;break;
		case 68:kd=1;break;
	}
	if(event.keyCode==32)cancelAnimationFrame(anm);
}
function dk(){
	switch(event.keyCode){
		case 87:kw=0;break;
		case 65:ka=0;break;
		case 83:ks=0;break;
		case 68:kd=0;break;
	}
}
addEventListener("keydown",ak);
addEventListener("keyup",dk);
function main(){
	x+=vx;
	y+=vy;
	if(abs)abs--;//吸附
	d=d1=-1;//法线方向,-1表示未接触
	for(var i=0;i<l;i++){
		cra(g[i]);
	}
	if(d1>=0)mov(d1);
	else if(d>=0)mov(d);
	if(!abs)vy+=0.2;
	rdr();
	requestAnimationFrame(main);
}
function cra(g){//接触判定
	if(g.n=='rect'){
		if(x>=g.x1-r&&x<g.x1&&y>=g.y1&&y<=g.y2){//左
			x=g.x1-r;
			d=PI;
			clrv(d);
		}
		if(x>g.x2&&x<=g.x2+r&&y>=g.y1&&y<=g.y2){//右
			x=g.x2+r;
			d=0;
			clrv(d);
		}
		if(y>g.y2&&y<=g.y2+r&&x>=g.x1&&x<=g.x2){//下
			y=g.y2+r;
			d=PI*2;
			clrv(d);
		}
		if(y>=g.y1-r&&y<g.y1&&x>=g.x1&&x<=g.x2){//上
			y=g.y1-r;
			d1=PI*3/2;//优先
			clrv(d1);
		}
		if(x<g.x1&&y<g.y1&&dis(x-g.x1,y-g.y1)<=r){//左上
			d=ld(g.x1,g.y1,x,y);
			x=g.x1+r*Math.cos(d);
			y=g.y1+r*Math.sin(d);
			clrv(d);
		}
		if(x>g.x2&&y<g.y1&&dis(x-g.x2,y-g.y1)<=r){//右上
			d=ld(g.x2,g.y1,x,y);
			x=g.x2+r*Math.cos(d);
			y=g.y1+r*Math.sin(d);
			clrv(d);
		}
	}
	else if(g.n=='rarc'){
		var l=dis(x-g.x,y-g.y);
		if(g.r-r<=l&&l<g.r){
			switch(g.t){
				case 1:if(x<g.x||y<g.y)return;break;
				case 2:if(x>g.x||y<g.y)return;break;
				case 3:if(x>g.x||y>g.y)return;break;
				case 4:if(x<g.x||y>g.y)return;break;
			}
			d=ld(x,y,g.x,g.y);
			x=g.x+(r-g.r)*Math.cos(d);
			y=g.y+(r-g.r)*Math.sin(d);
			clrv(d);
		}
	}
}
function ld(x1,y1,x2,y2){//倾斜角
	var dx=x2-x1,dy=y2-y1;
	if(!dx)
		if(dy>0)return PI/2;
		else return -PI/2;
	var d=Math.atan(dy/dx);
	if(dx<0)d+=PI;
	else if(dy<0)d+=PI*2;
	return d;
}
var dis=(dx,dy)=>Math.sqrt(dx*dx+dy*dy);
function clrv(d){//清除法向速度
	if(!abs&&vx*Math.cos(d)+vy*Math.sin(d)>=0)return;//abs?
	var v=vx*Math.cos(d+PI/2)+vy*Math.sin(d+PI/2);
	vx=v*Math.cos(d+PI/2);
	vy=v*Math.sin(d+PI/2);
}
function mov(d){
	if(ka){
		if(kd)return;
		d-=PI/2;
	}
	if(kd)d+=PI/2;
	vx+=dv*Math.cos(d);
	vy+=dv*Math.sin(d);
	if(vx*Math.cos(d)+vy*Math.sin(d)>=vm-0.1){
		abs=10;
		vx=vm*Math.cos(d);
		vy=vm*Math.sin(d);
	}
}
function jump(){
	if(d1>=0)d=d1;
	if(d>=0){
		vx+=vj*Math.cos(d);
		vy+=vj*Math.sin(d);
		abs=0;
	}
}
function rdr(){
    ctx.clearRect(0,0,1024,768);
	ctx.fillStyle="#000";
	for(var i=0;i<l;i++)drw(g[i]);
	ctx.fillStyle="#22e";
	if(abs)ctx.fillStyle="#e22";
	ctx.beginPath();
	ctx.arc(x,y,r,0,PI*2);
    ctx.fill();
}
function drw(g){
	switch(g.n){
		case 'rect':ctx.fillRect(g.x1,g.y1,g.x2-g.x1,g.y2-g.y1);break;
		case 'arc':drwarc(g,g.t);break;
		case 'rarc':drwrarc(g,g.t);break;
	}
}
function drwarc(g,n){
	var x=g.x,y=g.y,r=g.r;
	ctx.beginPath();
	ctx.arc(x,y,r,PI*(n-1)/2,PI*n/2);
	ctx.lineTo(x,y);
	ctx.fill();
}
function drwrarc(g,n){
	var x=g.x,y=g.y,r=g.r;
	ctx.beginPath();
	ctx.arc(x,y,r,PI*(n-1)/2,PI*n/2);
	switch(n){
		case 1:ctx.lineTo(x+r,y+r);break;
		case 2:ctx.lineTo(x-r,y+r);break;
		case 3:ctx.lineTo(x-r,y-r);break;
		case 4:ctx.lineTo(x+r,y-r);break;
	}
	ctx.fill();
}