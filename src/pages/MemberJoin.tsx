import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, Bus, UserCheck, ArrowLeft } from 'lucide-react';
import { getSession, addMember } from '@/lib/session';
import { TripSession, Member } from '@/types/session';
import { useToast } from '@/hooks/use-toast';

const MemberJoin = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<TripSession | null>(null);
  const [memberName, setMemberName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinedMember, setJoinedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

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
  }, [sessionId, navigate, toast]);

  const handleJoin = async () => {
    if (!memberName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name or identifier.",
        variant: "destructive"
      });
      return;
    }

    if (!sessionId) return;

    setIsJoining(true);
    try {
      const member = addMember(sessionId, memberName.trim());
      if (member) {
        setJoinedMember(member);
        toast({
          title: "Successfully checked in!",
          description: `Welcome to ${session?.name}`,
        });
      } else {
        toast({
          title: "Failed to join",
          description: "Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error joining session",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
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

  if (joinedMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-success/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-soft">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 relative">
              <div className="bg-success/10 rounded-full p-4 inline-block">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl text-success">Check-in Successful!</CardTitle>
            <CardDescription>
              You are now checked in for <strong>{session.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-success" />
                <span className="font-medium">{joinedMember.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Joined at {new Date(joinedMember.joinedAt).toLocaleTimeString()}
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Keep this page bookmarked for easy access</p>
              <p>• Scan the check-out QR when departing</p>
              <p>• Your attendance is being tracked in real-time</p>
            </div>

            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Bus className="h-12 w-12 text-primary" />
              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                <UserCheck className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Join Trip Session
          </h1>
          <p className="text-muted-foreground">
            {session.name}
          </p>
        </div>

        {/* Join Form */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Check In</CardTitle>
            <CardDescription>
              Enter your name or identifier to join this trip session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Your Name or Identifier</Label>
              <Input
                id="member-name"
                type="text"
                placeholder="e.g., John Doe, Seat 12, Team Captain"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="h-12 text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>

            <Button
              onClick={handleJoin}
              disabled={isJoining}
              variant="success"
              size="mobile"
              className="w-full"
            >
              {isJoining ? 'Checking In...' : 'Check In to Trip'}
            </Button>

            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trip Info */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Trip:</strong> {session.name}</p>
              <p><strong>Session ID:</strong> {session.id}</p>
              <p><strong>Created:</strong> {new Date(session.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberJoin;