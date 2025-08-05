import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { GraduationCap, Book, Trophy, Clock, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StudentDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: isAuthenticated,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/student"],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading || enrollmentsLoading || coursesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-rigel-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-rigel-orange rounded-full flex items-center justify-center mb-4 mx-auto">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Get enrolled courses with progress
  const enrolledCourses = enrollments || [];
  const allCourses = courses || [];
  const userCourses = allCourses.filter(course => 
    enrolledCourses.some(enrollment => enrollment.courseId === course.id)
  ).map(course => {
    const enrollment = enrolledCourses.find(e => e.courseId === course.id);
    return { ...course, progress: enrollment?.progress || 0 };
  });

  const userStats = stats || {
    enrolledCourses: 0,
    completedCourses: 0,
    studyHours: 0,
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-600';
      case 'intermediate': return 'bg-blue-100 text-blue-600';
      case 'advanced': return 'bg-rigel-orange bg-opacity-10 text-rigel-orange';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCourseImage = (category: string) => {
    const images = {
      'mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'technology': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'business': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'arts': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    };
    return images[category as keyof typeof images] || images.science;
  };

  return (
    <div className="min-h-screen bg-rigel-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-rigel-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-rigel-orange rounded-full flex items-center justify-center">
                  <GraduationCap className="text-white w-5 h-5" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Rigel</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5 text-gray-500" />
              </Button>
              <div className="flex items-center space-x-3">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl}
                    alt="Student profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName || 'Student'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Student'}!
          </h1>
          <p className="text-gray-600">Continue your learning journey with Rigel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-rigel-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Book className="text-rigel-orange w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.enrolledCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-rigel-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Trophy className="text-rigel-blue w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.completedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-green-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Study Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.studyHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
          {userCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses enrolled yet.</p>
                <p className="text-sm text-gray-500 mt-2">Contact your instructor to get enrolled in courses.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <img 
                    src={getCourseImage(course.category)}
                    alt={`${course.title} course`} 
                    className="w-full h-48 object-cover" 
                  />
                  
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">{course.duration} weeks</span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    
                    <Button 
                      className={`w-full font-medium transition-colors ${
                        course.progress >= 100 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-rigel-blue hover:bg-blue-700 text-white'
                      }`}
                    >
                      {course.progress >= 100 ? (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        'Continue Learning'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
