const usersData = [
  {id: 0, name: 'John Doe', registered: '2018/01/01', role: 'Guest', status: 'Pending' },
  {id: 1, name: 'Samppa Nori', registered: '2018/01/01', role: 'Member', status: 'Active'},
  {id: 2, name: 'Estavan Lykos', registered: '2018/02/01', role: 'Staff', status: 'Banned'},
  {id: 3, name: 'Chetan Mohamed', registered: '2018/02/01', role: 'Admin', status: 'Inactive'},
  {id: 4, name: 'Derick Maximinus', registered: '2018/03/01', role: 'Member', status: 'Pending'},
  {id: 5, name: 'Friderik Dávid', registered: '2018/01/21', role: 'Staff', status: 'Active'},
  {id: 6, name: 'Yiorgos Avraamu', registered: '2018/01/01', role: 'Member', status: 'Active'},
  {id: 7, name: 'Avram Tarasios', registered: '2018/02/01', role: 'Staff', status: 'Banned'},
  {id: 8, name: 'Quintin Ed', registered: '2018/02/01', role: 'Admin', status: 'Inactive'},
  {id: 9, name: 'Enéas Kwadwo', registered: '2018/03/01', role: 'Member', status: 'Pending'},
  {id: 10, name: 'Agapetus Tadeáš', registered: '2018/01/21', role: 'Staff', status: 'Active'},
  {id: 11, name: 'Carwyn Fachtna', registered: '2018/01/01', role: 'Member', status: 'Active'},
  {id: 12, name: 'Nehemiah Tatius', registered: '2018/02/01', role: 'Staff', status: 'Banned'},
  {id: 13, name: 'Ebbe Gemariah', registered: '2018/02/01', role: 'Admin', status: 'Inactive'},
  {id: 14, name: 'Eustorgios Amulius', registered: '2018/03/01', role: 'Member', status: 'Pending'},
  {id: 15, name: 'Leopold Gáspár', registered: '2018/01/21', role: 'Staff', status: 'Active'},
  {id: 16, name: 'Pompeius René', registered: '2018/01/01', role: 'Member', status: 'Active'},
  {id: 17, name: 'Paĉjo Jadon', registered: '2018/02/01', role: 'Staff', status: 'Banned'},
  {id: 18, name: 'Micheal Mercurius', registered: '2018/02/01', role: 'Admin', status: 'Inactive'},
  {id: 19, name: 'Ganesha Dubhghall', registered: '2018/03/01', role: 'Member', status: 'Pending'},
  {id: 20, name: 'Hiroto Šimun', registered: '2018/01/21', role: 'Staff', status: 'Active'},
  {id: 21, name: 'Vishnu Serghei', registered: '2018/01/01', role: 'Member', status: 'Active'},
  {id: 22, name: 'Zbyněk Phoibos', registered: '2018/02/01', role: 'Staff', status: 'Banned'},
  {id: 23, name: 'Aulus Agmundr', registered: '2018/01/01', role: 'Member', status: 'Pending'},
  {id: 42, name: 'Ford Prefect', registered: '2001/05/25', role: 'Alien', status: 'Don\'t panic!'},

  {
    id: 1,
    name: 'John Doe',
    registered: '2024-01-01',
    role: 'Admin',
    status: 'Active',
    zone: 'Zone 1',  // ✅ Add Zone
    ward: 'KE',      // ✅ Add Ward
    beat: '79',      // ✅ Add Beat
    machineId: 'KE079B08902884',
    machineLocation: 'Community Toilet',
    address: 'Shri Sai Siddhi Welfare Association, Hanjar Nagar, Andheri East',
    machineType: 'Community Toilet',
    vending: 0,
    incinerator: 0,
    date: '2024-02-21',
    cash: 0
  },
  {
    id: 2,
    name: 'Jane Smith',
    registered: '2024-02-01',
    role: 'User',
    status: 'Pending',
    zone: 'Zone 3',
    ward: 'PS',
    beat: '50',
    machineId: 'PS050B03802891',
    machineLocation: 'Community Toilet',
    address: 'Shree Mahalaxmi Samajik Seva Sanstha, Sant Nirankari Udyan, Goregaon West',
    machineType: 'Community Toilet',
    vending: 0,
    incinerator: 0,
    date: '2024-02-21',
    cash: 0
  }
]

  



export default usersData
