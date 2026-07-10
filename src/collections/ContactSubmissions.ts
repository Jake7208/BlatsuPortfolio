import type { CollectionConfig } from 'payload'
import { Resend } from 'resend'

const TOPIC_LABELS: Record<string, string> = {
  job: 'Job Opportunity',
  inquiry: 'Inquiry',
  other: 'Other',
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: 'Contact Submission',
    plural: 'Contact Submissions',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'topic', 'createdAt'],
  },
  access: {
    // anyone can submit; only logged-in users can read/manage
    create: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) {
          req.payload.logger.warn(
            'RESEND_API_KEY / CONTACT_TO_EMAIL not set — skipping contact notification email',
          )
          return
        }

        const topic = doc.topic ? (TOPIC_LABELS[doc.topic] ?? doc.topic) : 'Not specified'
        const message = doc.message || '(none)'

        try {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const { error } = await resend.emails.send({
            from: process.env.CONTACT_FROM_EMAIL || 'Website <onboarding@resend.dev>',
            to: process.env.CONTACT_TO_EMAIL,
            replyTo: doc.email,
            subject: `New contact message from ${doc.name}`,
            html: `
              <h2>New contact form submission</h2>
              <p><strong>Name:</strong> ${escapeHtml(doc.name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(doc.email)}</p>
              <p><strong>Reason:</strong> ${escapeHtml(topic)}</p>
              <p><strong>Message:</strong></p>
              <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
            `,
            text: `New contact form submission\n\nName: ${doc.name}\nEmail: ${doc.email}\nReason: ${topic}\n\n${message}`,
          })
          if (error) {
            req.payload.logger.error({ err: error }, 'Resend rejected contact notification email')
          }
        } catch (err) {
          // the submission is already saved — never fail the request over the email
          req.payload.logger.error({ err }, 'Failed to send contact notification email')
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'topic',
      label: 'Reason for contact',
      type: 'select',
      options: [
        { label: 'Job Opportunity', value: 'job' },
        { label: 'Inquiry', value: 'inquiry' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'message',
      label: 'Additional information',
      type: 'textarea',
    },
  ],
}
