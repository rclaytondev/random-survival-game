var btn1Over = false;
var btn1Txt = 100;
var btn1Bg = 200;
var headerThickness = 0;
function doByTime() {
  var btn1 = document.getElementById("home-button");
  document.getElementById("home").style.color = "rgb(" + btn1Txt + ", " + btn1Txt + ", " + btn1Txt + ")";
  btn1.style.backgroundColor = "rgb(" + btn1Bg + ", " + btn1Bg + ", " + btn1Bg + ")";
  if(btn1Over) {
    btn1Txt += (btn1Txt < 200) ? 5 : 0;
    btn1Bg -= (btn1Bg > 100) ? 5 : 0;
  }
  else {
    btn1Txt -= (btn1Txt > 100) ? 5 : 0;
    btn1Bg += (btn1Bg < 200) ? 5 : 0;
  }
  var content = document.getElementsByTagName("html")[0];
  if(content.scrollTop > 20) {
    // console.log("scrolled");
    var header = document.getElementById("header");
    header.style.borderBottomStyle = "solid";
    header.style.borderWidth = headerThickness + "px";
    headerThickness += headerThickness < 5 ? 1 : 0;
  }
  else {
    var header = document.getElementById("header");
    // header.style.borderBottomStyle = "none";
    header.style.borderWidth = headerThickness + "px";
    headerThickness -= headerThickness > 0 ? 1 : 0;
  }
};
window.setInterval(doByTime, 1000 / 60);
//prevent arrow keys making screen scroll
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);
