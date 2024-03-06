const getCookies = (req) => {
  return req.headers.cookie.split(';').reduce((cookies, element) => {
    const [key, value] = element.split('=');
    cookies[key] = value;
    return cookies;
  }, {});
}

module.exports = {
  getCookies
}