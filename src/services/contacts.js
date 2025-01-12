import { contactsCollection } from '../db/models/Contact.js';

export const getAllContacts = () => contactsCollection.find();

export const getContactById = (contactId) =>
  contactsCollection.findById(contactId);

export const addContact = (payload) => contactsCollection.create(payload);

export const updateContact = async (contactId, payload, options = {}) => {
  const { upsert = false } = options;
  const result = await contactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      upsert,
      includeResultMetadata: true,
    },
  );

  if (!result || !result.value) return null;

  const isNew = Boolean(result.lastErrorObject.upserted);

  return {
    isNew,
    data: result.value,
  };
};

export const deleteContact = (filter) =>
  contactsCollection.findOneAndDelete(filter);
