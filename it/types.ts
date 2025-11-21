export interface SubjectMark {
    subject: string;
    mark: number | string; // Could be "AB", "F", or numeric
    status: 'PASS' | 'FAIL' | 'ABSENT';
    color: string; // HEX code for UI/PDF
}

export interface StudentData {
    regNo: string;
    name: string;
    dept: string;
    subjects: SubjectMark[];
    totalMarks: number;
    resultStatus: 'PASS' | 'FAIL';
    absentCount: number;
}

export interface ParsingStats {
    totalStudents: number;
    totalPassed: number;
    totalFailed: number;
    averageScore: number;
}

export type ParsedRow = Record<string, any>;