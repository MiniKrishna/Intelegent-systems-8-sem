const Agent = require('./agent'); // Импорт агента
const VERSION = 7; // Версия сервера


let myAgent = new Agent(); // Создание экземпляра агента
require('./socket')(myAgent, "teamA", VERSION); //Настройка сокета
//myAgent.readParam();

//let myAgent1 = new Agent(); // Создание экземпляра агента
//require('./socket')(myAgent1, "teamB", VERSION) //Настройка сокета

myAgent.move({x: -30, y: 10});




