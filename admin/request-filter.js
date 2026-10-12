export const requestFilters=Object.freeze({pending:'Chờ xử lý',approved:'Đã duyệt',rejected:'Từ chối',cancelled:'Đã hủy',all:'Tất cả'});
export function filterRequests(requests,status='pending',term=''){
 const query=String(term).trim().toLocaleLowerCase('vi');
 return requests.filter(r=>(status==='all'||r.status===status)&&[r.email,r.display_name,r.message,r.id].some(value=>String(value??'').toLocaleLowerCase('vi').includes(query)));
}
