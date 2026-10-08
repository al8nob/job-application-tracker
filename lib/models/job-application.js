import mongoose, { Schema } from "mongoose"

const JobApplicationSchema = new Schema(
    {
        company: {
            type: String,
            required: true,
        },

        position: {
            type: String,
            required: true,
        },

        location: {
            type: String,
        },

        status: {
            type: String,
            required: true,
            default: "applied",
        },

        columnId: {
            type: Schema.Types.ObjectId,
            ref: "Column",
            required: true,
            index: true,
        },

        boardId: {
            type: Schema.Types.ObjectId,
            ref: "Board",
            required: true,
            index: true,
        },

        userId: {
            type: String,
            required: true,
            index: true,
        },

        order: {
            type: Number,
            required: true,
            default: 0,
        },

        notes: {
            type: String,
        },

        salary: {
            type: String,
        },

        jobUrl: {
            type: String,
        },

        appliedDate: {
            type: Date,
        },

        tags: [
            {
                type: String,
            },
        ],

        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models.JobApplication ||
    mongoose.model("JobApplication", JobApplicationSchema)