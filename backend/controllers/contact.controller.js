import Contact from '../models/Contact.model.js';
import { sendEmail } from '../utils/notification.util.js';

// Submit contact form (public)
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create contact
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      category: category || 'general',
      userId: req.user?._id, // Optional if user is logged in
    });

    // Send confirmation email to user
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'We received your message',
          html: `
            <h2>Thank you for contacting us!</h2>
            <p>Hi ${name},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p><strong>Your message:</strong></p>
            <p>${message}</p>
            <br>
            <p>Best regards,<br>CredMatrix Team</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue even if email fails
      }
    }

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contact,
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
};

// Get all contacts (Admin only)
export const getAllContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      search,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const contacts = await Contact.find(query)
      .populate('userId', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

// Get contact stats (Admin only)
export const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const pending = await Contact.countDocuments({ status: 'pending' });
    const inProgress = await Contact.countDocuments({ status: 'in-progress' });
    const resolved = await Contact.countDocuments({ status: 'resolved' });
    const urgent = await Contact.countDocuments({ priority: 'urgent' });

    const categoryDistribution = await Contact.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      urgent,
      categoryDistribution,
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ error: 'Failed to fetch contact stats' });
  }
};

// Get single contact (Admin only)
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('resolvedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

// Update contact status (Admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { status, priority, adminNotes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // If marking as resolved, add resolved info
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedBy = req.user._id;
      updateData.resolvedAt = new Date();
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Send email notification to user if resolved
    if ((status === 'resolved' || status === 'closed') && contact.email) {
      try {
        await sendEmail({
          to: contact.email,
          subject: 'Your inquiry has been resolved',
          html: `
            <h2>Your inquiry has been resolved</h2>
            <p>Hi ${contact.name},</p>
            <p>We have resolved your inquiry regarding: <strong>${contact.subject}</strong></p>
            ${adminNotes ? `<p><strong>Resolution notes:</strong><br>${adminNotes}</p>` : ''}
            <p>If you have any further questions, please don't hesitate to contact us again.</p>
            <br>
            <p>Best regards,<br>CredMatrix Team</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send resolution email:', emailError);
        // Continue even if email fails
      }
    }

    res.json({
      message: 'Contact updated successfully',
      contact,
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

// Delete contact (Admin only)
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};
