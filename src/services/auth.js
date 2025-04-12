import * as fs  from 'node:fs';
import path from 'node:path';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import UserCollection from '../db/models/User.js';
import SessionCollection from '../db/models/Session.js';
import {
  accessTokenLifetime,
  refreshTokenLifetime,
} from '../constants/users.js';
import { sendEmail } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';

const RESET_PASSWORD_TEMPLATE = fs.readFileSync(
  path.resolve('src/templates/reset-password.hbs'),
  { encoding: 'utf-8'},
);

const createSessionData = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: Date.now() + accessTokenLifetime,
  refreshTokenValidUntil: Date.now() + refreshTokenLifetime,
});

export const register = async (payload) => {
  const { email, password } = payload;
  const user = await UserCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await UserCollection.create({
    ...payload,
    password: hashPassword,
  });

  return newUser;
};

export const login = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError.Unauthorized('Email or password invalid');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createHttpError.Unauthorized('Email or password invalid');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const sessionData = createSessionData();

  return SessionCollection.create({
    userId: user._id,
    ...sessionData,
  });
};

export const logout = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const refreshToken = async (payload) => {
  const oldSession = await SessionCollection.findOne({
    _id: payload.sessionId,
    refreshToken: payload.refreshToken,
  });

  if (!oldSession) {
    throw createHttpError(401, 'Session not found');
  }
  if (Date.now > oldSession.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }

  await SessionCollection.deleteOne({ _id: payload.sessionId });

  const sessionData = createSessionData();

  return SessionCollection.create({
    userId: oldSession.userId,
    ...sessionData,
  });
};

export const getUser = (filter) => UserCollection.findOne(filter);

export const getSession = (filter) => SessionCollection.findOne(filter);

export async function requestResetPassword(email) {
  const user = await UserCollection.findOne({ email });

  if (!user) {
    throw createHttpError.NotFound('User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      name: user.name,
    },
    getEnvVar('JWT_SECRET'),
    { expiresIn: '15m' },
  );

  try {
    await sendEmail(
    email,
    'Reset your password',
    template({resetToken})
  );
  } catch {
    throw createHttpError(500, 'Failed to send the email, please try again later');
  }
}

const template = handlebars.compile(RESET_PASSWORD_TEMPLATE);

export async function resetPassword(token, newPassword) {
  try {
    const decoded = jwt.verify(token, getEnvVar('JWT_SECRET'));

    const user = await UserCollection.findById(decoded.sub);

    if(!user) {
      throw createHttpError.NotFound('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserCollection.findByIdAndUpdate(user._id, { password: hashedPassword });
  } catch(error) {

    if(error.name === 'JsonWebTokenError') {
      throw createHttpError.Unauthorized('Token is expired or invalid');
    }

    if(error.name === 'TokenExpiredError') {
      throw createHttpError.Unauthorized('Token is expired');
    }

    throw error;
  }
}
