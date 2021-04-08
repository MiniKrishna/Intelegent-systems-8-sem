const Flags = require('./flags');
const trees = require('./trees')

class Controller{
    constructor(agent){
        this.agent = agent;
        this.calcAngleManually = false;
        this.ballControl = false;
        this.dt = trees.PlayerTree;
        this.sequenceIter = 0;
    }

    processEnv(env){
        this.env = env;

        //if (this.agent.goalie == false) return;
        ///console.log(env.vision.myAngle);

        if (env.vision.myAngle != undefined){
            this.agent.playerAngle = env.vision.myAngle;
            this.calcAngleManually = false;
        }
        else{
            this.calcAngleManually = true;
            //console.log("Считаем угол сами")
        }

        this.getAction("root");
        //console.log("\n")

    }

    getAction(title){
        //console.log(title);
        const action = this.dt[title]
        if(typeof action.exec == "function") {
            action.exec(this, this.dt.state)
            return this.getAction(action.next);
        }
        if(typeof action.condition == "function") {
            const cond = action.condition(this, this.dt.state)
            if(cond)
                return this.getAction(action.trueCond);
                return this.getAction(action.falseCond);
            }
        if(typeof action.command == "function") {
            action.command(this, this.dt.state);
            return 
        }
        throw new Error(`Unexpected node in DT: ${title}`)
    }

    kickBall(kickPower){
        this.agent.socketSend("kick", `${kickPower} ${-this.angleToResearchPoint}`);
    }

    nextAct(){
        if (this.agent.goalie === true) return;
        this.sequenceIter = (this.sequenceIter + 1) % this.dt.state.sequence.length;
    }


    calculateToFlag(flagName){
        let reachPoint = Flags[flagName];
        let playerPos = this.env.vision.myself;

        //console.log("player =  x = " + playerPos.x + " y = " + playerPos.y);
        //console.log("flag =  x =" + reachPoint.x + "y = " + reachPoint.y );

        // проверяем видит ли игрок нужный флаг 
        let visibleFlag = this.env.vision.flags.find((item) => {
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
            //console.log("playerAngle = " + this.agent.playerAngle);
            //console.log("calculatedAngle = " + Flags.calculateAngle(playerPos, reachPoint));

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
    

    rotateAgent(){
        //console.log("PlayerAngle = " + this.agent.playerAngle)
        //console.log("Вот это папапаварот " + -this.angleToResearchPoint + "\n");
        this.angleToResearchPoint = Math.round(this.angleToResearchPoint);
        this.agent.socketSend("turn", -this.angleToResearchPoint);
        if (this.calcAngleManually){
            this.agent.playerAngle += this.angleToResearchPoint;
            this.agent.playerAngle = (this.agent.playerAngle % 360 + 360) % 360;
            //console.log("Угол игрока ", this.agent.playerAngle);
        }
    }


    catchBall(){
        this.agent.socketSend("catch", `${-this.angleToResearchPoint}`);
    }


    dashAgent(vel){
        this.agent.socketSend("dash", `${vel}`);
    }

    setGoalie(){
        this.agent.goalie = true;
        this.dt = trees.GoalieTree;
    }

    getTeam(){
        return this.agent.teamName;
    }

    getTeamMates(){
        let teamMates = [];
        this.env.vision.players.forEach(element => {
            //console.log(element.team);
            //console.log(this.agent.teamName);
            if (element.team === this.agent.teamName){
                teamMates.push(element);
            }
        });
        return teamMates;
    }

}


module.exports = Controller;