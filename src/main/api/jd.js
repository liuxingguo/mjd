'use strict'
/**
 * 京东相关接口
 */
import http from './http'

const UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
const ContentType = 'application/x-www-form-urlencoded'
/**
 * 查询登录状态及是否为京东plus会员
 * @param Cookie
 * @returns {Promise<{isLogin: boolean}|{isLogin: boolean, isPlusMember: boolean}>}
 */
async function cookieCheck (Cookie) {
  try {
    const {data} = await http.get('https://order.jd.com/lazy/isPlusMember.action', {
      headers: {
        Cookie,
        'User-Agent': UserAgent
      }
    })
    return {
      isLogin: !!(data === true || data === false),
      isPlusMember: data === true
    }
  } catch (e) {
    return {
      isLogin: false
    }
  }
}

/**
 * 获取下单地址
 * @param Cookie
 * @param skuId
 * @returns {Promise<string>}
 */
async function getBuyUrl (Cookie, skuId) {
  const { data } = await http.get('https://itemko.jd.com/itemShowBtn', {
    headers: {
      Cookie,
      'User-Agent': UserAgent
    },
    params: {
      skuId,
      callback: 'callback',
      from: 'pc',
      _: Date.now()
    }
  })
  console.log('getBuyUrl:', data)
  return data
}

/**
 * 获取下单信息
 * @param Cookie
 * @param sku
 * @param num
 * @returns {Promise<any>}
 */
async function getBuyInfo (Cookie, sku, num) {
  const { data } = await http.post('https://marathon.jd.com/seckillnew/orderService/pc/init.action', {
    sku,
    num,
    isModifyAddress: false
  }, {
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      'Content-Type': ContentType
    }
  })
  console.log(data)
  return data
}

async function orderSubmit (Cookie, skuId, num, buyInfo) {
  const { data } = await http.post('https://marathon.jd.com/seckillnew/orderService/pc/submitOrder.action', {
    skuId,
    num,
    'addressId': buyInfo['addressList'][0]['id'],
    'yuShou': true,
    'isModifyAddress': false,
    'name': buyInfo['addressList'][0]['name'],
    'provinceId': buyInfo['addressList'][0]['provinceId'],
    'cityId': buyInfo['addressList'][0]['cityId'],
    'countyId': buyInfo['addressList'][0]['countyId'],
    'townId': buyInfo['addressList'][0]['townId'],
    'addressDetail': buyInfo['addressList'][0]['addressDetail'],
    'mobile': buyInfo['addressList'][0]['mobile'],
    'mobileKey': buyInfo['addressList'][0]['mobileKey'],
    'email': buyInfo['addressList'][0]['email'],
    'postCode': buyInfo['addressList'][0]['postCode'],
    'invoiceTitle': buyInfo['invoiceInfo']['invoiceTitle'],
    // "invoiceCompanyName":buyInfo["invoiceInfo"]["invoiceCompany"],
    'invoiceContent': buyInfo['invoiceInfo']['invoiceContentType'],
    // "invoiceTaxpayerNO":buyInfo["invoiceInfo"]["invoiceCode"],
    'invoiceEmail': buyInfo['invoiceInfo']['invoiceEmail'],
    'invoicePhone': buyInfo['invoiceInfo']['invoicePhone'],
    'invoicePhoneKey': buyInfo['invoiceInfo']['invoicePhoneKey'],
    'invoice': true,
    'password': '',
    'codTimeType': 3,
    'paymentType': 4,
    'areaCode': '',
    'overseas': 0,
    'phone': '',
    'eid': '',
    'fp': '',
    'token': buyInfo['token'],
    'pru': ''
  }, {
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      'Content-Type': ContentType
    }
  })
  console.log('orderSubmit:', data)
  return data
}
export default {
  cookieCheck,
  getBuyUrl,
  getBuyInfo,
  orderSubmit
}
