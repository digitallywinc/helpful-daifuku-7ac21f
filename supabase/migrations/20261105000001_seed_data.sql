-- =============================================================================
-- HelpDesk AI — Knowledge Base Seed Data
-- =============================================================================

INSERT INTO public.faqs (question, answer, category, is_published, helpful_count)
VALUES
-- General Questions
(
    'What is HelpDesk AI and how does it work?',
    'HelpDesk AI is an intelligent customer support platform combining real-time AI assistance with human support ticket management. You can chat with our AI agent 24/7 for instant answers or submit a support ticket to be handled by our expert engineering and support team.',
    'General Questions',
    true,
    42
),
(
    'What are your customer support operating hours?',
    'Our AI support assistant is available 24 hours a day, 7 days a week. Our human engineering and support specialists operate Monday through Friday from 8:00 AM to 8:00 PM EST, and urgent priority tickets are monitored around the clock with rapid response SLAs.',
    'General Questions',
    true,
    28
),
(
    'How do I track the status of my support ticket?',
    'You can track all submitted tickets under the "My Tickets" section in your customer portal. Each ticket includes a unique reference identifier (e.g., TICK-1001), real-time status indicators (Open, In Progress, Waiting for Customer, Resolved, Closed), and chronological conversation logs.',
    'General Questions',
    true,
    35
),

-- Technical Support
(
    'How do I resolve network connection or timeout errors?',
    'If you encounter connection or timeout issues: 1) Verify your internet connection; 2) Check our status page at status.helpdesk.ai; 3) Clear your browser cache and cookies; 4) Ensure your firewall or VPN allows outbound HTTPS traffic on port 443. If problems persist, open a Technical Support ticket including your browser version and console error logs.',
    'Technical Support',
    true,
    56
),
(
    'Which browsers and devices are officially supported?',
    'HelpDesk AI is built as a responsive progressive web application supporting the latest two versions of Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge across desktop, tablet, and mobile devices (iOS 15+ and Android 10+).',
    'Technical Support',
    true,
    19
),
(
    'How do I integrate HelpDesk AI with my existing systems via API?',
    'HelpDesk AI provides a comprehensive RESTful API for managing tickets, user profiles, and webhooks. You can generate API keys from the Developer Settings page. All endpoints require Bearer token authentication and return JSON formatted payloads.',
    'Technical Support',
    true,
    31
),

-- Account Issues
(
    'How do I reset my account password?',
    'To reset your password, visit the login page and click "Forgot password?". Enter the email address associated with your account, and we will email you a secure, time-sensitive reset link. Click the link to define a new password meeting our security requirements (at least 8 characters with letters, numbers, and symbols).',
    'Account Issues',
    true,
    64
),
(
    'Can I change my registered email address or account name?',
    'Yes. Navigate to your Profile Settings from the top right user menu or sidebar. You can update your display name anytime. For email address changes, a verification confirmation will be sent to both your old and new email addresses to prevent unauthorized takeovers.',
    'Account Issues',
    true,
    22
),
(
    'What is the difference between Customer and Administrator roles?',
    'Customers can create support tickets, track progress, participate in ticket discussions, and chat with the AI assistant. Administrators possess administrative dashboard privileges to assign tickets, update ticket statuses, manage FAQs, view customer metrics, and review support chats.',
    'Account Issues',
    true,
    48
),

-- Billing
(
    'What payment methods do you accept?',
    'We accept all major credit and debit cards (Visa, MasterCard, American Express, Discover), PayPal, and direct wire transfers (ACH / SEPA) for enterprise annual billing contracts.',
    'Billing',
    true,
    39
),
(
    'What is your refund policy?',
    'We offer a 30-day money-back guarantee for all annual subscription plans. If you are not completely satisfied within the first 30 days of service, contact our billing department or open a Billing support ticket for a full refund without hassle.',
    'Billing',
    true,
    45
),
(
    'How can I download invoices and receipts for past payments?',
    'You can access and download PDF invoices by visiting your Account Settings and clicking the "Billing & Invoices" tab. Invoices include complete tax breakdown, VAT identifiers, and date timestamps.',
    'Billing',
    true,
    18
);

