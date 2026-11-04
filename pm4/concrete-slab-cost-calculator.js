var BAGS=[['P80',0.6,'80 lb bags (0.60 ft³ each)','36 kg (80 lb) bags (17 L each)'],['P60',0.45,'60 lb bags (0.45 ft³ each)','27 kg (60 lb) bags (12.7 L each)'],['P40',0.3,'40 lb bags (0.30 ft³ each)','18 kg (40 lb) bags (8.5 L each)']];
function M2(x){return F(x,2)}
function CALC(){var L=N('L'),W=N('W'),T=N('T'),X=N('X',{z:1}),pr={};BAGS.forEach(function(b){pr[b[0]]=N(b[0],{opt:1})});var PR=N('PR',{opt:1}),DF=N('DF',{opt:1,z:1}),GD=N('GD',{opt:1,z:1}),GP=N('GP',{opt:1}),MP=N('MP',{opt:1});
 if(ERR)return null;if(X>100){FE($('X'),'B');ERR=1;return null}
 var area=L*W,vol=area*(MT?T/100:T/12),volw=vol*(1+X/100),cf=MT?volw*35.3147:volw,ord=MT?volw:volw/27,rows=[],ep='Enter a price',extra=0,ex1=1;
 rows.push(MT?['Concrete incl. waste (m³)',F(volw,2)]:['Concrete incl. waste (yd³)',F(ord,2)]);if(!MT)rows.push(['Concrete incl. waste (ft³)',F(cf,2)]);
 if(GD){var gv=area*(MT?GD/100:GD/12/27);rows.push([MT?'Gravel base (m³)':'Gravel base (yd³)',F(gv,2)]);if(GP)extra+=gv*GP;else ex1=0}
 if(MP)extra+=area*MP;
 var opts=[];BAGS.forEach(function(b){var n=UP(cf/b[1]);rows.push([MT?b[3]:b[2],F(n,0)]);if(pr[b[0]]){var c=n*pr[b[0]]+extra;opts.push([MT?b[3]:b[2],c]);rows.push(['Cost with these bags',M2(c)])}else rows.push(['Cost with these bags',ep])});
 if(PR){var c=ord*PR+(DF||0)+extra;opts.push(['Ready-mix truck',c]);rows.push(['Cost with ready-mix',M2(c)])}else rows.push(['Cost with ready-mix',ep]);
 if(opts.length&&ex1){opts.sort(function(a,b){return a[1]-b[1]});rows.splice(0,0,['Cheapest option',opts[0][0]+' — '+M2(opts[0][1])]);rows.push([MT?'Cost per m²':'Cost per ft²',M2(opts[0][1]/area)])}
 else rows.splice(0,0,['Cheapest option',ep]);
 return {rows:rows}}
