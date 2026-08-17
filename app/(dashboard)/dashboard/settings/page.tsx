"use client";

import { useState } from "react";
import { User, Shield, Bell, AlertTriangle, Upload, Save, Smartphone, Laptop } from "lucide-react";
import { cn, formatTimeAgo } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const loginHistory = [
    { id: 1, device: "MacBook Pro - Chrome", ip: "197.210.64.12", location: "Lagos, NG", time: new Date('2026-08-15T08:30:00Z'), status: "Current Session", risk: "Low" },
    { id: 2, device: "iPhone 13 - Safari", ip: "102.89.43.111", location: "Abuja, NG", time: new Date('2026-08-13T10:30:00Z'), status: "Expired", risk: "Low" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            <button 
              onClick={() => setActiveTab("profile")}
              className={cn("flex items-center px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-colors", 
                activeTab === "profile" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <User className="w-5 h-5 mr-3" />
              Profile Details
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={cn("flex items-center px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-colors", 
                activeTab === "security" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Shield className="w-5 h-5 mr-3" />
              Security
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={cn("flex items-center px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-colors", 
                activeTab === "notifications" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Bell className="w-5 h-5 mr-3" />
              Notifications
            </button>
            <button 
              onClick={() => setActiveTab("danger")}
              className={cn("flex items-center px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-colors", 
                activeTab === "danger" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-100 hover:text-red-600"
              )}
            >
              <AlertTriangle className="w-5 h-5 mr-3" />
              Danger Zone
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
              
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border border-dashed border-gray-300 relative group overflow-hidden">
                  <User className="w-10 h-10 text-gray-400" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="w-5 h-5 text-white mb-1" />
                    <span className="text-[10px] text-white font-medium uppercase tracking-wider">Upload</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500 mb-3">JPG, GIF or PNG. Max size of 5MB.</p>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Remove Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" defaultValue="+234 801 234 5678" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Street Address</label>
                  <input type="text" defaultValue="123 Example Street" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Primary Market</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option>Computer Village, Ikeja</option>
                    <option>Alaba International Market</option>
                    <option>Balogun Market</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button className="flex items-center px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="pt-2">
                    <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Login History</h2>
                <div className="overflow-x-auto -mx-6 md:-mx-8">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-y border-gray-200">
                      <tr>
                        <th className="px-6 md:px-8 py-3 font-medium">Device & Browser</th>
                        <th className="px-6 py-3 font-medium">IP & Location</th>
                        <th className="px-6 py-3 font-medium">Time</th>
                        <th className="px-6 md:px-8 py-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loginHistory.map((login) => (
                        <tr key={login.id}>
                          <td className="px-6 md:px-8 py-4">
                            <div className="flex items-center gap-3">
                              {login.device.includes("Mac") || login.device.includes("Windows") ? 
                                <Laptop className="w-5 h-5 text-gray-400" /> : 
                                <Smartphone className="w-5 h-5 text-gray-400" />}
                              <span className="font-medium text-gray-900">{login.device}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>{login.ip}</div>
                            <div className="text-xs text-gray-400">{login.location}</div>
                          </td>
                          <td className="px-6 py-4">{formatTimeAgo(login.time)}</td>
                          <td className="px-6 md:px-8 py-4 text-right">
                            <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-semibold",
                              login.status === "Current Session" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                            )}>
                              {login.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                {[
                  { title: "New Messages", desc: "Get notified when a buyer sends you a message" },
                  { title: "Listing Approvals", desc: "Get notified when your listing goes live or is rejected" },
                  { title: "Marketing & Promos", desc: "Receive offers, discounts, and tips to sell better" },
                  { title: "Security Alerts", desc: "Important notices about your account security (Always On)" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" defaultChecked={i !== 2} disabled={i === 3} />
                          <div className={cn("block w-10 h-6 rounded-full transition-colors", 
                            i === 3 || i !== 2 ? "bg-primary" : "bg-gray-200",
                            i === 3 && "opacity-50"
                          )}></div>
                          <div className={cn("absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                            i === 3 || i !== 2 ? "translate-x-4" : ""
                          )}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <AlertTriangle className="w-32 h-32 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-4 relative z-10">Danger Zone</h2>
              <p className="text-gray-600 mb-6 max-w-lg relative z-10">
                Once you delete your account, there is no going back. Please be certain. 
                All your listings, messages, and profile data will be permanently removed.
              </p>
              
              <button className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors relative z-10">
                Deactivate Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
