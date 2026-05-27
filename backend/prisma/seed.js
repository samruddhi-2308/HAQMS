const bcrypt = require('bcryptjs');
const { PrismaClient, UserRole, AppointmentStatus, QueueStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const shiftDate = (daysFromNow, hours, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

async function main() {
  await prisma.queueToken.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@haqms.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const receptionistUser = await prisma.user.create({
    data: {
      email: 'reception1@haqms.com',
      password: hashedPassword,
      name: 'Reception One',
      role: UserRole.RECEPTIONIST,
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor1@haqms.com',
      password: hashedPassword,
      name: 'Dr. Amina Rahman',
      role: UserRole.DOCTOR,
    },
  });

  const doctorOne = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      name: 'Dr. Amina Rahman',
      specialization: 'Cardiothoracic Surgery',
      department: 'Surgery',
      experience: 12,
      consultationFee: 500,
    },
  });

  const doctorTwo = await prisma.doctor.create({
    data: {
      name: 'Dr. Daniel Park',
      specialization: 'Neurology',
      department: 'Medicine',
      experience: 18,
      consultationFee: 850,
    },
  });

  const doctorThree = await prisma.doctor.create({
    data: {
      name: 'Dr. Priya Nair',
      specialization: 'Internal Medicine',
      department: 'General Medicine',
      experience: 10,
      consultationFee: 650,
    },
  });

  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'Nadia Shah',
        email: 'nadia.shah@example.com',
        phoneNumber: '555-0101',
        age: 35,
        gender: 'Female',
        medicalHistory: null,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Omar Hassan',
        email: 'omar.hassan@example.com',
        phoneNumber: '555-0199',
        age: 42,
        gender: 'Male',
        medicalHistory: null,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Elena Torres',
        email: 'elena.torres@example.com',
        phoneNumber: '555-0112',
        age: 33,
        gender: 'Female',
        medicalHistory: 'Annual wellness follow-up and mobility assessment.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Lucas Miller',
        email: 'lucas.miller@example.com',
        phoneNumber: '555-0144',
        age: 25,
        gender: 'Male',
        medicalHistory: 'Seasonal allergies and fatigue management.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Fatima Khan',
        email: 'fatima.khan@example.com',
        phoneNumber: '555-0155',
        age: 48,
        gender: 'Female',
        medicalHistory: 'Post-operative cardiology review.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Sophia Bennett',
        email: 'sophia.bennett@example.com',
        phoneNumber: '555-0166',
        age: 36,
        gender: 'Female',
        medicalHistory: 'Routine consultation and lab review.',
      },
    }),
  ]);

  const appointments = [];

  appointments.push(
    await prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        doctorId: doctorOne.id,
        appointmentDate: shiftDate(1, 9, 0),
        reason: 'Annual cardiac review',
        status: AppointmentStatus.PENDING,
      },
    })
  );

  appointments.push(
    await prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        doctorId: doctorOne.id,
        appointmentDate: shiftDate(1, 9, 30),
        reason: 'Follow-up on test results',
        status: AppointmentStatus.COMPLETED,
      },
    })
  );

  appointments.push(
    await prisma.appointment.create({
      data: {
        patientId: patients[2].id,
        doctorId: doctorOne.id,
        appointmentDate: shiftDate(1, 10, 0),
        reason: 'Mobility consultation',
        status: AppointmentStatus.PENDING,
      },
    })
  );

  appointments.push(
    await prisma.appointment.create({
      data: {
        patientId: patients[3].id,
        doctorId: doctorTwo.id,
        appointmentDate: shiftDate(1, 10, 30),
        reason: 'Neurology review',
        status: AppointmentStatus.CANCELLED,
      },
    })
  );

  appointments.push(
    await prisma.appointment.create({
      data: {
        patientId: patients[4].id,
        doctorId: doctorThree.id,
        appointmentDate: shiftDate(1, 11, 0),
        reason: 'Cardiology follow-up',
        status: AppointmentStatus.PENDING,
      },
    })
  );

  await prisma.queueToken.create({
    data: {
      tokenNumber: 1,
      patientId: patients[1].id,
      doctorId: doctorOne.id,
      appointmentId: appointments[1].id,
      status: QueueStatus.CALLING,
    },
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 2,
      patientId: patients[2].id,
      doctorId: doctorOne.id,
      appointmentId: appointments[2].id,
      status: QueueStatus.WAITING,
    },
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 1,
      patientId: patients[3].id,
      doctorId: doctorTwo.id,
      appointmentId: appointments[3].id,
      status: QueueStatus.WAITING,
    },
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 1,
      patientId: patients[4].id,
      doctorId: doctorThree.id,
      appointmentId: appointments[4].id,
      status: QueueStatus.WAITING,
    },
  });

  console.log('Seed complete.');
  console.log({ adminUser: adminUser.email, receptionistUser: receptionistUser.email, doctorUser: doctorUser.email });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });