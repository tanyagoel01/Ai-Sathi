/**
 * MULTI-STUDENT MANAGER
 * Manage multiple student profiles offline
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, UserPlus, User, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface StudentProfile {
    id: string;
    name: string;
    grade: string;
    avatar: string;
    createdAt: string;
}

const AVATARS = ['👦', '👧', '🧒', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👶', '🧑'];

export default function MultiStudentManager() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', grade: '5', avatar: AVATARS[0] });

    useEffect(() => {
        const savedStudents = JSON.parse(localStorage.getItem('studentProfiles') || '[]');
        setStudents(savedStudents);
    }, []);

    const addStudent = () => {
        if (!newStudent.name.trim()) return;

        const student: StudentProfile = {
            id: Date.now().toString(),
            name: newStudent.name,
            grade: newStudent.grade,
            avatar: newStudent.avatar,
            createdAt: new Date().toISOString(),
        };

        const updatedStudents = [...students, student];
        setStudents(updatedStudents);
        localStorage.setItem('studentProfiles', JSON.stringify(updatedStudents));
        setNewStudent({ name: '', grade: '5', avatar: AVATARS[0] });
        setShowAddForm(false);
    };

    const deleteStudent = (id: string) => {
        if (!confirm('Are you sure you want to delete this student profile?')) return;

        const updatedStudents = students.filter(s => s.id !== id);
        setStudents(updatedStudents);
        localStorage.setItem('studentProfiles', JSON.stringify(updatedStudents));
    };

    const selectStudent = (student: StudentProfile) => {
        localStorage.setItem('activeStudent', JSON.stringify(student));
        alert(`Switched to ${student.name}'s profile!`);
        navigate('/language-learning');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-black dark:to-black pb-12">
            {/* Header */}
            <div className="px-4 pt-4 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="rounded-full"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <ThemeToggle />
                <Button
                    size="sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="rounded-full"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                </Button>
            </div>

            {/* Hero */}
            <div className="px-6 pt-8 pb-6 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Student Profiles</h1>
                <p className="text-muted-foreground">छात्र प्रोफ़ाइल</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Manage multiple students with separate progress tracking
                </p>
            </div>

            {/* Add Student Form */}
            {showAddForm && (
                <div className="px-6 mb-6">
                    <Card className="p-6 space-y-4">
                        <h3 className="font-semibold text-foreground">Add New Student</h3>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                            <Input
                                value={newStudent.name}
                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                placeholder="Enter student name"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Grade</label>
                            <select
                                value={newStudent.grade}
                                onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(grade => (
                                    <option key={grade} value={grade}>Grade {grade}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Avatar</label>
                            <div className="grid grid-cols-8 gap-2">
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar}
                                        onClick={() => setNewStudent({ ...newStudent, avatar })}
                                        className={`text-3xl p-2 rounded-lg border-2 transition-all ${newStudent.avatar === avatar
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-300 hover:border-indigo-300'
                                            }`}
                                    >
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={addStudent} className="flex-1">
                                Add Student
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Students List */}
            <div className="px-6 space-y-4">
                {students.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No Students Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Add your first student to start tracking their learning progress
                        </p>
                        <Button onClick={() => setShowAddForm(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Student
                        </Button>
                    </Card>
                ) : (
                    students.map((student) => (
                        <Card
                            key={student.id}
                            className="p-6 cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => selectStudent(student)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 text-4xl">
                                    {student.avatar}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-foreground mb-1">
                                        {student.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Grade {student.grade}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Created: {new Date(student.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteStudent(student.id);
                                    }}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Info */}
            <div className="px-6 mt-6">
                <Card className="p-4 bg-blue-50">
                    <p className="text-xs text-muted-foreground text-center">
                        💡 Tip: Each student has their own progress, lessons, and vocabulary stored separately
                    </p>
                </Card>
            </div>
        </div>
    );
}
