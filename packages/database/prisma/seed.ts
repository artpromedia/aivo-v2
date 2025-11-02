/**
 * Database Seeding Script for Aivo Platform
 * Populates the database with sample data for development and testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Demo School District',
        slug: 'demo-district',
        domain: 'demo.aivo.education',
        region: 'US',
        timezone: 'America/New_York',
        settings: {
          features: {
            focusGuardian: true,
            homeworkHelper: true,
            gameGeneration: true,
            writingPad: true,
          },
          privacy: {
            dataRetention: 365,
            parentalConsent: true,
          },
        },
      },
    });
    console.log('✅ Created tenant:', tenant.name);

    // Create district
    const district = await prisma.district.create({
      data: {
        tenantId: tenant.id,
        name: 'Riverside School District',
        code: 'RSD-001',
        address: {
          street: '123 Education Blvd',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92501',
          country: 'US',
        },
        contactInfo: {
          phone: '(951) 555-0123',
          email: 'info@riverside.edu',
          website: 'https://riverside.edu',
        },
      },
    });
    console.log('✅ Created district:', district.name);

    // Create schools
    const elementarySchool = await prisma.school.create({
      data: {
        tenantId: tenant.id,
        districtId: district.id,
        name: 'Riverside Elementary School',
        code: 'RES-001',
        type: 'elementary',
        address: {
          street: '456 Learning Lane',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92501',
        },
        contactInfo: {
          phone: '(951) 555-0124',
          email: 'elementary@riverside.edu',
        },
      },
    });

    const middleSchool = await prisma.school.create({
      data: {
        tenantId: tenant.id,
        districtId: district.id,
        name: 'Riverside Middle School',
        code: 'RMS-001',
        type: 'middle',
        address: {
          street: '789 Scholar Street',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92501',
        },
        contactInfo: {
          phone: '(951) 555-0125',
          email: 'middle@riverside.edu',
        },
      },
    });
    console.log('✅ Created schools');

    // Create classrooms
    const grade3Classroom = await prisma.classroom.create({
      data: {
        schoolId: elementarySchool.id,
        name: 'Room 101 - 3rd Grade',
        gradeLevel: '3',
        subject: 'general',
        capacity: 25,
      },
    });

    const grade7MathClassroom = await prisma.classroom.create({
      data: {
        schoolId: middleSchool.id,
        name: 'Room 205 - 7th Grade Math',
        gradeLevel: '7',
        subject: 'math',
        capacity: 30,
      },
    });
    console.log('✅ Created classrooms');

    // Create users
    const teacher1 = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'sarah.johnson@riverside.edu',
        firstName: 'Sarah',
        lastName: 'Johnson',
        displayName: 'Ms. Johnson',
        role: 'teacher',
        schoolId: elementarySchool.id,
        emailVerified: true,
      },
    });

    const teacher2 = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'mike.rodriguez@riverside.edu',
        firstName: 'Mike',
        lastName: 'Rodriguez',
        displayName: 'Mr. Rodriguez',
        role: 'teacher',
        schoolId: middleSchool.id,
        emailVerified: true,
      },
    });

    // Create parent
    const parent1 = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'emily.chen@email.com',
        firstName: 'Emily',
        lastName: 'Chen',
        displayName: 'Emily Chen',
        role: 'parent',
        emailVerified: true,
      },
    });

    // Create students
    const student1 = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        firstName: 'Alex',
        lastName: 'Chen',
        displayName: 'Alex',
        role: 'learner',
        grade: '3',
        schoolId: elementarySchool.id,
        hasIEP: true,
        disabilities: ['learning_disability', 'adhd'],
        learningStyle: {
          primary: 'visual',
          secondary: 'kinesthetic',
          preferences: {
            colorCoding: true,
            breakFrequency: 'high',
            visualAids: true,
          },
        },
        accessibility: {
          textToSpeech: true,
          extendedTime: true,
          reducedDistraction: true,
        },
        focusBaseline: {
          attentionSpan: 15, // minutes
          distractionSensitivity: 'high',
          optimalTimes: ['9:00-10:30', '13:00-14:00'],
        },
      },
    });

    const student2 = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        firstName: 'Jordan',
        lastName: 'Smith',
        displayName: 'Jordan',
        role: 'learner',
        grade: '7',
        schoolId: middleSchool.id,
        hasIEP: false,
        has504Plan: true,
        learningStyle: {
          primary: 'auditory',
          secondary: 'visual',
          preferences: {
            backgroundMusic: false,
            quietEnvironment: true,
          },
        },
        accessibility: {
          audioSupport: true,
          closedCaptions: true,
        },
        focusBaseline: {
          attentionSpan: 25,
          distractionSensitivity: 'medium',
        },
      },
    });
    console.log('✅ Created users');

    // Create parent-student relationship
    await prisma.parentStudentRelation.create({
      data: {
        parentId: parent1.id,
        studentId: student1.id,
        relationship: 'parent',
        isPrimary: true,
        receiveNotifications: true,
      },
    });

    // Assign students to classrooms
    await prisma.classroom.update({
      where: { id: grade3Classroom.id },
      data: {
        students: { connect: { id: student1.id } },
        teachers: { connect: { id: teacher1.id } },
      },
    });

    await prisma.classroom.update({
      where: { id: grade7MathClassroom.id },
      data: {
        students: { connect: { id: student2.id } },
        teachers: { connect: { id: teacher2.id } },
      },
    });

    // Skip student profiles for basic seeding

    // Skip advanced features for basic seeding
    console.log('✅ Skipping game templates and writing prompts for initial setup');

    // Create consent records
    await prisma.consentRecord.create({
      data: {
        userId: student1.id,
        type: 'data_collection',
        granted: true,
        grantedBy: parent1.id,
        grantedAt: new Date(),
        metadata: {
          consentForm: 'digital_learning_v1.2',
          features: ['focus_monitoring', 'ai_assistance', 'progress_tracking'],
        },
      },
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Created:');
    console.log('   • 1 Tenant (Demo School District)');
    console.log('   • 1 District (Riverside School District)');
    console.log('   • 2 Schools (Elementary & Middle)');
    console.log('   • 2 Classrooms');
    console.log('   • 4 Users (2 Teachers, 1 Parent, 2 Students)');
    console.log('   • 1 Parent-Student Relationship');
    console.log('   • 1 Consent Record');
    console.log('');
    console.log('🚀 Ready for development!');
    console.log('   • Use `npm run db:studio` to explore the data');
    console.log('   • Basic multi-tenant structure in place');
    console.log('   • Teachers and students ready for Phase 1 testing');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });