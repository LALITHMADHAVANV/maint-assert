export interface MechanicDuty {
  id: string;
  name: string;
  role: string;
  shift: string;
  specialty: string;
  assignedLines: string;
  status: 'ON_DUTY' | 'STANDBY' | 'ON_LEAVE';
  phone: string;
  avatarColor: string;
}

export const FACTORY_MECHANICS_ROSTER: MechanicDuty[] = [
  {
    id: 'MEC-01',
    name: 'Ramesh Kumar',
    role: 'Senior Master Mechanic (Lead)',
    shift: 'Shift A (07:00 - 15:30)',
    specialty: 'Heavy Lockstitch, Looper Timing & Feed Calibration',
    assignedLines: 'Plant-wide Lead • Lines A & B',
    status: 'ON_DUTY',
    phone: '+91 98401 23451',
    avatarColor: 'bg-indigo-600 text-white',
  },
  {
    id: 'MEC-08',
    name: 'Suresh Babu',
    role: 'Line Sewing Mechanic',
    shift: 'Shift A (07:00 - 15:30)',
    specialty: 'Single Needle Lockstitch (SNLS) & Tension Balances',
    assignedLines: 'Line A (Station 01 to 08)',
    status: 'ON_DUTY',
    phone: '+91 98401 23452',
    avatarColor: 'bg-amber-600 text-white',
  },
  {
    id: 'MEC-12',
    name: 'Praveen Raj',
    role: 'Line Overlock Specialist',
    shift: 'Shift A (07:00 - 15:30)',
    specialty: '4-Thread & 5-Thread Safety Stitch Overlocks',
    assignedLines: 'Line B (Station 01 to 08)',
    status: 'ON_DUTY',
    phone: '+91 98401 23453',
    avatarColor: 'bg-blue-600 text-white',
  },
  {
    id: 'MEC-15',
    name: 'Anand Kumar',
    role: 'Electronics & Direct-Drive Servo Tech',
    shift: 'Shift B (15:30 - 23:00)',
    specialty: 'Direct-Drive Motors, PCBs & Solenoids',
    assignedLines: 'Lines C & D • Electronics Lab',
    status: 'ON_DUTY',
    phone: '+91 98401 23454',
    avatarColor: 'bg-purple-600 text-white',
  },
  {
    id: 'MEC-04',
    name: 'M. Selvam',
    role: 'Preventive Maintenance (PPM) Tech',
    shift: 'Shift A (07:00 - 15:30)',
    specialty: 'Lubrication Siphons, Wick Flushing & Filter Mesh',
    assignedLines: 'Fleet-wide PPM Servicing',
    status: 'ON_DUTY',
    phone: '+91 98401 23455',
    avatarColor: 'bg-emerald-600 text-white',
  },
];
