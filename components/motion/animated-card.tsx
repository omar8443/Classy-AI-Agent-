"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function AnimatedCard({ 
  children, 
  className,
  ...props 
}: React.ComponentProps<typeof Card>) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}
      transition={{ duration: 0.2 }}
    >
      <Card className={className} {...props}>
        {children}
      </Card>
    </motion.div>
  )
}

