import { createContext } from "react";

/**
 * { subjects, addSubject, updateNotes,
 *   saveQuizResult, saveQuizzes, deleteSubject }
 */
const SubjectsContext = createContext(null);

export default SubjectsContext;