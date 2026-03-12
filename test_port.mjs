import { PrismaClient } from '@prisma/client';

async function test(port) {
    const p = new PrismaClient({
        datasources: {
            db: { url: `mysql://root:@127.0.0.1:${port}/mitraevent` }
        }
    });
    try {
        await p.content.findFirst();
        console.log(port + ' OK');
    } catch (e) {
        console.log(port + ' FAIL: ' + e.message);
    } finally {
        await p.$disconnect();
    }
}

async function main() {
    await test(3306);
    await test(4000);
}

main();
