import { motion } from "motion/react";
import { Users, MessageSquare, ThumbsUp, Share2, Award, TrendingUp, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// TODO: Replace with your database queries
const discussions = [
  {
    id: 1,
    author: "Rajesh Kumar",
    avatar: "",
    title: "Best practices for organic wheat farming?",
    excerpt: "I'm transitioning to organic farming. Looking for advice on natural pest control and fertilizers...",
    category: "Organic Farming",
    replies: 24,
    likes: 45,
    time: "2 hours ago",
    trending: true,
  },
  {
    id: 2,
    author: "Priya Sharma",
    avatar: "",
    title: "Drip irrigation system - Worth the investment?",
    excerpt: "Considering installing drip irrigation for my 10-acre farm. What are your experiences?",
    category: "Irrigation",
    replies: 18,
    likes: 32,
    time: "5 hours ago",
    trending: false,
  },
  {
    id: 3,
    author: "Suresh Patel",
    avatar: "",
    title: "Dealing with unexpected frost damage",
    excerpt: "My tomato crop got affected by sudden frost last night. Any tips for damage control?",
    category: "Crop Protection",
    replies: 31,
    likes: 56,
    time: "1 day ago",
    trending: true,
  },
  {
    id: 4,
    author: "Meena Devi",
    avatar: "",
    title: "Soil testing lab recommendations near Punjab",
    excerpt: "Looking for reliable and affordable soil testing facilities. Please share your experiences...",
    category: "Soil Health",
    replies: 12,
    likes: 28,
    time: "2 days ago",
    trending: false,
  },
];

// TODO: Replace with your database queries
const successStories = [
  {
    name: "Ramesh Verma",
    location: "Haryana",
    title: "Doubled yield with precision farming",
    description: "Implemented IoT sensors and data analytics to optimize water usage and fertilizer application.",
    achievement: "+120% yield increase",
    image: "https://images.unsplash.com/photo-1754106005357-2095d15fb965?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGZhcm0lMjBjcm9wc3xlbnwxfHx8fDE3NjEyMTI0NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Anita Singh",
    location: "Maharashtra",
    title: "Organic farming success in 3 years",
    description: "Transitioned entire 20-acre farm to organic, now exporting to premium markets.",
    achievement: "+80% profit margin",
    image: "https://images.unsplash.com/photo-1645003299451-d3f951b924a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50cyUyMGZpZWxkfGVufDF8fHx8MTc2MTIxMjQ3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

// TODO: Replace with your database queries
const topContributors = [
  { name: "Dr. Amit Joshi", expertise: "Agricultural Scientist", contributions: 156, badge: "Expert" },
  { name: "Kavita Reddy", expertise: "Organic Farming", contributions: 142, badge: "Pro" },
  { name: "Vikram Rao", expertise: "Irrigation Systems", contributions: 128, badge: "Pro" },
  { name: "Sanjay Gupta", expertise: "Crop Protection", contributions: 98, badge: "Helper" },
];

// TODO: Replace with your database queries
const localMarkets = [
  { name: "Kharif Mandi", location: "15 km away", type: "Wholesale", status: "Open" },
  { name: "Organic Farmers Market", location: "8 km away", type: "Retail", status: "Open" },
  { name: "District Krishi Mandi", location: "22 km away", type: "Wholesale", status: "Closed" },
];

export function FarmerCommunity() {
  // TODO: Add useEffect hooks to fetch data from your database
  // TODO: Add real-time subscription for new discussions/posts
  // TODO: Implement post creation, likes, and comments functionality
  // TODO: Add user authentication and profile management

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">Community Hub</h1>
            <p className="text-muted-foreground">
              Connect with fellow farmers, share knowledge, and grow together
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Discussion
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search discussions, topics, or members..."
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="discussions" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="success">Success Stories</TabsTrigger>
            <TabsTrigger value="connect">Connect</TabsTrigger>
          </TabsList>

          {/* Discussions Tab */}
          <TabsContent value="discussions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {discussions.map((discussion, index) => (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={discussion.avatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {discussion.author.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4>{discussion.title}</h4>
                                  {discussion.trending && (
                                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Trending
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  by {discussion.author} • {discussion.time}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {discussion.excerpt}
                            </p>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{discussion.category}</Badge>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                  <MessageSquare className="h-4 w-4" />
                                  {discussion.replies}
                                </button>
                                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                  <ThumbsUp className="h-4 w-4" />
                                  {discussion.likes}
                                </button>
                                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                  <Share2 className="h-4 w-4" />
                                  Share
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                <Button variant="outline" className="w-full">
                  Load More Discussions
                </Button>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Top Contributors */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-accent" />
                        <CardTitle>Top Contributors</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {topContributors.map((contributor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {contributor.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm">{contributor.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {contributor.expertise}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              contributor.badge === "Expert"
                                ? "bg-accent/10 text-accent-foreground border-accent/20"
                                : "bg-primary/10 text-primary border-primary/20"
                            }
                          >
                            {contributor.badge}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Popular Topics */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          Organic Farming
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          Irrigation
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          Pest Control
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          Soil Health
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          Equipment
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          Market Prices
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          Subsidies
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          Weather
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Local Markets */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Local Markets</CardTitle>
                      <CardDescription>Nearby mandis and markets</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {localMarkets.map((market, index) => (
                        <div key={index}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm">{market.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {market.location} • {market.type}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                market.status === "Open"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }
                            >
                              {market.status}
                            </Badge>
                          </div>
                          {index < localMarkets.length - 1 && <Separator className="mt-3" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* Success Stories Tab */}
          <TabsContent value="success">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {successStories.map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <ImageWithFallback
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-accent text-accent-foreground">
                          {story.achievement}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {story.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4>{story.name}</h4>
                          <p className="text-sm text-muted-foreground">{story.location}</p>
                        </div>
                      </div>
                      <h3 className="mb-2">{story.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {story.description}
                      </p>
                      <Button variant="outline" className="w-full">
                        Read Full Story
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Connect Tab */}
          <TabsContent value="connect">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Find Farmers Near You</CardTitle>
                    <CardDescription>Connect with farmers in your region</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                F{i}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="mb-1">Farmer {i}</h4>
                              <p className="text-sm text-muted-foreground">
                                {5 + i} km away • Wheat, Rice cultivation
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Network</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <h2 className="text-3xl text-primary mb-1">48</h2>
                        <p className="text-sm text-muted-foreground">Connections</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/5 rounded-lg">
                        <h2 className="text-3xl text-secondary mb-1">156</h2>
                        <p className="text-sm text-muted-foreground">Total Interactions</p>
                      </div>
                      <Button className="w-full bg-primary text-primary-foreground">
                        View All Connections
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Suggested Groups</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="text-sm mb-1">Organic Farmers Network</h4>
                        <p className="text-xs text-muted-foreground mb-2">1,234 members</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Join Group
                        </Button>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="text-sm mb-1">Smart Irrigation Hub</h4>
                        <p className="text-xs text-muted-foreground mb-2">856 members</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Join Group
                        </Button>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="text-sm mb-1">Regional Market Updates</h4>
                        <p className="text-xs text-muted-foreground mb-2">2,145 members</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Join Group
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}