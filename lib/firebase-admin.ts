import { App, getApp, getApps, initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;

const getServiceAccountFromEnv = (): ServiceAccount => {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountJson) {
        const parsed = JSON.parse(serviceAccountJson) as {
            project_id?: string;
            client_email?: string;
            private_key?: string;
        };

        if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
            throw new Error(
                "FIREBASE_SERVICE_ACCOUNT_KEY incomplet (project_id/client_email/private_key manquants)"
            );
        }

        return {
            projectId: parsed.project_id,
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key.replace(/\\n/g, "\n"),
        };
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Config Firebase Admin invalide: definir FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, " +
            "FIREBASE_PRIVATE_KEY (ou FIREBASE_SERVICE_ACCOUNT_KEY JSON)"
        );
    }

    return { projectId, clientEmail, privateKey };
};

const getAdminApp = (): App => {
    if (cachedApp) return cachedApp;

    if (getApps().length > 0) {
        cachedApp = getApp();
        return cachedApp;
    }

    const serviceAccount = getServiceAccountFromEnv();
    cachedApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId as string,
    });

    return cachedApp;
};

export const getAdminAuth = () => getAuth(getAdminApp());
export const getAdminDb = () => getFirestore(getAdminApp());