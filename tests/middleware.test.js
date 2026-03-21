const { requireAuth, requireAdmin } = require('../auth/middleware');

function mockRes() {
  const res = {};
  res.redirect = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAuth', () => {
  test('calls next() when session has userId', () => {
    const req = { session: { userId: 1 } };
    const res = mockRes();
    const next = jest.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test('redirects to /login when session has no userId', () => {
    const req = { session: {} };
    const res = mockRes();
    const next = jest.fn();
    requireAuth(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireAdmin', () => {
  test('calls next() when session has userId and role admin', () => {
    const req = { session: { userId: 1, role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('redirects to /login when not authenticated', () => {
    const req = { session: {} };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when authenticated but not admin', () => {
    const req = { session: { userId: 1, role: 'client' } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Forbidden');
    expect(next).not.toHaveBeenCalled();
  });
});
