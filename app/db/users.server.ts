import { prisma } from "~/lib/prisma";

interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  studio: string;
}

function cleanPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  let cleaned = phone
    .replace(/[,\t\n\r]/g, '') 
    .replace(/[\(\)\-\s]/g, '') 
    .trim();
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  cleaned = cleaned.replace(/[^\d+]/g, '');
  
  return cleaned;
}

export async function createUsers(users: UserData[]) {
  try {
    let successCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const userData of users) {
      try {
        const cleanedPhone = cleanPhoneNumber(userData.phone);
        
        // Find or create studio using Prisma
        let studio = await prisma.studio.findUnique({
          where: { name: userData.studio }
        });

        if (!studio) {
          // Create new studio
          studio = await prisma.studio.create({
            data: { name: userData.studio }
          });
        }
        
        const studioId = studio.id;

        const cleanedUserData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: cleanedPhone,
          studioId: studioId,
        };

        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          if (!existingUser.phone && cleanedPhone) {
            await prisma.$executeRaw`
              UPDATE users SET phone = ${cleanedPhone}, studioId = ${studioId}, updatedAt = datetime('now')
              WHERE email = ${userData.email}
            `;
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          await prisma.$executeRaw`
            INSERT INTO users (firstName, lastName, email, phone, studioId, createdAt, updatedAt)
            VALUES (${cleanedUserData.firstName}, ${cleanedUserData.lastName}, ${cleanedUserData.email}, ${cleanedUserData.phone}, ${cleanedUserData.studioId}, datetime('now'), datetime('now'))
          `;
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${userData.email}:`, error);
        skippedCount++;
      }
    }

    return { 
      success: true, 
      count: successCount,
      updated: updatedCount,
      skipped: skippedCount,
      message: `Created: ${successCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`
    };
  } catch (error) {
    console.error("Error creating users:", error);
    return { success: false, error: "Failed to process users" };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function searchUsers(searchTerm: string, searchType: "email" | "phone" | "name") {
  try {
    let users;
    
    if (searchType === "email") {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: searchTerm } },
            { email: { contains: searchTerm.toLowerCase() } },
            { email: { contains: searchTerm.toUpperCase() } }
          ]
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (searchType === "phone") {
      users = await prisma.user.findMany({
        where: {
          phone: {
            contains: searchTerm
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } }
          ]
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Get studio names using Prisma include
    const usersWithStudios = await Promise.all(
      users.map(async (user: any) => {
        const studio = await prisma.studio.findUnique({
          where: { id: user.studioId }
        });
        return {
          ...user,
          studio: studio?.name || 'Unknown'
        };
      })
    );

    return { 
      success: true, 
      users: usersWithStudios, 
      count: usersWithStudios.length 
    };
  } catch (error) {
    console.error("Error searching users:", error);
    console.error("Search term:", searchTerm, "Search type:", searchType);
    return { success: false, error: `Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function getUsersPaginated(page: number = 1, pageSize: number = 50, studioFilter?: string) {
  try {
    const skip = (page - 1) * pageSize;
    
    let whereClause: any = {};
    
    if (studioFilter && studioFilter !== 'all') {
      // Find the studio ID using Prisma
      const studio = await prisma.studio.findUnique({
        where: { name: studioFilter }
      });
      if (studio) {
        whereClause.studioId = studio.id;
      }
    }
    
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({
        where: whereClause,
      })
    ]);

    // Get studio names using Prisma include
    const usersWithStudios = await Promise.all(
      users.map(async (user: any) => {
        const studio = await prisma.studio.findUnique({
          where: { id: user.studioId }
        });
        return {
          ...user,
          studio: studio?.name || 'Unknown'
        };
      })
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    return { 
      success: true, 
      users: usersWithStudios, 
      totalCount,
      totalPages,
      currentPage: page,
      pageSize
    };
  } catch (error) {
    console.error("Error fetching paginated users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function deleteUsers(userIds: number[]) {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    });

    return { 
      success: true, 
      deletedCount: result.count 
    };
  } catch (error) {
    console.error("Error deleting users:", error);
    return { success: false, error: "Failed to delete users" };
  }
}

export async function getAllStudios() {
  try {
    const studios = await prisma.studio.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return { success: true, studios };
  } catch (error) {
    console.error("Error fetching studios:", error);
    return { success: false, error: "Failed to fetch studios" };
  }
}
