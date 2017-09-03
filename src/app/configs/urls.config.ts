export const urls__config = {
  // hostLocal: 'https://api.tanks-lab.com',
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
    genURL: '/payments/genURL',
    getListPaymentMethod: '/payments/getListPaymentMethod'
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
