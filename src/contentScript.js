console.log("Content page execution started");

chrome.storage.local.get(['state'], (result)=>{
  if (result['state'] == undefined) {
    chrome.storage.local.set({'state':'enabled'});
  }
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  chrome.storage.local.get(['state']).then((result) => {
    if (result.state == 'enabled' && msg.action == 'image') {
      console.log('image val req.');
      blurimages();
    }
  });
});


function blurimages() {
  const imgarr = document.getElementsByTagName("img");
  if (imgarr) {
    for (img of imgarr) {
      if (!img.classList.contains('blur-processed')) {
        img.classList.add("blur-image");
        (async (image) => {
          if (image.src){
            image.classList.add("blur-processed");
            loadandsendimage(image.src, image);
          }
        })(img);
      }
    }
  }
}


function loadandsendimage(url, imgtag) {
  // Load image (with crossOrigin set to anonymouse so that it can be used in a
  // canvas later).
  const IMAGE_SIZE = 128;
  const MIN_IMG_SIZE = 128;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onerror = function(e) {
    console.warn(`Could not load image from external source ${imgtag.src}.`);
    imgtag.classList.add("blur-verified");
    return;
  };
  img.onload = function(e) {
    if ((img.height && img.height > MIN_IMG_SIZE) ||
        (img.width && img.width > MIN_IMG_SIZE)) {
      img.width = IMAGE_SIZE;
      img.height = IMAGE_SIZE;
      // When image is loaded, render it to a canvas and send its ImageData back
      // to the service worker.
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const rawimagedata = {
        rawImageData: Array.from(imageData.data),
        width: img.width,
        height: img.height,
        url: img.src
      };
      chrome.runtime.sendMessage({ask : "validimage", imagedata: rawimagedata})
      .then((response)=>{
        if (response.valid) {
          imgtag.classList.add("blur-verified");
          imgtag.classList.remove("blur-image");
        }
      });
    }
    else {
      console.warn(`Image size too small. [${img.height} x ${img.width}] vs. minimum [${MIN_IMG_SIZE} x ${MIN_IMG_SIZE}]`);
      imgtag.classList.add("blur-verified");
      imgtag.classList.remove("blur-image");
    }
  };
  img.src = url;
}