let allTasks = JSON.parse(localStorage.getItem('task')) || [];
let activeEditTask = null;
let currentText = "";
const url = 'http://localhost:8000';
const fetchHeaders = {
  'Content-Type': 'application/json;charset=utf-8',
  'Access-Control-Allow-Origin': '*'
}

window.onload = async  () => { // проверяем изменения 
  const input = document.getElementById("add-task");
  input.addEventListener('change', updateValue);
  const resp =  await fetch(`${url}/allTask`, {
    method: 'GET',
    headers: fetchHeaders
  });
  const result = await resp.json();
  allTasks = result.data;
  render();
  
}

const addTask = async () => { // При нажании на кнопку 
  const input = document.getElementById("add-task");
  await fetch(`${url}/createTask`, {
    method: 'POST',
    headers: fetchHeaders,
    body: JSON.stringify({
      text: input.value, 
      isCheck: false 
    })
  });
  localStorage.setItem('tasks', JSON.stringify(allTasks));// Обнуляем значение в строке
  input.value = '';
  render(); // добавляем на страницу задачи
}

const updateValue = (event) => { // Вносим значения в input
  const input = document.getElementById("add-task"); 
  input.value = event.target.value;
}

const render = () => { 
  const content = document.getElementById('content-page'); // Добавляем элементы
  while(content.firstChild) { // удаляем дочерние элементы, чтобы задачи выводились по одному
    content.removeChild(content.firstChild);
  }
  const copyTask = [...allTasks];
  copyTask.sort((a, b) => a.isCheck > b.isCheck ? 1 : a.isCheck < b.isCheck ? -1 : 0) // Сортируем задачи , если чекбокс true, задача падает вниз
  allTasks = copyTask;
  allTasks.forEach((item) => { 
    const{text, isCheck, _id} = item;

    const buttonDoneTask = document.createElement('button')
    const imageDone = document.createElement('img');
    imageDone.src = 'img/done.svg';
    imageDone.alt = "";
    buttonDoneTask.appendChild(imageDone);
    buttonDoneTask.onclick =  () => {
      doneEditTask();
    };
    
    const cancel = document.createElement('img');
    const buttonCancelEdit = document.createElement('button')
    cancel.src = 'img/cancel.svg';
    cancel.alt = ""
    buttonCancelEdit.appendChild(cancel);
    buttonCancelEdit.onclick =  () => {
      cancelEdit();
    };
    
    const imageEdit = document.createElement('img'); // создали тег
    const buttonEditTask = document.createElement('button')
    imageEdit.src = 'img/edit.svg'; // Добавили изображение карандаша
    imageEdit.alt = "";
    buttonEditTask.appendChild(imageEdit);
    buttonEditTask.onclick =  () => { // При нажатии выполняется функция редактирования 
      editTask(id);
    };

    const imageDelete = document.createElement('img'); // Создали тег img
    const buttonDeleteTask = document.createElement('button')
    imageDelete.src = 'img/delete.svg'; // Добавили изображения крестика 
    imageDelete.alt = "";
    buttonDeleteTask.appendChild(imageDelete);
    buttonDeleteTask.onclick =  () => { // при нажатии на иконку вызывается функция по индексу
      onDeleteTask(id);
    }
   
    const container = document.createElement('div'); // создали контейнер div
    container.id = `task-${id}`; // индивид. идентификатор контейнера
    container.className = 'task-container'; // добавили класс к контейнеру
    const checkbox = document.createElement('input'); //создали чекбокс
    checkbox.className = 'checkbox';
    checkbox.type = 'checkbox'; // изменили на tapy
    checkbox.checked = isCheck; //Добавили галочку для пояснения выполнености задачи
    checkbox.onchange =  () => { // Вызываем функцию при изменении функции
      onChangeCheckbox(id);
    };
    container.appendChild(checkbox); // добавили в контейнер чекбокс
    
    if(id === activeEditTask) {
      const inputTask = document.createElement('input');
      inputTask.type = 'text';
      inputTask.value = text;
      inputTask.addEventListener('change', updateTaskText);
      //inputTask.addEventListener('blur',doneEditTask);
      container.appendChild(inputTask);
      checkbox.remove();
      container.appendChild(buttonDoneTask);
      container.appendChild(buttonCancelEdit);
            
      } else {
      const text2 = document.createElement('p'); // создаом текст
      text2.innerText = text; // название задачи
      text2.className = isCheck ? 'text-task done-text' : 'text-task'; // Емли задача выполнена меняется формление текста иначе нет 
      container.appendChild(text2); // добавили в контейнер
      container.appendChild(buttonEditTask); // Добавли в контейнер
      container.appendChild(buttonDeleteTask) //удвление таска
      }
      if(allTasks[id].isCheck) {
        buttonEditTask.remove();
      }

      content.appendChild(container); // добавили контейнер в content-page
    });
}

const onChangeCheckbox = async (id) => { 
  await fetch(`${url}/updateTask/${_id}`, {
    method: 'PATCH',
    headers: fetchHeaders,
    body: isCheck
  });
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const cancelEdit = () => {
  allTasks[activeEditTask].text = currentText;
  activeEditTask = null;
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render()
}

const onDeleteTask = async (id) => { // Функция удаления
  await fetch(`${url}/deleteTask/${_id}`, {
    method: 'DELETE',
    headers: fetchHeaders
  });
  allTasks.splice(id, 1);
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const updateTaskText = (event) => { // функция редактирования
  allTasks[activeEditTask].text = event.target.value;
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const doneEditTask = async () => { //Функция сохранения
  await fetch(`${url}/updateTask/${_id}`, {
    method: 'PUTCH',
    headers: fetchHeaders,
    body: text
  });
  activeEditTask = null;
  render();
}


const allDelete = () => {
  await fetch(`${url}/deleteAllTask`)
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const editTask = (id) => {
  activeEditTask = id;
  currentText =  allTasks[activeEditTask].text;
  render();
}