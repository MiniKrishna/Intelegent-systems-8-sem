const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

let myAgent = new Agent(); // Создание экземпляра агента
require('./socket')(myAgent, "teamA", VERSION) //Настройка сокета
myAgent.readParam();
let enemyAgent = new Agent(); // Создание экземпляра агента
require('./socket')(enemyAgent, "teamB", VERSION) //Настройка сокета
setTimeout(() => enemyAgent.socketSend("move",`-8 -15`), 1000);


