// UTC calendar arithmetic, clamping month-end and leap-year dates.
export function proposedExpiry(paidUntil,months=12,now=new Date()){
 if(![3,6,12].includes(Number(months)))throw new Error('Thời hạn không hợp lệ.');
 const today=now.toISOString().slice(0,10),base=paidUntil&&paidUntil>today?paidUntil:today;
 const [year,month,day]=base.split('-').map(Number),target=new Date(Date.UTC(year,month-1+Number(months),1));
 const last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
 target.setUTCDate(Math.min(day,last));return target.toISOString().slice(0,10);
}
