export const urls__config = {
  host: 'http://env-8373206.mircloud.host',
  hostLocal: 'http://localhost:8080',
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
