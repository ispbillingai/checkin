
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const rooms = [
  { id: "room1", name: "Room 1" },
  { id: "room2", name: "Room 2" },
  { id: "room3", name: "Room 3" },
  { id: "room4", name: "Room 4" },
  { id: "room5", name: "Room 5" },
];

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i < 10 ? `0${i}` : `${i}`;
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const BookingForm = () => {
  const navigate = useNavigate();
  const [room, setRoom] = useState("");
  const [arrivalDate, setArrivalDate] = useState<Date>();
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [departureTime, setDepartureTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room || !arrivalDate || !arrivalTime || !departureDate || !departureTime || !name || !email || !phone) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // This is where you would normally send data to a PHP backend
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const bookingData = {
        room,
        arrivalDateTime: `${format(arrivalDate, "yyyy-MM-dd")} ${arrivalTime}`,
        departureDateTime: `${format(departureDate, "yyyy-MM-dd")} ${departureTime}`,
        name,
        email,
        phone,
        accessCode: Math.floor(100000 + Math.random() * 900000).toString(), // Generate 6-digit code
      };

      console.log("Booking data:", bookingData);
      
      toast.success("Booking successful! An email with your access code has been sent.");
      
      // Reset form
      setRoom("");
      setArrivalDate(undefined);
      setArrivalTime("");
      setDepartureDate(undefined);
      setDepartureTime("");
      setName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      toast.error("An error occurred during booking");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="w-full max-w-3xl animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Sign Out
          </Button>
          <h1 className="text-2xl font-medium text-center">Booking System</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>
        
        <Card className="backdrop-blur-sm bg-white/90 border shadow-lg animate-scale-in overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle>New Reservation</CardTitle>
            <CardDescription>
              Fill in the details to make a new booking
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Room Selection */}
                <div className="space-y-2">
                  <Label htmlFor="room">Select Room</Label>
                  <Select value={room} onValueChange={setRoom}>
                    <SelectTrigger id="room" className="h-11">
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
                
                {/* Arrival Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrival-date">Arrival Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="arrival-date"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal",
                            !arrivalDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {arrivalDate ? format(arrivalDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={arrivalDate}
                          onSelect={setArrivalDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="arrival-time">Arrival Time</Label>
                    <Select value={arrivalTime} onValueChange={setArrivalTime}>
                      <SelectTrigger id="arrival-time" className="h-11">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Select time" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={hour.value} value={hour.value}>
                            {hour.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Departure Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure-date">Departure Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="departure-date"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal",
                            !departureDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {departureDate ? format(departureDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={departureDate}
                          onSelect={setDepartureDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="departure-time">Departure Time</Label>
                    <Select value={departureTime} onValueChange={setDepartureTime}>
                      <SelectTrigger id="departure-time" className="h-11">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Select time" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={hour.value} value={hour.value}>
                            {hour.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Personal Details */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      className="h-11 pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mario Rossi"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="h-11 pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="h-11 pl-10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Processing</span>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Complete Booking
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground border-t bg-muted/30 px-6 py-4">
            <p>
              Upon successful booking, an access code will be sent to your email.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BookingForm;
