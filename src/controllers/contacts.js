import * as fs from 'node:fs/promises';
import path from 'path';

import createError from 'http-errors';
import {
  addContact,
  deleteContact,
  getAllContacts,
  getContact,
  // getContactById,
  updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { sortByList } from '../db/models/Contact.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query, sortByList);
  const filter = parseFilterParams(req.query);
  filter.userId = req.user._id;
  // console.log(filter);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const { _id: userId } = req.user;
  const { contactId: _id } = req.params;

  const contact = await getContact({ _id, userId });
  if (!contact) {
    throw createError(404, `Contact with id-${_id} not found`);
    // const error = new Error(`Contact with id=${contactId} not found`);
    // error.status = 404;
    // throw error;
  }
  res.json({
    status: 200,
    message: `Successfully found contact with id ${_id}!`,
    data: contact,
  });
};

export const addContactController = async (req, res) => {
  let photo = null;

  try {
    const { _id: userId } = req.user;

    if (req.file) {
      if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
        const result = await uploadToCloudinary(req.file.path);
        photo = result.secure_url;
      } else {
        await fs.rename(
          req.file.path,
          path.resolve('src', 'uploads', req.file.filename),
        );
        photo = `http://localhost:3000/uploads/${req.file.filename}`;
      }
    }

    const data = await addContact({
      ...req.body,
      userId,
      photo,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data,
    });
  } catch (error) {
    console.error('❌ Error creating contact:', error);
    res.status(500).json({
      status: 500,
      message: error.message || 'Something went wrong',
    });
  }
};
// export const upsertContactController = async (req, res) => {
//   const { contactId: _id } = req.params;
//   const { _id: userId } = req.user;

//   let photo;
//   if (req.file) {
//     if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
//       const result = await uploadToCloudinary(req.file.path);
//       photo = result.secure_url;
//     } else {
//       await fs.rename(req.file.path, path.resolve('src', 'uploads', req.file.filename));
//       photo = `http://localhost:3000/uploads/${req.file.filename}`;
//     }
//   }

//   const updateData = {
//     ...req.body,
//     userId,
//     ...(photo && { photo }),
//   };

//   const { isNew, data } = await updateContact({ _id, userId }, updateData, {
//     upsert: true,
//   });

//   const status = isNew ? 201 : 200;

//   res.status(status).json({
//     status,
//     message: 'Successfully upserted a contact!',
//     data,
//   });
// };

export const patchContactController = async (req, res) => {
  const { contactId: _id } = req.params;
  const { _id: userId } = req.user;

  let photo;
  if (req.file) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      const result = await uploadToCloudinary(req.file.path);
      photo = result.secure_url;
    } else {
      await fs.rename(
        req.file.path,
        path.resolve('src', 'uploads', req.file.filename),
      );
      photo = `http://localhost:3000/uploads/${req.file.filename}`;
    }
  }

  const updateData = {
    ...req.body,
    ...(photo && { photo }),
  };

  const result = await updateContact({ _id, userId }, updateData);

  if (!result) {
    throw createError(404, `Contact with id-${_id} not found`);
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result.data,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId: _id } = req.params;
  const { _id: userId } = req.user;
  const data = await deleteContact({ _id, userId });

  if (!data) {
    throw createError(404, `Contact with id-${_id} not found`);
  }

  res.status(204).send();
};
