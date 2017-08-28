export const urls__config = {
  hostLocal: 'https://10.2.13.242:8080',
  // hostLocal: 'http://localhost:8080',
  users: {
    auth: '/users/login',
    reg: '/users/register',
    info: '/users/info',
    balance: '/users/balance'
  },
  token: {
    valid: '/token/valid'
  },
  payments: {
    genURL: '/payments/genURL'
  },
  hangar: {
    getList: '/hangar/list',
    buySlot: '/hangar/slot',
    getInfoTank: '/hangar/info'
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
