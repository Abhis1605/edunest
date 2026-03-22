import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request) {
    try {
            await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const { avatar } = await request.json();

    await User.findByIdAndUpdate(session.user.id, {
      avatar: avatar,
      isProfileComplete: true,
    });

    return Response.json({ 
      message: 'Profile updated successfully' 
    });
    } catch (error) {
        return Response.json({ 
      message: 'Failed', 
      error: error.message 
    }, { status: 500 });
    }
}