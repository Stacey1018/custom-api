var zTreeObj
var url
// 下划线转驼峰
function toHump(name) {
	return name.replace(/\_(\w)/g, function(all, letter){
			return letter.toUpperCase();
	});
}


$(function(){
  copy()
});

// 复制代码
function copy () {
  const clipboard = new ClipboardJS('#cpoty_btn'); 
  clipboard.on('success', function(e) {
    $('.copy-success-wrap').show()
    setTimeout(() => {
      $('.copy-success-wrap').hide()
    }, 1000);
  });
  clipboard.on('error', function(e) {
    alert("复制失败！请手动复制")
  });
}

// 发送消息给content-script
function sendMeaasgeToContentScript (message, callback) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        message,
        function (response) {
          if (callback) callback(response)
        }
      )
    })
}

document.addEventListener('DOMContentLoaded', function() {
    sendMeaasgeToContentScript({
    from: 'popup',
    subject: 'DOMInfo'
  }, function (response) {
    if (response?.location) {
        console.log(response.location)
        getTreeData(response.location)
    }
  })
});



// 获取yapi接口列表
function getTreeData (location) {
  url =  location.origin
  const id = location.href.split('/')[4]
  const origin = location.origin
  // http://yapi.smart-xwork.cn
	$.ajax({
		type:'GET',
		url:`${origin}/api/interface/list_menu?project_id=${id}`,
		dataType:'json',
		success:function(response){
			const {
				errcode,
				data
			} = response
			if (errcode === 0) {
        data.forEach(element => {
          element.title = element.name
        });
        $('.pop-up-ztree-loading').hide()
        initZTree(data)
			}
		},
		error: function(response){
      const str = JSON.stringify(response)
		}
	});
}


// 初始化zTree
function initZTree(data){
  // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
  var setting = {
    check:{
      enable:true,
    },
    data:{
      key:{
        children:'list',
        name:'title'
      }
    }

  };
  $(document).ready(function(){
     zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, data);
  });
}

$('#generate').click(()=>{
  $('.pop-up').show()
  const checkedArr = zTreeObj.getNodesByFilter((node)=>{
    return node.level==1 && node.checked
  })

  // 遍历生成代码
  let code = ``

  checkedArr.forEach(item=>{
    let _path = item.path.split('/').slice(-2).join('_')
    _path = _path.replace(_path[0], _path[0].toUpperCase())
    const _method = item.method.toLowerCase()
    const _urlName = `${_method}${toHump(_path)}`
    code += `
      <span>/** </span>
      <span>&nbsp;* ${item.title}</span>
      <span>&nbsp;* @desc: ${url}/project/${item.project_id}/interface/api/${item._id}</span>
      <span>&nbsp;* @mock: ${url}/mock/${item.project_id}${item.path}</span>
      <span>&nbsp;*/</span>
      <span class="pop-up-url">${_urlName} = ${_method}('${item.path.replace(/^(\s|\/)+|(\s|\/)+$/g, '')}')</span>
    `
  })

  console.log(code)

  $('.pop-up-loading').hide()
  $('.pop-up-content').show()
  $('.pop-up-content').html(
    code
  )
})








