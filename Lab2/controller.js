const Flags = require('./flags');

class Controller{
    constructor(purposes, agent){
        this.purposes = purposes;
        this.purposeIter = 0;
        this.curAct = this.purposes[this.purposeIter].act;
        //this.reachPoint = {};
        this.agent = agent;
        this.calcAngleManually = false;
        this.ballControl = false;
    }

    processEnv(env){
        let playerPos = env.vision.myself;
        //console.log(env.sense);
        if (env.vision.myAngle != undefined){
            this.agent.playerAngle = env.vision.myAngle;
            this.calcAngleManually = false;
        }
        else{
            this.calcAngleManually = true;
            //console.log("Считаем угол сами")
        }

        //console.log(`playerAngle =  ${this.agent.playerAngle}`);

        this.recalculate(env, playerPos);
		//console.log(this.objectDistance);

        if (this.curAct === "flag"){
            if (this.objectDistance <= 3){
                this.nextAct();
                this.agent.socketSend("dash", "0");
                //this.processEnv(env);
            }
            else{
                this.moveToPoint();
            }

        }
        else if (this.curAct === "kick"){
            this.moveToPoint();
        }

    }

    calculateToFlag(playerPos, flagName, env){
        let reachPoint = Flags[flagName];

        // проверяем видит ли игрок нужный флаг 
        let visibleFlag = env.vision.flags.find((item) => {
            return item.name === flagName;
        });
        if (visibleFlag != undefined){
            // если видит, берем дистанцию до флага и угол из того, что игрок видит
            //console.log("Видим флаг") 

            this.objectDistance = visibleFlag.dist;
            this.angleToResearchPoint = -visibleFlag.angle;
        }
        else { 
            // если не видит, то расчитываем сами
            //console.log("Не видим флаг") 

            this.objectDistance = Flags.distance(playerPos, reachPoint);
            this.angleToResearchPoint = this.agent.playerAngle - Flags.calculateAngle(playerPos, reachPoint);
            //console.log("calculatedAngle = " + Flags.calculateAngle(playerPos, this.reachPoint));

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
    
    recalculate(env, playerPos) {
    	if (this.curAct === "flag"){
            this.calculateToFlag(playerPos, this.purposes[this.purposeIter].fl, env)
        }
        else if(this.curAct === "kick"){
            if (this.ballControl === true){
                // если на предыдущем шаге, мы пнули мяч, разворачиваемся в сторону летящего мяча
                this.moveToPoint();
                this.ballControl = false;
                return
            }
            // цель мяч
            if (env.vision.ball === undefined){
                // если не видим мяч, бежим в центр
                this.calculateToFlag(playerPos, "fc", env)
            }
            else{
                //console.log(env.vision.ball);
                let ballDist = env.vision.ball[0];
                if (ballDist <= 0.5){
                    // если мы с мячом бежим к воротам
                    this.ballControl = true;
                    this.calculateToFlag(playerPos, this.purposes[this.purposeIter].goal, env);
                    let kickPower = 100
                    if (this.objectDistance > 25){
                        kickPower = 50
                    }
                    this.agent.socketSend("kick", `${kickPower} ${-this.angleToResearchPoint}`);
                }
                else {
                    // бежим к мячу
                    this.objectDistance = ballDist;
                    this.angleToResearchPoint = -env.vision.ball[1];
                }
            }
        }
    }


    // переключаемся на следующую цель, обнулив вычисляемые параметры
    nextAct(){
        console.log("Поменяли цель \n")
        this.purposeIter = (this.purposeIter + 1) % this.purposes.length;
        this.curAct = this.purposes[this.purposeIter].act;
    }

    // поворачивает игрока в направлении цели
    moveToPoint(){

        this.angleToResearchPoint = Math.round(this.angleToResearchPoint);
        if (Math.abs(this.angleToResearchPoint) >= 7){
            //console.log("PlayerAngle = " + this.agent.playerAngle)
        	//console.log("Вот это папапаварот " + -this.angleToResearchPoint + "\n");
            this.agent.socketSend("turn", -this.angleToResearchPoint);
            if (this.calcAngleManually){
                this.agent.playerAngle += this.angleToResearchPoint;
                this.agent.playerAngle = (this.agent.playerAngle % 360 + 360) % 360;
                //console.log("Угол игрока ", this.agent.playerAngle);
            }
        }
        else{
            //console.log("Вперед \n")
            let vel = 100;
            if (this.objectDistance < 5){
                vel = 50;
            }
            this.agent.socketSend("dash", `${vel}`);
        }
    }


}


module.exports = Controller;