"use client"

import { useEffect, useState } from "react"
import { updateJobApplication } from "../actions/jobApplications"

export function useBoard(initialBoard = null) {
    const [board, setBoard] = useState(initialBoard)
    const [columns, setColumns] = useState(initialBoard?.columns || [])
    const [error, setError] = useState(null)

    useEffect(() => {
        if (initialBoard) {
            setBoard(initialBoard)
            setColumns(initialBoard.columns || [])
        }
    }, [initialBoard])

    const moveJob = async (
        jobApplicationId,
        newColumnId,
        newOrder
    ) => {

        setColumns((prev) => {
            const newColumns = prev.map((col) => ({
                ...col,
                jobApplications: [...col.jobApplications],
            }))

            // Find and remove job from the old column

            let jobToMove = null
            let oldColumnId = null

            for (const col of newColumns) {
                const jobIndex = col.jobApplications.findIndex(
                    (j) => j._id === jobApplicationId
                )

                if (jobIndex !== -1 && jobIndex !== undefined) {
                    jobToMove = col.jobApplications[jobIndex]
                    oldColumnId = col._id

                    col.jobApplications = col.jobApplications.filter(
                        (job) => job._id !== jobApplicationId
                    )

                    break
                }
            }

            if (jobToMove && oldColumnId) {
                const targetColumnIndex = newColumns.findIndex(
                    (col) => col._id === newColumnId
                )

                if (targetColumnIndex !== -1) {
                    const targetColumn = newColumns[targetColumnIndex]
                    const currentJobs =
                        targetColumn.jobApplications || []

                    const updatedJobs = [...currentJobs]

                    updatedJobs.splice(newOrder, 0, {
                        ...jobToMove,
                        columnId: newColumnId,
                        order: newOrder * 100,
                    })

                    const jobsWithUpdatedOrders = updatedJobs.map(
                        (job, idx) => ({
                            ...job,
                            order: idx * 100,
                        })
                    )

                    newColumns[targetColumnIndex] = {
                        ...targetColumn,
                        jobApplications: jobsWithUpdatedOrders,
                    }
                }
            }

            return newColumns
        })

        try {
            const result = await updateJobApplication(
                jobApplicationId,
                {
                    columnId: newColumnId,
                    order: newOrder,
                }
            )
        } catch (err) {
            console.error("Error", err)
        }
    }

    return {
        board,
        columns,
        error,
        moveJob,
    }
}