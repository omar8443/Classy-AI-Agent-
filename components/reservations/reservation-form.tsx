"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { BookingPlatform, Currency } from "@/types/reservation"
import { Lead } from "@/types/leads"

export function ReservationForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [formData, setFormData] = useState({
    leadId: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    flightDetails: "",
    hotelDetails: "",
    subtotal: 0,
    taxes: 0,
    fees: 0,
    currency: "CAD" as Currency,
    bookingPlatform: "direct" as BookingPlatform,
    platformConfirmationNumber: "",
    notes: "",
  })

  const total = formData.subtotal + formData.taxes + formData.fees

  // Fetch leads on mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("/api/leads")
        if (!response.ok) throw new Error("Failed to fetch leads")
        const data = await response.json()
        setLeads(data)
      } catch (error) {
        console.error("Error fetching leads:", error)
        toast({
          title: "Failed to load leads",
          description: "Please refresh the page to try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingLeads(false)
      }
    }

    fetchLeads()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) throw new Error("No user logged in")

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          agentId: user.uid,
          agentName: user.displayName || "Unknown",
          agentEmail: user.email || "",
          pricing: {
            subtotal: formData.subtotal,
            taxes: formData.taxes,
            fees: formData.fees,
            total,
            currency: formData.currency,
          },
          travelDetails: {
            destination: formData.destination,
            departureDate: new Date(formData.departureDate),
            returnDate: new Date(formData.returnDate),
            travelers: {
              adults: formData.adults,
              children: formData.children,
              infants: formData.infants,
            },
            flightDetails: formData.flightDetails || null,
            hotelDetails: formData.hotelDetails || null,
            additionalServices: [],
          },
          documents: [],
        }),
      })

      if (!response.ok) throw new Error("Failed to create reservation")

      const result = await response.json()

      toast({
        title: "Reservation created",
        description: `Reservation ${result.reservationId} has been created successfully.`,
      })

      router.push(`/reservations/${result.id}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Creation failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Client Information</h3>
        <div className="space-y-2">
          <Label htmlFor="leadId">Lead *</Label>
          <Select
            value={formData.leadId}
            onValueChange={(value) => setFormData({ ...formData, leadId: value })}
            disabled={loadingLeads}
          >
            <SelectTrigger id="leadId">
              <SelectValue placeholder={loadingLeads ? "Loading leads..." : "Select a lead"} />
            </SelectTrigger>
            <SelectContent>
              {leads.length === 0 ? (
                <SelectItem value="none" disabled>
                  No leads available
                </SelectItem>
              ) : (
                leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} - {lead.phone}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select the client from your existing leads
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Travel Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="destination">Destination *</Label>
          <Input
            id="destination"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder="Paris, France"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="departureDate">Departure Date *</Label>
            <Input
              id="departureDate"
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="returnDate">Return Date *</Label>
            <Input
              id="returnDate"
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="adults">Adults *</Label>
            <Input
              id="adults"
              type="number"
              min="1"
              value={formData.adults}
              onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="children">Children</Label>
            <Input
              id="children"
              type="number"
              min="0"
              value={formData.children}
              onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="infants">Infants</Label>
            <Input
              id="infants"
              type="number"
              min="0"
              value={formData.infants}
              onChange={(e) => setFormData({ ...formData, infants: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flightDetails">Flight Details</Label>
          <Textarea
            id="flightDetails"
            value={formData.flightDetails}
            onChange={(e) => setFormData({ ...formData, flightDetails: e.target.value })}
            placeholder="Flight numbers, times, etc."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hotelDetails">Hotel Details</Label>
          <Textarea
            id="hotelDetails"
            value={formData.hotelDetails}
            onChange={(e) => setFormData({ ...formData, hotelDetails: e.target.value })}
            placeholder="Hotel name, room type, etc."
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value as Currency })}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAD">CAD ($)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="subtotal">Subtotal *</Label>
            <Input
              id="subtotal"
              type="number"
              step="0.01"
              min="0"
              value={formData.subtotal}
              onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxes">Taxes</Label>
            <Input
              id="taxes"
              type="number"
              step="0.01"
              min="0"
              value={formData.taxes}
              onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fees">Fees</Label>
            <Input
              id="fees"
              type="number"
              step="0.01"
              min="0"
              value={formData.fees}
              onChange={(e) => setFormData({ ...formData, fees: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formData.currency} ${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Booking Platform</h3>
        
        <div className="space-y-2">
          <Label htmlFor="platform">Platform *</Label>
          <Select
            value={formData.bookingPlatform}
            onValueChange={(value) => setFormData({ ...formData, bookingPlatform: value as BookingPlatform })}
          >
            <SelectTrigger id="platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking.com">Booking.com</SelectItem>
              <SelectItem value="expedia">Expedia</SelectItem>
              <SelectItem value="amadeus">Amadeus</SelectItem>
              <SelectItem value="sabre">Sabre</SelectItem>
              <SelectItem value="direct">Direct Booking</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmationNumber">Platform Confirmation Number</Label>
          <Input
            id="confirmationNumber"
            value={formData.platformConfirmationNumber}
            onChange={(e) =>
              setFormData({ ...formData, platformConfirmationNumber: e.target.value })
            }
            placeholder="ABC123XYZ"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notes</h3>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or special requests..."
          rows={4}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Reservation"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/reservations")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

