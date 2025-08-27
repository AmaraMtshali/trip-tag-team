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
  Download
} from 'lucide-react';
import { getSession, getMemberStats } from '@/lib/session';
import { TripSession } from '@/types/session';
import { useToast } from '@/hooks/use-toast';

const LeaderDashboard = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<TripSession | null>(null);
  const [showCheckOutQR, setShowCheckOutQR] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    loadSession();
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(loadSession, 10000);
    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  const loadSession = () => {
    if (!sessionId) return;
    
    const currentSession = getSession(sessionId);
    if (!currentSession) {
      toast({
        title: "Session not found",
        description: "This session may have expired or doesn't exist.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    setSession(currentSession);
    setLastRefresh(new Date());
  };

  const handleRefresh = () => {
    loadSession();
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

  const handleDownloadCSV = () => {
    if (!session) return;

    const header = ['Name', 'Role'];
    const rows = session.members.map((member) => [member.name, member.role === 'leader' ? 'Leader' : 'Member']);
    const csv = [header, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `members-${session.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  const stats = getMemberStats(session);
  const currentQRUrl = showCheckOutQR ? session.checkOutUrl : session.checkInUrl;

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
                Session ID: {session.id}
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
        {session.leaderName && (
          <div className="mb-4 text-sm text-muted-foreground">
            Leader: <span className="font-medium text-foreground">{session.leaderName}</span>
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

          {/* Member List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({stats.present}/{stats.total})
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
                Real-time attendance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No members have joined yet</p>
                  <p className="text-sm">Share the QR code to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {session.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined: {new Date(member.joinedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <StatusBadge status={member.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div>Created: {new Date(session.createdAt).toLocaleString()}</div>
              <div>Expires: {new Date(session.expiresAt).toLocaleString()}</div>
              <div>Last updated: {lastRefresh.toLocaleTimeString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderDashboard;