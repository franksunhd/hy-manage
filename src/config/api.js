import axios from 'axios';

// var root = "";   //正式环境
var root = "http://192.168.0.110:8080/";   //测试环境内网

function apiAxios(method, url, params, success, failure) {
  axios({
    method: method,
    url: url,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
    baseURL: root,
    withCredentials: false,  // cookie
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }).then(function(res) {
    if (success) {
      success(res.data);
    }
  }).catch(function(err) {
    alert(err);
    return;
  });
}

// 返回在vue模板中的调用接口
export default {
  // 查询
  get: function (url, params, success, failure) {
    return apiAxios('GET', url, params, success, failure);
  },
  // 修改
  post: function(url, params, success, failure) {
    return apiAxios('POST', url, params, success, failure);
  },
  // 更新
  put: function (url, parmas, success, failure) {
    return apiAxios('PUT',url, parmas, success, failure);
  },
  // 删除
  delete: function (url, params, success, failure) {
    return apiAxios('DELETE', url, params, success, failure);
  }
}
