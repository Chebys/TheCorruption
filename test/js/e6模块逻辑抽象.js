//应该是这样？
/*一些结论：
 *若m1 import了 m2，且m2没有import其他模块，则m2先于m1执行
 *若m1 import了 m2，且这是m2第一次被import（即m2未加载），则m2先于m1执行
 *若m1 import了 m2，但m2后于m1执行，唯一的可能是：
 **加载m1时，m2已加载但未加入执行队列（意味着m2必定直接或间接地import了m1）
 *（推论）若m1 import了 m2，且m2没有直接或间接地import m1（或者说，m2不依赖m1），则m2先于m1执行
 *入口点模块总是最后执行
 */
function import(m){
	if(m已加载)return; //只会在第一次import中加入执行队列
	加载(m);
	for(m1 of m导入的模块)import(m1); //若无则跳过
	加入执行队列(m);
}
//模块是静态加载的。所有模块加载完毕后，再根据执行队列中的顺序执行模块

function 加载(m){
	//弄清楚import了哪些模块，export了哪些值，忽略其他语句
	//由于没有执行，只知道导出值的标识符而没有具体值（即使以字面量导出），甚至不知道是否已定义
}
function 执行(m){
	//根据import语句创建常量（可能未初始化，见下）
	//其他语句按顺序执行，为导出的标识符赋值
	//若m从m1导入v，但m1未执行，则v处于暂时性死区；直到m1导出v的语句执行完毕
}
function 加入执行队列(m){
	执行队列.push(m)
}
