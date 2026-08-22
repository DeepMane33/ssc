/* SSC 2027 — Form Logic + GSAP + Lenis */
(function(){
"use strict";
var TOTAL_PAGES=9,currentPage=1,lenis=null;
var heroSection=document.getElementById("heroSection");
var formSection=document.getElementById("formSection");
var beginBtn=document.getElementById("beginBtn");
var prevBtn=document.getElementById("prevBtn");
var nextBtn=document.getElementById("nextBtn");
var submitBtn=document.getElementById("submitBtn");
var progressFill=document.getElementById("progressFill");
var progressStep=document.getElementById("progressStep");
var progressPercent=document.getElementById("progressPercent");
var successMessage=document.getElementById("successMessage");
var form=document.getElementById("registrationForm");
var pages=document.querySelectorAll(".form-page");

var pageValidation={
  1:["email"],
  2:["fullName","contact","faculty","programme","semester","hasUniEmail"],
  3:["uniEmail","enrollId"],
  4:["personalEmail","studentStatus","enrollNumber"],
  5:["macAccess","needMacLab","prepHours"],
  6:["appExperience","appleExperience","independence","prevCompetitions"],
  7:["commitmentLevel","programHours","attendSessions"],
  8:["whyInterested","hasIdea","ideaDesc"],
  9:["confirmAccuracy","noGuarantee","agreeContact"]
};

function initLenis(){
  if(typeof Lenis==="undefined")return;
  lenis=new Lenis({duration:1.2,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true});
  function raf(time){lenis.raf(time);requestAnimationFrame(raf)}
  requestAnimationFrame(raf);
}

function initGSAP(){
  if(typeof gsap==="undefined")return;
  if(typeof ScrollTrigger!=="undefined")gsap.registerPlugin(ScrollTrigger);
  gsap.fromTo(heroSection.querySelector(".hero-inner"),{opacity:0,y:40,scale:0.97},{opacity:1,y:0,scale:1,duration:1,ease:"power3.out",delay:0.2});
  gsap.fromTo(".site-header",{opacity:0,y:-20},{opacity:1,y:0,duration:0.6,ease:"power2.out",delay:0.1});
}

function initSpecularTracking(){
  document.addEventListener("mousemove",function(e){
    document.querySelectorAll(".liquid-glass").forEach(function(card){
      var rect=card.getBoundingClientRect();
      var x=e.clientX-rect.left,y=e.clientY-rect.top;
      if(x>=-80&&x<=rect.width+80&&y>=-80&&y<=rect.height+80){
        card.style.background="radial-gradient(circle 350px at "+x+"px "+y+"px,rgba(255,255,255,0.18),rgba(255,255,255,0.45) 60%,rgba(255,255,255,0.45))";
      }else{
        card.style.background="";
      }
    });
  });
}

function initTilt(){
  document.querySelectorAll("[data-tilt]").forEach(function(card){
    card.addEventListener("mousemove",function(e){
      var rect=card.getBoundingClientRect();
      var x=(e.clientX-rect.left)/rect.width-0.5;
      var y=(e.clientY-rect.top)/rect.height-0.5;
      card.style.transform="perspective(800px) rotateX("+(-y*5)+"deg) rotateY("+(x*5)+"deg) scale(1.01)";
    });
    card.addEventListener("mouseleave",function(){
      card.style.transform="perspective(800px) rotateX(0) rotateY(0) scale(1)";
      card.style.transition="transform 0.5s cubic-bezier(0.4,0,0.2,1)";
      setTimeout(function(){card.style.transition=""},500);
    });
  });
}

function validateField(name){
  var isValid=true,errorMsg="";
  var radios=form.querySelectorAll("[name=\""+name+"\"]");
  var isRadio=radios.length>0&&radios[0].type==="radio";
  var input=form.querySelector("[name=\""+name+"\"]");
  var fieldGroup=input?input.closest(".field-group"):null;
  if(!fieldGroup&&isRadio)fieldGroup=radios[0].closest(".field-group");
  var errorEl=fieldGroup?fieldGroup.querySelector(".field-error"):null;

  if(input&&input.type!=="radio"){
    if(input.required&&!input.value.trim()){isValid=false;errorMsg="This field is required"}
    else if(input.type==="email"&&input.value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)){isValid=false;errorMsg="Please enter a valid email"}
    else if(input.type==="url"&&input.value&&!/^https?:\/\/.+/.test(input.value)){isValid=false;errorMsg="Please enter a valid URL"}
  }
  if(isRadio){
    var checked=form.querySelector("[name=\""+name+"\"]:checked");
    if(radios[0].required&&!checked){isValid=false;errorMsg="Please select an option"}
  }
  if(!isValid){
    if(errorEl){errorEl.textContent=errorMsg;errorEl.classList.add("visible")}
    if(fieldGroup)fieldGroup.classList.add("has-error");
    if(input&&input.type!=="radio")input.classList.add("error");
    if(isRadio){var rg=radios[0].closest(".radio-group");if(rg)rg.classList.add("error")}
  }else{
    if(errorEl){errorEl.textContent="";errorEl.classList.remove("visible")}
    if(fieldGroup)fieldGroup.classList.remove("has-error");
    if(input)input.classList.remove("error");
    if(isRadio){var rg2=radios[0].closest(".radio-group");if(rg2)rg2.classList.remove("error")}
  }
  return isValid;
}

function clearValidation(){
  form.querySelectorAll(".field-error").forEach(function(el){el.textContent="";el.classList.remove("visible")});
  form.querySelectorAll(".has-error").forEach(function(el){el.classList.remove("has-error")});
  form.querySelectorAll(".error").forEach(function(el){el.classList.remove("error")});
  form.querySelectorAll(".radio-group.error").forEach(function(el){el.classList.remove("error")});
}

function validatePage(num){
  var fields=pageValidation[num]||[];
  var allValid=true;
  fields.forEach(function(name){if(!validateField(name))allValid=false});
  return allValid;
}

function updateProgress(){
  var pct=Math.round((currentPage/TOTAL_PAGES)*100);
  progressFill.style.width=pct+"%";
  progressStep.textContent="Step "+currentPage+" of "+TOTAL_PAGES;
  progressPercent.textContent=pct+"%";
}

function goToPage(num){
  if(num<1||num>TOTAL_PAGES)return;
  clearValidation();
  pages.forEach(function(p){p.classList.remove("active")});
  pages[num-1].classList.add("active");
  currentPage=num;
  updateProgress();
  prevBtn.disabled=currentPage===1;
  if(currentPage===TOTAL_PAGES){
    nextBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
  }else{
    nextBtn.classList.remove("hidden");
    submitBtn.classList.add("hidden");
  }
  var card=pages[num-1].querySelector(".glass-card");
  if(card&&typeof gsap!=="undefined"){
    gsap.fromTo(card,{opacity:0,y:24,scale:0.98},{opacity:1,y:0,scale:1,duration:0.45,ease:"power3.out"});
  }
  window.scrollTo({top:0,behavior:"smooth"});
}

function showForm(){
  heroSection.classList.add("hidden");
  formSection.classList.remove("hidden");
  goToPage(1);
}

/* ---- Event Listeners ---- */
beginBtn.addEventListener("click",function(){
  if(typeof gsap!=="undefined"){
    gsap.to(heroSection.querySelector(".hero-inner"),{
      opacity:0,y:-30,scale:0.97,duration:0.35,ease:"power2.in",
      onComplete:function(){showForm()}
    });
  }else{
    showForm();
  }
});

prevBtn.addEventListener("click",function(){goToPage(currentPage-1)});
nextBtn.addEventListener("click",function(){
  if(validatePage(currentPage))goToPage(currentPage+1);
});

form.addEventListener("submit",function(e){
  e.preventDefault();
  if(!validatePage(currentPage))return;
  var fd=new FormData(form);
  var data={};
  fd.forEach(function(v,k){
    if(data[k]){data[k]=(Array.isArray(data[k])?data[k]:[data[k]]).concat(v)}
    else{data[k]=v}
  });
  console.log("Form submitted:",data);
  form.classList.add("hidden");
  document.querySelector(".progress-wrapper").classList.add("hidden");
  successMessage.classList.remove("hidden");
  if(typeof gsap!=="undefined"){
    gsap.fromTo(successMessage.querySelector(".success-card"),{opacity:0,y:30,scale:0.97},{opacity:1,y:0,scale:1,duration:0.6,ease:"power3.out"});
  }
});

/* live validation on change */
form.querySelectorAll("input,textarea").forEach(function(el){
  el.addEventListener("change",function(){
    if(el.closest(".field-group")&&el.closest(".field-group").classList.contains("has-error")){
      validateField(el.name);
    }
  });
  el.addEventListener("input",function(){
    if(el.classList.contains("error"))validateField(el.name);
  });
});

/* ---- Init ---- */
document.addEventListener("DOMContentLoaded",function(){
  initLenis();
  initGSAP();
  initSpecularTracking();
  initTilt();
  updateProgress();
});
})();
