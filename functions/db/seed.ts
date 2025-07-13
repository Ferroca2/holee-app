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

    // Create onboarding data for HR user
    const hrOnboardingData = {
        'store-configuration': createdStores[0], // Associate with store
    };

    await dbAdmin
        .collection('onboarding')
        .doc(hrUserRecord.uid)
        .set(hrOnboardingData);

    console.log('Created onboarding data for HR user');

    // Create Jobs
    const currentTime = Date.now();
    const jobs: Job[] = [
        // TechCorp Jobs
        {
            storeId: createdStores[0]!,
            title: 'Backend Developer Java',
            description: 'Desenvolvedor backend Java para sistemas distribuídos de alta performance.',
            location: 'São Paulo, SP',
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

    // Create sample candidate users for Java job funnel
    const candidateUsers = [
        {
            displayName: 'Rafael Almeida',
            email: 'rafael.almeida@email.com',
            password: 'candidate123',
            phone: '+5511666666666',
        },
        {
            displayName: 'Thiago Nascimento',
            email: 'thiago.nascimento@email.com',
            password: 'candidate123',
            phone: '+5511000000001',
        },
        {
            displayName: 'Fernanda Lima',
            email: 'fernanda.lima@email.com',
            password: 'candidate123',
            phone: '+5511000000002',
        },
        {
            displayName: 'Gustavo Martins',
            email: 'gustavo.martins@email.com',
            password: 'candidate123',
            phone: '+5511000000003',
        },
        {
            displayName: 'Juliana Souza',
            email: 'juliana.souza@email.com',
            password: 'candidate123',
            phone: '+5511000000004',
        },
        {
            displayName: 'Leonardo Castro',
            email: 'leonardo.castro@email.com',
            password: 'candidate123',
            phone: '+5511000000007',
        },
        {
            displayName: 'Pedro Ferreira',
            email: 'pedro.ferreira@email.com',
            password: 'candidate123',
            phone: '+5511555555555',
        },
        {
            displayName: 'Luciana Pereira',
            email: 'luciana.pereira@email.com',
            password: 'candidate123',
            phone: '+5511777777777',
        },
        {
            displayName: 'Rodrigo Barbosa',
            email: 'rodrigo.barbosa@email.com',
            password: 'candidate123',
            phone: '+5511000000005',
        },
        {
            displayName: 'Vanessa Gomes',
            email: 'vanessa.gomes@email.com',
            password: 'candidate123',
            phone: '+5511000000006',
        },
        {
            displayName: 'Bruno Cardoso',
            email: 'bruno.cardoso@email.com',
            password: 'candidate123',
            phone: '+5511000000008',
        },
        {
            displayName: 'Camila Rodrigues',
            email: 'camila.rodrigues@email.com',
            password: 'candidate123',
            phone: '+5511999999990',
        },
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
        // HR Manager conversation
        {
            name: 'HR Manager',
            photo: 'https://via.placeholder.com/150x150/ff5722/ffffff?text=HR',
            lastMessageTimestamp: currentTime - (12 * 60 * 60 * 1000), // 12 hours ago
            role: 'ADMIN',
            companyName: 'TechCorp Solutions',
            employed: true,
            profileCompleted: true,
        },
        // Java job candidates - funnel effect
        {
            name: 'Rafael Almeida',
            photo: 'https://via.placeholder.com/150x150/3f51b5/ffffff?text=RA',
            lastMessageTimestamp: currentTime - (7 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Rafael Almeida',
                address: 'São Paulo – SP',
                expectedSalary: 10000,
                interests: 'Java, Spring Boot, REST APIs, MySQL',
                linkedin: 'https://linkedin.com/in/rafael-almeida',
            },
        },
        {
            name: 'Thiago Nascimento',
            photo: 'https://via.placeholder.com/150x150/ff9800/ffffff?text=TN',
            lastMessageTimestamp: currentTime - (11 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Thiago Nascimento',
                address: 'São Paulo – SP',
                expectedSalary: 9500,
                interests: 'Java, Hibernate, JPA, MySQL',
                linkedin: 'https://linkedin.com/in/thiago-nascimento',
            },
        },
        {
            name: 'Fernanda Lima',
            photo: 'https://via.placeholder.com/150x150/8bc34a/ffffff?text=FL',
            lastMessageTimestamp: currentTime - (13 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Fernanda Lima',
                address: 'São Paulo – SP',
                expectedSalary: 11000,
                interests: 'Java, Spring Boot, Unit Testing, Agile',
                linkedin: 'https://linkedin.com/in/fernanda-lima',
            },
        },
        {
            name: 'Gustavo Martins',
            photo: 'https://via.placeholder.com/150x150/009688/ffffff?text=GM',
            lastMessageTimestamp: currentTime - (14 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Gustavo Martins',
                address: 'São Paulo – SP',
                expectedSalary: 10500,
                interests: 'Java, Spring Data, REST APIs, MongoDB',
                linkedin: 'https://linkedin.com/in/gustavo-martins',
            },
        },
        {
            name: 'Juliana Souza',
            photo: 'https://via.placeholder.com/150x150/ff5722/ffffff?text=JS',
            lastMessageTimestamp: currentTime - (15 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Juliana Souza',
                address: 'São Paulo – SP',
                expectedSalary: 12000,
                interests: 'Java, Spring MVC, Tomcat, Oracle',
                linkedin: 'https://linkedin.com/in/juliana-souza',
            },
        },
        {
            name: 'Leonardo Castro',
            photo: 'https://via.placeholder.com/150x150/795548/ffffff?text=LC',
            lastMessageTimestamp: currentTime - (18 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Leonardo Castro',
                address: 'São Paulo – SP',
                expectedSalary: 9000,
                interests: 'Java, Spring Boot, JUnit, Git',
                linkedin: 'https://linkedin.com/in/leonardo-castro',
            },
        },
        {
            name: 'Pedro Ferreira',
            photo: 'https://via.placeholder.com/150x150/9c27b0/ffffff?text=PF',
            lastMessageTimestamp: currentTime - (6 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Pedro Ferreira',
                address: 'São Paulo – SP',
                expectedSalary: 11000,
                interests: 'Java, Spring Boot, Microservices, SQL',
                linkedin: 'https://linkedin.com/in/pedro-ferreira',
            },
        },
        {
            name: 'Luciana Pereira',
            photo: 'https://via.placeholder.com/150x150/e91e63/ffffff?text=LP',
            lastMessageTimestamp: currentTime - (8 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Luciana Pereira',
                address: 'São Paulo – SP',
                expectedSalary: 11500,
                interests: 'Java, Spring Framework, Microservices, PostgreSQL',
                linkedin: 'https://linkedin.com/in/luciana-pereira',
            },
        },
        {
            name: 'Rodrigo Barbosa',
            photo: 'https://via.placeholder.com/150x150/673ab7/ffffff?text=RB',
            lastMessageTimestamp: currentTime - (16 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Rodrigo Barbosa',
                address: 'São Paulo – SP',
                expectedSalary: 13500,
                interests: 'Java, Spring WebFlux, Reactive Programming, Kafka',
                linkedin: 'https://linkedin.com/in/rodrigo-barbosa',
            },
        },
        {
            name: 'Vanessa Gomes',
            photo: 'https://via.placeholder.com/150x150/e91e63/ffffff?text=VG',
            lastMessageTimestamp: currentTime - (17 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Vanessa Gomes',
                address: 'São Paulo – SP',
                expectedSalary: 14000,
                interests: 'Java, Spring Cloud, Microservices, Redis',
                linkedin: 'https://linkedin.com/in/vanessa-gomes',
            },
        },
        {
            name: 'Bruno Cardoso',
            photo: 'https://via.placeholder.com/150x150/795548/ffffff?text=BC',
            lastMessageTimestamp: currentTime - (9 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Bruno Cardoso',
                address: 'São Paulo – SP',
                expectedSalary: 12500,
                interests: 'Java, Spring Boot, Docker, Jenkins',
                linkedin: 'https://linkedin.com/in/bruno-cardoso',
            },
        },
        {
            name: 'Camila Rodrigues',
            photo: 'https://via.placeholder.com/150x150/607d8b/ffffff?text=CR',
            lastMessageTimestamp: currentTime - (10 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Camila Rodrigues',
                address: 'São Paulo – SP',
                expectedSalary: 13000,
                interests: 'Java, Spring Security, Maven, Git',
                linkedin: 'https://linkedin.com/in/camila-rodrigues',
            },
        },
        {
            name: 'João Silva',
            photo: 'https://via.placeholder.com/150x150/4285f4/ffffff?text=JS',
            lastMessageTimestamp: currentTime - (2 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'João Silva',
                address: 'São Paulo – SP',
                expectedSalary: 15000,
                interests: 'Java, Spring Boot, Microservices, AWS',
                linkedin: 'https://linkedin.com/in/joao-silva',
            },
        },
        {
            name: 'Maria Santos',
            photo: 'https://via.placeholder.com/150x150/ea4335/ffffff?text=MS',
            lastMessageTimestamp: currentTime - (1 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: true,
            relevantData: {
                name: 'Maria Santos',
                address: 'São Paulo – SP',
                expectedSalary: 10000,
                interests: 'Java, Spring Boot, REST APIs, MySQL',
                linkedin: 'https://linkedin.com/in/maria-santos',
            },
        },
        {
            name: 'Carlos Oliveira',
            photo: 'https://via.placeholder.com/150x150/34a853/ffffff?text=CO',
            lastMessageTimestamp: currentTime - (30 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: true,
            profileCompleted: true,
            relevantData: {
                name: 'Carlos Oliveira',
                address: 'São Paulo – SP',
                expectedSalary: 18000,
                interests: 'Java, Spring Boot, Microservices, Docker',
                linkedin: 'https://linkedin.com/in/carlos-oliveira',
            },
        },
        {
            name: 'Ana Costa',
            photo: 'https://via.placeholder.com/150x150/fbbc05/ffffff?text=AC',
            lastMessageTimestamp: currentTime - (4 * 60 * 60 * 1000),
            role: 'USER',
            currentJobIds: [createdJobs[0]!], // Java job
            employed: false,
            profileCompleted: false,
            relevantData: {
                name: 'Ana Costa',
                address: 'São Paulo – SP',
                expectedSalary: 12000,
                interests: 'Java, Spring Boot, REST APIs, PostgreSQL',
                linkedin: 'https://linkedin.com/in/ana-costa',
            },
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
        // Java job applications - FUNNEL EFFECT (Backend Developer Java)
        // MATCH_WITH_JOB (6 applications - early stage)
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[1]!, // Rafael Almeida
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (7 * 60 * 60 * 1000),
            updatedAt: currentTime - (7 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[2]!, // Thiago Nascimento
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (11 * 60 * 60 * 1000),
            updatedAt: currentTime - (11 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[3]!, // Fernanda Lima
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (13 * 60 * 60 * 1000),
            updatedAt: currentTime - (13 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[4]!, // Gustavo Martins
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (14 * 60 * 60 * 1000),
            updatedAt: currentTime - (14 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[5]!, // Juliana Souza
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (15 * 60 * 60 * 1000),
            updatedAt: currentTime - (15 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[6]!, // Leonardo Castro
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (18 * 60 * 60 * 1000),
            updatedAt: currentTime - (18 * 60 * 60 * 1000),
        },
        // ACCEPT_JOB (4 applications)
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[7]!, // Pedro Ferreira
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (8 * 60 * 60 * 1000),
            updatedAt: currentTime - (8 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[8]!, // Luciana Pereira
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (8 * 60 * 60 * 1000),
            updatedAt: currentTime - (8 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[9]!, // Rodrigo Barbosa
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (16 * 60 * 60 * 1000),
            updatedAt: currentTime - (16 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[10]!, // Vanessa Gomes
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: currentTime - (17 * 60 * 60 * 1000),
            updatedAt: currentTime - (17 * 60 * 60 * 1000),
        },
        // INTERVIEW (3 applications)
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[11]!, // Bruno Cardoso
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.INTERVIEW,
            createdAt: currentTime - (9 * 60 * 60 * 1000),
            updatedAt: currentTime - (6 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[12]!, // Camila Rodrigues
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.INTERVIEW,
            createdAt: currentTime - (10 * 60 * 60 * 1000),
            updatedAt: currentTime - (5 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[13]!, // João Silva (additional candidate)
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.INTERVIEW,
            createdAt: currentTime - (12 * 60 * 60 * 1000),
            updatedAt: currentTime - (4 * 60 * 60 * 1000),
        },
        // RANKING (2 applications)
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[14]!, // Maria Santos (additional candidate)
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.RANKING,
            createdAt: currentTime - (20 * 60 * 60 * 1000),
            updatedAt: currentTime - (3 * 60 * 60 * 1000),
        },
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[15]!, // Carlos Oliveira (additional candidate)
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.RANKING,
            createdAt: currentTime - (24 * 60 * 60 * 1000),
            updatedAt: currentTime - (2 * 60 * 60 * 1000),
        },
        // FINALIST (1 application)
        {
            jobId: createdJobs[0]!, // Backend Developer Java
            conversationId: createdConversations[16]!, // Ana Costa (additional candidate)
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.FINALIST,
            createdAt: currentTime - (30 * 60 * 60 * 1000),
            updatedAt: currentTime - (1 * 60 * 60 * 1000),
        },
    ];

    for (const application of applications) {
        const applicationRef = await dbAdmin.collection('applications').add(application);
        console.log(`Created application for job ${application.jobId} (ID: ${applicationRef.id})`);
    }

    console.log('Skipping message creation for simplified seed');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${stores.length} store (TechCorp Solutions)`);
    console.log(`- Created ${jobs.length} job (Backend Developer Java)`);
    console.log(`- Created ${candidateUsers.length} candidate users`);
    console.log(`- Created ${conversations.length} conversations`);
    console.log(`- Created 16 applications with Java job funnel effect`);
    console.log('\n🚀 The job platform is ready for testing!');

    // Log some useful information
    console.log('\n🔑 Test Credentials:');
    console.log('HR: hr@techcorp.com / hr123456');
    console.log('Candidates: rafael.almeida@email.com / candidate123 (and others)');

    console.log('\n📱 Test Data:');
    console.log('- Single company: TechCorp Solutions');
    console.log('- Single job: Backend Developer Java');
    console.log('- Java job funnel: 6 → 4 → 3 → 2 → 1 (applications per step)');
    console.log('- Candidates with Java-related skills and profiles');

})();
