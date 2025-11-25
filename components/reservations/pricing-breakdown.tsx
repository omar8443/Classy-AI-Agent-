"use client"

import { Pricing } from "@/types/reservation"

interface PricingBreakdownProps {
  pricing: Pricing
}

export function PricingBreakdown({ pricing }: PricingBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">
          {pricing.currency} ${pricing.subtotal.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Taxes</span>
        <span className="font-medium">
          {pricing.currency} ${pricing.taxes.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Fees</span>
        <span className="font-medium">
          {pricing.currency} ${pricing.fees.toFixed(2)}
        </span>
      </div>
      <div className="border-t pt-3">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>
            {pricing.currency} ${pricing.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

