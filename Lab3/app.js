const Agent = require('./agent'); // Импорт агента
const VERSION = 7; // Версия сервера


let myAgent = new Agent(); // Создание экземпляра агента
require('./socket')(myAgent, "teamA", VERSION); //Настройка сокета
//myAgent.readParam();

let myAgentGoalie = new Agent(); // Создание экземпляра агента
require('./socket')(myAgentGoalie, "teamB", VERSION, true) //Настройка сокета

myAgentGoalie.move({x: -40, y: -10})

myAgent.move({x: -40, y: -20});




