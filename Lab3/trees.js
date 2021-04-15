const flags = require("./flags");

const PlayerTree = {
    state: {
        sequence: [{act: "flag", fl: "fplt"}, {act: "flag", fl: "gl"},
        {act: "kick", fl: "b", goal: "gr"}],
        reachPoint: {},
    },
    root: {
        exec(controller, state) { 
            state.action = state.sequence[controller.sequenceIter];  
        },
        next: "actVal",
    },
    actVal: {
        condition(controller, state){ return state.action.act === "flag"},
        trueCond: "flagNext",
        falseCond: "kickNext",
    },
    flagNext: {
        condition(controller, state){
            controller.calculateToFlag(state.action.fl)
            state.reachPoint = flags[state.action.fl];
            return controller.objectDistance < 3
        },
        trueCond: "reachFlag",
        falseCond: "playerVision",
    },
    kickNext: {
        condition(controller, state){
            return controller.ballControl 
        },
        trueCond: "ballControlTrue",
        falseCond: "ballControlFalse",
    },
    ballControlFalse: {
        condition(controller, state){
            return controller.env.vision.ball === undefined;
        },
        trueCond: "ballNotInVision",
        falseCond: "ballInVision",
    },
    ballControlTrue: {
        exec(controller, state){
            controller.ballControl = false;
        },
        next: "rotateAgent",
    },
    ballNotInVision: {
        exec(controller, state){
            controller.calculateToFlag("fc")
            state.reachPoint = flags["fc"]
        },
        next: "playerVision",
    },
    ballInVision: {
        condition(controller, state){
            state.reachPoint = controller.env.vision.ball.pos;
            controller.objectDistance = controller.env.vision.ball[0];
            controller.angleToResearchPoint = -controller.env.vision.ball[1];
            return controller.objectDistance >  0.5;
        },
        trueCond: "playerVision",
        falseCond: "kickBall",
    },
    playerVision: {
        condition(controller, state){
            //console.log(controller.getTeamMates())
            return controller.getTeamMates().length > 0;
        },
        trueCond: "distPlayers",
        falseCond: "getToPoint",
    },
    getToPoint: {
        condition(controller, state){
            state.vel = 60;
            if (controller.objectDistance < 3){
                state.vel = 40;
            }
            return Math.abs(controller.angleToResearchPoint) > 5
        },
        trueCond: "rotateAgent",
        falseCond: "dashAgent",
    },
    rotateAgent: {
        command(controller, state){
            controller.rotateAgent();
        }
    },
    dashAgent: {
        command(controller, state){
            controller.dashAgent(state.vel);
        }
    },

    distPlayers: {
        condition(controller, state){
            state.leader = controller.getTeamMates()[0];
            return controller.objectDistance < flags.distance(state.reachPoint, state.leader.pos);

        },
        trueCond: "getToPoint",
        falseCond: "followPlayer",
    },

    reachFlag: {
        exec(controller, state) { 
             controller.nextAct();
             state.vel = 0;
        },
        next: "dashAgent",
    },
    kickBall: {
        command(controller, state){
            controller.ballControl = true;
            controller.calculateToFlag(state.action.goal);
            let kickPower = 70
            if (controller.objectDistance > 25){
                kickPower = 40
            }
            controller.kickBall(kickPower);
        }
    },

    followPlayer: {
        condition(controller, state){ return state.action.act === "flag"},
        trueCond: "leaderReach",
        falseCond: "moveBehind",
    },
    leaderReach: {
        condition(controller, state){
            return flags.distance(state.reachPoint, state.leader.pos) < 4
        },
        trueCond: "reachFlag",
        falseCond: "moveBehind",
    },

    moveBehind: {
        condition(controller, state){
            controller.objectDistance = state.leader.dist[0];
            controller.angleToResearchPoint = -state.leader.dist[1];
            state.vel = 80;
            return controller.objectDistance > 10
        },
        trueCond: "dashAgent",
        falseCond: "normalDist",
    },

    normalDist: {
        condition(controller, state){
            if ((-controller.angleToResearchPoint) < 40 && (-controller.angleToResearchPoint) > 20){
                state.vel = 60;
                if (controller.objectDistance < 7){
                    state.vel = 40;
                }
                else if (controller.objectDistance < 3){
                    state.vel = 0;
                }
                return true
            }
            return false
        },
        trueCond: "dashAgent",
        falseCond: "getAngle",
    },

    getAngle: {
        exec(controller, state){
            controller.angleToResearchPoint = controller.angleToResearchPoint + 30;
        },
        next: "rotateAgent"
    },
    

}



/*

const SeqTree = {
    state: {
        sequenceIter: 0,
        sequence: [{act: "flag", fl: "fplt"}, {act: "flag", fl: "gl"},
        {act: "kick", fl: "b", goal: "gr"}],
        command: null,
    },
    root: {
        exec(controller, state) { 
            state.action = state.sequence[state.sequenceIter]; 
            state.command = null 
        },
        next: "actVal",
    },
    actVal: {
        condition(controller, state){ return state.action.act === "flag"},
        trueCond: "flagNext",
        falseCond: "kickNext",
    },
    flagNext: {
        condition(controller, state){
            controller.calculateToFlag(state.action.fl)
            return controller.objectDistance < 3
        },
        trueCond: "reachFlag",
        falseCond: "moveToFlag",
    },
    moveToFlag: {
        condition(controller, state){
            state.vel = 70;
            if (controller.objectDistance < 10){
                state.vel = 60;
            }
            if (controller.objectDistance < 3){
                state.vel = 50;
            }
            return Math.abs(controller.angleToResearchPoint) > 5
        },
        trueCond: "rotateAgent",
        falseCond: "dashAgent",
    },
    rotateAgent: {
        command(controller, state){
            controller.rotateAgent();
        }
    },
    dashAgent: {
        command(controller, state){
            controller.dashAgent(state.vel);
        }
    },
    reachFlag: {
        exec(controller, state) { 
             controller.nextAct();
             state.vel = 0;
        },
        next: "dashAgent",
    },
    kickNext: {
        condition(controller, state){
            return controller.ballControl 
        },
        trueCond: "ballControlTrue",
        falseCond: "ballControlFalse",
    },
    ballControlFalse: {
        condition(controller, state){
            return controller.env.vision.ball === undefined;
        },
        trueCond: "ballNotInVision",
        falseCond: "ballInVision",
    },
    ballNotInVision: {
        exec(controller, state){
            controller.calculateToFlag("fc")
        },
        next: "moveToFlag",
    },
    ballControlTrue: {
        exec(controller, state){
            controller.ballControl = false;
        },
        next: "rotateAgent",
    },
    ballInVision: {
        condition(controller, state){
            return controller.env.vision.ball[0] >  0.5;
        },
        trueCond: "moveToBall",
        falseCond: "kickBall",
    },
    moveToBall: {
        exec(controller, state){
            controller.objectDistance = controller.env.vision.ball[0];
            controller.angleToResearchPoint = -controller.env.vision.ball[1]
        },
        next: "moveToFlag",
    },
    kickBall: {
        command(controller, state){
            controller.ballControl = true;
            controller.calculateToFlag(state.action.goal);
            let kickPower = 70
            if (controller.objectDistance > 20){
                kickPower = 40
            }
            controller.kickBall(kickPower);
        }
    }

}

*/


const GoalieTree = {
    state: {
        catchBall: false,
        vel: 50,
        sides: ["fprb","fc", "fprt", "fc"],
        sidesIter: 0,
        getPos: true,
        },
    root: {
        condition(controller, state){
            return state.catchBall;
        },
        trueCond: "kickBall",
        falseCond: "ballVision",
    },
    ballVision: {
        condition(controller, state){
            if (controller.env.vision.ball === undefined) return true;
            if (controller.env.vision.ball[0] > 40) return true;
            controller.objectDistance = controller.env.vision.ball[0];
            controller.angleToResearchPoint = -controller.env.vision.ball[1]
            return false;
        },
        trueCond: "ballNotInVision",
        falseCond: "ballInVision",
    },
    ballInVision: {
        condition(controller, state){
            return controller.objectDistance < 2;
        },
        trueCond: "catchBall",
        falseCond: "followBall",
    },
    followBall: {
        condition(controller, state){
            state.vel = 25;
            if (controller.objectDistance < 10) state.vel = 50;
            if (controller.objectDistance < 5) state.vel = 100;
            return controller.objectDistance < 15;
            
        },
        trueCond: "dashAgent",
        falseCond: "rotateAgent",
    },

    catchBall: {
        command(controller, state){
            state.catchBall = true;
            controller.catchBall();
        }
    },
    rotateAgent: {
        command(controller, state){
            controller.rotateAgent();
        }
    },
    dashAgent: {
        command(controller, state){
            controller.dashAgent(state.vel);
        }
    },
    kickBall: {
        command(controller, state){
            state.catchBall = false;
            controller.calculateToFlag("gl");
            let kickPower = 100;
            controller.kickBall(kickPower);
        }
    },
    ballNotInVision: {
        condition(controller, state){
            let playerPos = controller.env.vision.myself;
            if (playerPos.x > 52 || playerPos.x < 47 || playerPos.y > 3 || playerPos.y < -3 || (state.getPos !== true)) {
                state.getPos = false;
                return false;
                
            }
            else return true
        },
        trueCond: "goalieIn",
        falseCond: "reachFlag",
    },
    goalieIn: {
        exec(controller, state){
        state.curSide = state.sides[state.sidesIter];
        state.sidesIter = (state.sidesIter + 1) % state.sides.length
        controller.calculateToFlag(state.curSide);  
        },
        next: "rotateAgent",
    },
    goalieOut : {
        condition(controller, state){
            state.vel = 100;
            return Math.abs(controller.angleToResearchPoint) > 5
        },
        trueCond: "rotateAgent",
        falseCond: "dashAgent",
    },
    reachFlag: {
        condition(controller, state){
            controller.calculateToFlag("goaliePosR");
            //console.log(controller.objectDistance);
            if(controller.objectDistance < 1){
                state.getPos = true;
                return true;
            }
            else return false;
        },
        trueCond: "ballNotInVision",
        falseCond: "goalieOut",
    }
}

module.exports.PlayerTree = PlayerTree;
module.exports.GoalieTree = GoalieTree;
//module.exports.SeqTree = SeqTree;