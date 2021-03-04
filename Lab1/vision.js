const Flags = {
	ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
	ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
	ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
	ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
	ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
	ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
	fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
	fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
	fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
	fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
	fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
	flt30: {x:-57.5, y: 30}, flt20: {x:-57.5, y: 20},
	flt10: {x:-57.5, y: 10}, fl0: {x:-57.5, y: 0},
	flb10: {x:-57.5, y: -10}, flb20: {x:-57.5, y: -20},
	flb30: {x:-57.5, y: -30}, frt30: {x: 57.5, y: 30},
	frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
	fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
	frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
	fglt: {x:-52.5, y: 7.01}, fglb: {x:-52.5, y:-7.01},
	gl: {x:-52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
	fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
	fplb: {x: -36, y:-20.15}, fgrt: {x: 52.5, y: 7.01},
	fgrb: {x: 52.5, y:-7.01}, fprt: {x: 36, y: 20.15},
	fprc: {x: 36, y: 0}, fprb: {x: 36, y:-20.15},
	flt: {x:-52.5, y: 34}, fct: {x: 0, y: 34},
	frt: {x: 52.5, y: 34}, flb: {x:-52.5, y: -34},
	fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
	
	distance(f1, f2) {
	    return Math.sqrt((f1.x-f2.x)**2+(f1.y-f2.y)**2)
	},
	
	contains(f) {
	    if (f in Flags)
	        return true;
	    return false;
	},
}

module.exports =  {
    calculatePos(gameObjects){
        gameObjects.shift(); // удаляем первый элемент массива (номер такта)
        //console.log(gameObjects);
        gameObjects.sort((a,b) => { // сортировка объектов по возрастанию расстояния до них
            return a.p[0] - b.p[0];
        })
        //console.log(gameObjects);
        let flagsNearPlayer = [];
        gameObjects.forEach(element => {
            if (flagsNearPlayer.length == 3) {
                return
            }
            let objectName = element.cmd.p.join('');
            if (Flags.contains(objectName)){
                flagsNearPlayer.push({dist: element.p, pos: Flags[objectName]}) // добавляем в массив ближайщих флагов то, что видит игрок и реальные координаты флага
            }
            //console.log(objectName);

        });
        let playerCoord = this.calculateCoord(flagsNearPlayer);
        

    },

    calculateCoord(points){
        console.log(points);
        if (flags.length == 2){

        }
    }


}