
const AJAX_RESPONSE_ERROR = "response error";
var ajax = {};

ajax.fetch = function (data, responseType) {
  let http = new XMLHttpRequest(),
      method = 'GET',
      path = data.path,
      param = '',
      callback;

  if (!path)
    return Promise.reject("path not found");

  try {
    method = data.method.toUpperCase() || method;
  } catch (e) {
    method = undefined;
  } finally {
    if (method == null) method = 'GET';
    if (method !== 'GET' && method !== 'POST')
      throw new Error('unknown method.');
  }

  for (let key in data.param)
    if (data.param.hasOwnProperty(key)) {
      switch (typeof data.param[key]) {
        case 'string':
        case 'number':
          data.param[key] = String(data.param[key]);
          break;
        default:
          data.param[key] = JSON.stringify(data.param[key]);
      }
      param += key + '=' + encodeURIComponent(data.param[key]) + '&';
    }

  param = param.slice(0, param.length - 1);

  if (param && method === 'GET') {
    path += '?' + param;
    param = 0;
  }

  if (!param) param = undefined;

  switch (typeof data.callback) {
    case 'function':
      callback = data.callback;
      break;
    case 'string':
      callback = Function(data.callback);
      break;
    default:
      callback = function () {};
  }

  http.open(method, path, true);
  if (method === 'POST')
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  return new Promise(function(resolve, reject) {
    http.onreadystatechange = function () {
      if (http.readyState == 4) {
        if (http.status == 200) {
          let result = http.responseText;
          switch (responseType) {
            case JSON:
              try {
                result = JSON.parse(result);
              } catch (e) {
                callback(AJAX_RESPONSE_ERROR, 200);
                reject(AJAX_RESPONSE_ERROR, 200);
                return;
              }
              break;
            case HTMLElement:
              result = (function () {
                let elem = document.createElement('div');
                elem.innerHTML = result;
                return elem.childNodes;
              })();
            case Text:
            default:
              break;
          }
          callback(result);
          resolve(result);
        } else {
          callback(AJAX_RESPONSE_ERROR, http.status);
          reject(AJAX_RESPONSE_ERROR, http.status);
        }
      }
    };

    http.send(param);
  });
}

ajax.fetchText = function (obj) {
  return ajax.fetch(obj);
}

ajax.fetchJSON = function (obj) {
  return ajax.fetch(obj, JSON);
}

ajax.fetchHTML = function (obj) {
  return ajax.fetch(obj, HTMLElement);
}


ajax.sendFiles = function (data) {
  if (!window.FormData) return false;

  let http = new XMLHttpRequest(),
      formData = new FormData(),
      path = data.path,
      files = data.files,
      param = '',
      callback;

  if (!data.path)
    return Promise.reject("path not found");

  for (let i = 0; i < files.length; i++)
    formData.append('uploadfile' + i, files[i]);

  switch (typeof data.callback) {
    case 'function':
      callback = data.callback;
      break;
    case 'string':
      callback = Function(data.callback);
      break;
    default:
      callback = function () {};
  }

  http.open('POST', path, true);

  return new Promise(function(resolve, reject) {
    http.onreadystatechange = function () {
      if (http.readyState == 4) {
        if (http.status == 200) {
          callback(http.responseText);
          resolve(http.responseText);
        } else {
          callback(AJAX_RESPONSE_ERROR);
          reject(http.status);
        }
      }
    };

    http.send(formData);
  });
}
