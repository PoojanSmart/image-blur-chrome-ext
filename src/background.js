import * as tf from '@tensorflow/tfjs';
var model = undefined;
(async function() {
  const url = chrome.runtime.getURL('model/model.json');
  model = await tf.loadLayersModel(url);
  return model;
})().then((model)=>{
});


console.log("Initializing service page");
var i = 0;

function notifycontentscript() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {action: "image"}, function(response) {});  
});
}

var callbackoncomplete = function (details) {
  if (details?.initiator && !details.initiator.includes(chrome.runtime.id)) {
    var type = details.type;
    if (type) {
      if (type == "image") {
        console.log(details.url);
        notifycontentscript();
      }
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener( callbackoncomplete, { urls: ["<all_urls>"] }, []);


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse){
    if (request.ask === "validimage") {
      const imageData = new ImageData(
        Uint8ClampedArray.from(request.imagedata.rawImageData), request.imagedata.width, request.imagedata.height);

      validate(imageData)
      .then((pred) => {
          if (pred == 1)
            sendResponse({valid: true});
          else
            sendResponse({valid: false});
      });
    }
    return true;
  }
);

async function validate(imageData)
{
  var tensor = tf.browser.fromPixels(imageData);
  tensor = tensor.expandDims(0);
  var pred = model.predict(tensor);
  var class_ = Array.from(pred.argMax(1).dataSync())[0];
  return class_;
}


// async function validate(url, sendResponse)
// {
//   const response = await fetch(url, {method: 'GET',   mode: 'cors'});
//   const blob = await response.blob();
//   console.log(blob.arrayBuffer());
//   var fd = new FormData();
//   fd.append('file', blob);
//   const uploadresponse = await fetch('http://127.0.0.1:5000/validate', { method: 'POST', body: fd});
//   const validresp = await uploadresponse.text();
//   console.log(validresp);
//   return validresp;
// }
