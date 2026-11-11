/* ENERGY STAR room air conditioner sizing table: [upper bound ft² (inclusive), BTU/h] */
var BANDS=[[150,5000],[250,6000],[300,7000],[350,8000],[400,9000],[450,10000],[550,12000],[700,14000],[1000,18000],[1200,21000],[1400,23000],[1500,24000],[2000,30000],[2500,34000]];
var ONI=0;function ONU(m){MT=m}
function CALC(){var A=N('A',{max:1e6}),P=INT('P',{z:1,max:1000}),sun=$('sun').value,k=$('kit').checked;
 if(ERR)return null;var ft=MT?A*10.763910417:A,w='',j,lo=100;
 if(ft>2500)return {msg:LN(MF('Over 2,500 ft² (232 m²) is beyond room air conditioner sizing. Have an HVAC technician do a Manual J load calculation.'))};
 if(ft<100)w=LN(MF('Under 100 ft² (9.3 m²): the ENERGY STAR table starts at 100 ft², so the smallest size, 5,000 BTU/h, is used.'));
 for(j=0;j<BANDS.length;j++){if(ft<=BANDS[j][0]+1e-9)break;lo=BANDS[j][0]}
 var base=BANDS[j][1],b=base*(sun=='sh'?0.9:sun=='su'?1.1:1),ex=P>2?(P-2)*600:0;b=Math.round(b+ex+(k?4000:0));
 var kw=b*0.0002930711,tons=b/12000,band=MT?F(lo/10.763910417,1)+'–'+F(BANDS[j][0]/10.763910417,1)+' m²':F(lo,0)+'–'+F(BANDS[j][0],0)+' ft²';
 var adj=[['Base capacity for the room size',F(base,0)+' BTU/h ('+band+')'],['Sun or shade adjustment',sun=='sh'?'−10 %':sun=='su'?'+10 %':'0 %'],['Extra people (600 BTU/h each above 2)','+'+F(ex,0)+' BTU/h'],['Kitchen','+'+F(k?4000:0,0)+' BTU/h']];
 var rows=MT?[['Cooling capacity (kW)',F(kw,2)+' kW'],['Cooling capacity (BTU/h)',F(b,0)+' BTU/h'],['Tons of cooling',F(tons,2)]]:[['Cooling capacity (BTU/h)',F(b,0)+' BTU/h'],['Tons of cooling',F(tons,2)],['Cooling capacity (kW)',F(kw,2)+' kW']];
 return {rows:rows.concat(adj),warn:w}}
