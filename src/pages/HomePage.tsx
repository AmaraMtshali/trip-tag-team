import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Bus, Users, QrCode, CheckCircle, Mail } from 'lucide-react';
import { createSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const [tripName, setTripName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateSession = async () => {
    if (!tripName.trim()) {
      toast({
        title: "Trip name required",
        description: "Please enter a name for your trip session.",
        variant: "destructive"
      });
      return;
    }
    if (!leaderName.trim()) {
      toast({
        title: "Leader name required",
        description: "Please enter your name so members know who created this trip.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const session = createSession(tripName.trim(), leaderName.trim());
      toast({
        title: "Trip session created!",
        description: `Session "${session.name}" is ready for check-ins.`,
      });
      navigate(`/leader/${session.id}`);
    } catch (error) {
      toast({
        title: "Error creating session",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Bus className="h-16 w-16 text-primary" />
              <div className="absolute -top-2 -right-2 bg-success rounded-full p-1">
                <CheckCircle className="h-6 w-6 text-success-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
            Bus Buddy
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Simple, mobile-friendly group attendance tracking for trips and events using QR codes
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-soft transition-shadow">
            <CardHeader>
              <QrCode className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">QR Code Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Members scan QR codes to quickly check in and out
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-soft transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Real-time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Live updates of who's present, missing, or checked in
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-soft transition-shadow">
            <CardHeader>
              <Bus className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Trip Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Perfect for bus trips, events, and group outings
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Create Session Card */}
        <Card className="max-w-lg mx-auto shadow-soft">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create New Trip Session</CardTitle>
            <CardDescription>
              Start tracking attendance for your group trip or event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trip-name">Trip Name</Label>
              <Input
                id="trip-name"
                type="text"
                placeholder="e.g., Soccer Game Bus, Museum Field Trip"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader-name">Your Name (Leader)</Label>
              <Input
                id="leader-name"
                type="text"
                placeholder="e.g., Jane Doe"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            
            <Button
              onClick={handleCreateSession}
              disabled={isCreating}
              variant="hero"
              size="mobile"
              className="w-full"
            >
              {isCreating ? 'Creating Session...' : 'Create Trip Session'}
            </Button>

            <div className="text-sm text-muted-foreground text-center space-y-1">
              <p>• Sessions automatically expire after 24 hours</p>
              <p>• Supports up to 100 members</p>
              <p>• No accounts required</p>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1. Create a trip session with a descriptive name</p>
                <p>2. Share the QR code or link with your group members</p>
                <p>3. Members scan to check in and confirm their presence</p>
                <p>4. Track attendance in real-time from your leader dashboard</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Link */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Need help? Have questions about Bus Buddy?
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/contact-us')}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;