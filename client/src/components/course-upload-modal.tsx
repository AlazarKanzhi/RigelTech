import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertCourseSchema, type InsertCourse } from "@shared/schema";

interface CourseUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseUploadModal({ isOpen, onClose }: CourseUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "beginner",
      duration: 0,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: InsertCourse & { file?: File }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("category", data.category);
      formData.append("level", data.level);
      formData.append("duration", data.duration.toString());
      
      if (data.file) {
        formData.append("file", data.file);
      }

      const res = await fetch("/api/courses", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create course");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    form.reset();
    setSelectedFile(null);
  };

  const onSubmit = (data: InsertCourse) => {
    createCourseMutation.mutate({ ...data, file: selectedFile || undefined });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-screen overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upload New Course</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter course title"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter course description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Programming, Math, Science"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Material
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    {selectedFile ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-1" />
                        {selectedFile.name}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p>Click to upload course material</p>
                        <p className="text-xs text-gray-400">PDF, DOC, PPT, MP4, MP3</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-rigel-orange hover:bg-orange-600 text-white"
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}