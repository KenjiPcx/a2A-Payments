import { motion } from "framer-motion";
import { GlobeVisualization } from "../components/GlobeVisualization";
import { Stats } from "../components/Stats";
import { NodeList } from "../components/NodeList";
import { Partners } from "../components/Partners";
import { useState, useEffect, memo, useRef } from "react";
import type { UserNode, Partner } from "@/types";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/api/users";
import { useChat } from "ai/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const MemoizedGlobeVisualization = memo(GlobeVisualization);

type ChatAnnotation = {
  type: string;
  data: {
    title?: string;
    nodes?: Array<{
      metadata: UserNode;
      score: number;
    }>;
  };
};

const Index = () => {
  const { data: userNodes } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const handlePartnerClick = (partner: Partner) => {
    const event = new CustomEvent("partnerSelected", {
      detail: { partner },
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "luma-checkout";
    script.src = "https://embed.lu.ma/checkout-button.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById("luma-checkout");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
  } = useChat({
    api: `${import.meta.env.VITE_API_URL}/api/chat`,
    onError: (error) => {
      console.error("Chat error:", error);
      alert("Failed to get response from chat");
    },
    experimental_throttle: 1000,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setShowChat(true);
    originalHandleSubmit(e);
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const handleUserCardClick = (user: UserNode) => {
    const event = new CustomEvent("focusLocation", {
      detail: {
        latitude: user.coordinates?.latitude,
        longitude: user.coordinates?.longitude,
      },
    });
    window.dispatchEvent(event);

    const nodeEvent = new CustomEvent("nodeSelected", {
      detail: { userData: user },
    });
    window.dispatchEvent(nodeEvent);
  };

  const renderChatMessage = (message: any) => {
    if (message.role === "assistant") {
      return (
        <div className="space-y-4">
          {message.annotations?.map(
            (annotation: ChatAnnotation, index: number) => (
              <div key={index} className="space-y-2">
                {annotation.type === "sources" && annotation.data.nodes && (
                  <div className="grid grid-cols-1 gap-2">
                    {annotation.data.nodes.map((node, nodeIndex) => (
                      <Card
                        key={nodeIndex}
                        className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => handleUserCardClick(node.metadata)}
                      >
                        <CardContent className="p-4 flex flex-col space-y-3">
                          {/* User info row */}
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={node.metadata.profile_image_url}
                              />
                              <AvatarFallback>
                                {node.metadata.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {node.metadata.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {node.metadata.location}
                              </p>
                            </div>
                            <div className="text-xs text-gray-400">
                              Score: {Math.round(node.score * 100)}%
                            </div>
                          </div>

                          {/* Skills row */}
                          {node.metadata.skills &&
                            node.metadata.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {node.metadata.skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/80"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
          <div className="text-sm">{message.content}</div>
        </div>
      );
    }
    return message.content;
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [isGlobeRotating, setIsGlobeRotating] = useState(true);

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen relative w-full overflow-hidden">
      {/* Globe Background */}
      <div className="fixed sm:inset-0 top-[6rem] sm:top-0 bottom-0 w-full">
        <MemoizedGlobeVisualization
          userNodes={userNodes}
          isRotating={isGlobeRotating}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 w-full">
        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 w-full">
            {/* Left Column - Title and Stats */}
            <div className="relative text-center sm:text-left mb-6 sm:mb-0">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold font-['Jura'] flex items-center gap-2 justify-center sm:justify-start"
              >
                Agent to Agent Payment$ hackathon
                <span className="hidden sm:flex items-center gap-2">💰</span>
              </motion.h1>

              {/* Stats Section - Hidden on mobile */}
              <div className="absolute left-0 top-16 hidden sm:block">
                <Stats builderSignups={userNodes?.length || 0} />
                <div className="mt-4 w-[600px]">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Search for users..."
                      className="flex h-10 w-3/5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      Ask
                    </button>
                  </form>

                  {/* Show chat history button when messages exist but chat is hidden */}
                  {!showChat && messages.length > 0 && (
                    <button
                      onClick={() => setShowChat(true)}
                      className="mt-2 text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      Show previous chat ({messages.length} messages)
                    </button>
                  )}

                  {/* Chat messages panel */}
                  {showChat && messages.length > 0 && (
                    <div className="relative mt-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-gray-400 hover:text-white z-10"
                        onClick={() => setShowChat(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div
                        ref={chatContainerRef}
                        className="rounded-md bg-white/10 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-transparent"
                      >
                        <div className="p-4 space-y-4">
                          {messages.map((message, index) => (
                            <div key={index} className="space-y-2">
                              <div className="text-xs font-medium text-gray-400">
                                {message.role === "user" ? "You" : "Assistant"}:
                              </div>
                              {renderChatMessage(message)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Register Button and NodeList */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto">
              <p className="text-sm font-light tracking-wider text-white/40 uppercase hidden sm:block">
                BRILLIANCE IS FORGED BY CONSTRAINTS
              </p>
              <div className="relative w-full sm:w-auto flex flex-col items-center">
                <a
                  href="https://lu.ma/event/evt-Z8RgiDZTMQGHzNC"
                  className="luma-checkout--button !bg-[#FFD700] hover:!bg-[#FFD700]/90 !text-black inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                  data-luma-action="checkout"
                >
                  Register for Event
                </a>

                {/* Node List - Mobile: Bottom fixed, Desktop: Under register button */}
                <div className="fixed sm:absolute bottom-0 sm:bottom-auto left-0 sm:left-auto right-0 sm:right-0 sm:top-16 w-full sm:w-[400px] p-4 sm:p-0">
                  <NodeList setIsRotating={setIsGlobeRotating} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section - Fixed at bottom */}
      <Partners onPartnerClick={handlePartnerClick} />
    </div>
  );
};

export default Index;
