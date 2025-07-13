/* eslint-disable no-await-in-loop */
import firebaseAdmin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin with emulator settings
const FIRESTORE_EMULATOR_PORT = 8090;
const AUTH_EMULATOR_PORT = 9099;
const STORAGE_EMULATOR_PORT = 9199;

process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${FIRESTORE_EMULATOR_PORT}`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = `127.0.0.1:${AUTH_EMULATOR_PORT}`;
process.env.FIREBASE_STORAGE_EMULATOR_HOST = `127.0.0.1:${STORAGE_EMULATOR_PORT}`;

const adminApp = firebaseAdmin.initializeApp({
    projectId: 'holee-app',
    storageBucket: 'holee-app.appspot.com',
});

export const dbAdmin = adminApp.firestore();

// Import domain entities
import { Application, ApplicationStatus, ApplicationStep } from '../src/domain/applications/entity';
import { Conversation, ConversationRole, CandidateRelevantData } from '../src/domain/conversations/entity';
import { Job, WorkMode, JobType, JobStatus } from '../src/domain/jobs/entity';
import { Store, Address } from '../src/domain/stores/entity';
import { Message } from '../src/domain/messages/entity';

export const clearAuthData = async () =>
    axios.delete(
        `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/holee-app/accounts`
    );

export const clearFirestoreData = async () =>
    axios.delete(
        `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/holee-app/databases/(default)/documents`
    );

(async () => {
    console.log('Starting database seeding...');

    // Clear existing data
    await clearAuthData();
    await clearFirestoreData();

    // Create Admin User
    const adminDisplayName = 'Admin User';
    const adminEmail = 'admin@holee-app.com';
    const adminPassword = 'admin123';
    const adminPhone = '+5511999999999';

    let adminUserRecord;
    try {
        adminUserRecord = await firebaseAdmin
            .auth()
            .createUser({
                email: adminEmail,
                password: adminPassword,
                displayName: adminDisplayName,
                phoneNumber: adminPhone,
            });
        console.log('Admin user created:', adminUserRecord.uid);
    } catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    }

    // Create HR User
    const hrDisplayName = 'HR Manager';
    const hrEmail = 'hr@techcorp.com';
    const hrPassword = 'hr123456';
    const hrPhone = '+5511888888888';

    let hrUserRecord;
    try {
        hrUserRecord = await firebaseAdmin
            .auth()
            .createUser({
                email: hrEmail,
                password: hrPassword,
                displayName: hrDisplayName,
                phoneNumber: hrPhone,
            });
        console.log('HR user created:', hrUserRecord.uid);
    } catch (error) {
        console.error('Error creating HR user:', error);
        throw error;
    }

    // Create Stores (Companies)
    const stores: Store[] = [
        {
            name: 'TechCorp Solutions',
            address: {
                city: 'São Paulo',
                complement: 'Andar 12',
                country: 'Brasil',
                neighborhood: 'Vila Olímpia',
                number: '1000',
                state: 'SP',
                street: 'Av. Brigadeiro Faria Lima',
                zipcode: '04538-132',
            },
            phone: '+5511987654321',
            email: 'contato@techcorp.com',
            links: {
                website: 'https://techcorp.com',
                instagram: 'https://instagram.com/techcorp',
                linkedin: 'https://linkedin.com/company/techcorp',
            },
            owner: {
                name: hrDisplayName,
                id: hrUserRecord.uid,
            },
            mission: 'Transformar o mundo através da tecnologia',
            vision: 'Ser a empresa de tecnologia mais inovadora do Brasil',
            values: ['Inovação', 'Transparência', 'Colaboração', 'Excelência'],
            description: 'Empresa líder em soluções tecnológicas para transformação digital',
            logo: 'https://via.placeholder.com/200x200/0066cc/ffffff?text=TechCorp',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: true,
            isDeleted: false,
        },
        {
            name: 'StartupXYZ',
            address: {
                city: 'Rio de Janeiro',
                complement: 'Sala 501',
                country: 'Brasil',
                neighborhood: 'Ipanema',
                number: '456',
                state: 'RJ',
                street: 'Rua Visconde de Pirajá',
                zipcode: '22410-002',
            },
            phone: '+5521987654321',
            email: 'jobs@startupxyz.com',
            links: {
                website: 'https://startupxyz.com',
                linkedin: 'https://linkedin.com/company/startupxyz',
            },
            owner: {
                name: hrDisplayName,
                id: hrUserRecord.uid,
            },
            mission: 'Revolucionar a forma como as pessoas trabalham',
            vision: 'Criar o futuro do trabalho remoto',
            values: ['Agilidade', 'Criatividade', 'Diversidade', 'Flexibilidade'],
            description: 'Startup focada em soluções para trabalho remoto e colaboração',
            logo: 'https://via.placeholder.com/200x200/ff6600/ffffff?text=XYZ',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: true,
            isDeleted: false,
        },
        {
            name: 'GlobalTech Industries',
            address: {
                city: 'Belo Horizonte',
                complement: 'Torre A',
                country: 'Brasil',
                neighborhood: 'Savassi',
                number: '789',
                state: 'MG',
                street: 'Av. do Contorno',
                zipcode: '30110-017',
            },
            phone: '+5531987654321',
            email: 'careers@globaltech.com',
            links: {
                website: 'https://globaltech.com',
                linkedin: 'https://linkedin.com/company/globaltech',
            },
            owner: {
                name: hrDisplayName,
                id: hrUserRecord.uid,
            },
            mission: 'Conectar talentos globais com oportunidades locais',
            vision: 'Ser a ponte entre o talento brasileiro e o mundo',
            values: ['Globalização', 'Inclusão', 'Qualidade', 'Crescimento'],
            description: 'Empresa multinacional com foco em tecnologia e inovação',
            logo: 'https://via.placeholder.com/200x200/009900/ffffff?text=GT',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: true,
            isDeleted: false,
        },
    ];

    const createdStores: string[] = [];
    for (const store of stores) {
        const storeRef = await dbAdmin.collection('stores').add(store);
        createdStores.push(storeRef.id);
        console.log(`Created store: ${store.name} (ID: ${storeRef.id})`);
    }

    // Ensure we have the expected number of stores
    if (createdStores.length !== stores.length) {
        throw new Error(`Expected ${stores.length} stores, but created ${createdStores.length}`);
    }

    // Create onboarding data for admin user
    const adminOnboardingData = {
        'store-configuration': createdStores[0], // Associate with first store
    };

    await dbAdmin
        .collection('onboarding')
        .doc(adminUserRecord.uid)
        .set(adminOnboardingData);

    // Create onboarding data for HR user
    const hrOnboardingData = {
        'store-configuration': createdStores[0], // Associate with first store
    };

    await dbAdmin
        .collection('onboarding')
        .doc(hrUserRecord.uid)
        .set(hrOnboardingData);

    console.log('Created onboarding data for admin and HR users');

    // Create Jobs
    const currentTime = Date.now();
    const jobs: Job[] = [
        // TechCorp Jobs
        {
            storeId: createdStores[0]!,
            title: 'Desenvolvedor Full Stack Sênior',
            description: 'Procuramos um desenvolvedor experiente para liderar nossa equipe de desenvolvimento. Você trabalhará com tecnologias modernas como React, Node.js, e AWS.',
            location: 'São Paulo, SP',
            numberOfPositions: 2,
            seniorityLevel: 'Senior',
            requiredSkills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
            niceToHaveSkills: ['TypeScript', 'GraphQL', 'Kubernetes'],
            languagesRequired: ['Português', 'Inglês'],
            salaryRange: {
                min: 12000,
                max: 18000,
            },
            minExperienceYears: 5,
            workMode: WorkMode.HYBRID,
            jobType: JobType.FULL_TIME,
            applyStart: currentTime,
            applyEnd: currentTime + (30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: JobStatus.OPEN,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
        {
            storeId: createdStores[0]!,
            title: 'Product Manager',
            description: 'Buscamos um Product Manager para definir a estratégia e roadmap de nossos produtos digitais.',
            location: 'São Paulo, SP',
            numberOfPositions: 1,
            seniorityLevel: 'Pleno',
            requiredSkills: ['Product Management', 'Agile', 'Scrum', 'Analytics'],
            niceToHaveSkills: ['UX Design', 'Data Analysis', 'SQL'],
            languagesRequired: ['Português', 'Inglês'],
            salaryRange: {
                min: 10000,
                max: 15000,
            },
            minExperienceYears: 3,
            workMode: WorkMode.HYBRID,
            jobType: JobType.FULL_TIME,
            applyStart: currentTime,
            applyEnd: currentTime + (45 * 24 * 60 * 60 * 1000), // 45 days from now
            status: JobStatus.OPEN,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
        {
            storeId: createdStores[0]!,
            title: 'DevOps Engineer',
            description: 'Procuramos um especialista em DevOps para otimizar nossa infraestrutura e pipelines de CI/CD.',
            location: 'São Paulo, SP',
            numberOfPositions: 1,
            seniorityLevel: 'Senior',
            requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
            niceToHaveSkills: ['Terraform', 'Ansible', 'Monitoring'],
            languagesRequired: ['Português', 'Inglês'],
            salaryRange: {
                min: 13000,
                max: 20000,
            },
            minExperienceYears: 4,
            workMode: WorkMode.REMOTE,
            jobType: JobType.FULL_TIME,
            applyStart: currentTime,
            applyEnd: currentTime + (60 * 24 * 60 * 60 * 1000), // 60 days from now
            status: JobStatus.OPEN,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
        // StartupXYZ Jobs
        {
            storeId: createdStores[1]!,
            title: 'Frontend Developer',
            description: 'Desenvolvedor frontend para criar interfaces incríveis usando React e TypeScript.',
            location: 'Rio de Janeiro, RJ',
            numberOfPositions: 3,
            seniorityLevel: 'Pleno',
            requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML'],
            niceToHaveSkills: ['Next.js', 'Styled Components', 'Jest'],
            languagesRequired: ['Português'],
            salaryRange: {
                min: 8000,
                max: 12000,
            },
            minExperienceYears: 2,
            workMode: WorkMode.REMOTE,
            jobType: JobType.FULL_TIME,
            applyStart: currentTime,
            applyEnd: currentTime + (30 * 24 * 60 * 60 * 1000),
            status: JobStatus.OPEN,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
        {
            storeId: createdStores[1]!,
            title: 'UX/UI Designer',
            description: 'Designer para criar experiências digitais excepcionais para nossos usuários.',
            location: 'Rio de Janeiro, RJ',
            numberOfPositions: 2,
            seniorityLevel: 'Pleno',
            requiredSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
            niceToHaveSkills: ['After Effects', 'Illustration', 'Framer'],
            languagesRequired: ['Português'],
            salaryRange: {
                min: 7000,
                max: 11000,
            },
            minExperienceYears: 2,
            workMode: WorkMode.HYBRID,
            jobType: JobType.FULL_TIME,
            applyStart: currentTime,
            applyEnd: currentTime + (45 * 24 * 60 * 60 * 1000),
            status: JobStatus.OPEN,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
        // GlobalTech Jobs
        {
            storeId: createdStores[2]!,
            title: 'Data Scientist',
            description: 'Cientista de dados para trabalhar com machine learning e análise de dados em escala global.',
            location: 'Belo Horizonte, MG',
            numberOfPositions: 1,
            seniorityLevel: 'Senior',
            requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
            niceToHaveSkills: ['TensorFlow', 'PyTorch', 'Spark', 'MLOps'],
            languagesRequired: ['Português', 'Inglês'],
            salaryRange: {
                min: 15000,
                max: 25000,
            },
            minExperienceYears: 4,
            workMode: WorkMode.REMOTE,
            jobType: JobType.FULL_TIME,
            applyStart: currentTime,
            applyEnd: currentTime + (60 * 24 * 60 * 60 * 1000),
            status: JobStatus.OPEN,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
        {
            storeId: createdStores[2]!,
            title: 'Backend Developer Java',
            description: 'Desenvolvedor backend Java para sistemas distribuídos de alta performance.',
            location: 'Belo Horizonte, MG',
            numberOfPositions: 2,
            seniorityLevel: 'Pleno',
            requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST APIs'],
            niceToHaveSkills: ['Microservices', 'Kafka', 'Redis', 'MongoDB'],
            languagesRequired: ['Português', 'Inglês'],
            salaryRange: {
                min: 9000,
                max: 14000,
            },
            minExperienceYears: 3,
            workMode: WorkMode.HYBRID,
            jobType: JobType.FULL_TIME,
            applyStart: currentTime,
            applyEnd: currentTime + (45 * 24 * 60 * 60 * 1000),
            status: JobStatus.OPEN,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
        // Closed job for testing
        {
            storeId: createdStores[0]!,
            title: 'Mobile Developer (FECHADA)',
            description: 'Desenvolvedor mobile para apps iOS e Android (vaga já preenchida).',
            location: 'São Paulo, SP',
            numberOfPositions: 1,
            seniorityLevel: 'Pleno',
            requiredSkills: ['React Native', 'iOS', 'Android'],
            niceToHaveSkills: ['Flutter', 'Swift', 'Kotlin'],
            languagesRequired: ['Português'],
            salaryRange: {
                min: 8000,
                max: 12000,
            },
            minExperienceYears: 2,
            workMode: WorkMode.HYBRID,
            jobType: JobType.FULL_TIME,
            applyStart: currentTime - (60 * 24 * 60 * 60 * 1000), // 60 days ago
            applyEnd: currentTime - (30 * 24 * 60 * 60 * 1000), // 30 days ago
            status: JobStatus.CLOSED,
            createdAt: currentTime - (60 * 24 * 60 * 60 * 1000),
            updatedAt: currentTime - (30 * 24 * 60 * 60 * 1000),
        },
    ];

    const createdJobs: string[] = [];
    for (const job of jobs) {
        const jobRef = await dbAdmin.collection('jobs').add(job);
        createdJobs.push(jobRef.id);
        console.log(`Created job: ${job.title} (ID: ${jobRef.id})`);
    }

    // Ensure we have the expected number of jobs
    if (createdJobs.length !== jobs.length) {
        throw new Error(`Expected ${jobs.length} jobs, but created ${createdJobs.length}`);
    }

    // Create sample candidate users
    const candidateUsers = [
        {
            displayName: 'João Silva',
            email: 'joao.silva@email.com',
            password: 'candidate123',
            phone: '+5511111111111',
        },
        {
            displayName: 'Maria Santos',
            email: 'maria.santos@email.com',
            password: 'candidate123',
            phone: '+5511222222222',
        },
        {
            displayName: 'Carlos Oliveira',
            email: 'carlos.oliveira@email.com',
            password: 'candidate123',
            phone: '+5511333333333',
        },
        {
            displayName: 'Ana Costa',
            email: 'ana.costa@email.com',
            password: 'candidate123',
            phone: '+5511444444444',
        },
        {
            displayName: 'Pedro Ferreira',
            email: 'pedro.ferreira@email.com',
            password: 'candidate123',
            phone: '+5511555555555',
        },
    ];

    const createdCandidates: string[] = [];
    for (const candidate of candidateUsers) {
        try {
            const candidateRecord = await firebaseAdmin
                .auth()
                .createUser({
                    email: candidate.email,
                    password: candidate.password,
                    displayName: candidate.displayName,
                    phoneNumber: candidate.phone,
                });
            createdCandidates.push(candidateRecord.uid);
            console.log(`Created candidate: ${candidate.displayName} (ID: ${candidateRecord.uid})`);

            // Create basic onboarding data for candidate users
            const candidateOnboardingData = {
                'profile-setup': true,
                'preferences': true,
            };

            await dbAdmin
                .collection('onboarding')
                .doc(candidateRecord.uid)
                .set(candidateOnboardingData);

        } catch (error) {
            console.error(`Error creating candidate ${candidate.displayName}:`, error);
        }
    }

    console.log('Created onboarding data for candidate users');

    // Create Conversations
    const conversations: Conversation[] = [
        {
            name: 'João Silva',
            photo: 'https://via.placeholder.com/150x150/4285f4/ffffff?text=JS',
            lastMessageTimestamp: currentTime - (2 * 60 * 60 * 1000), // 2 hours ago
            role: 'USER',
            subscribedJobIds: [createdJobs[0]!, createdJobs[1]!],
            employed: false,
            profileCompleted: true,
            relevantData: {
                fullName: 'João Silva',
                birthDate: '1990-05-15',
                region: 'São Paulo – SP',
                expectedSalary: 15000,
                interests: ['JavaScript', 'React', 'Node.js', 'AWS'],
                linkedin: {
                    url: 'https://linkedin.com/in/joao-silva',
                },
                resume: {
                    url: 'https://example.com/resume-joao.pdf',
                },
            },
        },
        {
            name: 'Maria Santos',
            photo: 'https://via.placeholder.com/150x150/ea4335/ffffff?text=MS',
            lastMessageTimestamp: currentTime - (1 * 60 * 60 * 1000), // 1 hour ago
            role: 'USER',
            subscribedJobIds: [createdJobs[3]!, createdJobs[4]!],
            employed: false,
            profileCompleted: true,
            relevantData: {
                fullName: 'Maria Santos',
                birthDate: '1992-08-20',
                region: 'Rio de Janeiro – RJ',
                expectedSalary: 10000,
                interests: ['UX Design', 'Figma', 'User Research', 'Prototyping'],
                linkedin: {
                    url: 'https://linkedin.com/in/maria-santos',
                },
                resume: {
                    url: 'https://example.com/resume-maria.pdf',
                },
            },
        },
        {
            name: 'Carlos Oliveira',
            photo: 'https://via.placeholder.com/150x150/34a853/ffffff?text=CO',
            lastMessageTimestamp: currentTime - (30 * 60 * 1000), // 30 minutes ago
            role: 'USER',
            subscribedJobIds: [createdJobs[2]!, createdJobs[5]!],
            employed: true,
            profileCompleted: true,
            relevantData: {
                fullName: 'Carlos Oliveira',
                birthDate: '1988-03-10',
                region: 'Belo Horizonte – MG',
                expectedSalary: 18000,
                interests: ['DevOps', 'AWS', 'Docker', 'Kubernetes'],
                linkedin: {
                    url: 'https://linkedin.com/in/carlos-oliveira',
                },
                resume: {
                    url: 'https://example.com/resume-carlos.pdf',
                },
            },
        },
        {
            name: 'Ana Costa',
            photo: 'https://via.placeholder.com/150x150/fbbc05/ffffff?text=AC',
            lastMessageTimestamp: currentTime - (4 * 60 * 60 * 1000), // 4 hours ago
            role: 'USER',
            subscribedJobIds: [createdJobs[6]!],
            employed: false,
            profileCompleted: false,
            relevantData: {
                fullName: 'Ana Costa',
                birthDate: '1995-11-25',
                region: 'Belo Horizonte – MG',
                expectedSalary: 12000,
                interests: ['Python', 'Machine Learning', 'Data Science'],
                linkedin: {
                    url: 'https://linkedin.com/in/ana-costa',
                },
                resume: {
                    url: 'https://example.com/resume-ana.pdf',
                },
            },
        },
        {
            name: 'Pedro Ferreira',
            photo: 'https://via.placeholder.com/150x150/9c27b0/ffffff?text=PF',
            lastMessageTimestamp: currentTime - (6 * 60 * 60 * 1000), // 6 hours ago
            role: 'USER',
            subscribedJobIds: [createdJobs[7]!],
            employed: false,
            profileCompleted: true,
            relevantData: {
                fullName: 'Pedro Ferreira',
                birthDate: '1991-07-12',
                region: 'Belo Horizonte – MG',
                expectedSalary: 11000,
                interests: ['Java', 'Spring Boot', 'Microservices', 'SQL'],
                linkedin: {
                    url: 'https://linkedin.com/in/pedro-ferreira',
                },
                resume: {
                    url: 'https://example.com/resume-pedro.pdf',
                },
            },
        },
        // HR Admin conversation
        {
            name: 'HR Manager',
            photo: 'https://via.placeholder.com/150x150/ff5722/ffffff?text=HR',
            lastMessageTimestamp: currentTime - (12 * 60 * 60 * 1000), // 12 hours ago
            role: 'ADMIN',
            companyName: 'TechCorp Solutions',
            employed: true,
            profileCompleted: true,
        },
    ];

    const createdConversations: string[] = [];
    for (let i = 0; i < conversations.length; i++) {
        const conversation = conversations[i]!;
        const conversationRef = await dbAdmin.collection('conversations').add(conversation);
        createdConversations.push(conversationRef.id);
        console.log(`Created conversation: ${conversation.name} (ID: ${conversationRef.id})`);
    }

    // Ensure we have the expected number of conversations
    if (createdConversations.length !== conversations.length) {
        throw new Error(`Expected ${conversations.length} conversations, but created ${createdConversations.length}`);
    }

    // Create Applications
    const applications: Application[] = [
        // João Silva applications
        {
            jobId: createdJobs[0]!, // Full Stack Senior
            conversationId: createdConversations[0]!,
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.INTERVIEW,
            createdAt: currentTime - (3 * 24 * 60 * 60 * 1000), // 3 days ago
            updatedAt: currentTime - (1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
            jobId: createdJobs[1]!, // Product Manager
            conversationId: createdConversations[0]!,
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.ACCEPT_JOB,
            createdAt: currentTime - (2 * 24 * 60 * 60 * 1000), // 2 days ago
            updatedAt: currentTime - (2 * 24 * 60 * 60 * 1000),
        },
        // Maria Santos applications
        {
            jobId: createdJobs[3]!, // Frontend Developer
            conversationId: createdConversations[1]!,
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.RANKING,
            createdAt: currentTime - (4 * 24 * 60 * 60 * 1000), // 4 days ago
            updatedAt: currentTime - (1 * 24 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[4]!, // UX/UI Designer
            conversationId: createdConversations[1]!,
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.FINALIST,
            createdAt: currentTime - (5 * 24 * 60 * 60 * 1000), // 5 days ago
            updatedAt: currentTime - (12 * 60 * 60 * 1000), // 12 hours ago
        },
        // Carlos Oliveira applications
        {
            jobId: createdJobs[2]!, // DevOps Engineer
            conversationId: createdConversations[2]!,
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.INTERVIEW,
            createdAt: currentTime - (1 * 24 * 60 * 60 * 1000), // 1 day ago
            updatedAt: currentTime - (6 * 60 * 60 * 1000), // 6 hours ago
        },
        // Ana Costa applications
        {
            jobId: createdJobs[5]!, // Data Scientist
            conversationId: createdConversations[3]!,
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (12 * 60 * 60 * 1000), // 12 hours ago
            updatedAt: currentTime - (12 * 60 * 60 * 1000),
        },
        // Pedro Ferreira applications
        {
            jobId: createdJobs[6]!, // Backend Developer Java
            conversationId: createdConversations[4]!,
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.ACCEPT_JOB,
            createdAt: currentTime - (8 * 60 * 60 * 1000), // 8 hours ago
            updatedAt: currentTime - (8 * 60 * 60 * 1000),
        },
        // Rejected application example
        {
            jobId: createdJobs[7]!, // Mobile Developer (closed)
            conversationId: createdConversations[0]!,
            status: ApplicationStatus.REJECTED,
            currentStep: ApplicationStep.INTERVIEW,
            createdAt: currentTime - (45 * 24 * 60 * 60 * 1000), // 45 days ago
            updatedAt: currentTime - (35 * 24 * 60 * 60 * 1000), // 35 days ago
        },
    ];

    for (const application of applications) {
        const applicationRef = await dbAdmin.collection('applications').add(application);
        console.log(`Created application for job ${application.jobId} (ID: ${applicationRef.id})`);
    }

    // Create sample Messages for conversations
    const messageTemplates = [
        // João Silva messages
        {
            conversationId: createdConversations[0]!,
            messages: [
                {
                    timestamp: currentTime - (3 * 24 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Olá! Vi a vaga de Desenvolvedor Full Stack Sênior e gostaria de me candidatar.',
                    },
                    isGroup: false,
                    isMe: false,
                    sender: {
                        phone: '+5511111111111',
                        name: 'João Silva',
                        photo: 'https://via.placeholder.com/150x150/4285f4/ffffff?text=JS',
                    },
                },
                {
                    timestamp: currentTime - (3 * 24 * 60 * 60 * 1000) + (5 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Ótimo! Vou analisar seu perfil e entrar em contato em breve. Você pode me enviar seu currículo?',
                    },
                    isGroup: false,
                    isMe: true,
                    sender: {
                        phone: '+5511999999999',
                        name: 'HoleeBot',
                    },
                },
                {
                    timestamp: currentTime - (3 * 24 * 60 * 60 * 1000) + (10 * 60 * 1000),
                    messagePayload: {
                        type: 'document',
                        document: 'https://example.com/resume-joao.pdf',
                        text: 'Aqui está meu currículo atualizado.',
                    },
                    isGroup: false,
                    isMe: false,
                    sender: {
                        phone: '+5511111111111',
                        name: 'João Silva',
                    },
                },
                {
                    timestamp: currentTime - (1 * 24 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Parabéns! Você passou para a etapa de entrevista. Agendar para amanhã às 14h?',
                    },
                    isGroup: false,
                    isMe: true,
                    sender: {
                        phone: '+5511999999999',
                        name: 'HoleeBot',
                    },
                },
                {
                    timestamp: currentTime - (1 * 24 * 60 * 60 * 1000) + (30 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Perfeito! Confirmo o horário das 14h. Obrigado!',
                    },
                    isGroup: false,
                    isMe: false,
                    sender: {
                        phone: '+5511111111111',
                        name: 'João Silva',
                    },
                },
            ],
        },
        // Maria Santos messages
        {
            conversationId: createdConversations[1]!,
            messages: [
                {
                    timestamp: currentTime - (4 * 24 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Oi! Tenho interesse na vaga de UX/UI Designer. Posso saber mais detalhes?',
                    },
                    isGroup: false,
                    isMe: false,
                    sender: {
                        phone: '+5511222222222',
                        name: 'Maria Santos',
                        photo: 'https://via.placeholder.com/150x150/ea4335/ffffff?text=MS',
                    },
                },
                {
                    timestamp: currentTime - (4 * 24 * 60 * 60 * 1000) + (15 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Claro! A vaga é para trabalhar no design de nossa plataforma principal. Precisa de experiência com Figma e pesquisa de usuário.',
                    },
                    isGroup: false,
                    isMe: true,
                    sender: {
                        phone: '+5511999999999',
                        name: 'HoleeBot',
                    },
                },
                {
                    timestamp: currentTime - (1 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Excelente notícia! Você está entre os finalistas. Próxima etapa será uma apresentação de case.',
                    },
                    isGroup: false,
                    isMe: true,
                    sender: {
                        phone: '+5511999999999',
                        name: 'HoleeBot',
                    },
                },
            ],
        },
        // Carlos Oliveira messages
        {
            conversationId: createdConversations[2]!,
            messages: [
                {
                    timestamp: currentTime - (1 * 24 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Olá! Sou especialista em DevOps e vi que vocês têm uma vaga aberta. Posso me candidatar?',
                    },
                    isGroup: false,
                    isMe: false,
                    sender: {
                        phone: '+5511333333333',
                        name: 'Carlos Oliveira',
                        photo: 'https://via.placeholder.com/150x150/34a853/ffffff?text=CO',
                    },
                },
                {
                    timestamp: currentTime - (6 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Ótimo perfil! Agendar entrevista técnica para quinta-feira às 10h?',
                    },
                    isGroup: false,
                    isMe: true,
                    sender: {
                        phone: '+5511999999999',
                        name: 'HoleeBot',
                    },
                },
            ],
        },
        // Ana Costa messages
        {
            conversationId: createdConversations[3]!,
            messages: [
                {
                    timestamp: currentTime - (12 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Oi! Sou cientista de dados e gostaria de me candidatar para a vaga na GlobalTech.',
                    },
                    isGroup: false,
                    isMe: false,
                    sender: {
                        phone: '+5511444444444',
                        name: 'Ana Costa',
                        photo: 'https://via.placeholder.com/150x150/fbbc05/ffffff?text=AC',
                    },
                },
                {
                    timestamp: currentTime - (12 * 60 * 60 * 1000) + (10 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Perfeito! Para começar, preciso que você complete seu perfil. Pode me enviar suas informações de LinkedIn?',
                    },
                    isGroup: false,
                    isMe: true,
                    sender: {
                        phone: '+5511999999999',
                        name: 'HoleeBot',
                    },
                },
            ],
        },
        // Pedro Ferreira messages
        {
            conversationId: createdConversations[4]!,
            messages: [
                {
                    timestamp: currentTime - (8 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Olá! Sou desenvolvedor Java e tenho interesse na vaga de Backend Developer.',
                    },
                    isGroup: false,
                    isMe: false,
                    sender: {
                        phone: '+5511555555555',
                        name: 'Pedro Ferreira',
                        photo: 'https://via.placeholder.com/150x150/9c27b0/ffffff?text=PF',
                    },
                },
                {
                    timestamp: currentTime - (8 * 60 * 60 * 1000) + (5 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Ótimo! Vi que você tem experiência com Spring Boot. Gostaria de aceitar a vaga e partir para o próximo passo?',
                    },
                    isGroup: false,
                    isMe: true,
                    sender: {
                        phone: '+5511999999999',
                        name: 'HoleeBot',
                    },
                },
            ],
        },
        // HR Admin messages
        {
            conversationId: createdConversations[5]!,
            messages: [
                {
                    timestamp: currentTime - (12 * 60 * 60 * 1000),
                    messagePayload: {
                        type: 'text',
                        text: 'Dashboard administrativo funcionando perfeitamente. Relatórios de candidatos disponíveis.',
                    },
                    isGroup: false,
                    isMe: false,
                    sender: {
                        phone: '+5511888888888',
                        name: 'HR Manager',
                        photo: 'https://via.placeholder.com/150x150/ff5722/ffffff?text=HR',
                    },
                },
            ],
        },
    ];

    // Create messages for each conversation
    for (const template of messageTemplates) {
        const conversationRef = dbAdmin.collection('conversations').doc(template.conversationId);

        for (const message of template.messages) {
            await conversationRef.collection('messages').add(message);
        }

        console.log(`Created ${template.messages.length} messages for conversation ${template.conversationId}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${stores.length} stores`);
    console.log(`- Created ${jobs.length} jobs`);
    console.log(`- Created ${candidateUsers.length} candidate users`);
    console.log(`- Created ${conversations.length} conversations`);
    console.log(`- Created ${applications.length} applications`);
    console.log(`- Created messages for ${messageTemplates.length} conversations`);
    console.log('\n🚀 The job platform is ready for testing!');

    // Log some useful information
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@holee-app.com / admin123');
    console.log('HR: hr@techcorp.com / hr123');
    console.log('Candidates: joao.silva@email.com / candidate123 (and others)');

    console.log('\n📱 Test Data:');
    console.log('- Open jobs with different statuses');
    console.log('- Applications in various stages');
    console.log('- Rich conversation history');
    console.log('- Candidate profiles with different completion levels');

})();
