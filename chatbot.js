/* Bimyem Expressions chat widget — keyword bot, booking ends in tap-to-call. No network calls. */
(function(){
"use strict";
var PHONE_TEL="tel:+12406430840", PHONE_TXT="(240) 643-0840";
var DIR_URL="https://www.google.com/maps/search/?api=1&query=Bimyem+Expressions+1700+W+Polo+Rd+%23108+Grand+Prairie+TX+75052";
var CALL_LINK='<a href="'+PHONE_TEL+'">'+PHONE_TXT+'</a>';
var CALL_BTN='<br><a class="bx-cta" href="'+PHONE_TEL+'">&#9742; Call '+PHONE_TXT+'</a>';
var DIR_BTN='<br><a class="bx-cta" href="'+DIR_URL+'" rel="noopener">&#10148; Get Directions</a>';

var R={
  price:'Our <strong>Mon&ndash;Thu specials</strong> (hair included):<br>'+
    '&bull; Knotless Braids &mdash; Mid Back: <strong>$180</strong><br>'+
    '&bull; Box Braids &mdash; Mid Back: <strong>$180</strong><br>'+
    '&bull; Boho Knotless &mdash; Mid Back: <strong>$220</strong><br>'+
    '&bull; Boho Knotless &mdash; Waist Length: <strong>$250</strong><br>'+
    '&bull; Senegalese Twist &mdash; Medium: <strong>$200</strong><br>'+
    '<a href="/specials.html">See full pricing</a>',
  hours:'We&rsquo;re open <strong>Mon&ndash;Sat 8:30 AM &ndash; 8:30 PM</strong> and <strong>Sun 2:00 PM &ndash; 6:00 PM</strong>. Walk-ins welcome, appointments preferred!',
  book:'We book by phone so we can find the perfect time for you. Tap below to call:'+CALL_BTN,
  bookStyle:'Wonderful choice! Tap below to call and lock in your time &mdash; we&rsquo;ll take great care of you:'+CALL_BTN,
  dir:'You&rsquo;ll find us at <strong>1700 W Polo Rd #108, Grand Prairie, TX 75052</strong>.'+DIR_BTN,
  specials:'<strong>Mon&ndash;Thu specials</strong> (hair included): Knotless Mid Back $180, Box Braids Mid Back $180, Boho Knotless $220&ndash;$250, Senegalese Twist $200. <a href="/specials.html">See all specials</a>'+CALL_BTN,
  hair:'Yes! <strong>Hair is included</strong> in all of our Monday&ndash;Thursday special prices.',
  long:'It depends on the style and length. Call us at '+CALL_LINK+' and we&rsquo;ll give you a time estimate for the style you want.',
  pain:'That&rsquo;s our specialty &mdash; <strong>gentle, pain-free braiding</strong>. Clean parts, even tension, no throbbing scalp or damaged edges. Beautiful braids, without the excess pain.',
  services:'We do <strong>knotless braids, box braids, cornrows &amp; stitch braids, goddess, Fulani &amp; lemonade braids, Senegalese / Marley / Havana twists, knotless twists, crochet braids, locs and faux locs</strong>. Which style are you thinking of?',
  thanks:'You&rsquo;re so welcome! We can&rsquo;t wait to see you. Anything else I can help with?',
  fallback:'I want to make sure you get the right answer &mdash; call us at '+CALL_LINK+' and we&rsquo;ll help you right away!'
};
var QUICK=["Services & prices","Hours","Book appointment","Directions","Specials"];
var STYLE_QUICK=["Knotless braids","Box braids","Twists","Something else"];

function match(t){
  if(/(book|appoint|reserv|schedule|slot|availab)/.test(t)) return "book";
  if(/(price|cost|how much|much for|\brate\b|pricing|charge)/.test(t)) return "price";
  if(/(special|deal|discount|offer|promo)/.test(t)) return "specials";
  if(/(hour|open|close|when.*(open|close)|sunday|monday)/.test(t)) return "hours";
  if(/(where|location|address|direction|locate|find you|get there|polo)/.test(t)) return "dir";
  if(/(hair includ|include.*hair|bring.*hair|provide.*hair)/.test(t)) return "hair";
  if(/(how long|take.*long|duration|hours.*take)/.test(t)) return "long";
  if(/(hurt|pain|painful|tender|gentle|edge)/.test(t)) return "pain";
  if(/(knotless|box braid|cornrow|stitch|goddess|fulani|lemonade|twist|loc|crochet|braid|style|service)/.test(t)) return "services";
  if(/(thank|thanks|thx)/.test(t)) return "thanks";
  return null;
}

var fab, panel, msgs, quick, form, input, opened=false, greeted=false, awaitingStyle=false;

function el(html){var d=document.createElement("div");d.innerHTML=html;return d.firstChild;}

function build(){
  if(document.getElementById("bxFab"))return; /* already initialized */
  document.body.appendChild(el(
    '<button class="bx-fab" id="bxFab" aria-label="Chat with Bimyem Expressions" aria-expanded="false" aria-controls="bxPanel">'+
    '<span aria-hidden="true">&#128172;</span><span class="bx-dot" id="bxDot" aria-hidden="true"></span></button>'));
  document.body.appendChild(el(
    '<div class="bx-panel" id="bxPanel" hidden role="dialog" aria-label="Chat with Bimyem Expressions">'+
    '<div class="bx-head"><div class="bx-ava" aria-hidden="true">B</div>'+
    '<div><strong>Bimyem Expressions</strong><small>Ask about services, prices &amp; hours</small></div>'+
    '<button class="bx-close" id="bxClose" aria-label="Close chat">&times;</button></div>'+
    '<div class="bx-msgs" id="bxMsgs" aria-live="polite"></div>'+
    '<div class="bx-quick" id="bxQuick"></div>'+
    '<form class="bx-form" id="bxForm"><input id="bxInput" type="text" placeholder="Type your question&hellip;" '+
    'aria-label="Type your question" autocomplete="off" maxlength="300">'+
    '<button type="submit" aria-label="Send">&#10148;</button></form></div>'));
  fab=document.getElementById("bxFab"); panel=document.getElementById("bxPanel");
  msgs=document.getElementById("bxMsgs"); quick=document.getElementById("bxQuick");
  form=document.getElementById("bxForm"); input=document.getElementById("bxInput");
  fab.addEventListener("click",toggle);
  document.getElementById("bxClose").addEventListener("click",toggle);
  form.addEventListener("submit",function(e){e.preventDefault();send(input.value);input.value="";});
  quick.addEventListener("click",function(e){
    if(e.target.tagName!=="BUTTON")return;
    var t=e.target.textContent; addUser(t); respond(t);
  });
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&!panel.hidden)toggle();
  });
}
function toggle(){
  var open=panel.hidden;
  if(open){panel.hidden=false;fab.setAttribute("aria-expanded","true");
    document.getElementById("bxDot").hidden=true;
    if(!greeted){greeted=true;
      say("Hi! &#128075; Welcome to <strong>Bimyem Expressions</strong> &mdash; Grand Prairie&rsquo;s 5.0-star braiding salon. How can I help you today?");
      setQuick(QUICK);}
    setTimeout(function(){input.focus();},250);
  }else{panel.hidden=true;fab.setAttribute("aria-expanded","false");fab.focus();}
}
function setQuick(list){
  quick.innerHTML="";
  list.forEach(function(t){var b=document.createElement("button");b.type="button";b.textContent=t;quick.appendChild(b);});
}
function scroll(){msgs.scrollTop=msgs.scrollHeight;}
function addUser(t){var d=document.createElement("div");d.className="bx-msg bx-user";d.textContent=t;msgs.appendChild(d);scroll();}
function say(html,delay){
  var tp=document.createElement("div");tp.className="bx-typing";tp.innerHTML="<i></i><i></i><i></i>";
  msgs.appendChild(tp);scroll();
  setTimeout(function(){tp.remove();
    var d=document.createElement("div");d.className="bx-msg bx-bot";d.innerHTML=html;
    msgs.appendChild(d);scroll();
  },delay||700);
}
function send(raw){
  var t=(raw||"").trim(); if(!t)return;
  addUser(t); respond(t);
}
function respond(t){
  var low=t.toLowerCase();
  if(awaitingStyle){awaitingStyle=false;say(R.bookStyle);setQuick(QUICK);return;}
  if(/^(hi|hey|hello|good (morning|afternoon|evening)|yo)\b/.test(low)){say("Hello! &#128075; How can I help &mdash; services &amp; prices, hours, booking, or directions?");setQuick(QUICK);return;}
  if(low.indexOf("book")>-1||low.indexOf("appoint")>-1){
    awaitingStyle=true;
    say("Great &mdash; what style would you like? Pick one and I&rsquo;ll get you to our booking line:");
    setQuick(STYLE_QUICK);return;
  }
  var k=match(low);
  if(k==="price"){say(R.price);}
  else if(k==="specials"){say(R.specials);}
  else if(k==="hours"){say(R.hours);}
  else if(k==="dir"){say(R.dir);}
  else if(k==="hair"){say(R.hair);}
  else if(k==="long"){say(R.long);}
  else if(k==="pain"){say(R.pain);}
  else if(k==="services"){say(R.services);}
  else if(k==="thanks"){say(R.thanks);}
  else{say(R.fallback);}
  setQuick(QUICK);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);
else build();
})();
