const KEY="studysprint-v1";
const state=JSON.parse(localStorage.getItem(KEY)||'{"tasks":[],"focusMinutes":0,"streak":0,"lastStudy":null}');
const $=s=>document.querySelector(s);
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const todayKey=()=>new Date().toISOString().slice(0,10);
const render=()=>{
  $("#streak").textContent=state.streak;
  const list=$("#taskList"); list.innerHTML="";
  state.tasks.forEach((t,i)=>{
    const el=document.createElement("article"); el.className="task"+(t.done?" done":"");
    el.innerHTML='<button class="check" aria-label="Complete task"></button><div><div class="task-subject"></div><div class="task-title"></div><div class="task-time"></div></div><button class="delete" aria-label="Delete task">×</button>';
    el.querySelector(".task-subject").textContent=t.subject;
    el.querySelector(".task-title").textContent=t.title;
    el.querySelector(".task-time").textContent=t.minutes+" min";
    el.querySelector(".check").onclick=()=>{t.done=!t.done;if(t.done)updateStreak();save();render()};
    el.querySelector(".delete").onclick=()=>{state.tasks.splice(i,1);save();render()};
    list.appendChild(el);
  });
  $("#emptyState").classList.toggle("hidden",state.tasks.length!==0);
  const done=state.tasks.filter(t=>t.done).length;
  $("#doneCount").textContent=done; $("#plannedCount").textContent=state.tasks.length; $("#focusMinutes").textContent=state.focusMinutes;
  const pct=state.tasks.length?Math.round(done/state.tasks.length*100):0;
  $("#progressText").textContent=pct+"%"; $("#progressBar").style.width=pct+"%";
};
function updateStreak(){
  const now=todayKey(), last=state.lastStudy;
  if(last===now)return;
  const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
  state.streak=last===yesterday?state.streak+1:1; state.lastStudy=now;
}
function openTask(){ $("#taskDialog").showModal(); $("#subjectInput").focus(); }
$("#addTaskBtn").onclick=openTask; $("#emptyAddBtn").onclick=openTask; $("#closeDialog").onclick=()=>$("#taskDialog").close();
$("#taskForm").addEventListener("submit",e=>{
  e.preventDefault();
  state.tasks.push({subject:$("#subjectInput").value.trim(),title:$("#taskInput").value.trim(),minutes:Number($("#minutesInput").value),done:false});
  save();render();$("#taskDialog").close();e.target.reset();$("#minutesInput").value=30;
});
document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active"); $("#"+btn.dataset.tab).classList.add("active");
});
let seconds=1500,timerId=null;
const drawTimer=()=>{const m=Math.floor(seconds/60),s=seconds%60;$("#timer").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")};
const stopTimer=()=>{if(timerId){clearInterval(timerId);timerId=null}};
$("#startTimer").onclick=()=>{
  if(timerId){stopTimer();$("#startTimer").textContent="Resume";return}
  $("#startTimer").textContent="Pause";$("#timerLabel").textContent="Focus mode is running.";
  timerId=setInterval(()=>{
    seconds--;drawTimer();
    if(seconds<=0){stopTimer();state.focusMinutes+=Math.round(Number($("#timer").dataset.minutes||25));save();$("#timerLabel").textContent="Session complete. Nice work.";$("#startTimer").textContent="Start";seconds=1500;drawTimer();render()}
  },1000);
};
$("#resetTimer").onclick=()=>{stopTimer();seconds=1500;drawTimer();$("#startTimer").textContent="Start";$("#timerLabel").textContent="Ready for a focus session?"};
document.querySelectorAll(".quick-times button").forEach(b=>b.onclick=()=>{stopTimer();const min=Number(b.dataset.minutes);seconds=min*60;$("#timer").dataset.minutes=min;drawTimer();$("#startTimer").textContent="Start";$("#timerLabel").textContent=min+" minute session ready."});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null;$("#installBtn").classList.add("hidden")};
drawTimer();render();