"use client"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { useState } from "react"
import { createJobApplication } from "@/lib/actions/jobApplications"

const INITIAL_FORM_DATA = {
    company: "",
    position: "",
    location: "",
    salary: "",
    jobUrl: "",
    tags: "",
    description: "",
    notes: "",
}

const CreateJobDialog = ({ columnId, boardId }) => {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState(INITIAL_FORM_DATA)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const result = await createJobApplication({
                ...formData,
                tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
                columnId,
                boardId
            })

            if (!result.error) {
                setFormData(INITIAL_FORM_DATA)
                setOpen(false)
            } else {
                console.error("Failed to create job: ", result.error)
            }

        } catch (err) {
            console.log(err);
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-4 justify-start text-muted-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">

                <DialogHeader>
                    <DialogTitle>Add Job Application</DialogTitle>
                    <DialogDescription>Track a new job application</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">
                                    Company *
                                </Label>
                                <Input
                                    id="company"
                                    required
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        company: e.target.value
                                    })}
                                    value={formData.company}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">
                                    Position *
                                </Label>
                                <Input
                                    id="position"
                                    required
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        position: e.target.value
                                    })}
                                    value={formData.position}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        location: e.target.value
                                    })}
                                    value={formData.location}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salary">
                                    Salary
                                </Label>
                                <Input
                                    id="salary"
                                    placeholder="e.g, $100k - $300k"
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        salary: e.target.value
                                    })}
                                    value={formData.salary}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobUrl">
                                    Job URL
                                </Label>
                                <Input
                                    id="jobUrl"
                                    placeholder="https://..."
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        jobUrl: e.target.value
                                    })}
                                    value={formData.jobUrl}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">
                                    Tags (comma-separated)
                                </Label>
                                <Input
                                    id="tags"
                                    placeholder="React, Tailwind, High Pay"
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        tags: e.target.value
                                    })}
                                    value={formData.tags}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                rows={3}
                                placeholder="Brief description of the role..."
                                onChange={(e) => setFormData({
                                    ...formData,
                                    description: e.target.value
                                })}
                                value={formData.description}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                Notes
                            </Label>
                            <Textarea
                                rows={4}
                                id="notes"
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notes: e.target.value
                                })}
                                value={formData.notes}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setOpen(false)}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Add Application</Button>
                    </DialogFooter>

                </form>
            </DialogContent>

        </Dialog>
    )
}

export default CreateJobDialog