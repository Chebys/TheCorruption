//在 main.init 之前全部实例化，但此时还不能 GetImage
const entImages = Dict()

class EntImg{
	constructor(name, cx=0, cy=0, width, height){
		Object.assign(this, {
			name,
			cx, //实体中心在图片中的坐标（可超出图片）
			cy,
			width, //可选，默认使用图片大小
			height
		})
		entImages[name]=this
	}
	draw(ctx, x, y, rotate){
		if(typeof rotate=='number'){
			ctx.translate(x,y)
			ctx.rotate(rotate) //顺时针旋转
			drawImage(ctx,this,0,0)
			ctx.setTransform(1, 0, 0, 1, 0, 0) //归位
		}
		else drawImage(ctx,this,x,y)
	}
	
}

function drawImage(ctx, {name,cx,cy,width,height}, x, y){
	var args = [GetImage(name), x-cx, y-cy]
	width&&height ? ctx.drawImage(...args, width, height) : ctx.drawImage(...args)
}

function getEntImage(name){ //总是返回 EntImg
	GetImage(name) //若不存在则警告
	return entImages[name] || entImages.default
}

new EntImg('default', 32, 64) //必须

new EntImg('archertower', 64, 96)
new EntImg('arrow', 16, 16, 32, 32)
new EntImg('ball', 16, 16, 24, 24)
new EntImg('corrupter', 32, 48)
new EntImg('goldmine', 64, 64, 128, 128)
new EntImg('homebase', 32, 32)
new EntImg('tower1', 32, 48)

export {getEntImage}