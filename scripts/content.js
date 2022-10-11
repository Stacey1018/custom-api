// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    console.log('11111')
		response({location:window.location})
  }
});