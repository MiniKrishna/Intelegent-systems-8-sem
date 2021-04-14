const Agent = require('./agent'); // Импорт агента
const trees = require('./trees'); // 
const VERSION = 7; // Версия сервера


let myAgent1 = new Agent(trees.GiverTree); // Создание экземпляра агента
require('./socket')(myAgent1, "teamA", VERSION); //Настройка сокета
//let myAgent2 = new Agent(trees.GiverTree); // Создание экземпляра агента
//require('./socket')(myAgent2, "teamA", VERSION); //Настройка сокета

myAgent1.move({x: -3, y: -6});
//myAgent2.move({x: -12, y: -3});





