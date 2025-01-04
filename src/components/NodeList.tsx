import { motion } from 'framer-motion';
import { Mail, Twitter, Building } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import type { UserNode, Partner } from '@/types';

export const NodeList = () => {
  const [selectedNode, setSelectedNode] = useState<UserNode | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    const handleNodeSelected = (event: CustomEvent) => {
      if (event.detail.userData) {
        setSelectedNode(event.detail.userData);
        setSelectedPartner(null);
      }
    };

    const handlePartnerSelected = (event: CustomEvent) => {
      if (event.detail.partner) {
        setSelectedPartner(event.detail.partner);
        setSelectedNode(null);
      }
    };

    window.addEventListener('nodeSelected', handleNodeSelected as EventListener);
    window.addEventListener('partnerSelected', handlePartnerSelected as EventListener);
    
    return () => {
      window.removeEventListener('nodeSelected', handleNodeSelected as EventListener);
      window.removeEventListener('partnerSelected', handlePartnerSelected as EventListener);
    };
  }, []);

  return (
    <div className="pointer-events-auto">
      <motion.div
        className="glass-panel p-4 space-y-4 max-h-[calc(100vh-2rem)] overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-lg font-semibold">AI Agents Waterloo & Global Network</h2>
        </div>
        
        <div className="space-y-4">
          {selectedNode && (
            <Card className="bg-[#0A0A0A] border-0 text-white">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4 bg-gray-700">
                  <AvatarFallback>{selectedNode.name[0]}</AvatarFallback>
                </Avatar>
                
                <h3 className="text-2xl font-semibold mb-1">{selectedNode.name}</h3>
                <p className="text-gray-400 mb-2">Hacker/Builder</p>

                <div className="w-full mb-6">
                  <div className="bg-[#18181B]/80 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-left">Team Status</p>
                      <Badge variant="secondary" className="bg-[#1a4731] text-[#D3E4FD] border-0 rounded-md px-3 py-1 hover:bg-[#1a4731]">
                        {selectedNode.status || 'Looking for team'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedNode.email && (
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Mail className="h-4 w-4" />
                        <span>{selectedNode.email}</span>
                      </div>
                    )}
                    {selectedNode.location && (
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Building className="h-4 w-4" />
                        <span>{selectedNode.location}</span>
                      </div>
                    )}
                    {selectedNode.twitter && (
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Twitter className="h-4 w-4" />
                        <span>@{selectedNode.twitter}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedPartner && (
            <Card className="bg-[#0A0A0A] border-0 text-white">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 glass-panel flex items-center justify-center mb-4">
                  {selectedPartner.image ? (
                    <img 
                      src={selectedPartner.image} 
                      alt={selectedPartner.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Building className="h-8 w-8 text-primary/50" />
                  )}
                </div>
                
                <h3 className="text-2xl font-semibold mb-1">{selectedPartner.name}</h3>
                <p className="text-gray-400 mb-6">Partner</p>

                <div className="w-full mb-6">
                  {selectedPartner.twitter && (
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Twitter className="h-4 w-4" />
                      <a 
                        href={selectedPartner.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        Follow on Twitter
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedNode && !selectedPartner && (
            <div className="text-sm text-gray-400">
              Click on a node in the globe or a partner logo to view details
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
