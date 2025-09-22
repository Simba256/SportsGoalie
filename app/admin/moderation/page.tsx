'use client';

import { useState, useEffect } from 'react';
import {
  Flag,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  MoreHorizontal,
  MessageSquare,
  User,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminRoute } from '@/components/auth/protected-route';
import { toast } from 'sonner';

// Mock data types for demonstration
interface ReportedContent {
  id: string;
  type: 'quiz' | 'sport' | 'skill' | 'comment';
  title: string;
  content: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  reportReason: string;
  reportedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
}

interface ContentReview {
  id: string;
  type: 'quiz' | 'sport' | 'skill';
  title: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
}

export default function AdminModerationPage() {
  return (
    <AdminRoute>
      <ModerationContent />
    </AdminRoute>
  );
}

function ModerationContent() {
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [pendingReviews, setPendingReviews] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Mock data - in real implementation, this would come from a service
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setReportedContent([
        {
          id: '1',
          type: 'quiz',
          title: 'Basketball Fundamentals Quiz',
          content: 'Quiz content with potentially inappropriate questions...',
          reportedBy: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          reportReason: 'Inappropriate content',
          reportedAt: new Date('2024-01-15'),
          status: 'pending',
          priority: 'high',
        },
        {
          id: '2',
          type: 'comment',
          title: 'Comment on Soccer Skills',
          content: 'This is a controversial comment that was reported...',
          reportedBy: {
            id: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
          reportReason: 'Spam',
          reportedAt: new Date('2024-01-14'),
          status: 'pending',
          priority: 'medium',
        },
        {
          id: '3',
          type: 'sport',
          title: 'Tennis Training Program',
          content: 'Sport content that violates community guidelines...',
          reportedBy: {
            id: 'user3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
          },
          reportReason: 'Copyright violation',
          reportedAt: new Date('2024-01-13'),
          status: 'approved',
          priority: 'low',
        },
      ]);

      setPendingReviews([
        {
          id: '1',
          type: 'quiz',
          title: 'Advanced Swimming Techniques Quiz',
          author: {
            id: 'author1',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
          },
          createdAt: new Date('2024-01-16'),
          status: 'pending',
        },
        {
          id: '2',
          type: 'sport',
          title: 'Rock Climbing Basics',
          author: {
            id: 'author2',
            name: 'Tom Brown',
            email: 'tom@example.com',
          },
          createdAt: new Date('2024-01-15'),
          status: 'pending',
        },
      ]);

      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleApproveReport = async (reportId: string) => {
    try {
      setReportedContent(prev =>
        prev.map(report =>
          report.id === reportId ? { ...report, status: 'approved' } : report
        )
      );
      toast.success('Report approved and content removed');
    } catch (error) {
      toast.error('Failed to approve report');
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      setReportedContent(prev =>
        prev.map(report =>
          report.id === reportId ? { ...report, status: 'rejected' } : report
        )
      );
      toast.success('Report rejected');
    } catch (error) {
      toast.error('Failed to reject report');
    }
  };

  const handleApproveContent = async (reviewId: string) => {
    try {
      setPendingReviews(prev =>
        prev.map(review =>
          review.id === reviewId ? { ...review, status: 'approved' } : review
        )
      );
      toast.success('Content approved and published');
    } catch (error) {
      toast.error('Failed to approve content');
    }
  };

  const handleRejectContent = async (reviewId: string) => {
    try {
      setPendingReviews(prev =>
        prev.map(review =>
          review.id === reviewId ? { ...review, status: 'rejected' } : review
        )
      );
      toast.success('Content rejected');
    } catch (error) {
      toast.error('Failed to reject content');
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredReports = reportedContent.filter(report => {
    const matchesSearch = !searchTerm ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedBy.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredReviews = pendingReviews.filter(review => {
    const matchesSearch = !searchTerm ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.author.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading moderation data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review reported content and approve new submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportedContent.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportedContent.filter(r => r.priority === 'high' && r.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Urgent reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingReviews.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Moderation actions</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search and Filter</CardTitle>
            <CardDescription>
              Find specific content or filter by status and priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content, users, or reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Reported Content</TabsTrigger>
            <TabsTrigger value="reviews">Content Reviews</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          {/* Reported Content Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reported Content ({filteredReports.length})</CardTitle>
                <CardDescription>
                  Content that has been reported by users and requires moderation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8">
                    <Flag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reports found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'Try adjusting your search criteria'
                        : 'No content has been reported yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                              <Flag className="h-5 w-5 text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium truncate">{report.title}</h4>
                              <Badge variant="outline">{report.type}</Badge>
                              <Badge variant={getPriorityBadgeVariant(report.priority)}>
                                {report.priority}
                              </Badge>
                              <Badge variant={getStatusBadgeVariant(report.status)}>
                                {report.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-2">
                              {report.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                {report.reportedBy.name}
                              </div>
                              <div className="flex items-center">
                                <MessageSquare className="mr-1 h-3 w-3" />
                                {report.reportReason}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {report.reportedAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>

                          {report.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveReport(report.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Remove Content
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectReport(report.id)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Dismiss
                              </Button>
                            </>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                View Full Content
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Contact Reporter
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Content Reviews ({filteredReviews.length})</CardTitle>
                <CardDescription>
                  New content submissions awaiting approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No content to review</h3>
                    <p className="text-muted-foreground mb-4">
                      All content has been reviewed or no new submissions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{review.title}</h4>
                              <Badge variant="outline">{review.type}</Badge>
                              <Badge variant={getStatusBadgeVariant(review.status)}>
                                {review.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              By {review.author.name}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                Submitted {review.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Button>

                          {review.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveContent(review.id)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectContent(review.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Guidelines</CardTitle>
                <CardDescription>
                  Standards and procedures for content moderation
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <h3>Content Standards</h3>
                <ul>
                  <li>All content must be appropriate for all ages</li>
                  <li>No offensive, discriminatory, or harmful language</li>
                  <li>Content must be accurate and educational</li>
                  <li>No copyright violations or plagiarism</li>
                  <li>Must follow sports safety guidelines</li>
                </ul>

                <h3>Report Priorities</h3>
                <ul>
                  <li><strong>High:</strong> Immediate safety concerns, illegal content, severe violations</li>
                  <li><strong>Medium:</strong> Policy violations, inappropriate content, spam</li>
                  <li><strong>Low:</strong> Minor issues, duplicate content, formatting problems</li>
                </ul>

                <h3>Moderation Actions</h3>
                <ul>
                  <li><strong>Approve:</strong> Content meets standards and can be published</li>
                  <li><strong>Reject:</strong> Content violates policies and must be removed</li>
                  <li><strong>Request Changes:</strong> Content needs modifications before approval</li>
                  <li><strong>Escalate:</strong> Complex cases requiring senior review</li>
                </ul>

                <h3>Response Times</h3>
                <ul>
                  <li>High priority reports: 2 hours</li>
                  <li>Medium priority reports: 24 hours</li>
                  <li>Low priority reports: 72 hours</li>
                  <li>Content reviews: 48 hours</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}