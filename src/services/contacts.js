import createHttpError from 'http-errors';
import { contactsCollection } from '../db/models/Contact.js';
import { calcPaginationData } from '../utils/calcPaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 'asc',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * limit;
  const contactsQuery = contactsCollection.find();

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  if (filter.isFavourite !== undefined) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  if (filter.userId) {
    contactsQuery.where('userId').equals(filter.userId);
  }

  const totalItems = await contactsCollection
    .find()
    .merge(contactsQuery)
    .countDocuments();

  const items = await contactsQuery
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calcPaginationData({ totalItems, page, perPage });

  return {
    data: items,
    page,
    perPage,
    totalItems,
    ...paginationData,
  };
};

export const getContactById = (contactId) =>
  contactsCollection.findById(contactId);

export const getContact = (filter) => contactsCollection.findOne(filter);

export const addContact = (payload) => contactsCollection.create(payload);

export const updateContact = async (filter, payload, options = {}) => {
  const { upsert = false } = options;
  try {
    const result = await contactsCollection.findOneAndUpdate(filter, payload, {
      new: true,
      upsert,
      includeResultMetadata: true,
    });

    if (!result || !result.value) return null;

    const isNew = Boolean(result.lastErrorObject.upserted);

    return {
      isNew,
      data: result.value,
    };
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError(
        409,
        'Duplicate key error – contact may already exist',
      );
    }

    throw createHttpError(
      error.status || 500,
      error.message || 'Failed to upsert contact',
    );
  }
};

export const deleteContact = (filter) =>
  contactsCollection.findOneAndDelete(filter);
