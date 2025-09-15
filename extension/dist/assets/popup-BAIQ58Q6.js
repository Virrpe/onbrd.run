var ot=Object.defineProperty;var nt=(t,e,o)=>e in t?ot(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o;var D=(t,e,o)=>nt(t,typeof e!="symbol"?e+"":e,o);import{p as R}from"./logger-AWT1sV85.js";function O(){}function Z(t){return t()}function V(){return Object.create(null)}function M(t){t.forEach(Z)}function tt(t){return typeof t=="function"}function rt(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function it(t){return Object.keys(t).length===0}function c(t,e){t.appendChild(e)}function F(t,e,o){t.insertBefore(e,o||null)}function P(t){t.parentNode&&t.parentNode.removeChild(t)}function v(t){return document.createElement(t)}function k(t){return document.createTextNode(t)}function T(){return k(" ")}function G(t,e,o,n){return t.addEventListener(e,o,n),()=>t.removeEventListener(e,o,n)}function x(t,e,o){o==null?t.removeAttribute(e):t.getAttribute(e)!==o&&t.setAttribute(e,o)}function st(t){return Array.from(t.childNodes)}function j(t,e){e=""+e,t.data!==e&&(t.data=e)}let U;function L(t){U=t}function dt(){if(!U)throw new Error("Function called outside component initialization");return U}function at(t){dt().$$.on_mount.push(t)}const E=[],J=[];let S=[];const K=[],ct=Promise.resolve();let B=!1;function lt(){B||(B=!0,ct.then(et))}function Y(t){S.push(t)}const z=new Set;let C=0;function et(){if(C!==0)return;const t=U;do{try{for(;C<E.length;){const e=E[C];C++,L(e),ut(e.$$)}}catch(e){throw E.length=0,C=0,e}for(L(null),E.length=0,C=0;J.length;)J.pop()();for(let e=0;e<S.length;e+=1){const o=S[e];z.has(o)||(z.add(o),o())}S.length=0}while(E.length);for(;K.length;)K.pop()();B=!1,z.clear(),L(t)}function ut(t){if(t.fragment!==null){t.update(),M(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(Y)}}function ft(t){const e=[],o=[];S.forEach(n=>t.indexOf(n)===-1?e.push(n):o.push(n)),o.forEach(n=>n()),S=e}const pt=new Set;function mt(t,e){t&&t.i&&(pt.delete(t),t.i(e))}function ht(t,e,o){const{fragment:n,after_update:r}=t.$$;n&&n.m(e,o),Y(()=>{const d=t.$$.on_mount.map(Z).filter(tt);t.$$.on_destroy?t.$$.on_destroy.push(...d):M(d),t.$$.on_mount=[]}),r.forEach(Y)}function gt(t,e){const o=t.$$;o.fragment!==null&&(ft(o.after_update),M(o.on_destroy),o.fragment&&o.fragment.d(e),o.on_destroy=o.fragment=null,o.ctx=[])}function bt(t,e){t.$$.dirty[0]===-1&&(E.push(t),lt(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function _t(t,e,o,n,r,d,s=null,u=[-1]){const g=U;L(t);const i=t.$$={fragment:null,ctx:[],props:d,update:O,not_equal:r,bound:V(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(g?g.$$.context:[])),callbacks:V(),dirty:u,skip_bound:!1,root:e.target||g.$$.root};s&&s(i.root);let b=!1;if(i.ctx=o?o(t,e.props||{},(_,$,...a)=>{const p=a.length?a[0]:$;return i.ctx&&r(i.ctx[_],i.ctx[_]=p)&&(!i.skip_bound&&i.bound[_]&&i.bound[_](p),b&&bt(t,_)),$}):[],i.update(),b=!0,M(i.before_update),i.fragment=n?n(i.ctx):!1,e.target){if(e.hydrate){const _=st(e.target);i.fragment&&i.fragment.l(_),_.forEach(P)}else i.fragment&&i.fragment.c();e.intro&&mt(t.$$.fragment),ht(t,e.target,e.anchor),et()}L(g)}class yt{constructor(){D(this,"$$");D(this,"$$set")}$destroy(){gt(this,1),this.$destroy=O}$on(e,o){if(!tt(o))return O;const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(o),()=>{const r=n.indexOf(o);r!==-1&&n.splice(r,1)}}$set(e){this.$$set&&!it(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const xt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(xt);function $t(t){const{url:e,timestamp:o,scores:n,heuristics:r,recommendations:d}=t,s="1.0.1",u=new Date(o).toISOString().slice(0,16).replace("T"," "),g=new URL(e).hostname;return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Audit Report - ${e}</title>
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
    <p><strong>URL:</strong> ${e}</p>
    <p><strong>Audit Date:</strong> ${new Date(o).toLocaleString()}</p>
    <p><strong>Overall Score:</strong> <span class="score ${n.overall>=80?"":n.overall>=60?"score-medium":"score-bad"}">${n.overall}/100</span></p>
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
        <td>${n.h_cta_above_fold}/100</td>
        <td>${r.h_cta_above_fold.detected?"Primary CTA detected above fold":"No CTA found above 600px"}</td>
      </tr>
      <tr>
        <td>
          Steps Count
          <div class="heuristic-id">H-STEPS-COUNT</div>
        </td>
        <td>${n.h_steps_count}/100</td>
        <td>${r.h_steps_count.total} total steps (${r.h_steps_count.forms} forms, ${r.h_steps_count.screens} screens)</td>
      </tr>
      <tr>
        <td>
          Copy Clarity
          <div class="heuristic-id">H-COPY-CLARITY</div>
        </td>
        <td>${n.h_copy_clarity}/100</td>
        <td>Avg sentence: ${r.h_copy_clarity.avg_sentence_length} words, ${r.h_copy_clarity.passive_voice_ratio}% passive voice, ${r.h_copy_clarity.jargon_density}% jargon</td>
      </tr>
      <tr>
        <td>
          Trust Markers
          <div class="heuristic-id">H-TRUST-MARKERS</div>
        </td>
        <td>${n.h_trust_markers}/100</td>
        <td>${r.h_trust_markers.total} trust signals (${r.h_trust_markers.testimonials} testimonials, ${r.h_trust_markers.security_badges} security badges, ${r.h_trust_markers.customer_logos} logos)</td>
      </tr>
      <tr>
        <td>
          Signup Speed
          <div class="heuristic-id">H-PERCEIVED-SIGNUP-SPEED</div>
        </td>
        <td>${n.h_perceived_signup_speed}/100</td>
        <td>~${r.h_perceived_signup_speed.estimated_seconds}s completion (${r.h_perceived_signup_speed.form_fields} fields, ${r.h_perceived_signup_speed.required_fields} required)</td>
      </tr>
    </tbody>
  </table>

  <h2>Recommendations</h2>
  ${d.map(i=>`
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

**URL:** ${e}
**Overall Score:** ${n.overall}/100
**Audit Date:** ${new Date(o).toLocaleString()}

### Issues Found:
${d.map(i=>`- **${i.heuristic}** (${i.priority} priority): ${i.description}`).join(`
`)}

### Recommended Fixes:
${d.map(i=>`- **${i.heuristic}**: ${i.fix}`).join(`
`)}

### Next Steps:
1. Address high priority issues first
2. Test changes with users
3. Re-run audit to verify improvements
    </div>
  </div>

  <footer style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: small;">
    Generated by Onbrd — v${s} — ${u} — ${g} — onbrd.run
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
</html>`}function Q(t){let e,o,n=t[3].scores.overall+"",r,d;return{c(){e=v("div"),o=k("Score: "),r=k(n),d=k("/100"),x(e,"class","mb-3 text-sm text-gray-600")},m(s,u){F(s,e,u),c(e,o),c(e,r),c(e,d)},p(s,u){u&8&&n!==(n=s[3].scores.overall+"")&&j(r,n)},d(s){s&&P(e)}}}function W(t){let e,o;return{c(){e=v("div"),o=k(t[2]),x(e,"class","mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700")},m(n,r){F(n,e,r),c(e,o)},p(n,r){r&4&&j(o,n[2])},d(n){n&&P(e)}}}function X(t){let e;return{c(){e=v("div"),e.textContent="Audit complete!",x(e,"class","mt-3 text-sm text-green-600")},m(o,n){F(o,e,n)},d(o){o&&P(e)}}}function vt(t){let e,o,n,r,d,s,u=t[1]?"Running audit...":"Run Audit",g,i,b,_,$,a,p,l,A,H,N,q,m=t[3]&&Q(t),h=t[2]&&W(t),y=t[4]&&X();return{c(){e=v("div"),o=v("h1"),o.textContent="Onbrd",n=T(),m&&m.c(),r=T(),d=v("div"),s=v("button"),g=k(u),i=T(),b=v("button"),_=k("Export HTML"),a=T(),h&&h.c(),p=T(),l=v("div"),A=k(t[0]),H=T(),y&&y.c(),x(o,"class","text-base font-semibold mb-2"),x(s,"id","run"),s.disabled=t[1],x(s,"class","btn w-full"),x(b,"id","export"),b.disabled=$=!t[3],x(b,"class","btn-secondary w-full"),x(d,"class","space-y-2"),x(l,"class","mt-3 text-xs text-gray-500"),x(e,"class","card")},m(f,w){F(f,e,w),c(e,o),c(e,n),m&&m.m(e,null),c(e,r),c(e,d),c(d,s),c(s,g),c(d,i),c(d,b),c(b,_),c(e,a),h&&h.m(e,null),c(e,p),c(e,l),c(l,A),c(e,H),y&&y.m(e,null),N||(q=[G(s,"click",t[5]),G(b,"click",t[6])],N=!0)},p(f,[w]){f[3]?m?m.p(f,w):(m=Q(f),m.c(),m.m(e,r)):m&&(m.d(1),m=null),w&2&&u!==(u=f[1]?"Running audit...":"Run Audit")&&j(g,u),w&2&&(s.disabled=f[1]),w&8&&$!==($=!f[3])&&(b.disabled=$),f[2]?h?h.p(f,w):(h=W(f),h.c(),h.m(e,p)):h&&(h.d(1),h=null),w&1&&j(A,f[0]),f[4]?y||(y=X(),y.c(),y.m(e,null)):y&&(y.d(1),y=null)},i:O,o:O,d(f){f&&P(e),m&&m.d(),h&&h.d(),y&&y.d(),N=!1,M(q)}}}const wt=5e3;function I(t){return t<10?`0${t}`:`${t}`}function kt(t=new Date){const e=t.getFullYear(),o=I(t.getMonth()+1),n=I(t.getDate()),r=I(t.getHours()),d=I(t.getMinutes());return`${e}${o}${n}${r}${d}`}function At(t,e){const o=new Blob([e],{type:"text/html;charset=utf-8"}),n=URL.createObjectURL(o),r=document.createElement("a");r.href=n,r.download=t,document.body.appendChild(r),r.click(),setTimeout(()=>{URL.revokeObjectURL(n),r.remove()},0)}function Rt(t,e,o){let n="Ready to audit",r=!1,d=null,s=null,u=!1,g="";at(()=>{R.ok("Onbrd popup initialized");try{g=chrome.runtime.getManifest().version}catch(a){R.error("Failed to get version from manifest:",a),g="1.0.0"}});async function i(){o(2,d=null),o(1,r=!0),o(0,n="Running audit..."),R.start("Starting audit process");try{const a=new Promise((A,H)=>{setTimeout(()=>H(new Error("Audit timeout - please try refreshing the page and running again")),wt)}),p=chrome.runtime.sendMessage({type:"RUN_AUDIT"}),l=await Promise.race([p,a]);if(l!=null&&l.success&&(l!=null&&l.data))R.ok("Audit completed successfully"),b(l.data);else{const A=(l==null?void 0:l.error)||"Audit failed";throw R.error(`Audit failed: ${A}`),new Error(A)}}catch(a){const p=a.message||"Unknown error occurred";R.error(`Audit error: ${p}`),p.includes("timeout")?o(2,d="Audit timed out. Please refresh the page and try again."):p.includes("Extension context invalidated")?o(2,d="Extension needs to be reloaded. Please refresh the page and try again."):o(2,d=`Audit failed: ${p}. Please refresh the page and try again.`),o(0,n="Ready to audit"),o(1,r=!1)}}function b(a){R.ok(`Audit result received: ${JSON.stringify(a)}`),o(3,s=a),o(0,n=`Audit complete! Score: ${a.scores.overall}/100`),o(1,r=!1),o(4,u=!0),typeof window<"u"&&(window.lastAudit=a)}function _(){if(!s){o(0,n="No audit data to export");return}try{const a=$(s),l=`onboarding-audit-${s.url&&new URL(s.url).hostname?new URL(s.url).hostname:"page"}-${kt()}.html`;At(l,a),o(0,n="HTML report exported successfully")}catch(a){o(0,n=`Error exporting HTML: ${a.message}`)}}function $(a){return $t(a)}return[n,r,d,s,u,i,_]}class Tt extends yt{constructor(e){super(),_t(this,e,Rt,vt,rt,{})}}const St=new Tt({target:document.body});export{St as default};
