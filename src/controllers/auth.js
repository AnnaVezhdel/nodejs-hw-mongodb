import * as authServices from '../services/auth.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session.id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
};

export const registerController = async (req, res) => {
  const user = await authServices.register(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user',
    data: user,
  });
};

export const loginController = async (req, res) => {
  const session = await authServices.login(req.body);

  setupSession(res, session);
  
  res.json({
    status: 200,
    message: 'Successfully logged in',
    data: {
      accessToken: session.accessToken,
    }
  });
};

export const refreshTokenController = async(req, res) => {
  const {refreshToken, sessionId} = req.cookies;
  const session = await authServices.refreshToken({refreshToken, sessionId});

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session',
    data: {
      accessToken: session.accessToken,
    }
  });
};

export const logoutController = async(req, res) => {
  if(req.cookies.sessionId) {
    await authServices.logout(req.cookies.sessionId);
  }

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};

export async function requestPasswordResetController(req, res) {
  const {email} = req.body;

  await authServices.requestResetPassword(email);

  
};

export async function resetPasswordController(req, res) {
  const {token, password} = req.body;

  await authServices.resetPassword(token, password);

  res.json({
    message: 'Password has been successfully reset.',
    status: 200,
    data: {},
  });
}