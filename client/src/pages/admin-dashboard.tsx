import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, Plus, Book, Users, TrendingUp, Clock, Edit, Eye, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CourseUploadModal from "@/components/course-upload-modal";

export default function AdminDashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/admin"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteMutation.mutate(courseId);
    }
  };

  if (isLoading || coursesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-rigel-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-rigel-orange rounded-full flex items-center justify-center mb-4 mx-auto">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null; // Will redirect via useEffect
  }

  const adminStats = stats || {
    totalCourses: courses?.length || 0,
    activeStudents: 0,
    completionRate: 0,
    avgStudyTime: 0,
  };

  const getCourseImage = (category: string) => {
    const images = {
      'mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50',
      'technology': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50',
      'business': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50',
      'science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50',
      'arts': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50',
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
                <Badge className="ml-2 bg-rigel-blue text-white">Admin</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-rigel-orange hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Course
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button 
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'courses' 
                  ? 'border-rigel-orange text-rigel-orange' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('courses')}
            >
              Courses
            </button>
            <button 
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'students' 
                  ? 'border-rigel-orange text-rigel-orange' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('students')}
            >
              Students
            </button>
            <button 
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'analytics' 
                  ? 'border-rigel-orange text-rigel-orange' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
        </div>
      </nav>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-rigel-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Book className="text-rigel-orange w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-rigel-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Users className="text-rigel-blue w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-purple-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Avg. Study Time</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.avgStudyTime}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management */}
        {activeTab === 'courses' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Course Management</h2>
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-rigel-orange hover:bg-orange-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Course
                </Button>
              </div>
              
              {!courses || courses.length === 0 ? (
                <div className="text-center py-12">
                  <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses created yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Upload your first course to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Course Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Level</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <img 
                                src={getCourseImage(course.category)}
                                alt="Course thumbnail" 
                                className="w-10 h-10 rounded-lg object-cover mr-3" 
                              />
                              <div>
                                <p className="font-medium text-gray-900">{course.title}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 capitalize">{course.category}</td>
                          <td className="py-3 px-4 text-gray-600 capitalize">{course.level}</td>
                          <td className="py-3 px-4">
                            <Badge className={course.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}>
                              {course.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-rigel-blue hover:text-blue-700">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteCourse(course.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Student Management</h2>
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Student management coming soon.</p>
                <p className="text-sm text-gray-500 mt-2">View and manage student enrollments and progress.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Analytics dashboard coming soon.</p>
                <p className="text-sm text-gray-500 mt-2">Track course performance and student engagement.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Course Upload Modal */}
      <CourseUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}
