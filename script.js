let allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
let activeEditTask = null;
const url = 'http://localhost:8000';
const fetchHeaders = {
  'Content-Type': 'application/json;charset=utf-8',
  'Access-Control-Allow-Origin': '*'
}

window.onload = async () => {
  try {
    const resp = await fetch(`${url}/tasks`);
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
    if (input === null) {
      return;
    }
    const resp = await fetch(`${url}/tasks`, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify({
        text: input.value,
      })
    });
    const result = await resp.json();
    allTasks.push(result);
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    input.value = '';
    render();
  } catch {
    console.error('Task send error');
  }
}

const onChangeCheckbox = async (_id, isCheck) => {
  try {
    const resp = await fetch(`${url}/tasks/${_id}/checkbox`, {
      method: 'PATCH',
      headers: fetchHeaders,
      body: JSON.stringify({
        isCheck: !isCheck
      })
    });
    const result = await resp.json();
    allTasks.forEach(item => {
      if (result._id === item._id) {
        item.isCheck = result.isCheck
      }
    });
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
  } catch {
    console.error('Fail to change');
  }
}

const cancelEdit = (item) => {
  const { _id, text } = item;
  activeEditTask = _id;
  activeEditTask = null
  render();
}

const onDeleteTask = async (_id) => {
  try {
    const resp = await fetch(`${url}/tasks/${_id} `, {
      method: 'DELETE',
      headers: fetchHeaders
    });
    const result = await resp.json();
    if (result.deletedCount > 0) {
      allTasks = allTasks.filter(item => (item._id !== _id));
    }
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
  } catch {
    console.error('Failed delete task');
  }
}

const updateTaskText = async (_id) => {
  try {
    const input = document.querySelector(`#task-${_id} input`);
    if (!input || !input.value) {
      return;
    }
    if (input.value.trim() === '') {
      console.error('Поле пустое');
    }
    const resp = await fetch(`${url}/tasks/${_id}`, {
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
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
  } catch {
    console.error('Fail to change');
  }
}

const allDelete = async () => {
  try {
    const resp = await fetch(`${url}/tasks`, {
      method: 'DELETE',
    })
    allTasks = [];
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
  } catch {
    console.error('Failed delete tasks');
  }
}

const editTask = (item) => {
  const { _id, text } = item
  const task = document.getElementById(`task-${_id}`);

  const cancel = document.createElement('img');
  const buttonCancelEdit = document.createElement('button');
  const buttonDoneTask = document.createElement('button');
  const imageDone = document.createElement('img');
  const newTask = document.createElement('div');
  const newText = document.createElement('input');
  const buttonsNewTask = document.createElement('div');

  newText.id = `task__input-${_id}`;
  newText.className = 'task__input_text';
  newText.value = text;
  newTask.className = 'header__task';
  newTask.id = `task-${_id}`;


  imageDone.src = 'img/done.svg';
  buttonDoneTask.id = `task_button_done${_id}`;
  imageDone.alt = '';
  buttonDoneTask.append(imageDone);
  buttonDoneTask.onclick = () => {
    updateTaskText(_id);
  };

  cancel.src = 'img/cancel.svg';
  buttonCancelEdit.id = `task_cancel${_id}`;
  cancel.alt = '';
  buttonCancelEdit.append(cancel);
  buttonCancelEdit.onclick = (item) => {
    cancelEdit(item);
  }
  buttonsNewTask.append(buttonDoneTask);
  buttonsNewTask.append(buttonCancelEdit);
  newTask.append(newText, buttonsNewTask);
  task.replaceWith(newTask)
  localStorage.setItem('tasks', JSON.stringify(allTasks));

}

const render = () => {
  const content = document.getElementById('content-page');
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  allTasks.sort((a, b) => {
    if (a.isCheck < b.isCheck) {
      return -1
    }
  });
  allTasks.forEach((item) => {
    const { text, isCheck, _id } = item;

    const container = document.createElement('div');
    container.id = `task-${_id}`;
    container.className = 'task-container';

    const checkbox = document.createElement('input');
    checkbox.className = 'checkbox'
    checkbox.type = 'checkbox';
    checkbox.checked = isCheck;
    checkbox.onchange = () => {
      onChangeCheckbox(_id, isCheck);
    };

    const newText = document.createElement('p');
    newText.innerText = text;
    newText.className = isCheck ? 'text-task done-text' : 'text-task';

    const imageEdit = document.createElement('img');
    const buttonEditTask = document.createElement('button');
    imageEdit.src = 'img/edit.svg';
    buttonEditTask.id = `task_button_edit${_id}`;
    imageEdit.alt = '';
    buttonEditTask.append(imageEdit);
    buttonEditTask.onclick = () => {
      editTask(item);
    };

    const imageDelete = document.createElement('img');
    const buttonDeleteTask = document.createElement('button');
    imageDelete.src = 'img/delete.svg';
    buttonDeleteTask.id = `task_button_delete${_id}`
    imageDelete.alt = '';
    buttonDeleteTask.append(imageDelete);
    buttonDeleteTask.onclick = () => {
      onDeleteTask(_id);
    }
    container.append(buttonDeleteTask);
    container.append(buttonEditTask);
    container.append(newText);
    container.append(checkbox);
    content.append(container);
    if (isCheck) {
      buttonEditTask.remove()
    }
  });
}
