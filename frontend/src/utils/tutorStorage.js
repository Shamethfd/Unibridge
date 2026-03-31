/** Remember tutor student ID so Messages / Dashboard can load notifications without login. */
export const TUTOR_STUDENT_ID_KEY = 'learnbridge_tutor_student_id';

export function getStoredTutorStudentId() {
  try {
    return (localStorage.getItem(TUTOR_STUDENT_ID_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function setStoredTutorStudentId(studentId) {
  if (!studentId) return;
  try {
    localStorage.setItem(TUTOR_STUDENT_ID_KEY, studentId.trim());
  } catch {
    /* ignore */
  }
}
