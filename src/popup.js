chrome.storage.local.get(['state'], (result)=>{
  if (result['state'] == 'enabled') {
    Button.innerHTML = "Disable";
  }
  else if(result['state'] == 'disabled') {
    Button.innerHTML = "Enable";
  }
})

Button = document.getElementById("Button");
Button.onclick = function() {
  chrome.storage.local.get(['state'], (result)=>{
    if (result['state'] == 'enabled') {
      Button.innerHTML = "Enable";
      chrome.storage.local.set({'state':'disabled'}, () => {
        console.log('State changed to disabled');
      });
    }
    else if(result['state'] == 'disabled') {
      Button.innerHTML = "Disable";
      chrome.storage.local.set({'state': 'enabled'},() => {
        console.log('State changed to enabled');
      });
    }
  })
}