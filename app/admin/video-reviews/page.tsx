'use client';

import React, { useState, useEffect } from 'react';
import { Play, MessageSquare, Send, Eye, Clock, CheckCircle, AlertCircle, Filter, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AdminRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/context';
import { videoReviewService, StudentVideo } from '@/lib/database/services/video-review.service';
import { sportsService } from '@/lib/database/services/sports.service';
import { Sport } from '@/types';

function VideoReviewsContent() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<StudentVideo[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<StudentVideo | null>(null);
  const [feedback, setFeedback] = useState('');
  const [recommendedSports, setRecommendedSports] = useState<string[]>([]);
  const [selectedSportToAdd, setSelectedSportToAdd] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);

      console.log('🚀 [Admin Video Reviews] Starting to load videos');
      console.log('🔐 [Admin Video Reviews] Current user:', {
        email: user?.email,
        uid: user?.uid,
        role: user?.role
      });

      // Load videos and sports in parallel using proper services
      console.log('📹 [Admin Video Reviews] Calling getAllVideosForReview...');
      const [videosResult, sportsResult] = await Promise.all([
        videoReviewService.getAllVideosForReview(),
        sportsService.getAllSports()
      ]);

      console.log('📹 [Admin Video Reviews] Videos result:', {
        success: videosResult.success,
        dataLength: videosResult.data?.length,
        error: videosResult.error,
        data: videosResult.data
      });

      if (videosResult.success && videosResult.data) {
        console.log('✅ [Admin Video Reviews] Setting videos:', videosResult.data.length, 'videos');
        setVideos(videosResult.data);
      } else {
        console.error('❌ [Admin Video Reviews] Error loading videos:', videosResult.error);
        toast.error('Failed to load videos');
      }

      if (sportsResult.success && sportsResult.data) {
        // Sort sports by name
        const sortedSports = sportsResult.data.items.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        setSports(sortedSports);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewVideo = (video: StudentVideo) => {
    console.log('Opening video for review:', {
      id: video.id,
      fileName: video.fileName,
      videoUrl: video.videoUrl,
      fileSize: video.fileSize
    });
    setSelectedVideo(video);
    setFeedback(video.coachFeedback || '');
    setRecommendedSports(video.recommendedCourses || []);
  };

  const addRecommendedSport = () => {
    if (selectedSportToAdd && !recommendedSports.includes(selectedSportToAdd)) {
      const sport = sports.find(c => c.id === selectedSportToAdd);
      if (sport) {
        setRecommendedSports([...recommendedSports, sport.name]);
        setSelectedSportToAdd('');
      }
    }
  };

  const getFilteredSports = () => {
    // Always return all available sports/courses for selection
    // This allows coaches to recommend any course regardless of the video's sport
    return sports;
  };

  const removeSport = (sport: string) => {
    setRecommendedSports(recommendedSports.filter(c => c !== sport));
  };

  const submitFeedback = async () => {
    if (!selectedVideo || !feedback.trim()) {
      toast.error('Please provide feedback before submitting');
      return;
    }

    setSubmittingFeedback(true);

    try {
      const result = await videoReviewService.submitCoachFeedback(selectedVideo.id, {
        coachFeedback: feedback,
        recommendedCourses: recommendedSports,
        reviewedBy: user?.email || 'coach@example.com'
      });

      if (result.success) {
        toast.success('Feedback sent to student successfully!');
        setSelectedVideo(null);
        setFeedback('');
        setRecommendedSports([]);
        await loadVideos(); // Reload videos to get updated data
      } else {
        toast.error(result.error?.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    const matchesSearch = video.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.sport?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatFirestoreDate = (timestamp: any) => {
    // Handle Firestore Timestamp objects
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    // Handle regular Date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    // Handle string dates
    if (typeof timestamp === 'string') {
      const parsedDate = new Date(timestamp);
      if (isNaN(parsedDate.getTime())) {
        return 'Invalid date';
      }
      return parsedDate.toLocaleDateString();
    }
    // Handle objects with seconds/nanoseconds (Firestore timestamp serialized)
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return 'Unknown date';
  };

  const getStatusBadge = (status: StudentVideo['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Under Review</Badge>;
      case 'feedback_sent':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Feedback Sent</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: StudentVideo['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'reviewed':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'feedback_sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Reviews</h1>
            <p className="text-gray-600 mt-2">Review student training videos and provide personalized feedback</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{videos.filter(v => v.status === 'pending').length} Pending</span>
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by student name, file name, or sport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="reviewed">Under Review</SelectItem>
              <SelectItem value="feedback_sent">Feedback Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No videos found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Students haven\'t uploaded any videos yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(video.status)}
                      <span className="font-medium text-sm">{video.studentName}</span>
                    </div>
                    {getStatusBadge(video.status)}
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{video.fileName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Sport:</span>
                      <span className="font-medium">{video.sport || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Size:</span>
                      <span>{formatFileSize(video.fileSize)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Uploaded:</span>
                      <span>{formatFirestoreDate(video.uploadedAt)}</span>
                    </div>
                  </div>

                  {video.description && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{video.description}</p>
                    </div>
                  )}

                  {video.status === 'feedback_sent' && video.reviewedAt && (
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      Reviewed on {formatFirestoreDate(video.reviewedAt)}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => handleReviewVideo(video)}
                        variant={video.status === 'pending' ? 'default' : 'outline'}
                      >
                        {video.status === 'pending' ? (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Review Video
                          </>
                        ) : video.status === 'reviewed' ? (
                          <>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Complete Review
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            View Feedback
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Review Video - {video.fileName}</DialogTitle>
                        <DialogDescription>
                          Student: {video.studentName} ({video.studentEmail})
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Video Player */}
                        <div className="bg-gray-900 rounded-lg aspect-video overflow-hidden">
                          {selectedVideo?.videoUrl ? (
                            <div className="relative w-full h-full">
                              <video
                                controls
                                className="w-full h-full object-contain"
                                preload="metadata"
                                onError={(e) => {
                                  console.error('Video playback error:', e);
                                  console.log('Video URL:', selectedVideo.videoUrl);
                                  console.log('Video details:', {
                                    fileName: selectedVideo.fileName,
                                    fileSize: selectedVideo.fileSize,
                                    storagePath: selectedVideo.storagePath
                                  });
                                }}
                                onLoadStart={() => {
                                  console.log('Video loading started');
                                }}
                                onCanPlay={() => {
                                  console.log('Video can play');
                                }}
                                onLoadedData={() => {
                                  console.log('Video data loaded');
                                }}
                              >
                                <source src={selectedVideo.videoUrl} type="video/mp4" />
                                <source src={selectedVideo.videoUrl} type="video/webm" />
                                <source src={selectedVideo.videoUrl} type="video/quicktime" />
                                <source src={selectedVideo.videoUrl} type="video/avi" />
                                Your browser does not support the video tag.
                              </video>

                              {/* Video info overlay */}
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                {selectedVideo.fileName} • {(selectedVideo.fileSize / (1024 * 1024)).toFixed(1)} MB
                              </div>

                              {/* Direct download link as fallback */}
                              <div className="absolute top-2 right-2">
                                <a
                                  href={selectedVideo.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                                >
                                  Open in New Tab
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center text-white">
                                <Play className="mx-auto h-16 w-16 mb-4" />
                                <p className="text-lg">Video Player</p>
                                <p className="text-sm opacity-75">{video.fileName}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Student Description */}
                        {video.description && (
                          <div>
                            <Label className="text-base font-medium">Student's Description</Label>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm">{video.description}</p>
                            </div>
                          </div>
                        )}

                        {/* Feedback Section */}
                        <div className="space-y-4">
                          <Label htmlFor="feedback" className="text-base font-medium">
                            Coach Feedback
                          </Label>
                          <Textarea
                            id="feedback"
                            placeholder="Provide detailed feedback on the student's performance, areas for improvement, and positive observations..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            disabled={video.status === 'feedback_sent'}
                          />
                        </div>

                        {/* Recommended Courses */}
                        <div className="space-y-4">
                          <Label className="text-base font-medium">Recommended Courses</Label>

                          {video.status !== 'feedback_sent' && (
                            <div className="flex gap-2">
                              <Select value={selectedSportToAdd} onValueChange={setSelectedSportToAdd}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select a course to recommend..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {getFilteredSports().map((sport) => (
                                    <SelectItem key={sport.id} value={sport.id}>
                                      {sport.name}
                                    </SelectItem>
                                  ))}
                                  {getFilteredSports().length === 0 && (
                                    <SelectItem value="no-sports" disabled>
                                      No courses available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={addRecommendedSport}
                                variant="outline"
                                disabled={!selectedSportToAdd}
                              >
                                Add
                              </Button>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {recommendedSports.map((sport, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {sport}
                                {video.status !== 'feedback_sent' && (
                                  <button
                                    onClick={() => removeSport(sport)}
                                    className="ml-1 text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Submit Button */}
                        {video.status !== 'feedback_sent' && (
                          <div className="flex justify-end">
                            <Button
                              onClick={submitFeedback}
                              disabled={submittingFeedback || !feedback.trim()}
                              className="min-w-32"
                            >
                              {submittingFeedback ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Sending...
                                </div>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Feedback
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoReviewsPage() {
  return (
    <AdminRoute>
      <VideoReviewsContent />
    </AdminRoute>
  );
}