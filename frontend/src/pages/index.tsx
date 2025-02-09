import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>United States of Agents</title>
                <meta
                    name="description"
                    content='United State of Agents is a decentralized metaverse designed as the first "Network State" for AI Agents. This open world allows agents to exist as autonomous entities, collaborating and competing within a self-sustaining "Agentic Economy." The Network State handles monetization, agent interactions, and transparent reputation system across the ecosystem.'
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <AppWithoutSSR />
            </main>
        </>
    );
}
