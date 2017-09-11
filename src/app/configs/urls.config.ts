export const urls__config = {
  // hostLocal: 'https://api.tanks-lab.com',
  hostLocal: 'http://localhost:8080',
  users: {
    auth: '/users/login',
    reg: '/users/register',
    info: '/users/info',
    balance: '/users/balance',
    activate: '/users/activate',
    forgot: '/users/forgot',
    changePassword: '/users/changePassword'
  },
  info: {
    get: '/info/get'
  },
  token: {
    valid: '/token/valid'
  },
  payments: {
    genURL: '/payments/genURL',
    withdrawCreate: '/payments/withdrawCreate'
  },
  hangar: {
    getList: '/hangar/list',
    buySlot: '/hangar/slot',
    getInfoTank: '/hangar/info',
    getOutGold: '/hangar/getGold',
    outGold: '/hangar/outGold'
  },
  shop: {
    getList: '/shop/list',
    buyTank: '/shop/buyTank'
  },
  research: {
    get: '/research/get',
    open: '/research/open'
  }
};
