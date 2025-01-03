import { Router } from 'express';
import { getContactById } from '../services/contacts.js';
import { getContactsController } from '../controllers/contacts.js';

const contactsRouter = Router();

contactsRouter.get('/', getContactsController);
contactsRouter.get('/:contactId', getContactById);

export default contactsRouter;
