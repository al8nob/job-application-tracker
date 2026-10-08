"use client"
import { Award, Calendar, CheckCircle2, Mic, MoreVertical, Trash2, XCircle } from 'lucide-react';
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import CreateJobDialog from './CreateJobDialog';
import JobApplicationCard from './JobApplicationCard';
import { useBoard } from '@/lib/hooks/useBoards';
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors, closestCorners, DragOverlay } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMN_CONFIG = [
    {
        color: "bg-cyan-500",
        icon: <Calendar className="h-4 w-4" />,
    },
    {
        color: "bg-purple-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
        color: "bg-green-500",
        icon: <Mic className="h-4 w-4" />,
    },
    {
        color: "bg-yellow-500",
        icon: <Award className="h-4 w-4" />,
    },
    {
        color: "bg-red-500",
        icon: <XCircle className="h-4 w-4" />,
    },
];

const DroppableColumn = ({ column, config, boardId, userId, sortedColumns }) => {
    const sortedJobs = [...(column.jobApplications || [])].sort((a, b) => a.order - b.order)

    const { setNodeRef, isOver } = useDroppable({
        id: column._id,
        data: {
            type: "column",
            columnId: column._id
        }
    })

    return <Card className="min-w-75 shrink-0 shadow-md p-0">
        <CardHeader className={`${config.color} text-white rounded-t-lg pb-3 pt-3`} >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {config.icon}
                    <CardTitle className="text-white text-base font-semibold">{column.name}</CardTitle>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild >
                        <Button variant="ghost" className="h-6 w-6 text-white hover:bg-white/20">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Column
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardHeader>
        <CardContent
            ref={setNodeRef}
            className={`space-y-2 pt-4 bg-gray-50/50 min-h-100 rounded-b-lg ${isOver ? "ring-2 ring-blue-500" : ""}`}
        >
            <SortableContext
                items={sortedJobs.map(job => job._id)}
                strategy={verticalListSortingStrategy}
            >
                {sortedJobs.map((job, key) => (
                    <SortableJobCard
                        key={key}
                        job={{ ...job, columnId: job.columnId || column._id }}
                        columns={sortedColumns}
                    />
                ))}
            </SortableContext>
            <CreateJobDialog
                columnId={column._id}
                boardId={boardId}
                userId={userId}
            />
        </CardContent>
    </Card>
}

const SortableJobCard = ({ job, columns }) => {
    const {
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
        setNodeRef
    } = useSortable({
        id: job._id,
        data: {
            type: "job",
            job
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,

    }

    return (
        <div ref={setNodeRef} style={style}>
            <JobApplicationCard job={job} columns={columns} dragHandleProps={{ ...attributes, ...listeners }} />
        </div>
    )
}

const KanbanBoard = ({ board, userId }) => {
    const [activeId, setActiveId] = useState("")
    const { columns, moveJob } = useBoard(board);
    const sortedColumns = columns || []

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8
        }
    }))

    const handleDragStart = async (e) => {
        setActiveId(e.active.id)
    }

    const handleDragEnd = async (e) => {
        const { active, over } = e

        setActiveId(null)


        if (!over || !board._id) return

        const activeId = active.id
        const overId = over.id

        let draggedJob = null
        let sourceColumn = null
        let sourceIndex = -1

        for (const column of sortedColumns) {

            const jobs = [...(column.jobApplications || [])].sort((a, b) => a.order - b.order)
            const jobIndex = jobs.findIndex((job) => job._id === activeId)

            if (jobIndex !== -1) {
                draggedJob = jobs[jobIndex]
                sourceColumn = column
                sourceIndex = jobIndex
                break;
            }
        }

        if (!draggedJob || !sourceColumn) return

        const targetColumn = sortedColumns.find(col => col._id === overId)
        const targetJob = sortedColumns.flatMap(col => col.jobApplications || []).find(job => job._id === overId)

        let targetColumnId;
        let newOrder;

        if (targetColumn) {
            targetColumnId = targetColumn._id
            const jobsInTarget = (targetColumn.jobApplications || []).filter(job => job._id !== activeId)

            newOrder = jobsInTarget.length

        } else if (targetJob) {
            const targetJobColumn = sortedColumns.find((col) => col.jobApplications.some(job => job._id === targetJob._id))

            targetColumnId = targetJob.columnId || targetJobColumn?._id || ""
            if (!targetColumnId) return

            const targetColumnObj = sortedColumns.find(col => col._id === targetColumnId)
            if (!targetColumnObj) return;

            const allJobsInTargetOriginal = [...(targetColumnObj.jobApplications || [])].sort((a, b) => a.order - b.order)
            const allJobsInTargetFiltered = allJobsInTargetOriginal.filter(job => job._id !== activeId)

            const targetIndexInOriginal = allJobsInTargetOriginal.findIndex(job => job._id === overId)

            const targetIndexInFiltered = allJobsInTargetFiltered.findIndex(job => job._id === overId)

            if (targetIndexInFiltered !== -1) {
                if (sourceColumn._id === targetColumnId) {
                    if (sourceIndex < targetIndexInOriginal) {
                        newOrder = targetIndexInFiltered + 1
                    } else {
                        newOrder = targetIndexInFiltered
                    }
                } else {
                    newOrder = targetIndexInFiltered
                }
            } else {
                newOrder = allJobsInTargetFiltered.length
            }
        } else {
            return;
        }

        if (!targetColumnId) return;

        await moveJob(activeId, targetColumnId, newOrder)

    }

    const activeJob = sortedColumns.flatMap(col => col.jobApplications || []).find(job => job._id === activeId)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-4">
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {sortedColumns.map((col, key) => {
                        const config = COLUMN_CONFIG[key] || {
                            color: "bg-gray-500",
                            icon: <Calendar className="h-4 w-4" />
                        }

                        return <DroppableColumn
                            key={key}
                            column={col}
                            config={config}
                            boardId={board._id}
                            userId={userId}
                            sortedColumns={sortedColumns}
                        />
                    })}
                </div>
            </div>
            <DragOverlay>
                {
                    activeJob ? (
                        <div className="opacity-50">
                            <JobApplicationCard job={activeJob} columns={sortedColumns} />
                        </div>
                    ) : null
                }
            </DragOverlay>
        </DndContext>

    )
}

export default KanbanBoard