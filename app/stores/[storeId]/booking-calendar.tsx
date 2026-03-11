"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BookingCalendar } from "@/components/booking-calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, User, DollarSign, Check, ChevronRight, ArrowLeft, Info } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Service {
  id: number
  name: string
  duration_minutes: number
  duration_days: number
  price: number
  category_name?: string
}

interface BookingCalendarPageProps {
  storeId: number
  storeName: string
  services: Service[]
}

type Step = 1 | 2 | 3

export function BookingCalendarPage({ storeId, storeName, services }: BookingCalendarPageProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isBooking, setIsBooking] = useState(false)

  const steps = [
    { id: 1, name: "เลือกบริการ", icon: Info },
    { id: 2, name: "เลือกวัน-เวลา", icon: CalendarIcon },
    { id: 3, name: "ยืนยันการจอง", icon: Check },
  ]

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (date: Date, time: string) => {
    setSelectedTime(time)
  }

  const calculateEndTime = (startTime: string, service: Service) => {
    if (startTime.includes(" - ")) {
      return startTime.split(" - ")[1]
    }

    const [hour, minute] = startTime.split(':').map(Number)
    const totalMinutes = hour * 60 + minute + service.duration_minutes + (service.duration_days * 24 * 60)
    
    const endHour = Math.floor(totalMinutes / 60) % 24
    const endMinute = totalMinutes % 60
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      toast.error("กรุณาข้อมูลให้ครบถ้วน")
      return
    }

    setIsBooking(true)
    try {
      const startOnly = selectedTime.includes(" - ") ? selectedTime.split(" - ")[0] : selectedTime
      const endTime = calculateEndTime(selectedTime, selectedService)
      
      const response = await fetch(`/api/stores/${storeId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService.id,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: startOnly,
          end_time: endTime
        })
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "เกิดข้อผิดพลาด")
        return
      }

      toast.success("จองคิวสำเร็จแล้ว")
      router.push(`/my-bookings`)
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการจอง")
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="w-full space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Step Indicator - Floating 3D Style */}
      <div className="relative flex justify-between items-center px-4 md:px-12 bg-background/40 backdrop-blur-xl border-2 border-white/10 rounded-3xl py-4 md:py-6 shadow-2xl">
        <div className="absolute top-[40%] left-0 w-full h-[3px] bg-muted/30 -translate-y-1/2 -z-10" />
        <div 
          className="absolute top-[40%] left-0 h-[3px] bg-gradient-to-r from-primary to-primary/50 -translate-y-1/2 -z-10 transition-all duration-700 ease-in-out" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2 md:gap-3 relative">
            <div 
              className={cn(
                "h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl",
                currentStep >= step.id 
                  ? "bg-primary border-primary text-primary-foreground shadow-primary/30 scale-110 -translate-y-1 z-10" 
                  : "bg-background/80 border-white/10 text-muted-foreground scale-90"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5 md:h-6 md:w-6 stroke-[3px]" />
              ) : (
                <step.icon className={cn("h-5 w-5 md:h-6 md:w-6 transition-transform duration-500", currentStep === step.id && "animate-pulse")} />
              )}
            </div>
            <span className={cn(
              "text-[10px] md:text-xs font-black tracking-tighter md:tracking-widest uppercase transition-all duration-500",
              currentStep >= step.id ? "text-primary opacity-100" : "text-muted-foreground opacity-50"
            )}>
              {step.name}
            </span>
          </div>
        ))}
      </div>

      <div className="min-h-[450px]">
        {/* Step 1: Select Service */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 px-1">
            <div className="text-center mb-10 space-y-2">
              <Badge variant="outline" className="border-primary/30 text-primary">ขั้นตอนที่ 1</Badge>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">เลือกบริการที่คุณสนใจ</h2>
              <p className="text-sm md:text-base text-muted-foreground">เรามีบริการหลากหลายพร้อมดูแลคุณอย่างดีที่สุด</p>
            </div>
            <div className="grid gap-6">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="perspective-1000"
                  onClick={() => setSelectedService(service)}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all duration-500 border-2 overflow-hidden group relative transform-gpu",
                      selectedService?.id === service.id 
                        ? "border-primary bg-primary/5 shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.3)] -translate-y-2 rotate-y-2" 
                        : "hover:border-primary/50 hover:bg-muted/30 border-white/10 bg-background shadow-lg hover:-translate-y-1"
                    )}
                  >
                    <CardContent className="p-4 md:p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className={cn(
                          "h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner overflow-hidden relative shrink-0",
                          selectedService?.id === service.id 
                            ? "bg-primary text-primary-foreground scale-105" 
                            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-105"
                        )}>
                           <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Settings className="h-6 w-6 md:h-8 md:w-8 relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black text-lg md:text-xl tracking-tight leading-tight">{service.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-sm font-bold text-muted-foreground/80">
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary/70" />
                              {service.duration_days > 0 ? `${service.duration_days} วัน ` : ""}
                              {service.duration_minutes} นาที
                            </span>
                            {service.category_name && (
                              <Badge className="bg-muted hover:bg-muted text-foreground border-none text-[8px] md:text-[10px] font-black h-4 md:h-5">
                                {service.category_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <p className="text-2xl md:text-3xl font-black text-primary tracking-tighter">฿{service.price.toLocaleString()}</p>
                        <div className="hidden md:flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                           <span className="text-[10px] font-black uppercase tracking-tighter text-primary">เลือกบริการนี้</span>
                           <ChevronRight className="h-3 w-3 text-primary animate-bounce-x" />
                        </div>
                      </div>
                    </CardContent>
                    
                    {selectedService?.id === service.id && (
                      <div className="absolute top-0 right-0 p-1 md:p-2">
                         <div className="bg-primary text-primary-foreground rounded-bl-xl md:rounded-bl-2xl rounded-tr-sm p-1 md:p-1.5 shadow-lg">
                            <Check className="h-3 w-3 md:h-4 md:w-4 stroke-[4px]" />
                         </div>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-700 px-1">
            <div className="text-center mb-4 space-y-2">
              <Badge variant="outline" className="border-primary/30 text-primary">ขั้นตอนที่ 2</Badge>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">เลือกช่วงเวลาที่คุณสะดวก</h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium">บริการ: <span className="text-primary font-bold">{selectedService?.name}</span></p>
            </div>
            
            <div className="bg-background/40 backdrop-blur-xl border-2 border-white/10 rounded-3xl md:rounded-[2.5rem] p-3 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
              <BookingCalendar
                storeId={storeId}
                selectedTime={selectedTime}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
              />
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 px-1">
            <div className="text-center mb-10 space-y-2">
              <Badge variant="outline" className="border-primary/30 text-primary">ขั้นตอนสุดท้าย</Badge>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">ยืนยันข้อมูลนัดหมายของคุณ</h2>
              <p className="text-sm md:text-base text-muted-foreground">กรุณาตรวจสอบความถูกต้องของบริการและเวลา</p>
            </div>

            <div className="perspective-1000 max-w-xl mx-auto">
              <Card className="overflow-hidden border-2 border-white/10 bg-background/50 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(var(--primary-rgb),0.2)] transform rotate-x-1">
                <div className="h-2 md:h-3 bg-gradient-to-r from-primary via-primary/80 to-primary w-full shadow-lg z-10 relative" />
                <CardHeader className="p-4 md:p-6 bg-primary/5">
                  <div className="flex justify-between items-start">
                    <div>
                         <CardTitle className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">สรุปการจองคิว</CardTitle>
                         <CardDescription className="text-sm md:text-base font-bold text-primary mt-1">ร้าน: {storeName}</CardDescription>
                    </div>
                    <Badge className="h-6 md:h-8 px-2 md:px-4 bg-primary/20 text-primary border-none font-black text-[10px] md:text-sm animate-pulse">PENDING</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 md:space-y-8 pt-6 md:pt-8 px-4 md:px-8">
                  <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                    <div className="space-y-1 md:space-y-2 p-4 md:p-5 bg-background/50 rounded-2xl border-2 border-white/5 shadow-inner transition-transform hover:scale-[1.02]">
                      <p className="text-[9px] md:text-[10px] text-primary font-black flex items-center gap-2 uppercase tracking-widest">
                        <Settings className="h-3 w-3 md:h-4 md:w-4" /> บริการ
                      </p>
                      <p className="font-black text-lg md:text-xl leading-tight">{selectedService?.name}</p>
                    </div>
                    <div className="space-y-1 md:space-y-2 p-4 md:p-5 bg-background/50 rounded-2xl border-2 border-white/5 shadow-inner transition-transform hover:scale-[1.02]">
                      <p className="text-[9px] md:text-[10px] text-primary font-black flex items-center gap-2 uppercase tracking-widest">
                        <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" /> วันนัดหมาย
                      </p>
                      <p className="font-black text-lg md:text-xl leading-tight">
                        {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: th }) : "-"}
                      </p>
                    </div>
                    <div className="space-y-1 md:space-y-2 p-4 md:p-5 bg-background/50 rounded-2xl border-2 border-white/5 shadow-inner transition-transform hover:scale-[1.02]">
                      <p className="text-[9px] md:text-[10px] text-primary font-black flex items-center gap-2 uppercase tracking-widest">
                        <Clock className="h-3 w-3 md:h-4 md:w-4" /> ช่วงเวลา
                      </p>
                      <p className="font-black text-lg md:text-xl leading-tight">
                        {selectedTime && selectedTime.includes(" - ") 
                          ? selectedTime 
                          : `${selectedTime} - ${selectedTime && selectedService ? calculateEndTime(selectedTime, selectedService) : "-"}`}
                      </p>
                    </div>
                    <div className="space-y-1 md:space-y-2 p-4 md:p-5 bg-primary/10 rounded-2xl border-2 border-primary/20 shadow-inner transition-transform hover:scale-[1.02]">
                      <p className="text-[9px] md:text-[10px] text-primary font-black flex items-center gap-2 uppercase tracking-widest">
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4" /> ค่าบริการสุทธิ
                      </p>
                      <p className="font-black text-2xl md:text-3xl text-primary tracking-tighter">
                        ฿{selectedService?.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 md:p-5 rounded-2xl flex items-start gap-3 md:gap-4 border border-white/5 shadow-lg">
                    <div className="bg-primary/20 p-2 rounded-xl shrink-0">
                       <Info className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <p className="text-[10px] md:text-xs leading-relaxed font-medium text-muted-foreground">
                      การจองจะสมบูรณ์เมื่อได้รับการยืนยันจากร้านค้า ระบบจะส่งการแจ้งเตือนกลับหาคุณโดยเร็วที่สุด ขอบพระคุณที่ไว้วางใจ {storeName}
                    </p>
                  </div>
                </CardContent>
                <div className="h-1 bg-muted/20 w-full" />
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Modern Navigation Controls - Optimized for Mobile */}
      <div className="flex items-center justify-between gap-3 md:gap-6 fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl bg-background/60 backdrop-blur-2xl border-2 border-white/10 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-[100] transition-all duration-300">
        <Button
          variant="ghost"
          onClick={() => {
            if (currentStep === 1) router.push('/stores')
            else setCurrentStep((prev) => (prev - 1) as Step)
          }}
          className="gap-1 md:gap-2 h-10 md:h-12 px-3 md:px-6 rounded-xl md:rounded-2xl hover:bg-white/5 transition-all text-xs md:text-sm font-bold active:scale-95 relative z-[110]"
        >
          <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 stroke-[3px]" />
          <span className="hidden xs:inline">{currentStep === 1 ? "ยกเลิก" : "ย้อนกลับ"}</span>
        </Button>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
             {[1, 2, 3].map((s) => (
                <div key={s} className={cn("h-1.5 rounded-full transition-all duration-300", currentStep === s ? "w-6 bg-primary" : "w-1.5 bg-muted/50")} />
             ))}
          </div>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep((prev) => (prev + 1) as Step)}
              disabled={
                (currentStep === 1 && !selectedService) || 
                (currentStep === 2 && (!selectedDate || !selectedTime))
              }
              className="h-10 md:h-12 px-5 md:px-8 rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 font-black tracking-tight text-xs md:text-sm active:scale-95 transition-all bg-gradient-to-r from-primary to-primary/80"
            >
              ถัดไป
              <ChevronRight className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5 stroke-[3px]" />
            </Button>
          ) : (
            <Button
              onClick={handleBooking}
              disabled={isBooking}
              className="h-11 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl text-sm md:text-lg font-black tracking-tighter shadow-[0_15px_30px_-5px_rgba(var(--primary-rgb),0.5)] active:scale-95 transition-all bg-primary hover:shadow-primary/40"
            >
              {isBooking ? (
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 md:h-4 md:w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   <span className="text-xs md:text-base">กำลังส่ง...</span>
                </div>
              ) : "ยืนยันตอนนี้"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Settings(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
