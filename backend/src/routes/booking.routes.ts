import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Helper to generate unique booking reference number
function generateReferenceNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TP-BK-${year}-${random}`;
}

// Public: Submit booking / worship event enquiry
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      eventType,
      organization,
      eventDate,
      preferredTime,
      city,
      venue,
      expectedAudience,
      message,
      consentGiven,
    } = req.body;

    if (!fullName || !email || !phone || !eventType || !eventDate || !city || !message) {
      res.status(400).json({
        error: 'Please complete all required fields: name, email, phone, event type, date, city, and message.',
      });
      return;
    }

    if (!consentGiven) {
      res.status(400).json({ error: 'Consent to be contacted is required to submit a booking enquiry.' });
      return;
    }

    let referenceNo = generateReferenceNo();
    // Ensure uniqueness
    let exists = await prisma.booking.findUnique({ where: { referenceNo } });
    while (exists) {
      referenceNo = generateReferenceNo();
      exists = await prisma.booking.findUnique({ where: { referenceNo } });
    }

    const booking = await prisma.booking.create({
      data: {
        referenceNo,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        eventType,
        organization: organization?.trim() || null,
        eventDate,
        preferredTime: preferredTime?.trim() || null,
        city: city.trim(),
        venue: venue?.trim() || null,
        expectedAudience: expectedAudience?.trim() || null,
        message: message.trim(),
        status: 'NEW',
        consentGiven: Boolean(consentGiven),
      },
    });

    res.status(201).json({
      message: 'Booking enquiry submitted successfully. Our ministry team will review and contact you shortly.',
      referenceNo: booking.referenceNo,
      booking: {
        referenceNo: booking.referenceNo,
        fullName: booking.fullName,
        eventDate: booking.eventDate,
        city: booking.city,
        eventType: booking.eventType,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error submitting booking enquiry:', error);
    res.status(500).json({ error: 'Failed to submit booking enquiry. Please try again.' });
  }
});

// Admin: Get all booking enquiries with filtering, search, and pagination
router.get('/', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, eventType } = req.query;
    const where: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (eventType && typeof eventType === 'string' && eventType !== 'ALL') {
      where.eventType = eventType;
    }

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { city: { contains: q } },
        { referenceNo: { contains: q } },
        { organization: { contains: q } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Admin: Update booking status and internal notes
router.put('/:id/status', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, internalNotes } = req.body;

    const validStatuses = ['NEW', 'CONTACTED', 'UNDER_DISCUSSION', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const data: any = {};
    if (status) data.status = status;
    if (internalNotes !== undefined) data.internalNotes = internalNotes;

    const updated = await prisma.booking.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Admin: Export bookings as CSV
router.get('/export/csv', authenticateUser, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Reference No',
      'Full Name',
      'Email',
      'Phone',
      'Event Type',
      'Organization',
      'Event Date',
      'Time',
      'City',
      'Venue',
      'Expected Audience',
      'Status',
      'Submitted Date',
    ];

    const rows = bookings.map((b) => [
      `"${b.referenceNo}"`,
      `"${b.fullName.replace(/"/g, '""')}"`,
      `"${b.email}"`,
      `"${b.phone}"`,
      `"${b.eventType}"`,
      `"${(b.organization || '').replace(/"/g, '""')}"`,
      `"${b.eventDate}"`,
      `"${b.preferredTime || ''}"`,
      `"${b.city}"`,
      `"${(b.venue || '').replace(/"/g, '""')}"`,
      `"${b.expectedAudience || ''}"`,
      `"${b.status}"`,
      `"${b.createdAt.toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tony_prakash_bookings.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting bookings:', error);
    res.status(500).json({ error: 'Failed to export bookings' });
  }
});

export default router;
