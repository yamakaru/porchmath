function PITCH(r){return {p:12*r,a:Math.atan(r)*180/Math.PI,s:100*r,m:Math.sqrt(1+r*r)}}
function MD(){var m=$('md').value;document.querySelectorAll('.calc [data-m]').forEach(function(e){var ok=(' '+e.getAttribute('data-m')+' ').indexOf(' '+m+' ')>=0,u=e.getAttribute('data-uu');if(u!=null&&+u!=MT)ok=false;e.hidden=!ok})}
var ONI=0;function ONU(m){MT=m;if(!ONI){ONI=1;$('md').addEventListener('change',function(){MD();run(1)})}MD()}
function PR(o){var a=[['Pitch',F(o.p,0,2)+'/12'],['Angle',F(o.a,2)+'°'],['Slope',F(o.s,2,2)+' %'],['Pitch multiplier',F(o.m,3)]];return MT?[a[1],a[2],a[0],a[3]]:a}
function CALC(){var m=$('md').value,r,rows,U=MT?' m':' ft';
 if(m=='rr'){var R=N('R',{z:1}),Rn=N('Rn');if(ERR)return null;r=R/Rn;return {rows:PR(PITCH(r))}}
 if(m=='an'){var A=N('A',{z:1});if(ERR)return null;if(A>=90){FE($('A'),'');ERR=1;return {msg:'The angle must be below 90°'}}r=Math.tan(A*Math.PI/180);return {rows:PR(PITCH(r))}}
 var S=N('S'),O=N('O',{z:1}),P=MT?N('PA',{z:1}):N('P',{z:1});if(ERR)return null;if(MT&&P>=90){ERR=1;return {msg:'The angle must be below 90°'}}
 r=MT?Math.tan(P*Math.PI/180):P/12;var o=PITCH(r),run=S/2,rise=run*r,ov=MT?O/100:O/12,raf=run*o.m;
 rows=[['Rafter length incl. overhang',F(raf+ov*o.m,2)+U],['Rafter length without overhang',F(raf,2)+U],['Run (half the span)',F(run,2)+U],['Rise',F(rise,2)+U]].concat(PR(o));return {rows:rows}}
