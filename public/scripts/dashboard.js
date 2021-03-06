let itemNumber = 1;

const getElement = (document, id) => document.getElementById(id);

const deleteItem = function(context) {
  let itemId = context.id.replace('del_', '');
  let input = getElement(document, 'item_' + itemId);
  getElement(document, 'inputItems').removeChild(input);
  let checkbox = getElement(document, 'cb_' + itemId);
  getElement(document, 'inputItems').removeChild(checkbox);
  let del_button = getElement(document, '' + context.id);
  getElement(document, 'inputItems').removeChild(del_button);
};

const createDeleteButtonDiv = function(itemNumber) {
  let style =
    'font-size:20px;margin-left:10px;background-color:#F1F8FF;border-radius: 5px';
  let deleteButton = document.createElement('button');
  deleteButton.setAttribute('style', style);
  deleteButton.innerText = '\uD83D\uDDD1';
  deleteButton.id = 'del_' + itemNumber;
  deleteButton.setAttribute('onclick', `deleteItem({id:'del_${itemNumber}'});`);
  return deleteButton;
};

const createItemDiv = function(itemNumber) {
  let style = 'height:20px;width:200px';
  let itemDiv = document.createElement('label');
  itemDiv.contentEditable = 'true';
  itemDiv.id = 'item_' + itemNumber;
  itemDiv.innerText = document.getElementById('itemDetails').value;
  document.getElementById('itemDetails').value = '';
  itemDiv.setAttribute('style', style);
  itemDiv.className = 'listsData';
  return itemDiv;
};

const createCheckboxDiv = function(itemNumber) {
  let checkboxDiv = document.createElement('INPUT');
  checkboxDiv.setAttribute('type', 'checkbox');
  checkboxDiv.setAttribute('style', 'zoom:1.5');
  checkboxDiv.className = 'checkBox';
  checkboxDiv.id = 'cb_' + itemNumber;
  return checkboxDiv;
};

const appendChildren = (parent, children) =>
  children.map(child => parent.appendChild(child));

const addItem = function() {
  if (!document.getElementById('itemDetails').value) {
    return;
  }
  let itemsDiv = getElement(document, 'inputItems');
  let deleteButton = createDeleteButtonDiv(itemNumber);
  let itemDiv = createItemDiv(itemNumber);
  let checkboxDiv = createCheckboxDiv(itemNumber);
  appendChildren(itemsDiv, [checkboxDiv, itemDiv, deleteButton]);
  let br = document.createElement('br');
  itemsDiv.appendChild(br);
  itemNumber++;
};

const createOptionHtml = function(title) {
  return `<option value="${title}">${title}</option>`;
};

const displayContent = function() {
  fetch('/displayList')
    .then(function(myLists) {
      return myLists.json();
    })
    .then(function(myTitles) {
      let optionHtml = myTitles.map(createOptionHtml).join('');
      getElement(document, 'selectedlist').innerHTML = optionHtml;
    });
};

const addList = function() {
  let title = getElement(document, 'listTitle').value;
  getElement(document, 'listTitle').value = '';
  let description = getElement(document, 'listDescription').value;
  getElement(document, 'listDescription').value = '';
  fetch('/addList', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  }).then(function(response) {
    displayContent();
  });
};

const createItemsHtml = function(item) {
  let { content, id, status } = item;
  let deleteButtonStyle =
    'font-size:20px;margin-left:10px;background-color:#F1F8FF;border-radius: 5px';
  let checkboxHtml = `<input type="checkbox" id='cb_${id}' class='checkBox' name='${id}' ${status} style='zoom:1.5'>`;
  let deleteButton = `<button style=${deleteButtonStyle} id='del_${id}' onclick='deleteItem(this)'>\uD83D\uDDD1</button>`;
  let inputLabel = `<label class='listsData' id='item_${id}' contenteditable = 'true'>${content}</label>`;
  return checkboxHtml + inputLabel + deleteButton + '<br/>';
};

const createListHtml = function(list) {
  let { title, description, items } = list;
  itemNumber = items.length + 1;
  let itemsHtml = items.map(createItemsHtml).join('');
  getElement(document, 'selectedTitle').innerText = title;
  getElement(document, 'description').innerText = description;
  getElement(document, 'inputItems').innerHTML = itemsHtml;
};

const zipLists = function(checkStatus, accumulator, list) {
  const conditions = { true: 'checked', false: 'unchecked' };
  accumulator.zippedList.push({
    status: conditions[checkStatus[accumulator.index]],
    content: list
  });
  accumulator.index++;
  return accumulator;
};

const createItemAttributes = function(checkStatus, values) {
  let getItemAttributes = zipLists.bind(null, checkStatus);
  let itemAttributes = values.reduce(getItemAttributes, {
    zippedList: [],
    index: 0
  });
  return itemAttributes.zippedList;
};

const addItems = function() {
  let selectedList = getElement(document, 'selectedlist').value;
  let inputs = document.getElementsByClassName('listsData');
  let checkValues = document.getElementsByClassName('checkBox');
  let checkStatus = Object.keys(checkValues).map(
    key => checkValues[key].checked
  );
  let values = Object.keys(inputs).map(key => inputs[key].innerText);
  let itemAttributes = createItemAttributes(checkStatus, values);

  fetch('/addItems', {
    method: 'POST',
    body: JSON.stringify({ itemAttributes, selectedList })
  });
};

const edit = function() {
  let rightDiv = getElement(document, 'rightArea');
  rightDiv.style.pointerEvents = 'initial';
  let selectList = getElement(document, 'selectedlist').value;
  fetch('/getSelectedList', { method: 'POST', body: selectList })
    .then(response => response.json())
    .then(createListHtml);
};

const deleteList = function() {
  let selectList = getElement(document, 'selectedlist').value;
  fetch('/deleteList', { method: 'POST', body: selectList }).then(
    displayContent
  );
};

window.onload = displayContent;
