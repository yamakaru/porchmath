function SH(){var s=$('sh').value,c=$('dm').value;document.querySelectorAll('.calc [data-sh]').forEach(function(e){e.hidden=(' '+e.getAttribute('data-sh')+' ').indexOf(' '+s+' ')<0});document.querySelectorAll('.calc [data-dm]').forEach(function(e){e.hidden=e.getAttribute('data-dm')!=c})}
var ONI=0;function ONU(m){MT=m;if(!ONI){ONI=1;['sh','dm'].forEach(function(i){$(i).addEventListener('change',SH)})}SH()}
function CALC(){var s=$('sh').value,c=$('dm').value=='c',area,L=0,W=0,D=0,d,o={max:1e5};
 if(s=='ci'){D=N('D',o);area=Math.PI/4*D*D}else{L=N('L',o);W=N('W',o);area=s=='ov'?Math.PI/4*L*W:L*W}
 if(c)d=N('DC',o);else{var a=N('DS',o),b=N('DD',o);d=(a+b)/2}
 var Q=N('Q',{opt:1,max:1e6});if(ERR)return null;
 var vol=area*d,m3=MT?vol:vol*0.028316846592,ft3=MT?vol/0.028316846592:vol,gal=m3/0.003785411784,lit=m3*1000,U=MT?' m':' ft',rows,w='';
 rows=MT?[['Pool volume (liters)',F(Math.round(lit),0)],['Volume (m³)',S3(m3)],['Volume (US gallons)',F(Math.round(gal),0)]]:[['Pool volume (US gallons)',F(Math.round(gal),0)],['Volume (ft³)',S3(ft3)],['Volume (m³)',S3(m3)],['Volume (liters)',F(Math.round(lit),0)]];
 rows.push(['Average depth',S3(d)+U],['Water surface area',S3(area)+(MT?' m²':' ft²')]);
 if(Q){var mins=Math.round((MT?lit:gal)/Q),h=Math.floor(mins/60),mm=mins%60;rows.push(['Fill time (hours)',F(mins/60,1)],['Fill time (h:min)',h+':'+(mm<10?'0':'')+mm])}
 var mx=MT?1:3.28084;if(d>6*mx||L>100*mx||W>100*mx||D>100*mx)w='Some values look unusually large for a pool. Check the units.';
 return {rows:rows,warn:w}}
