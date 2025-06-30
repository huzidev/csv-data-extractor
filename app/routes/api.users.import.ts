import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/lib/prisma';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { users } = await request.json();

    if (!users || !Array.isArray(users)) {
      return json({ error: 'Invalid data format' }, { status: 400 });
    }

    for (const user of users) {
      if (!user.firstName || !user.lastName || !user.email || !user.phone || !user.studio) {
        return json({ error: 'Missing required fields' }, { status: 400 });
      }
    }

    const results = await Promise.allSettled(
      users.map((user) =>
        prisma.user.upsert({
          where: { email: user.email },
          update: {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            studio: user.studio,
          },
          create: {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            studio: user.studio,
          },
        })
      )
    );

    const successful = results.filter((result) => result.status === 'fulfilled').length;
    const failed = results.filter((result) => result.status === 'rejected').length;

    return json({
      count: successful,
      failed,
      type: 'import-users',
      message: `Successfully imported ${successful} users${failed > 0 ? `, ${failed} failed` : ''}`,
    });
  } catch (error) {
    console.error('Error importing users:', error);
    return json({ error: 'Failed to import users' }, { status: 500 });
  }
}
