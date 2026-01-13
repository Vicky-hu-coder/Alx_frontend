
export const customers = Array.from({length: 40}).map((_,i)=>({
  id:i+1, name:`Customer ${i+1}`, phone:`07800000${i}`, location:i%2?'Kigali':'Huye'
}))

export const bills = Array.from({length: 55}).map((_,i)=>({
  id:i+1, billNo:`BILL-${1000+i}`, customer:`Customer ${(i%40)+1}`, amount:5000+i*10, status:i%3?'Paid':'Unpaid'
}))

export const payments = Array.from({length: 30}).map((_,i)=>({
  id:i+1, receipt:`RCT-${2000+i}`, customer:`Customer ${(i%40)+1}`, amount:3000+i*20
}))


export const users = [
  {
    id: 1,
    name: "System Admin",
    email: "auca216@gmail.com",
    role: "ADMIN",
  },
  {
    id: 2,
    name: "Victorine Isingizwe",
    email: "victorineisingizwe@gmail.com",
    role: "STAFF",
  },
];

export const meters = Array.from({length: 25}).map((_,i)=>({
  id:i+1, meterNo:`MET-${5000+i}`, customer:`Customer ${(i%40)+1}`, type:i%2?'Prepaid':'Postpaid'
}))
