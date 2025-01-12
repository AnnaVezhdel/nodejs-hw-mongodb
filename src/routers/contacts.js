import { Router } from 'express';
import {
  addContactController,
  deleteContactController,
  getContactByIdController,
  getContactsController,
  patchContactController,
  upsertContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const contactsRouter = Router();

contactsRouter.get('/', ctrlWrapper(getContactsController));
contactsRouter.get('/:contactId', ctrlWrapper(getContactByIdController));

contactsRouter.post('/', ctrlWrapper(addContactController));

contactsRouter.put('/:contactId', ctrlWrapper(upsertContactController));

contactsRouter.patch('/:contactId', ctrlWrapper(patchContactController));

contactsRouter.delete('/:contactId', ctrlWrapper(deleteContactController));

export default contactsRouter;
