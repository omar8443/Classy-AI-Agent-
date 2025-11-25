"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { AdminGuard } from "@/components/auth/AdminGuard"
import { ProfileSecurity } from "@/components/settings/profile-security"
import { PreferencesForm } from "@/components/settings/preferences-form"
import { IntegrationsStatus } from "@/components/settings/integrations-status"
import { ExportData } from "@/components/settings/export-data"
import { CompanySettings } from "@/components/settings/company-settings"

export function SettingsPageClient() {
  return (
    <AdminGuard>
      <PageWrapper>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage application settings and integrations
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile & Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="data">Data & Export</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile & Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileSecurity />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Application Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <PreferencesForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations & API Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <IntegrationsStatus />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <CompanySettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data & Export</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExportData />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageWrapper>
    </AdminGuard>
  )
}

