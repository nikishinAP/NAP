window.addEventListener('load', main, false);
function main() {
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d'); //создаю канвас для шариков
		//графики
		var canvas1 = document.getElementById('graphic_ctx1');
		var canvas2 = document.getElementById('graphic_ctx2');
		var ctx_kin = canvas1.getContext('2d');
		var ctx_stress = canvas2.getContext('2d');
		var w1 = canvas1.width;
		var w2 = canvas2.width;
		var h1 = canvas1.height;
		var h2 = canvas2.height;
		var w = canvas.width; 
		var h = canvas.height;
		var kins = [];
		var cur_stress = 0;
		var average_stress = [];
		var stresses_sum = 0;
		var dt = 0.1;
		var R = 10; //задаю радиус шара
		var coords; //создаю массив для шаров
		var time = 0;
		coordsGen(); //генерация массива
		document.querySelector('.go').onclick = reset; //задаю обновление данных массива по нажатию кнопки "Поехали"
		
		function reset() {
			coordsGen();
			kins = [];
			cur_stress = 0;
			time = 0;
			stresses_sum = 0;
			average_stress = [];
		} //функция обновляет массив
		
		function coordsGen() {
			coords = [
				[],//x
				[],//y
				[],//vx
				[],//vy
			] //создание пустого массива
			var n = Number(document.querySelector('#num').value); //получаем данные с кнопки "количество шаров"
			if (n > 400) {
				alert('Ваш компьютер не бессмертен. Введите значение не больше чем "400", ПОЖАЛУЙСТА.');
				alert('Симуляция запуститься с 400 шариками.');
				n = 400;
			}
			var S = w*h; //считаем площадь канваса
			var s = S/n; //считаем площадь прямоугольника для заселения в них наших шариков
			var a = (s**(1/2)); //рассчитываем середину этой фигуры
			var cols = Math.ceil(w/a); //считаем и округляем количество столбцов в большую сторону до целого числа
			var strings = Math.ceil(n/cols);  //считаем и округляем количество строчек в большую сторону до целого числа
			var currentx, currenty; //с помощью этих переменных и цикла сделаем так чтобы каждый шарик имел свое местоположение в уделенной ему площади
					currenty = a/2;
					for (var k = 0; k < strings; k++) {
						currentx = a/2; 
						for (var j = 0; j < cols; j++) {
							coords[0].push(Math.round(currentx));  //x
							coords[1].push(Math.round(currenty)); //y
							coords[2].push(1000*Math.random()-500);  //vx(-500;500)
							coords[3].push(1000*Math.random()-500); //vy(-500;500)
							currentx = currentx + a;
						}
						currenty = currenty + a;
					}
			while (coords[0].length != n) {
				coords[0].pop();
				coords[1].pop();
			}
			displayGenerator(maxStressCounter(coords[0].length)); //генерация дисплея давления
		}
		//теперь рисуем и стираем наши шарики
		function draw() {
			//шарики
			ctx.clearRect(0, 0, w, h); //чистит наш холст при передвижении шариков
			for (var i = 0; i < coords[0].length; i++) {
				ctx.beginPath();
				color = `rgb(${i}, ${((i*5)+35)}, ${((i*10)+200)})`;//эта гениальная формула задает каждому шарику свой цвет из оттенка голубого
				ctx.fillStyle = color; 
				ctx.arc(coords[0][i],coords[1][i],R,0,2*Math.PI); //создает шар
				ctx.fill(); // закрашивает в тот самый цвет

			//графики
			//кинетическая энергия
			ctx_kin.clearRect(0, 0, w1, h1); //чистит наш график
			var max_kin = coords[0].length*75;
			axis(ctx_kin, w1, h1, max_kin);
			graph(ctx_kin, kins, max_kin, 1);

			//давление
			ctx_stress.clearRect(0, 0, w2, h2); //чистит наш график
			var max_str = coords[0].length*250;
			axis(ctx_stress, w2, h2, max_str);
			graph(ctx_stress, average_stress, max_str, 1);
			}
		}

		function kin() {
			var kin;
			var max_kin = coords[0].length * 50;
			kin = 0;
			for (var i = 0; i < coords[0].length; i++) {
				kin +=(coords[2][i] ** 2 + coords[3][i] ** 2)/2000; 
			}
			return kin;
		}

		function graph(ctx, arr, max, dx) {
			var x0 = 45; // старт по х
			var pixs;
			ctx.beginPath();
			ctx.moveTo(x0, 395);
			ctx.fillStyle = '#00FF00';
			for(var i=0; i < arr.length; i++) {
				x0 += dx;
				pixs = (arr[i]/(max)*200)+5//приведение элемента в пиксе
				ctx.lineTo(x0, (400-pixs));
			 }
			ctx.stroke();
		}

		function displayGenerator(max) {
			var display_digit = (Math.round((max/50)))*10;
			for (var i=0; i<6; i++) {
				document.querySelector(`.d${i}`).innerHTML = (display_digit * i);
			}
		}

		function degreesTranslate(cur_stress, max) {
			var degrees, percent;
			var amount = coords[1].length;

			percent = cur_stress / max;
			degrees = percent * 180;
			if (degrees > 180) {degrees = 180;}
			return degrees;
		}

		function maxStressCounter(amount) {
			var max;
			max = 0.0002*(amount**3) - 0.0403*(amount**2) + 24.21*amount + 1386; //Просчитываем максимальное значение в зависимости от шаров. функция построена с помощью онлайн сервиса по точкам
			return max;
		}

		function stress(i, stress){
			var bum = 0; //создаем переменную для сохранения удара
			var cur_stress;
			bum = (coords[2][i]**2 + coords[3][i]**2)**(1/2);// давление мы находим по формуле F =  p/S=  (m∙U)/(S∙t)= √(〖Ux〗^2+〖Uy〗^2 ) ∙ 10^(-6) , так как m=1 грамм, S =  точке,  t = 0,001 с
			stress = bum; //выводит на экран значение давления
			cur_stress = stress + Math.round(bum); //складываем удары
			return [stress, cur_stress];
		}
		//здесь мы создаем функцию, которую в будущем будем использовать для того, чтобы шарики отталкивались
		function distance(x, x1, y, y1) {
			res = (((y1 - y) ** 2) + (x1 - x) ** 2) ** (1/2);
			
			return res;
		}
		//эта функция отвечает за все физические свойства шарика(его движение,вязкость,упругость и давление, которое он оказывает на сосуд)
		function physics() {
			for (var i = 0; i < coords[0].length; i++) {
				var visc = (1-(Number(document.querySelector('#visc').value))/300);
				//получаем данные с кнопки "вязкость"
				coords[2][i]*=visc;
				coords[3][i]*=visc;
				//изменение координат при движении
				coords[0][i]+=coords[2][i]*dt/100;
				coords[1][i]+=coords[3][i]*dt/100;
				
				//создаем отталкивание шаров от стен и считаем давление в этот момент
				if(coords[0][i]<R || coords[0][i]>w-R) { //условие на столкновение с вертикальными стенками
					coords[2][i]*=-1; //при столкновении шарик меняет скорость на противоположную
					coords[0][i]= (coords[0][i]<R) ? R : w-R; //условие для того, чтобы шарик не заходил за пределы стен 
					stresses_sum += cur_stress; // Прибавляем последнее давление к сумме
				}
				if(coords[1][i]<R || coords[1][i]>h-R){ //условие на столкновение с горизонтальными стенками
					coords[3][i]*=-1; //при столкновении шарик меняет скорость на противоположную
					coords[1][i]= (coords[1][i]<R) ? R : h-R; //условие для того, чтобы шарик не заходил за пределы стен 
					stresses_sum += cur_stress; // Прибавляем последнее давление к сумме
					cur_stress += stress(i, cur_stress)[0];
				}
				var arrow_rotate = document.querySelector('.stress_arrow').style;
				if (cur_stress > 0 ) {cur_stress -= 1;}
				arrow_rotate.transform = `rotate(${degreesTranslate(cur_stress, maxStressCounter(coords[0].length))}deg) translate(-40px)`; // поворот стрелки 


				// здесь мы сталктиваем шарики друг с другом с учетом жесткости
				var rig = Number(document.querySelector('#rig').value); //получаем данные с кнопки "упругость"
				for (var j = 0; j < coords[0].length; j++) { //создаем цикл для двух случайных шаров, которые подходят на расстояние меньшее
					if (i != j && distance(coords[0][i], coords[0][j], coords[1][i], coords[1][j]) < 2 * R) {
							tmp = rig*coords[2][i];
							coords[2][i] = rig*coords[2][j];
							coords[2][j] = tmp;
							// происходит обмен скоростями без потерь, если упругий удар, т.е. rigs = 1, при уменьшении коэффициента шарики начинает слипаться
							tmp = rig*coords[3][i];
							coords[3][i] = rig*coords[3][j];
							coords[3][j] = tmp;
						
					}
				}
			}
			kins.push(kin()); //запоминание текущей кинетической энергии
			if (kins.length > 550) {
				kins.shift(); //выбрасывание первого устаревшего
			}
			time += 1/150; // прибавление времени
			average_stress.push((stresses_sum/time).toFixed(2));
			if (average_stress.length > 550) {
				average_stress.shift();
			}

		}
   function control() { //запускает функции рисования и физики
	   physics();
	   draw();
   }

   function axis(ctx, w, h, max) {
		ctx.fillStyle = 'black';
		// цикл для отображения значений по Y 
		for(let i = 0; i < 6; i++) { 
	    ctx.fillText((5 - i) * max + "", 4, i * 80 + 60); 
	    ctx.beginPath(); 
	    ctx.moveTo(35, i * 80 + 60); 
	    ctx.lineTo(45, i * 80 + 60); 
	    ctx.stroke(); 
	    ctx.fillStyle = "black"; // задаём чёрный цвет для линий 
			ctx.beginPath(); // запускает путь
			ctx.moveTo(45, 10); // указываем начальный путь
			ctx.lineTo(45, 400); // перемешаем указатель
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(35, 395);
			ctx.lineTo(595, 395);
			ctx.stroke(); 
		}
	}
   
   
   setInterval (control, 1000/150);

}