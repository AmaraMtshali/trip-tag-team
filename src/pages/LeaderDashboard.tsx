import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeComponent } from '@/components/ui/qr-code';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Users, 
  RefreshCw, 
  QrCode, 
  ExternalLink, 
  UserCheck, 
  UserX,
  Clock,
  ArrowLeft,
  Download,
  Phone,
  Copy
} from 'lucide-react';
import { apiService, Session, Member } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const LeaderDashboard = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCheckOutQR, setShowCheckOutQR] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    loadSessionData();
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(loadSessionData, 10000);
    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  const loadSessionData = async () => {
    if (!sessionId) return;
    
    try {
      const { session: currentSession, members: sessionMembers } = await apiService.getSessionWithMembers(sessionId);
      setSession(currentSession);
      setMembers(sessionMembers);
      setLastRefresh(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading session data:', error);
      toast({
        title: "Session not found",
        description: "This session may have expired or doesn't exist.",
        variant: "destructive"
      });
      navigate('/');
    }
  };

  const handleRefresh = () => {
    loadSessionData();
    toast({
      title: "Refreshed",
      description: "Member list updated successfully.",
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const copyPhoneNumber = async (phoneNumber: string, memberName: string) => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      toast({
        title: "Phone number copied!",
        description: `${memberName}'s phone number copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the phone number manually.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadCSV = () => {
    if (!session || !members.length) return;

    const header = ['Name','Role','Phone Number','Presence Status','Timestamp'];
    const rows = members.map((member) => [
      member.name, 
      member.role === 'leader' ? 'Leader' : 'Member', 
      member.phone_number || 'N/A',
      member.status === 'present' ? 'Present' : 'Missing',
      new Date(member.joined_at).toLocaleString()
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `members-${session.short_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Session not found</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: members.length,
    present: members.filter(m => m.status === 'present').length,
    missing: members.filter(m => m.status === 'missing').length
  };

  // Generate QR URLs
  const baseUrl = window.location.origin;
  const checkInUrl = `${baseUrl}/join/${session.short_id}`;
  const checkOutUrl = `${baseUrl}/checkout/${session.short_id}`;
  const currentQRUrl = showCheckOutQR ? checkOutUrl : checkInUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="md:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {session.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Session ID: {session.short_id}
              </p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
        {session.leader_name && (
          <div className="mb-4 text-sm text-muted-foreground">
            Leader: <span className="font-medium text-foreground">{session.leader_name}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Members</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck className="h-6 w-6 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">{stats.present}</div>
              <div className="text-xs text-muted-foreground">Present</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <UserX className="h-6 w-6 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">{stats.missing}</div>
              <div className="text-xs text-muted-foreground">Missing</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm font-medium">
                {lastRefresh.toLocaleTimeString()}
              </div>
              <div className="text-xs text-muted-foreground">Last Updated</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5" />
                {showCheckOutQR ? 'Check-Out QR Code' : 'Check-In QR Code'}
              </CardTitle>
              <CardDescription>
                {showCheckOutQR 
                  ? 'Members scan this to confirm their presence for departure'
                  : 'Members scan this QR code or visit the link to join'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QRCodeComponent value={currentQRUrl || ''} size={250} />
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant={showCheckOutQR ? "outline" : "default"}
                    size="sm"
                    onClick={() => setShowCheckOutQR(false)}
                    className="flex-1"
                  >
                    Check-In QR
                  </Button>
                  <Button
                    variant={showCheckOutQR ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowCheckOutQR(true)}
                    className="flex-1"
                  >
                    Check-Out QR
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(currentQRUrl || '', 'Link')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  
                  <div className="p-2 bg-muted rounded text-xs break-all">
                    {currentQRUrl}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Lists */}
          <div className="space-y-6">
            {/* Present Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-success">
                    <UserCheck className="h-5 w-5" />
                    Present Members ({stats.present})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadCSV}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefresh}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Members who have checked in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {members.filter(member => member.status === 'present').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No members are present yet</p>
                    <p className="text-sm">Share the QR code to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {members
                      .filter(member => member.status === 'present')
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors bg-success/5 border-success/20"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Joined: {new Date(member.joined_at).toLocaleTimeString()}
                            </div>
                            {member.phone_number && (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{member.phone_number}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={() => copyPhoneNumber(member.phone_number!, member.name)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <StatusBadge status={member.status} />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Missing Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <UserX className="h-5 w-5" />
                  Missing Members ({stats.missing})
                </CardTitle>
                <CardDescription>
                  Members who haven't checked in yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {members.filter(member => member.status === 'missing').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>All members are present!</p>
                    <p className="text-sm">Great job getting everyone checked in</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {members
                      .filter(member => member.status === 'missing')
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors bg-destructive/5 border-destructive/20"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Role: {member.role === 'leader' ? 'Leader' : 'Member'}
                            </div>
                            {member.phone_number && (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{member.phone_number}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={() => copyPhoneNumber(member.phone_number!, member.name)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <StatusBadge status={member.status} />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Session Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div>Created: {new Date(session.created_at).toLocaleString()}</div>
              <div>Expires: {new Date(session.expires_at).toLocaleString()}</div>
              <div>Last updated: {lastRefresh.toLocaleTimeString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderDashboard;