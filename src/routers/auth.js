import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  authLoginSchema,
  authRegisterSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from '../validation/auth.js';
import * as authController from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import express from 'express';
const jsonParser = express.json();

const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(authRegisterSchema),
  ctrlWrapper(authController.registerController),
);

authRouter.post(
  '/login',
  validateBody(authLoginSchema),
  ctrlWrapper(authController.loginController),
);

authRouter.post('/refresh', ctrlWrapper(authController.refreshTokenController));

authRouter.post('/logout', ctrlWrapper(authController.logoutController));

authRouter.post(
  '/send-reset-email',
  jsonParser,
  validateBody(requestPasswordResetSchema),
  ctrlWrapper(authController.requestPasswordResetController),
);

authRouter.post(
  '/reset-pwd',
  jsonParser,
  validateBody(resetPasswordSchema),
  ctrlWrapper(authController.resetPasswordController),
);

export default authRouter;
