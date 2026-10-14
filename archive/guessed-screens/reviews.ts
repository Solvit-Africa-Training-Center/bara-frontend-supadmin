// Paid access requests, as shown on the Figma "Review request" frame.
export type ReviewRequest = {
  id: string; // e.g. REQ-108
  status: 'Pending' | 'Approved' | 'Rejected';
  submitted: string;
  restaurant: string;
  location: string;
  locations: string;
  manager: string;
  email: string;
  phone: string;
  checks: string;
  payment: {
    status: 'Verified' | 'Unverified';
    verifiedBy: string;
    verifiedAt: string;
    reference: string;
    amount: number;
    method: string;
    note: string;
  };
  plan: string;
};

export const reviewRequests: ReviewRequest[] = [
  {
    id: 'REQ-108',
    status: 'Pending',
    submitted: '08 Oct · 08:45',
    restaurant: 'Umucyo Bistro',
    location: 'Kacyiru, Kigali',
    locations: 'One location',
    manager: 'Claudine Ingabire',
    email: 'claudine@umucyo.rw',
    phone: '+250 788 108 201',
    checks: 'Contact confirmed · No duplicate account',
    payment: {
      status: 'Verified',
      verifiedBy: 'Derrick',
      verifiedAt: '09:20',
      reference: 'MM-804108',
      amount: 45000,
      method: 'MTN Mobile Money · Demo transaction',
      note: 'Receipt and ledger matched · No duplicate reference',
    },
    plan: 'PRO',
  },
];
