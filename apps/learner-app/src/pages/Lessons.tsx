import React from 'react';
import { useUserStore } from '../stores/userStore';

const Lessons: React.FC = () => {
  const { user } = useUserStore();
  
  if (!user) return null;

  const ageGroup = user.preferences.theme;

  const mockLessons = [
    {
      id: 1,
      title: ageGroup === 'k5' ? 'Fun with Numbers! 🔢' : ageGroup === 'middle' ? 'Algebra Basics' : 'Advanced Calculus',
      subject: 'Mathematics',
      progress: 75,
      duration: '30 min',
      difficulty: ageGroup === 'k5' ? 'Easy' : ageGroup === 'middle' ? 'Medium' : 'Advanced'
    },
    {
      id: 2,
      title: ageGroup === 'k5' ? 'Animals Around Us 🐾' : ageGroup === 'middle' ? 'Life Cycles' : 'Cellular Biology',
      subject: 'Science',
      progress: 45,
      duration: '25 min',
      difficulty: ageGroup === 'k5' ? 'Easy' : ageGroup === 'middle' ? 'Medium' : 'Advanced'
    },
    {
      id: 3,
      title: ageGroup === 'k5' ? 'Story Time Adventures 📖' : ageGroup === 'middle' ? 'Creative Writing' : 'Literature Analysis',
      subject: 'Language Arts',
      progress: 90,
      duration: '40 min',
      difficulty: ageGroup === 'k5' ? 'Easy' : ageGroup === 'middle' ? 'Medium' : 'Advanced'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${
          ageGroup === 'k5' ? 'text-k5-primary' : 
          ageGroup === 'middle' ? 'text-middle-primary' : 'text-high-primary'
        }`}>
          {ageGroup === 'k5' ? 'Learn & Play! 🎓' : 
           ageGroup === 'middle' ? 'My Lessons' : 'Course Materials'}
        </h1>
        <p className="text-gray-600 mt-2">
          {ageGroup === 'k5' ? "Pick a fun lesson to start learning!" :
           ageGroup === 'middle' ? "Continue where you left off" :
           "Access your coursework and study materials"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockLessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`p-6 rounded-${ageGroup} shadow-${ageGroup} ${
              ageGroup === 'k5' ? 'bg-k5-surface hover:shadow-k5' : 
              ageGroup === 'middle' ? 'bg-middle-surface hover:shadow-middle' : 'bg-high-surface hover:shadow-high'
            } transition-all duration-200 cursor-pointer group`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`font-semibold ${
                ageGroup === 'k5' ? 'text-k5-lg text-k5-text' :
                ageGroup === 'middle' ? 'text-lg text-middle-text' :
                'text-base text-high-text'
              }`}>
                {lesson.title}
              </h3>
              {ageGroup === 'k5' && lesson.progress === 100 && (
                <span className="text-2xl">⭐</span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{lesson.subject}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  lesson.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  lesson.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {lesson.difficulty}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{lesson.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      ageGroup === 'k5' ? 'bg-k5-primary' : 
                      ageGroup === 'middle' ? 'bg-middle-primary' : 'bg-high-primary'
                    }`}
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-500">{lesson.duration}</span>
                <button className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  ageGroup === 'k5' ? 'bg-k5-primary text-white hover:bg-k5-primary/90' :
                  ageGroup === 'middle' ? 'bg-middle-primary text-white hover:bg-middle-primary/90' :
                  'bg-high-primary text-white hover:bg-high-primary/90'
                }`}>
                  {lesson.progress === 0 ? 'Start' : 
                   lesson.progress === 100 ? 'Review' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add lesson button for K-5 */}
      {ageGroup === 'k5' && (
        <div className="mt-8 text-center">
          <button className="bg-k5-accent text-k5-text px-6 py-3 rounded-k5 font-medium shadow-k5 hover:shadow-lg transition-all duration-200 hover:scale-105">
            Discover More Lessons! 🚀
          </button>
        </div>
      )}
    </div>
  );
};

export default Lessons;