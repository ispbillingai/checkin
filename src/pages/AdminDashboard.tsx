
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Printer, 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Database, 
  Key, 
  Mail, 
  Phone 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";

// Mock data for bookings
const generateMockBookings = (date: Date) => {
  const roomNames = ["Room 1", "Room 2", "Room 3", "Room 4", "Room 5"];
  const formattedDate = format(date, "yyyy-MM-dd");
  
  return Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => {
    const roomIndex = Math.floor(Math.random() * roomNames.length);
    const arrivalHour = Math.floor(Math.random() * 12) + 8;
    const departureHour = arrivalHour + Math.floor(Math.random() * 8) + 2;
    
    return {
      id: `booking-${i}-${formattedDate}`,
      room: roomNames[roomIndex],
      roomId: `room${roomIndex + 1}`,
      guestName: `Guest ${i + 1}`,
      email: `guest${i + 1}@example.com`,
      phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      arrivalDateTime: `${formattedDate} ${arrivalHour < 10 ? `0${arrivalHour}` : arrivalHour}:00`,
      departureDateTime: `${formattedDate} ${departureHour < 10 ? `0${departureHour}` : departureHour}:00`,
      accessCode: Math.floor(100000 + Math.random() * 900000).toString(),
    };
  });
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState(() => generateMockBookings(new Date()));
  const [activeSection, setActiveSection] = useState("bookings");

  const rooms = [
    { id: "all", name: "All Rooms" },
    { id: "room1", name: "Room 1" },
    { id: "room2", name: "Room 2" },
    { id: "room3", name: "Room 3" },
    { id: "room4", name: "Room 4" },
    { id: "room5", name: "Room 5" },
  ];

  const fetchBookings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setBookings(generateMockBookings(selectedDate));
      setIsLoading(false);
    }, 1000);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setBookings(generateMockBookings(date));
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const handlePrintBooking = (bookingId: string) => {
    toast.success("Printing booking details...");
    console.log("Printing booking:", bookingId);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesRoom = selectedRoom === "all" || booking.roomId === selectedRoom;
    const matchesSearch = searchQuery === "" || 
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.accessCode.includes(searchQuery);
    
    return matchesRoom && matchesSearch;
  });

  const renderContent = () => {
    switch (activeSection) {
      case "bookings":
        return (
          <Card className="backdrop-blur-sm bg-white/90 border shadow-lg animate-scale-in overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Bookings Summary</CardTitle>
              <CardDescription>
                View and manage all bookings for the selected date
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className={cn(
                          "w-full h-11 justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Room Selection */}
                <div className="space-y-2">
                  <Label htmlFor="room-filter">Filter by Room</Label>
                  <Select value={selectedRoom} onValueChange={handleRoomChange}>
                    <SelectTrigger id="room-filter" className="h-11">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search by Name or Code</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      className="h-11 pl-10"
                      placeholder="Search bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={fetchBookings}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
              
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="flex flex-col items-center animate-pulse">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin mb-2" />
                    <p className="text-muted-foreground">Loading bookings...</p>
                  </div>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>Guest Name</TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        <TableHead>Access Code</TableHead>
                        <TableHead className="hidden md:table-cell">Check-in</TableHead>
                        <TableHead className="hidden md:table-cell">Check-out</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-medium">{booking.room}</TableCell>
                          <TableCell>{booking.guestName}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm text-muted-foreground">
                              <div>{booking.email}</div>
                              <div>{booking.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {booking.accessCode}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(new Date(booking.arrivalDateTime), "h:mm a")}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(new Date(booking.departureDateTime), "h:mm a")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintBooking(booking.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <CalendarIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no bookings for the selected date and filters.
                  </p>
                  <Button variant="outline" onClick={fetchBookings}>
                    Refresh Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case "passcodes":
        return (
          <Card className="backdrop-blur-sm bg-white/90 border shadow-lg animate-scale-in overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Room Passcodes</CardTitle>
              <CardDescription>
                Manage passcodes for rooms and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">Default Passcode Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passcode-length">Passcode Length</Label>
                      <Select defaultValue="6">
                        <SelectTrigger id="passcode-length">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 digits</SelectItem>
                          <SelectItem value="6">6 digits</SelectItem>
                          <SelectItem value="8">8 digits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passcode-type">Passcode Type</Label>
                      <Select defaultValue="numeric">
                        <SelectTrigger id="passcode-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="numeric">Numeric only</SelectItem>
                          <SelectItem value="alphanumeric">Alphanumeric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="email-notification"
                        className="mt-1"
                        defaultChecked
                      />
                      <div className="space-y-1">
                        <Label htmlFor="email-notification" className="font-medium">Email Notification</Label>
                        <p className="text-sm text-muted-foreground">Send passcode to guest via email when booking is confirmed</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="sms-notification"
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="sms-notification" className="font-medium">SMS Notification</Label>
                        <p className="text-sm text-muted-foreground">Send passcode to guest via SMS when booking is confirmed</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">Room-Specific Settings</h3>
                  {rooms.slice(1).map((room) => (
                    <Card key={room.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/20 py-3">
                        <CardTitle className="text-base">{room.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${room.id}-custom-passcode`}>Custom Fixed Passcode (Optional)</Label>
                            <Input 
                              id={`${room.id}-custom-passcode`} 
                              placeholder="Leave empty for auto-generated" 
                            />
                            <p className="text-xs text-muted-foreground">If set, this fixed passcode will be used for all bookings</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${room.id}-reset-hours`}>Auto Reset (hours after checkout)</Label>
                            <Input 
                              id={`${room.id}-reset-hours`} 
                              type="number" 
                              min="0"
                              defaultValue="2" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => toast.success("Settings saved successfully")}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "database":
        return (
          <Card className="backdrop-blur-sm bg-white/90 border shadow-lg animate-scale-in overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>
                Overview of the database structure for this application
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {/* Users Table */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Users Table</h3>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">id</TableCell>
                          <TableCell>INT</TableCell>
                          <TableCell>Primary key, auto-increment</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">username</TableCell>
                          <TableCell>VARCHAR(50)</TableCell>
                          <TableCell>Unique username for login</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">password</TableCell>
                          <TableCell>VARCHAR(255)</TableCell>
                          <TableCell>Hashed password</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">is_admin</TableCell>
                          <TableCell>TINYINT(1)</TableCell>
                          <TableCell>Flag for admin privilege</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">created_at</TableCell>
                          <TableCell>TIMESTAMP</TableCell>
                          <TableCell>Account creation timestamp</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Rooms Table */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Rooms Table</h3>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">id</TableCell>
                          <TableCell>VARCHAR(20)</TableCell>
                          <TableCell>Primary key (e.g., "room1")</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">name</TableCell>
                          <TableCell>VARCHAR(100)</TableCell>
                          <TableCell>Display name for the room</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">fixed_passcode</TableCell>
                          <TableCell>VARCHAR(10)</TableCell>
                          <TableCell>Optional fixed passcode for this room</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">reset_hours</TableCell>
                          <TableCell>INT</TableCell>
                          <TableCell>Hours after checkout to reset passcode</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Bookings Table */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Bookings Table</h3>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">id</TableCell>
                          <TableCell>INT</TableCell>
                          <TableCell>Primary key, auto-increment</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">room_id</TableCell>
                          <TableCell>VARCHAR(20)</TableCell>
                          <TableCell>Foreign key to rooms.id</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">guest_name</TableCell>
                          <TableCell>VARCHAR(100)</TableCell>
                          <TableCell>Name of the guest</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">email</TableCell>
                          <TableCell>VARCHAR(100)</TableCell>
                          <TableCell>Email address of the guest</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">phone</TableCell>
                          <TableCell>VARCHAR(20)</TableCell>
                          <TableCell>Phone number of the guest</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">arrival_datetime</TableCell>
                          <TableCell>DATETIME</TableCell>
                          <TableCell>Check-in date and time</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">departure_datetime</TableCell>
                          <TableCell>DATETIME</TableCell>
                          <TableCell>Check-out date and time</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">access_code</TableCell>
                          <TableCell>VARCHAR(10)</TableCell>
                          <TableCell>Room access code for this booking</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">created_at</TableCell>
                          <TableCell>TIMESTAMP</TableCell>
                          <TableCell>Booking creation timestamp</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Notification Settings Table */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Notification Settings Table</h3>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">id</TableCell>
                          <TableCell>INT</TableCell>
                          <TableCell>Primary key, auto-increment</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">email_enabled</TableCell>
                          <TableCell>TINYINT(1)</TableCell>
                          <TableCell>Whether email notifications are enabled</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">sms_enabled</TableCell>
                          <TableCell>TINYINT(1)</TableCell>
                          <TableCell>Whether SMS notifications are enabled</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">email_template</TableCell>
                          <TableCell>TEXT</TableCell>
                          <TableCell>HTML template for email notifications</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">sms_template</TableCell>
                          <TableCell>VARCHAR(255)</TableCell>
                          <TableCell>Template for SMS notifications</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">smtp_host</TableCell>
                          <TableCell>VARCHAR(100)</TableCell>
                          <TableCell>SMTP server host</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">smtp_port</TableCell>
                          <TableCell>INT</TableCell>
                          <TableCell>SMTP server port</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">smtp_username</TableCell>
                          <TableCell>VARCHAR(100)</TableCell>
                          <TableCell>SMTP username</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">smtp_password</TableCell>
                          <TableCell>VARCHAR(100)</TableCell>
                          <TableCell>SMTP password (stored encrypted)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">sms_api_key</TableCell>
                          <TableCell>VARCHAR(100)</TableCell>
                          <TableCell>API key for SMS service</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const AppSidebar = () => {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setActiveSection("bookings")}
                    className={cn(activeSection === "bookings" ? "bg-primary/10 text-primary" : "")}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Bookings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setActiveSection("passcodes")}
                    className={cn(activeSection === "passcodes" ? "bg-primary/10 text-primary" : "")}
                  >
                    <Key className="h-4 w-4" />
                    <span>Room Passcodes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setActiveSection("database")}
                    className={cn(activeSection === "database" ? "bg-primary/10 text-primary" : "")}
                  >
                    <Database className="h-4 w-4" />
                    <span>Database Schema</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Notification</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => toast.info("Email settings will be implemented soon")}>
                    <Mail className="h-4 w-4" />
                    <span>Email Templates</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => toast.info("SMS settings will be implemented soon")}>
                    <Phone className="h-4 w-4" />
                    <span>SMS Templates</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => toast.info("User management will be implemented soon")}>
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => toast.info("Settings will be implemented soon")}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-blue-50 to-white">
        <AppSidebar />
        <div className="flex-1">
          <div className="p-4 md:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-2xl font-medium">Admin Dashboard</h1>
              </div>
              <Button 
                variant="ghost" 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
            
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
