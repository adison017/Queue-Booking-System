"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign } from "lucide-react"

interface Service {
  id: number
  name: string
  duration_minutes: number
  duration_days: number
  price: number
  category_name?: string
}

interface ServicesTabProps {
  storeId: number
  services: Service[]
}

export function ServicesTab({ storeId, services }: ServicesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>บริการทั้งหมด ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">ยังไม่มีบริการในร้านนี้</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        {service.category_name && (
                          <Badge variant="outline" className="mt-1">
                            {service.category_name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {service.duration_days > 0 ? `${service.duration_days} วัน ` : ""}
                            {service.duration_minutes} นาที
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">฿{service.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
