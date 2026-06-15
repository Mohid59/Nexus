import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign, Send } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { createCollaborationRequest, getRequestsFromInvestor } from '../../data/collaborationRequests';
import { Entrepreneur } from '../../types';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/users/${id}`)
      .then(({ data }) => {
        if (!active) return;
        const u = data.user;
        if (u.role !== 'entrepreneur') {
          setEntrepreneur(null);
          return;
        }
        setEntrepreneur({
          ...u,
          startupName: u.startupName ?? 'Unnamed startup',
          pitchSummary: u.pitchSummary ?? '',
          fundingNeeded: u.fundingNeeded ?? 'N/A',
          industry: u.industry ?? 'N/A',
          location: u.location ?? 'N/A',
          foundedYear: u.foundedYear ?? 0,
          teamSize: u.teamSize ?? 0,
        });
      })
      .catch(() => {
        if (active) setEntrepreneur(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (!entrepreneur) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-ink">Entrepreneur not found</h2>
        <p className="text-muted mt-2">The entrepreneur profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/investor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  
  const isCurrentUser = currentUser?.id === entrepreneur.id;
  const isInvestor = currentUser?.role === 'investor';
  
  // Check if the current investor has already sent a request to this entrepreneur
  const hasRequestedCollaboration = isInvestor && id 
    ? getRequestsFromInvestor(currentUser.id).some(req => req.entrepreneurId === id)
    : false;
  
  const handleSendRequest = () => {
    if (isInvestor && currentUser && id) {
      createCollaborationRequest(
        currentUser.id,
        id,
        `I'm interested in learning more about ${entrepreneur.startupName} and would like to explore potential investment opportunities.`
      );
      
      // In a real app, we would refresh the data or update state
      // For this demo, we'll force a page reload
      window.location.reload();
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={entrepreneur.avatarUrl}
              alt={entrepreneur.name}
              size="xl"
              status={entrepreneur.isOnline ? 'online' : 'offline'}
              className="mx-auto sm:mx-0"
            />
            
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-ink">{entrepreneur.name}</h1>
              <p className="text-muted flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Founder at {entrepreneur.startupName}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">{entrepreneur.industry}</Badge>
                <Badge variant="gray">
                  <MapPin size={14} className="mr-1" />
                  {entrepreneur.location}
                </Badge>
                <Badge variant="accent">
                  <Calendar size={14} className="mr-1" />
                  Founded {entrepreneur.foundedYear}
                </Badge>
                <Badge variant="secondary">
                  <Users size={14} className="mr-1" />
                  {entrepreneur.teamSize} team members
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/chat/${entrepreneur.id}`}>
                  <Button
                    variant="outline"
                    leftIcon={<MessageCircle size={18} />}
                  >
                    Message
                  </Button>
                </Link>
                
                {isInvestor && (
                  <Button
                    leftIcon={<Send size={18} />}
                    disabled={hasRequestedCollaboration}
                    onClick={handleSendRequest}
                  >
                    {hasRequestedCollaboration ? 'Request Sent' : 'Request Collaboration'}
                  </Button>
                )}
              </>
            )}
            
            {isCurrentUser && (
              <Button
                variant="outline"
                leftIcon={<UserCircle size={18} />}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-ink">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-ink">{entrepreneur.bio}</p>
            </CardBody>
          </Card>
          
          {/* Startup Description */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-ink">Startup Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-ink">Problem Statement</h3>
                  <p className="text-ink mt-1">
                    {entrepreneur?.pitchSummary?.split('.')[0]}.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-ink">Solution</h3>
                  <p className="text-ink mt-1">
                    {entrepreneur.pitchSummary}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-ink">Market Opportunity</h3>
                  <p className="text-ink mt-1">
                    The {entrepreneur.industry} market is experiencing significant growth, with a projected CAGR of 14.5% through 2027. Our solution addresses key pain points in this expanding market.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-ink">Competitive Advantage</h3>
                  <p className="text-ink mt-1">
                    Unlike our competitors, we offer a unique approach that combines innovative technology with deep industry expertise, resulting in superior outcomes for our customers.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Team */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-ink">Team</h2>
              <span className="text-sm text-muted">{entrepreneur.teamSize} members</span>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-3 border border-line rounded-md">
                  <Avatar
                    src={entrepreneur.avatarUrl}
                    alt={entrepreneur.name}
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-ink">{entrepreneur.name}</h3>
                    <p className="text-xs text-muted">Founder & CEO</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border border-line rounded-md">
                  <Avatar
                    src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                    alt="Team Member"
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-ink">Alex Johnson</h3>
                    <p className="text-xs text-muted">CTO</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border border-line rounded-md">
                  <Avatar
                    src="https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg"
                    alt="Team Member"
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-ink">Jessica Chen</h3>
                    <p className="text-xs text-muted">Head of Product</p>
                  </div>
                </div>
                
                {entrepreneur.teamSize > 3 && (
                  <div className="flex items-center justify-center p-3 border border-dashed border-line rounded-md">
                    <p className="text-sm text-muted">+ {entrepreneur.teamSize - 3} more team members</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Funding Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-ink">Funding</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted">Current Round</span>
                  <div className="flex items-center mt-1">
                    <DollarSign size={18} className="text-accent-600 mr-1" />
                    <p className="text-lg font-semibold text-ink">{entrepreneur.fundingNeeded}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted">Valuation</span>
                  <p className="text-md font-medium text-ink">$8M - $12M</p>
                </div>
                
                <div>
                  <span className="text-sm text-muted">Previous Funding</span>
                  <p className="text-md font-medium text-ink">$750K Seed (2022)</p>
                </div>
                
                <div className="pt-3 border-t border-line">
                  <span className="text-sm text-muted">Funding Timeline</span>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Pre-seed</span>
                      <span className="text-xs bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500 px-2 py-0.5 rounded-full">Completed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Seed</span>
                      <span className="text-xs bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500 px-2 py-0.5 rounded-full">Completed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Series A</span>
                      <span className="text-xs bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-500 px-2 py-0.5 rounded-full">In Progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Documents */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-ink">Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center p-3 border border-line rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-md mr-3">
                    <FileText size={18} className="text-primary-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-ink">Pitch Deck</h3>
                    <p className="text-xs text-muted">Updated 2 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                
                <div className="flex items-center p-3 border border-line rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-md mr-3">
                    <FileText size={18} className="text-primary-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-ink">Business Plan</h3>
                    <p className="text-xs text-muted">Updated 1 month ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                
                <div className="flex items-center p-3 border border-line rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-md mr-3">
                    <FileText size={18} className="text-primary-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-ink">Financial Projections</h3>
                    <p className="text-xs text-muted">Updated 2 weeks ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
              
              {!isCurrentUser && isInvestor && (
                <div className="mt-4 pt-4 border-t border-line">
                  <p className="text-sm text-muted">
                    Request access to detailed documents and financials by sending a collaboration request.
                  </p>
                  
                  {!hasRequestedCollaboration ? (
                    <Button
                      className="mt-3 w-full"
                      onClick={handleSendRequest}
                    >
                      Request Collaboration
                    </Button>
                  ) : (
                    <Button
                      className="mt-3 w-full"
                      disabled
                    >
                      Request Sent
                    </Button>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};