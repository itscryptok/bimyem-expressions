// Mobile nav toggle + footer year
document.addEventListener('DOMContentLoaded',function(){
  var btn=document.getElementById('navToggle'), nav=document.getElementById('mainNav');
  if(btn&&nav){btn.addEventListener('click',function(){
    var open=nav.hasAttribute('hidden');
    if(open){nav.removeAttribute('hidden');btn.setAttribute('aria-expanded','true');}
    else{nav.setAttribute('hidden','');btn.setAttribute('aria-expanded','false');}
  });}
  var y=document.getElementById('year'); if(y){y.textContent=new Date().getFullYear();}
});
