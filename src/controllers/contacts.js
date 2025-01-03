import { getAllContacts } from "../services/contacts";

export const getContactsController = async (req, res) => {
    const contacts = await getAllContacts();
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
//   } catch (error) {
//     res.status(500).json({
//       error: error.message,
//       message: 'Server error',
//     });
//   }
// }

export async function getContactById(req, res) {
  const { contactId } = req.params;

  try {
    const contact = await contactsCollection.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
      });
    }
    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Server error',
    });
  }
}
