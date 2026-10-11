"use strict";

const tasks = {
  usb: {
    description: "Insert a USB connector into an upright power strip. 80 training trajectories per method.",
    auc: ["—", "0.266", "0.269", "0.562"], sr: ["30%", "40%", "50%", "90%"],
    conclusion: "eRLT improves AUC by <strong>108.9%</strong> over RLT and raises final-window success from <strong>50% to 90%</strong> under the same trajectory budget."
  },
  cable: {
    description: "Insert a ribbon-cable connector into a motherboard. 90 training trajectories per method.",
    auc: ["—", "0.272", "0.484", "0.710"], sr: ["70%", "50%", "100%", "100%"],
    conclusion: "eRLT improves AUC by <strong>46.7%</strong> over RLT. Both methods reach <strong>100% final-window success</strong>, with eRLT learning successful behavior earlier."
  }
};
const methods = [{id:"vla", name:"Frozen VLA", description:"Before adaptation"}, {id:"dsrl",name:"DSRL*",description:"Independent encoder"}, {id:"rlt",name:"RLT",description:"Fixed RL token"}, {id:"erlt",name:"eRLT",description:"Action-relevant routing"}];

function videoCard(task, stage, method) {
  const asset = `assets/media/${task}-${stage}-${method.id}`;
  return `<figure class="video-card ${method.id === "erlt" ? "ours" : ""}"><div class="video-label"><span>${method.name} ${method.id === "erlt" ? '<span class="ours-tag">Ours</span>' : ""}</span><small>${method.description}</small></div><video controls muted playsinline preload="none" data-src="${asset}.mp4" poster="${asset}.jpg" aria-label="${task === "usb" ? "USB insertion" : "Ribbon-cable insertion"}, ${method.name}, ${stage === "eval" ? "policy evaluation" : "training process"}"></video></figure>`;
}
function group(task, stage) {
  const training = stage === "train";
  return `<div class="experiment-group" data-group="${task}-${stage}"><div class="group-heading"><div><h3>${training ? "Learning process" : "Policy comparison"}</h3><p>${training ? "Watch the success rate evolve alongside the robot's behavior." : "Precision insertion after online adaptation."}</p></div><div class="group-actions"><button data-action="play" aria-label="Play all ${task} ${stage} videos">Play all</button><button data-action="restart" aria-label="Restart all ${task} ${stage} videos">Restart</button></div></div><div class="video-grid ${stage}-grid">${methods.filter(m => !training || m.id !== "vla").map(m=>videoCard(task,stage,m)).join("")}</div><p class="group-note">${training ? "Accelerated playback: approximately 25× for DSRL* and 20× for RLT / eRLT. All methods use the same trajectory budget. Warm-up and assisted episodes are included; playback speed is not a runtime comparison." : "Accelerated evaluation clips. On-video counters refer to the shown rollouts; quantitative results below use the paper's evaluation protocol."}</p><p class="sr-only group-status" role="status"></p></div>`;
}
for (const [task, data] of Object.entries(tasks)) {
  document.getElementById(`panel-${task}`).innerHTML = `<p class="task-description">${data.description}</p>${group(task,"eval")}${group(task,"train")}<div class="result-summary"><div class="table-scroll"><table class="results-table"><caption>Quantitative results <span>↑ Higher is better</span></caption><thead><tr><th scope="col">Method</th><th scope="col">Normalized AUC</th><th scope="col">Success rate</th></tr></thead><tbody>${methods.map((method,i)=>`<tr class="${method.id === "erlt" ? "ours-row" : ""}"><th scope="row">${method.name}${method.id === "erlt" ? ' <span class="ours-tag">Ours</span>' : ""}</th><td>${data.auc[i]}</td><td>${data.sr[i]}</td></tr>`).join("")}</tbody></table></div><p class="group-note">Success rate: final 10-episode window for adapted policies; 10 trials for Frozen VLA.</p><div class="callout"><p>${data.conclusion}</p></div></div>`;
}

function loadVideo(video) {
  if (video.dataset.src && !video.getAttribute("src")) { video.src = video.dataset.src; video.load(); }
}
function pauseOtherGroups(current) {
  document.querySelectorAll("video").forEach(video => { if (!current.contains(video)) video.pause(); });
}
document.querySelectorAll(".experiment-group").forEach(group => {
  const videos = [...group.querySelectorAll("video")];
  const playButton = group.querySelector('[data-action="play"]');
  const update = () => { const playing = videos.some(v => !v.paused && !v.ended); playButton.textContent = playing ? "Pause all" : "Play all"; playButton.setAttribute("aria-label", `${playing ? "Pause" : "Play"} all ${group.dataset.group} videos`); };
  const playAll = async () => {
    pauseOtherGroups(group);
    videos.forEach(loadVideo);
    const results = await Promise.allSettled(videos.map(v => v.play()));
    if (results.some(result => result.status === "rejected")) group.querySelector(".group-status").textContent = "Some videos could not play. Please try their individual play controls.";
    update();
  };
  playButton.addEventListener("click", () => { if (videos.some(v => !v.paused && !v.ended)) videos.forEach(v=>v.pause()); else playAll(); });
  group.querySelector('[data-action="restart"]').addEventListener("click", () => { videos.forEach(v=>{ loadVideo(v); v.currentTime = 0; }); playAll(); });
  videos.forEach(video => { ["play","pause","ended"].forEach(event=>video.addEventListener(event,update)); video.addEventListener("play",()=>pauseOtherGroups(group)); });
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTask(tab) {
  document.querySelectorAll(".task-panel video").forEach(video => video.pause());
  tabs.forEach(item => { const selected = item === tab; item.setAttribute("aria-selected", String(selected)); item.tabIndex = selected ? 0 : -1; document.getElementById(item.getAttribute("aria-controls")).hidden = !selected; });
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTask(tab));
  tab.addEventListener("keydown", event => { let next; if(event.key === "ArrowRight") next=(index+1)%tabs.length; if(event.key === "ArrowLeft") next=(index+tabs.length-1)%tabs.length; if(event.key === "Home") next=0; if(event.key === "End") next=tabs.length-1; if(next !== undefined){event.preventDefault();selectTask(tabs[next]);tabs[next].focus();} });
});

const overview = document.getElementById("overview-video");
const cover = document.getElementById("overview-play");
overview.controls = false;
overview.addEventListener("play", () => { cover.hidden = true; overview.controls = true; pauseOtherGroups(document.querySelector(".overview-player")); });
cover.addEventListener("click", () => { overview.play().catch(()=>{cover.hidden=true;overview.controls=true;}); });
document.querySelectorAll("[data-seek]").forEach(button => button.addEventListener("click", () => {
  const seekAndPlay = () => { overview.currentTime = Number(button.dataset.seek); overview.play().catch(()=>{cover.hidden=true;overview.controls=true;}); };
  if (overview.readyState >= 1) seekAndPlay(); else { overview.addEventListener("loadedmetadata",seekAndPlay,{once:true}); overview.load(); }
  document.getElementById("video").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
}));

if ("IntersectionObserver" in window) {
  const loader = new IntersectionObserver(entries => entries.forEach(entry=>{if(entry.isIntersecting){loadVideo(entry.target);loader.unobserve(entry.target);}}),{rootMargin:"400px 0px"});
  document.querySelectorAll("video[data-src]").forEach(video=>loader.observe(video));
  const pauser = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting && !document.fullscreenElement) {
      const videos = entry.target.matches("video") ? [entry.target] : entry.target.querySelectorAll("video");
      videos.forEach(video=>{if(!video.webkitDisplayingFullscreen)video.pause();});
    }
  }),{threshold:0});
  document.querySelectorAll(".experiment-group, #overview-video").forEach(group=>pauser.observe(group));
} else document.querySelectorAll("video[data-src]").forEach(loadVideo);
document.addEventListener("visibilitychange",()=>{if(document.hidden)document.querySelectorAll("video").forEach(video=>video.pause());});

const dialog = document.getElementById("figure-dialog");
document.querySelectorAll("[data-image]").forEach(button=>button.addEventListener("click",()=>{
  const image = document.getElementById("dialog-image"); image.src = button.dataset.image; image.alt = button.querySelector("img").alt;
  document.getElementById("dialog-caption").textContent = button.dataset.caption;
  dialog.showModal();
}));
document.querySelector(".dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{if(event.target === dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});

document.getElementById("copy-citation").addEventListener("click", async event=>{
  const button=event.currentTarget, text=document.getElementById("bibtex").textContent;
  try { await navigator.clipboard.writeText(text); button.textContent="Copied!"; document.getElementById("copy-status").textContent="BibTeX copied to clipboard."; setTimeout(()=>{button.textContent="Copy BibTeX";},2000); }
  catch { const range=document.createRange();range.selectNodeContents(document.getElementById("bibtex"));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent="Select & copy";document.getElementById("copy-status").textContent="Citation selected. Press Command+C or Control+C to copy."; }
});

const navLinks=[...document.querySelectorAll(".nav-links a")];
let ticking=false;
function updateNavigation(){let current="";for(const link of navLinks){const section=document.querySelector(link.getAttribute("href"));if(section.getBoundingClientRect().top<=150)current=link.getAttribute("href");}navLinks.forEach(link=>{const active=link.getAttribute("href")===current;link.classList.toggle("active",active);if(active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});ticking=false;}
window.addEventListener("scroll",()=>{if(!ticking){requestAnimationFrame(updateNavigation);ticking=true;}},{passive:true});updateNavigation();
