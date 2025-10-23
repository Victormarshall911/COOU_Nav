// data/locations.ts

export type LocationType = 'faculty' | 'hostel' | 'clinic'| 'library'| 'department' | 'hall' | 'ict';

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
    latitude: 5.773225272613918,
    longitude: 6.836807352761141,
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
  },

  {
    title: "Geology Department",
    latitude: 5.768725421068845,
    longitude: 6.839527872281652,
    description: "Department of Geology",
    type: 'department'
  },

  {
    title: "Anatomy Department",
    latitude: 5.769550458213301,
    longitude: 6.832913485818638,
    description: "Department of Anatomy",
    type: 'department'
  },

  {
    title: "Biochemistry Department",
    latitude: 5.76994841687246,
    longitude: 6.8332939593778965,
    description: "Department of Biochemistry",
    type: 'department'
  },

  {
    title: "Physiology Department",
    latitude: 5.7702784311584505,
    longitude: 6.833147623393567,
    description: "Department of Physiology",
    type: 'department'
  },

  {
    title: "Old ETF Building",
    latitude: 5.769981956495536,
    longitude: 6.833622890005539,
    description: "COOU Old ETF Building",
    type: 'hall'
  },

  {
    title: "Environmental Management Department",
    latitude: 5.770887144023766,
    longitude: 6.834185436697501,
    description: "Department of Environmental Management",
    type: 'department'
  },

  {
    title: "Architecture Department",
    latitude: 5.7704414602764365,
    longitude: 6.834758400924194,
    description: "Department of Architecture",
    type: 'department'
  },

  {
    title: "Engineering Auditorium",
    latitude: 5.767805679636377,
    longitude: 6.834952722005502,
    description: "COOU Engineering Auditorium",
    type: 'hall'
  },

  {
    title: "Chemical Engineering Department",
    latitude: 5.767838903211181,
    longitude: 6.83462356605778,
    description: "Department of Chemical Engineering",
    type: 'department'
  },

  {
    title: "Civil Engineering Department",
    latitude: 5.767869753666228,
    longitude: 6.835549019010121,
    description: "Department of Civil Engineering",
    type: 'department'
  },

  {
    title: "COOU ICT",
    latitude: 5.768944772542975,
    longitude: 6.8352651816313434,
    description: "ICT COOU",
    type: 'ict'
  },

  {
    title: "Geology lecture hall",
    latitude: 5.770560856677529,
    longitude: 6.836326590297603,
    description: "Lecture hall for Geology classes",
    type: 'hall'
  },

  

];
