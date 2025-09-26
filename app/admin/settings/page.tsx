'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Shield,
  Mail,
  Bell,
  Database,
  Server,
  Key,
  Palette,
  Clock,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminRoute } from '@/components/auth/protected-route';
import { toast } from 'sonner';

interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
    defaultLanguage: string;
    defaultTimezone: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  content: {
    autoApproval: boolean;
    maxQuizQuestions: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    contentRetentionDays: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    enforceStrongPasswords: boolean;
    enableTwoFactor: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
    userRegistrationAlert: boolean;
    contentModerationAlert: boolean;
    systemHealthAlert: boolean;
  };
  performance: {
    cacheDuration: number;
    rateLimitRequests: number;
    rateLimitWindow: number;
    enableCompression: boolean;
    enableCDN: boolean;
  };
}

export default function AdminSettingsPage() {
  return (
    <AdminRoute>
      <SettingsContent />
    </AdminRoute>
  );
}

function SettingsContent() {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      siteName: 'SmarterGoalie',
      siteDescription: 'A modern sports learning platform',
      contactEmail: 'contact@sportscoach.com',
      supportEmail: 'support@sportscoach.com',
      defaultLanguage: 'en',
      defaultTimezone: 'UTC',
      maintenanceMode: false,
      registrationEnabled: true,
    },
    content: {
      autoApproval: false,
      maxQuizQuestions: 50,
      maxFileSize: 10, // MB
      allowedFileTypes: ['jpg', 'png', 'pdf', 'mp4'],
      contentRetentionDays: 365,
    },
    security: {
      sessionTimeout: 24, // hours
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      enforceStrongPasswords: true,
      enableTwoFactor: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      adminAlerts: true,
      userRegistrationAlert: true,
      contentModerationAlert: true,
      systemHealthAlert: true,
    },
    performance: {
      cacheDuration: 300, // seconds
      rateLimitRequests: 100,
      rateLimitWindow: 900, // seconds (15 minutes)
      enableCompression: true,
      enableCDN: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    setSettings(prev => ({ ...prev }));
    setHasChanges(false);
    toast.info('Settings reset to defaults');
  };

  const updateSetting = (section: keyof PlatformSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateArraySetting = (section: keyof PlatformSettings, key: string, value: string) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    updateSetting(section, key, values);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">
              Configure platform settings and preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" onClick={handleResetSettings}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings} disabled={loading || !hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Site Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about your platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Platform Configuration
                  </CardTitle>
                  <CardDescription>
                    Default settings and platform behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select
                      value={settings.general.defaultLanguage}
                      onValueChange={(value) => updateSetting('general', 'defaultLanguage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="defaultTimezone">Default Timezone</Label>
                    <Select
                      value={settings.general.defaultTimezone}
                      onValueChange={(value) => updateSetting('general', 'defaultTimezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable public access
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registrationEnabled">User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new user registrations
                      </p>
                    </div>
                    <Switch
                      id="registrationEnabled"
                      checked={settings.general.registrationEnabled}
                      onCheckedChange={(checked) => updateSetting('general', 'registrationEnabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Settings Tab */}
          <TabsContent value="content">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Content Management
                  </CardTitle>
                  <CardDescription>
                    Settings for content creation and approval
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoApproval">Auto-approve Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve new submissions
                      </p>
                    </div>
                    <Switch
                      id="autoApproval"
                      checked={settings.content.autoApproval}
                      onCheckedChange={(checked) => updateSetting('content', 'autoApproval', checked)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxQuizQuestions">Max Quiz Questions</Label>
                    <Input
                      id="maxQuizQuestions"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.content.maxQuizQuestions}
                      onChange={(e) => updateSetting('content', 'maxQuizQuestions', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.content.maxFileSize}
                      onChange={(e) => updateSetting('content', 'maxFileSize', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                    <Input
                      id="allowedFileTypes"
                      placeholder="jpg, png, pdf, mp4"
                      value={settings.content.allowedFileTypes.join(', ')}
                      onChange={(e) => updateArraySetting('content', 'allowedFileTypes', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of file extensions
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Data Retention
                  </CardTitle>
                  <CardDescription>
                    Settings for data storage and cleanup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contentRetentionDays">Content Retention (Days)</Label>
                    <Input
                      id="contentRetentionDays"
                      type="number"
                      min="30"
                      max="3650"
                      value={settings.content.contentRetentionDays}
                      onChange={(e) => updateSetting('content', 'contentRetentionDays', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      How long to keep deleted content before permanent removal
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Authentication Security
                  </CardTitle>
                  <CardDescription>
                    User authentication and session settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (Hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="168"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireEmailVerification">Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require email verification for new accounts
                      </p>
                    </div>
                    <Switch
                      id="requireEmailVerification"
                      checked={settings.security.requireEmailVerification}
                      onCheckedChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enforceStrongPasswords">Strong Passwords</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce strong password requirements
                      </p>
                    </div>
                    <Switch
                      id="enforceStrongPasswords"
                      checked={settings.security.enforceStrongPasswords}
                      onCheckedChange={(checked) => updateSetting('security', 'enforceStrongPasswords', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="mr-2 h-5 w-5" />
                    Advanced Security
                  </CardTitle>
                  <CardDescription>
                    Additional security features and controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable 2FA for admin accounts
                      </p>
                    </div>
                    <Switch
                      id="enableTwoFactor"
                      checked={settings.security.enableTwoFactor}
                      onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                    />
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Security Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>SSL Certificate</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Firewall</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Intrusion Detection</span>
                        <Badge variant="outline">Monitoring</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Settings Tab */}
          <TabsContent value="notifications">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    System Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure when and how to send notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send browser push notifications
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="adminAlerts">Admin Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical system alerts for admins
                      </p>
                    </div>
                    <Switch
                      id="adminAlerts"
                      checked={settings.notifications.adminAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'adminAlerts', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Alert Types
                  </CardTitle>
                  <CardDescription>
                    Specific events that trigger notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="userRegistrationAlert">New User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        When new users register
                      </p>
                    </div>
                    <Switch
                      id="userRegistrationAlert"
                      checked={settings.notifications.userRegistrationAlert}
                      onCheckedChange={(checked) => updateSetting('notifications', 'userRegistrationAlert', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="contentModerationAlert">Content Moderation</Label>
                      <p className="text-sm text-muted-foreground">
                        When content needs review
                      </p>
                    </div>
                    <Switch
                      id="contentModerationAlert"
                      checked={settings.notifications.contentModerationAlert}
                      onCheckedChange={(checked) => updateSetting('notifications', 'contentModerationAlert', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemHealthAlert">System Health</Label>
                      <p className="text-sm text-muted-foreground">
                        System performance issues
                      </p>
                    </div>
                    <Switch
                      id="systemHealthAlert"
                      checked={settings.notifications.systemHealthAlert}
                      onCheckedChange={(checked) => updateSetting('notifications', 'systemHealthAlert', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Settings Tab */}
          <TabsContent value="performance">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="mr-2 h-5 w-5" />
                    Caching & Storage
                  </CardTitle>
                  <CardDescription>
                    Performance optimization settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cacheDuration">Cache Duration (Seconds)</Label>
                    <Input
                      id="cacheDuration"
                      type="number"
                      min="60"
                      max="3600"
                      value={settings.performance.cacheDuration}
                      onChange={(e) => updateSetting('performance', 'cacheDuration', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableCompression">Data Compression</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable gzip compression
                      </p>
                    </div>
                    <Switch
                      id="enableCompression"
                      checked={settings.performance.enableCompression}
                      onCheckedChange={(checked) => updateSetting('performance', 'enableCompression', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableCDN">Content Delivery Network</Label>
                      <p className="text-sm text-muted-foreground">
                        Use CDN for static assets
                      </p>
                    </div>
                    <Switch
                      id="enableCDN"
                      checked={settings.performance.enableCDN}
                      onCheckedChange={(checked) => updateSetting('performance', 'enableCDN', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Rate Limiting
                  </CardTitle>
                  <CardDescription>
                    API usage limits and throttling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rateLimitRequests">Requests per Window</Label>
                    <Input
                      id="rateLimitRequests"
                      type="number"
                      min="10"
                      max="1000"
                      value={settings.performance.rateLimitRequests}
                      onChange={(e) => updateSetting('performance', 'rateLimitRequests', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="rateLimitWindow">Window Duration (Seconds)</Label>
                    <Input
                      id="rateLimitWindow"
                      type="number"
                      min="60"
                      max="3600"
                      value={settings.performance.rateLimitWindow}
                      onChange={(e) => updateSetting('performance', 'rateLimitWindow', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Current Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Response Time</span>
                        <span>120ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cache Hit Rate</span>
                        <span>85%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current Load</span>
                        <span>Low</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}