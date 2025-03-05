
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Printer, ArrowLeft, Search, RefreshCw } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl w-full mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Sign Out
          </Button>
          <h1 className="text-2xl font-medium text-center">Admin Dashboard</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>
        
        <Card className="backdrop-blur-sm bg-white/90 border shadow-lg animate-scale-in overflow-hidden mb-8">
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
      </div>
    </div>
  );
};

export default AdminDashboard;
