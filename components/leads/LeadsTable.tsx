"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { User, Search, Phone, Mail, ChevronRight } from "lucide-react"

import { Lead } from "@/types/leads"
import { Input } from "@/components/ui/input"

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

interface LeadsTableProps {
  leads: SerializedLead[]
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    return `+1 ${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`
  }
  return phone
}

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLeads = initialLeads.filter((lead) => {
    const normalizedQuery = searchQuery.toLowerCase()
    return (
      searchQuery === "" ||
      lead.name?.toLowerCase().includes(normalizedQuery) ||
      lead.phoneNumber.includes(searchQuery) ||
      lead.email?.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md bg-white rounded-xl border-neutral-100 text-neutral-900 placeholder:text-neutral-300 h-11"
        />
      </div>

      {filteredLeads.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl">
          <User className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-4 text-neutral-400">
            {initialLeads.length === 0 ? "No clients yet" : "No clients match your search"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          {filteredLeads.map((lead, i) => {
            const createdAt = new Date(lead.createdAt)
            
            return (
              <div
                key={lead.id}
                onClick={() => router.push(`/leads/${lead.id}`)}
                className={`group flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-neutral-50 select-none ${
                  i !== filteredLeads.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-neutral-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 truncate">
                      {lead.name || "Unknown Client"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {formatPhoneNumber(lead.phoneNumber)}
                    </span>
                    {lead.email && (
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats & Time */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center hidden sm:block">
                    <div className="text-xl font-semibold text-neutral-900">{lead.totalCalls}</div>
                    <div className="text-xs text-neutral-400">calls</div>
                  </div>
                  
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-medium text-neutral-900">
                      {format(createdAt, "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-neutral-400">
                      Client since
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

