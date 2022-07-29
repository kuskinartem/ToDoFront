
let allTasks = JSON.parse(localStorage.getItem('tasks')) || []; 
let newArray = allTasks.slice();
let activeEditTask = null;
let currentText = "";
const url = 'http://localhost:8000'
const fetchHeaders = {
  'Content-Type': 'application/json;charset=utf-8',
  'Access-Control-Allow-Origin': '*'
}


window.onload = async  () => {
  try {
    const input = document.getElementById("add-task");
    input.addEventListener('change', updateValue);
    const resp = await fetch(`${url}/tasks`, {
      method: 'GET'
    });
    let result = await resp.json();
    console.log(result);
    render();
  } catch {
    console.error('Task retrieval error');
  }
}

const taskAdd = async () => { 
  try {
    const input = document.getElementById("add-task");
    const resp =  await fetch(`${url}/tasks`, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify({
        text: input.value,
      })
    }); 
    const result = await resp.json()
    allTasks.push(result);
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    input.value = '';
    render();
  } catch {
    console.error('Task send error');
  } 
}

const updateValue = async (event) => { 
  const input = document.getElementById("add-task"); 
  input.value = event.target.value;
}

const render = () => { 
  const content = document.getElementById('content-page'); 
  while(content.firstChild) { 
    content.removeChild(content.firstChild);
  }
  newArray.sort((a, b) => a.isCheck > b.isCheck ? 1 : a.isCheck < b.isCheck ? -1 : 0) 
  allTasks = newArray;
  allTasks.forEach((item, index) => { 
    const{text, isCheck, _id} = item;
    const buttonDoneTask = document.createElement('button')
    const imageDone = document.createElement('img');
    imageDone.src = 'img/done.svg';
    imageDone.id = `task_button_done${_id}`
    imageDone.alt = "";
    buttonDoneTask.appendChild(imageDone);
    buttonDoneTask.onclick =  () => {
      doneEditTask();
    };
    
    const cancel = document.createElement('img');
    const buttonCancelEdit = document.createElement('button')
    cancel.src = 'img/cancel.svg';
    cancel.id = `task_cancel${_id}`;
    cancel.alt = ""
    buttonCancelEdit.appendChild(cancel);
    buttonCancelEdit.onclick =  () => {
      cancelEdit();
    };
    
    const imageEdit = document.createElement('img'); 
    const buttonEditTask = document.createElement('button')
    imageEdit.src = 'img/edit.svg'; 
    imageEdit.id = `task_button_edit${_id}`;
    imageEdit.alt = "";
    buttonEditTask.appendChild(imageEdit);
    buttonEditTask.onclick =  () => { 
      editTask(_id);
    };

    const imageDelete = document.createElement('img'); 
    const buttonDeleteTask = document.createElement('button')
    imageDelete.src = 'img/delete.svg';
    imageDelete.id = `task_button_delete${_id}`
    imageDelete.alt = "";
    buttonDeleteTask.appendChild(imageDelete);
    buttonDeleteTask.onclick =  () => { 
      onDeleteTask(_id);
    }
   
    const container = document.createElement('div'); 
    container.id = `task-${_id}`; 
    container.className = 'task-container'; 
    const checkbox = document.createElement('input');
    checkbox.className = 'checkbox';
    checkbox.type = 'checkbox'; 
    checkbox.checked = isCheck; 
    checkbox.onchange =  () => {     
      onChangeCheckbox(_id);
    };
    container.appendChild(checkbox); 
    
    if(_id === activeEditTask) {
      const inputTask = document.createElement('input');
      inputTask.type = 'text';
      inputTask.value = text;
      inputTask.addEventListener('change', updateTaskText);
      container.appendChild(inputTask);
      checkbox.remove();
      container.appendChild(buttonDoneTask);
      container.appendChild(buttonCancelEdit); 
      } else {
      const text2 = document.createElement('p');  
      text2.innerText = text;  
      text2.className = isCheck ? 'text-task done-text' : 'text-task'; 
      container.appendChild(text2); 
      container.appendChild(buttonEditTask);  
      container.appendChild(buttonDeleteTask) 
      }
      if(allTasks[index].isCheck) {
        buttonEditTask.remove();
      }
      content.appendChild(container);
  });
}

const onChangeCheckbox = async (_id, isCheck) => {
  try {
    const resp =  await fetch(`${url}/tasks/${_id}/checkbox`, {
      method: 'PATCH',
      headers: fetchHeaders,
      body: JSON.stringify({
        isCheck: !isCheck
      })
    });
    const result = await resp.json();
    allTasks.forEach(item => {
      if(result._id === item._id) {
        item.isCheck = result.isCheck
      }
    });
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
  } catch {
    console.error('Fail to change');
  }
}

const cancelEdit = () => {
  allTasks[activeEditTask].text = currentText;
  activeEditTask = null;
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render()
}

const onDeleteTask = async (_id) => { 
  try {
  const resp =  await fetch(`${url}/tasks/${_id} `, {
      method: 'DELETE',
      headers: fetchHeaders
    });
    const result = await resp.json()
    if (result.deletedCount > 0) {
      allTasks = allTasks.filter(item => (item._id !== _id));
    }
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
  } catch {
    console.error('Failed delete task')
  }
}

const updateTaskText = (event) => { 
  allTasks[activeEditTask].text = event.target.value;
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const doneEditTask = () => { //Функция сохранения
  activeEditTask = null;
  render();
}


const allDelete = async () => {
  try {
    const resp =  await fetch(`${url}/tasks`, {
      method: 'DELETE',
    })
    allTasks.splice(0);
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
  } catch {
    console.error('Failed delete tasks');
  }
}

const editTask = async (_id) => {
  try {
    const input = document.getElementById(`task_button_edit${_id}`)
    if (input.value === null) {
      return;
    }
    const resp = await fetch(`${ url }/tasks/${ _id }/text`, {
      method: 'PATCH',
      headers: fetchHeaders,
      body: JSON.stringify({
        text: input.value
      })
    });
    const result = await resp.json();
    allTasks.forEach(item => {
      if (item._id === result._id) {
        item.text = result.text;
      }
    });
    currentText = allTasks[activeEditTask].text;
    render();
  } catch {
    console.error('Fail to change');
  }
}