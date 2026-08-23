/* SSC 2027 — Form Logic + GSAP + Lenis + Enhanced Interactions */
(function(){
"use strict";

/* ============================================
   SUPABASE — insert-only anon client
   ============================================ */
var SUPABASE_URL=window.SUPABASE_URL||"";
var SUPABASE_ANON_KEY=window.SUPABASE_ANON_KEY||"";
var supabase=(typeof window!=="undefined"&&window.supabase&&SUPABASE_URL&&SUPABASE_ANON_KEY)?window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;

/* Form field name -> registrations column */
var FIELD_MAP={
  email:"email",
  fullName:"full_name",
  contact:"contact_number",
  faculty:"faculty_institute",
  programme:"programme_course",
  semester:"current_semester_year",
  division:"division_batch",
  github:"github_profile",
  linkedin:"linkedin_profile",
  github_profile:"github_profile",
  linkedin_profile:"linkedin_profile",
  portfolio:"portfolio_website",
  hasUniEmail:"has_uni_email",
  uniEmail:"uni_email",
  enrollmentId:"uni_enrollment_id",
  personalEmail:"personal_email",
  studentStatus:"student_status",
  enrollmentNumber:"enrollment_number",
  macAccess:"mac_access",
  deviceFrequency:"device_frequency",
  needMacLab:"needs_mac_lab",
  prepHours:"hours_per_week_prep",
  appExperience:"app_experience",
  appleExperience:"apple_experience",
  independence:"independence_confidence",
  interests:"interests_improving",
  prevCompetitions:"previous_competitions",
  competitionDetails:"competition_details",
  commitmentLevel:"commitment_level",
  programHours:"hours_per_week_program",
  workSchedule:"work_schedule",
  attendSessions:"willing_to_attend",
  whyInterested:"why_interested",
  hasIdea:"has_idea",
  ideaDescription:"idea_description",
  excitement:"excitement_level",
  buildInterest:"build_interest",
  confirmAccuracy:"confirm_accurate",
  noGuarantee:"understand_no_guarantee",
  agreeContact:"agree_contact",
  anythingElse:"anything_else"
};
var BOOL_COLS=["has_uni_email","previous_competitions","confirm_accurate","understand_no_guarantee","agree_contact"];
var ARRAY_COLS=["interests_improving","work_schedule","excitement_level","build_interest"];

function buildRegistrationRow(){
  var fd=new FormData(form),raw={};
  fd.forEach(function(v,k){
    if(raw[k]!==undefined){
      if(Array.isArray(raw[k]))raw[k].push(v);
      else raw[k]=[raw[k],v];
    }else raw[k]=v;
  });
  var row={};
  Object.keys(FIELD_MAP).forEach(function(f){
    if(raw[f]===undefined)return;
    var col=FIELD_MAP[f],val=raw[f];
    if(ARRAY_COLS.indexOf(col)>=0)val=Array.isArray(val)?val:[val];
    else if(BOOL_COLS.indexOf(col)>=0)val=(val==="Yes");
    row[col]=val;
  });
  return row;
}

var TOTAL_PAGES=9,currentPage=1,lenis=null;
var heroSection=document.getElementById("heroSection");
var formSection=document.getElementById("formSection");
var showcaseSection=document.getElementById("showcaseSection");
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
  3:["uniEmail","enrollmentId"],
  4:["personalEmail","studentStatus","enrollmentNumber"],
  5:["macAccess","needMacLab","prepHours"],
  6:["appExperience","appleExperience","independence","prevCompetitions"],
  7:["commitmentLevel","programHours","attendSessions"],
  8:["whyInterested","hasIdea"],
  9:["confirmAccuracy","noGuarantee","agreeContact"]
};

/* ============================================
   LENIS SMOOTH SCROLL
   ============================================ */
function initLenis(){
  if(typeof Lenis==="undefined")return;
  lenis=new Lenis({duration:1.2,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true});
  function raf(time){lenis.raf(time);requestAnimationFrame(raf)}
  requestAnimationFrame(raf);
}

/* ============================================
   GSAP ANIMATIONS
   ============================================ */
function initGSAP(){
  if(typeof gsap==="undefined")return;
  if(typeof ScrollTrigger!=="undefined")gsap.registerPlugin(ScrollTrigger);

  /* Hero entrance — staggered reveal */
  var heroTl=gsap.timeline({delay:0.3});
  heroTl.fromTo(".site-header",{opacity:0,y:-20},{opacity:1,y:0,duration:0.6,ease:"power2.out"});
  heroTl.fromTo(heroSection.querySelector(".swift-logo"),{opacity:0,scale:0.5,rotation:-10},{opacity:1,scale:1,rotation:0,duration:0.7,ease:"back.out(1.7)"},"-=0.3");
  heroTl.fromTo(".hero-eyebrow",{opacity:0,y:15},{opacity:1,y:0,duration:0.5,ease:"power2.out"},"-=0.3");
  heroTl.fromTo(".hero-title",{opacity:0,y:25},{opacity:1,y:0,duration:0.6,ease:"power3.out"},"-=0.2");
  heroTl.fromTo(".hero-desc",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,ease:"power2.out"},"-=0.3");
  heroTl.fromTo(".cta-btn",{opacity:0,y:15,scale:0.9},{opacity:1,y:0,scale:1,duration:0.5,ease:"back.out(1.4)"},"-=0.2");
}

/* ============================================
   SPECULAR HIGHLIGHT TRACKING
   ============================================ */
function initSpecularTracking(){
  document.addEventListener("mousemove",function(e){
    document.querySelectorAll(".liquid-glass").forEach(function(card){
      var rect=card.getBoundingClientRect();
      var x=e.clientX-rect.left,y=e.clientY-rect.top;
      if(x>=-80&&x<=rect.width+80&&y>=-80&&y<=rect.height+80){
        card.style.background="radial-gradient(circle 300px at "+x+"px "+y+"px,rgba(255,255,255,0.08),transparent 65%),linear-gradient(155deg,rgba(20,24,34,0.42) 0%,rgba(15,18,27,0.32) 50%,rgba(11,13,20,0.24) 100%)";
      }else{
        card.style.background="";
      }
    });
  });
}

/* ============================================
   TILT EFFECT
   ============================================ */
function initTilt(){
  document.querySelectorAll("[data-tilt]").forEach(function(card){
    card.addEventListener("mousemove",function(e){
      var rect=card.getBoundingClientRect();
      var x=(e.clientX-rect.left)/rect.width-0.5;
      var y=(e.clientY-rect.top)/rect.height-0.5;
      card.style.transform="perspective(800px) rotateX("+(-y*2.5)+"deg) rotateY("+(x*2.5)+"deg) scale(1.005)";
    });
    card.addEventListener("mouseleave",function(){
      card.style.transform="perspective(800px) rotateX(0) rotateY(0) scale(1)";
      card.style.transition="transform 0.5s cubic-bezier(0.4,0,0.2,1)";
      setTimeout(function(){card.style.transition=""},500);
    });
  });
}

/* ============================================
   MAGNETIC BUTTON
   Proximity-based displacement + spring snap-back
   ============================================ */
function initMagneticButtons(){
  var magneticEls=document.querySelectorAll(".cta-btn,.submit-btn");
  magneticEls.forEach(function(btn){
    var strength=0.3;
    btn.addEventListener("mousemove",function(e){
      var rect=btn.getBoundingClientRect();
      var x=e.clientX-rect.left-rect.width/2;
      var y=e.clientY-rect.top-rect.height/2;
      btn.style.transform="translate("+(x*strength)+"px,"+(y*strength)+"px)";
      btn.classList.add("magnetic-active");
    });
    btn.addEventListener("mouseleave",function(){
      btn.style.transform="translate(0,0)";
      btn.style.transition="transform .4s cubic-bezier(.34,1.56,.64,1)";
      btn.classList.remove("magnetic-active");
      setTimeout(function(){btn.style.transition=""},400);
    });
  });
}

/* ============================================
   TOUCH RIPPLE EFFECT
   Material-style ripple on tap for mobile
   ============================================ */
function initTouchRipple(){
  var rippleEls=document.querySelectorAll(".custom-radio,.custom-checkbox,.nav-btn,.cta-btn");
  rippleEls.forEach(function(el){
    el.style.position="relative";
    el.style.overflow="hidden";
    el.addEventListener("click",function(e){
      var rect=el.getBoundingClientRect();
      var ripple=document.createElement("span");
      var size=Math.max(rect.width,rect.height);
      ripple.style.cssText="position:absolute;border-radius:50%;pointer-events:none;width:"+size+"px;height:"+size+"px;left:"+(e.clientX-rect.left-size/2)+"px;top:"+(e.clientY-rect.top-size/2)+"px;background:rgba(240,81,35,0.12);transform:scale(0);animation:rippleEffect .5s ease-out forwards";
      el.appendChild(ripple);
      setTimeout(function(){ripple.remove()},600);
    });
  });

  /* Inject ripple keyframes */
  if(!document.getElementById("rippleStyle")){
    var style=document.createElement("style");
    style.id="rippleStyle";
    style.textContent="@keyframes rippleEffect{to{transform:scale(3);opacity:0}}";
    document.head.appendChild(style);
  }
}

/* ============================================
   TOAST NOTIFICATION SYSTEM
   ============================================ */
var toastContainer=null;
function initToastContainer(){
  if(!toastContainer){
    toastContainer=document.createElement("div");
    toastContainer.className="toast-container";
    document.body.appendChild(toastContainer);
  }
}

function showToast(message,type){
  initToastContainer();
  var toast=document.createElement("div");
  toast.className="toast";
  var iconClass=type==="error"?"error":"success";
  var iconSvg=type==="error"
    ?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    :'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
  toast.innerHTML='<span class="toast-icon '+iconClass+'">'+iconSvg+'</span><span>'+message+'</span>';
  toastContainer.appendChild(toast);

  setTimeout(function(){
    toast.classList.add("toast-out");
    setTimeout(function(){toast.remove()},350);
  },3500);
}

/* ============================================
   FIELD VALIDATION
   ============================================ */
function validateField(name){
  var isValid=true,errorMsg="";
  var radios=form.querySelectorAll("[name=\""+name+"\"]");
  var isRadio=radios.length>0&&radios[0].type==="radio";
  var input=form.querySelector("[name=\""+name+"\"]");
  var fieldGroup=input?input.closest(".field-group"):null;
  if(!fieldGroup&&isRadio&&radios[0])fieldGroup=radios[0].closest(".field-group");
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
    showToast(errorMsg,"error");
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

/* ============================================
   PROGRESS BAR
   ============================================ */
function updateProgress(){
  var pct=Math.round((currentPage/TOTAL_PAGES)*100);
  progressFill.style.width=pct+"%";
  progressStep.textContent="Step "+currentPage+" of "+TOTAL_PAGES;
  progressPercent.textContent=pct+"%";
}

/* ============================================
   PAGE NAVIGATION with stagger animation
   ============================================ */
function goToPage(num){
  if(num<1||num>TOTAL_PAGES)return;
  clearValidation();

  /* Animate out current page */
  var currentCard=pages[currentPage-1].querySelector(".glass-card");
  if(currentCard&&typeof gsap!=="undefined"){
    gsap.to(currentCard,{opacity:0,y:-15,duration:0.2,ease:"power2.in"});
  }

  setTimeout(function(){
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

    /* Stagger animate new page elements */
    var card=pages[num-1].querySelector(".glass-card");
    if(card&&typeof gsap!=="undefined"){
      var tl=gsap.timeline();
      tl.fromTo(card,{opacity:0,y:24,scale:0.98},{opacity:1,y:0,scale:1,duration:0.45,ease:"power3.out"});
      /* Stagger field groups */
      var fields=card.querySelectorAll(".field-group");
      if(fields.length>0){
        tl.fromTo(fields,{opacity:0,y:12},{opacity:1,y:0,duration:0.3,ease:"power2.out",stagger:0.04},"-=0.2");
      }
    }
    window.scrollTo({top:0,behavior:"smooth"});
  },200);
}

/* ============================================
   FORM SUBMISSION
   ============================================ */
function showForm(){
  if(heroSection)heroSection.classList.add("hidden");
  if(showcaseSection)showcaseSection.classList.add("hidden");
  formSection.classList.remove("hidden");
  goToPage(1);
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ---- Event Listeners ---- */
prevBtn.addEventListener("click",function(){goToPage(currentPage-1)});
nextBtn.addEventListener("click",function(){
  if(validatePage(currentPage))goToPage(currentPage+1);
});

form.addEventListener("submit",function(e){
  e.preventDefault();
  if(!validatePage(currentPage))return;
  if(!supabase){
    showToast("Submission service is unavailable. Please try again later.","error");
    return;
  }
  submitBtn.disabled=true;
  var original=submitBtn.textContent;
  submitBtn.textContent="Submitting…";
  var row=buildRegistrationRow();
  supabase.from("registrations").insert([row],{returning:"minimal"}).then(function(res){
    if(res.error)throw res.error;
    showSuccess();
    sendConfirmation(row.email,row.full_name);
  }).catch(function(err){
    console.error("Supabase insert failed:",err);
    showToast("Submission failed: "+(err&&err.message?err.message:"please try again"),"error");
    submitBtn.disabled=false;
    submitBtn.textContent=original;
  });
});

function showSuccess(){
  form.classList.add("hidden");
  document.querySelector(".progress-wrapper").classList.add("hidden");
  successMessage.classList.remove("hidden");
  if(typeof gsap!=="undefined"){
    var successTl=gsap.timeline();
    successTl.fromTo(successMessage.querySelector(".success-card"),{opacity:0,y:30,scale:0.97},{opacity:1,y:0,scale:1,duration:0.6,ease:"power3.out"});
    successTl.fromTo(successMessage.querySelector(".swift-logo"),{opacity:0,scale:0.5,rotation:-15},{opacity:1,scale:1,rotation:0,duration:0.5,ease:"back.out(1.7)"},"-=0.3");
    successTl.fromTo(".success-title",{opacity:0,y:15},{opacity:1,y:0,duration:0.4,ease:"power2.out"},"-=0.2");
    successTl.fromTo(".success-desc",{opacity:0,y:12},{opacity:1,y:0,duration:0.4,ease:"power2.out"},"-=0.15");
  }
  showToast("Application submitted successfully!","success");
}

/* Fire-and-forget confirmation email (serverless /api/confirm) */
function sendConfirmation(email,name){
  if(!email)return;
  fetch("/api/confirm",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email:email,name:name||""})
  }).catch(function(e){
    console.warn("Confirmation email was not sent:",e);
  });
}

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

/* "Other" write-in: reveal when Other is selected, sync typed value into the radio */
form.querySelectorAll('input[type="radio"][value="Other"]').forEach(function(radio){
  var group=radio.closest(".radio-group");
  var writein=group?group.querySelector(".other-writein"):null;
  if(!writein)return;
  radio.addEventListener("change",function(){
    if(radio.checked){
      writein.classList.remove("hidden");
      if(writein.value.trim())radio.value=writein.value.trim();
    }else{
      writein.classList.add("hidden");
      radio.value="Other";
    }
  });
  writein.addEventListener("input",function(){
    radio.value=writein.value.trim()?writein.value.trim():"Other";
  });
});

/* ============================================
   3D PARALLAX DEVICE SHOWCASE
   Mouse-tracked perspective on device stage
   ============================================ */
function initDeviceParallax(){
  var stage=document.getElementById("devicesStage");
  if(!stage)return;
  var devices=stage.querySelectorAll(".device-float");

  stage.addEventListener("mousemove",function(e){
    var rect=stage.getBoundingClientRect();
    var x=(e.clientX-rect.left)/rect.width-0.5;
    var y=(e.clientY-rect.top)/rect.height-0.5;

    devices.forEach(function(dev){
      var speed=parseFloat(dev.dataset.speed)||1;
      var rotateY=x*12*speed;
      var rotateX=-y*8*speed;
      var translateX=x*15*speed;
      var translateY=y*12*speed;

      if(dev.classList.contains("device-iphone")){
        dev.style.transform="translate(-50%,-50%) rotateY("+(rotateY-6)+"deg) rotateX("+(rotateX+3)+"deg) translateX("+translateX+"px) translateY("+translateY+"px)";
      }else if(dev.classList.contains("device-macbook")){
        dev.style.transform="translate(-50%,-50%) rotateY("+(rotateY+10)+"deg) rotateX("+(rotateX-2)+"deg) scale(0.8) translateX("+translateX+"px) translateY("+translateY+"px)";
      }else if(dev.classList.contains("device-swift")){
        dev.style.animationPlayState="paused";
        dev.style.transform="translateY("+translateY+"px) rotate("+(rotateY*0.3)+"deg)";
      }else if(dev.classList.contains("device-badge")){
        dev.style.animationPlayState="paused";
        dev.style.transform="translateY("+translateY+"px)";
      }
    });
  });

  stage.addEventListener("mouseleave",function(){
    devices.forEach(function(dev){
      dev.style.transition="transform .6s cubic-bezier(.22,1,.36,1)";
      if(dev.classList.contains("device-iphone")){
        dev.style.transform="translate(-50%,-50%) rotateY(-6deg) rotateX(3deg)";
      }else if(dev.classList.contains("device-macbook")){
        dev.style.transform="translate(-50%,-50%) rotateY(10deg) rotateX(-2deg) scale(0.8)";
      }else if(dev.classList.contains("device-swift")){
        dev.style.transform="none";
        dev.style.animationPlayState="running";
      }else if(dev.classList.contains("device-badge")){
        dev.style.transform="none";
        dev.style.animationPlayState="running";
      }
      setTimeout(function(){dev.style.transition=""},600);
    });
  });

  /* Scroll-triggered reveal */
  if(typeof gsap!=="undefined"&&typeof ScrollTrigger!=="undefined"){
    gsap.registerPlugin(ScrollTrigger);
    var tl=gsap.timeline({scrollTrigger:{trigger:stage,start:"top 80%",once:true}});
    tl.fromTo(".showcase-eyebrow",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,ease:"power2.out"});
    tl.fromTo(".showcase-title",{opacity:0,y:25},{opacity:1,y:0,duration:0.6,ease:"power3.out"},"-=0.3");
    tl.fromTo(".showcase-desc",{opacity:0,y:18},{opacity:1,y:0,duration:0.5,ease:"power2.out"},"-=0.3");
    tl.fromTo(".device-iphone",{opacity:0,y:60,rotateY:-15},{opacity:1,y:0,rotateY:-6,duration:0.8,ease:"power3.out"},"-=0.3");
    tl.fromTo(".device-macbook",{opacity:0,y:50,rotateY:20},{opacity:1,y:0,rotateY:10,duration:0.8,ease:"power3.out"},"-=0.6");
    tl.fromTo(".device-swift",{opacity:0,scale:0},{opacity:1,scale:1,duration:0.5,ease:"back.out(1.7)"},"-=0.4");
    tl.fromTo(".device-badge",{opacity:0,y:-20},{opacity:1,y:0,duration:0.5,ease:"power2.out"},"-=0.3");
  }
}

/* ============================================
   SHOWCASE BEGIN BUTTON
   ============================================ */
var showcaseBeginBtn=document.getElementById("showcaseBeginBtn");
if(showcaseBeginBtn){
  showcaseBeginBtn.addEventListener("click",showForm);
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener("DOMContentLoaded",function(){
  initLenis();
  initGSAP();
  initSpecularTracking();
  initTilt();
  initMagneticButtons();
  initTouchRipple();
  initToastContainer();
  initDeviceParallax();
  updateProgress();
});
})();
