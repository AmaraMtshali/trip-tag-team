import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Bus, UserCheck, ArrowLeft, Users } from 'lucide-react';
import { getSession, updateMemberStatus } from '@/lib/session';
import { TripSession, Member } from '@/types/session';
import { useToast } from '@/hooks/use-toast';

const MemberCheckOut = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<TripSession | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

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

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
  };

  const handleConfirmPresence = async () => {
    if (!selectedMember || !sessionId) return;

    setIsConfirming(true);
    try {
      const success = updateMemberStatus(sessionId, selectedMember.id, 'present');
      if (success) {
        setConfirmed(true);
        toast({
          title: "Presence confirmed!",
          description: `${selectedMember.name} is marked as present for departure.`,
        });
      } else {
        toast({
          title: "Failed to update status",
          description: "Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
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

  if (confirmed && selectedMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-success/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-soft">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 relative">
              <div className="bg-success/10 rounded-full p-4 inline-block">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl text-success">Presence Confirmed!</CardTitle>
            <CardDescription>
              You are confirmed present for departure on <strong>{session.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-success" />
                <span className="font-medium">{selectedMember.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Status updated at {new Date(selectedMember.lastActivity).toLocaleTimeString()}
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Your presence has been recorded</p>
              <p>• The trip leader can see your updated status</p>
              <p>• Safe travels!</p>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-warning/5">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Bus className="h-12 w-12 text-warning" />
              <div className="absolute -top-1 -right-1 bg-warning rounded-full p-1">
                <UserCheck className="h-4 w-4 text-warning-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Check-Out Confirmation
          </h1>
          <p className="text-muted-foreground">
            {session.name}
          </p>
        </div>

        {!selectedMember ? (
          /* Member Selection */
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Your Name
              </CardTitle>
              <CardDescription>
                Choose your name from the list to confirm your presence for departure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {session.members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No members have joined this session yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {session.members.map((member) => (
                    <Button
                      key={member.id}
                      variant="outline"
                      className="w-full h-auto p-4 justify-start text-left"
                      onClick={() => handleMemberSelect(member)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Status: {member.status} • Joined: {new Date(member.joinedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              <div className="text-center pt-4">
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
        ) : (
          /* Confirmation */
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Confirm Your Presence</CardTitle>
              <CardDescription>
                Please confirm that you are present and ready for departure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-5 w-5 text-warning" />
                  <span className="font-medium">{selectedMember.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Current status: {selectedMember.status}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleConfirmPresence}
                  disabled={isConfirming}
                  variant="success"
                  size="mobile"
                  className="w-full"
                >
                  {isConfirming ? 'Confirming...' : 'Yes, I am Present'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setSelectedMember(null)}
                  className="w-full"
                >
                  Choose Different Name
                </Button>
              </div>

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
        )}

        {/* Trip Info */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Trip:</strong> {session.name}</p>
              <p><strong>Session ID:</strong> {session.id}</p>
              <p><strong>Members:</strong> {session.members.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberCheckOut;