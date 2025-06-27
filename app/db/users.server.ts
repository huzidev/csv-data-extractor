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
        
        const cleanedUserData = {
          ...userData,
          phone: cleanedPhone,
        };

        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          if (!existingUser.phone && cleanedPhone) {
            await prisma.user.update({
              where: { email: userData.email },
              data: { phone: cleanedPhone },
            });
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          await prisma.user.create({
            data: cleanedUserData,
          });
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

export async function searchUsers(searchTerm: string, searchType: "email" | "phone") {
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
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          studio: true,
          createdAt: true,
        },
      });
    } else {
      users = await prisma.user.findMany({
        where: {
          phone: {
            contains: searchTerm
          }
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          studio: true,
          createdAt: true,
        },
      });
    }

    return { 
      success: true, 
      users, 
      count: users.length 
    };
  } catch (error) {
    console.error("Error searching users:", error);
    console.error("Search term:", searchTerm, "Search type:", searchType);
    return { success: false, error: `Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
