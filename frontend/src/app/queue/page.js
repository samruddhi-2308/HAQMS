'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import { Activity, Bell, Monitor, RefreshCw, AlertCircle } from 'lucide-react';

export default function QueueMonitor() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const formatTime = (value) => {
    if (!value) {
      return '--';
    }

    return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const fetchQueueData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/queue`);
      if (!res.ok) {
        throw new Error('Failed to retrieve active token queue.');
      }
      const data = await res.json();
      setTokens(data);
      setError('');
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      console.error('Queue poll fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();

    const intervalId = setInterval(() => {
      fetchQueueData();
      setRefreshCount((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const groupedTokens = tokens.reduce((groups, token) => {
    const docId = token.doctorId;
    if (!groups[docId]) {
      groups[docId] = {
        doctorName: token.doctor.name,
        specialization: token.doctor.specialization,
        calling: null,
        waiting: [],
      };
    }
    
    if (token.status === 'CALLING') {
      groups[docId].calling = token;
    } else if (token.status === 'WAITING') {
      groups[docId].waiting.push(token);
    }
    return groups;
  }, {});

  const activeBoards = Object.keys(groupedTokens).length;
  const totalTokens = tokens.length;
  const callingNow = tokens.filter((token) => token.status === 'CALLING').length;
  const waitingNow = tokens.filter((token) => token.status === 'WAITING').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        <div className="glass p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h1 className="page-title text-2xl font-extrabold flex items-center gap-2">
                Live Queue Board
              </h1>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
                Front-desk queue display with real-time calling status and waiting list updates.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wide border border-teal-500/20">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Live feed
            </span>
            <div className="p-2 bg-sky-100/75 dark:bg-sky-950/25 rounded-lg text-sky-800 dark:text-sky-200 text-xs font-mono">
              Refreshes: {refreshCount}
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="glass rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 p-4 shadow-sm dark:bg-slate-950/30">
            <span className="text-xxs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Boards active</span>
            <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{activeBoards}</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Doctors with live queue activity</p>
          </div>
          <div className="glass rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 p-4 shadow-sm dark:bg-slate-950/30">
            <span className="text-xxs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Tokens issued</span>
            <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{totalTokens}</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">All active check-ins for today</p>
          </div>
          <div className="glass rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 p-4 shadow-sm dark:bg-slate-950/30">
            <span className="text-xxs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Currently calling</span>
            <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{callingNow}</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Patients being called right now</p>
          </div>
          <div className="glass rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 p-4 shadow-sm dark:bg-slate-950/30">
            <span className="text-xxs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Waiting</span>
            <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{waitingNow}</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Patients next in line</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
          <span>Last sync: {formatTime(lastSyncedAt)}</span>
          <span>Refresh interval: 3 seconds</span>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-3 text-sm shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <strong>Sync issue:</strong> {error} - Please verify that the backend API server is online.
            </div>
          </div>
        )}

        {loading && tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="pulse-loader">
              <div></div>
              <div></div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Loading live queue data...</p>
          </div>
        ) : Object.keys(groupedTokens).length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Bell className="h-12 w-12 text-slate-400 mx-auto animate-bounce" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">No active check-ins right now</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm max-w-md mx-auto">
              The board is clear. New arrivals will appear here automatically as reception checks patients in.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedTokens).map(([docId, docInfo]) => (
              <div
                key={docId}
                className="glass rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full hover:shadow-teal-500/5 hover:border-teal-500/30 transition-all duration-300"
              >
                <div className="bg-sky-50/75 dark:bg-sky-950/20 p-5 border-b border-sky-200/70 dark:border-sky-900/30">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{docInfo.doctorName}</h3>
                  <p className="text-xs text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider mt-0.5">
                    {docInfo.specialization}
                  </p>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                      Currently calling
                    </h4>
                    {docInfo.calling ? (
                      <div className="bg-teal-500/10 dark:bg-teal-500/5 border border-teal-500/30 p-6 rounded-2xl text-center shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 80%) opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="block text-5xl font-black text-teal-600 dark:text-teal-400 tracking-wider animate-pulse">
                          #{docInfo.calling.tokenNumber}
                        </span>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mt-2">
                          Patient: {docInfo.calling.patient.name}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-sky-100/75 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-900/30 p-6 rounded-2xl text-center shadow-inner">
                        <span className="block text-2xl font-extrabold text-sky-800 dark:text-sky-200 tracking-wider italic">Awaiting next call</span>
                        <span className="block text-xs font-medium text-slate-700 dark:text-sky-300 mt-2">
                          No patient is being called at the moment
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                      Waiting list
                    </h4>
                    {docInfo.waiting.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {docInfo.waiting.map((token) => (
                          <div
                            key={token.id}
                            className="px-3 py-1.5 rounded-lg bg-sky-100/75 dark:bg-sky-950/25 border border-sky-200/70 dark:border-sky-900/30 text-xs font-bold text-slate-700 dark:text-slate-200"
                            title={`Patient: ${token.patient.name}`}
                          >
                            #{token.tokenNumber}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 dark:text-slate-400 italic block">The waiting list is clear</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
