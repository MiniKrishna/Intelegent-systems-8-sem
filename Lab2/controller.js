const Flags = require('./flags');

class Controller{
    constructor(purposes, agent){
        this.purposes = purposes;
        this.purposeIter = 0;
        this.curAct = this.purposes[this.purposeIter].act;
        this.reachPoint = {};
        this.agent = agent;
    }

    processEnv(env){
        let playerPos = env.vision.myself;

        this.recalculate(env, playerPos);
		console.log(this.objectDistance);
        if (this.objectDistance <= 3){
            if (this.curAct === "flag"){
                this.nextAct();
                this.agent.socketSend("dash", "-0");
                this.processEnv(env);
            }
        }
        else {
        	
            this.moveToPoint();
        }
    }
    
    recalculate(env, playerPos) {
    	if (this.curAct === "flag"){
            this.reachPoint = Flags[this.purposes[this.purposeIter].fl];

            // проверяем видит ли игрок нужный флаг 
            let visibleFlag = env.vision.flags.find((item) => {
                return item.name === this.purposes[this.purposeIter].fl;
            })
            if (visibleFlag != undefined){
                // если видит, берем дистанцию до флага и угол из того, что игрок видит
                console.log("Видим флаг") 

                this.objectDistance = visibleFlag.dist;
                this.angleToResearchPoint = -visibleFlag.angle;
            }
            else { 
                // если не видит, то расчитываем сами
                console.log("Не видим флаг") 

                this.objectDistance = Flags.distance(playerPos, this.reachPoint);
                this.angleToResearchPoint = this.agent.playerAngle - this.calculateAngle(playerPos, this.reachPoint);
                console.log("Player angle -" + this.agent.playerAngle + "  calculatedAngle - " + this.calculateAngle(playerPos, this.reachPoint));

                if (Math.abs(this.angleToResearchPoint) > 180) {
                	if (this.angleToResearchPoint < 0)
                		this.angleToResearchPoint =  -(this.angleToResearchPoint + 360)
                	else
                		this.angleToResearchPoint =  (-this.angleToResearchPoint + 360)
                }
                else {
                	this.angleToResearchPoint =  -this.angleToResearchPoint;
                }
            }  
        }
    }

    // переключаемся на следующую цель, обнулив вычисляемые параметры
    nextAct(){

        this.purposeIter = (this.purposeIter + 1) % this.purposes.length;
        this.curAct = this.purposes[this.purposeIter].act;
    }

    // поворачивает игрока в направлении цели
    moveToPoint(){

        this.angleToResearchPoint = Math.round(this.angleToResearchPoint);
        if (Math.abs(this.angleToResearchPoint) >= 5){
        	console.log("Вот это папапаварот " + this.angleToResearchPoint);
            this.agent.socketSend("turn", -this.angleToResearchPoint);
            
            this.agent.playerAngle += this.angleToResearchPoint;
            this.agent.playerAngle = (this.agent.playerAngle % 360 + 360) % 360;
            //console.log("Угол игрока ", this.agent.playerAngle);
        }
        else{
            console.log("Вперед \n")
            this.agent.socketSend("dash", "100");
        }
    }

    // возвращает угол в градусах между двумя точками
    calculateAngle(point1, point2){
    	console.log(point1);
    	console.log(point2);
    	let deltaX = point2.x - point1.x;
    	let deltaY = point2.y - point1.y;
    	let angle = Math.atan(deltaY / deltaX) * 180 / Math.PI;

    	if (deltaX > 0) {
    		if (deltaY > 0) return angle;
    		else return 360 + angle;
    	}
    	else {
    		return 180 + angle;
    	}
    }
}


module.exports = Controller;