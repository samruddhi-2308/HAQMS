'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, CalendarDays, Clock, MonitorPlay, RefreshCw, Users } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const formatRelativeTime = (isoValue) => {
  if (!isoValue) return 'just now';

  const minutes = Math.round((Date.now() - new Date(isoValue).getTime()) / 60000);
  if (Number.isNaN(minutes) || minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  return `${minutes} minutes ago`;
};

export default function Home() {
  const [snapshot, setSnapshot] = useState({
    totalTokens: 0,
    activeBoards: 0,
    callingNow: 0,
    waiting: 0,
    latestCheckIn: null,
  });
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const snapshotTiles = [
    { label: 'Active tokens', value: snapshot.totalTokens, note: 'Live queue entries', icon: Activity },
    { label: 'Boards on duty', value: snapshot.activeBoards, note: 'Doctors with live check-ins', icon: MonitorPlay },
    { label: 'Calling now', value: snapshot.callingNow, note: 'Patients in progress', icon: Clock },
    { label: 'Waiting', value: snapshot.waiting, note: 'Next up in the queue', icon: CalendarDays },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadSnapshot = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/queue`);
        if (!res.ok) {
          throw new Error('Unable to load live queue snapshot.');
        }

        const tokens = await res.json();
        if (cancelled) {
          return;
        }

        const callingNow = tokens.filter((token) => token.status === 'CALLING').length;
        const waiting = tokens.filter((token) => token.status === 'WAITING').length;
        const activeBoards = new Set(tokens.map((token) => token.doctorId)).size;
        const latestCheckIn = tokens.reduce((latest, token) => {
          if (!latest) {
            return token.createdAt;
          }

          return new Date(token.createdAt).getTime() > new Date(latest).getTime() ? token.createdAt : latest;
        }, null);

        setSnapshot({
          totalTokens: tokens.length,
          activeBoards,
          callingNow,
          waiting,
          latestCheckIn,
        });
        setSnapshotError('');
        setLastSyncedAt(new Date().toISOString());
      } catch (error) {
        if (!cancelled) {
          setSnapshotError('Live snapshot temporarily unavailable.');
        }
      } finally {
        if (!cancelled) {
          setSnapshotLoading(false);
        }
      }
    };

    loadSnapshot();
    const intervalId = setInterval(loadSnapshot, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-12 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 -z-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-0 bottom-0 -z-10 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="mx-auto mt-12 w-full max-w-6xl sm:mt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/15 bg-teal-500/10 px-3 py-1 text-sm font-medium text-teal-600 animate-pulse dark:text-teal-400">
            <Activity className="h-4 w-4" />
            Live operations feed connected
          </div>

          <h1 className="display-font mt-6 text-4xl font-black tracking-tight bg-gradient-to-r from-teal-700 via-cyan-600 to-emerald-500 bg-clip-text text-transparent sm:text-6xl">
            HAQMS
          </h1>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
            Hospital Appointment & Queue Management System
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-700 dark:text-slate-300">
            A clinic operations workspace for front-desk staff, doctors, and administrators. Live queue activity and appointment flow update in real time so the landing page reflects the current day.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {snapshotTiles.map(({ label, value, note, icon: Icon }) => (
            <div
              key={label}
              className="glass rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-xl bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {label}
                </span>
              </div>
              <div className="mt-4 text-3xl font-black text-slate-900 dark:text-slate-100">
                {snapshotLoading ? '...' : value}
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{note}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            {lastSyncedAt ? `Synced ${formatRelativeTime(lastSyncedAt)}` : 'Syncing now...'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {snapshot.latestCheckIn ? `Most recent check-in ${formatRelativeTime(snapshot.latestCheckIn)}` : 'No check-ins yet'}
          </span>
          {snapshotError && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-700 dark:text-amber-300">
              {snapshotError}
            </span>
          )}
        </div>

        <div className="mt-8 glass rounded-3xl border border-slate-200/80 p-6 shadow-xl dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-400">
              <MonitorPlay className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Operational flow</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Reception registers patients, staff books appointments, doctors call from the queue, and administrators review throughput from the same dataset.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
          <Link href="/login" className="group">
            <div className="glass rounded-2xl border border-slate-200 p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-teal-500/10 dark:border-slate-800">
              <div className="w-fit rounded-xl bg-teal-500/10 p-3 text-teal-600 transition-colors duration-300 group-hover:bg-teal-500 group-hover:text-white dark:text-teal-400">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="mt-6 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                Staff Portal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                Secure access for reception, clinical, and administrative workflows.
              </p>
            </div>
          </Link>

          <Link href="/queue" className="group">
            <div className="glass rounded-2xl border border-slate-200 p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-teal-500/10 dark:border-slate-800">
              <div className="w-fit rounded-xl bg-teal-500/10 p-3 text-teal-600 transition-colors duration-300 group-hover:bg-teal-500 group-hover:text-white dark:text-teal-400">
                <MonitorPlay className="h-6 w-6" />
              </div>
              <h2 className="mt-6 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                Live Public Queue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                See who is being called, who is waiting, and which physicians are active right now.
              </p>
            </div>
          </Link>
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-600 dark:text-slate-400">
        HAQMS live operations workspace &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
