CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_doctorId_appointmentDate_key" ON "Appointment"("doctorId", "appointmentDate");

CREATE INDEX IF NOT EXISTS "Appointment_doctorId_idx" ON "Appointment"("doctorId");

CREATE INDEX IF NOT EXISTS "Appointment_patientId_idx" ON "Appointment"("patientId");

CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status");

CREATE INDEX IF NOT EXISTS "Appointment_doctorId_status_idx" ON "Appointment"("doctorId", "status");

CREATE INDEX IF NOT EXISTS "QueueToken_doctorId_idx" ON "QueueToken"("doctorId");

CREATE INDEX IF NOT EXISTS "QueueToken_status_idx" ON "QueueToken"("status");

CREATE INDEX IF NOT EXISTS "QueueToken_doctorId_createdAt_idx" ON "QueueToken"("doctorId", "createdAt");