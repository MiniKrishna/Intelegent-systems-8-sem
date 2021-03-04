const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
let myAgent = new Agent(); // Создание экземпляра агента
myAgent.readParam();
require('./socket')(myAgent, "teamA", VERSION) //Настройка сокета
let enemyAgent = new Agent(); // Создание экземпляра агента
require('./socket')(enemyAgent, "teamB", VERSION) //Настройка сокета
enemyAgent.socketSend("move",`-10 5`);
