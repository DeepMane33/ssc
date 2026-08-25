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

var TOTAL_PAGES=10,currentPage=1,lenis=null;
var heroSection=document.getElementById("heroSection");
var formSection=document.getElementById("formSection");
var guidelinesSection=document.getElementById("guidelinesSection");
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
  8:["agreeTerms"],
  9:["whyInterested","hasIdea"],
  10:["confirmAccuracy","noGuarantee","agreeContact"]
};

/* ============================================
   LENIS SMOOTH SCROLL
   ============================================ */
function initLenis(){
  if(typeof Lenis==="undefined")return;
  lenis=new Lenis({duration:1.8,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true,touchMultiplier:1.2,orientation:"vertical"});
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

  /* Guideline cards — scroll-triggered stagger reveal */
  if(typeof ScrollTrigger!=="undefined"){
    gsap.fromTo(".guideline-card",{opacity:0,y:36},{opacity:1,y:0,duration:0.6,ease:"power3.out",stagger:0.12,clearProps:"opacity,transform",scrollTrigger:{trigger:".guidelines-list",start:"top 82%",once:true}});
    gsap.fromTo(".guidelines-head",{opacity:0,y:24},{opacity:1,y:0,duration:0.6,ease:"power3.out",scrollTrigger:{trigger:"#guidelinesSection",start:"top 80%",once:true}});
  }
}

/* ============================================
   SPECULAR HIGHLIGHT TRACKING
   ============================================ */
function initSpecularTracking(){
  document.addEventListener("mousemove",function(e){
    document.querySelectorAll(".liquid-glass").forEach(function(card){
      if(card.classList.contains("guideline-card")||card.classList.contains("confirm-box")||card.closest(".form-section"))return;
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
    if(input.type==="checkbox"&&input.required&&!input.checked){isValid=false;errorMsg="This field is required"}
    else if(input.type!=="checkbox"&&input.required&&!input.value.trim()){isValid=false;errorMsg="This field is required"}
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
  if(guidelinesSection)guidelinesSection.classList.add("hidden");
  formSection.classList.remove("hidden");
  goToPage(1);
  window.scrollTo({top:0,behavior:"auto"});
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
    showSuccess(row.email);
    sendConfirmation(row.email,row.full_name);
  }).catch(function(err){
    console.error("Supabase insert failed:",err);
    showToast("Submission failed: "+(err&&err.message?err.message:"please try again"),"error");
    submitBtn.disabled=false;
    submitBtn.textContent=original;
  });
});

function showSuccess(email){
  var emailEl=document.getElementById("successEmail");
  if(emailEl)emailEl.textContent=email||"";
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
   SWIFT LOGO 3D TILT
   Pointer-tracked rotate with eased lerp follow
   ============================================ */
function initSwiftTilt(){
  var logo=document.getElementById("swiftLiquidLogo");
  if(!logo)return;
  if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  var tx=0,ty=0,cx=0,cy=0,raf=null;
  function tick(){
    cx+=(tx-cx)*0.07;
    cy+=(ty-cy)*0.07;
    logo.style.transform="perspective(700px) rotateX("+cy.toFixed(3)+"deg) rotateY("+cx.toFixed(3)+"deg)";
    if(Math.abs(tx-cx)>0.01||Math.abs(ty-cy)>0.01){raf=requestAnimationFrame(tick)}
    else{raf=null}
  }
  function kick(){if(!raf)raf=requestAnimationFrame(tick)}
  logo.addEventListener("pointermove",function(e){
    var r=logo.getBoundingClientRect();
    var nx=(e.clientX-r.left)/r.width-0.5;
    var ny=(e.clientY-r.top)/r.height-0.5;
    tx=nx*22;ty=-ny*16;
    kick();
  });
  logo.addEventListener("pointerleave",function(){tx=0;ty=0;kick()});
}

/* ============================================
   SWIFT LIQUID-METAL SHADER
   Single visible WebGL canvas, molten orange/black
   flow masked to the Swift silhouette (mask texture)
   ============================================ */
function initSwiftMetal(){
  var cv=document.getElementById("swiftLiquidLogo");
  if(!cv)return;
  var D="M13.543 3.41c4.114 2.47 6.545 7.162 5.549 11.131-.024.093-.05.181-.076.272l.002.001c2.062 2.538 1.5 5.258 1.236 4.745-1.072-2.086-3.066-1.568-4.088-1.043a6.803 6.803 0 0 1-.281.158l-.02.012-.002.002c-2.115 1.123-4.957 1.205-7.812-.022a12.568 12.568 0 0 1-5.64-4.838c.649.48 1.35.902 2.097 1.252 3.019 1.414 6.051 1.311 8.197-.002C9.651 12.73 7.101 9.67 5.146 7.191a10.628 10.628 0 0 1-1.005-1.384c2.34 2.142 6.038 4.83 7.365 5.576C8.69 8.408 6.208 4.743 6.324 4.86c4.436 4.47 8.528 6.996 8.528 6.996.154.085.27.154.36.213.085-.215.16-.437.224-.668.708-2.588-.09-5.548-1.893-7.992z";
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function paintFallback(){
    var dpr=Math.min(window.devicePixelRatio||1,2);
    var w=cv.clientWidth||180;
    cv.width=Math.round(w*dpr);cv.height=Math.round(w*dpr);
    var g=cv.getContext("2d");if(!g)return;
    var S=cv.width,p=new Path2D(D),K=(S*0.94)/19.9;
    g.setTransform(K,0,0,K,S/2-11.55*K,S/2-10.05*K);
    var grd=g.createLinearGradient(0,3,0,21);
    grd.addColorStop(0,"#ff8a3a");grd.addColorStop(.5,"#ef4f22");grd.addColorStop(1,"#571507");
    g.fillStyle=grd;g.fill(p);
    g.globalCompositeOperation="source-atop";
    g.fillStyle="rgba(10,3,2,.55)";
    [[6,14,7],[15,8,6],[11,18,5]].forEach(function(b){
      g.beginPath();g.arc(b[0],b[1],b[2],0,Math.PI*2);g.fill();
    });
  }

  var gl=null;
  try{
    gl=cv.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true})
     ||cv.getContext("experimental-webgl",{alpha:true});
  }catch(e){gl=null}
  if(!gl){paintFallback();return}

  var VERT="attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}";
  var FRAG=[
    "precision highp float;",
    "uniform vec2 u_res;uniform float u_time;uniform sampler2D u_mask;",
    "float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float n2(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);",
    " return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}",
    "float fbm(vec2 p){float v=0.,a=.55;mat2 r=mat2(.8,.6,-.6,.8);",
    " for(int i=0;i<5;i++){v+=a*n2(p);p=r*p*2.03;a*=.5;}return v;}",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/u_res;",
    " float t=u_time*0.5;",
    " float m=texture2D(u_mask,uv).a;",
    " if(m<0.004){gl_FragColor=vec4(0.);return;}",
    " float asp=u_res.x/u_res.y;",
    " vec2 q=uv*vec2(asp,1.0)*2.6;",
    " float w1=fbm(q+vec2(t*.20,-t*.12));",
    " float w2=fbm(q*1.35+vec2(-t*.15,t*.17)+w1*.85);",
    " vec2 wp=vec2(w1,w2)-.5;",
    " float f=fbm(q*1.15+wp*2.3+vec2(0.,t*.28));",
    " float g2=fbm(q*2.1-wp*1.6+vec2(t*.22,0.));",
    " vec3 ink=vec3(0.045,0.016,0.010);",
    " vec3 ember=vec3(0.40,0.065,0.018);",
    " vec3 org=vec3(0.94,0.32,0.09);",
    " vec3 glow=vec3(1.0,0.63,0.28);",
    " float vein=smoothstep(0.50,0.30,f);",
    " float body=smoothstep(0.28,0.78,f);",
    " float heat=smoothstep(0.60,0.96,g2*w1+w2*.35);",
    " vec3 col=mix(org,ember,body*.62);",
    " col=mix(col,ink,vein*.88);",
    " col=mix(col,glow,heat*.62);",
    " float sh=sin((uv.x+uv.y)*3.2-t*.95+w2*2.2)*.5+.5;",
    " col+=glow*pow(sh,6.)*.20;",
    " vec2 px=1.0/u_res;",
    " float aE=texture2D(u_mask,uv+vec2(px.x,0.)).a+texture2D(u_mask,uv-vec2(px.x,0.)).a",
    "         +texture2D(u_mask,uv+vec2(0.,px.y)).a+texture2D(u_mask,uv-vec2(0.,px.y)).a;",
    " col*=mix(1.,.34,smoothstep(3.6,1.2,aE)*.72);",
    " col*=m;",
    " gl_FragColor=vec4(col,m);",
    "}"
  ].join("\n");

  function sh(type,src){
    var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||"shader");
    return s;
  }

  var prog,uTime,uRes;
  try{
    prog=gl.createProgram();
    gl.attachShader(prog,sh(gl.VERTEX_SHADER,VERT));
    gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FRAG));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog)||"link");
    gl.useProgram(prog);
    var buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(prog,"a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    uTime=gl.getUniformLocation(prog,"u_time");
    uRes=gl.getUniformLocation(prog,"u_res");
  }catch(err){paintFallback();return}

  /* Swift-silhouette mask texture — hardcoded bounds
     (bbox cx,cy=11.55,10.05 maxDim≈19.9 in 24-unit viewBox) */
  var maskTex=null;
  try{
    var MS=1024,mc=document.createElement("canvas");
    mc.width=mc.height=MS;
    var mg=mc.getContext("2d");
    if(!mg)throw new Error("no 2d");
    var p=new Path2D(D);
    var K=(MS*0.94)/19.9;
    mg.setTransform(K,0,0,K,MS/2-11.55*K,MS/2-10.05*K);
    mg.fillStyle="#fff";mg.fill(p);
    var probe=mg.getImageData(MS>>1,MS>>1,1,1).data;

    maskTex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,maskTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mc);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(prog,"u_mask"),0);
    gl.clearColor(0,0,0,0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    console.log("swift-metal: mask ready, center alpha=",probe[3]);
  }catch(err){console.error("swift-metal mask:",err);paintFallback();return}

  var W=0;
  function resize(){
    if(!uRes)return;
    var w=cv.clientWidth||180,dpr=Math.min(window.devicePixelRatio||1,2);
    W=Math.max(2,Math.round(w*dpr));
    if(cv.width!==W||cv.height!==W){cv.width=W;cv.height=W;}
    gl.viewport(0,0,W,W);
    gl.uniform2f(uRes,W,W);
  }
  try{
    resize();
  }catch(err){console.error("swift-metal resize:",err);paintFallback();return}
  window.addEventListener("resize",function(){try{resize()}catch(e){}});

  function draw(t){
    if(!uTime)return;
    gl.uniform1f(uTime,t);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }

  cv.classList.add("revealed");
  if(reduce){draw(7.3);return}
  var t0=performance.now();
  requestAnimationFrame(function loop(now){
    if(cv.clientWidth===0){requestAnimationFrame(loop);return}
    if(Math.abs((cv.clientWidth*(window.devicePixelRatio>2?2:window.devicePixelRatio||1))-W)>2)resize();
    draw((now-t0)/1000);
    requestAnimationFrame(loop);
  });
}

/* ============================================
   SWIFT FLUID LOGO — molten orange/black shader
   WebGL noise-flow rendered offscreen, then
   masked to the Swift silhouette + black outline
   ============================================ */

/* ============================================
   GUIDELINES APPLY BUTTON
   ============================================ */
var agreeCheckbox=document.getElementById("agreeTerms");
var guidelinesApplyBtn=document.getElementById("guidelinesApplyBtn");
if(agreeCheckbox&&guidelinesApplyBtn){
  agreeCheckbox.addEventListener("change",function(){
    guidelinesApplyBtn.disabled=!agreeCheckbox.checked;
  });
  guidelinesApplyBtn.addEventListener("click",showForm);
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
  initSwiftTilt();
  initSwiftMetal();
  updateProgress();
});
})();
