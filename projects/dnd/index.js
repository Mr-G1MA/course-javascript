/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */


const homeworkContainer = document.querySelector('#app');

let currDiv;
let startX = 0;
let startY = 0;

function rand(from, to){
  let length = to - from;
  return from + Math.round(length*Math.random());
}

document.addEventListener('mousemove', (e) => {
  if (currDiv){
    currDiv.style.top = e.clientY - startY + 'px';
    currDiv.style.left = e.clientX - startX + 'px';
  }
});

 function createDiv() {
  const div = document.createElement('div');
  const minSize = 30;
  const maxSize = 300;
  const maxColor = 0xffffff;

  div.className = 'draggable-div';
  div.style.background = '#' + rand(0, maxColor).toString(16);
  div.style.top = rand(0, window.innerHeight) + 'px';
  div.style.left = rand(0, window.innerWidth) + 'px';
  div.style.width = rand(minSize, maxSize) + 'px';
  div.style.height = rand(minSize, maxSize) + 'px';

  div.addEventListener('mousedown', (e)=>{
    currDiv = div;
    startX = e.offsetX;
    startY = e.offsetY;
  });
  div.addEventListener('mouseup', () => (currDiv = false));

  return div;
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
  const div = createDiv();
  homeworkContainer.appendChild(div);
});
