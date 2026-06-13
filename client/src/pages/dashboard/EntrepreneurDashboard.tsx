import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest } from '../../types';
import { getRequestsForEntrepreneur } from '../../data/collaborationRequests';
import { investors } from '../../data/users';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedInvestors] = useState(investors.slice(0, 3));

  useEffect(() => {
    if (user) {
      setCollaborationRequests(getRequestsForEntrepreneur(user.id));
    }
  }, [user]);

  const handleRequestStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setCollaborationRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status } : req)));
  };

  if (!user) return null;

  const pendingRequests = collaborationRequests.filter((req) => req.status === 'pending');
  const acceptedCount = collaborationRequests.filter((req) => req.status === 'accepted').length;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-muted">Here's what's happening with your startup today.</p>
        </div>
        <Link to="/investors">
          <Button leftIcon={<PlusCircle size={18} />}>Find Investors</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="primary" icon={<Bell size={20} />} label="Pending Requests" value={pendingRequests.length} />
        <StatCard tone="secondary" icon={<Users size={20} />} label="Total Connections" value={acceptedCount} />
        <StatCard tone="accent" icon={<Calendar size={20} />} label="Upcoming Meetings" value={2} />
        <StatCard tone="success" icon={<TrendingUp size={20} />} label="Profile Views" value={24} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Collaboration Requests</h2>
              <Badge variant="primary" rounded>
                {pendingRequests.length} pending
              </Badge>
            </CardHeader>
            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map((request) => (
                    <CollaborationRequestCard
                      key={request.id}
                      request={request}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<AlertCircle size={24} />}
                  title="No collaboration requests yet"
                  description="When investors are interested in your startup, their requests will appear here."
                />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Recommended Investors</h2>
              <Link to="/investors" className="text-sm font-medium text-primary-700 hover:text-primary-800">
                View all
              </Link>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendedInvestors.map((investor) => (
                <InvestorCard key={investor.id} investor={investor} showActions={false} />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
