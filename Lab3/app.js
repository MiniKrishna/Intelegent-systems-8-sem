const Agent = require('./agent'); // Импорт агента
const VERSION = 7; // Версия сервера


let myAgent1 = new Agent(); // Создание экземпляра агента
require('./socket')(myAgent1, "teamA", VERSION); //Настройка сокета
let myAgent2 = new Agent(); // Создание экземпляра агента
require('./socket')(myAgent2, "teamA", VERSION); //Настройка сокета


let myAgentGoalie = new Agent(); // Создание экземпляра агента
require('./socket')(myAgentGoalie, "teamB", VERSION, true) //Настройка сокета

myAgentGoalie.move({x: -40, y: -10})

myAgent1.move({x: -3, y: -6});
myAgent2.move({x: -12, y: -3});





