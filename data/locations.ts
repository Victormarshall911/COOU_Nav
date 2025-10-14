// data/locations.ts

export type LocationType = 'faculty' | 'hostel' | 'clinic'| 'library'| 'department';

export interface Location {
  title: string;
  latitude: number;
  longitude: number;
  description: string;
  type: LocationType;
}

export const locations: Location[] = [
  {
    title: "Faculty of Law",
    latitude: 5.8475,
    longitude: 6.8522,
    description: "COOU Law Faculty Building",
    type: 'faculty',
  },
  {
    title: "University Clinic",
    latitude: 5.8480,
    longitude: 6.8530,
    description: "Campus health center for students",
    type: 'clinic',
  },
  {
    title: "School Hostel",
    latitude: 5.8460,
    longitude: 6.8510,
    description: "Female university hostel",
    type: 'hostel',
  },
  {
    title: "Library",
    latitude: 5.76933475194171,
    longitude: 6.83645315985228,
    description: "University Library",
    type: 'library',
  },
  {
    title: "Computer Science Department",
    latitude: 5.7681910308996684,
    longitude: 6.83404608390568,
    description: "CIS Block",
    type: 'department'
  }
];
