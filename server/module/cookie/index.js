const __public = {};

__public.getCookie = (req) => req.cookies;
__public.getSignedCookie = (req) => req.signedCookies;
__public.setCookie = (req, res, name, val, {
  domain, path = '/', signed = false, httpOnly = true, expires = 0, secure = true,
} = {}) => {
  let issecure = secure;
  if (process.env.NODE_ENV !== 'production') issecure = false;

  const opt = {
    path, signed, httpOnly, expires, secure: issecure,
  };
  if (domain) opt.domain = domain;
  res.cookie(name, val, opt);
};
__public.clearCookie = (res, name) => {
  res.clearCookie(name);
};


module.exports = __public;
