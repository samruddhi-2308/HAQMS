'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';

export default function PatientHistoryRecordsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, API_BASE_URL, user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const controller = new AbortController();

    const loadPatient = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load patient history');
        }

        setPatient(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPatient();

    return () => controller.abort();
  }, [API_BASE_URL, id, router, token]);

  const appointments = useMemo(() => {
    return patient?.appointments || [];
  }, [patient]);

  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const historyText = patient?.medicalHistory?.trim();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            ← Back
          </button>
          <div className="text-xs text-slate-400 font-medium">
            Signed in as {user?.name || 'User'}
          </div>
        </div>

        {loading ? (
          <div className="glass p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
            Loading patient history...
          </div>
        ) : error ? (
          <div className="glass p-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-500/10 text-rose-600 dark:text-rose-400">
            {error}
          </div>
        ) : patient ? (
          <div className="space-y-6">
            <section className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {patient.name}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {patient.age} yrs · {patient.gender} · {patient.phoneNumber}
                  </p>
                  {patient.email && (
                    <p className="text-sm text-slate-500">{patient.email}</p>
                  )}
                </div>
                <div className="px-3 py-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 text-sm font-semibold">
                  Patient ID: {patient.id}
                </div>
              </div>
            </section>

            <section className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                Clinical Background
              </h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {historyText || 'No medical history on record.'}
              </p>
            </section>

            <section className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Appointment History
                </h2>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {appointments.length} records
                </span>
              </div>

              {appointments.length === 0 ? (
                <p className="text-sm text-slate-500">No appointments found for this patient.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Doctor</th>
                        <th className="pb-3 pr-4">Reason</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="align-top">
                          <td className="py-4 pr-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {formatDateTime(appointment.appointmentDate)}
                          </td>
                          <td className="py-4 pr-4 text-slate-800 dark:text-slate-100 font-semibold">
                            {appointment.doctor?.name || '—'}
                            {appointment.doctor?.specialization && (
                              <div className="text-xs font-medium text-slate-400 mt-1">
                                {appointment.doctor.specialization}
                              </div>
                            )}
                          </td>
                          <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">
                            {appointment.reason || '—'}
                          </td>
                          <td className="py-4">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {appointment.status || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No patient found.
          </div>
        )}
      </main>
    </div>
  );
}
