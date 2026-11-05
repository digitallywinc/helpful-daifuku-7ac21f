import {
  UserProfile,
  Ticket,
  TicketReply,
  Conversation,
  Message,
  FAQ,
  Notification,
} from '../types/index.js';

// In-memory demo store used if Supabase is offline/not configured
export const memoryStore = {
  profiles: new Map<string, UserProfile>([
    [
      '00000000-0000-0000-0000-000000000001',
      {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Alex Customer',
        email: 'customer@example.com',
        role: 'customer',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    [
      '00000000-0000-0000-0000-000000000002',
      {
        id: '00000000-0000-0000-0000-000000000002',
        full_name: 'Sarah Jenkins (Admin)',
        email: 'admin@helpdesk.ai',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  ]),

  conversations: new Map<string, Conversation>([
    [
      'conv-demo-1',
      {
        id: 'conv-demo-1',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Billing & Refund Inquiry',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  ]),

  messages: new Map<string, Message[]>([
    [
      'conv-demo-1',
      [
        {
          id: 'msg-1',
          conversation_id: 'conv-demo-1',
          sender: 'user',
          content: 'Hello, what is your refund policy for annual plans?',
          created_at: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-demo-1',
          sender: 'assistant',
          content:
            'We offer a 30-day money-back guarantee for all annual subscription plans. If you are not satisfied within the first 30 days, please create a Billing support ticket and our team will process your refund promptly!',
          created_at: new Date(Date.now() - 3490000).toISOString(),
        },
      ],
    ],
  ]),

  tickets: new Map<string, Ticket>([
    [
      'ticket-1',
      {
        id: 'ticket-1',
        ticket_number: 'TICK-1001',
        user_id: '00000000-0000-0000-0000-000000000001',
        assigned_admin_id: '00000000-0000-0000-0000-000000000002',
        subject: 'Cannot connect to production API webhook',
        description:
          'When setting up automated webhook notifications, requests return HTTP 504 gateway timeout after 30 seconds. We have verified firewall and port 443 connectivity.',
        category: 'Technical Support',
        priority: 'High',
        status: 'In Progress',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    [
      'ticket-2',
      {
        id: 'ticket-2',
        ticket_number: 'TICK-1002',
        user_id: '00000000-0000-0000-0000-000000000001',
        assigned_admin_id: null,
        subject: 'Request for custom VAT invoice for Q3',
        description:
          'We need an updated VAT invoice including our company tax registration number GB123456789 for our accounting records.',
        category: 'Billing',
        priority: 'Medium',
        status: 'Open',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
    [
      'ticket-3',
      {
        id: 'ticket-3',
        ticket_number: 'TICK-1003',
        user_id: '00000000-0000-0000-0000-000000000001',
        assigned_admin_id: '00000000-0000-0000-0000-000000000002',
        subject: 'How to invite additional team members to organization',
        description:
          'We upgraded to the Team plan and want to know how our members can join without creating personal individual billing accounts.',
        category: 'Account Issues',
        priority: 'Low',
        status: 'Resolved',
        created_at: new Date(Date.now() - 432000000).toISOString(),
        updated_at: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
  ]),

  ticketReplies: new Map<string, TicketReply[]>([
    [
      'ticket-1',
      [
        {
          id: 'reply-1',
          ticket_id: 'ticket-1',
          user_id: '00000000-0000-0000-0000-000000000002',
          message:
            'Hello Alex, thank you for reaching out. We are currently inspecting our edge gateway telemetry for timeout spikes. Could you confirm the target IP address and endpoint path?',
          is_internal: false,
          created_at: new Date(Date.now() - 43200000).toISOString(),
        },
        {
          id: 'reply-2',
          ticket_id: 'ticket-1',
          user_id: '00000000-0000-0000-0000-000000000001',
          message:
            'Hi Sarah, the endpoint is https://api.mycompany.com/v1/helpdesk-webhook and our static IP is 198.51.100.24.',
          is_internal: false,
          created_at: new Date(Date.now() - 21600000).toISOString(),
        },
      ],
    ],
  ]),

  faqs: new Map<string, FAQ>([
    [
      'faq-1',
      {
        id: 'faq-1',
        question: 'What is HelpDesk AI and how does it work?',
        answer:
          'HelpDesk AI is an intelligent customer support platform combining real-time AI assistance with human support ticket management. You can chat with our AI agent 24/7 for instant answers or submit a support ticket to be handled by our expert engineering and support team.',
        category: 'General Questions',
        is_published: true,
        helpful_count: 42,
        created_at: new Date(Date.now() - 864000000).toISOString(),
        updated_at: new Date(Date.now() - 864000000).toISOString(),
      },
    ],
    [
      'faq-2',
      {
        id: 'faq-2',
        question: 'What are your customer support operating hours?',
        answer:
          'Our AI support assistant is available 24 hours a day, 7 days a week. Our human engineering and support specialists operate Monday through Friday from 8:00 AM to 8:00 PM EST, and urgent priority tickets are monitored around the clock with rapid response SLAs.',
        category: 'General Questions',
        is_published: true,
        helpful_count: 28,
        created_at: new Date(Date.now() - 864000000).toISOString(),
        updated_at: new Date(Date.now() - 864000000).toISOString(),
      },
    ],
    [
      'faq-3',
      {
        id: 'faq-3',
        question: 'How do I resolve network connection or timeout errors?',
        answer:
          'If you encounter connection or timeout issues: 1) Verify your internet connection; 2) Check our status page at status.helpdesk.ai; 3) Clear your browser cache and cookies; 4) Ensure your firewall or VPN allows outbound HTTPS traffic on port 443. If problems persist, open a Technical Support ticket including your browser version and console error logs.',
        category: 'Technical Support',
        is_published: true,
        helpful_count: 56,
        created_at: new Date(Date.now() - 864000000).toISOString(),
        updated_at: new Date(Date.now() - 864000000).toISOString(),
      },
    ],
    [
      'faq-4',
      {
        id: 'faq-4',
        question: 'How do I reset my account password?',
        answer:
          'To reset your password, visit the login page and click "Forgot password?". Enter the email address associated with your account, and we will email you a secure, time-sensitive reset link. Click the link to define a new password meeting our security requirements (at least 8 characters with letters, numbers, and symbols).',
        category: 'Account Issues',
        is_published: true,
        helpful_count: 64,
        created_at: new Date(Date.now() - 864000000).toISOString(),
        updated_at: new Date(Date.now() - 864000000).toISOString(),
      },
    ],
    [
      'faq-5',
      {
        id: 'faq-5',
        question: 'What is your refund policy?',
        answer:
          'We offer a 30-day money-back guarantee for all annual subscription plans. If you are not completely satisfied within the first 30 days of service, contact our billing department or open a Billing support ticket for a full refund without hassle.',
        category: 'Billing',
        is_published: true,
        helpful_count: 45,
        created_at: new Date(Date.now() - 864000000).toISOString(),
        updated_at: new Date(Date.now() - 864000000).toISOString(),
      },
    ],
  ]),

  notifications: new Map<string, Notification[]>([
    [
      '00000000-0000-0000-0000-000000000001',
      [
        {
          id: 'notif-1',
          user_id: '00000000-0000-0000-0000-000000000001',
          title: 'Reply on Ticket TICK-1001',
          message: 'Admin Sarah Jenkins replied to your support ticket.',
          is_read: false,
          link: '/tickets/ticket-1',
          created_at: new Date(Date.now() - 43200000).toISOString(),
        },
        {
          id: 'notif-2',
          user_id: '00000000-0000-0000-0000-000000000001',
          title: 'Welcome to HelpDesk AI',
          message: 'Explore our AI assistant or browse FAQs to get started.',
          is_read: true,
          link: '/faqs',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    ],
  ]),
};
