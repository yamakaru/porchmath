var ONI=0;function ONU(m){MT=m;UV();if(!ONI){ONI=1;['sp','spm','bl','blm'].forEach(function(i){$(i).addEventListener('change',SC)})}SC()}
function SC(){$('spcw').hidden=$(MT?'spm':'sp').value!='c';$('blcw').hidden=$(MT?'blm':'bl').value!='c'}
function CALC(){var L=N('L',{max:1e5}),H=N('H',{max:1000}),O=INT('O',{z:1,max:1e4}),C=INT('C',{z:1,max:1e4}),EO=N('EO',{z:1,max:100}),EC=N('EC',{z:1,max:100}),PL=INT('PL',{max:10}),X=N('X',{z:1});
 var spv=$(MT?'spm':'sp').value,s=spv=='c'?N('spc',{max:1e4}):+spv,blv=$(MT?'blm':'bl').value,bl=blv=='c'?N('blc',{max:1000}):+blv;
 if(ERR)return null;if(X>100){FE($('X'),'B');ERR=1;return null}
 var Ls=MT?L*1000:L*12,run=Math.max(UP(Ls/s),1)+1,base=run+O*EO+C*EC,tot=UP(base*(1+X/100)),plf=L*PL,pb=UP(plf/bl),U=MT?' m':' ft';
 var cut=MT?F(H*1000-PL*38,0)+' mm':F(H*12-PL*1.5,0,2)+' in';
 var rows=[['Studs to buy (incl. waste)',F(tot,0)],['Studs before waste',F(base,0)+' = '+F(run,0)+' + '+F(O*EO,0)+' + '+F(C*EC,0)],['Studs along the wall (incl. both ends)',F(run,0)],['Plate length',F(plf,0,2)+U],['Plate boards ('+F(bl,0,2)+U+')',F(pb,0)],['Stud length to cut (height − plates)',cut]];
 return {rows:rows,warn:(MT?H*1000-PL*38:H*12-PL*1.5)<=0?'Check the wall height.':''}}
