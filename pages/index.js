import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   AGENDA — suíte de organização para audiovisual
   Chat (console) -> parsing por IA -> dashboard tipo fila de render
   ============================================================ */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;450;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root{
  --void:#16181A; --panel:#212327; --raised:#2A2D31; --line:#383B40;
  --hi:#D7D9DC; --mid:#8D9197; --low:#61656B;
  --brand:#E68A3E;
  --sel:#3E6E9E;
  --confirmado:#48C28A; --incerto:#E0B33E; --andamento:#5B8FD6; --concluido:#6B7280;
  --danger:#E06A6A;
}
*{box-sizing:border-box}
.ag-root{
  position:fixed; inset:0; display:flex; background:var(--void); color:var(--hi);
  font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased;
  font-feature-settings:'cv01','ss01';
}
.mono{font-family:'JetBrains Mono',monospace}
.disp{font-family:'Space Grotesk',sans-serif}

/* layout */
.ag-main{flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden}
.ag-chat{width:340px; flex-shrink:0; border-left:1px solid var(--line); display:flex; flex-direction:column; background:var(--panel); position:relative}
.chat-grip{position:absolute; left:-4px; top:0; bottom:0; width:9px; cursor:col-resize; z-index:30; display:flex; align-items:center; justify-content:center}
.chat-grip span{width:3px; height:42px; border-radius:3px; background:var(--line); transition:background .15s, height .15s}
.chat-grip:hover span{background:var(--brand); height:60px}
.chat-grip:active span{background:var(--brand)}

/* header */
.ag-head{padding:20px 26px 16px; border-bottom:1px solid var(--line); flex-shrink:0}
.ag-head.mini{padding:10px 26px}
.head-toggle{width:30px; height:30px; border-radius:7px; background:var(--raised); border:1px solid var(--line); color:var(--mid); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .14s}
.head-toggle:hover{color:var(--hi); border-color:#4a4e55}
.head-toggle svg{width:16px; height:16px}
.ag-brandrow{display:flex; align-items:center; gap:12px}
.ag-mark{width:30px; height:30px; border-radius:8px; background:var(--brand); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 0 1px rgba(255,122,69,.3), 0 6px 18px -6px rgba(255,122,69,.5)}
.ag-mark span{width:11px; height:11px; border-radius:2px; background:var(--void)}
.ag-title{font-size:19px; font-weight:600; letter-spacing:-.01em}
.ag-sub{font-size:11px; color:var(--low); letter-spacing:.14em; text-transform:uppercase; margin-top:1px}
.ag-date{margin-left:auto; text-align:right}
.ag-date .d1{font-size:13px; font-weight:500; color:var(--hi); text-transform:capitalize}
.ag-date .d2{font-size:11px; color:var(--mid)}
.hmenu{position:relative; margin-left:14px}
.hbtn{width:34px; height:34px; border-radius:9px; background:var(--raised); border:1px solid var(--line); color:var(--mid); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .14s}
.hbtn:hover{color:var(--hi); border-color:#3a3f4a}
.hbtn svg{width:17px; height:17px}
.dbackdrop{position:fixed; inset:0; z-index:70}
.dropdown{position:absolute; top:42px; right:0; z-index:80; width:248px; background:var(--raised); border:1px solid var(--line); border-radius:13px; padding:6px; box-shadow:0 18px 44px -12px rgba(0,0,0,.75)}
.ditem{display:flex; align-items:center; gap:11px; width:100%; text-align:left; background:transparent; border:none; color:var(--hi); font-family:'Inter',sans-serif; font-size:13px; padding:10px; border-radius:9px; cursor:pointer; transition:background .12s}
.ditem:hover{background:var(--panel)}
.ditem svg{width:16px; height:16px; flex-shrink:0; color:var(--brand)}
.ddiv{height:1px; background:var(--line); margin:5px 6px}
.dcap{font-size:11px; color:var(--low); padding:8px 10px 5px; line-height:1.45}
.acts a.act{text-decoration:none; display:inline-flex; align-items:center; gap:5px}
.act.cal{padding:4px 9px}
.act.cal svg{width:13px; height:13px}
.act.cal:hover{color:var(--andamento); border-color:rgba(91,157,255,.45)}

/* stat chips */
.ag-stats{display:flex; gap:8px; margin-top:16px; flex-wrap:wrap}
.stat{display:flex; align-items:baseline; gap:7px; padding:8px 12px; background:var(--raised); border:1px solid var(--line); border-radius:9px}
.stat .n{font-size:17px; font-weight:600; line-height:1}
.stat .l{font-size:10.5px; color:var(--mid); text-transform:uppercase; letter-spacing:.06em}
.stat.warn .n{color:var(--incerto)} .stat.bad .n{color:var(--danger)}

/* filters */
/* tabs de categoria + ferramentas */
.ag-tabs{display:flex; align-items:center; gap:5px; padding:11px 26px; border-bottom:1px solid var(--line); flex-shrink:0; overflow-x:auto}
.tab{display:inline-flex; align-items:center; gap:7px; padding:7px 13px; border-radius:9px; font-size:13px; font-weight:500; color:var(--mid); background:transparent; border:1px solid transparent; cursor:pointer; white-space:nowrap; transition:all .14s}
.tab:hover{color:var(--hi); background:var(--raised)}
.tab.on{color:var(--hi); background:var(--raised); border-color:var(--tabc,#363b46)}
.tab-ic{display:flex; align-items:center}
.tab-n{font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--low); background:var(--void); padding:1px 6px; border-radius:6px; min-width:20px; text-align:center}
.tab.on .tab-n{color:var(--mid)}
.ag-tools{display:flex; align-items:center; gap:7px; margin-left:auto; padding-left:8px}
.seg{display:flex; background:var(--void); border:1px solid var(--line); border-radius:8px; overflow:hidden}
.seg button{font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:var(--mid); background:transparent; border:none; padding:6px 11px; cursor:pointer; transition:all .14s}
.seg button:hover{color:var(--hi)}
.seg button.on{color:var(--void); background:var(--hi)}
.tool{font-size:12px; font-weight:500; color:var(--mid); background:transparent; border:1px solid var(--line); border-radius:8px; padding:6px 11px; cursor:pointer; white-space:nowrap; transition:all .14s}
.tool:hover{color:var(--hi); border-color:#3a3f4a}
.tool.on{color:var(--void); background:var(--hi); border-color:var(--hi)}
.stat.click{cursor:pointer; font-family:inherit; text-align:left; transition:all .14s}
.stat.click:hover{border-color:var(--incerto)}
.stat.act-on{border-color:var(--incerto); background:rgba(242,193,78,.12)}
.grp-dot{width:9px; height:9px; border-radius:99px; flex-shrink:0}
.cat-ic{display:flex; align-items:center; flex-shrink:0}

/* board */
.ag-board{flex:1; overflow-y:auto; padding:18px 26px 80px}
.grp{margin-bottom:26px}
.grp-h{display:flex; align-items:center; gap:10px; margin-bottom:11px}
.grp-h .gt{font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--mid)}
.grp-h .gline{flex:1; height:1px; background:var(--line)}
.grp-h .gc{font-size:11px; color:var(--low); font-family:'JetBrains Mono',monospace}
.grp.urgent .gt{color:var(--danger)}

/* card = render job */
.job{position:relative; display:flex; gap:0; background:var(--panel); border:1px solid var(--line); border-radius:11px; margin-bottom:9px; overflow:hidden; transition:border-color .15s, transform .15s; animation:rise .3s ease both}
.job:hover{border-color:#373c47; transform:translateY(-1px)}
@keyframes rise{from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)}}
.job-bar{width:3px; flex-shrink:0; align-self:stretch}
.job.incerto{border-style:dashed; border-color:rgba(242,193,78,.45)}
.job.incerto .job-bar{background:repeating-linear-gradient(180deg,var(--incerto) 0 6px,transparent 6px 12px); animation:flow 1.1s linear infinite}
@keyframes flow{to{background-position:0 12px}}
.job-body{flex:1; min-width:0; padding:13px 15px}
.job-top{display:flex; align-items:center; gap:9px; margin-bottom:7px}
.tipo{font-size:10px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--low)}
.cli{display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--mid); font-weight:500}
.cli .dot{width:7px; height:7px; border-radius:99px; flex-shrink:0}
.badge{margin-left:auto; font-size:10.5px; font-weight:600; padding:3px 9px; border-radius:99px; text-transform:uppercase; letter-spacing:.04em}
.job-title{font-size:14.5px; font-weight:500; color:var(--hi); line-height:1.35; letter-spacing:-.005em}
.job.done .job-title{color:var(--low); text-decoration:line-through; text-decoration-color:var(--line)}
.job-meta{display:flex; align-items:center; gap:10px; margin-top:9px; flex-wrap:wrap}
.when{font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--mid)}
.rel{font-size:11px; color:var(--low)}
.rel.late{color:var(--danger); font-weight:600}
.rel.soon{color:var(--incerto)}
.prio{font-size:9.5px; font-weight:700; color:var(--danger); border:1px solid rgba(255,107,107,.4); padding:1px 6px; border-radius:5px; letter-spacing:.05em}
.notes{font-size:12px; color:var(--mid); margin-top:8px; line-height:1.4; padding-left:11px; border-left:2px solid var(--line)}

/* actions */
.acts{display:flex; gap:6px; margin-left:auto; flex-wrap:wrap; justify-content:flex-end}
.act{font-size:11px; font-weight:500; color:var(--mid); background:var(--raised); border:1px solid var(--line); padding:4px 10px; border-radius:7px; cursor:pointer; transition:all .14s; white-space:nowrap}
.act:hover{color:var(--hi); border-color:#3a3f4a}
.act.ok:hover{color:var(--confirmado); border-color:rgba(61,214,140,.4)}
.act.go:hover{color:var(--confirmado); border-color:rgba(61,214,140,.4)}
.act.del:hover{color:var(--danger); border-color:rgba(255,107,107,.4)}

/* empty */
.empty{text-align:center; padding:70px 20px; color:var(--low)}
.empty .big{font-size:40px; margin-bottom:14px; opacity:.5}
.empty h3{font-size:15px; color:var(--mid); font-weight:500; margin:0 0 6px}
.empty p{font-size:13px; max-width:300px; margin:0 auto}

/* navegação do calendário */
.calnav{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; flex-wrap:wrap}
.calnav-l{display:flex; align-items:center; gap:8px}
.calbtn{height:32px; min-width:32px; padding:0 10px; border-radius:8px; background:var(--raised); border:1px solid var(--line); color:var(--mid); font-size:16px; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .14s}
.calbtn:hover{color:var(--hi); border-color:#3a3f4a}
.calbtn.today{font-size:12.5px; font-weight:500}
.cal-label{font-size:18px; font-weight:600; margin-left:8px; letter-spacing:-.01em; text-transform:capitalize}
.cal-undated{font-size:12px; font-weight:500; color:var(--incerto); background:rgba(242,193,78,.1); border:1px solid rgba(242,193,78,.35); border-radius:8px; padding:6px 11px; cursor:pointer}
.cal-undated:hover{background:rgba(242,193,78,.18)}

/* grade do mês */
.cal-wd{display:grid; grid-template-columns:repeat(7,1fr); gap:6px; margin-bottom:6px}
.cal-wd span{font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--low); text-align:left; padding-left:4px}
.cal-grid{display:grid; grid-template-columns:repeat(7,1fr); gap:6px}
.cal-cell{min-height:96px; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:6px; display:flex; flex-direction:column; gap:4px; cursor:default; transition:border-color .14s}
.cal-cell:hover{border-color:#333843}
.cal-cell.dim{opacity:.4}
.cal-cell.today{border-color:var(--brand); box-shadow:inset 0 0 0 1px rgba(255,122,69,.4)}
.cal-dn{font-size:12.5px; font-weight:600; color:var(--mid); font-family:'JetBrains Mono',monospace; padding-left:2px}
.cal-cell.today .cal-dn{color:var(--brand)}
.cal-evs{display:flex; flex-direction:column; gap:3px; overflow:hidden}
.cal-ev{display:flex; align-items:center; gap:5px; width:100%; text-align:left; background:color-mix(in srgb, var(--ec) 14%, transparent); border:none; border-left:2.5px solid var(--ec); border-radius:4px; padding:3px 5px; cursor:pointer; overflow:hidden; transition:background .12s}
.cal-ev:hover{background:color-mix(in srgb, var(--ec) 26%, transparent)}
.cal-ev.inc{border-left-style:dashed; opacity:.85}
.cal-ev.done{opacity:.5}
.cal-ev.done .ev-x{text-decoration:line-through}
.ev-t{font-size:9.5px; color:var(--ec); flex-shrink:0; font-weight:600}
.ev-x{font-size:11px; color:var(--hi); white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.cal-more{font-size:10.5px; color:var(--low); background:transparent; border:none; cursor:pointer; text-align:left; padding:1px 5px}
.cal-more:hover{color:var(--hi)}

/* semana */
.week{display:grid; grid-template-columns:repeat(7,1fr); gap:6px; min-height:0}
.week-col{background:var(--panel); border:1px solid var(--line); border-radius:10px; overflow:hidden; display:flex; flex-direction:column}
.week-col.today{border-color:var(--brand)}
.week-h{display:flex; align-items:baseline; gap:6px; padding:9px 10px; border-bottom:1px solid var(--line)}
.week-h .wd{font-size:10.5px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:var(--low)}
.week-h .wn{font-size:15px; font-weight:600}
.week-col.today .week-h .wn{color:var(--brand)}
.week-body{padding:7px; display:flex; flex-direction:column; gap:5px; min-height:90px}
.week-empty{color:var(--line); text-align:center; padding:14px 0; font-size:14px}
.wev{text-align:left; background:color-mix(in srgb, var(--ec) 13%, transparent); border:none; border-left:3px solid var(--ec); border-radius:6px; padding:6px 8px; cursor:pointer; display:flex; flex-direction:column; gap:2px; transition:background .12s}
.wev:hover{background:color-mix(in srgb, var(--ec) 24%, transparent)}
.wev.inc{border-left-style:dashed; opacity:.85}
.wev.done{opacity:.5}
.wev.done .wev-x{text-decoration:line-through}
.wev-t{font-size:10px; font-weight:600; color:var(--ec)}
.wev-x{font-size:12px; color:var(--hi); font-weight:500; line-height:1.25}
.wev-c{display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:var(--mid)}
.wev-c .dot{width:6px; height:6px; border-radius:99px}

/* modal do dia */
.modal-bk{position:fixed; inset:0; z-index:90; background:rgba(6,7,9,.66); backdrop-filter:blur(2px); display:flex; align-items:center; justify-content:center; padding:16px; animation:fade .18s ease both}
@keyframes fade{from{opacity:0} to{opacity:1}}
.modal{width:100%; max-width:540px; max-height:88vh; background:var(--panel); border:1px solid var(--line); border-radius:16px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 24px 60px -16px rgba(0,0,0,.7); animation:rise .22s ease both}
.modal-h{display:flex; align-items:center; gap:12px; padding:18px 20px; border-bottom:1px solid var(--line); flex-shrink:0}
.modal-d{font-size:17px; font-weight:600; text-transform:capitalize; letter-spacing:-.01em}
.modal-s{font-size:12px; color:var(--mid); margin-top:2px}
.modal-x{margin-left:auto; width:30px; height:30px; border-radius:8px; background:var(--raised); border:1px solid var(--line); color:var(--mid); cursor:pointer; font-size:13px; flex-shrink:0}
.modal-x:hover{color:var(--hi); border-color:#3a3f4a}
.modal-body{padding:14px 16px; overflow-y:auto; min-height:0; flex:1; -webkit-overflow-scrolling:touch}
.modal-empty{color:var(--low); text-align:center; padding:30px 0; font-size:13px}

/* conflito de trabalho */
.confl-badge{font-size:10px; font-weight:700; color:var(--danger); background:rgba(255,107,107,.13); border:1px solid rgba(255,107,107,.4); padding:2px 7px; border-radius:99px; letter-spacing:.03em; text-transform:uppercase}
.multi-tag{font-size:10px; font-weight:600; color:var(--brand); background:rgba(255,122,69,.12); border:1px solid rgba(255,122,69,.35); padding:2px 7px; border-radius:99px; letter-spacing:.02em}
.dates{display:flex; flex-wrap:wrap; gap:5px; margin-top:9px}
.datepill{font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--mid); background:var(--raised); border:1px solid var(--line); border-radius:6px; padding:3px 8px}
.datepill.conf{color:var(--danger); border-color:rgba(255,107,107,.45); background:rgba(255,107,107,.08)}
.wev.confl{box-shadow:inset 0 0 0 1px rgba(255,107,107,.5)}
.job.confl{border-color:rgba(255,107,107,.5)}
.act.move:hover{color:var(--andamento); border-color:rgba(91,157,255,.45)}
.act.park:hover{color:var(--incerto); border-color:rgba(242,193,78,.45)}
.resched{display:flex; align-items:center; gap:9px; margin-top:10px; padding:9px 11px; background:var(--void); border:1px solid var(--line); border-radius:9px; flex-wrap:wrap}
.resched-l{font-size:12px; color:var(--mid)}
.resched input[type=date]{background:var(--raised); border:1px solid var(--line); border-radius:7px; color:var(--hi); font-family:'Inter',sans-serif; font-size:12.5px; padding:5px 8px; color-scheme:dark}
.resched-q,.resched-x{font-size:12px; font-weight:500; background:transparent; border:1px solid var(--line); border-radius:7px; padding:5px 10px; cursor:pointer; color:var(--mid)}
.resched-q:hover{color:var(--hi); border-color:var(--brand)}
.resched-x:hover{color:var(--hi)}
.cal-ev.confl{box-shadow:inset 0 0 0 1px rgba(255,107,107,.55)}
.cal-cell.confl{border-color:rgba(255,107,107,.5)}
.cell-warn{position:absolute; top:5px; right:6px; font-size:11px; line-height:1}
.cal-cell{position:relative}
.week-col.confl{border-color:rgba(255,107,107,.5)}
.week-warn{margin-left:auto; font-size:12px}
.confl-signal{position:relative; display:inline-flex; align-items:center; gap:7px; padding:7px 12px 7px 10px; border-radius:8px; background:rgba(224,106,106,.1); border:1px solid rgba(224,106,106,.38); color:#f0a8a8; cursor:pointer; transition:all .15s; flex-shrink:0}
.confl-signal:hover{background:rgba(224,106,106,.18); border-color:rgba(224,106,106,.6); color:#ffc2c2}
.confl-signal svg{width:15px; height:15px}
.confl-signal-n{font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:#fff}
.confl-signal-dot{position:absolute; top:-4px; left:-4px; width:9px; height:9px; border-radius:99px; background:var(--danger); box-shadow:0 0 0 0 rgba(224,106,106,.55); animation:conflPulse 2s infinite}
@keyframes conflPulse{0%{box-shadow:0 0 0 0 rgba(224,106,106,.5)} 70%{box-shadow:0 0 0 7px rgba(224,106,106,0)} 100%{box-shadow:0 0 0 0 rgba(224,106,106,0)}}
.modal-warn{background:rgba(255,107,107,.1); border:1px solid rgba(255,107,107,.4); border-radius:10px; padding:11px 13px; margin-bottom:14px; font-size:12.5px; line-height:1.5; color:#ffd2d2}
.modal-warn strong{color:var(--danger)}
.modal-warn b{color:#fff; font-weight:600}
.modal.confl{border-color:rgba(224,106,106,.5)}
.modal-ht{min-width:0}
.modal-flag{display:inline-block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--danger); background:rgba(224,106,106,.14); border:1px solid rgba(224,106,106,.4); border-radius:5px; padding:3px 8px; margin-bottom:7px}
.msg.warn{background:rgba(255,107,107,.1); border:1px solid rgba(255,107,107,.4); color:#ffd2d2}

/* chat */
.chat-h{padding:16px 18px; border-bottom:1px solid var(--line); display:flex; align-items:center; gap:9px; flex-shrink:0}
.chat-h .pulse{width:8px; height:8px; border-radius:99px; background:var(--confirmado); box-shadow:0 0 0 0 rgba(61,214,140,.5); animation:beat 2s infinite}
@keyframes beat{0%{box-shadow:0 0 0 0 rgba(61,214,140,.5)} 70%{box-shadow:0 0 0 7px rgba(61,214,140,0)} 100%{box-shadow:0 0 0 0 rgba(61,214,140,0)}}
.chat-h .ct{font-size:13px; font-weight:600}
.chat-h .cs{font-size:11px; color:var(--low); margin-left:auto; font-family:'JetBrains Mono',monospace}
.chat-toggle{width:27px; height:27px; border-radius:7px; background:var(--raised); border:1px solid var(--line); color:var(--mid); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .14s}
.chat-toggle:hover{color:var(--hi); border-color:#3a3f4a}
.chat-toggle svg{width:14px; height:14px}
.chat-log{flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:12px}
.msg{max-width:90%; font-size:13px; line-height:1.5; padding:10px 13px; border-radius:13px}
.msg.user{align-self:flex-end; background:var(--brand); color:var(--void); font-weight:500; border-bottom-right-radius:4px}
.msg.bot{align-self:flex-start; background:var(--raised); color:var(--hi); border:1px solid var(--line); border-bottom-left-radius:4px}
.msg.bot.err{border-color:rgba(255,107,107,.4); color:#ffb3b3}
.typing{display:flex; gap:4px; align-self:flex-start; padding:12px 14px; background:var(--raised); border:1px solid var(--line); border-radius:13px}
.typing i{width:6px; height:6px; border-radius:99px; background:var(--low); animation:bob 1.2s infinite}
.typing i:nth-child(2){animation-delay:.15s} .typing i:nth-child(3){animation-delay:.3s}
@keyframes bob{0%,60%,100%{opacity:.3; transform:translateY(0)} 30%{opacity:1; transform:translateY(-4px)}}
.hints{padding:0 18px 12px; display:flex; flex-direction:column; gap:6px}
.hint{text-align:left; font-size:12px; color:var(--mid); background:transparent; border:1px solid var(--line); border-radius:9px; padding:8px 11px; cursor:pointer; transition:all .14s; line-height:1.3}
.hint:hover{border-color:var(--brand); color:var(--hi)}
.hint b{color:var(--brand); font-weight:600}

/* console input */
.console{padding:14px 16px; border-top:1px solid var(--line); flex-shrink:0}
.console-in{display:flex; align-items:flex-end; gap:9px; background:var(--void); border:1px solid var(--line); border-radius:12px; padding:10px 12px; transition:border-color .15s}
.console-in:focus-within{border-color:var(--brand)}
.console-in .caret{color:var(--brand); font-family:'JetBrains Mono',monospace; font-size:14px; line-height:22px; flex-shrink:0}
.console-in textarea{flex:1; resize:none; background:transparent; border:none; outline:none; color:var(--hi); font-family:'Inter',sans-serif; font-size:13.5px; line-height:22px; max-height:96px}
.console-in textarea::placeholder{color:var(--low)}
.send{flex-shrink:0; width:32px; height:32px; border-radius:8px; background:var(--brand); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:opacity .15s}
.send:disabled{opacity:.35; cursor:default}
.send svg{width:16px; height:16px}

.mobile-toggle{display:none}
.launcher{position:fixed; bottom:22px; right:22px; z-index:60; display:flex; align-items:center; gap:9px; padding:12px 17px; background:var(--brand); color:var(--void); border:none; border-radius:99px; font-family:'Inter',sans-serif; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 10px 28px -7px rgba(255,122,69,.65); transition:transform .15s}
.launcher:hover{transform:translateY(-2px)}
.launcher svg{width:17px; height:17px}
.scroll::-webkit-scrollbar{width:8px} .scroll::-webkit-scrollbar-thumb{background:#2a2e38; border-radius:4px} .scroll::-webkit-scrollbar-track{background:transparent}

/* recolhido: esconde o histórico e as dicas, mantém cabeçalho + input */
.ag-chat.collapsed .chat-log,
.ag-chat.collapsed .hints{display:none}

/* desktop: recolhido some por completo (lançador flutuante reabre) */
@media (min-width:861px){
  .ag-chat.collapsed{display:none}
}

@media (max-width:860px){
  .ag-root{flex-direction:column}
  .ag-chat{width:100%!important; height:44vh; border-left:none; border-top:1px solid var(--line)}
  .ag-chat.collapsed{height:auto}
  .chat-grip{display:none}
  .launcher{display:none}
  .ag-stats{gap:6px} .stat{padding:7px 10px}
  .ag-head{padding:16px 18px 12px}
  .ag-board{padding:16px 18px 28px}
  .ag-tabs{padding:10px 18px}
  .cal-cell{min-height:62px; padding:4px}
  .cal-dn{font-size:11px}
  .ev-x{font-size:10px}
  .cal-ev{gap:3px; padding:2px 4px}
  .cal-label{font-size:16px}
  .week{display:flex; overflow-x:auto; gap:8px}
  .week-col{min-width:140px; flex-shrink:0}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}

/* ====== acabamento estilo DaVinci Resolve ====== */
.job,.cal-cell,.week-col,.stat,.console-in,.dropdown,.hbtn,.calbtn,.tool,.tab,.act{border-radius:5px}
.seg,.seg button{border-radius:4px}
.modal{border-radius:8px}
.ag-mark{border-radius:6px}
.badge,.tab-n,.multi-tag,.confl-badge{border-radius:4px}
.ag-mark{box-shadow:none}
.seg button.on{background:var(--sel); color:#fff}
.tool.on{background:var(--sel); color:#fff; border-color:var(--sel)}
.tab.on{background:var(--raised); border-color:var(--sel)}
.cal-cell.today{box-shadow:inset 0 0 0 1px var(--brand)}
.gt,.ag-sub,.tipo,.cal-wd span{letter-spacing:.12em}
.ag-head,.ag-tabs,.chat-h,.console{background:var(--panel)}

/* barra de páginas (Lista / Mês / Semana) — estilo páginas do Resolve */
.pagebar{display:flex; align-items:center; justify-content:center; gap:4px; padding:7px 8px; border-top:1px solid var(--line); background:var(--panel); flex-shrink:0}
.page{position:relative; display:flex; flex-direction:column; align-items:center; gap:4px; padding:7px 22px; border-radius:5px; background:transparent; border:none; color:var(--mid); cursor:pointer; font-size:10px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; transition:all .14s}
.page svg{width:19px; height:19px}
.page:hover{color:var(--hi); background:var(--raised)}
.page.on{color:var(--hi); background:var(--raised)}
.page.on::before{content:""; position:absolute; top:-7px; left:10px; right:10px; height:2px; background:var(--brand); border-radius:2px}
@media (max-width:860px){ .page{padding:6px 16px} }

/* ===== tela de entrada ===== */
.splash{position:fixed; inset:0; z-index:200; background:radial-gradient(120% 90% at 50% 0%, #20232a 0%, var(--void) 60%); display:flex; align-items:center; justify-content:center; padding:24px; animation:splashIn .4s ease both; overflow:hidden}
@keyframes splashIn{from{opacity:0} to{opacity:1}}
.splash-scan{position:absolute; inset:0; background:repeating-linear-gradient(0deg, rgba(255,255,255,.015) 0 1px, transparent 1px 3px); pointer-events:none}
.splash-inner{position:relative; width:100%; max-width:440px; display:flex; flex-direction:column; align-items:flex-start; animation:splashUp .5s cubic-bezier(.2,.8,.2,1) both}
@keyframes splashUp{from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:translateY(0)}}
.splash-mark{display:flex; align-items:center; gap:10px; margin-bottom:28px}
.splash-dot{width:26px; height:26px; border-radius:6px; background:var(--brand); box-shadow:0 0 24px -2px var(--brand)}
.splash-wm{font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; letter-spacing:.42em; color:var(--mid)}
.splash-greet{font-size:34px; font-weight:600; letter-spacing:-.02em; line-height:1.1; color:var(--hi)}
.splash-date{font-size:14px; color:var(--mid); margin-top:6px; text-transform:capitalize}
.splash-stats{display:flex; gap:10px; margin:28px 0; flex-wrap:wrap}
.splash-stat{display:flex; flex-direction:column; gap:3px; padding:13px 16px; background:var(--panel); border:1px solid var(--line); border-radius:7px; min-width:78px}
.splash-stat b{font-size:26px; line-height:1; color:var(--hi)}
.splash-stat span{font-size:10.5px; text-transform:uppercase; letter-spacing:.07em; color:var(--mid)}
.splash-stat.warn b{color:var(--incerto)}
.splash-stat.bad b{color:var(--danger)}
.splash-next{width:100%; background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:15px 16px; margin-bottom:24px}
.splash-next.empty{opacity:.85}
.splash-next-lbl{font-size:10px; text-transform:uppercase; letter-spacing:.12em; color:var(--low); margin-bottom:9px}
.splash-next-row{display:flex; gap:0; background:var(--raised); border-radius:6px; overflow:hidden}
.splash-next-bar{width:4px; flex-shrink:0; align-self:stretch}
.splash-next-body{padding:10px 13px; min-width:0}
.splash-next-title{font-size:15px; font-weight:500; color:var(--hi); line-height:1.35}
.splash-next-when{font-size:12px; color:var(--mid); margin-top:4px}
.splash-btn{display:inline-flex; align-items:center; gap:10px; padding:14px 26px; background:var(--brand); color:#10120f; border:none; border-radius:7px; font-family:'Inter',sans-serif; font-size:14.5px; font-weight:600; cursor:pointer; transition:transform .15s, box-shadow .15s; box-shadow:0 8px 28px -8px var(--brand)}
.splash-btn:hover{transform:translateY(-2px); box-shadow:0 12px 34px -8px var(--brand)}
.splash-btn svg{width:18px; height:18px}
.splash-alert{margin-top:18px; font-size:12.5px; color:#ffcaca; background:rgba(224,106,106,.12); border:1px solid rgba(224,106,106,.4); border-radius:7px; padding:9px 13px}
@media (max-width:860px){
  .splash-greet{font-size:27px}
  .splash-stat{min-width:0; flex:1; padding:11px 12px}
  .splash-stat b{font-size:22px}
}
`;

/* ---------- meta ---------- */
const STATUS = {
  confirmado: { label: "Confirmado", color: "var(--confirmado)", bg: "rgba(61,214,140,.13)" },
  incerto: { label: "Incerto", color: "var(--incerto)", bg: "rgba(242,193,78,.14)" },
  em_andamento: { label: "Em andamento", color: "var(--andamento)", bg: "rgba(91,157,255,.14)" },
  concluido: { label: "Concluído", color: "var(--concluido)", bg: "rgba(100,107,120,.16)" },
};
const TIPO = {
  captacao: "Captação", edicao: "Edição", producao: "Produção",
  reuniao: "Reunião", entrega: "Entrega", pessoal: "Pessoal", outro: "Job",
};
const CATEGORIA = {
  trabalho: { label: "Trabalho", color: "#FF7A45", icon: "clap" },
  reuniao: { label: "Reuniões", color: "#5B9DFF", icon: "people" },
  pessoal: { label: "Pessoal", color: "#C78BFF", icon: "heart" },
};
function inferCategoria(c) {
  if (c.categoria && CATEGORIA[c.categoria]) return c.categoria;
  if (c.tipo === "reuniao") return "reuniao";
  if (c.tipo === "pessoal") return "pessoal";
  return "trabalho";
}
// datas de um item (suporta múltiplas datas por job)
function datesOf(c) {
  if (!c) return [];
  if (Array.isArray(c.datas) && c.datas.length) return c.datas.filter(d => typeof d === "string");
  return typeof c.data === "string" && c.data ? [c.data] : [];
}
// conflito = 2+ trabalhos FIRMES (confirmado/em andamento) no mesmo dia.
// trabalho incerto fica "estacionado" e não gera conflito; reunião/pessoal nunca conflitam.
function workConflicts(items) {
  const wb = {};
  for (const c of items) {
    const cat = c.categoria || inferCategoria(c);
    if (cat === "trabalho" && (c.status === "confirmado" || c.status === "em_andamento")) {
      for (const d of datesOf(c)) (wb[d] = wb[d] || []).push(c);
    }
  }
  const days = new Set(Object.keys(wb).filter(d => wb[d].length >= 2));
  return { wb, days };
}
const CatIcon = ({ name, color, size = 14 }) => {
  const p = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "people") return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" {...p} /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5M21 20a6 6 0 0 0-4-5.7" {...p} /></svg>;
  if (name === "heart") return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 20s-7-4.5-9.2-8.5C1.3 8.4 2.8 5 6 5c2 0 3.2 1.3 4 2.5C10.8 6.3 12 5 14 5c3.2 0 4.7 3.4 3.2 6.5C19 15.5 12 20 12 20z" {...p} /></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" {...p} /><path d="M3 11l18 0M7 7l-1.5 4M12 7l-1.5 4M17 7l-1.5 4" {...p} /></svg>;
};
const CLIENT_PALETTE = ["#FF7A45", "#5B9DFF", "#3DD68C", "#C78BFF", "#F2C14E", "#FF6B9D", "#4EC8C8", "#FF9F6B"];
function clientColor(name) {
  if (!name) return "var(--low)";
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return CLIENT_PALETTE[h % CLIENT_PALETTE.length];
}

/* ---------- datas ---------- */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseISO(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(NaN);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function dayDiff(iso) {
  if (!iso) return null;
  const a = parseISO(iso), b = parseISO(todayISO());
  return Math.round((a - b) / 86400000);
}
const WD = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function fmtWhen(iso, hora) {
  if (!iso) return "Sem data";
  const d = parseISO(iso);
  if (isNaN(d.getTime())) return "Sem data";
  let s = `${WD[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]}`;
  if (hora) s += ` · ${hora}`;
  return s;
}
function relText(iso) {
  const n = dayDiff(iso);
  if (n === null) return { t: "", cls: "" };
  if (n < 0) return { t: `atrasado ${Math.abs(n)}d`, cls: "late" };
  if (n === 0) return { t: "hoje", cls: "soon" };
  if (n === 1) return { t: "amanhã", cls: "soon" };
  if (n <= 4) return { t: `em ${n} dias`, cls: "soon" };
  return { t: `em ${n} dias`, cls: "" };
}

/* ---------- calendário / backup ---------- */
const pad2 = (n) => String(n).padStart(2, "0");
const icsDate = (iso) => (typeof iso === "string" ? iso : "").replace(/-/g, "");
function isoPlus(iso, days) {
  const d = parseISO(iso); d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function icsDT(iso, hora) {
  const [h, m] = (hora || "09:00").split(":");
  return `${icsDate(iso)}T${pad2(+h)}${pad2(+m)}00`;
}
function plusHour(hora) {
  const [h, m] = (hora || "09:00").split(":").map(Number);
  return `${pad2((h + 1) % 24)}:${pad2(m)}`;
}
const escICS = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/[;,]/g, "\\$&").replace(/\n/g, "\\n");
function stampUTC() {
  const d = new Date();
  return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + "T" +
    pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + "Z";
}
function eventDesc(c) {
  return [TIPO[c.tipo], c.cliente && `Cliente: ${c.cliente}`, STATUS[c.status]?.label, c.notas]
    .filter(Boolean).join(" · ");
}
function buildICS(list) {
  const evs = [];
  for (const c of list) {
    for (const day of datesOf(c)) {
      const when = c.hora
        ? `DTSTART:${icsDT(day, c.hora)}\nDTEND:${icsDT(day, plusHour(c.hora))}`
        : `DTSTART;VALUE=DATE:${icsDate(day)}\nDTEND;VALUE=DATE:${icsDate(isoPlus(day, 1))}`;
      evs.push(`BEGIN:VEVENT\nUID:${c.id}-${icsDate(day)}@agenda-lucas\nDTSTAMP:${stampUTC()}\n${when}\nSUMMARY:${escICS(c.titulo)}\nDESCRIPTION:${escICS(eventDesc(c))}\nEND:VEVENT`);
    }
  }
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Agenda Lucas//PT-BR//\nCALSCALE:GREGORIAN\n${evs.join("\n")}\nEND:VCALENDAR`.replace(/\n/g, "\r\n");
}
function gcalLink(c, day) {
  const d = day || datesOf(c)[0];
  const p = new URLSearchParams({ action: "TEMPLATE", text: c.titulo || "Compromisso", details: eventDesc(c) });
  let url = `https://calendar.google.com/calendar/render?${p.toString()}`;
  if (d && c.hora) url += `&dates=${icsDT(d, c.hora)}/${icsDT(d, plusHour(c.hora))}`;
  else if (d) url += `&dates=${icsDate(d)}/${icsDate(isoPlus(d, 1))}`;
  return url;
}
function downloadFile(name, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

/* ---------- grade do calendário ---------- */
const MONTHS_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WD_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const fromDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const addDaysISO = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return fromDate(d); };
const addMonthsISO = (iso, n) => { const d = parseISO(iso); d.setDate(1); d.setMonth(d.getMonth() + n); return fromDate(d); };
const startOfWeekISO = (iso) => { const d = parseISO(iso); return addDaysISO(iso, -d.getDay()); }; // domingo
function weekDaysISO(iso) {
  const s = startOfWeekISO(iso);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(s, i));
}
function monthGridISO(iso) {
  const d = parseISO(iso); d.setDate(1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const last = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(lastDay)}`;
  let cur = startOfWeekISO(fromDate(d));
  const weeks = [];
  while (cur <= last) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDaysISO(cur, i)));
    cur = addDaysISO(cur, 7);
  }
  return weeks;
}
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
function normDates(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.filter(d => typeof d === "string" && ISO_RE.test(d)))].sort();
}
// data representativa: próxima futura, senão a mais recente
function repISO(c) {
  const ds = datesOf(c);
  if (!ds.length) return null;
  const t = todayISO();
  const up = ds.filter(d => d >= t);
  return up.length ? up[0] : ds[ds.length - 1];
}
function fmtMulti(dates, hora) {
  if (!dates.length) return "Sem data";
  if (dates.length === 1) return fmtWhen(dates[0], hora);
  const ds = dates.map(parseISO);
  const sameMonth = ds.every(d => d.getMonth() === ds[0].getMonth());
  let label;
  if (sameMonth) label = `${ds.map(d => d.getDate()).join(", ")} ${MO[ds[0].getMonth()]}`;
  else label = ds.map(d => `${d.getDate()} ${MO[d.getMonth()]}`).join(", ");
  return `${dates.length} datas · ${label}${hora ? " · " + hora : ""}`;
}


function bucketOf(c) {
  if (c.status === "concluido") return "concluido";
  const n = dayDiff(repISO(c));
  if (n === null) return "semdata";
  if (n < 0) return "atrasado";
  if (n === 0) return "hoje";
  if (n <= 7) return "semana";
  return "depois";
}
const BUCKETS = [
  { id: "atrasado", label: "Atrasados", urgent: true },
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta semana" },
  { id: "depois", label: "Mais adiante" },
  { id: "semdata", label: "Sem data definida" },
  { id: "concluido", label: "Concluídos" },
];

/* ---------- IA ---------- */
async function askAI(text, commitments) {
  // Só manda contexto relevante: jobs ativos com data >= hoje (pra detectar conflito).
  // Concluídos e passados não importam pra criar/editar e só gastam tokens.
  const today = todayISO();
  const ctx = commitments
    .filter(c => c.status !== "concluido" && datesOf(c).some(d => d >= today))
    .map(c => {
      const ds = datesOf(c).filter(d => d >= today).join(",");
      // só inclui cliente quando há conflito potencial (trabalho); aliases curtos
      return `${c.id}|${c.titulo}|${c.cliente || ""}|${c.categoria || ""}|${c.status}|${ds}`;
    })
    .join("\n");

  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, ctx }),
  });

  const bodyText = await res.text();
  let data;
  try { data = JSON.parse(bodyText); }
  catch (e) { throw new Error(`HTTP ${res.status} — resposta inesperada.`); }

  if (!res.ok || data?.error) throw new Error(data?.error || `Erro ${res.status}.`);

  let raw = (data.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const a = raw.indexOf("{"), z = raw.lastIndexOf("}");
  if (a === -1 || z === -1) throw new Error(`Sem JSON: ${raw.slice(0, 200)}`);
  try { return JSON.parse(raw.slice(a, z + 1)); }
  catch (e) { throw new Error(`JSON inválido: ${raw.slice(0, 200)}`); }
}


/* ---------- app ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function AppInner() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [cat, setCat] = useState("tudo");          // tudo | trabalho | reuniao | pessoal
  const [groupMode, setGroupMode] = useState("data"); // data | cliente
  const [view, setView] = useState("mes");          // lista | mes | semana
  const [cursor, setCursor] = useState(todayISO());    // âncora do calendário
  const [selDay, setSelDay] = useState(null);          // dia aberto no modal
  const [rescheduleId, setRescheduleId] = useState(null);
  const [showDone, setShowDone] = useState(false);
  const [onlyIncerto, setOnlyIncerto] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [headColl, setHeadColl] = useState(false);
  const [chatW, setChatW] = useState(340);
  const resizing = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [splash, setSplash] = useState(true);
  const fileRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: "bot", text: `Manda os seus compromissos do jeito que vierem na cabeça — eu organizo. Ex: "edição do casamento Gabriel Marques até sexta" ou "talvez captação pra Arbo na quarta".` },
  ]);
  const logRef = useRef(null);
  const taRef = useRef(null);
  const prevConflicts = useRef(new Set());
  const initConflicts = useRef(false);

  const saveEnabled = useRef(false);

  useEffect(() => {
    fetch("/api/items")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.items) && data.items.length) {
          const arr = data.items
            .filter(c => c && typeof c === "object")
            .map(c => {
              const rawDatas = Array.isArray(c.datas) ? c.datas : (c.data != null ? [c.data] : []);
              const datas = normDates(rawDatas.map(d => (d == null ? "" : String(d)).slice(0, 10)));
              return {
                ...c,
                id: c.id || uid(),
                titulo: typeof c.titulo === "string" ? c.titulo : "Sem título",
                cliente: typeof c.cliente === "string" ? c.cliente : "",
                tipo: TIPO[c.tipo] ? c.tipo : "outro",
                status: STATUS[c.status] ? c.status : "confirmado",
                prioridade: c.prioridade || "media",
                notas: typeof c.notas === "string" ? c.notas : "",
                hora: typeof c.hora === "string" ? c.hora : null,
                categoria: CATEGORIA[inferCategoria(c)] ? inferCategoria(c) : "trabalho",
                datas,
                data: datas[0] || null,
              };
            });
          setItems(arr);
        }
      })
      .catch(() => {})
      .finally(() => {
        // habilita saves SÓ após o carregamento — evita sobrescrever o banco com array vazio
        saveEnabled.current = true;
        setLoaded(true);
      });
  }, []);

  // salva com debounce de 1.5s — só roda quando saveEnabled for true
  useEffect(() => {
    if (!saveEnabled.current) return;
    const t = setTimeout(() => {
      fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [items]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy]);

  // largura do console: carrega salva e habilita arrastar
  useEffect(() => {
    const saved = Number(localStorage.getItem("chatW"));
    if (saved >= 280 && saved <= 720) setChatW(saved);

    const onMove = (e) => {
      if (!resizing.current) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const w = Math.min(720, Math.max(280, window.innerWidth - x));
      setChatW(w);
    };
    const onUp = () => {
      if (!resizing.current) return;
      resizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setChatW(w => { localStorage.setItem("chatW", String(w)); return w; });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const startResize = (e) => {
    resizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  // avisa quando um novo conflito de trabalho aparece
  useEffect(() => {
    if (!loaded) return;
    const { wb, days } = workConflicts(items);
    if (!initConflicts.current) { initConflicts.current = true; prevConflicts.current = days; return; }
    const novos = [...days].filter(d => !prevConflicts.current.has(d));
    prevConflicts.current = days;
    if (novos.length) {
      const iso = novos.sort()[0];
      const d = parseISO(iso);
      const quando = `${WD[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]}`;
      const nomes = wb[iso].map(x => `“${x.titulo}”`).join(" e ");
      setMessages(m => [...m, { role: "bot", warn: true, text: `⚠ Conflito de trabalho em ${quando}: ${nomes}. Reunião e pessoal podem se sobrepor, mas dois trabalhos firmes no mesmo dia costuma apertar. Abri o dia pra você decidir — mover um pra outra data, marcar como incerto ou manter os dois.` }]);
      setSelDay(iso);
    }
  }, [items, loaded]);

  function applyOps(ops) {
    const opDates = (c) => {
      if (Array.isArray(c.datas)) return normDates(c.datas);
      if (typeof c.data === "string" && c.data) return normDates([c.data]);
      return null;
    };
    setItems(prev => {
      let next = [...prev];
      for (const op of ops || []) {
        const c = op.commitment || {};
        if (op.type === "add") {
          const datas = opDates(c) || [];
          const item = {
            id: uid(), titulo: c.titulo || "Sem título", cliente: c.cliente || "",
            categoria: CATEGORIA[c.categoria] ? c.categoria : null,
            tipo: TIPO[c.tipo] ? c.tipo : "outro",
            datas, data: datas[0] || null, hora: c.hora || null,
            status: STATUS[c.status] ? c.status : "confirmado",
            prioridade: c.prioridade || "media", notas: c.notas || "",
          };
          item.categoria = item.categoria || inferCategoria(item);
          next.push(item);
        } else if (op.type === "delete") {
          next = next.filter(x => x.id !== op.id);
        } else {
          const i = next.findIndex(x => x.id === op.id);
          if (i === -1) continue;
          if (op.type === "complete") next[i] = { ...next[i], status: "concluido" };
          else if (op.type === "confirm") next[i] = { ...next[i], status: "confirmado" };
          else {
            const nd = opDates(c);
            next[i] = {
              ...next[i],
              ...(c.titulo ? { titulo: c.titulo } : {}), ...(c.cliente ? { cliente: c.cliente } : {}),
              ...(c.tipo && TIPO[c.tipo] ? { tipo: c.tipo } : {}),
              ...(c.categoria && CATEGORIA[c.categoria] ? { categoria: c.categoria } : {}),
              ...(nd !== null ? { datas: nd, data: nd[0] || null } : {}),
              ...(c.hora ? { hora: c.hora } : {}),
              ...(c.status && STATUS[c.status] ? { status: c.status } : {}),
              ...(c.prioridade ? { prioridade: c.prioridade } : {}),
              ...(c.notas ? { notas: c.notas } : {}),
            };
          }
        }
      }
      return next;
    });
  }

  async function send(textArg) {
    const text = (textArg ?? input).trim();
    if (!text || busy) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    setMessages(m => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const out = await askAI(text, items);
      if (out.operations && out.operations.length) applyOps(out.operations);
      setMessages(m => [...m, { role: "bot", text: out.reply || "Pronto, atualizei a agenda." }]);
    } catch (e) {
      setMessages(m => [...m, { role: "bot", err: true, text: `Não consegui processar: ${e.message || "erro desconhecido"}. Toquei o texto de volta no campo — é só tentar de novo.` }]);
      setInput(text);
    }
    setBusy(false);
  }

  // manual quick actions
  const setStatus = (id, status) => setItems(p => p.map(x => x.id === id ? { ...x, status } : x));
  const setCategoria = (id, categoria) => setItems(p => p.map(x => x.id === id ? { ...x, categoria } : x));
  const remove = (id) => setItems(p => p.filter(x => x.id !== id));

  // backup + calendário
  function exportBackup() {
    const payload = { app: "agenda-lucas", version: 1, exportedAt: new Date().toISOString(), items };
    downloadFile(`agenda-backup-${todayISO()}.json`, JSON.stringify(payload, null, 2), "application/json");
    setMenuOpen(false);
    setMessages(m => [...m, { role: "bot", text: `Backup gerado com ${items.length} ${items.length === 1 ? "item" : "itens"}. Guarda esse arquivo num lugar seguro — dá pra restaurar tudo a qualquer momento.` }]);
  }
  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const arr = Array.isArray(data) ? data : data.items;
        if (!Array.isArray(arr)) throw new Error("formato");
        const clean = arr.map(c => {
          const datas = normDates(c.datas && c.datas.length ? c.datas : (c.data ? [c.data] : []));
          return {
          id: c.id || uid(), titulo: c.titulo || "Sem título", cliente: c.cliente || "",
          categoria: CATEGORIA[c.categoria] ? c.categoria : inferCategoria(c),
          tipo: TIPO[c.tipo] ? c.tipo : "outro", datas, data: datas[0] || null, hora: c.hora || null,
          status: STATUS[c.status] ? c.status : "confirmado",
          prioridade: c.prioridade || "media", notas: c.notas || "",
        }; });
        setItems(prev => {
          const map = new Map(prev.map(x => [x.id, x]));
          let added = 0;
          for (const c of clean) { if (!map.has(c.id)) added++; map.set(c.id, c); }
          setMessages(m => [...m, { role: "bot", text: `Backup restaurado: ${added} novo(s) e ${clean.length - added} atualizado(s). Nada do que já estava aqui foi apagado.` }]);
          return [...map.values()];
        });
      } catch (e) {
        setMessages(m => [...m, { role: "bot", err: true, text: "Não consegui ler esse arquivo. Confere se é um backup .json gerado por aqui." }]);
      }
    };
    reader.readAsText(file);
    setMenuOpen(false);
  }
  function exportICS() {
    const dated = items.filter(c => datesOf(c).length && c.status !== "concluido");
    if (!dated.length) { setMenuOpen(false); setMessages(m => [...m, { role: "bot", text: "Nenhum compromisso com data pra exportar ainda. Coloca uma data nos itens e tenta de novo." }]); return; }
    downloadFile(`agenda-${todayISO()}.ics`, buildICS(dated), "text/calendar");
    setMenuOpen(false);
    setMessages(m => [...m, { role: "bot", text: `Arquivo .ics com ${dated.length} compromisso(s) gerado. No Google Agenda: Configurações → Importar e exportar → Importar, e seleciona esse arquivo.` }]);
  }

  const catOf = (c) => {
    const k = (c && c.categoria) || inferCategoria(c || {});
    return CATEGORIA[k] ? k : "trabalho";
  };

  const { wb: workDayMap, days: conflictDays } = workConflicts(items);
  const isConflictDay = (iso) => conflictDays.has(iso);
  const isFirmWork = (c) => catOf(c) === "trabalho" && (c.status === "confirmado" || c.status === "em_andamento");
  const isConflictItem = (c) => isFirmWork(c) && datesOf(c).some(d => conflictDays.has(d));
  const isConflictOn = (c, day) => isFirmWork(c) && conflictDays.has(day);
  const reschedule = (id, newDate, oldDate) => {
    setItems(p => p.map(x => {
      if (x.id !== id) return x;
      let datas = datesOf(x).slice();
      if (oldDate && datas.includes(oldDate)) datas = datas.map(d => d === oldDate ? newDate : d);
      else datas = newDate ? [newDate] : [];
      datas = normDates(datas);
      return { ...x, datas, data: datas[0] || null };
    }));
    setRescheduleId(null);
  };
  const removeDate = (id, day) => {
    setItems(p => p.map(x => {
      if (x.id !== id) return x;
      const datas = normDates(datesOf(x).filter(d => d !== day));
      return { ...x, datas, data: datas[0] || null };
    }));
  };

  // filtering
  const visible = items.filter(c => {
    if (cat !== "tudo" && catOf(c) !== cat) return false;
    if (!showDone && c.status === "concluido") return false;
    if (onlyIncerto && c.status !== "incerto") return false;
    return true;
  });

  const byDate = (a, b) => {
    const da = repISO(a), db = repISO(b);
    if (!da) return 1; if (!db) return -1;
    return da === db ? 0 : da < db ? -1 : 1;
  };

  // grouping — por data (buckets) ou por cliente
  let sections = [];
  if (groupMode === "data") {
    const g = {}; for (const b of BUCKETS) g[b.id] = [];
    for (const c of visible) g[bucketOf(c)].push(c);
    sections = BUCKETS.filter(b => g[b.id].length).map(b => ({
      key: b.id, label: b.label, urgent: b.urgent, items: g[b.id].sort(byDate),
    }));
  } else {
    const g = {};
    for (const c of visible) {
      const k = c.cliente?.trim() || (catOf(c) === "pessoal" ? "__pessoal" : "__sem");
      (g[k] = g[k] || []).push(c);
    }
    const earliest = arr => arr.reduce((m, c) => {
      const d = dayDiff(repISO(c)); if (d === null) return m;
      return m === null ? d : Math.min(m, d);
    }, null);
    sections = Object.entries(g).map(([k, arr]) => ({
      key: k,
      label: k === "__pessoal" ? "Pessoal" : k === "__sem" ? "Sem cliente" : k,
      color: k.startsWith("__") ? "var(--low)" : clientColor(k),
      isClient: !k.startsWith("__"),
      e: earliest(arr),
      items: arr.sort(byDate),
    })).sort((a, b) => {
      if (a.e === null && b.e === null) return a.label.localeCompare(b.label);
      if (a.e === null) return 1; if (b.e === null) return -1;
      return a.e - b.e;
    });
  }

  // stats
  const active = items.filter(c => c.status !== "concluido");
  const nHoje = active.filter(c => dayDiff(repISO(c)) === 0).length;
  const nSemana = active.filter(c => { const d = dayDiff(repISO(c)); return d !== null && d > 0 && d <= 7; }).length;
  const nIncerto = items.filter(c => c.status === "incerto").length;
  const nAtraso = active.filter(c => { const d = dayDiff(repISO(c)); return d !== null && d < 0; }).length;
  const catCount = (k) => items.filter(c => catOf(c) === k && (showDone || c.status !== "concluido")).length;
  const nAtivos = items.filter(c => c.status !== "concluido").length;

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const todayFull = `${WD[today.getDay()]}, ${today.getDate()} de ${MONTHS_FULL[today.getMonth()].toLowerCase()} de ${today.getFullYear()}`;

  // próximo compromisso (mais cedo a partir de hoje, não concluído)
  const nextUp = active
    .filter(c => { const d = dayDiff(repISO(c)); return d !== null && d >= 0; })
    .sort((a, b) => {
      const da = repISO(a), db = repISO(b);
      if (da === db) return (a.hora || "99:99").localeCompare(b.hora || "99:99");
      return da < db ? -1 : 1;
    })[0] || null;

  const TABS = [
    { id: "tudo", label: "Tudo", n: showDone ? items.length : nAtivos },
    { id: "trabalho", label: "Trabalho", n: catCount("trabalho") },
    { id: "reuniao", label: "Reuniões", n: catCount("reuniao") },
    { id: "pessoal", label: "Pessoal", n: catCount("pessoal") },
  ];
  const hints = [
    ["edição do ", "casamento Gabriel Marques", " até sexta"],
    ["reunião com ", "Arbo Films", " quarta 10h"],
    ["", "dentista", " terça de manhã"],
  ];

  // calendário
  const eventsByDay = {};
  for (const c of visible) for (const d of datesOf(c)) (eventsByDay[d] = eventsByDay[d] || []).push(c);
  for (const k in eventsByDay) eventsByDay[k].sort((a, b) => (a.hora || "99:99").localeCompare(b.hora || "99:99"));
  const undated = visible.filter(c => datesOf(c).length === 0);
  const openDay = (iso) => setSelDay(iso);

  const cur = parseISO(cursor);
  const calLabel = view === "mes"
    ? `${MONTHS_FULL[cur.getMonth()]} ${cur.getFullYear()}`
    : (() => {
        const wd = weekDaysISO(cursor); const a = parseISO(wd[0]), b = parseISO(wd[6]);
        const fmt = (d) => `${d.getDate()} ${MO[d.getMonth()]}`;
        return `${fmt(a)} – ${fmt(b)}`;
      })();
  const calStep = (n) => setCursor(c => view === "mes" ? addMonthsISO(c, n) : addDaysISO(c, n * 7));

  const renderJob = (c, ctxDay) => {
    const st = STATUS[c.status] || STATUS.confirmado; const kat = CATEGORIA[catOf(c)];
    const dates = datesOf(c);
    const multi = dates.length > 1;
    const rel = relText(ctxDay || repISO(c));
    const confl = ctxDay ? isConflictOn(c, ctxDay) : isConflictItem(c);
    const firstConfDay = dates.find(d => conflictDays.has(d));
    return (
      <div key={c.id} className={"job" + (c.status === "incerto" ? " incerto" : "") + (c.status === "concluido" ? " done" : "") + (confl ? " confl" : "")}>
        <div className="job-bar" style={{ background: c.status === "incerto" ? undefined : st.color }} />
        <div className="job-body">
          <div className="job-top">
            <span className="cat-ic" title={kat.label}><CatIcon name={kat.icon} color={kat.color} size={13} /></span>
            <span className="tipo">{TIPO[c.tipo]}</span>
            {multi && <span className="multi-tag" title="Trabalho com várias datas">×{dates.length} datas</span>}
            {c.cliente && <span className="cli"><span className="dot" style={{ background: clientColor(c.cliente) }} />{c.cliente}</span>}
            {confl && <span className="confl-badge">⚠ conflito</span>}
            <span className="badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          </div>
          <div className="job-title">{c.titulo}</div>

          {/* datas empilhadas (lista, multi) */}
          {!ctxDay && multi ? (
            <div className="dates">
              {dates.map(d => {
                const dd = parseISO(d); const conf = isFirmWork(c) && conflictDays.has(d);
                return <span key={d} className={"datepill" + (conf ? " conf" : "")}>{WD_SHORT[dd.getDay()]} {dd.getDate()} {MO[dd.getMonth()]}{c.hora ? ` · ${c.hora}` : ""}</span>;
              })}
            </div>
          ) : null}

          <div className="job-meta">
            {(ctxDay || !multi) && <span className="when">{fmtWhen(ctxDay || repISO(c), c.hora)}{ctxDay && multi ? ` · 1 de ${dates.length}` : ""}</span>}
            {rel.t && <span className={"rel " + rel.cls}>{rel.t}</span>}
            {c.prioridade === "alta" && c.status !== "concluido" && <span className="prio">URGENTE</span>}
            <div className="acts">
              {confl && !multi && <button className="act move" onClick={() => setRescheduleId(id => id === c.id ? null : c.id)}>Mover</button>}
              {confl && ctxDay && <button className="act move" onClick={() => setRescheduleId(id => id === c.id ? null : c.id)}>Mover este dia</button>}
              {confl && !ctxDay && multi && <button className="act move" onClick={() => openDay(firstConfDay)}>Resolver no dia</button>}
              {confl && <button className="act park" onClick={() => setStatus(c.id, "incerto")}>Marcar incerto</button>}
              {ctxDay && multi && <button className="act" onClick={() => removeDate(c.id, ctxDay)}>Tirar deste dia</button>}
              {c.status === "incerto" && <button className="act ok" onClick={() => setStatus(c.id, "confirmado")}>✓ Confirmar</button>}
              {c.status !== "concluido" && c.status !== "incerto" && <button className="act go" onClick={() => setStatus(c.id, "concluido")}>Concluir</button>}
              {c.status === "concluido" && <button className="act" onClick={() => setStatus(c.id, "confirmado")}>Reabrir</button>}
              {dates.length > 0 && c.status !== "concluido" && (
                <a className="act cal" href={gcalLink(c, ctxDay)} target="_blank" rel="noopener noreferrer" title="Adicionar ao Google Agenda">
                  <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M3 9h18M8 2v4M16 2v4M12 13v4M10 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Google
                </a>
              )}
              <button className="act del" onClick={() => remove(c.id)}>Excluir</button>
            </div>
          </div>
          {rescheduleId === c.id && (
            <div className="resched">
              <span className="resched-l">{ctxDay ? "Mover este dia para:" : "Mover para:"}</span>
              <input type="date" value={(ctxDay || repISO(c)) || ""} onChange={(e) => e.target.value && reschedule(c.id, e.target.value, ctxDay)} />
              <button className="resched-q" onClick={() => reschedule(c.id, addDaysISO(ctxDay || repISO(c), 1), ctxDay)}>+1 dia</button>
              <button className="resched-x" onClick={() => setRescheduleId(null)}>cancelar</button>
            </div>
          )}
          {c.notas && <div className="notes">{c.notas}</div>}
        </div>
      </div>
    );
  };

  const renderChip = (c, iso) => {
    const kc = CATEGORIA[catOf(c)].color;
    return (
      <button key={c.id} className={"cal-ev" + (c.status === "incerto" ? " inc" : "") + (c.status === "concluido" ? " done" : "") + (isConflictOn(c, iso) ? " confl" : "")}
        style={{ "--ec": kc }} onClick={() => openDay(iso)} title={c.titulo}>
        {c.hora && <span className="ev-t mono">{c.hora}</span>}
        <span className="ev-x">{c.titulo}</span>
      </button>
    );
  };

  return (
    <div className="ag-root">
      <style>{STYLE}</style>

      {splash && (
        <div className="splash">
          <div className="splash-scan" />
          <div className="splash-inner">
            <div className="splash-mark">
              <span className="splash-dot" />
              <span className="splash-wm">AGENDA</span>
            </div>
            <div className="splash-greet disp">{greeting}, Lucas</div>
            <div className="splash-date">{todayFull}</div>

            <div className="splash-stats">
              <div className="splash-stat"><b className="disp">{nHoje}</b><span>hoje</span></div>
              <div className="splash-stat"><b className="disp">{nSemana}</b><span>esta semana</span></div>
              <div className={"splash-stat" + (nIncerto ? " warn" : "")}><b className="disp">{nIncerto}</b><span>a confirmar</span></div>
              {nAtraso > 0 && <div className="splash-stat bad"><b className="disp">{nAtraso}</b><span>atrasados</span></div>}
            </div>

            {nextUp ? (
              <div className="splash-next">
                <div className="splash-next-lbl">Próximo na timeline</div>
                <div className="splash-next-row">
                  <span className="splash-next-bar" style={{ background: CATEGORIA[catOf(nextUp)].color }} />
                  <div className="splash-next-body">
                    <div className="splash-next-title">{nextUp.titulo}</div>
                    <div className="splash-next-when mono">
                      {fmtWhen(repISO(nextUp), nextUp.hora)}
                      {nextUp.cliente ? ` · ${nextUp.cliente}` : ""}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="splash-next empty">
                <div className="splash-next-lbl">Timeline livre</div>
                <div className="splash-next-title">Nenhum compromisso à frente. Bom momento pra planejar.</div>
              </div>
            )}

            <button className="splash-btn" onClick={() => setSplash(false)}>
              Entrar na sala de corte
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {conflictDays.size > 0 && (
              <div className="splash-alert">⚠ {conflictDays.size === 1 ? "1 dia com conflito de trabalho" : `${conflictDays.size} dias com conflito de trabalho`} — revise ao entrar</div>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      <div className="ag-main">
        <div className={"ag-head" + (headColl ? " mini" : "")}>
          <div className="ag-brandrow">
            <div className="ag-mark"><span /></div>
            <div>
              <div className="ag-title disp">Agenda</div>
              <div className="ag-sub">sala de corte · Lucas</div>
            </div>
            {conflictDays.size > 0 && (
              <button className="confl-signal" onClick={() => setSelDay([...conflictDays].sort()[0])}
                title={conflictDays.size === 1 ? "1 dia com conflito de trabalho — clique para resolver" : `${conflictDays.size} dias com conflito de trabalho — clique para resolver`}>
                <span className="confl-signal-dot" />
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="confl-signal-n">{conflictDays.size}</span>
              </button>
            )}
            <div className="ag-date">
              <div className="d1">{WD[today.getDay()]}, {today.getDate()} {MO[today.getMonth()]}</div>
              <div className="d2 mono">{todayISO()}</div>
            </div>
            <button className="head-toggle" onClick={() => setHeadColl(v => !v)} title={headColl ? "Mostrar resumo" : "Recolher topo"} aria-label={headColl ? "Mostrar resumo" : "Recolher topo"}>
              <svg viewBox="0 0 24 24" fill="none">
                {headColl
                  ? <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
            </button>
            <div className="hmenu">
              <button className="hbtn" onClick={() => setMenuOpen(v => !v)} aria-label="Dados e backup">
                <svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="2" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
              {menuOpen && (
                <>
                  <div className="dbackdrop" onClick={() => setMenuOpen(false)} />
                  <div className="dropdown">
                    <button className="ditem" onClick={exportBackup}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Exportar backup (.json)
                    </button>
                    <button className="ditem" onClick={() => fileRef.current && fileRef.current.click()}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 15V3M7 8l5-5 5 5M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Importar backup
                    </button>
                    <div className="ddiv" />
                    <button className="ditem" onClick={exportICS}>
                      <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                      Enviar pra Google Agenda (.ics)
                    </button>
                    <div className="dcap">O .ics importa todos os compromissos com data de uma vez. Cada cartão também tem um “+ Google” pra adicionar um por um.</div>
                  </div>
                </>
              )}
              <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ""; }} />
            </div>
          </div>
          {!headColl && (
            <div className="ag-stats">
              <div className="stat"><span className="n disp">{nHoje}</span><span className="l">hoje</span></div>
              <div className="stat"><span className="n disp">{nSemana}</span><span className="l">esta semana</span></div>
              <button className={"stat warn click" + (onlyIncerto ? " act-on" : "")} onClick={() => setOnlyIncerto(v => !v)} title="Filtrar só os incertos">
                <span className="n disp">{nIncerto}</span><span className="l">a confirmar</span>
              </button>
              {nAtraso > 0 && <div className="stat bad"><span className="n disp">{nAtraso}</span><span className="l">atrasados</span></div>}
            </div>
          )}
        </div>

        <div className="ag-tabs">
          {TABS.map(t => (
            <button key={t.id} className={"tab" + (cat === t.id ? " on" : "")} onClick={() => setCat(t.id)}
              style={cat === t.id && t.id !== "tudo" ? { "--tabc": CATEGORIA[t.id].color } : {}}>
              {t.id !== "tudo" && <span className="tab-ic"><CatIcon name={CATEGORIA[t.id].icon} color={cat === t.id ? CATEGORIA[t.id].color : "var(--mid)"} size={13} /></span>}
              {t.label}
              <span className="tab-n">{t.n}</span>
            </button>
          ))}
          <div className="ag-tools">
            {view === "lista" && (
              <div className="seg">
                <button className={groupMode === "data" ? "on" : ""} onClick={() => setGroupMode("data")}>Data</button>
                <button className={groupMode === "cliente" ? "on" : ""} onClick={() => setGroupMode("cliente")}>Cliente</button>
              </div>
            )}
            <button className={"tool" + (showDone ? " on" : "")} onClick={() => setShowDone(v => !v)}>
              {showDone ? "Ocultar concluídos" : "Concluídos"}
            </button>
          </div>
        </div>

        <div className="ag-board scroll">
          {view === "lista" && (
            visible.length === 0 ? (
              <div className="empty">
                <div className="big">◷</div>
                <h3>{items.length === 0 ? "Sua agenda está limpa" : "Nada por aqui"}</h3>
                <p>{items.length === 0 ? "Escreve no console o que você tem pra fazer. Eu separo entre trabalho, reuniões e pessoal e coloco no lugar certo." : "Troca a aba ou o filtro acima pra ver outros compromissos."}</p>
              </div>
            ) : (
              sections.map(sec => (
                <div key={sec.key} className={"grp" + (sec.urgent ? " urgent" : "")}>
                  <div className="grp-h">
                    {sec.color && <span className="grp-dot" style={{ background: sec.color }} />}
                    <span className="gt">{sec.label}</span>
                    <span className="gline" />
                    <span className="gc">{sec.items.length}</span>
                  </div>
                  {sec.items.map(renderJob)}
                </div>
              ))
            )
          )}

          {(view === "mes" || view === "semana") && (
            <>
              <div className="calnav">
                <div className="calnav-l">
                  <button className="calbtn" onClick={() => calStep(-1)} aria-label="Anterior">‹</button>
                  <button className="calbtn today" onClick={() => setCursor(todayISO())}>Hoje</button>
                  <button className="calbtn" onClick={() => calStep(1)} aria-label="Próximo">›</button>
                  <span className="cal-label disp">{calLabel}</span>
                </div>
                {undated.length > 0 && (
                  <button className="cal-undated" onClick={() => setView("lista")}>
                    {undated.length} sem data
                  </button>
                )}
              </div>

              {view === "mes" ? (
                <div className="cal">
                  <div className="cal-wd">{WD_SHORT.map(w => <span key={w}>{w}</span>)}</div>
                  <div className="cal-grid">
                    {monthGridISO(cursor).flat().map(iso => {
                      const evs = eventsByDay[iso] || [];
                      const inMonth = parseISO(iso).getMonth() === cur.getMonth();
                      const isToday = iso === todayISO();
                      const shown = evs.slice(0, 3);
                      return (
                        <div key={iso} className={"cal-cell" + (inMonth ? "" : " dim") + (isToday ? " today" : "") + (isConflictDay(iso) ? " confl" : "")}
                          onClick={() => evs.length && openDay(iso)}>
                          {isConflictDay(iso) && <span className="cell-warn" title="Conflito de trabalho">⚠</span>}
                          <div className="cal-dn">{parseISO(iso).getDate()}</div>
                          <div className="cal-evs">
                            {shown.map(c => renderChip(c, iso))}
                            {evs.length > 3 && (
                              <button className="cal-more" onClick={(e) => { e.stopPropagation(); openDay(iso); }}>
                                +{evs.length - 3} mais
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="week">
                  {weekDaysISO(cursor).map(iso => {
                    const evs = eventsByDay[iso] || [];
                    const d = parseISO(iso); const isToday = iso === todayISO();
                    return (
                      <div key={iso} className={"week-col" + (isToday ? " today" : "") + (isConflictDay(iso) ? " confl" : "")}>
                        <div className="week-h">
                          <span className="wd">{WD_SHORT[d.getDay()]}</span>
                          <span className="wn disp">{d.getDate()}</span>
                          {isConflictDay(iso) && <span className="week-warn" title="Conflito de trabalho">⚠</span>}
                        </div>
                        <div className="week-body">
                          {evs.length === 0 ? <div className="week-empty">·</div> : evs.map(c => {
                            const kc = CATEGORIA[catOf(c)].color;
                            return (
                              <button key={c.id} className={"wev" + (c.status === "incerto" ? " inc" : "") + (c.status === "concluido" ? " done" : "") + (isConflictOn(c, iso) ? " confl" : "")}
                                style={{ "--ec": kc }} onClick={() => openDay(iso)} title={c.titulo}>
                                {c.hora && <span className="wev-t mono">{c.hora}</span>}
                                <span className="wev-x">{c.titulo}</span>
                                {c.cliente && <span className="wev-c"><span className="dot" style={{ background: clientColor(c.cliente) }} />{c.cliente}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="pagebar">
          <button className={"page" + (view === "lista" ? " on" : "")} onClick={() => setView("lista")}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span>Lista</span>
          </button>
          <button className={"page" + (view === "mes" ? " on" : "")} onClick={() => setView("mes")}>
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M3 9h18M8 2v4M16 2v4M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span>Mês</span>
          </button>
          <button className={"page" + (view === "semana" ? " on" : "")} onClick={() => setView("semana")}>
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M9 4v17M15 4v17M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span>Semana</span>
          </button>
        </div>
      </div>

      {/* CHAT / CONSOLE */}
      <div className={"ag-chat" + (collapsed ? " collapsed" : "")} style={collapsed ? undefined : { width: chatW }}>
        {!collapsed && <div className="chat-grip" onMouseDown={startResize} onTouchStart={startResize} title="Arraste para redimensionar"><span /></div>}
        <div className="chat-h">
          <span className="pulse" />
          <span className="ct">Console</span>
          <span className="cs">{items.length} {items.length === 1 ? "job" : "jobs"}</span>
          <button className="chat-toggle" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? "Expandir console" : "Recolher console"}>
            <svg viewBox="0 0 24 24" fill="none">
              {collapsed
                ? <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
          </button>
        </div>

        <div className="chat-log scroll" ref={logRef}>
          {messages.map((m, i) => (
            <div key={i} className={"msg " + m.role + (m.err ? " err" : "") + (m.warn ? " warn" : "")}>{m.text}</div>
          ))}
          {busy && <div className="typing"><i /><i /><i /></div>}
        </div>

        {items.length === 0 && !busy && (
          <div className="hints">
            {hints.map((h, i) => (
              <button key={i} className="hint" onClick={() => send(h.join(""))}>{h[0]}<b>{h[1]}</b>{h[2]}</button>
            ))}
          </div>
        )}

        <div className="console">
          <div className="console-in">
            <span className="caret">›</span>
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              placeholder="Escreve um compromisso…"
              onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px"; }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className="send" disabled={busy || !input.trim()} onClick={() => send()} aria-label="Enviar">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#0B0C0F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {collapsed && (
        <button className="launcher" onClick={() => setCollapsed(false)} aria-label="Abrir console">
          <svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#0B0C0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Console
        </button>
      )}

      {selDay && (
        <div className="modal-bk" onClick={() => setSelDay(null)}>
          <div className={"modal" + (isConflictDay(selDay) ? " confl" : "")} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <div className="modal-ht">
                {isConflictDay(selDay) && <span className="modal-flag">⚠ Conflito de trabalho</span>}
                <div className="modal-d disp">{(() => { const d = parseISO(selDay); if (isNaN(d.getTime())) return selDay; return `${WD[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()].toLowerCase()}`; })()}</div>
                <div className="modal-s">{(eventsByDay[selDay] || []).length} compromisso(s) neste dia</div>
              </div>
              <button className="modal-x" onClick={() => setSelDay(null)} aria-label="Fechar">✕</button>
            </div>
            <div className="modal-body scroll">
              {isConflictDay(selDay) && (
                <div className="modal-warn">
                  <strong>Mais de um trabalho confirmado neste dia.</strong> Escolha o que fazer em cada cartão abaixo: <b>Mover</b> para outra data, <b>Marcar incerto</b> para estacionar, ou mantenha os dois se for proposital. Reuniões e compromissos pessoais não geram conflito.
                </div>
              )}
              {(eventsByDay[selDay] || []).length
                ? (eventsByDay[selDay]).map(c => renderJob(c, selDay))
                : <div className="modal-empty">Nenhum compromisso neste dia.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Proteção contra erros (Error Boundary) ---------- */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div style={{
          position: "fixed", inset: 0, background: "#16181A", color: "#D7D9DC",
          fontFamily: "system-ui, sans-serif", padding: "32px", overflow: "auto",
          display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start",
        }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#E68A3E" }}>Algo quebrou ao abrir a agenda</div>
          <div style={{ fontSize: 14, color: "#8D9197", maxWidth: 600, lineHeight: 1.5 }}>
            Copie a mensagem abaixo e mande pro suporte pra correção:
          </div>
          <pre style={{
            background: "#212327", border: "1px solid #383B40", borderRadius: 8,
            padding: "14px 16px", fontSize: 12.5, color: "#E06A6A", maxWidth: "100%",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>{String(this.state.err && this.state.err.stack || this.state.err)}</pre>
          <button onClick={() => location.reload()} style={{
            background: "#E68A3E", color: "#10120f", border: "none", borderRadius: 7,
            padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
