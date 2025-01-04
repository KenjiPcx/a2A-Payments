import type { UserNode } from '@/types';

export const initialUserNodes: UserNode[] = [
  {
    name: 'De Lo',
    email: 'darawiish24@gmail.com',
    twitter: '',
    latitude: 44.9778,
    longitude: -93.2650,
    type: 'user',
    registrationTime: 'Yesterday, 7:28 a.m.',
    status: 'Looking for team',
    timeline: [
      {
        event: 'Sent: Registration Approved',
        timestamp: 'Yesterday, 4:21 p.m.',
        status: 'Delivered'
      },
      {
        event: 'Status Updated',
        timestamp: 'Yesterday, 4:21 p.m.',
        updatedBy: 'Ian Timotheos Pilon',
        status: 'Pending → Going'
      },
      {
        event: 'Sent: Registration Confirmed',
        timestamp: 'Yesterday, 7:28 a.m.',
        status: 'Opened'
      },
      {
        event: 'Registered (Pending Approval)',
        timestamp: 'Yesterday, 7:28 a.m.'
      }
    ]
  },
  {
    name: 'Sagar jethi',
    email: 'codemintous@gmail.com',
    twitter: '',
    latitude: 23.0225,
    longitude: 72.5714,
    type: 'user',
    registrationTime: 'Yesterday, 7:20 a.m.',
    status: 'Looking for team',
    timeline: [
      {
        event: 'Sent: Registration Approved',
        timestamp: 'Yesterday, 4:21 p.m.',
        status: 'Delivered'
      },
      {
        event: 'Status Updated',
        timestamp: 'Yesterday, 4:21 p.m.',
        updatedBy: 'Ian Timotheos Pilon',
        status: 'Pending → Going'
      },
      {
        event: 'Sent: Registration Confirmed',
        timestamp: 'Yesterday, 7:20 a.m.',
        status: 'Delivered'
      },
      {
        event: 'Registered (Pending Approval)',
        timestamp: 'Yesterday, 7:20 a.m.'
      }
    ]
  },
  {
    name: 'vignesh',
    email: 'vignesh@allcaps.ai',
    twitter: '',
    latitude: 12.9716,
    longitude: 77.5946,
    type: 'user',
    registrationTime: 'Dec 12, 12:15 p.m.',
    status: 'Looking for team',
    timeline: [
      {
        event: 'Sent: Registration Approved',
        timestamp: 'Dec 12, 1:59 p.m.',
        status: 'Opened'
      },
      {
        event: 'Status Updated',
        timestamp: 'Dec 12, 1:59 p.m.',
        updatedBy: 'Ian Timotheos Pilon',
        status: 'Pending → Going'
      },
      {
        event: 'Sent: Registration Confirmed',
        timestamp: 'Dec 12, 12:15 p.m.',
        status: 'Opened'
      },
      {
        event: 'Registered (Pending Approval)',
        timestamp: 'Dec 12, 12:15 p.m.'
      }
    ]
  }
];