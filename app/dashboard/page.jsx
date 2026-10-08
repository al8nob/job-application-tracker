import KanbanBoard from '@/components/KanbanBoard'
import { getSession } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db'
import { Board } from '@/lib/models'
import { redirect } from 'next/navigation'

const getBoard = async (userId) => {
    "use cache"
    // connecting to the mongoDB
    await connectDB()

    // finding the board that matches to the userId, and its name is Job Hunt
    const boardDoc = await Board.findOne({
        userId: userId,
        name: "Job Hunt",
    }).populate({
        path: "columns",
        populate: {
            path: "jobApplications",
        }
    })

    if (!boardDoc) return null

    const board = JSON.parse(JSON.stringify(boardDoc))

    return board
}

const Dashboard = async () => {
    const session = await getSession()
    const board = await getBoard(session?.user.id ?? "")

    if (!session.user) {
        redirect("/signin")
    }


    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-black">{board.name}</h1>
                    <p className="text-gray-600">Track your job applications</p>
                </div>
                <KanbanBoard board={JSON.parse(JSON.stringify(board))} userId={session.user.id} />
            </div>
        </div>
    )
}

export default Dashboard