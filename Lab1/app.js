const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
let myAgent = new Agent(); // Создание экземпляра агента
myAgent.readParam();
require('./socket')(myAgent, "teamA", VERSION) //Настройка сокета
let enemyAgent1 = new Agent(); // Создание экземпляра агента
require('./socket')(enemyAgent1, "teamB", VERSION) //Настройка сокета
enemyAgent1.socketSend("move",`-10 -15`);

