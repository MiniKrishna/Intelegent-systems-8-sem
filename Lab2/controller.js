const Flags = require('./flags');

class Controller{
    constructor(purposes, agent){
        this.purposes = purposes;
        this.purposeIter = 0;
        this.curAct = this.purposes[this.purposeIter].act;
        this.reachPoint = {};
        this.agent = agent;
 		this.reset();
    }

    processEnv(env){
        let playerPos = env.vision.myself;
        let playerAngle = env.sense.find((elem) => {
             return elem.cmd === "speed";
        }).p[1];
        console.log("Player angle = " + playerAngle);
        
        this.recalculate(env, playerAngle, playerPos);

        if (this.objectDistance <= 3){
            if (curAct === "flag"){
                this.nextAct();
                this.agent.socketSend("dash", "-100");
                this.processEnv(env);
            }
        }
        else {
            this.moveToPoint();
        }
    }
    
    recalculate(env, playerAngle, playerPos) {
    	if (this.curAct === "flag"){
            this.reachPoint = Flags[this.purposes[this.purposeIter].fl];

            // проверяем видит ли игрок нужный флаг 
            let visibleFlag = env.vision.flags.find((item) => {
                return item.name === this.purposes[this.purposeIter].fl;
            })
            if (visibleFlag != undefined){
                // если видит, берем дистанцию до флага и угол из того, что игрок видит 
                this.objectDistance = visibleFlag.dist;
                     this.angleToResearchPoint = visibleFlag.angle;
            }
            else { 
                // если не видит, то расчитываем сами
                this.objectDistance = Flags.distance(playerPos, this.reachPoint);
                     this.angleToResearchPoint = playerAngle - this.calculateAngle(playerPos, this.reachPoint);
            }  
        }
    }

    reset(){
        this.angleToResearchPoint = undefined;
        this.objectDistance = undefined;
    }
    
    // переключаемся на следующую цель, обнулив вычисляемые параметры
    nextAct(){
        this.purposeIter = (this.purposeIter + 1) % this.purposes.length;
        this.curAct = this.purposes[this.purposeIter].act;
        this.reset();
    }

    // поворачивает игрока в направлении цели
    moveToPoint(){
        if (this.angleToResearchPoint >= 3){
            this.agent.socketSend("turn", this.angleToResearchPoint);
        }
        else{
            this.agent.socketSend("dash", "100");
        }
    }

    // возвращает угол в градусах между двумя точками
    calculateAngle(point1, point2){
        return Math.atan((point1.y - point2.y) / (point1.x - point2.x)) * 180 / Math.PI;
    }
}


module.exports = Controller;