var ee=Object.defineProperty;var te=(e,t,n)=>t in e?ee(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var F=(e,t,n)=>te(e,typeof t!="symbol"?t+"":t,n);import{p as C}from"./logger-AWT1sV85.js";function U(){}function W(e){return e()}function D(){return Object.create(null)}function P(e){e.forEach(W)}function X(e){return typeof e=="function"}function ne(e,t){return e!=e?t==t:e!==t||e&&typeof e=="object"||typeof e=="function"}function oe(e){return Object.keys(e).length===0}function h(e,t){e.appendChild(t)}function k(e,t,n){e.insertBefore(t,n||null)}function w(e){e.parentNode&&e.parentNode.removeChild(e)}function re(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function $(e){return document.createElement(e)}function y(e){return document.createTextNode(e)}function E(){return y(" ")}function z(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function x(e,t,n){n==null?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function ie(e){return Array.from(e.childNodes)}function A(e,t){t=""+t,e.data!==t&&(e.data=t)}let M;function L(e){M=e}function se(){if(!M)throw new Error("Function called outside component initialization");return M}function le(e){se().$$.on_mount.push(e)}const S=[],B=[];let O=[];const Y=[],de=Promise.resolve();let N=!1;function ce(){N||(N=!0,de.then(Z))}function j(e){O.push(e)}const I=new Set;let R=0;function Z(){if(R!==0)return;const e=M;do{try{for(;R<S.length;){const t=S[R];R++,L(t),ae(t.$$)}}catch(t){throw S.length=0,R=0,t}for(L(null),S.length=0,R=0;B.length;)B.pop()();for(let t=0;t<O.length;t+=1){const n=O[t];I.has(n)||(I.add(n),n())}O.length=0}while(S.length);for(;Y.length;)Y.pop()();N=!1,I.clear(),L(e)}function ae(e){if(e.fragment!==null){e.update(),P(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(j)}}function ue(e){const t=[],n=[];O.forEach(o=>e.indexOf(o)===-1?t.push(o):n.push(o)),n.forEach(o=>o()),O=t}const fe=new Set;function pe(e,t){e&&e.i&&(fe.delete(e),e.i(t))}function q(e){return(e==null?void 0:e.length)!==void 0?e:Array.from(e)}function me(e,t,n){const{fragment:o,after_update:r}=e.$$;o&&o.m(t,n),j(()=>{const a=e.$$.on_mount.map(W).filter(X);e.$$.on_destroy?e.$$.on_destroy.push(...a):P(a),e.$$.on_mount=[]}),r.forEach(j)}function he(e,t){const n=e.$$;n.fragment!==null&&(ue(n.after_update),P(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function ge(e,t){e.$$.dirty[0]===-1&&(S.push(e),ce(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function be(e,t,n,o,r,a,f=null,u=[-1]){const c=M;L(e);const i=e.$$={fragment:null,ctx:[],props:a,update:U,not_equal:r,bound:D(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(c?c.$$.context:[])),callbacks:D(),dirty:u,skip_bound:!1,root:t.target||c.$$.root};f&&f(i.root);let d=!1;if(i.ctx=n?n(e,t.props||{},(l,p,...s)=>{const g=s.length?s[0]:p;return i.ctx&&r(i.ctx[l],i.ctx[l]=g)&&(!i.skip_bound&&i.bound[l]&&i.bound[l](g),d&&ge(e,l)),p}):[],i.update(),d=!0,P(i.before_update),i.fragment=o?o(i.ctx):!1,t.target){if(t.hydrate){const l=ie(t.target);i.fragment&&i.fragment.l(l),l.forEach(w)}else i.fragment&&i.fragment.c();t.intro&&pe(e.$$.fragment),me(e,t.target,t.anchor),Z()}L(c)}class _e{constructor(){F(this,"$$");F(this,"$$set")}$destroy(){he(this,1),this.$destroy=U}$on(t,n){if(!X(n))return U;const o=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return o.push(n),()=>{const r=o.indexOf(n);r!==-1&&o.splice(r,1)}}$set(t){this.$$set&&!oe(t)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const ye="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(ye);function xe(e){const{url:t,timestamp:n,scores:o,heuristics:r,recommendations:a}=e,f="1.0.1",u=new Date(n).toISOString().slice(0,16).replace("T"," "),c=new URL(t).hostname;return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Audit Report - ${t}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .header {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .score-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .score {
      font-size: 2em;
      font-weight: bold;
      color: #28a745;
    }
    .score-bad {
      color: #dc3545;
    }
    .score-medium {
      color: #ffc107;
    }
    .recommendation {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .priority-high {
      border-left: 4px solid #dc3545;
    }
    .priority-medium {
      border-left: 4px solid #ffc107;
    }
    .priority-low {
      border-left: 4px solid #28a745;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .copy-to-ticket {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .copy-button {
      background: #2196f3;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .copy-button:hover {
      background: #1976d2;
    }
    .ticket-content {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
      font-family: monospace;
      font-size: 14px;
      white-space: pre-wrap;
    }
    .heuristic-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Onboarding Audit Report</h1>
    <p><strong>URL:</strong> ${t}</p>
    <p><strong>Audit Date:</strong> ${new Date(n).toLocaleString()}</p>
    <p><strong>Overall Score:</strong> <span class="score ${o.overall>=80?"":o.overall>=60?"score-medium":"score-bad"}">${o.overall}/100</span></p>
  </div>

  <h2>Heuristic Analysis</h2>
  <table>
    <thead>
      <tr>
        <th>Heuristic</th>
        <th>Score</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          CTA Above Fold
          <div class="heuristic-id">H-CTA-ABOVE-FOLD</div>
        </td>
        <td>${o.h_cta_above_fold}/100</td>
        <td>${r.h_cta_above_fold.detected?"Primary CTA detected above fold":"No CTA found above 600px"}</td>
      </tr>
      <tr>
        <td>
          Steps Count
          <div class="heuristic-id">H-STEPS-COUNT</div>
        </td>
        <td>${o.h_steps_count}/100</td>
        <td>${r.h_steps_count.total} total steps (${r.h_steps_count.forms} forms, ${r.h_steps_count.screens} screens)</td>
      </tr>
      <tr>
        <td>
          Copy Clarity
          <div class="heuristic-id">H-COPY-CLARITY</div>
        </td>
        <td>${o.h_copy_clarity}/100</td>
        <td>Avg sentence: ${r.h_copy_clarity.avg_sentence_length} words, ${r.h_copy_clarity.passive_voice_ratio}% passive voice, ${r.h_copy_clarity.jargon_density}% jargon</td>
      </tr>
      <tr>
        <td>
          Trust Markers
          <div class="heuristic-id">H-TRUST-MARKERS</div>
        </td>
        <td>${o.h_trust_markers}/100</td>
        <td>${r.h_trust_markers.total} trust signals (${r.h_trust_markers.testimonials} testimonials, ${r.h_trust_markers.security_badges} security badges, ${r.h_trust_markers.customer_logos} logos)</td>
      </tr>
      <tr>
        <td>
          Signup Speed
          <div class="heuristic-id">H-PERCEIVED-SIGNUP-SPEED</div>
        </td>
        <td>${o.h_perceived_signup_speed}/100</td>
        <td>~${r.h_perceived_signup_speed.estimated_seconds}s completion (${r.h_perceived_signup_speed.form_fields} fields, ${r.h_perceived_signup_speed.required_fields} required)</td>
      </tr>
    </tbody>
  </table>

  <h2>Recommendations</h2>
  ${a.map(i=>`
    <div class="recommendation priority-${i.priority}">
      <h4>${i.heuristic} (${i.priority} priority)</h4>
      <p><strong>Issue:</strong> ${i.description}</p>
      <p><strong>Fix:</strong> ${i.fix}</p>
    </div>
  `).join("")}

  <div class="copy-to-ticket">
    <h3>Copy to Ticket</h3>
    <p>Click the button below to copy a formatted summary for your project management tool:</p>
    <button class="copy-button" onclick="copyTicketContent()">Copy Ticket Content</button>
    <div class="ticket-content" id="ticketContent">
## Onboarding Audit Results

**URL:** ${t}
**Overall Score:** ${o.overall}/100
**Audit Date:** ${new Date(n).toLocaleString()}

### Issues Found:
${a.map(i=>`- **${i.heuristic}** (${i.priority} priority): ${i.description}`).join(`
`)}

### Recommended Fixes:
${a.map(i=>`- **${i.heuristic}**: ${i.fix}`).join(`
`)}

### Next Steps:
1. Address high priority issues first
2. Test changes with users
3. Re-run audit to verify improvements
    </div>
  </div>

  <footer style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: small;">
    Generated by Onbrd — v${f} — ${u} — ${c} — onbrd.run
  </footer>

  <script>
    function copyTicketContent() {
      const content = document.getElementById('ticketContent').textContent;
      navigator.clipboard.writeText(content).then(() => {
        const button = document.querySelector('.copy-button');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
      });
    }
  <\/script>
</body>
</html>`}function V(e,t,n){const o=e.slice();return o[10]=t[n],o}function G(e){let t,n,o,r,a,f,u,c=e[1].percentile&&J(e),i=q(e[2]),d=[];for(let l=0;l<i.length;l+=1)d[l]=K(V(e,i,l));return{c(){t=$("div"),n=y(e[0]),o=E(),c&&c.c(),r=E(),a=$("div"),a.textContent="Fix these to improve:",f=E(),u=$("ul");for(let l=0;l<d.length;l+=1)d[l].c();x(t,"class","text-4xl font-bold mb-1"),x(a,"class","mb-2 text-sm font-medium"),x(u,"class","space-y-1")},m(l,p){k(l,t,p),h(t,n),k(l,o,p),c&&c.m(l,p),k(l,r,p),k(l,a,p),k(l,f,p),k(l,u,p);for(let s=0;s<d.length;s+=1)d[s]&&d[s].m(u,null)},p(l,p){if(p&1&&A(n,l[0]),l[1].percentile?c?c.p(l,p):(c=J(l),c.c(),c.m(r.parentNode,r)):c&&(c.d(1),c=null),p&4){i=q(l[2]);let s;for(s=0;s<i.length;s+=1){const g=V(l,i,s);d[s]?d[s].p(g,p):(d[s]=K(g),d[s].c(),d[s].m(u,null))}for(;s<d.length;s+=1)d[s].d(1);d.length=i.length}},d(l){l&&(w(t),w(o),w(r),w(a),w(f),w(u)),c&&c.d(l),re(d,l)}}}function J(e){let t,n,o=e[1].percentile+"",r,a,f=e[1].count+"",u,c,i=e[1].median+"",d,l;return{c(){t=$("div"),n=y("Top "),r=y(o),a=y("% of "),u=y(f),c=y(" peers (median "),d=y(i),l=y(")"),x(t,"class","text-sm opacity-80 mb-3")},m(p,s){k(p,t,s),h(t,n),h(t,r),h(t,a),h(t,u),h(t,c),h(t,d),h(t,l)},p(p,s){s&2&&o!==(o=p[1].percentile+"")&&A(r,o),s&2&&f!==(f=p[1].count+"")&&A(u,f),s&2&&i!==(i=p[1].median+"")&&A(d,i)},d(p){p&&w(t)}}}function K(e){let t,n,o,r=e[10].id+"",a,f,u=e[10].fix+"",c;return{c(){t=$("li"),n=y("❌ "),o=$("span"),a=y(r),f=y(" — "),c=y(u),x(o,"class","font-medium"),x(t,"class","text-sm")},m(i,d){k(i,t,d),h(t,n),h(t,o),h(o,a),h(t,f),h(t,c)},p(i,d){d&4&&r!==(r=i[10].id+"")&&A(a,r),d&4&&u!==(u=i[10].fix+"")&&A(c,u)},d(i){i&&w(t)}}}function Q(e){let t,n;return{c(){t=$("div"),n=y(e[4]),x(t,"class","mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700")},m(o,r){k(o,t,r),h(t,n)},p(o,r){r&16&&A(n,o[4])},d(o){o&&w(t)}}}function ve(e){let t,n,o,r,a,f,u=e[3]?"Running audit...":"Run Audit",c,i,d,l,p,s,g,_,m=e[0]!==null&&G(e),b=e[4]&&Q(e);return{c(){t=$("div"),n=$("h1"),n.textContent="Onbrd",o=E(),m&&m.c(),r=E(),a=$("div"),f=$("button"),c=y(u),i=E(),d=$("button"),l=y("Export HTML"),s=E(),b&&b.c(),x(n,"class","text-base font-semibold mb-2"),x(f,"id","run"),f.disabled=e[3],x(f,"class","btn w-full svelte-1tp216u"),x(d,"id","export"),d.disabled=p=e[0]===null,x(d,"class","btn-secondary w-full svelte-1tp216u"),x(a,"class","space-y-2 mt-4"),x(t,"class","p-4")},m(v,T){k(v,t,T),h(t,n),h(t,o),m&&m.m(t,null),h(t,r),h(t,a),h(a,f),h(f,c),h(a,i),h(a,d),h(d,l),h(t,s),b&&b.m(t,null),g||(_=[z(f,"click",e[5]),z(d,"click",e[6])],g=!0)},p(v,[T]){v[0]!==null?m?m.p(v,T):(m=G(v),m.c(),m.m(t,r)):m&&(m.d(1),m=null),T&8&&u!==(u=v[3]?"Running audit...":"Run Audit")&&A(c,u),T&8&&(f.disabled=v[3]),T&1&&p!==(p=v[0]===null)&&(d.disabled=p),v[4]?b?b.p(v,T):(b=Q(v),b.c(),b.m(t,null)):b&&(b.d(1),b=null)},i:U,o:U,d(v){v&&w(t),m&&m.d(),b&&b.d(),g=!1,P(_)}}}const $e=5e3;function H(e){return e<10?`0${e}`:`${e}`}function we(e=new Date){const t=e.getFullYear(),n=H(e.getMonth()+1),o=H(e.getDate()),r=H(e.getHours()),a=H(e.getMinutes());return`${t}${n}${o}${r}${a}`}function ke(e,t){const n=new Blob([t],{type:"text/html;charset=utf-8"}),o=URL.createObjectURL(n),r=document.createElement("a");r.href=o,r.download=e,document.body.appendChild(r),r.click(),setTimeout(()=>{URL.revokeObjectURL(o),r.remove()},0)}function Ae(e,t,n){let o=null,r={},a=[],f=!1,u=null,c="";le(()=>{C.ok("Onbrd popup initialized");try{c=chrome.runtime.getManifest().version}catch(s){C.error("Failed to get version from manifest:",s),c="1.0.0"}});async function i(){n(4,u=null),n(3,f=!0),n(0,o=null),n(1,r={}),n(2,a=[]),C.start("Starting audit process");try{const s=new Promise((m,b)=>{setTimeout(()=>b(new Error("Audit timeout - please try refreshing the page and running again")),$e)}),g=chrome.runtime.sendMessage({type:"RUN_AUDIT"}),_=await Promise.race([g,s]);if(_!=null&&_.success&&(_!=null&&_.data))C.ok("Audit completed successfully"),d(_.data);else{const m=(_==null?void 0:_.error)||"Audit failed";throw C.error(`Audit failed: ${m}`),new Error(m)}}catch(s){const g=s.message||"Unknown error occurred";C.error(`Audit error: ${g}`),g.includes("timeout")?n(4,u="Audit timed out. Please refresh the page and try again."):g.includes("Extension context invalidated")?n(4,u="Extension needs to be reloaded. Please refresh the page and try again."):n(4,u=`Audit failed: ${g}. Please refresh the page and try again.`),n(3,f=!1)}}function d(s){C.ok(`Audit result received: ${JSON.stringify(s)}`),n(0,o=s.score),chrome.storage.session.get("onbrd_rules").then(({onbrd_rules:g})=>{if(g){const _=g.rules.filter(m=>!s.metrics[m.id]).sort((m,b)=>b.weight-m.weight).slice(0,3).map(m=>({id:m.id,fix:m.fix,weight:m.weight}));n(2,a=_)}}),n(3,f=!1),typeof window<"u"&&(window.lastAudit=s)}function l(){if(o===null){n(4,u="No audit data to export");return}try{const s=p({score:o,metrics:{}}),_=`onboarding-audit-page-${we()}.html`;ke(_,s),n(4,u=null)}catch(s){n(4,u=`Error exporting HTML: ${s.message}`)}}function p(s){return xe(s)}return[o,r,a,f,u,i,l]}class Te extends _e{constructor(t){super(),be(this,t,Ae,ve,ne,{})}}const Re=new Te({target:document.body});export{Re as default};
