import { AnimatePresence, motion } from "framer-motion";
import { Mail, Twitter, Building, Linkedin, X } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import type { UserNode, Partner } from "@/types";
import { Button } from "./ui/button";

// Helper function to extract usernames (can be moved to utils)
const extractTwitterUsername = (url: string): string => {
  return url.split("/").pop() || url;
};

const extractLinkedInUsername = (url: string): string => {
  try {
    // Remove any query parameters
    const urlWithoutParams = url.split("?")[0];

    // Remove trailing slashes
    const cleanUrl = urlWithoutParams.replace(/\/+$/, "");

    // Split by '/' and get the last non-empty part
    const parts = cleanUrl.split("/").filter(Boolean);

    // Get the last part (username)
    const username = parts[parts.length - 1];

    // Remove 'in' if the URL is in format linkedin.com/in/username
    return username.replace(/^in\//, "");
  } catch (e) {
    // If any error occurs, return the original url
    return url;
  }
};

interface NodeListProps {
  setIsRotating: (isRotating: boolean) => void;
}

export const NodeList = ({ setIsRotating }: NodeListProps) => {
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

    window.addEventListener(
      "nodeSelected",
      handleNodeSelected as EventListener
    );
    window.addEventListener(
      "partnerSelected",
      handlePartnerSelected as EventListener
    );

    return () => {
      window.removeEventListener(
        "nodeSelected",
        handleNodeSelected as EventListener
      );
      window.removeEventListener(
        "partnerSelected",
        handlePartnerSelected as EventListener
      );
    };
  }, []);

  const handleClose = () => {
    setSelectedNode(null);
    setSelectedPartner(null);
    setIsRotating(true);
  };

  return (
    <div className="pointer-events-auto">
      <AnimatePresence>
        {(selectedNode || selectedPartner) && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Card */}
            <motion.div
              className="glass-panel p-4 space-y-4 max-h-[calc(100vh-2rem)] overflow-hidden relative z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center mb-4">
                <h2 className="text-lg font-semibold">
                  AI Agents Waterloo & Global Network
                </h2>
              </div>

              <div className="space-y-4">
                {selectedNode && (
                  <Card className="bg-[#0A0A0A] border-0 text-white">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-4 bg-gray-700">
                        <AvatarImage src={selectedNode.profile_image_url} />
                        <AvatarFallback>{selectedNode.name[0]}</AvatarFallback>
                      </Avatar>

                      <h3 className="text-2xl font-semibold mb-1">
                        {selectedNode.name}
                      </h3>
                      <p className="text-gray-400 mb-2">Hacker/Builder</p>

                      <div className="w-full mb-6">
                        <div className="bg-[#18181B]/80 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-left">
                              Team Status
                            </p>
                            <Badge
                              variant="secondary"
                              className="bg-[#1a4731] text-[#D3E4FD] border-0 rounded-md px-3 py-1 hover:bg-[#1a4731]"
                            >
                              {"Looking for team"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {selectedNode.x_account && (
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                              <Twitter className="h-4 w-4" />
                              <a
                                href={`https://twitter.com/${extractTwitterUsername(
                                  selectedNode.x_account
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 transition-colors"
                              >
                                @
                                {extractTwitterUsername(selectedNode.x_account)}
                              </a>
                            </div>
                          )}
                          {selectedNode.linkedin_url && (
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                              <Linkedin className="h-4 w-4" />
                              <a
                                href={selectedNode.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 transition-colors"
                              >
                                {extractLinkedInUsername(
                                  selectedNode.linkedin_url
                                )}
                              </a>
                            </div>
                          )}

                          {selectedNode.highlights &&
                            selectedNode.highlights.length > 0 && (
                              <div className="mt-4">
                                <p className="text-gray-400 mb-2">Highlights</p>
                                <ul className="space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-transparent pr-4">
                                  {selectedNode.highlights.map(
                                    (highlight, index) => (
                                      <li
                                        key={index}
                                        className="text-sm text-gray-300 flex items-start"
                                      >
                                        <span className="text-gray-500 mr-2 mt-1">
                                          •
                                        </span>
                                        <span>{highlight}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {selectedNode.location && (
                            <div className="mt-5 flex items-center justify-center gap-2 text-gray-400">
                              <Building className="h-4 w-4" />
                              <span>{selectedNode.location}</span>
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

                      <h3 className="text-2xl font-semibold mb-1">
                        {selectedPartner.name}
                      </h3>
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
              </div>
            </motion.div>
          </>
        )}

        {!selectedNode && !selectedPartner && (
          <motion.div
            className="text-sm text-gray-400 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Click on a node in the globe or a partner logo to view details
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
