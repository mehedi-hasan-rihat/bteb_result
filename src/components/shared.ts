// Shared constants & types used across pages

export const SEM_ORD: Record<number, string> = {
  1:'1ST', 2:'2ND', 3:'3RD', 4:'4TH',
  5:'5TH', 6:'6TH', 7:'7TH', 8:'8TH',
};

export const STATUS_COLOR: Record<string, string> = {
  passed:   '#e8ff00',
  referred: '#ff9500',
  failed:   '#ff3b30',
};

export const MARQUEE_ITEMS = [
  'BTEB RESULT', 'CHECK NOW', 'POLYTECHNIC',
  'DIPLOMA', 'RESULT 2025', 'SEARCH BY ROLL',
];

export interface Student {
  roll: string;
  institute_code: string;
  institute_name: string;
  status: 'passed' | 'referred' | 'failed';
  gpas: Record<string, number | null>;
  ref_subjects: string[];
  semester: number;
  subjectMap: Record<string, string>;
  subjectSemMap: Record<string, number>;
}

export function resolveSubjects(student: Student) {
  return student.ref_subjects.map(sub => {
    const code   = sub.match(/^(\d+)/)?.[1] ?? '';
    const suffix = sub.replace(/^\d+/, '');
    return {
      code, suffix, raw: sub,
      name: student.subjectMap[code] ?? null,
      sem:  student.subjectSemMap[code] ?? 0,
    };
  });
}
