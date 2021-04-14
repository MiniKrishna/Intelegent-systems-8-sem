const Flags = require('./flags');
const trees = require('./trees')

class Controller{
    constructor(agent, tree){
        this.agent = agent;
        this.calcAngleManually = false;
        this.ballControl = false;
        this.dt = tree;
        console.log(this.dt);
        this.sequenceIter = 0;
    }

    processEnv(env){
        this.env = env;

        //if (this.agent.goalie == false) return;

        if (env.vision.myAngle != undefined){
            this.agent.playerAngle = env.vision.myAngle;
            this.calcAngleManually = false;
        }
        else{
            this.calcAngleManually = true;
        }

        this.getAction("root");
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

        // проверяем видит ли игрок нужный флаг 
        let visibleFlag = this.env.vision.flags.find((item) => {
            return item.name === flagName;
        });
        if (visibleFlag != undefined){
            // если видит, берем дистанцию до флага и угол из того, что игрок видит
            this.objectDistance = visibleFlag.dist;
            this.angleToResearchPoint = -visibleFlag.angle;
        }
        else { 
            // если не видит, то расчитываем сами
            this.objectDistance = Flags.distance(playerPos, reachPoint);
            this.angleToResearchPoint = this.agent.playerAngle - Flags.calculateAngle(playerPos, reachPoint);

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
        this.angleToResearchPoint = Math.round(this.angleToResearchPoint);
        this.agent.socketSend("turn", -this.angleToResearchPoint);

        if (this.calcAngleManually){
            this.agent.playerAngle += this.angleToResearchPoint;
            this.agent.playerAngle = (this.agent.playerAngle % 360 + 360) % 360;
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
            if (element.team === this.agent.teamName){
                teamMates.push(element);
            }
        });
        return teamMates;
    }

    say(text){
        this.agent.socketSend("say", `${text}`);
    }

}


module.exports = Controller;