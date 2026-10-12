export const durations = Object.freeze({3:'3 tháng',6:'6 tháng',12:'12 tháng'});
export function requestSelection(search) {
  const params=new URLSearchParams(search);
  return {kind:params.get('intent')==='renewal'?'renewal':'purchase',months:[3,6,12].includes(Number(params.get('months')))?Number(params.get('months')):12};
}
export function validateRequest(kind,months,message) {
  if(!['purchase','renewal'].includes(kind)||![3,6,12].includes(Number(months)))throw new Error('Chọn loại yêu cầu và thời hạn hợp lệ.');
  if(message.trim().length>1000)throw new Error('Nội dung tối đa 1.000 ký tự.');
  return {p_kind:kind,p_months:Number(months),p_message:message.trim()||'Tôi muốn được tư vấn và xác nhận thông tin thanh toán.'};
}
export const requestLabels=Object.freeze({pending:'Chờ XT phản hồi',approved:'Đã cấp license',rejected:'Chưa được duyệt',cancelled:'Bạn đã hủy'});
