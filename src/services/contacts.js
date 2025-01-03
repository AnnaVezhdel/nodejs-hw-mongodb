import { contactsCollection } from '../db/models/Contact.js';

export const getAllContacts = () => contactsCollection.find();

export const getContactById = (contactId) =>
  contactsCollection.findById(contactId);
